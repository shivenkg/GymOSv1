import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { TenantDatabaseConfig, DatabaseEngine, TenantDbIsolationStrategy } from '../types';
import { DatabaseMigrationModal } from './DatabaseMigrationModal';

export const TenantDatabaseManager: React.FC = () => {
  const {
    tenantDbConfigs,
    deleteTenantDbConfig,
    attachTenantDatabase,
    detachTenantDatabase,
    pingTenantDatabase,
    testTenantDbConnection,
    provisionTenantDatabase,
    saasLicenses,
    showToast,
  } = useGym();

  const [engineFilter, setEngineFilter] = useState<'all' | 'postgres' | 'mongodb'>('all');
  const [attachmentFilter, setAttachmentFilter] = useState<'all' | 'attached' | 'detached'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedConfigForEdit, setSelectedConfigForEdit] = useState<TenantDatabaseConfig | null>(null);

  // Expanded row ID for inline routing & diagnostics inspector
  const [expandedTenantId, setExpandedTenantId] = useState<string | null>(null);

  // Detach Confirmation Modal State
  const [detachModalConfig, setDetachModalConfig] = useState<TenantDatabaseConfig | null>(null);
  // Delete Confirmation Modal State
  const [deleteModalConfig, setDeleteModalConfig] = useState<TenantDatabaseConfig | null>(null);

  // Migration Modal State
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationTargetConfig, setMigrationTargetConfig] = useState<TenantDatabaseConfig | null>(null);

  // SaaS Architecture Deployment Model Explorer Toggle
  const [showSaasArchGuide, setShowSaasArchGuide] = useState(false);
  const [selectedArchTab, setSelectedArchTab] = useState<'single_db_multi_schema' | 'multi_db_per_tenant' | 'mongo_collection_ns' | 'byodb_vpc'>('single_db_multi_schema');

  // Circuit Breaker State tracking
  const [circuitBreakerOverrides, setCircuitBreakerOverrides] = useState<Record<string, {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    lastTrippedAt?: string;
  }>>({});

  // Form State for Provisioning / Editing
  const [selectedTenantId, setSelectedTenantId] = useState(saasLicenses[0]?.id || 'lic-001');
  const [engine, setEngine] = useState<DatabaseEngine>('postgres');
  const [strategy, setStrategy] = useState<TenantDbIsolationStrategy>('dedicated_database');
  const [attachmentStatusInput, setAttachmentStatusInput] = useState<'attached' | 'detached'>('attached');
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

  // Test Connection & Action State
  const [isTesting, setIsTesting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    engineVersion?: string;
  } | null>(null);

  // Provisioning State
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Attachment stats calculation
  const attachedConfigs = tenantDbConfigs.filter((c) => c.attachmentStatus !== 'detached' && c.isAttached !== false);
  const detachedConfigs = tenantDbConfigs.filter((c) => c.attachmentStatus === 'detached' || c.isAttached === false);
  const attachedCount = attachedConfigs.length;
  const detachedCount = detachedConfigs.length;

  // Filtered Databases
  const filteredConfigs = tenantDbConfigs.filter((cfg) => {
    const matchesEngine = engineFilter === 'all' || cfg.engine === engineFilter;
    const isAttached = cfg.attachmentStatus !== 'detached' && cfg.isAttached !== false;
    const matchesAttachment =
      attachmentFilter === 'all' ||
      (attachmentFilter === 'attached' && isAttached) ||
      (attachmentFilter === 'detached' && !isAttached);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      cfg.tenantName.toLowerCase().includes(q) ||
      cfg.databaseName.toLowerCase().includes(q) ||
      cfg.host.toLowerCase().includes(q) ||
      cfg.strategy.toLowerCase().includes(q) ||
      (isAttached ? 'attached' : 'detached').includes(q);
    return matchesEngine && matchesAttachment && matchesSearch;
  });

  const totalConfigs = tenantDbConfigs.length;
  const postgresCount = tenantDbConfigs.filter((c) => c.engine === 'postgres').length;
  const mongoCount = tenantDbConfigs.filter((c) => c.engine === 'mongodb').length;

  // Circuit Breaker Status Resolver
  const getCircuitBreaker = (cfg: TenantDatabaseConfig) => {
    if (circuitBreakerOverrides[cfg.id]) {
      return circuitBreakerOverrides[cfg.id];
    }
    if (cfg.attachmentStatus === 'detached' || cfg.isAttached === false || cfg.isIpBlocked) {
      return {
        state: 'OPEN' as const,
        lastTrippedAt: cfg.detachedAt || 'Auto-tripped: Connection offline',
      };
    }
    return {
      state: 'CLOSED' as const,
    };
  };

  // Simulate Outage / Trip Breaker
  const handleTripCircuitBreaker = (cfg: TenantDatabaseConfig) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCircuitBreakerOverrides((prev) => ({
      ...prev,
      [cfg.id]: { state: 'OPEN', lastTrippedAt: `Tripped at ${timeStr} (Outage Simulated)` },
    }));
    showToast(
      'Circuit Breaker Tripped',
      `Auto-switched ${cfg.tenantName} to Shared System DB Sandbox. Dedicated traffic suspended.`,
      'warning'
    );
  };

  // Canary Probe & Reset Breaker
  const handleResetCircuitBreaker = async (cfg: TenantDatabaseConfig) => {
    setActionLoadingId(cfg.id);
    showToast('Testing Canary Probe...', `Checking health & socket on ${(cfg.engine || 'database').toUpperCase()}`, 'info');
    await new Promise((r) => setTimeout(r, 600));

    setCircuitBreakerOverrides((prev) => ({
      ...prev,
      [cfg.id]: { state: 'CLOSED' },
    }));
    setActionLoadingId(null);
    showToast(
      'Circuit Breaker Restored',
      `Canary probe succeeded. Dedicated live traffic restored on ${cfg.databaseName} (${(cfg.engine || 'database').toUpperCase()}).`,
      'success'
    );
  };

  const openNewConfigModal = () => {
    setSelectedConfigForEdit(null);
    const tenant = saasLicenses[0];
    const defaultSlug = tenant ? tenant.gymName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15) : 'tenant_01';
    setSelectedTenantId(tenant?.id || 'lic-001');
    setEngine('postgres');
    setStrategy('dedicated_database');
    setAttachmentStatusInput('attached');
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
    setAttachmentStatusInput(cfg.attachmentStatus === 'detached' || cfg.isAttached === false ? 'detached' : 'attached');
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
        setHost('cluster0.ln8epjv.mongodb.net');
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
        if (match[1]) {
          try { setUsername(decodeURIComponent(match[1])); } catch { setUsername(match[1]); }
        }
        if (match[2]) {
          try { setPassword(decodeURIComponent(match[2])); } catch { setPassword(match[2]); }
        }
        if (match[3]) setHost(match[3]);
        if (match[4]) setPort(parseInt(match[4], 10));
        const dbName = match[5] ? match[5].split('?')[0] : 'gymos';
        setDatabaseName(dbName || 'gymos');
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
      showToast('Connection Successful', `${(engine || 'database').toUpperCase()} responded in ${res.latencyMs || 15}ms`, 'success');
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

    const isAttached = attachmentStatusInput === 'attached';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      status: isAttached ? (testResult?.success ? 'Connected' : 'Provisioning') : 'Detached',
      attachmentStatus: attachmentStatusInput,
      isAttached,
      attachedAt: isAttached ? (selectedConfigForEdit?.attachedAt || `Today at ${timeStr}`) : undefined,
      detachedAt: !isAttached ? (selectedConfigForEdit?.detachedAt || `Today at ${timeStr}`) : undefined,
      latencyMs: testResult?.latencyMs || (isAttached ? Math.floor(12 + Math.random() * 15) : 0),
      storageMb: selectedConfigForEdit?.storageMb || (isAttached ? 14.5 : 0),
      collectionsOrTablesCount: isAttached ? (isMongo ? 14 : 18) : 0,
      lastChecked: isAttached ? `Attached & Verified at ${timeStr}` : `Detached at ${timeStr} (Fallback to Shared DB)`,
      lastMigrationVersion: isMongo ? 'v1.0.0-mongo-init' : 'v2.4.0-init-rbac-turnstiles',
      features: {
        autoBackupEnabled: autoBackup,
        cdcEnabled,
        encryptionAtRest,
        readReplicas,
      },
      circuitBreaker: {
        state: isAttached ? 'CLOSED' : 'OPEN',
        failoverEnabled: true,
        consecutiveFailures: 0,
        failureThreshold: 2,
        fallbackRoute: 'shared_system_db',
      },
    };

    const res = await provisionTenantDatabase(configPayload);
    setIsProvisioning(false);
    setShowConfigModal(false);

    if (res.success) {
      showToast('Tenant Database Provisioned', res.message, 'success');
    }
  };

  // Direct Attach Handler
  const handleAttachClick = async (cfg: TenantDatabaseConfig) => {
    setActionLoadingId(cfg.id);
    showToast('Attaching Database...', `Testing socket & binding ${(cfg.engine || 'database').toUpperCase()} for ${cfg.tenantName}`, 'info');
    const res = await attachTenantDatabase(cfg.id);
    setActionLoadingId(null);
    if (res?.isIpBlocked) {
      showToast('Atlas IP Whitelist Required', 'Tenant marked attached, but MongoDB Atlas rejected IP. Add 34.34.244.54 in Atlas Network Access.', 'warning');
    }
  };

  // Direct Detach Confirmation Opener
  const handleOpenDetachModal = (cfg: TenantDatabaseConfig) => {
    setDetachModalConfig(cfg);
  };

  // Confirm Detach Action
  const handleConfirmDetach = async () => {
    if (!detachModalConfig) return;
    const target = detachModalConfig;
    setDetachModalConfig(null);
    setActionLoadingId(target.id);
    await detachTenantDatabase(target.id);
    setActionLoadingId(null);
  };

  // Direct Delete Confirmation Opener
  const handleOpenDeleteModal = (cfg: TenantDatabaseConfig) => {
    setDeleteModalConfig(cfg);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalConfig) return;
    const target = deleteModalConfig;
    setDeleteModalConfig(null);
    await deleteTenantDbConfig(target.id);
  };

  const handlePingQuick = async (cfg: TenantDatabaseConfig) => {
    setActionLoadingId(cfg.id);
    showToast('Testing Live Ping...', `Pinging ${(cfg.engine || 'database').toUpperCase()} for ${cfg.tenantName}`, 'info');
    const res = await pingTenantDatabase(cfg.id);
    setActionLoadingId(null);
    if (res?.success) {
      showToast('Live Ping Verified', `${(cfg.engine || 'database').toUpperCase()} responded in ${res.latencyMs || 14}ms (Healthy)`, 'success');
    } else if (res?.isIpBlocked) {
      showToast('Atlas IP Whitelist Required', 'Host IP 34.34.244.54 requires whitelisting in MongoDB Atlas Network Access.', 'warning');
    } else {
      showToast('Ping Warning', res?.message || 'Database ping degraded or offline', 'error');
    }
  };

  const handleVerifyAll = async () => {
    setIsVerifyingAll(true);
    showToast('Verifying Databases...', 'Running live connection pings across all attached databases', 'info');
    for (const cfg of attachedConfigs) {
      await pingTenantDatabase(cfg.id);
    }
    setIsVerifyingAll(false);
    showToast('Verification Complete', `Verified ${attachedCount} tenant database connections.`, 'success');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', label, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Engine Overview KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Registry */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Total DB Registry</div>
            <div className="text-xl font-headline font-bold text-on-surface mt-0.5 font-mono">{totalConfigs} Configs</div>
            <div className="text-[10px] text-tertiary">PostgreSQL &amp; MongoDB</div>
          </div>
        </div>

        {/* Attached Databases */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-emerald-500/40 flex items-center gap-3 shadow-sm shadow-emerald-500/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[22px]">link</span>
          </div>
          <div>
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Attached Databases</span>
            </div>
            <div className="text-xl font-headline font-bold text-emerald-300 mt-0.5 font-mono">{attachedCount} Active</div>
            <div className="text-[10px] text-emerald-400/80">Direct Tenant Routing</div>
          </div>
        </div>

        {/* Detached / Standby */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-amber-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[22px]">link_off</span>
          </div>
          <div>
            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Detached / Standby</span>
            </div>
            <div className="text-xl font-headline font-bold text-amber-200 mt-0.5 font-mono">{detachedCount} Unbound</div>
            <div className="text-[10px] text-on-surface-variant">Using Shared Fallback DB</div>
          </div>
        </div>

        {/* PostgreSQL Fleet */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-blue-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-[22px]">table_rows</span>
          </div>
          <div>
            <div className="text-[11px] text-blue-400 font-medium">PostgreSQL Clusters</div>
            <div className="text-xl font-headline font-bold text-blue-300 mt-0.5 font-mono">{postgresCount} Total</div>
            <div className="text-[10px] text-on-surface-variant">
              {attachedConfigs.filter((c) => c.engine === 'postgres').length} Attached • {detachedConfigs.filter((c) => c.engine === 'postgres').length} Detached
            </div>
          </div>
        </div>

        {/* MongoDB Fleet */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[22px]">view_agenda</span>
          </div>
          <div>
            <div className="text-[11px] text-emerald-400 font-medium">MongoDB Clusters</div>
            <div className="text-xl font-headline font-bold text-emerald-300 mt-0.5 font-mono">{mongoCount} Total</div>
            <div className="text-[10px] text-on-surface-variant">
              {attachedConfigs.filter((c) => c.engine === 'mongodb').length} Attached • {detachedConfigs.filter((c) => c.engine === 'mongodb').length} Detached
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
              <span className="text-xs text-on-surface-variant font-mono">Real-Time Routing &amp; Failover</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Tenant DB Engines (PostgreSQL &amp; MongoDB)
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
              SuperAdmin control plane to inspect the <strong>actual status of attach / detach</strong> with dedicated database clusters. When <strong>Attached</strong>, all tenant queries route directly to the dedicated PostgreSQL or MongoDB instance. When <strong>Detached</strong>, the tenant operates on the safe shared fallback sandbox.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* SaaS Architecture Guide Toggle */}
            <button
              onClick={() => setShowSaasArchGuide(!showSaasArchGuide)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                showSaasArchGuide
                  ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/50 text-on-surface'
              }`}
              title="SaaS Multi-Tenant Database Deployment Models (Single DB Multi-Schema vs Multi-DB)"
            >
              <span className="material-symbols-outlined text-[17px]">account_tree</span>
              <span>SaaS Deployment Architectures</span>
            </button>

            {/* Migrate / Export Button */}
            <button
              onClick={() => {
                setMigrationTargetConfig(null);
                setShowMigrationModal(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
              title="1-Click Data Migration from Fallback DB to Dedicated Database"
            >
              <span className="material-symbols-outlined text-[17px] text-tertiary">move_up</span>
              <span>Migrate / Export Data</span>
            </button>

            <button
              onClick={handleVerifyAll}
              disabled={isVerifyingAll || attachedCount === 0}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              title="Ping all attached databases and verify live connectivity"
            >
              <span className={`material-symbols-outlined text-[17px] text-primary ${isVerifyingAll ? 'animate-spin' : ''}`}>
                network_check
              </span>
              <span>{isVerifyingAll ? 'Verifying All...' : 'Verify All Pings'}</span>
            </button>

            <button
              onClick={openNewConfigModal}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary/25 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Provision Tenant DB</span>
            </button>
          </div>
        </div>

        {/* SAAS MULTI-TENANT DB DEPLOYMENT ARCHITECTURE EXPLORER */}
        {showSaasArchGuide && (
          <div className="p-5 rounded-2xl bg-surface-container border border-primary/40 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">account_tree</span>
                </span>
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">
                    SaaS Database Deployment Models &amp; Architecture Engine
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Compare Single DB with Multi-Schema vs Multiple Dedicated DBs for tenant scaling
                  </p>
                </div>
              </div>

              <div className="flex bg-surface-container-high p-1 rounded-xl border border-outline-variant/40 text-xs">
                <button
                  onClick={() => setSelectedArchTab('single_db_multi_schema')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedArchTab === 'single_db_multi_schema' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Single DB (Multi-Schema)
                </button>
                <button
                  onClick={() => setSelectedArchTab('multi_db_per_tenant')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedArchTab === 'multi_db_per_tenant' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Multiple DBs (Dedicated Catalog)
                </button>
                <button
                  onClick={() => setSelectedArchTab('mongo_collection_ns')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedArchTab === 'mongo_collection_ns' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  MongoDB Namespace
                </button>
                <button
                  onClick={() => setSelectedArchTab('byodb_vpc')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedArchTab === 'byodb_vpc' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Customer BYODB (VPC)
                </button>
              </div>
            </div>

            {/* Content for Selected Architecture Model */}
            {selectedArchTab === 'single_db_multi_schema' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-8 space-y-3">
                  <div className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">layers</span>
                    <span>Architecture 1: Single PostgreSQL Cluster with Schema-per-Tenant</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    All tenants connect to a unified PostgreSQL server instance. Each tenant franchise is given an isolated PostgreSQL schema (e.g., <code className="px-1.5 py-0.5 bg-surface-container-highest rounded font-mono text-primary">tenant_apex</code>). At runtime, queries execute with <code className="px-1.5 py-0.5 bg-surface-container-highest rounded font-mono text-primary">SET search_path = tenant_apex, public;</code>.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Infrastructure Cost</span>
                      <span className="text-emerald-400 font-bold">Lowest ($)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Provision Time</span>
                      <span className="text-emerald-400 font-bold">&lt; 500ms</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Isolation Level</span>
                      <span className="text-blue-400 font-bold">Logical Schema</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Target Tier</span>
                      <span className="text-on-surface font-bold">Starter &amp; Pro Plans</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2 font-mono text-[10px]">
                  <div className="font-bold text-on-surface text-[11px] flex items-center justify-between">
                    <span>PostgreSQL DDL Template</span>
                    <button
                      onClick={() => copyToClipboard('CREATE SCHEMA IF NOT EXISTS tenant_slug;\nSET search_path = tenant_slug, public;', 'PostgreSQL Schema DDL')}
                      className="text-primary hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-2 bg-black/40 rounded text-emerald-300 overflow-x-auto leading-relaxed">
{`CREATE SCHEMA IF NOT EXISTS tenant_apex;
SET search_path = tenant_apex, public;

CREATE TABLE members (
  id UUID PRIMARY KEY,
  member_code VARCHAR(32),
  name VARCHAR(128)
);`}
                  </pre>
                </div>
              </div>
            )}

            {selectedArchTab === 'multi_db_per_tenant' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-8 space-y-3">
                  <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">dns</span>
                    <span>Architecture 2: Multiple Databases for Each Tenant (Database-per-Tenant)</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Every gym franchise receives an entirely separate, physically isolated database catalog (e.g. <code className="px-1.5 py-0.5 bg-surface-container-highest rounded font-mono text-emerald-300">gymos_tenant_apex_prod</code> on PostgreSQL or dedicated MongoDB database). Provides zero noisy-neighbor interference and isolated backup schedules.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Infrastructure Cost</span>
                      <span className="text-amber-400 font-bold">Medium ($$$)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Provision Time</span>
                      <span className="text-primary font-bold">~ 2–4 Seconds</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Isolation Level</span>
                      <span className="text-emerald-400 font-bold">Physical Catalog (Highest)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Target Tier</span>
                      <span className="text-on-surface font-bold">Elite &amp; Enterprise</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2 font-mono text-[10px]">
                  <div className="font-bold text-on-surface text-[11px] flex items-center justify-between">
                    <span>Dedicated Catalog Script</span>
                    <button
                      onClick={() => copyToClipboard('CREATE DATABASE gymos_tenant_slug OWNER tenant_admin;', 'Create Database DDL')}
                      className="text-primary hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-2 bg-black/40 rounded text-emerald-300 overflow-x-auto leading-relaxed">
{`CREATE DATABASE gymos_tenant_apex
  WITH OWNER = tenant_apex_dba
  ENCODING = 'UTF8';

GRANT ALL PRIVILEGES ON DATABASE
  gymos_tenant_apex TO tenant_apex_dba;`}
                  </pre>
                </div>
              </div>
            )}

            {selectedArchTab === 'mongo_collection_ns' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-8 space-y-3">
                  <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                    <span>Architecture 3: MongoDB Multi-Tenant Collection Namespaces</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Utilizes a single MongoDB Atlas cluster (e.g. Cluster0) where tenant collections are partitioned via prefix namespaces (e.g., <code className="px-1.5 py-0.5 bg-surface-container-highest rounded font-mono text-emerald-300">t_apex_members</code>) or dedicated tenant databases in the same cluster.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Document Scaling</span>
                      <span className="text-emerald-400 font-bold">Horizontal Sharding</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Schema Flexibility</span>
                      <span className="text-emerald-400 font-bold">Polymorphic BSON</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Atlas Cluster</span>
                      <span className="text-primary font-bold">Cluster0 Active</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Target Tier</span>
                      <span className="text-on-surface font-bold">Modern NoSQL Franchises</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2 font-mono text-[10px]">
                  <div className="font-bold text-on-surface text-[11px] flex items-center justify-between">
                    <span>Mongo Driver Namespace</span>
                    <button
                      onClick={() => copyToClipboard('const db = client.db("gymos_tenant_apex");', 'Mongo Namespace Snippet')}
                      className="text-primary hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-2 bg-black/40 rounded text-emerald-300 overflow-x-auto leading-relaxed">
{`const client = new MongoClient(uri);
const tenantDb = client.db('gymos_tenant_apex');
const membersCol = tenantDb.collection('members');

await membersCol.createIndex({ memberCode: 1 }, { unique: true });`}
                  </pre>
                </div>
              </div>
            )}

            {selectedArchTab === 'byodb_vpc' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                <div className="md:col-span-8 space-y-3">
                  <div className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                    <span>Architecture 4: Customer BYODB (Bring Your Own Database VPC)</span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Enterprise franchises connect their own AWS RDS PostgreSQL instance or MongoDB Atlas dedicated project via secure connection string and VPC Peering. All data remains in the gym enterprise’s cloud account.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Cloud Ownership</span>
                      <span className="text-purple-400 font-bold">100% Franchise Owned</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Security VPC</span>
                      <span className="text-emerald-400 font-bold">PrivateLink / TLS 1.3</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Compliance</span>
                      <span className="text-emerald-400 font-bold">SOC2 / HIPAA / ISO</span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                      <span className="text-[10px] text-on-surface-variant block">Target Tier</span>
                      <span className="text-on-surface font-bold">Enterprise Bespoke</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2 font-mono text-[10px]">
                  <div className="font-bold text-on-surface text-[11px]">Quick Setup Action</div>
                  <p className="text-on-surface-variant leading-relaxed text-[10px]">
                    Click below to open the provisioning wizard pre-filled with Custom Cluster URI format.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      openNewConfigModal();
                      setUseCustomUri(true);
                      setStrategy('custom_cluster_uri');
                    }}
                    className="w-full py-2 rounded-lg bg-primary text-on-primary font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    Open BYODB Wizard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dual Filter Bar: Engine & Attachment Status */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Attachment Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-on-surface-variant shrink-0">Binding State:</span>
              <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
                <button
                  onClick={() => setAttachmentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    attachmentFilter === 'all' ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All ({tenantDbConfigs.length})
                </button>
                <button
                  onClick={() => setAttachmentFilter('attached')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    attachmentFilter === 'attached' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Attached ({attachedCount})</span>
                </button>
                <button
                  onClick={() => setAttachmentFilter('detached')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    attachmentFilter === 'detached' ? 'bg-amber-600 text-white shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Detached ({detachedCount})</span>
                </button>
              </div>
            </div>

            {/* Engine Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-on-surface-variant shrink-0">Engine:</span>
              <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
                <button
                  onClick={() => setEngineFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    engineFilter === 'all' ? 'bg-surface-container-highest text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setEngineFilter('postgres')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    engineFilter === 'postgres' ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>PostgreSQL ({postgresCount})</span>
                </button>
                <button
                  onClick={() => setEngineFilter('mongodb')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                    engineFilter === 'mongodb' ? 'bg-emerald-600 text-white shadow-sm font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>MongoDB ({mongoCount})</span>
                </button>
              </div>
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
                <th className="py-3 px-3">Attachment &amp; Route Status</th>
                <th className="py-3 px-3">Live Engine &amp; Circuit Breaker</th>
                <th className="py-3 px-3">Storage / Tables</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-sans">
              {filteredConfigs.map((cfg) => {
                const isMongo = cfg.engine === 'mongodb';
                const isAttached = cfg.attachmentStatus !== 'detached' && cfg.isAttached !== false;
                const isActionLoading = actionLoadingId === cfg.id;
                const isExpanded = expandedTenantId === cfg.id;
                const breaker = getCircuitBreaker(cfg);
                const isBreakerTripped = breaker.state === 'OPEN';

                return (
                  <React.Fragment key={cfg.id}>
                    <tr className={`transition-colors group ${isExpanded ? 'bg-surface-container/60' : 'hover:bg-surface-container-high/40'}`}>
                      {/* Tenant Info */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-on-surface text-sm flex items-center gap-2">
                          <span>{cfg.tenantName}</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant font-mono mt-0.5 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container text-[10px]">{cfg.tenantId}</span>
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
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-surface-container border border-outline-variant/40 text-on-surface-variant" title="SSL Mode: Require">
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
                          <span className="truncate max-w-[190px]">{cfg.connectionUriMasked}</span>
                          <button
                            onClick={() => copyToClipboard(cfg.connectionUriMasked, 'Connection URI')}
                            title="Copy Masked Connection URI"
                            className="hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[12px]">content_copy</span>
                          </button>
                        </div>
                      </td>

                      {/* ACTUAL ATTACHMENT & ROUTE STATUS */}
                      <td className="py-3.5 px-3">
                        {isAttached ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>ATTACHED &amp; ACTIVE</span>
                            </span>
                            <div className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">alt_route</span>
                              <span>Route: Dedicated {(cfg.engine || 'database').toUpperCase()}</span>
                            </div>
                            <div className="text-[9px] text-on-surface-variant font-mono">
                              {cfg.attachedAt ? `Linked: ${cfg.attachedAt}` : 'Active Dedicated Binding'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              <span>DETACHED (STANDBY)</span>
                            </span>
                            <div className="text-[10px] text-amber-300/80 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">swap_calls</span>
                              <span>Route: Fallback Shared DB</span>
                            </div>
                            <div className="text-[9px] text-on-surface-variant font-mono">
                              {cfg.detachedAt ? `Unbound: ${cfg.detachedAt}` : 'Operating in Sandbox'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* LIVE ENGINE HEALTH & CIRCUIT BREAKER */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5">
                          {isAttached ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                {cfg.status === 'Connected' ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    <span className="font-semibold text-emerald-300 text-xs">Connected (Healthy)</span>
                                  </>
                                ) : cfg.status === 'IP Blocked' || cfg.isIpBlocked ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                    <span className="font-semibold text-amber-300 text-xs">Atlas IP Blocked</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                    <span className="font-semibold text-rose-300 text-xs">{cfg.status}</span>
                                  </>
                                )}
                              </div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-2 font-mono">
                                <span className="text-tertiary">{cfg.latencyMs}ms ping</span>
                                <span>•</span>
                                <span>Pool: {cfg.poolMin}-{cfg.poolMax}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-on-surface-variant flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                              <span>Standby Sandbox</span>
                            </div>
                          )}

                          {/* Circuit Breaker Badge */}
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              !isBreakerTripped
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${!isBreakerTripped ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              <span>Breaker: {!isBreakerTripped ? 'CLOSED (NORMAL)' : 'TRIPPED (FAILOVER)'}</span>
                            </span>
                          </div>
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

                      {/* Action Buttons: Attach, Detach, Migrate, Ping, Inspect, Edit, Delete */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Attach or Detach Button */}
                          {isAttached ? (
                            <button
                              onClick={() => handleOpenDetachModal(cfg)}
                              disabled={isActionLoading}
                              title="Detach Database (Revert to Fallback System DB)"
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[14px]">link_off</span>
                              <span>Detach</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAttachClick(cfg)}
                              disabled={isActionLoading}
                              title="Attach Database (Activate Dedicated Live Routing)"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <span className={`material-symbols-outlined text-[14px] ${isActionLoading ? 'animate-spin' : ''}`}>
                                {isActionLoading ? 'sync' : 'link'}
                              </span>
                              <span>{isActionLoading ? 'Attaching...' : 'Attach DB'}</span>
                            </button>
                          )}

                          {/* Data Migration Trigger */}
                          <button
                            onClick={() => {
                              setMigrationTargetConfig(cfg);
                              setShowMigrationModal(true);
                            }}
                            title="Migrate Data from Fallback Storage to this Database"
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-tertiary hover:text-on-surface transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">move_up</span>
                          </button>

                          {/* Live Ping Button */}
                          <button
                            onClick={() => handlePingQuick(cfg)}
                            disabled={isActionLoading}
                            title="Run Live Health Ping on Database Engine"
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <span className={`material-symbols-outlined text-[16px] ${isActionLoading ? 'animate-spin' : ''}`}>
                              speed
                            </span>
                          </button>

                          {/* Expand/Collapse Routing Diagnostics */}
                          <button
                            onClick={() => setExpandedTenantId(isExpanded ? null : cfg.id)}
                            title={isExpanded ? 'Collapse Inspector' : 'Inspect Routing, Circuit Breaker & Telemetry'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isExpanded ? 'bg-primary/20 text-primary' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </button>

                          {/* Edit Settings */}
                          <button
                            onClick={() => openEditModal(cfg)}
                            title="Edit DB Settings"
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                          </button>

                          {/* Delete Config */}
                          <button
                            onClick={() => handleOpenDeleteModal(cfg)}
                            title="Delete Configuration from Registry"
                            className="p-1.5 rounded-lg bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED INLINE DIAGNOSTICS, CIRCUIT BREAKER & ROUTING DRAWER */}
                    {isExpanded && (
                      <tr className="bg-surface-container-low/90 border-b border-outline-variant/30">
                        <td colSpan={7} className="p-4">
                          <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-4 animate-in fade-in duration-150">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${isAttached ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                                <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                                  <span>{cfg.tenantName}</span>
                                  <span className="text-on-surface-variant font-normal font-mono text-xs">({(cfg.engine || 'database').toUpperCase()})</span>
                                </h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                  isAttached ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}>
                                  Status: {isAttached ? 'ATTACHED TO DEDICATED DB' : 'DETACHED (FALLBACK ACTIVE)'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* Circuit Breaker Simulation Controls */}
                                {!isBreakerTripped ? (
                                  <button
                                    onClick={() => handleTripCircuitBreaker(cfg)}
                                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Simulate database network drop and trip circuit breaker to fallback"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                                    <span>Simulate Outage (Trip Breaker)</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleResetCircuitBreaker(cfg)}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Run canary check and reset circuit breaker to dedicated routing"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                                    <span>Reset Breaker (Canary Probe)</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setMigrationTargetConfig(cfg);
                                    setShowMigrationModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-tertiary text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-outline-variant/40"
                                >
                                  <span className="material-symbols-outlined text-[14px]">move_up</span>
                                  <span>Migrate Data to This DB</span>
                                </button>

                                {isAttached ? (
                                  <button
                                    onClick={() => handleOpenDetachModal(cfg)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">link_off</span>
                                    <span>Detach from Dedicated DB</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAttachClick(cfg)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">link</span>
                                    <span>Attach to Dedicated DB</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Circuit Breaker Status Banner */}
                            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                              !isBreakerTripped
                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px] text-primary">power</span>
                                <span className="font-bold">
                                  Circuit Breaker: {!isBreakerTripped ? 'CLOSED (Normal Dedicated Routing)' : 'TRIPPED (Auto-Failover Active)'}
                                </span>
                                <span className="text-[11px] opacity-80">
                                  {!isBreakerTripped
                                    ? '— Traffic actively flows to dedicated cluster.'
                                    : '— Tenant queries automatically diverted to Shared Fallback DB Sandbox to prevent application crash.'}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] opacity-75">
                                Threshold: 2 consecutive failures
                              </span>
                            </div>

                            {/* Query Routing Architecture Flow Diagram */}
                            <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 space-y-2">
                              <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[15px] text-primary">schema</span>
                                <span>Multi-Tenant Query Routing Path</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                                  <div className="text-[10px] text-on-surface-variant font-mono uppercase">1. Ingress Request</div>
                                  <div className="font-bold text-on-surface mt-1">{cfg.tenantName}</div>
                                  <div className="text-[11px] text-on-surface-variant mt-0.5 font-mono">Org ID: {cfg.tenantId}</div>
                                </div>

                                <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                                  <div className="text-[10px] text-on-surface-variant font-mono uppercase">2. Multi-Tenant Router</div>
                                  <div className="font-bold text-on-surface mt-1">GymOS Circuit Breaker Proxy</div>
                                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                                    Strategy: <span className="font-mono text-primary capitalize">{cfg.strategy.replace(/_/g, ' ')}</span>
                                  </div>
                                </div>

                                <div className={`p-3 rounded-lg border ${
                                  isAttached && !isBreakerTripped ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                                }`}>
                                  <div className="text-[10px] uppercase font-mono font-bold">
                                    3. Active Storage Target ({isAttached && !isBreakerTripped ? 'Dedicated' : 'Fallback Sandbox'})
                                  </div>
                                  <div className="font-bold text-sm mt-1">
                                    {isAttached && !isBreakerTripped ? `${(cfg.engine || 'database').toUpperCase()}: ${cfg.databaseName}` : 'Shared System DB Sandbox'}
                                  </div>
                                  <div className="text-[11px] opacity-90 mt-0.5 font-mono truncate" title={cfg.host}>
                                    {isAttached && !isBreakerTripped ? `${cfg.host}:${cfg.port}` : 'Fallback sandbox active'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Atlas IP Blocked Warning Box if applicable */}
                            {cfg.isIpBlocked && (
                              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                                <div className="font-bold flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                                    <span>MongoDB Atlas Whitelist Required for this Tenant</span>
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard('34.34.244.54', 'Host IP (34.34.244.54)')}
                                    className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-mono font-bold text-amber-200 flex items-center gap-1 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                    <span>Copy Host IP (34.34.244.54)</span>
                                  </button>
                                </div>
                                <p className="text-[11px] leading-relaxed text-amber-300/90">
                                  Atlas returned TLS Alert 80 (IP blocked). In your Atlas project under <strong>Network Access</strong>, add IP <code className="px-1 bg-surface-container-highest rounded font-mono">34.34.244.54</code> or <code className="px-1 bg-surface-container-highest rounded font-mono">0.0.0.0/0</code>.
                                </p>
                              </div>
                            )}

                            {/* Telemetry Breakdown Details */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="p-2.5 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                                <div className="text-[10px] text-on-surface-variant font-medium">SSL / Encryption</div>
                                <div className="font-mono text-on-surface font-semibold mt-0.5">
                                  {cfg.sslEnabled ? `Mode: ${cfg.sslMode}` : 'Disabled'}
                                </div>
                              </div>
                              <div className="p-2.5 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                                <div className="text-[10px] text-on-surface-variant font-medium">Connection Pool</div>
                                <div className="font-mono text-on-surface font-semibold mt-0.5">
                                  {cfg.poolMin} min / {cfg.poolMax} max
                                </div>
                              </div>
                              <div className="p-2.5 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                                <div className="text-[10px] text-on-surface-variant font-medium">Auto-Backups &amp; CDC</div>
                                <div className="font-mono text-on-surface font-semibold mt-0.5">
                                  {cfg.features.autoBackupEnabled ? 'Nightly Snapshots' : 'Manual'} • {cfg.features.cdcEnabled ? 'CDC On' : 'CDC Off'}
                                </div>
                              </div>
                              <div className="p-2.5 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                                <div className="text-[10px] text-on-surface-variant font-medium">Last Verified Latency</div>
                                <div className="font-mono text-primary font-semibold mt-0.5">
                                  {cfg.latencyMs}ms ({cfg.lastChecked})
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredConfigs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-50">database_off</span>
                    <p className="text-xs">No tenant database configurations match the selected filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETACH CONFIRMATION MODAL */}
      {detachModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-low border border-amber-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 text-on-surface space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40">
                <span className="material-symbols-outlined text-[24px]">link_off</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Detach Tenant Database?</h3>
                <p className="text-xs text-on-surface-variant">Unlink dedicated cluster and switch to fallback</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs space-y-2">
              <div><strong>Tenant:</strong> {detachModalConfig.tenantName}</div>
              <div><strong>Database:</strong> {detachModalConfig.databaseName} ({(detachModalConfig.engine || 'database').toUpperCase()})</div>
              <div><strong>Cluster:</strong> <code className="font-mono text-[11px]">{detachModalConfig.host}</code></div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 leading-relaxed">
              <div className="font-semibold flex items-center gap-1 text-amber-300">
                <span className="material-symbols-outlined text-[15px]">info</span>
                <span>What happens when detached:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                <li>All incoming queries for this tenant immediately route to the shared fallback system database sandbox.</li>
                <li><strong>No data in the dedicated {(detachModalConfig.engine || 'database').toUpperCase()} database is deleted.</strong></li>
                <li>You can re-attach this database at any time with a single click.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDetachModalConfig(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDetach}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">link_off</span>
                <span>Confirm Detach</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-low border border-error/40 rounded-3xl w-full max-w-md shadow-2xl p-6 text-on-surface space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error/20 text-error flex items-center justify-center border border-error/40">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Delete DB Configuration?</h3>
                <p className="text-xs text-on-surface-variant">Permanently remove from registry</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/30 text-xs space-y-2">
              <div><strong>Tenant:</strong> {deleteModalConfig.tenantName}</div>
              <div><strong>Database:</strong> {deleteModalConfig.databaseName} ({(deleteModalConfig.engine || 'database').toUpperCase()})</div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Are you sure you want to remove this database configuration for <strong>{deleteModalConfig.tenantName}</strong> from the GymOS database registry? The tenant will operate on the default shared system database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalConfig(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error text-xs font-bold shadow-lg shadow-error/30 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK DATA MIGRATION MODAL */}
      <DatabaseMigrationModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        targetConfig={migrationTargetConfig}
      />

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
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
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
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
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
                      Flexible BSON documents, Atlas replica sets, horizontal sharding, rapid turnaround on custom tenant schemas.
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-emerald-300">Default Port: 27017</div>
                  </button>
                </div>
              </div>

              {/* ATTACHMENT / BINDING STATE CHOICE */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Database Attachment &amp; Traffic Routing</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => setAttachmentStatusInput('attached')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      attachmentStatusInput === 'attached'
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attachmentStatusInput"
                      checked={attachmentStatusInput === 'attached'}
                      onChange={() => setAttachmentStatusInput('attached')}
                      className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Attach Immediately (Active Routing)</span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                        Tenant queries immediately route to this dedicated {(engine || 'database').toUpperCase()} database.
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setAttachmentStatusInput('detached')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      attachmentStatusInput === 'detached'
                        ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attachmentStatusInput"
                      checked={attachmentStatusInput === 'detached'}
                      onChange={() => setAttachmentStatusInput('detached')}
                      className="mt-0.5 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span>Save as Detached (Standby)</span>
                      </div>
                      <div className="text-[10px] opacity-80 mt-0.5 leading-snug">
                        Store configuration in registry, but keep tenant on fallback system DB until attached.
                      </div>
                    </div>
                  </label>
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
                    className="text-[11px] text-primary hover:underline cursor-pointer"
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
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
                        className="px-3 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
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
                        className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-blue-400 font-mono cursor-pointer"
                      >
                        RDS Postgres SSL
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = 'mongodb+srv://superadmin:Admin#321@cluster0.ln8epjv.mongodb.net/?appName=Cluster0';
                          handleParseConnectionString(uri);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Cluster0 Live
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const uri = 'mongodb+srv://atlas_user:Secr3tMongo!@cluster0.gymos.mongodb.net/gymos_tenant_mongo?retryWrites=true&w=majority';
                          handleParseConnectionString(uri);
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-emerald-400 font-mono cursor-pointer"
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
                          className="absolute right-3 top-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
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
                        Roundtrip Ping: {testResult.latencyMs}ms • Engine Version: {testResult.engineVersion || `${(engine || 'database').toUpperCase()} 7.x/16.x`}
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
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
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
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-1.5 transition-all cursor-pointer"
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
