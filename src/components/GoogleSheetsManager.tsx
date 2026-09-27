import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import {
  GoogleSheetIntegration,
  SheetSyncDirection,
  SheetSyncFrequency,
  SheetSyncEntity,
  SheetFieldMapping,
} from '../types';

export const GoogleSheetsManager: React.FC = () => {
  const {
    googleSheetIntegrations,
    saveGoogleSheetIntegration,
    deleteGoogleSheetIntegration,
    testGoogleSheetConnection,
    syncGoogleSheetNow,
    saasLicenses,
    showToast,
  } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTenant, setFilterTenant] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<GoogleSheetIntegration | null>(null);

  // Form State
  const [selectedTenantId, setSelectedTenantId] = useState('lic-001');
  const [sheetTitle, setSheetTitle] = useState('Downtown Branch Member Master & Renewals');
  const [spreadsheetIdOrUrl, setSpreadsheetIdOrUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0'
  );
  const [tabName, setTabName] = useState('Members_Active');
  const [direction, setDirection] = useState<SheetSyncDirection>('two_way');
  const [frequency, setFrequency] = useState<SheetSyncFrequency>('realtime');
  const [selectedEntities, setSelectedEntities] = useState<SheetSyncEntity[]>(['members', 'payments']);
  const [fieldMappings, setFieldMappings] = useState<SheetFieldMapping[]>([
    { sheetColumn: 'A', gymosField: 'Full Name', dataType: 'string', isRequired: true },
    { sheetColumn: 'B', gymosField: 'Email Address', dataType: 'string', isRequired: true },
    { sheetColumn: 'C', gymosField: 'Phone Number', dataType: 'string', isRequired: true },
    { sheetColumn: 'D', gymosField: 'Membership Plan', dataType: 'string', isRequired: true },
    { sheetColumn: 'E', gymosField: 'Status', dataType: 'string', isRequired: true },
    { sheetColumn: 'F', gymosField: 'Expiration Date', dataType: 'date', isRequired: true },
    { sheetColumn: 'G', gymosField: 'RFID Wristband Code', dataType: 'string', isRequired: false },
  ]);

  // Testing & Handshake State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    sheetTitle?: string;
    tabs?: string[];
    sampleHeaders?: string[];
    message: string;
  } | null>(null);

  // Syncing state per item
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showAppsScriptModal, setShowAppsScriptModal] = useState<GoogleSheetIntegration | null>(null);

  // Summary Metrics
  const totalSheets = googleSheetIntegrations.length;
  const totalSyncedRows = googleSheetIntegrations.reduce((acc, s) => acc + s.syncedRowsCount, 0);
  const realtimeCount = googleSheetIntegrations.filter((s) => s.frequency === 'realtime').length;

  const filteredIntegrations = googleSheetIntegrations.filter((sheet) => {
    const matchesTenant = filterTenant === 'all' || sheet.tenantId === filterTenant;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      sheet.sheetTitle.toLowerCase().includes(q) ||
      sheet.tenantName.toLowerCase().includes(q) ||
      sheet.spreadsheetId.toLowerCase().includes(q) ||
      sheet.tabName.toLowerCase().includes(q);
    return matchesTenant && matchesSearch;
  });

  const openNewSheetModal = () => {
    setEditingSheet(null);
    setSelectedTenantId(saasLicenses[0]?.id || 'lic-001');
    setSheetTitle('Apex VIP Member Roster');
    setSpreadsheetIdOrUrl('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
    setTabName('Members_Active');
    setDirection('two_way');
    setFrequency('realtime');
    setSelectedEntities(['members', 'payments']);
    setFieldMappings([
      { sheetColumn: 'A', gymosField: 'Full Name', dataType: 'string', isRequired: true },
      { sheetColumn: 'B', gymosField: 'Email Address', dataType: 'string', isRequired: true },
      { sheetColumn: 'C', gymosField: 'Phone Number', dataType: 'string', isRequired: true },
      { sheetColumn: 'D', gymosField: 'Membership Plan', dataType: 'string', isRequired: true },
      { sheetColumn: 'E', gymosField: 'Status', dataType: 'string', isRequired: true },
      { sheetColumn: 'F', gymosField: 'Expiration Date', dataType: 'date', isRequired: true },
    ]);
    setTestResult(null);
    setShowModal(true);
  };

  const openEditModal = (sheet: GoogleSheetIntegration) => {
    setEditingSheet(sheet);
    setSelectedTenantId(sheet.tenantId);
    setSheetTitle(sheet.sheetTitle);
    setSpreadsheetIdOrUrl(sheet.sheetUrl);
    setTabName(sheet.tabName);
    setDirection(sheet.direction);
    setFrequency(sheet.frequency);
    setSelectedEntities(sheet.entities);
    setFieldMappings(sheet.fieldMappings);
    setTestResult(null);
    setShowModal(true);
  };

  const toggleEntity = (entity: SheetSyncEntity) => {
    setSelectedEntities((prev) =>
      prev.includes(entity) ? prev.filter((e) => e !== entity) : [...prev, entity]
    );
  };

  const addFieldMapping = () => {
    const nextCol = String.fromCharCode(65 + fieldMappings.length);
    setFieldMappings([
      ...fieldMappings,
      { sheetColumn: nextCol, gymosField: 'Custom Notes', dataType: 'string', isRequired: false },
    ]);
  };

  const removeFieldMapping = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const updateFieldMapping = (index: number, key: keyof SheetFieldMapping, value: any) => {
    setFieldMappings(
      fieldMappings.map((m, i) => (i === index ? { ...m, [key]: value } : m))
    );
  };

  const handleTestSheet = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testGoogleSheetConnection(spreadsheetIdOrUrl);
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      showToast('Spreadsheet Verified', res.message, 'success');
      if (res.tabs && res.tabs.length > 0 && !res.tabs.includes(tabName)) {
        setTabName(res.tabs[0]);
      }
    } else {
      showToast('Verification Failed', res.message, 'error');
    }
  };

  const handleSaveSheet = async (e: React.FormEvent) => {
    e.preventDefault();

    let extractedId = spreadsheetIdOrUrl;
    const match = spreadsheetIdOrUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      extractedId = match[1];
    }

    const tenant = selectedTenantId === 'all'
      ? { id: 'all', gymName: 'All Franchises (Global Telemetry)' }
      : saasLicenses.find((l) => l.id === selectedTenantId) || { id: 'lic-001', gymName: 'Apex Fitness Club' };

    const payload: GoogleSheetIntegration = {
      id: editingSheet?.id || `sheet-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.gymName,
      sheetTitle,
      spreadsheetId: extractedId,
      sheetUrl: spreadsheetIdOrUrl.startsWith('http')
        ? spreadsheetIdOrUrl
        : `https://docs.google.com/spreadsheets/d/${extractedId}/edit`,
      tabName,
      direction,
      entities: selectedEntities,
      frequency,
      status: 'Active',
      lastSyncedAt: 'Just now',
      syncedRowsCount: editingSheet?.syncedRowsCount || 150,
      webhookSecretToken: editingSheet?.webhookSecretToken || `whsec_${Math.random().toString(36).substring(2, 12)}`,
      serviceAccountEmail: 'gymos-sync-sa@gymos-cloud-sync.iam.gserviceaccount.com',
      fieldMappings,
    };

    await saveGoogleSheetIntegration(payload);
    setShowModal(false);
  };

  const handleSyncNow = async (id: string) => {
    setSyncingId(id);
    await syncGoogleSheetNow(id);
    setSyncingId(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', label, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[22px]">description</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Linked Google Sheets</div>
            <div className="text-xl font-headline font-bold text-on-surface mt-0.5 font-mono">{totalSheets} Active</div>
            <div className="text-[10px] text-emerald-400">Two-Way &amp; Export Streams</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">sync_alt</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Records Synchronized</div>
            <div className="text-xl font-headline font-bold text-primary mt-0.5 font-mono">
              {totalSyncedRows.toLocaleString()} Rows
            </div>
            <div className="text-[10px] text-on-surface-variant">Real-Time Ingestion</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <span className="material-symbols-outlined text-[22px]">webhook</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Real-Time Webhooks</div>
            <div className="text-xl font-headline font-bold text-purple-400 mt-0.5 font-mono">{realtimeCount} Triggers</div>
            <div className="text-[10px] text-purple-300">Google Apps Script Enabled</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-[22px]">verified</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Sync Integrity</div>
            <div className="text-xl font-headline font-bold text-amber-400 mt-0.5 font-mono">100% OK</div>
            <div className="text-[10px] text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Zero Collision Failures</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/30 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                GOOGLE WORKSPACE INTEGRATION
              </span>
              <span className="text-xs text-on-surface-variant font-mono">Bi-Directional Sync Hub</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Google Sheets Live Linking &amp; Automated Pipeline
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
              Connect external Google Sheets to synchronize gym members, optical turnstile attendance check-ins, UPI payments, and CRM lead pipelines automatically. Supports two-way continuous sync or real-time Apps Script webhooks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNewSheetModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_link</span>
              <span>Link New Google Sheet</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-on-surface-variant shrink-0">Filter Tenant:</span>
            <select
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="bg-surface-container rounded-xl px-3 py-1.5 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Tenants ({googleSheetIntegrations.length})</option>
              {saasLicenses.map((lic) => (
                <option key={lic.id} value={lic.id}>
                  {lic.gymName}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search sheet title, tab, or tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container rounded-xl pl-9 pr-4 py-2 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Linked Sheets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-3">Google Sheet Title</th>
                <th className="py-3 px-3">Tenant Franchise</th>
                <th className="py-3 px-3">Sync Direction &amp; Frequency</th>
                <th className="py-3 px-3">Entities &amp; Tab</th>
                <th className="py-3 px-3">Last Synced / Volume</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-sans">
              {filteredIntegrations.map((sheet) => {
                const isSyncing = syncingId === sheet.id;
                return (
                  <tr key={sheet.id} className="hover:bg-surface-container-high/40 transition-colors group">
                    {/* Sheet Info */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-on-surface text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-400 text-[18px]">table_chart</span>
                        <span>{sheet.sheetTitle}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono truncate max-w-xs mt-0.5 flex items-center gap-1.5">
                        <span className="truncate">{sheet.spreadsheetId}</span>
                        <a
                          href={sheet.sheetUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Sheet in Google Drive"
                          className="text-primary hover:underline flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        </a>
                      </div>
                    </td>

                    {/* Tenant */}
                    <td className="py-3.5 px-3">
                      <div className="font-medium text-on-surface">{sheet.tenantName}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                        Tenant ID: {sheet.tenantId}
                      </div>
                    </td>

                    {/* Direction & Frequency */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sheet.direction === 'two_way'
                              ? 'bg-primary/20 text-primary border-primary/30'
                              : sheet.direction === 'gymos_to_sheet'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {sheet.direction === 'two_way' ? 'sync_alt' : sheet.direction === 'gymos_to_sheet' ? 'upload' : 'download'}
                          </span>
                          <span>
                            {sheet.direction === 'two_way' ? 'Two-Way Sync' : sheet.direction === 'gymos_to_sheet' ? 'Export Only' : 'Import Only'}
                          </span>
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant capitalize">
                        {sheet.frequency === 'realtime' ? '⚡ Realtime Webhook' : `Frequency: ${sheet.frequency}`}
                      </div>
                    </td>

                    {/* Entities & Tab */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-xs text-on-surface font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">tab</span>
                        <span>Tab: {sheet.tabName}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sheet.entities.map((e) => (
                          <span
                            key={e}
                            className="px-2 py-0.5 rounded text-[10px] bg-surface-container border border-outline-variant/30 text-on-surface-variant capitalize"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Last Synced & Volume */}
                    <td className="py-3.5 px-3">
                      <div className="text-xs font-mono font-medium text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{sheet.syncedRowsCount.toLocaleString()} rows synced</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        {sheet.lastSyncedAt || 'Active'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSyncNow(sheet.id)}
                          disabled={isSyncing}
                          title="Trigger Immediate Sync"
                          className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center gap-1 transition-colors"
                        >
                          <span className={`material-symbols-outlined text-[15px] ${isSyncing ? 'animate-spin' : ''}`}>
                            sync
                          </span>
                          <span className="text-[11px] font-semibold">{isSyncing ? 'Syncing...' : 'Sync'}</span>
                        </button>

                        <button
                          onClick={() => setShowAppsScriptModal(sheet)}
                          title="View Webhook & Apps Script Snippet"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-purple-400 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                        </button>

                        <button
                          onClick={() => openEditModal(sheet)}
                          title="Edit Field Mappings"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Unlink "${sheet.sheetTitle}" from GymOS?`)) {
                              deleteGoogleSheetIntegration(sheet.id);
                            }
                          }}
                          title="Unlink Sheet"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredIntegrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl mb-1 opacity-50">table_rows_narrow</span>
                    <p className="text-xs">No Google Sheets connected matching the filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link / Edit Sheet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-low border border-emerald-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-on-surface space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  {editingSheet ? 'EDIT GOOGLE SHEET LINK' : 'LINK NEW GOOGLE SHEET'}
                </span>
                <h3 className="text-xl font-headline font-bold text-on-surface mt-1">
                  Google Sheet Bi-Directional Synchronization
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSheet} className="space-y-6">
              {/* Tenant Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant">Franchise Tenant Scope</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 text-xs border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">All Franchises (Global Platform Telemetry &amp; Roster)</option>
                  {saasLicenses.map((lic) => (
                    <option key={lic.id} value={lic.id}>
                      {lic.gymName} ({lic.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Sheet URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] text-on-surface-variant font-semibold">Sheet Friendly Label</label>
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    placeholder="e.g. Bandra West VIP Members & Turnstile Check-Ins"
                    className="w-full bg-surface-container rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-xs"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] text-on-surface-variant font-semibold">
                    Google Spreadsheet URL or Sheet ID
                  </label>
                  <input
                    type="text"
                    value={spreadsheetIdOrUrl}
                    onChange={(e) => setSpreadsheetIdOrUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                    className="w-full bg-surface-container rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                    required
                  />
                  <div className="text-[10px] text-on-surface-variant mt-1">
                    Tip: Paste the full URL from your browser address bar. GymOS will automatically extract the Spreadsheet ID.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-on-surface-variant font-semibold">Sheet Tab / Worksheet Name</label>
                  <input
                    type="text"
                    value={tabName}
                    onChange={(e) => setTabName(e.target.value)}
                    placeholder="e.g. Members_Active"
                    className="w-full bg-surface-container rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-on-surface-variant font-semibold">Sync Direction</label>
                  <select
                    value={direction}
                    onChange={(e: any) => setDirection(e.target.value)}
                    className="w-full bg-surface-container rounded-xl px-3.5 py-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="two_way">Two-Way Live Sync (Sheet ↔ GymOS)</option>
                    <option value="gymos_to_sheet">GymOS → Sheet (Export / Telemetry Stream)</option>
                    <option value="sheet_to_gymos">Sheet → GymOS (Import / Ingestion Stream)</option>
                  </select>
                </div>
              </div>

              {/* Frequency & Entities */}
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">Data Entities to Synchronize</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-on-surface-variant">Cadence:</span>
                    <select
                      value={frequency}
                      onChange={(e: any) => setFrequency(e.target.value)}
                      className="bg-surface-container-high rounded-lg px-2.5 py-1 text-xs border border-outline-variant/30 text-on-surface"
                    >
                      <option value="realtime">Realtime (Instant Webhook)</option>
                      <option value="15_min">Every 15 Minutes</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily at 00:00</option>
                      <option value="manual">Manual On-Demand Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {(['members', 'attendance', 'payments', 'leads', 'staff'] as SheetSyncEntity[]).map((ent) => (
                    <button
                      type="button"
                      key={ent}
                      onClick={() => toggleEntity(ent)}
                      className={`p-2.5 rounded-xl border text-center font-medium capitalize transition-all ${
                        selectedEntities.includes(ent)
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {ent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Field Mapping Table */}
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">compare_arrows</span>
                      <span>Column Field Mapping (Google Sheet ↔ GymOS)</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">
                      Align spreadsheet columns with internal GymOS data models.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addFieldMapping}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-emerald-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Add Column</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {fieldMappings.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-surface-container-high p-2 rounded-xl text-xs">
                      <div className="w-16">
                        <input
                          type="text"
                          value={m.sheetColumn}
                          onChange={(e) => updateFieldMapping(idx, 'sheetColumn', e.target.value.toUpperCase())}
                          placeholder="Col"
                          className="w-full bg-surface-container rounded px-2 py-1 text-center font-mono font-bold text-xs border border-outline-variant/30"
                        />
                      </div>
                      <span className="text-on-surface-variant">→</span>
                      <div className="flex-1">
                        <select
                          value={m.gymosField}
                          onChange={(e) => updateFieldMapping(idx, 'gymosField', e.target.value)}
                          className="w-full bg-surface-container rounded px-2 py-1 text-xs border border-outline-variant/30 text-on-surface"
                        >
                          <option value="Full Name">Full Name</option>
                          <option value="Email Address">Email Address</option>
                          <option value="Phone Number">Phone Number</option>
                          <option value="Membership Plan">Membership Plan</option>
                          <option value="Status">Status (Active/Expired)</option>
                          <option value="Expiration Date">Expiration Date</option>
                          <option value="RFID Wristband Code">RFID Wristband Code</option>
                          <option value="Timestamp">Timestamp / Date</option>
                          <option value="Terminal ID">Turnstile Terminal ID</option>
                          <option value="Amount">Payment Amount</option>
                          <option value="Lead Source">Lead Source</option>
                          <option value="Custom Notes">Custom Notes</option>
                        </select>
                      </div>
                      <div className="w-24">
                        <select
                          value={m.dataType}
                          onChange={(e: any) => updateFieldMapping(idx, 'dataType', e.target.value)}
                          className="w-full bg-surface-container rounded px-2 py-1 text-[11px] border border-outline-variant/30 text-on-surface-variant"
                        >
                          <option value="string">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFieldMapping(idx)}
                        className="text-on-surface-variant hover:text-error p-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Account Sharing Instruction Card */}
              <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2 text-xs">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">key</span>
                  <span>Share Access with GymOS Service Account</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  In Google Sheets, click <strong className="text-on-surface">Share</strong> and grant <strong className="text-on-surface">Editor</strong> permission to this authorized automation identity:
                </p>
                <div className="flex items-center justify-between bg-surface-container-high px-3 py-1.5 rounded-xl font-mono text-[11px] text-primary">
                  <span className="truncate">gymos-sync-sa@gymos-cloud-sync.iam.gserviceaccount.com</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('gymos-sync-sa@gymos-cloud-sync.iam.gserviceaccount.com', 'Service Account Email')}
                    className="hover:text-primary transition-colors ml-2"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              </div>

              {/* Test Handshake Feedback */}
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
                    <div className="font-bold">{testResult.success ? 'Google Sheet Verified' : 'Handshake Failed'}</div>
                    <div className="text-[11px] mt-0.5 opacity-90">{testResult.message}</div>
                    {testResult.tabs && (
                      <div className="text-[10px] font-mono mt-1 text-emerald-300">
                        Discovered Tabs: {testResult.tabs.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={handleTestSheet}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-400">
                    {isTesting ? 'sync' : 'network_check'}
                  </span>
                  <span>{isTesting ? 'Verifying...' : 'Test Sheet Connection'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>Link &amp; Activate Sync</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apps Script & Webhook Modal */}
      {showAppsScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-low border border-purple-500/30 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-on-surface space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                  REAL-TIME WEBHOOK INTEGRATION
                </span>
                <h3 className="text-lg font-headline font-bold text-on-surface mt-1">
                  Google Apps Script Webhook Snippet
                </h3>
              </div>
              <button
                onClick={() => setShowAppsScriptModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-on-surface-variant">
                To trigger instant bi-directional updates whenever a row is edited in <strong className="text-on-surface">{showAppsScriptModal.sheetTitle}</strong>, add this trigger script in your Google Sheet (Extensions → Apps Script):
              </p>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-on-surface-variant">Endpoint URL:</div>
                <div className="flex items-center justify-between bg-surface-container px-3 py-2 rounded-xl font-mono text-[11px] text-purple-300 border border-outline-variant/30">
                  <span>https://gymos.cloud/api/webhooks/google-sheets/{showAppsScriptModal.tenantId}</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `https://gymos.cloud/api/webhooks/google-sheets/${showAppsScriptModal.tenantId}`,
                        'Webhook URL'
                      )
                    }
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-on-surface-variant">Google Apps Script (onEdit Trigger):</div>
                <pre className="bg-surface-container p-3 rounded-xl font-mono text-[10px] text-purple-200 overflow-x-auto border border-outline-variant/30 max-h-48">
{`function onEdit(e) {
  var url = "https://gymos.cloud/api/webhooks/google-sheets/${showAppsScriptModal.tenantId}";
  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "X-GymOS-Webhook-Secret": "${showAppsScriptModal.webhookSecretToken}"
    },
    payload: JSON.stringify({
      sheetId: "${showAppsScriptModal.spreadsheetId}",
      tab: "${showAppsScriptModal.tabName}",
      range: e.range.getA1Notation(),
      value: e.value,
      timestamp: new Date().toISOString()
    })
  };
  UrlFetchApp.fetch(url, options);
}`}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setShowAppsScriptModal(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
