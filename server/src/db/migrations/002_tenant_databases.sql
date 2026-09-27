-- ========================================================
-- GymOS Tenant Databases Registry Migration
-- Registers tenant-wise database connection strings & engines
-- ========================================================

CREATE TABLE IF NOT EXISTS tenant_databases (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  engine VARCHAR(50) NOT NULL DEFAULT 'postgres', -- 'postgres' or 'mongodb'
  strategy VARCHAR(50) NOT NULL DEFAULT 'dedicated_database',
  host VARCHAR(255),
  port INT,
  database_name VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  connection_string TEXT NOT NULL,
  connection_uri_masked TEXT,
  ssl_enabled BOOLEAN NOT NULL DEFAULT true,
  ssl_mode VARCHAR(50) DEFAULT 'require',
  pool_min INT DEFAULT 2,
  pool_max INT DEFAULT 20,
  idle_timeout_ms INT DEFAULT 30000,
  status VARCHAR(50) NOT NULL DEFAULT 'Connected',
  latency_ms INT DEFAULT 15,
  storage_mb NUMERIC(10, 2) DEFAULT 0.00,
  collections_or_tables_count INT DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_databases_tenant_id ON tenant_databases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_databases_engine ON tenant_databases(engine);

-- Google Sheets Integrations Table
CREATE TABLE IF NOT EXISTS google_sheet_integrations (
  id VARCHAR(100) PRIMARY KEY,
  tenant_id VARCHAR(100) NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  sheet_title VARCHAR(255) NOT NULL,
  spreadsheet_id VARCHAR(255) NOT NULL,
  sheet_url TEXT NOT NULL,
  tab_name VARCHAR(100) NOT NULL DEFAULT 'Sheet1',
  direction VARCHAR(50) NOT NULL DEFAULT 'two_way',
  entities JSONB DEFAULT '["members"]'::jsonb,
  frequency VARCHAR(50) NOT NULL DEFAULT 'realtime',
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  last_synced_at TIMESTAMPTZ,
  synced_rows_count INT DEFAULT 0,
  webhook_secret_token VARCHAR(255) NOT NULL,
  service_account_email VARCHAR(255),
  field_mappings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sheet_integrations_tenant ON google_sheet_integrations(tenant_id);
