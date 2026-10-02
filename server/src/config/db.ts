import pg from 'pg';
import { config, validateDatabaseConfig, isPostgresConfigured } from './env.ts';

const { Pool, Client } = pg;

let pool: pg.Pool | null = null;

/**
 * Returns the singleton pg.Pool instance if a valid PostgreSQL DATABASE_URL is configured.
 * Returns null if DATABASE_URL is missing or set to a non-PostgreSQL database (e.g. MongoDB).
 */
export function getDbPool(): pg.Pool | null {
  if (!isPostgresConfigured()) {
    return null;
  }

  if (pool) {
    return pool;
  }

  try {
    const databaseUrl = validateDatabaseConfig();

    pool = new Pool({
      connectionString: databaseUrl,
      min: config.dbPoolMin,
      max: config.dbPoolMax,
      ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[GymOS DB Pool] Unexpected error on idle PostgreSQL client:', err.message);
    });

    return pool;
  } catch (err: any) {
    console.warn('[GymOS DB Pool] Failed to initialize pool:', err.message);
    return null;
  }
}

/**
 * Executes a query using the singleton pool.
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const p = getDbPool();
  if (!p) {
    throw new Error('PostgreSQL database pool is not available.');
  }
  return p.query<T>(text, params);
}

/**
 * Checks database connectivity for health check endpoints.
 * Returns true if DB is responsive, false otherwise without crashing.
 */
export async function checkDbConnection(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
  if (!isPostgresConfigured()) {
    const isMongo = config.databaseUrl && config.databaseUrl.trim().toLowerCase().startsWith('mongodb');
    return {
      healthy: false,
      error: isMongo
        ? 'GymOS database routed to MongoDB Atlas Cluster (managed via MongoDB driver)'
        : 'DATABASE_URL is not configured (operating in standalone fallback mode)',
    };
  }

  const start = Date.now();
  try {
    const p = getDbPool();
    if (!p) {
      return { healthy: false, error: 'Database pool unavailable' };
    }
    await p.query('SELECT 1 AS health_check');
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return {
      healthy: false,
      latencyMs: Date.now() - start,
      error: err.message || 'Database ping failed',
    };
  }
}

export interface DbConnectionTestParams {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  sslEnabled?: boolean;
  connectionString?: string;
}

/**
 * Tests connection with a short-lived pg.Client (does not mutate the main application pool).
 * Never logs credentials. Returns sanitized status.
 */
export async function testDbConnection(
  params: DbConnectionTestParams
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  let client: pg.Client;

  if (params.connectionString) {
    client = new Client({
      connectionString: params.connectionString,
      ssl: params.sslEnabled ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });
  } else {
    client = new Client({
      host: params.host,
      port: params.port || 5432,
      database: params.database,
      user: params.user,
      password: params.password,
      ssl: params.sslEnabled ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });
  }

  try {
    await client.connect();
    const result = await client.query('SELECT current_database() as db, version() as ver');
    await client.end();
    return {
      success: true,
      latencyMs: Date.now() - start,
      message: `Successfully connected to database "${result.rows[0]?.db || 'postgres'}".`,
    };
  } catch (err: any) {
    try {
      await client.end();
    } catch {
      // ignore close errors on failed connection
    }
    // Return sanitized error without exposing credentials
    const sanitizedError = (err.message || 'Unknown connection error')
      .replace(/password=.+?(\s|$)/gi, 'password=*** ')
      .replace(/:[^:@]+@/g, ':***@');
    return {
      success: false,
      latencyMs: Date.now() - start,
      message: sanitizedError,
    };
  }
}
