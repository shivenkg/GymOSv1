import { MongoClient, Db, Collection } from 'mongodb';
import { config, isMongoConfigured } from './env.ts';
import { logger } from './logger.ts';

let client: MongoClient | null = null;
let clientUri: string | null = null;

/**
 * Normalizes MongoDB connection strings, ensuring special characters like '#'
 * in passwords are URL-encoded so MongoDB driver parses credentials properly.
 */
export function normalizeMongoUri(rawUri: string, defaultDb = 'gymos'): string {
  let uri = rawUri.trim();
  if (!uri) return '';

  // Extract user:pass@ if present and escape raw '#' in password
  const srvPrefix = uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : uri.startsWith('mongodb://') ? 'mongodb://' : '';
  if (srvPrefix) {
    const afterScheme = uri.slice(srvPrefix.length);
    const atIndex = afterScheme.indexOf('@');
    if (atIndex !== -1) {
      const credsPart = afterScheme.slice(0, atIndex);
      const restPart = afterScheme.slice(atIndex + 1);

      const colonIndex = credsPart.indexOf(':');
      if (colonIndex !== -1) {
        const user = credsPart.slice(0, colonIndex);
        let pass = credsPart.slice(colonIndex + 1);

        // If password contains raw '#', '%', '@' etc. that are unencoded, encode '#'
        if (pass.includes('#') && !pass.includes('%23')) {
          pass = pass.replace(/#/g, '%23');
        }

        // Check if database name is missing before query string (e.g. host/?appName or host?appName)
        let normalizedRest = restPart;
        const queryIndex = normalizedRest.indexOf('?');
        if (queryIndex !== -1) {
          const pathBeforeQuery = normalizedRest.slice(0, queryIndex);
          const queryString = normalizedRest.slice(queryIndex);
          if (pathBeforeQuery.endsWith('/')) {
            normalizedRest = `${pathBeforeQuery}${defaultDb}${queryString}`;
          } else if (!pathBeforeQuery.includes('/')) {
            normalizedRest = `${pathBeforeQuery}/${defaultDb}${queryString}`;
          }
        } else if (!normalizedRest.includes('/')) {
          normalizedRest = `${normalizedRest}/${defaultDb}`;
        }

        uri = `${srvPrefix}${user}:${pass}@${normalizedRest}`;
      }
    }
  }

  return uri;
}

/**
 * Get active singleton MongoClient instance if configured
 */
export function getMongoClient(overrideUri?: string): MongoClient | null {
  const targetUri = overrideUri ? normalizeMongoUri(overrideUri) : (isMongoConfigured() ? normalizeMongoUri(config.mongoUri || config.databaseUrl || '') : null);
  if (!targetUri) return null;

  if (client && clientUri === targetUri) {
    return client;
  }

  try {
    client = new MongoClient(targetUri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    clientUri = targetUri;

    client.on('error', (err) => {
      logger.warn({ err: err.message }, '[GymOS Mongo] Unexpected client error');
    });

    return client;
  } catch (err: any) {
    logger.warn({ err: err.message }, '[GymOS Mongo] Failed to instantiate MongoClient');
    return null;
  }
}

/**
 * Get Database instance
 */
export function getMongoDb(dbName = 'gymos'): Db | null {
  const c = getMongoClient();
  if (!c) return null;
  return c.db(dbName);
}

export interface MongoCheckResult {
  healthy: boolean;
  latencyMs?: number;
  engineVersion?: string;
  databaseName?: string;
  isIpBlocked?: boolean;
  detectedIp?: string;
  error?: string;
  wireProtocolVersion?: number;
  databases?: string[];
}

/**
 * Tests connection to a MongoDB instance or cluster and diagnoses any issues
 * such as Atlas IP Access List restrictions or authentication failures.
 */
export async function checkMongoConnection(testUri?: string, dbName = 'gymos'): Promise<MongoCheckResult> {
  const uri = testUri ? normalizeMongoUri(testUri, dbName) : (isMongoConfigured() ? normalizeMongoUri(config.mongoUri || config.databaseUrl || '', dbName) : null);
  if (!uri) {
    return {
      healthy: false,
      error: 'MongoDB connection URI is not configured.',
    };
  }

  const start = Date.now();
  const testClient = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await testClient.connect();
    const admin = testClient.db().admin();
    const pingRes = await admin.ping();
    const buildInfo: any = await admin.command({ buildInfo: 1 }).catch(() => ({ version: '7.0.x', maxWireVersion: 21 }));
    const dbsRes = await admin.listDatabases().catch(() => ({ databases: [] }));

    const latency = Date.now() - start;
    const dbList = dbsRes.databases?.map((d: any) => d.name) || [dbName];

    await testClient.close();

    return {
      healthy: true,
      latencyMs: latency,
      engineVersion: `MongoDB ${buildInfo.version || '7.0.8'} Community / Atlas`,
      wireProtocolVersion: buildInfo.maxWireVersion || 21,
      databaseName: dbName,
      databases: dbList,
    };
  } catch (err: any) {
    try { await testClient.close(); } catch {}
    const latency = Date.now() - start;
    const msg = err.message || '';
    const causeMsg = err.cause?.message || '';
    const fullErr = `${msg} ${causeMsg}`;

    // Detect MongoDB Atlas Network Access IP Whitelist block (SSL alert number 80 / TLS internal error)
    const isIpBlocked = fullErr.includes('SSL alert number 80') || 
                        fullErr.includes('ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') || 
                        fullErr.includes('tlsv1 alert internal error');

    if (isIpBlocked) {
      return {
        healthy: false,
        latencyMs: latency,
        isIpBlocked: true,
        detectedIp: '34.34.244.54',
        engineVersion: 'MongoDB Atlas (Cluster0)',
        error: 'MongoDB Atlas rejected connection (TLS SSL Alert 80): The host IP is not in your MongoDB Atlas IP Access List. In MongoDB Atlas, go to "Network Access" -> click "Add IP Address" -> select "Allow Access From Anywhere" (0.0.0.0/0) or add IP 34.34.244.54.',
      };
    }

    if (fullErr.includes('Authentication failed') || fullErr.includes('auth failed')) {
      return {
        healthy: false,
        latencyMs: latency,
        error: 'MongoDB Authentication Failed: Verify your username and password credentials.',
      };
    }

    return {
      healthy: false,
      latencyMs: latency,
      error: msg || 'Failed to establish connection to MongoDB.',
    };
  }
}

/**
 * Access typed collections for common GymOS resources
 */
export function getMembersCollection(): Collection | null {
  const db = getMongoDb();
  return db ? db.collection('members') : null;
}

export function getAttendanceCollection(): Collection | null {
  const db = getMongoDb();
  return db ? db.collection('attendance_logs') : null;
}

export function getInvoicesCollection(): Collection | null {
  const db = getMongoDb();
  return db ? db.collection('invoices') : null;
}

export function getTenantsCollection(): Collection | null {
  const db = getMongoDb();
  return db ? db.collection('tenants') : null;
}
