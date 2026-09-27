import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { TenantDatabaseConfig, DatabaseEngine, TenantDbIsolationStrategy } from '../types';

export const TenantDatabaseManager: React.FC = () => {
  const {
    tenantDbConfigs,
    saveTenantDbConfig,
    deleteTenantDbConfig,
    testTenantDbConnection,
    provisionTenantDatabase,
    saasLicenses,
    showToast,
  } = useGym();

  const [engineFilter, setEngineFilter] = useState<'all' | 'postgres' | 'mongodb'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConfigForEdit, setSelectedConfigForEdit] = useState<TenantDatabaseConfig | null>(null);

  // Form State for Provisioning / Editing
  const [selectedTenantId, setSelectedTenantId] = useState(saasLicenses[0]?.id || 'lic-001');
  const [engine, setEngine] = useState<DatabaseEngine>('postgres');
  const [strategy, setStrategy] = useState<TenantDbIsolationStrategy>('dedicated_database');
  const [host, setHost] = useState('pg-cluster-prod-01.ap-south-1.rds.amazonaws.com');
  const [port, setPort] = useState(5432);
  const [databaseName, setDatabaseName] = useState('gymos_tenant_prod');
  const [username, setUsername] = useState('tenant_admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useCustomUri, setUseCustomUri] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [sslEnabled, setSslEnabled] = useState(true);
  const [sslMode, setSslMode] = useState<'require' | 'prefer' | 'verify-full' | 'disable'>('require');
  const [poolMin, setPoolMin] = useState(2);
  const [poolMax, setPoolMax] = useState(25);
  const [autoBackup, setAutoBackup] = useState(true);
  const [cdcEnabled, setCdcEnabled] = useState(false);
  const [encryptionAtRest, setEncryptionAtRest] = useState(true);
  const [readReplicas, setReadReplicas] = useState(1);

  // Test Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    engineVersion?: string;
  } | null>(null);

  // Provisioning State
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Filtered Databases
  const filteredConfigs = tenantDbConfigs.filter((cfg) => {
    const matchesEngine = engineFilter === 'all' || cfg.engine === engineFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      cfg.tenantName.toLowerCase().includes(q) ||
      cfg.databaseName.toLowerCase().includes(q) ||
      cfg.host.toLowerCase().includes(q) ||
      cfg.strategy.toLowerCase().includes(q);
    return matchesEngine && matchesSearch;
  });

  const totalConfigs = tenantDbConfigs.length;
  const postgresCount = tenantDbConfigs.filter((c) => c.engine === 'postgres').length;
  const mongoCount = tenantDbConfigs.filter((c) => c.engine === 'mongodb').length;
  const totalStorage = tenantDbConfigs.reduce((acc, c) => acc + c.storageMb, 0).toFixed(1);
  const avgLatency = Math.round(
    tenantDbConfigs.reduce((acc, c) => acc + c.latencyMs, 0) / (totalConfigs || 1)
  );

  const openNewConfigModal = () => {
    setSelectedConfigForEdit(null);
    const tenant = saasLicenses[0];
    const defaultSlug = tenant ? tenant.gymName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15) : 'tenant_01';
    setSelectedTenantId(tenant?.id || 'lic-001');
    setEngine('postgres');
    setStrategy('dedicated_database');
    setHost('pg-cluster-prod-01.ap-south-1.rds.amazonaws.com');
    setPort(5432);
    setDatabaseName(`gymos_tenant_${defaultSlug}`);
    setUsername(`tenant_${defaultSlug}_dba`);
    setPassword('');
    setUseCustomUri(false);
    setCustomUri('');
    setSslEnabled(true);
    setSslMode('require');
    setPoolMin(2);
    setPoolMax(25);
    setAutoBackup(true);
    setCdcEnabled(false);
    setEncryptionAtRest(true);
    setReadReplicas(1);
    setTestResult(null);
    setShowConfigModal(true);
  };

  const openEditModal = (cfg: TenantDatabaseConfig) => {
    setSelectedConfigForEdit(cfg);
    setSelectedTenantId(cfg.tenantId);
    setEngine(cfg.engine);
    setStrategy(cfg.strategy);
    setHost(cfg.host);
    setPort(cfg.port);
    setDatabaseName(cfg.databaseName);
    setUsername(cfg.username);
    setPassword('');
    setUseCustomUri(Boolean(cfg.strategy === 'custom_cluster_uri'));
    setCustomUri(cfg.connectionUriMasked);
    setSslEnabled(cfg.sslEnabled);
    setSslMode(cfg.sslMode);
    setPoolMin(cfg.poolMin);
    setPoolMax(cfg.poolMax);
    setAutoBackup(cfg.features.autoBackupEnabled);
    setCdcEnabled(cfg.features.cdcEnabled);
    setEncryptionAtRest(cfg.features.encryptionAtRest);
    setReadReplicas(cfg.features.readReplicas);
    setTestResult(null);
    setShowConfigModal(true);
  };

  // Switch engine helper
  const handleEngineChange = (newEngine: DatabaseEngine) => {
    setEngine(newEngine);
    if (newEngine === 'mongodb') {
      setPort(27017);
      if (host.includes('rds.amazonaws.com') || host.includes('5432')) {
        setHost('cluster0.mongodb.net');
      }
      if (strategy === 'dedicated_schema') {
        setStrategy('isolated_collection');
      }
    } else {
      setPort(5432);
      if (host.includes('mongodb.net') || host.includes('27017')) {
        setHost('pg-cluster-prod-01.ap-south-1.rds.amazonaws.com');
      }
      if (strategy === 'isolated_collection') {
        setStrategy('dedicated_schema');
      }
    }
  };

  // Connection string parser helper
  const handleParseConnectionString = (raw: string) => {
    setCustomUri(raw);
    const trimmed = raw.trim();
    if (trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://')) {
      handleEngineChange('mongodb');
      const match = trimmed.match(/^mongodb(?:\+srv)?:\/\/(?:([^:]+):([^@]+)@)?([^/:?]+)(?::(\d+))?(?:\/([^?]+))?/);
      if (match) {
        if (match[1]) setUsername(decodeURIComponent(match[1]));
        if (match[2]) setPassword(decodeURIComponent(match[2]));
        if (match[3]) setHost(match[3]);
        if (match[4]) setPort(parseInt(match[4], 10));
        if (match[5]) setDatabaseName(match[5]);
      }
      showToast('MongoDB URI Parsed', 'Engine, host, user, and database populated.', 'info');
    } else if (trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) {
      handleEngineChange('postgres');
      try {
        const parsed = new URL(trimmed);
        if (parsed.username) setUsername(decodeURIComponent(parsed.username));
        if (parsed.password) setPassword(decodeURIComponent(parsed.password));
        if (parsed.hostname) setHost(parsed.hostname);
        if (parsed.port) setPort(parseInt(parsed.port, 10));
        if (parsed.pathname) setDatabaseName(parsed.pathname.replace(/^\//, ''));
        if (parsed.searchParams.get('sslmode')) {
          const sm = parsed.searchParams.get('sslmode');
          if (sm === 'require' || sm === 'prefer' || sm === 'verify-full' || sm === 'disable') {
            setSslMode(sm as any);
          }
        }
        showToast('PostgreSQL URI Parsed', 'Engine, host, user, and database populated.', 'info');
      } catch {}
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const testPayload: Partial<TenantDatabaseConfig> = {
      engine,
      host,
      port,
      databaseName,
      username,
      password,
      sslEnabled,
      sslMode,
      connectionString: useCustomUri ? customUri : undefined,
      connectionUriMasked: useCustomUri ? customUri : undefined,
    };

    const res = await testTenantDbConnection(testPayload);
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      showToast('Connection Successful', `${engine.toUpperCase()} responded in ${res.latencyMs || 15}ms`, 'success');
    } else {
      showToast('Connection Failed', res.message, 'error');
    }
  };

  const handleSaveAndProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);

    const tenant = saasLicenses.find((lic) => lic.id === selectedTenantId);
    const tenantName = tenant ? tenant.gymName : 'Tenant Workspace';

    const isMongo = engine === 'mongodb';
    const computedMaskedUri = useCustomUri && customUri
      ? customUri.replace(/:([^@]+)@/, ':••••••••@')
      : isMongo
      ? `mongodb+srv://${username}:••••••••@${host}:${port}/${databaseName}?retryWrites=true&w=majority`
      : `postgresql://${username}:••••••••@${host}:${port}/${databaseName}?sslmode=${sslMode}`;

    const configPayload: TenantDatabaseConfig = {
      id: selectedConfigForEdit?.id || `tdb-${Date.now()}`,
      tenantId: selectedTenantId,
      tenantName,
      engine,
      strategy,
      host,
      port,
      databaseName,
      username,
      connectionString: useCustomUri ? customUri : undefined,
      connectionUriMasked: computedMaskedUri,
      sslEnabled,
      sslMode,
      poolMin,
      poolMax,
      idleTimeoutMs: 30000,
      status: 'Connected',
      latencyMs: testResult?.latencyMs || Math.floor(12 + Math.random() * 15),
      storageMb: selectedConfigForEdit?.storageMb || 14.5,
      collectionsOrTablesCount: isMongo ? 14 : 18,
      lastChecked: 'Just now',
      lastMigrationVersion: isMongo ? 'v1.0.0-mongo-init' : 'v2.4.0-init-rbac-turnstiles',
      features: {
        autoBackupEnabled: autoBackup,
        cdcEnabled,
        encryptionAtRest,
        readReplicas,
      },
    };

    const res = await provisionTenantDatabase(configPayload);
    setIsProvisioning(false);
    setShowConfigModal(false);

    if (res.success) {
      showToast('Tenant Database Provisioned', res.message, 'success');
    }
  };

  const handlePingQuick = async (cfg: TenantDatabaseConfig) => {
    showToast('Testing Database Ping...', `Pinging ${cfg.engine.toUpperCase()} for ${cfg.tenantName}`, 'info');
    const res = await testTenantDbConnection({
      engine: cfg.engine,
      host: cfg.host,
      port: cfg.port,
      databaseName: cfg.databaseName,
      username: cfg.username,
      sslEnabled: cfg.sslEnabled,
    });
    if (res.success) {
      showToast('Ping Acknowledged', `${cfg.engine.toUpperCase()} responded in ${res.latencyMs || 14}ms (Healthy)`, 'success');
    } else {
      showToast('Ping Error', res.message, 'error');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', label, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Engine Overview KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Tenant Databases</div>
            <div className="text-xl font-headline font-bold text-on-surface mt-0.5 font-mono">{totalConfigs} Provisioned</div>
            <div className="text-[10px] text-tertiary">100% Tenant Isolation</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-[22px]">table_rows</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">PostgreSQL Clusters</div>
            <div className="text-xl font-headline font-bold text-blue-400 mt-0.5 font-mono">{postgresCount} DBs</div>
            <div className="text-[10px] text-on-surface-variant">Relational &amp; ACID</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[22px]">view_agenda</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">MongoDB Clusters</div>
            <div className="text-xl font-headline font-bold text-emerald-400 mt-0.5 font-mono">{mongoCount} DBs</div>
            <div className="text-[10px] text-on-surface-variant">Document &amp; Flexible NoSQL</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <span className="material-symbols-outlined text-[22px]">sd_storage</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Storage Allocated</div>
            <div className="text-xl font-headline font-bold text-purple-400 mt-0.5 font-mono">{totalStorage} MB</div>
            <div className="text-[10px] text-on-surface-variant">Encrypted at Rest</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Avg Ping Latency</div>
            <div className="text-xl font-headline font-bold text-amber-400 mt-0.5 font-mono">{avgLatency} ms</div>
            <div className="text-[10px] text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Sub-50ms Global SLA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header & Filter Bar */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                MULTI-TENANT DB ENGINE
              </span>
              <span className="text-xs text-on-surface-variant font-mono">Isolated Architecture</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Tenant-Wise Database Provisioning (PostgreSQL &amp; MongoDB)
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
              SuperAdmin control plane to configure, isolate, and provision independent databases per tenant franchise. Support dedicated databases, per-tenant schema isolation in PostgreSQL, or independent MongoDB cluster namespaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNewConfigModal}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary/25 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Provision Tenant Database</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-on-surface-variant shrink-0">Filter Engine:</span>
            <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
              <button
                onClick={() => setEngineFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  engineFilter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Engines ({tenantDbConfigs.length})
              </button>
              <button
                onClick={() => setEngineFilter('postgres')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  engineFilter === 'postgres' ? 'bg-blue-600 text-white' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>PostgreSQL ({postgresCount})</span>
              </button>
              <button
                onClick={() => setEngineFilter('mongodb')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  engineFilter === 'mongodb' ? 'bg-emerald-600 text-white' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>MongoDB ({mongoCount})</span>
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search tenant, database, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container rounded-xl pl-9 pr-4 py-2 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Database Registry Cards Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-3">Tenant &amp; Facility</th>
                <th className="py-3 px-3">Engine &amp; Strategy</th>
                <th className="py-3 px-3">Database Target / Host</th>
                <th className="py-3 px-3">Status &amp; Latency</th>
                <th className="py-3 px-3">Storage / Tables</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-sans">
              {filteredConfigs.map((cfg) => {
                const isMongo = cfg.engine === 'mongodb';
                return (
                  <tr key={cfg.id} className="hover:bg-surface-container-high/40 transition-colors group">
                    {/* Tenant Info */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-on-surface text-sm flex items-center gap-2">
                        <span>{cfg.tenantName}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono mt-0.5 flex items-center gap-2">
                        <span>ID: {cfg.tenantId}</span>
                        <span className="text-outline">•</span>
                        <span>User: {cfg.username}</span>
                      </div>
                    </td>

                    {/* Engine & Strategy */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 mb-1">
                        {isMongo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <span className="material-symbols-outlined text-[13px]">view_agenda</span>
                            <span>MongoDB</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <span className="material-symbols-outlined text-[13px]">table_rows</span>
                            <span>PostgreSQL</span>
                          </span>
                        )}
                        {cfg.sslEnabled && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-surface-container border border-outline-variant/40 text-on-surface-variant">
                            SSL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono capitalize">
                        {cfg.strategy.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Database Name & Host */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-xs font-semibold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">storage</span>
                        <span>{cfg.databaseName}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono truncate max-w-xs mt-0.5">
                        {cfg.host}:{cfg.port}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                        <span className="truncate max-w-[200px]">{cfg.connectionUriMasked}</span>
                        <button
                          onClick={() => copyToClipboard(cfg.connectionUriMasked, 'Connection URI')}
                          title="Copy Masked Connection URI"
                          className="hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">content_copy</span>
                        </button>
                      </div>
                    </td>

                    {/* Status & Latency */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-semibold text-primary text-xs">{cfg.status}</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                        <span className="font-mono text-tertiary">{cfg.latencyMs}ms ping</span>
                        <span>•</span>
                        <span>Pool: {cfg.poolMin}-{cfg.poolMax}</span>
                      </div>
                    </td>

                    {/* Storage & Tables */}
                    <td className="py-3.5 px-3">
                      <div className="text-xs font-mono font-medium text-on-surface">
                        {cfg.storageMb} MB
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        {cfg.collectionsOrTablesCount} {isMongo ? 'collections' : 'tables'}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePingQuick(cfg)}
                          title="Run Live Health Ping"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">speed</span>
                        </button>

                        <button
                          onClick={() => openEditModal(cfg)}
                          title="Edit DB Settings"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to detach the database binding for ${cfg.tenantName}?`)) {
                              deleteTenantDbConfig(cfg.id);
                            }
                          }}
                          title="Detach Database"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">link_off</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredConfigs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-50">database_off</span>
                    <p className="text-xs">No tenant database configurations match the selected filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning / Edit Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-low border border-primary/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-on-surface space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                  {selectedConfigForEdit ? 'EDIT CONFIGURATION' : 'DATABASE PROVISIONING WIZARD'}
                </span>
                <h3 className="text-xl font-headline font-bold text-on-surface mt-1">
                  {selectedConfigForEdit ? `Configure DB: ${selectedConfigForEdit.tenantName}` : 'Provision Separate Tenant Database'}
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAndProvision} className="space-y-6">
              {/* Tenant Target */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Select Tenant Organization</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => {
                    setSelectedTenantId(e.target.value);
                    const tenant = saasLicenses.find((l) => l.id === e.target.value);
                    if (tenant) {
                      const slug = tenant.gymName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
                      setDatabaseName(`gymos_tenant_${slug}`);
                      setUsername(`tenant_${slug}_dba`);
                    }
                  }}
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                >
                  {saasLicenses.map((lic) => (
                    <option key={lic.id} value={lic.id}>
                      {lic.gymName} ({lic.tier} • {lic.maxMembers} members limit)
                    </option>
                  ))}
                </select>
              </div>

              {/* Database Engine Choice: PostgreSQL vs MongoDB */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Database Engine Architecture</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* PostgreSQL Card */}
                  <button
                    type="button"
                    onClick={() => handleEngineChange('postgres')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      engine === 'postgres'
                        ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-surface-container border-outline-variant/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">table_rows</span>
                      </div>
                      {engine === 'postgres' && (
                        <span className="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-blue-400">PostgreSQL (Relational)</div>
                    <div className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                      Strict schema integrity, foreign keys, row-level tenant security, and ACID transactions.
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-blue-300">Default Port: 5432</div>
                  </button>

                  {/* MongoDB Card */}
                  <button
                    type="button"
                    onClick={() => handleEngineChange('mongodb')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      engine === 'mongodb'
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-surface-container border-outline-variant/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">view_agenda</span>
                      </div>
                      {engine === 'mongodb' && (
                        <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-emerald-400">MongoDB (NoSQL Document)</div>
                    <div className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                      Flexible BSON documents, horizontal sharding, rapid turnaround on custom tenant schemas.
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-emerald-300">Default Port: 27017</div>
                  </button>
                </div>
              </div>

              {/* Multi-Tenant Isolation Strategy */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Multi-Tenant Isolation Strategy</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => setStrategy('dedicated_database')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      strategy === 'dedicated_database'
                        ? 'bg-primary/10 border-primary text-on-surface'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === 'dedicated_database'}
                      onChange={() => setStrategy('dedicated_database')}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-semibold text-on-surface">Separate Database per Tenant</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Physical isolation with individual DB catalog</div>
                    </div>
                  </label>

                  {engine === 'postgres' ? (
                    <label
                      onClick={() => setStrategy('dedicated_schema')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        strategy === 'dedicated_schema'
                          ? 'bg-primary/10 border-primary text-on-surface'
                          : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        checked={strategy === 'dedicated_schema'}
                        onChange={() => setStrategy('dedicated_schema')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-on-surface">Schema per Tenant (Postgres)</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Shared cluster, isolated namespace schema</div>
                      </div>
                    </label>
                  ) : (
                    <label
                      onClick={() => setStrategy('isolated_collection')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        strategy === 'isolated_collection'
                          ? 'bg-primary/10 border-primary text-on-surface'
                          : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      <input
                        type="radio"
                        name="strategy"
                        checked={strategy === 'isolated_collection'}
                        onChange={() => setStrategy('isolated_collection')}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="font-semibold text-on-surface">Prefix Collection Namespace</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Isolated collection set in Mongo cluster</div>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Connection Parameters */}
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">link</span>
                    <span>Cluster Connection Parameters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseCustomUri(!useCustomUri)}
                    className="text-[11px] text-primary hover:underline"
                  >
                    {useCustomUri ? 'Use Standard Form Fields' : 'Paste Direct Connection URI (Atlas / Self-Hosted)'}
                  </button>
                </div>

                {useCustomUri ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-on-surface-variant font-medium">
                        Full Connection URI ({engine === 'mongodb' ? 'mongodb:// or mongodb+srv://' : 'postgresql://'})
                      </label>
                      <button
                        type="button"
                        onClick={() => handleParseConnectionString(customUri)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span className="material-symbols-outlined text-[12px]">auto_fix_high</span>
                        <span>Auto-Parse URI into Form Fields</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={
                          engine === 'mongodb'
                            ? 'mongodb+srv://admin:pass@cluster0.xyz.mongodb.net/tenant_db?retryWrites=true&w=majority'
                            : 'postgresql://admin:password@localhost:5432/tenant_db?sslmode=require'
                        }
                        value={customUri}
                        onChange={(e) => {
                          setCustomUri(e.target.value);
                          if (e.target.value.includes('://')) {
                            handleParseConnectionString(e.target.value);
                          }
                        }}
                        className="flex-1 bg-surface-container-high rounded-xl px-3.5 py-2 text-xs font-mono border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleParseConnectionString(customUri)}
                        className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-xs font-semibold shrink-0"
                      >
                        Parse
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-on-surface-variant">
                      <span>Quick presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = 'postgresql://tenant_admin:Secr3tP@ss!@pg-cluster.gymos.cloud:5432/gymos_tenant_db?sslmode=require';
                          handleParseConnectionString(uri);
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-blue-400 font-mono"
                      >
                        RDS Postgres SSL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = 'mongodb+srv://atlas_user:Secr3tMongo!@cluster0.gymos.mongodb.net/gymos_tenant_mongo?retryWrites=true&w=majority';
                          handleParseConnectionString(uri);
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-emerald-400 font-mono"
                      >
                        MongoDB Atlas srv
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] text-on-surface-variant">Cluster Host / Server Address</label>
                      <input
                        type="text"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        className="w-full bg-surface-container-high rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-on-surface-variant">Port</label>
                      <input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(parseInt(e.target.value, 10))}
                        className="w-full bg-surface-container-high rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-on-surface-variant">Database Name</label>
                      <input
                        type="text"
                        value={databaseName}
                        onChange={(e) => setDatabaseName(e.target.value)}
                        className="w-full bg-surface-container-high rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-on-surface-variant">Database User</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-surface-container-high rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] text-on-surface-variant">Database Password / Auth Token</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={selectedConfigForEdit ? '(Keep existing password)' : 'Enter secure database password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-surface-container-high rounded-xl pl-3.5 pr-10 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2 text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SSL & Pool Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-outline-variant/20">
                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant">SSL/TLS Mode</label>
                    <select
                      value={sslMode}
                      onChange={(e: any) => setSslMode(e.target.value)}
                      className="w-full bg-surface-container-high rounded-xl px-3 py-2 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="require">Require SSL</option>
                      <option value="prefer">Prefer SSL</option>
                      <option value="verify-full">Verify Full Certificate</option>
                      <option value="disable">Disable SSL (Local Dev)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant">Min Pool Conns</label>
                    <input
                      type="number"
                      value={poolMin}
                      onChange={(e) => setPoolMin(parseInt(e.target.value, 10))}
                      className="w-full bg-surface-container-high rounded-xl px-3 py-2 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-on-surface-variant">Max Pool Conns</label>
                    <input
                      type="number"
                      value={poolMax}
                      onChange={(e) => setPoolMax(parseInt(e.target.value, 10))}
                      className="w-full bg-surface-container-high rounded-xl px-3 py-2 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Enterprise Options */}
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">security</span>
                  <span>Isolation Hardening &amp; Resilience</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoBackup}
                      onChange={(e) => setAutoBackup(e.target.checked)}
                      className="rounded"
                    />
                    <span>Automated Backups</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={encryptionAtRest}
                      onChange={(e) => setEncryptionAtRest(e.target.checked)}
                      className="rounded"
                    />
                    <span>AES-256 Encryption</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cdcEnabled}
                      onChange={(e) => setCdcEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Change Data Capture</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <span className="text-on-surface-variant">Replicas:</span>
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={readReplicas}
                      onChange={(e) => setReadReplicas(parseInt(e.target.value, 10))}
                      className="w-12 bg-surface-container-high rounded px-1.5 py-0.5 text-center font-mono border border-outline-variant/30"
                    />
                  </div>
                </div>
              </div>

              {/* Live Test Feedback Banner */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-error/15 border-error/40 text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                    {testResult.success ? 'check_circle' : 'error'}
                  </span>
                  <div>
                    <div className="font-bold">{testResult.success ? 'Connection Validated' : 'Connection Failure'}</div>
                    <div className="text-[11px] mt-0.5 opacity-90">{testResult.message}</div>
                    {testResult.latencyMs && (
                      <div className="text-[10px] font-mono mt-1 text-emerald-300">
                        Roundtrip Ping: {testResult.latencyMs}ms • Engine Version: {testResult.engineVersion || `${engine.toUpperCase()} 7.x/16.x`}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Action Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px] text-tertiary">
                    {isTesting ? 'sync' : 'network_check'}
                  </span>
                  <span>{isTesting ? 'Testing Connectivity...' : 'Test DB Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isProvisioning ? 'hourglass_top' : 'rocket_launch'}
                    </span>
                    <span>{isProvisioning ? 'Provisioning Schema...' : 'Deploy Tenant DB'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
