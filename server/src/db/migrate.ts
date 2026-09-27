import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbPool } from '../config/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  console.log('[GymOS Migrations] Starting database migration runner...');
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create migrations tracker table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _gymos_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[GymOS Migrations] No migrations directory found at', migrationsDir);
      await client.query('COMMIT');
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM _gymos_migrations WHERE name = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`[GymOS Migrations] Skipping already applied: ${file}`);
        continue;
      }

      console.log(`[GymOS Migrations] Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query(sql);
      await client.query(
        'INSERT INTO _gymos_migrations (name) VALUES ($1)',
        [file]
      );
      console.log(`[GymOS Migrations] Successfully applied: ${file}`);
    }

    await client.query('COMMIT');
    console.log('[GymOS Migrations] All migrations executed successfully.');
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('[GymOS Migrations] Migration failed with error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct execution: `tsx server/src/db/migrate.ts`
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
