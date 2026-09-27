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
 * Validates that DATABASE_URL is configured.
 * Throws a clear, descriptive error if missing.
 */
export function validateDatabaseConfig(): string {
  if (!config.databaseUrl || config.databaseUrl.trim() === '') {
    throw new Error(
      'DATABASE_URL environment variable is missing. ' +
      'Please configure DATABASE_URL in your .env or environment configuration (e.g. postgresql://user:password@host:5432/gymos).'
    );
  }
  return config.databaseUrl;
}
