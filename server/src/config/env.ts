import dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  port: number;
  databaseUrl: string | undefined;
  dbPoolMin: number;
  dbPoolMax: number;
  dbSsl: boolean;
  jwtSecret: string;
  nodeEnv: string;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  dbPoolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
  dbPoolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  dbSsl: process.env.DB_SSL === 'true',
  jwtSecret: process.env.JWT_SECRET || 'gymos-enterprise-secure-jwt-secret-fallback-do-not-use-in-prod',
  nodeEnv: process.env.NODE_ENV || 'development',
};

/**
 * Checks whether DATABASE_URL is present and is a valid PostgreSQL connection string.
 * Prevents non-PostgreSQL strings (e.g. mongodb+srv://) from crashing the pg driver.
 */
export function isPostgresConfigured(): boolean {
  if (!config.databaseUrl || config.databaseUrl.trim() === '') {
    return false;
  }
  const trimmed = config.databaseUrl.trim().toLowerCase();
  return trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://');
}

/**
 * Validates that DATABASE_URL is configured for PostgreSQL.
 * Throws a clear, descriptive error if missing or invalid.
 */
export function validateDatabaseConfig(): string {
  if (!isPostgresConfigured()) {
    throw new Error(
      'DATABASE_URL must be a valid PostgreSQL connection string (e.g. postgresql://user:password@host:5432/gymos).'
    );
  }
  return config.databaseUrl!;
}
