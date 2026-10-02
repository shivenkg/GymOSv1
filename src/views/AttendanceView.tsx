import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { AsyncDataState } from '../components/AsyncDataState';
import { BiometricAttendanceScanner } from '../components/BiometricAttendanceScanner';

export const AttendanceView: React.FC = () => {
  const {
    liveOccupancy,
    maxCapacity,
    checkInLogs,
    simulateScan,
    lastScannedMember,
    isTerminalLocked,
    toggleTerminalLock,
    setActiveScreen,
    members,
    checkInMember,
    showToast,
  } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [quickCheckinSearch, setQuickCheckinSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Allowed' | 'Access Denied'>('All');
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [localCheckedInIds, setLocalCheckedInIds] = useState<Record<string, boolean>>({});
  const [terminalMode, setTerminalMode] = useState<'biometric' | 'qr'>('biometric');

  const handleSimulateScan = () => {
    setIsScanningActive(true);
    simulateScan();
    setTimeout(() => {
      setIsScanningActive(false);
    }, 600);
  };

  const handleQuickCheckIn = async (memberId: string, memberName: string) => {
    const isCurrentlyIn = !!localCheckedInIds[memberId];
    if (isCurrentlyIn) {
      setLocalCheckedInIds(prev => ({ ...prev, [memberId]: false }));
      showToast('Checked Out', `${memberName} logged as leaving facility.`, 'info');
      return;
    }

    const success = await checkInMember(memberId, 'Manual Entry');
    if (success) {
      setLocalCheckedInIds(prev => ({ ...prev, [memberId]: true }));
    }
  };

  const handleExportCSV = () => {
    const headers = ['MEMBER', 'CODE', 'PLAN', 'TIME', 'METHOD', 'STATUS', 'TERMINAL'];
    const rows = filteredLogs.map(l => [
      `"${l.memberName}"`,
      l.memberCode,
      `"${l.plan}"`,
      `"${l.timeFormatted}"`,
      l.method,
      l.status,
      l.terminal
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance Exported', `Generated CSV with ${filteredLogs.length} records.`, 'success');
  };

  // Quick check-in candidate members
  const quickCheckinCandidates = members.filter(m => {
    if (!quickCheckinSearch.trim()) return true;
    const q = quickCheckinSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.memberCode.toLowerCase().includes(q) || m.plan.toLowerCase().includes(q);
  }).slice(0, 8);

  const todayCount = checkInLogs.filter(l => l && l.status === 'Allowed').length;

  const filteredLogs = checkInLogs.filter((log) => {
    if (!log) return false;
    const matchesSearch =
      (log.memberName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.memberCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.plan || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Allowed' && log.status === 'Allowed') ||
      (filterStatus === 'Access Denied' && (log.status === 'Access Denied' || log.status === 'Expired'));

    return matchesSearch && matchesStatus;
  });

  const occupancyPercent = Math.round((liveOccupancy / maxCapacity) * 100);
  const strokeDashoffset = 251.2 - (251.2 * occupancyPercent) / 100;

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Consolidated Function: Operation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              FUNCTION: OPERATION
            </div>
            <div className="text-xs font-semibold text-on-surface">
              Floor Access &amp; Turnstile Hardware Control
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/20 overflow-x-auto">
          <button
            onClick={() => setActiveScreen('attendance')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
            <span>Floor &amp; Gates</span>
          </button>
          <button
            onClick={() => setActiveScreen('members')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">group</span>
            <span>Member Directory</span>
          </button>
          <button
            onClick={() => setActiveScreen('classes-pt')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">event_available</span>
            <span>Classes &amp; PT</span>
          </button>
        </div>
      </div>

      {/* Main Title & Action Bar matching Image 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Attendance</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Check members in and review visit history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setTerminalMode(prev => prev === 'biometric' ? 'qr' : 'biometric')}
            className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              terminalMode === 'biometric'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/25 shadow-cyan-500/10'
                : 'bg-primary/15 border-primary/40 text-primary hover:bg-primary/25'
            }`}
            title="Toggle between Live Device Camera Biometrics and Simulated QR Terminal"
          >
            <span className="material-symbols-outlined text-[17px]">
              {terminalMode === 'biometric' ? 'face' : 'qr_code_scanner'}
            </span>
            <span>{terminalMode === 'biometric' ? 'Device Camera Face-ID' : 'QR Scanner Mode'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-xs font-semibold text-on-surface transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards matching Image 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">
            {todayCount > 0 ? todayCount : liveOccupancy}
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1 font-medium">Today</div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">67</div>
          <div className="text-[11px] text-on-surface-variant mt-1 font-medium">Last 7 days</div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">98</div>
          <div className="text-[11px] text-on-surface-variant mt-1 font-medium">Jul 2026</div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
          <div className="text-2xl sm:text-3xl font-bold font-mono text-on-surface">5.3</div>
          <div className="text-[11px] text-on-surface-variant mt-1 font-medium">Avg / day (30d)</div>
        </div>
      </div>

      {/* Front Desk — Quick Check-in matching Image 3 */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-500">check_circle</span>
            <h2 className="text-base font-headline font-bold text-on-surface">Front desk — quick check-in</h2>
          </div>

          <div className="relative min-w-[220px] max-w-xs">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
              search
            </span>
            <input
              type="text"
              value={quickCheckinSearch}
              onChange={(e) => setQuickCheckinSearch(e.target.value)}
              placeholder="Search member to check in..."
              className="w-full bg-surface-container-low pl-8 pr-3 py-1.5 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Member Check-in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickCheckinCandidates.map((member) => {
            const isCheckedIn = !!localCheckedInIds[member.id];
            const initials = member.name.split(' ').map(n => n[0]).join('');
            const isExpiring = member.status === 'pending' || member.status === 'expired';

            return (
              <div
                key={member.id}
                className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex items-center justify-between gap-3 text-xs hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                    {initials}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-on-surface truncate">{member.name}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono flex items-center gap-1.5">
                      <span>{member.memberCode}</span>
                      <span>•</span>
                      <span className={`${
                        member.status === 'active' ? 'text-emerald-500' :
                        member.status === 'frozen' ? 'text-blue-500' : 'text-amber-500'
                      }`}>
                        {member.status === 'active' ? 'Active' : member.status === 'frozen' ? 'Frozen' : 'Expiring Soon'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickCheckIn(member.id, member.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isCheckedIn
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-primary text-on-primary hover:opacity-90 shadow-sm shadow-primary/20'
                  }`}
                >
                  <span className="font-bold">✓</span>
                  <span>{isCheckedIn ? 'Inside' : 'In'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Section: Bento Grid layout for QR Scanner Terminal, Occupancy, and Quick Stats */}
      <AsyncDataState entityName="Attendance Telemetry">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Terminal (Biometric Face-ID vs QR Scanner) (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          {terminalMode === 'biometric' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>BIOMETRIC CAMERA ACTIVE</span>
                </span>
                <button
                  type="button"
                  onClick={() => setTerminalMode('qr')}
                  className="text-xs text-on-surface-variant hover:text-primary flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                  <span>Switch to QR Pass Mode</span>
                </button>
              </div>
              <BiometricAttendanceScanner />
            </div>
          ) : (
            <div className="bg-surface-container rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 h-full">
              {/* Decorative ambient glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isTerminalLocked ? 'bg-error' : 'bg-primary animate-pulse'
                      }`}
                    ></span>
                    <span className="text-lg font-headline font-bold text-on-surface">
                      Live Terminal #04 - Main Entrance
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTerminalMode('biometric')}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-cyan-500/30"
                    >
                      <span className="material-symbols-outlined text-[15px]">face</span>
                      <span>Switch to Face-ID</span>
                    </button>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isTerminalLocked ? 'bg-error/15 text-error' : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {isTerminalLocked ? 'TERMINAL LOCKED' : 'SYSTEM ACTIVE'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mb-5">
                  Position member smartphone QR code or RFID wristband approx. 15cm from lens for instant turnstile verification.
                </p>
              </div>

              {/* Simulated Camera Feed Box */}
              <div
                className={`relative w-full h-72 bg-surface-container-low rounded-2xl overflow-hidden flex items-center justify-center mb-5 group border ${
                  isScanningActive ? 'border-primary ring-2 ring-primary/40' : 'border-outline-variant/30'
                }`}
              >
                {/* Background Mock Camera View */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrIikuUxBYkm1nQqvJybui807YbSA_gPajB0oEvr2fQA_OM0OtjwHrO91MmzoTTnhYli_03-kyC-zqo5WTPW5AFfKzh14vMUpNabPayQG-Ke3ohF8QCnmnbslowKCTixO8G9cJqMkkq4WsQA99LMYQyervgGW1kfsGoGL__rLIcxiYCkSHXbxZmrEufHzC5mwd0nxYd8uP3xfgjryKdVHsGJe8vrMf3qbPAzVG5mIF3VSjvrSUvI3VEw')"
                  }}
                ></div>

                {/* Scanner Overlay Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#7dd3fc0d_1px,transparent_1px),linear-gradient(to_bottom,#7dd3fc0d_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Scanning Reticle */}
                <div
                  className={`relative w-48 h-48 border-2 rounded-xl flex items-center justify-center transition-all ${
                    isTerminalLocked
                      ? 'border-error/60'
                      : isScanningActive
                      ? 'border-primary scale-105 shadow-[0_0_30px_rgba(125,211,252,0.4)]'
                      : 'border-primary/60 animate-pulse'
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 ${
                      isTerminalLocked ? 'border-error' : 'border-primary'
                    }`}
                  ></div>
                  <div
                    className={`absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 ${
                      isTerminalLocked ? 'border-error' : 'border-primary'
                    }`}
                  ></div>
                  <div
                    className={`absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 ${
                      isTerminalLocked ? 'border-error' : 'border-primary'
                    }`}
                  ></div>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 ${
                      isTerminalLocked ? 'border-error' : 'border-primary'
                    }`}
                  ></div>

                  {!isTerminalLocked && (
                    <div className="w-full h-0.5 bg-primary shadow-[0_0_12px_#7dd3fc] absolute animate-bounce"></div>
                  )}

                  <span
                    className={`material-symbols-outlined text-[48px] ${
                      isTerminalLocked ? 'text-error opacity-60' : 'text-primary opacity-80'
                    }`}
                  >
                    {isTerminalLocked ? 'lock' : 'qr_code_scanner'}
                  </span>
                </div>

                {/* Floating Instant Verification Feedback Card */}
                {lastScannedMember && (
                  <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-3 rounded-xl flex items-center justify-between shadow-2xl border-l-4 border-primary border border-outline-variant/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline font-bold text-xs">
                        {lastScannedMember.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-on-surface">
                            {lastScannedMember.allowed ? 'Access Granted' : 'Access Denied'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              lastScannedMember.allowed ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'
                            }`}
                          >
                            {lastScannedMember.plan}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">
                          {lastScannedMember.name} • {lastScannedMember.timestamp}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-[28px] ${
                        lastScannedMember.allowed ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {lastScannedMember.allowed ? 'check_circle' : 'cancel'}
                    </span>
                  </div>
                )}
              </div>

              {/* Terminal Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSimulateScan}
                  disabled={isTerminalLocked}
                  className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-xl font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Simulate Next QR Scan</span>
                </button>
                <button
                  onClick={toggleTerminalLock}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 border border-outline-variant/40 ${
                    isTerminalLocked
                      ? 'bg-error/20 text-error hover:bg-error/30'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isTerminalLocked ? 'lock_open' : 'lock'}
                  </span>
                  <span>{isTerminalLocked ? 'Unlock Terminal' : 'Lock Terminal'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Occupancy Gauge & Peak Hour Metrics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Occupancy Gauge Card */}
          <div className="bg-surface-container rounded-2xl p-6 flex-1 flex flex-col justify-between border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  Real-Time Capacity
                </span>
                <h2 className="text-xl font-headline font-bold text-on-surface mt-1">Live Occupancy</h2>
              </div>
              <span className="px-3 py-1 bg-tertiary/15 text-tertiary rounded-full text-xs font-semibold">
                {occupancyPercent}% FULL
              </span>
            </div>

            {/* Gauge Visual */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Donut Chart */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-high"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="10"
                  ></circle>
                  <circle
                    className="text-primary transition-all duration-700 ease-out"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeDasharray="251.2"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="10"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-headline font-bold text-on-surface font-mono">
                    {liveOccupancy}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    / {maxCapacity} Max Capacity
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-container-high">
              <div>
                <span className="text-xs text-on-surface-variant">Peak Today</span>
                <p className="text-base font-headline font-semibold text-on-surface mt-0.5">186 members</p>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant">Avg. Stay Duration</span>
                <p className="text-base font-headline font-semibold text-on-surface mt-0.5">1h 14m</p>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Card */}
          <div className="bg-surface-container rounded-2xl p-5 flex items-center justify-between border border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[24px]">group_add</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant">Check-ins Today</span>
                <p className="text-xl font-headline font-bold text-on-surface font-mono">
                  {checkInLogs.length * 35 + liveOccupancy} Total Entries
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-primary text-xs font-bold flex items-center justify-end gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>+12%
              </span>
              <span className="text-[11px] text-on-surface-variant">vs. yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Live Real-Time Attendance Log Table */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface">Live Attendance Log</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Real-time stream of all check-ins across facility entry points.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter pills */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-xs">
              {(['All', 'Allowed', 'Access Denied'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filterStatus === st ? 'bg-primary text-on-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search filter input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-low text-on-surface pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-56 border border-outline-variant/30"
                placeholder="Search member or pass..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Membership Tier</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-xs text-on-surface">
              {filteredLogs.map((log) => {
                const initials = log.memberName
                  .split(' ')
                  .map((n) => n[0])
                  .join('');
                const isAllowed = log.status === 'Allowed';

                return (
                  <tr key={log.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-headline font-bold text-xs">
                        {initials}
                      </div>
                      <div>
                        <span className="font-semibold block text-on-surface">{log.memberName}</span>
                        <span className="text-[11px] text-on-surface-variant font-mono">{log.memberCode}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
                        {log.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono">{log.timeFormatted}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.method === 'Biometric Camera'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-surface-container-high text-on-surface'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {log.method === 'Biometric Camera' ? 'face' : log.method === 'QR Scanner' ? 'qr_code_scanner' : 'badge'}
                        </span>
                        <span>{log.method}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isAllowed ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isAllowed ? 'bg-primary' : 'bg-error'}`}
                        ></span>
                        {isAllowed ? 'Inside Facility' : log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => showToast('Attendance Details', `${log.memberName} authenticated via ${log.method} at ${log.terminal}`, 'info')}
                        className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                        title="View Log Details"
                      >
                        <span className="material-symbols-outlined text-[18px]">info</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-surface-container-high text-xs text-on-surface-variant">
          <span>
            Showing <span className="font-mono font-bold text-on-surface">{filteredLogs.length}</span> entries today
          </span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 bg-surface-container-high text-on-surface rounded-lg disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1 bg-primary text-on-primary rounded-lg font-bold">1</button>
            <button className="px-2.5 py-1 bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-bright">2</button>
            <button className="px-2.5 py-1 bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-bright">Next</button>
          </div>
        </div>
      </div>
      </AsyncDataState>
    </div>
  );
};
