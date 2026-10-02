import React, { useState, useEffect, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { AT_RISK_MEMBERS } from '../data/mockData';
import { AsyncDataState } from '../components/AsyncDataState';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  pullMemberDataFromSheets,
  pushMemberDataToSheets,
  syncMemberDataWithSheets,
  getSheetsGrowthTrends,
  SheetGrowthTelemetry,
} from '../services/sheetsService';

export const ReportsAnalyticsView: React.FC = () => {
  const { showToast, setActiveScreen } = useGym();
  const [forecastPeriod, setForecastPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [atRiskList, setAtRiskList] = useState(AT_RISK_MEMBERS);
  const [searchRiskQuery, setSearchRiskQuery] = useState('');

  // Google Sheets Integration & Growth Trends State
  const [growthData, setGrowthData] = useState<SheetGrowthTelemetry | null>(null);
  const [isLoadingSheetsData, setIsLoadingSheetsData] = useState<boolean>(true);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<'growth' | 'signups_churn' | 'revenue' | 'tiers'>('growth');
  const [timeFilter, setTimeFilter] = useState<'6m' | '12m' | 'all'>('12m');
  const [showSyncAuditLog, setShowSyncAuditLog] = useState<boolean>(false);
  const [syncedAuditLogs, setSyncedAuditLogs] = useState<Array<{
    id: string;
    action: 'PULL' | 'PUSH' | 'SYNC';
    memberName: string;
    details: string;
    timestamp: string;
    status: 'Success' | 'Queued';
  }>>([
    { id: 'log-1', action: 'PULL', memberName: 'Priya Sharma (VIP Annual)', details: 'Roster row imported from Google Sheet tab "Members_Active"', timestamp: '2 mins ago', status: 'Success' },
    { id: 'log-2', action: 'PULL', memberName: 'Kavita Menon (Gold Prime)', details: 'New registration ingested with RFID #RFID-7740', timestamp: '8 mins ago', status: 'Success' },
    { id: 'log-3', action: 'PUSH', memberName: '14 Active Member Updates', details: 'Database renewals & expiry dates exported to Sheet', timestamp: '24 mins ago', status: 'Success' },
    { id: 'log-4', action: 'SYNC', memberName: 'Master Roster Bi-Directional', details: '1,248 rows validated, 0 conflicts detected', timestamp: 'Today at 09:02 AM', status: 'Success' },
  ]);

  // Load Google Sheets growth telemetry on mount
  useEffect(() => {
    let isMounted = true;
    const loadTrends = async () => {
      setIsLoadingSheetsData(true);
      try {
        const data = await getSheetsGrowthTrends();
        if (isMounted) {
          setGrowthData(data);
        }
      } catch (err) {
        console.error('[ReportsAnalyticsView] Error fetching growth trends:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSheetsData(false);
        }
      }
    };
    loadTrends();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter trend data according to timeframe selection
  const filteredTrendPoints = useMemo(() => {
    if (!growthData?.trendPoints) return [];
    if (timeFilter === '6m') {
      return growthData.trendPoints.slice(-6);
    }
    if (timeFilter === '12m') {
      return growthData.trendPoints.slice(-12);
    }
    return growthData.trendPoints;
  }, [growthData, timeFilter]);

  // Pull member updates from Google Sheet into Gymify DB
  const handlePullFromSheets = async () => {
    setIsPulling(true);
    try {
      const result = await pullMemberDataFromSheets();
      if (result.updatedTrends) {
        setGrowthData(result.updatedTrends);
      } else {
        const refreshed = await getSheetsGrowthTrends();
        setGrowthData(refreshed);
      }
      setSyncedAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          action: 'PULL',
          memberName: `${result.importedCount || 3} New Sheet Members`,
          details: result.message,
          timestamp: 'Just now',
          status: 'Success',
        },
        ...prev,
      ]);
      showToast('Google Sheets Data Pulled', result.message, 'success');
    } catch (err: any) {
      showToast('Pull Failed', err.message || 'Could not pull updates from Google Sheet', 'error');
    } finally {
      setIsPulling(false);
    }
  };

  // Push member updates from Gymify DB to Google Sheet
  const handlePushToSheets = async () => {
    setIsPushing(true);
    try {
      const result = await pushMemberDataToSheets();
      const refreshed = await getSheetsGrowthTrends();
      setGrowthData(refreshed);
      setSyncedAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          action: 'PUSH',
          memberName: `${result.exportedCount || 12} Database Members`,
          details: result.message,
          timestamp: 'Just now',
          status: 'Success',
        },
        ...prev,
      ]);
      showToast('Database Updates Pushed', result.message, 'success');
    } catch (err: any) {
      showToast('Push Failed', err.message || 'Could not push member updates to Google Sheet', 'error');
    } finally {
      setIsPushing(false);
    }
  };

  // Two-Way Sync
  const handleFullTwoWaySync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncMemberDataWithSheets();
      const refreshed = await getSheetsGrowthTrends();
      setGrowthData(refreshed);
      setSyncedAuditLogs(prev => [
        {
          id: `log-${Date.now()}`,
          action: 'SYNC',
          memberName: 'Two-Way Master Sync',
          details: result.message,
          timestamp: 'Just now',
          status: 'Success',
        },
        ...prev,
      ]);
      showToast('Google Sheets Synced', result.message, 'success');
    } catch (err: any) {
      showToast('Sync Failed', err.message || 'Two-way sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredAtRisk = atRiskList.filter((m) =>
    m.name.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
    m.activePlan.toLowerCase().includes(searchRiskQuery.toLowerCase())
  );

  const forecastData = {
    monthly: {
      memberships: '₹42,50,000',
      pt: '₹14,20,000',
      merch: '₹4,80,000',
      mGrowth: '+14%',
      ptGrowth: '+8%',
      merchGrowth: '+22%',
      mBar: 78,
      ptBar: 62,
      merchBar: 45
    },
    quarterly: {
      memberships: '₹1,27,50,000',
      pt: '₹42,60,000',
      merch: '₹14,40,000',
      mGrowth: '+18%',
      ptGrowth: '+11%',
      merchGrowth: '+29%',
      mBar: 84,
      ptBar: 68,
      merchBar: 52
    },
    yearly: {
      memberships: '₹5,10,00,000',
      pt: '₹1,70,40,000',
      merch: '₹57,60,000',
      mGrowth: '+24%',
      ptGrowth: '+16%',
      merchGrowth: '+35%',
      mBar: 92,
      ptBar: 75,
      merchBar: 60
    }
  };

  const currentForecast = forecastData[forecastPeriod];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Consolidated Function: Analytics & Reports Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              FUNCTION: ANALYTICS &amp; REPORTS
            </div>
            <div className="text-xs font-semibold text-on-surface">
              Retention Intelligence, Predictive Churn &amp; Revenue BI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/20 overflow-x-auto">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">dashboard</span>
            <span>Executive Telemetry</span>
          </button>
          <button
            onClick={() => setActiveScreen('reports')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">bar_chart</span>
            <span>BI Reports &amp; Exports</span>
          </button>
        </div>
      </div>

      {/* Header & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Advanced Analytics &amp; Retention Intelligence
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Predictive churn scoring, cohort retention curves, branch performance benchmarking, and revenue forecasting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/30 text-xs">
            <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
            <span className="font-semibold text-on-surface">Last 30 Days</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
          </div>

          <button
            onClick={() => showToast('Report Exported', 'Comprehensive Q4 Retention Intelligence PDF generated.', 'success')}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <AsyncDataState entityName="Retention Intelligence">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Overall Retention Rate</span>
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">94.2%</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold font-mono">+1.8%</span>
            <span className="text-[11px] text-on-surface-variant">vs industry benchmark</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Predicted Churn Risk</span>
              <span className="material-symbols-outlined text-error text-[18px]">warning</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">3.4%</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold font-mono">42 flagged</span>
            <span className="text-[11px] text-on-surface-variant">Next 30 days</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Avg. Customer LTV</span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">trending_up</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">₹48,500</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold font-mono">+12% YoY</span>
            <span className="text-[11px] text-on-surface-variant">Lifetime value</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">MRR Growth</span>
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">₹18,50,000</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold font-mono">+8.4% MoM</span>
            <span className="text-[11px] text-on-surface-variant">Recurring revenue</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations Widget */}
      <div className="bg-surface-container-high rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden border border-outline-variant/30">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
          </div>
          <div>
            <h3 className="text-base font-headline font-bold text-on-surface">
              AI Retention Intelligence Alert
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              38 members on VIP Annual memberships have skipped workouts for &gt; 10 days. Automated re-engagement campaign recommended to prevent potential churn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => showToast('Cohort Selected', 'Filtered 38 inactive VIP members in table below.', 'info')}
            className="bg-surface-container px-4 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            Review Members
          </button>
          <button
            onClick={() => showToast('Campaign Deployed!', 'Automated SMS & WhatsApp workout reminders sent to 38 members.', 'success')}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            Deploy Campaign
          </button>
        </div>
      </div>

      {/* Google Sheets Live Telemetry & Growth Trends Data Visualization Section */}
      <div className="bg-surface-container rounded-2xl p-5 md:p-6 border border-outline-variant/30 space-y-6 relative overflow-hidden shadow-sm">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Section Header & Bi-Directional Sync Action Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-outline-variant/20 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-emerald-500 text-[26px]">table_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Google Sheets Live Sync
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  Endpoint: <code className="bg-surface-container-high px-1.5 py-0.5 rounded text-primary">/api/integrations/sheets</code>
                </span>
              </div>
              <h2 className="text-xl font-headline font-bold text-on-surface mt-1 tracking-tight">
                Member Growth Trends &amp; Sheets Bi-Directional Sync
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5 max-w-2xl leading-relaxed">
                Visualizing growth trends derived from data synchronized with Google Sheets master rosters. Pull incoming registrations into the GymOS database or push database updates back to Google Sheets.
              </p>
            </div>
          </div>

          {/* Sync Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Pull Button */}
            <button
              onClick={handlePullFromSheets}
              disabled={isPulling || isPushing || isSyncing}
              className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50 text-on-surface px-3.5 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 transition-all shadow-sm"
              title="Pull new member rows from Google Sheet into GymOS Database"
            >
              <span className={`material-symbols-outlined text-emerald-500 text-[18px] ${isPulling ? 'animate-spin' : ''}`}>
                {isPulling ? 'progress_activity' : 'cloud_download'}
              </span>
              <span>{isPulling ? 'Pulling...' : 'Pull from Sheets'}</span>
            </button>

            {/* Push Button */}
            <button
              onClick={handlePushToSheets}
              disabled={isPulling || isPushing || isSyncing}
              className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-50 text-on-surface px-3.5 py-2 rounded-xl text-xs font-semibold border border-outline-variant/30 transition-all shadow-sm"
              title="Push recent database member updates to Google Sheet tab"
            >
              <span className={`material-symbols-outlined text-primary text-[18px] ${isPushing ? 'animate-spin' : ''}`}>
                {isPushing ? 'progress_activity' : 'cloud_upload'}
              </span>
              <span>{isPushing ? 'Pushing...' : 'Push to Sheets'}</span>
            </button>

            {/* Full Two-Way Sync Button */}
            <button
              onClick={handleFullTwoWaySync}
              disabled={isPulling || isPushing || isSyncing}
              className="flex items-center gap-1.5 bg-primary hover:opacity-90 disabled:opacity-50 text-on-primary px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
              title="Execute full two-way synchronization"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Syncing...' : 'Two-Way Sync'}</span>
            </button>

            {/* View Sheet in Google Docs */}
            <a
              href={growthData?.sheetUrl || 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-colors"
              title="Open Google Spreadsheet in new tab"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Connected Sheet Information Bar */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-on-surface">
              {growthData?.sheetTitle || 'Apex VIP & Active Members Master Roster'}
            </span>
            <span className="text-on-surface-variant">• Tab: <code className="bg-surface-container px-1.5 py-0.5 rounded font-mono text-[11px] text-primary">{growthData?.tabName || 'Members_Active'}</code></span>
          </div>

          <div className="flex items-center gap-4 text-on-surface-variant font-mono text-[11px]">
            <span>Last Synced: <strong className="text-on-surface font-semibold">{growthData?.lastSyncedAt || 'Just now'}</strong></span>
            <span>Synced Rows: <strong className="text-emerald-500 font-bold">{growthData?.syncedRowsCount?.toLocaleString() || '1,248'}</strong></span>
            <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">Conflict-Free (0 Error)</strong></span>
          </div>
        </div>

        {/* Telemetry Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Total Synced Members</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1">
              {growthData?.totalMembers?.toLocaleString() || '1,248'}
            </div>
            <div className="text-[10px] text-emerald-500 font-mono font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              <span>+{growthData?.momGrowthPct || 8.6}% MoM Growth</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Sheet Inflow (Current)</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1">
              +{growthData?.newMembersFromSheetsThisMonth || 112}
            </div>
            <div className="text-[10px] text-primary font-mono font-semibold mt-1">
              Direct Sheets Ingestion
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Cohort Retention</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1">
              {growthData?.retentionRatePct || 94.2}%
            </div>
            <div className="text-[10px] text-emerald-500 font-mono font-semibold mt-1">
              High Roster Stability
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Sync Integrity</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1 text-emerald-500">
              100%
            </div>
            <div className="text-[10px] text-on-surface-variant font-mono mt-1">
              SHA-256 Row Hashed
            </div>
          </div>
        </div>

        {/* Interactive Recharts Visualization Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Chart View Tabs */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveChartTab('growth')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeChartTab === 'growth'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Cumulative Growth (MoM)
            </button>
            <button
              onClick={() => setActiveChartTab('signups_churn')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeChartTab === 'signups_churn'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sheet Inflow vs Churn
            </button>
            <button
              onClick={() => setActiveChartTab('revenue')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeChartTab === 'revenue'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              MRR Growth (₹)
            </button>
            <button
              onClick={() => setActiveChartTab('tiers')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeChartTab === 'tiers'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Tier Breakdown
            </button>
          </div>

          {/* Timeframe & Audit Log Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 text-xs">
              {(['6m', '12m', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[11px] font-mono font-bold transition-all ${
                    timeFilter === period
                      ? 'bg-surface-container-highest text-on-surface shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSyncAuditLog((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showSyncAuditLog
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-surface-container-low border-outline-variant/20 text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Sync Audit</span>
            </button>
          </div>
        </div>

        {/* The Recharts Data Visualization Canvas */}
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
          {isLoadingSheetsData ? (
            <div className="h-80 flex flex-col items-center justify-center gap-2 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
              <span>Connecting to Google Sheets API and calculating growth trends...</span>
            </div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height={320}>
                {activeChartTab === 'growth' ? (
                  <AreaChart data={filteredTrendPoints} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="growthIngest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/40 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                              <div className="font-semibold text-on-surface flex items-center justify-between border-b border-outline-variant/30 pb-1">
                                <span>{label}</span>
                                <span className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                  Sheets Synced
                                </span>
                              </div>
                              {payload.map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                                  <span className="text-on-surface-variant flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                    {entry.name}:
                                  </span>
                                  <span className="font-mono font-bold text-on-surface">
                                    {entry.value?.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="totalMembers"
                      name="Total Synced Members"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#growthTotal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="activeRetained"
                      name="Active Retained Base"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#growthIngest)"
                    />
                  </AreaChart>
                ) : activeChartTab === 'signups_churn' ? (
                  <BarChart data={filteredTrendPoints} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/40 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                              <div className="font-semibold text-on-surface border-b border-outline-variant/30 pb-1 flex items-center justify-between">
                                <span>{label}</span>
                                <span className="text-[10px] text-primary font-mono">Google Sheets Stream</span>
                              </div>
                              {payload.map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                                  <span className="text-on-surface-variant flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                    {entry.name}:
                                  </span>
                                  <span className="font-mono font-bold text-on-surface">
                                    {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="sheetsImported" name="New Joiners (Imported from Sheet)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churnedMembers" name="Churned / Inactive" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : activeChartTab === 'revenue' ? (
                  <AreaChart data={filteredTrendPoints} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="rgba(128, 128, 128, 0.6)"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/40 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                              <div className="font-semibold text-on-surface border-b border-outline-variant/30 pb-1 flex items-center justify-between">
                                <span>{label}</span>
                                <span className="text-[10px] text-purple-400 font-mono">Synced MRR</span>
                              </div>
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <span className="text-on-surface-variant">Monthly Recurring:</span>
                                <span className="font-mono font-bold text-on-surface text-emerald-400">
                                  ₹{payload[0]?.value?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mrrRevenue"
                      name="Recurring Revenue (₹ INR)"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#growthRev)"
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={growthData?.planBreakdown || []}
                    layout="vertical"
                    margin={{ top: 10, right: 25, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                    <YAxis dataKey="plan" type="category" stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} width={150} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/40 shadow-xl text-xs space-y-1">
                              <div className="font-semibold text-on-surface">{item.plan}</div>
                              <div className="text-on-surface-variant font-mono">Members: <strong>{item.count}</strong> ({item.percentage}%)</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" name="Enrolled Members" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expandable Synced Member Audit Log Drawer */}
        {showSyncAuditLog && (
          <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/25 space-y-3 transition-all animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                <h4 className="text-xs font-semibold text-on-surface">Recent Google Sheets Synced Events &amp; Database Mutations</h4>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">Live Audit Trail</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[10px] uppercase font-mono text-on-surface-variant tracking-wider">
                    <th className="py-2 px-3">Direction</th>
                    <th className="py-2 px-3">Member / Event</th>
                    <th className="py-2 px-3">Mutation Details</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                  {syncedAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-container/40">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          log.action === 'PULL'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : log.action === 'PUSH'
                            ? 'bg-primary/15 text-primary'
                            : 'bg-purple-500/15 text-purple-400'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {log.action === 'PULL' ? 'arrow_downward' : log.action === 'PUSH' ? 'arrow_upward' : 'sync'}
                          </span>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{log.memberName}</td>
                      <td className="py-2.5 px-3 text-on-surface-variant text-[11px]">{log.details}</td>
                      <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{log.timestamp}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          {log?.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Churn Risk Matrix / At-Risk Members Table */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">At-Risk Members Matrix</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Identified via visit frequency drops, expiring contracts, and skipped PT sessions.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              value={searchRiskQuery}
              onChange={(e) => setSearchRiskQuery(e.target.value)}
              className="w-full bg-surface-container-low pl-9 pr-4 py-2 rounded-xl text-on-surface text-xs placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
              placeholder="Search at-risk members..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                <th className="py-3 px-4 font-semibold">Member Name &amp; ID</th>
                <th className="py-3 px-4 font-semibold">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Last Visit</th>
                <th className="py-3 px-4 font-semibold">Active Plan</th>
                <th className="py-3 px-4 font-semibold">Primary Risk Factor</th>
                <th className="py-3 px-4 font-semibold text-right">Quick Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
              {filteredAtRisk.map((member) => (
                <tr key={member.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface text-xs">
                      {member.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-[11px] text-on-surface-variant font-mono">{member.code}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        member.riskType === 'high' ? 'bg-error/15 text-error' : 'bg-tertiary/15 text-tertiary'
                      }`}
                    >
                      {member.riskScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{member.lastVisit}</td>
                  <td className="py-3.5 px-4">{member.activePlan}</td>
                  <td className={`py-3.5 px-4 font-medium ${member.riskType === 'high' ? 'text-error' : 'text-tertiary'}`}>
                    {member.riskFactor}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => showToast('Intervention Initiated', `Dispatched SMS to ${member.name}`, 'success')}
                        className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[10px] font-semibold hover:opacity-90"
                      >
                        Intervene
                      </button>
                      <button
                        onClick={() => showToast('Trainer Assigned', `Dedicated coach assigned to re-engage ${member.name}`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-surface-variant text-on-surface text-[10px] font-medium hover:bg-surface-container-highest"
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid for Cohort Retention & Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Retention Curve */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-headline font-bold text-on-surface">Cohort Retention Curve</h2>
              <span className="text-[11px] text-on-surface-variant font-mono">12-Month Heatmap</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">
              Month-over-month retention tracking across recent member acquisition cohorts.
            </p>
          </div>

          {/* Simulated Heatmap */}
          <div className="space-y-2.5">
            {[
              { name: 'Q1 Cohort', scores: ['100%', '92%', '88%', '85%', '82%', '80%'] },
              { name: 'Q2 Cohort', scores: ['100%', '95%', '90%', '87%', '84%', '-'] },
              { name: 'Q3 Cohort', scores: ['100%', '96%', '91%', '89%', '-', '-'] },
              { name: 'Q4 Cohort', scores: ['100%', '97%', '-', '-', '-', '-'] }
            ].map((cohort) => (
              <div key={cohort.name} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-20 font-medium text-[11px] shrink-0">{cohort.name}</span>
                <div className="flex-1 grid grid-cols-6 gap-1.5 font-mono">
                  {cohort.scores.map((sc, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        sc === '-'
                          ? 'bg-surface-variant text-on-surface-variant/40'
                          : 'bg-primary/80 text-on-primary'
                      }`}
                    >
                      {sc}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Performance Benchmarking */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-headline font-bold text-on-surface">Branch Benchmarking</h2>
              <span className="text-[11px] text-primary font-bold">Live Data</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">Comparative performance metrics across club locations.</p>
          </div>

          <div className="space-y-3">
            {[
              { code: 'IN', name: 'Indiranagar Flagship', util: '88%', churn: '2.8%', rev: '₹18,50,000', growth: '+12.4% MoM' },
              { code: 'KM', name: 'Koramangala Club', util: '74%', churn: '4.1%', rev: '₹12,90,000', growth: '+4.1% MoM' },
              { code: 'BKC', name: 'BKC Executive Arena', util: '92%', churn: '1.9%', rev: '₹24,80,000', growth: '+15.8% MoM' }
            ].map((br) => (
              <div key={br.code} className="bg-surface p-3.5 rounded-xl flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs font-mono">
                    {br.code}
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface text-xs">{br.name}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      Utilization: {br.util} • Churn: {br.churn}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-headline font-bold text-on-surface text-sm font-mono">{br.rev}</div>
                  <div className="text-[11px] text-primary font-semibold">{br.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Stream Breakdown & Forecasting */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">
              Revenue Stream Breakdown &amp; Forecasting
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Projected income across memberships, personal training, and merchandise.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-outline-variant/30 text-xs">
            {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setForecastPeriod(period)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  forecastPeriod === period ? 'bg-surface-container text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-surface p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Memberships (Recurring)</div>
              <div className="text-2xl font-headline font-bold text-on-surface font-mono mt-1">
                {currentForecast.memberships}
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Forecasted Term</span>
                <span className="text-primary font-semibold font-mono">{currentForecast.mGrowth}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${currentForecast.mBar}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Personal Training Packages</div>
              <div className="text-2xl font-headline font-bold text-on-surface font-mono mt-1">
                {currentForecast.pt}
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Forecasted Term</span>
                <span className="text-primary font-semibold font-mono">{currentForecast.ptGrowth}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full transition-all duration-500" style={{ width: `${currentForecast.ptBar}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Merchandise &amp; Supplements</div>
              <div className="text-2xl font-headline font-bold text-on-surface font-mono mt-1">
                {currentForecast.merch}
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Forecasted Term</span>
                <span className="text-primary font-semibold font-mono">{currentForecast.merchGrowth}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${currentForecast.merchBar}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AsyncDataState>
    </div>
  );
};
