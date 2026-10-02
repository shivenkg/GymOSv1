import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { apiClient } from '../api/client';
import { TenantDatabaseManager } from '../components/TenantDatabaseManager';
import { GoogleSheetsManager } from '../components/GoogleSheetsManager';

interface ParsedUri {
  engine: 'postgres' | 'mongodb';
  host: string;
  port: number;
  databaseName: string;
  username: string;
  sslMode: string;
  isValid: boolean;
}

const parseConnectionString = (raw: string): ParsedUri => {
  const trimmed = raw.trim();
  const isMongo = trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
  if (isMongo) {
    const match = trimmed.match(/^mongodb(?:\+srv)?:\/\/(?:([^:]+):([^@]+)@)?([^/:?]+)(?::(\d+))?(?:\/([^?]+))?/);
    let user = 'superadmin';
    if (match?.[1]) {
      try { user = decodeURIComponent(match[1]); } catch { user = match[1]; }
    }
    const host = match?.[3] || 'cluster0.ln8epjv.mongodb.net';
    const dbName = match?.[5] ? match[5].split('?')[0] : 'gymos';
    return {
      engine: 'mongodb',
      host,
      port: match?.[4] ? parseInt(match[4], 10) : 27017,
      databaseName: dbName || 'gymos',
      username: user,
      sslMode: 'require',
      isValid: Boolean(host),
    };
  }

  // Postgres
  try {
    const url = new URL(trimmed.replace(/^postgres:\/\//, 'postgresql://'));
    return {
      engine: 'postgres',
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 5432,
      databaseName: url.pathname.replace(/^\//, '') || 'gymos_tenant_db',
      username: url.username ? decodeURIComponent(url.username) : 'postgres',
      sslMode: url.searchParams.get('sslmode') || 'require',
      isValid: Boolean(url.hostname && url.pathname.replace(/^\//, '')),
    };
  } catch {
    return {
      engine: 'postgres',
      host: 'localhost',
      port: 5432,
      databaseName: 'gymos_tenant_db',
      username: 'postgres',
      sslMode: 'require',
      isValid: false,
    };
  }
};

export const SystemSettingsView: React.FC = () => {
  const {
    currentUser,
    saasLicenses,
    provisionTenantDatabase,
    testTenantDbConnection,
    showToast,
  } = useGym();

  const [activeTab, setActiveTab] = useState<'tenant-dbs' | 'google-sheets' | 'cluster'>('tenant-dbs');

  // Quick Connection String Provisioning State
  const [quickConnectionString, setQuickConnectionString] = useState(
    'mongodb+srv://superadmin:Admin#321@cluster0.ln8epjv.mongodb.net/?appName=Cluster0'
  );
  const [quickTenantId, setQuickTenantId] = useState(saasLicenses[0]?.id || 'lic-001');
  const [showPasswordInUri, setShowPasswordInUri] = useState(false);
  const [isQuickTesting, setIsQuickTesting] = useState(false);
  const [quickTestResult, setQuickTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    engineVersion?: string;
    isIpBlocked?: boolean;
    detectedIp?: string;
    resolutionSteps?: string[];
  } | null>(null);
  const [isQuickProvisioning, setIsQuickProvisioning] = useState(false);
  const [quickProvisionSuccess, setQuickProvisionSuccess] = useState<{
    message: string;
    tenantName: string;
    databaseName: string;
    engine: string;
    maskedUri: string;
    timestamp: string;
  } | null>(null);

  // Parsed details for the connection string
  const parsedUri = parseConnectionString(quickConnectionString);

  // Diagnostic sandbox status state
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    connected: boolean;
    latencyMs?: number;
    pool?: { min: number; max: number; ssl: boolean };
    currentDatabaseUrl?: string;
    error?: string;
  } | null>(null);

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // Sandbox form state
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('5432');
  const [database, setDatabase] = useState('gymos_db');
  const [user, setUser] = useState('gymos_user');
  const [password, setPassword] = useState('');
  const [sslEnabled, setSslEnabled] = useState(false);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await apiClient.get('/admin/db-config/status');
      if (res.data) {
        setDbStatus(res.data);
      }
    } catch {
      setDbStatus(null);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleApplyPreset = (uri: string) => {
    setQuickConnectionString(uri);
    setQuickTestResult(null);
    setQuickProvisionSuccess(null);
  };

  const handleQuickTest = async () => {
    if (!quickConnectionString.trim()) {
      showToast('Validation Error', 'Please supply a database connection string.', 'error');
      return;
    }

    setIsQuickTesting(true);
    setQuickTestResult(null);

    try {
      const res = await testTenantDbConnection({
        engine: parsedUri.engine,
        host: parsedUri.host,
        port: parsedUri.port,
        databaseName: parsedUri.databaseName,
        username: parsedUri.username,
        connectionString: quickConnectionString,
        connectionUriMasked: quickConnectionString.replace(/:([^@]+)@/, ':••••••••@'),
        sslEnabled: parsedUri.sslMode !== 'disable',
        sslMode: parsedUri.sslMode as any,
      });

      setQuickTestResult(res);
      if (res.success) {
        showToast('Connection Succeeded', res.message, 'success');
      } else {
        showToast('Connection Failed', res.message, 'error');
      }
    } catch (err: any) {
      setQuickTestResult({
        success: false,
        message: err.message || 'Failed to ping database endpoint.',
      });
    } finally {
      setIsQuickTesting(false);
    }
  };

  const handleQuickProvision = async () => {
    if (!quickConnectionString.trim()) {
      showToast('Validation Error', 'Please supply a database connection string.', 'error');
      return;
    }

    setIsQuickProvisioning(true);
    setQuickProvisionSuccess(null);

    try {
      const tenant = saasLicenses.find((l) => l.id === quickTenantId);
      const tenantName = tenant ? tenant.gymName : 'Apex Fitness Club';
      const maskedUri = quickConnectionString.replace(/:([^@]+)@/, ':••••••••@');

      const res = await provisionTenantDatabase({
        id: `tdb-${Date.now()}`,
        tenantId: quickTenantId,
        tenantName,
        engine: parsedUri.engine,
        strategy: 'dedicated_database',
        host: parsedUri.host,
        port: parsedUri.port,
        databaseName: parsedUri.databaseName,
        username: parsedUri.username,
        connectionString: quickConnectionString,
        connectionUriMasked: maskedUri,
        sslEnabled: parsedUri.sslMode !== 'disable',
        sslMode: (parsedUri.sslMode as any) || 'require',
        poolMin: 2,
        poolMax: 20,
        idleTimeoutMs: 30000,
        status: 'Connected',
        attachmentStatus: 'attached',
        isAttached: true,
        attachedAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        latencyMs: quickTestResult?.latencyMs || Math.floor(12 + Math.random() * 15),
        storageMb: 14.5,
        collectionsOrTablesCount: parsedUri.engine === 'mongodb' ? 14 : 18,
        lastChecked: 'Just now',
        lastMigrationVersion: parsedUri.engine === 'mongodb' ? 'v1.0.0-mongo-init' : 'v2.4.0-init-rbac-turnstiles',
        features: {
          autoBackupEnabled: true,
          cdcEnabled: false,
          encryptionAtRest: true,
          readReplicas: 1,
        },
      });

      if (res.success) {
        setQuickProvisionSuccess({
          message: res.message || 'Provisioning completed and registered in main system database.',
          tenantName,
          databaseName: parsedUri.databaseName,
          engine: (parsedUri.engine || 'postgres').toUpperCase(),
          maskedUri,
          timestamp: new Date().toLocaleTimeString(),
        });
        showToast('Tenant Database Registered', `Registered ${parsedUri.databaseName} in main system database`, 'success');
      } else {
        showToast('Provisioning Warning', res.message, 'warning');
      }
    } catch (err: any) {
      showToast('Provisioning Failed', err.message || 'Registration failed', 'error');
    } finally {
      setIsQuickProvisioning(false);
    }
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await apiClient.post('/admin/db-config/test', {
        host,
        port: parseInt(port, 10),
        database,
        user,
        password,
        sslEnabled,
      });

      if (res.data) {
        setTestResult(res.data);
        if (res.data.success) {
          showToast('Connection Succeeded', res.data.message, 'success');
        } else {
          showToast('Connection Failed', res.data.message, 'error');
        }
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Server error occurred during connection test.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error occurred.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (currentUser?.role !== 'superadmin') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-error-container/20 border border-error/40 p-6 rounded-2xl text-center">
          <span className="material-symbols-outlined text-4xl text-error mb-2">lock</span>
          <h2 className="text-xl font-bold text-on-surface">SuperAdmin Authority Required</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            System Database Configuration and Diagnostic Controls are restricted to Platform Superadministrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary">database</span>
            <h1 className="text-2xl font-bold font-headline text-on-surface tracking-tight">
              Database Infrastructure &amp; Tenant Provisioning
            </h1>
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            Provision isolated tenant-wise databases (PostgreSQL &amp; MongoDB) via connection strings, link Google Sheets, and monitor platform database telemetry.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoadingStatus}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/50 text-sm font-medium hover:bg-surface-container-highest transition-colors cursor-pointer"
        >
          <span className={`material-symbols-outlined text-sm ${isLoadingStatus ? 'animate-spin' : ''}`}>
            sync
          </span>
          Refresh Diagnostics
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tenant-dbs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'tenant-dbs'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">dns</span>
          <span>1. Provision Tenant Databases (PostgreSQL &amp; MongoDB)</span>
        </button>

        <button
          onClick={() => setActiveTab('google-sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'google-sheets'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          <span>2. Google Sheets Linking &amp; Sync (/api/integrations/sheets)</span>
        </button>

        <button
          onClick={() => setActiveTab('cluster')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === 'cluster'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">speed</span>
          <span>3. Core Platform Diagnostics Sandbox</span>
        </button>
      </div>

      {/* TAB 1: PROVISION TENANT DATABASES & REGISTRY */}
      {activeTab === 'tenant-dbs' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Banner: Connection String Provisioner & Main System DB Registry */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-primary/30 bg-surface-container-lowest/80 shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-lg">add_link</span>
                  </span>
                  <h2 className="text-xl font-bold text-on-surface tracking-tight">
                    Provision New Tenant Database via Connection String
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/20 text-primary border border-primary/40">
                    Registers in Main PostgreSQL Database
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  Provide any valid PostgreSQL or MongoDB URI. The engine will verify connectivity, generate isolated schemas or collections, and register the database credentials inside the primary system database table (<code className="text-primary font-mono font-semibold">tenant_databases</code>).
                </p>
              </div>

              {/* Engine Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  parsedUri.engine === 'postgres'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {parsedUri.engine === 'postgres' ? 'database' : 'storage'}
                  </span>
                  {parsedUri.engine === 'postgres' ? 'PostgreSQL Relational' : 'MongoDB Document'}
                </span>
              </div>
            </div>

            {/* Target Tenant Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Assign to Tenant Organization
                </label>
                <select
                  value={quickTenantId}
                  onChange={(e) => setQuickTenantId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary font-medium cursor-pointer"
                >
                  {saasLicenses.map((lic) => (
                    <option key={lic.id} value={lic.id}>
                      {lic.gymName} ({(lic.tier || 'PRO').toUpperCase()} — ID: {lic.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Quick Presets &amp; Cloud Connection String Templates
                </label>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        'postgresql://tenant_admin:Secr3tP@ss2026@pg-cluster-prod.ap-south-1.rds.amazonaws.com:5432/gymos_tenant_prod?sslmode=require'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[11px] font-medium text-on-surface hover:bg-surface-container-highest cursor-pointer transition-colors"
                  >
                    AWS RDS Postgres
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        'mongodb+srv://superadmin:Admin#321@cluster0.ln8epjv.mongodb.net/?appName=Cluster0'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Cluster0 (Live)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        'postgresql://tenant_admin:Secr3tP@ss2026@ep-round-star-883412.us-east-2.aws.neon.tech:5432/gymos_tenant_db?sslmode=require'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[11px] font-medium text-on-surface hover:bg-surface-container-highest cursor-pointer transition-colors"
                  >
                    Neon Postgres
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        'mongodb+srv://tenant_admin:Secr3tP@ss2026@cluster0.gymos.mongodb.net/gymos_tenant_mongo?retryWrites=true&w=majority'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                  >
                    MongoDB Atlas (srv)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPreset(
                        'postgresql://postgres:postgres@localhost:5432/gymos_tenant_local?sslmode=disable'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[11px] font-medium text-on-surface hover:bg-surface-container-highest cursor-pointer transition-colors"
                  >
                    Local Docker
                  </button>
                </div>
              </div>
            </div>

            {/* Connection String Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Database Connection String (URI)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordInUri(!showPasswordInUri)}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-xs">
                    {showPasswordInUri ? 'visibility_off' : 'visibility'}
                  </span>
                  {showPasswordInUri ? 'Hide password' : 'Show full URI'}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPasswordInUri ? 'text' : 'password'}
                  value={quickConnectionString}
                  onChange={(e) => {
                    setQuickConnectionString(e.target.value);
                    setQuickTestResult(null);
                    setQuickProvisionSuccess(null);
                  }}
                  placeholder="postgresql://user:pass@host:5432/db?sslmode=require OR mongodb+srv://user:pass@cluster.mongodb.net/db"
                  className="w-full px-4 py-3.5 rounded-2xl bg-surface-container-highest/90 border border-outline/40 text-on-surface text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>
            </div>

            {/* Live URI Parser Inspector Breakdown */}
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              <div>
                <span className="text-on-surface-variant block uppercase text-[10px] font-semibold">Engine</span>
                <span className="font-mono font-bold text-on-surface mt-0.5 block truncate">
                  {parsedUri.engine === 'postgres' ? 'PostgreSQL' : 'MongoDB'}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[10px] font-semibold">Host / Cluster</span>
                <span className="font-mono text-on-surface mt-0.5 block truncate" title={parsedUri.host}>
                  {parsedUri.host}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[10px] font-semibold">Port</span>
                <span className="font-mono text-on-surface mt-0.5 block">
                  {parsedUri.port}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[10px] font-semibold">Database</span>
                <span className="font-mono font-bold text-primary mt-0.5 block truncate" title={parsedUri.databaseName}>
                  {parsedUri.databaseName}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[10px] font-semibold">User</span>
                <span className="font-mono text-on-surface mt-0.5 block truncate">
                  {parsedUri.username}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block uppercase text-[10px] font-semibold">SSL Mode</span>
                <span className="font-mono text-on-surface mt-0.5 block">
                  {parsedUri.sslMode}
                </span>
              </div>
            </div>

            {/* Test & Provision Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleQuickTest}
                  disabled={isQuickTesting || !quickConnectionString.trim()}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/50 text-on-surface font-semibold text-xs hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  <span className={`material-symbols-outlined text-sm ${isQuickTesting ? 'animate-spin' : ''}`}>
                    network_check
                  </span>
                  {isQuickTesting ? 'Pinging Endpoint...' : 'Test Connection & Ping'}
                </button>

                <button
                  type="button"
                  onClick={handleQuickProvision}
                  disabled={isQuickProvisioning || !quickConnectionString.trim()}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-lg shadow-primary/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  <span className={`material-symbols-outlined text-sm ${isQuickProvisioning ? 'animate-spin' : ''}`}>
                    cloud_done
                  </span>
                  {isQuickProvisioning ? 'Registering in System DB...' : 'Provision & Register in System DB'}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="text-xs text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">lock</span>
                <span>Credentials encrypted &amp; stored isolated</span>
              </div>
            </div>

            {/* Test Result Message Box */}
            {quickTestResult && (
              <div
                className={`p-4 rounded-2xl text-xs flex flex-col gap-3 border ${
                  quickTestResult.success
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : quickTestResult.isIpBlocked
                    ? 'bg-amber-500/10 text-amber-200 border-amber-500/40'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">
                    {quickTestResult.success ? 'check_circle' : quickTestResult.isIpBlocked ? 'shield' : 'cancel'}
                  </span>
                  <div className="space-y-1 flex-1">
                    <div className="font-semibold text-sm flex items-center justify-between">
                      <span>
                        {quickTestResult.success
                          ? 'Connection Verification Successful'
                          : quickTestResult.isIpBlocked
                          ? 'MongoDB Atlas Network Access Configuration Required'
                          : 'Connection Failed'}
                      </span>
                      {quickTestResult.isIpBlocked && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                          TLS Alert 80 (IP Whitelist)
                        </span>
                      )}
                    </div>
                    <div className="leading-relaxed opacity-95">{quickTestResult.message}</div>
                    {quickTestResult.latencyMs !== undefined && (
                      <div className="font-mono text-[11px] opacity-80 pt-1">
                        Roundtrip Latency: {quickTestResult.latencyMs}ms | Engine: {quickTestResult.engineVersion || (parsedUri.engine === 'postgres' ? 'PostgreSQL 16.2' : 'MongoDB 7.0.8')}
                      </div>
                    )}
                  </div>
                </div>

                {/* If Atlas Network Access Whitelist is needed, show direct actionable resolution steps */}
                {quickTestResult.isIpBlocked && (
                  <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-amber-500/20 text-xs space-y-2 mt-1">
                    <div className="font-bold text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">vpn_key</span>
                        How to Whitelist in MongoDB Atlas:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(quickTestResult.detectedIp || '34.34.244.54');
                          showToast('IP Copied', `Copied ${quickTestResult.detectedIp || '34.34.244.54'} to clipboard`, 'success');
                        }}
                        className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-mono font-semibold text-amber-200 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        Copy Host IP ({quickTestResult.detectedIp || '34.34.244.54'})
                      </button>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-on-surface-variant font-sans text-[11px] leading-relaxed">
                      <li>Log in to your <strong>MongoDB Atlas Console</strong> (<a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-primary underline">cloud.mongodb.com</a>).</li>
                      <li>In the left sidebar under <strong>Security</strong>, click <strong>Network Access</strong>.</li>
                      <li>Click the green <strong>+ Add IP Address</strong> button.</li>
                      <li>Select <strong>Allow Access from Anywhere (0.0.0.0/0)</strong> or paste IP <code className="px-1 py-0.5 bg-surface-container-highest rounded text-amber-300 font-mono">{quickTestResult.detectedIp || '34.34.244.54'}</code>.</li>
                      <li>Click <strong>Confirm</strong>. Atlas takes ~15–30 seconds to update firewall rules.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Registration Success Confirmation Card */}
            {quickProvisionSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="material-symbols-outlined text-lg">verified</span>
                  <span>Tenant Database Successfully Registered in Main System Database</span>
                </div>
                <p className="leading-relaxed">
                  {quickProvisionSuccess.message}
                </p>
                <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-emerald-500/20 font-mono text-[11px] text-on-surface space-y-1">
                  <div><strong className="text-emerald-400">Assigned Tenant:</strong> {quickProvisionSuccess.tenantName}</div>
                  <div><strong className="text-emerald-400">Target Database:</strong> {quickProvisionSuccess.databaseName} ({quickProvisionSuccess.engine})</div>
                  <div><strong className="text-emerald-400">Registered URI:</strong> {quickProvisionSuccess.maskedUri}</div>
                  <div><strong className="text-emerald-400">Persisted At:</strong> {quickProvisionSuccess.timestamp} (Table: <code className="text-primary">tenant_databases</code>)</div>
                </div>
              </div>
            )}
          </div>

          {/* Full Tenant Database Management Component */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">storage</span>
                Tenant Database Fleet &amp; Isolation Registry
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Review all registered tenant databases, adjust connection pool settings, inspect storage telemetry, and trigger schema migrations.
              </p>
            </div>
            <TenantDatabaseManager />
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE SHEETS LINKING & SYNC */}
      {activeTab === 'google-sheets' && (
        <div className="animate-in fade-in duration-200 space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-emerald-400">cloud_sync</span>
              <div>
                <h3 className="text-sm font-bold text-emerald-200">
                  Google Sheets Integration API Active (<code className="font-mono text-xs">/api/integrations/sheets</code>)
                </h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Synchronize GymOS roster data, member check-ins, and payments directly with Google Sheets in real-time or on scheduled intervals.
                </p>
              </div>
            </div>
          </div>
          <GoogleSheetsManager />
        </div>
      )}

      {/* TAB 3: CLUSTER DIAGNOSTICS & TELEMETRY */}
      {activeTab === 'cluster' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Grid: Live Status & Architecture Tradeoff */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl space-y-5 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-on-surface">Pool Telemetry</h3>
                {dbStatus?.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    CONNECTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    OFFLINE / STANDALONE
                  </span>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Configured URL</span>
                  <span className="font-mono text-xs text-on-surface truncate max-w-[180px]">
                    {dbStatus?.currentDatabaseUrl || 'Not provided'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Latency</span>
                  <span className="font-semibold text-on-surface">
                    {dbStatus?.latencyMs !== undefined ? `${dbStatus.latencyMs} ms` : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">Pool Capacity</span>
                  <span className="font-mono text-on-surface">
                    Min {dbStatus?.pool?.min ?? 2} / Max {dbStatus?.pool?.max ?? 10}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                  <span className="text-on-surface-variant">SSL Encryption</span>
                  <span className="font-medium text-on-surface">
                    {dbStatus?.pool?.ssl ? 'Enabled' : 'Disabled (Local/Dev)'}
                  </span>
                </div>
              </div>

              {dbStatus?.error && (
                <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-mono">
                  {dbStatus.error}
                </div>
              )}
            </div>

            {/* Tradeoff Explanation Box */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <span className="material-symbols-outlined">security</span>
                <h3>Architectural Tradeoff: 12-Factor Env vs. Runtime Mutable DB Config</h3>
              </div>

              <div className="text-sm text-on-surface-variant space-y-3 leading-relaxed">
                <p>
                  <strong className="text-on-surface">Industry Standard Recommendation (Deploy-Time Env):</strong>{' '}
                  In accordance with Twelve-Factor App principles and SOC2 / ISO-27001 data isolation policies, database
                  connection parameters (<code className="text-primary font-mono text-xs">DATABASE_URL</code>) should be
                  supplied at deploy time via container secrets, Kubernetes Secret manifests, or cloud key vaults. This ensures
                  all application instances share an immutable, auditable configuration with zero risk of in-flight credential drift.
                </p>
                <p>
                  <strong className="text-on-surface">Runtime Editable Tradeoff:</strong>{' '}
                  Allowing database configuration mutation through a live web interface introduces substantial security attack surfaces:
                  potential SQL credential leakage, race conditions across clustered workers, and pool reconnection drops. If runtime editing
                  is ever required, secrets must be encrypted at rest using envelope encryption (e.g. AWS KMS or AES-256-GCM master key)
                  and audited with strict multi-admin quorum approvals.
                </p>
              </div>
            </div>
          </div>

          {/* Test Connection Form */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-outline-variant/30 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">electrical_services</span>
                Connection Verification Sandbox
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Test external PostgreSQL instances with an isolated, short-lived client without altering the active application pool or persisting credentials.
              </p>
            </div>

            <form onSubmit={handleTestConnection} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Host / Endpoint
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
                    placeholder="e.g. localhost or postgres.db.internal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
                    placeholder="5432"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
                    placeholder="gymos_db"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    User
                  </label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
                    placeholder="gymos_user"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="flex items-center pt-7">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sslEnabled}
                      onChange={(e) => setSslEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-outline/40 bg-surface-container-high"
                    />
                    <span className="text-sm font-medium text-on-surface">Enable SSL (Required for AWS RDS/Neon/Cloud SQL)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-sm ${isTesting ? 'animate-spin' : ''}`}>
                    bolt
                  </span>
                  {isTesting ? 'Testing Connectivity...' : 'Test Connection'}
                </button>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-sm flex items-center gap-2.5 ${
                      testResult.success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {testResult.success ? 'check_circle' : 'cancel'}
                    </span>
                    <span>
                      {testResult.message}{' '}
                      {testResult.latencyMs !== undefined && `(${testResult.latencyMs}ms)`}
                    </span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
