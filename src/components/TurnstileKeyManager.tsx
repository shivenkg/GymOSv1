import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { HardwareTerminalKey } from '../types';

export const TurnstileKeyManager: React.FC = () => {
  const { saasLicenses, members, showToast } = useGym();

  const [keys, setKeys] = useState<HardwareTerminalKey[]>(() => {
    const saved = localStorage.getItem('gymos_hardware_terminal_keys');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'hw-key-001',
        name: 'Gate 1 - Main Entrance Turnstile (Optical QR)',
        terminalKey: 'gym_hw_live_7f8a9b2c3d4e5f601a2b3c4d5e6f7081',
        tenantId: 'lic-001',
        tenantName: 'Apex Fitness Club (Downtown)',
        terminalType: 'turnstile_qr',
        locationName: 'Downtown Flagship Club',
        gateIdentifier: 'gate-ingress-01',
        scopes: ['attendance:checkin', 'access:verify'],
        status: 'Active',
        createdAt: '2025-01-10',
        expiresAt: '2026-01-10',
        lastPingAt: 'Just now (12ms)',
        lastPingIp: '192.168.1.104',
        totalPings: 18452,
      },
      {
        id: 'hw-key-002',
        name: 'Gate 2 - VIP Biometric Fingerprint Turnstile',
        terminalKey: 'gym_hw_live_9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a41',
        tenantId: 'lic-001',
        tenantName: 'Apex Fitness Club (Downtown)',
        terminalType: 'biometric_fingerprint',
        locationName: 'Downtown Flagship Club',
        gateIdentifier: 'gate-ingress-02-vip',
        scopes: ['attendance:checkin', 'access:verify', 'emergency:unlock'],
        status: 'Active',
        createdAt: '2025-02-01',
        expiresAt: '2026-02-01',
        lastPingAt: '2 mins ago (18ms)',
        lastPingIp: '192.168.1.105',
        totalPings: 9410,
      },
      {
        id: 'hw-key-003',
        name: 'Gate 3 - Egress Exit Rotary Turnstile',
        terminalKey: 'gym_hw_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
        tenantId: 'lic-001',
        tenantName: 'Apex Fitness Club (Downtown)',
        terminalType: 'turnstile_rfid',
        locationName: 'Downtown Flagship Club',
        gateIdentifier: 'gate-egress-01',
        scopes: ['access:verify'],
        status: 'Active',
        createdAt: '2025-02-15',
        expiresAt: '2026-02-15',
        lastPingAt: '5 mins ago (14ms)',
        lastPingIp: '192.168.1.106',
        totalPings: 14200,
      },
      {
        id: 'hw-key-004',
        name: 'Gate 1 - Westside RFID Smart Access Gate',
        terminalKey: 'gym_hw_live_e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
        tenantId: 'lic-002',
        tenantName: 'IronCore Athletics',
        terminalType: 'turnstile_rfid',
        locationName: 'Bandra West Arena',
        gateIdentifier: 'gate-ingress-west-01',
        scopes: ['attendance:checkin', 'access:verify'],
        status: 'Active',
        createdAt: '2025-03-01',
        expiresAt: '2026-03-01',
        lastPingAt: '1 min ago (24ms)',
        lastPingIp: '10.0.4.12',
        totalPings: 6180,
      },
    ];
  });

  // Modal State for Generating New Key
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newTenantId, setNewTenantId] = useState(saasLicenses[0]?.id || 'lic-001');
  const [newTerminalType, setNewTerminalType] = useState<HardwareTerminalKey['terminalType']>('turnstile_qr');
  const [newGateId, setNewGateId] = useState('gate-ingress-03');
  const [newLocation, setNewLocation] = useState('Downtown Flagship Club');
  const [selectedScopes, setSelectedScopes] = useState<('attendance:checkin' | 'access:verify' | 'emergency:unlock')[]>([
    'attendance:checkin',
    'access:verify',
  ]);
  const [keyLifetime, setKeyLifetime] = useState<'90d' | '365d' | 'never'>('365d');

  // Interactive Simulator State
  const [simSelectedKeyId, setSimSelectedKeyId] = useState(keys[0]?.id || '');
  const [simMemberCode, setSimMemberCode] = useState('MEM-1001');
  const [simResult, setSimResult] = useState<{
    status: 'GRANTED' | 'GRACE_GRANTED' | 'DENIED' | 'REVOKED';
    memberName?: string;
    message: string;
    relayAction: string;
    timestamp: string;
  } | null>(null);

  const saveKeys = (updated: HardwareTerminalKey[]) => {
    setKeys(updated);
    try {
      localStorage.setItem('gymos_hardware_terminal_keys', JSON.stringify(updated));
    } catch {}
  };

  // Generate random token string
  const generateRandomKeyString = () => {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `gym_hw_live_${hex}`;
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = saasLicenses.find((l) => l.id === newTenantId);
    const tenantName = tenant ? tenant.gymName : 'Apex Fitness Club';

    let expiresAt = 'Permanent';
    if (keyLifetime === '90d') {
      expiresAt = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    } else if (keyLifetime === '365d') {
      expiresAt = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
    }

    const newKey: HardwareTerminalKey = {
      id: `hw-key-${Date.now()}`,
      name: newKeyName || 'Turnstile Access Terminal',
      terminalKey: generateRandomKeyString(),
      tenantId: newTenantId,
      tenantName,
      terminalType: newTerminalType,
      locationName: newLocation,
      gateIdentifier: newGateId,
      scopes: selectedScopes,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt,
      lastPingAt: 'Just provisioned (0ms)',
      lastPingIp: '192.168.1.100',
      totalPings: 0,
    };

    saveKeys([newKey, ...keys]);
    setShowCreateModal(false);
    showToast('Hardware Token Issued', `Generated revokable access token for ${newKey.name}.`, 'success');
  };

  // Toggle Revocation
  const handleToggleRevoke = (id: string) => {
    const updated = keys.map((k) => {
      if (k.id === id) {
        const nextStatus = k.status === 'Active' ? 'Revoked' : 'Active';
        showToast(
          nextStatus === 'Revoked' ? 'Terminal Key Revoked' : 'Terminal Key Re-armed',
          `Terminal ${k.gateIdentifier} is now ${(nextStatus || '').toUpperCase()}.`,
          nextStatus === 'Revoked' ? 'warning' : 'success'
        );
        return { ...k, status: nextStatus as 'Active' | 'Revoked' };
      }
      return k;
    });
    saveKeys(updated);
  };

  // Ping Terminal
  const handlePingTerminal = (k: HardwareTerminalKey) => {
    const lat = Math.floor(10 + Math.random() * 15);
    const updated = keys.map((item) => {
      if (item.id === k.id) {
        return {
          ...item,
          lastPingAt: `Just now (${lat}ms)`,
          totalPings: item.totalPings + 1,
        };
      }
      return item;
    });
    saveKeys(updated);
    showToast('Hardware Ping Verified', `${k.name} responded in ${lat}ms (Relay Armed)`, 'success');
  };

  // Copy helper
  const copyText = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    showToast('Copied to Clipboard', label, 'info');
  };

  // Simulate Turnstile Scan
  const handleSimulateScan = () => {
    const selectedKey = keys.find((k) => k.id === simSelectedKeyId);
    if (!selectedKey) return;

    if (selectedKey.status === 'Revoked') {
      setSimResult({
        status: 'REVOKED',
        message: 'Security Alert: Terminal Hardware Key has been REVOKED by SuperAdmin.',
        relayAction: 'RELAY LOCKED (Alarm Triggered)',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    const member = members.find(
      (m) =>
        m.memberCode.toLowerCase() === simMemberCode.toLowerCase() ||
        m.name.toLowerCase().includes(simMemberCode.toLowerCase())
    );

    if (!member) {
      setSimResult({
        status: 'DENIED',
        message: `Member code "${simMemberCode}" not found in tenant registry.`,
        relayAction: 'RELAY LOCKED (Red Strobe)',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    const expiryTime = member.expiryDate ? new Date(member.expiryDate).getTime() : Date.now();
    const daysLeft = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));

    if (member?.status === 'frozen') {
      setSimResult({
        status: 'DENIED',
        memberName: member.name,
        message: 'Account is FROZEN / PAUSED. Access barred by franchise desk.',
        relayAction: 'RELAY LOCKED (Buzzer Beep)',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    if (daysLeft < -7 || member?.status === 'expired') {
      setSimResult({
        status: 'DENIED',
        memberName: member.name,
        message: `Subscription EXPIRED on ${member.expiryDate}. Please renew membership.`,
        relayAction: 'RELAY LOCKED (Turnstile Barrier Closed)',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    if (daysLeft <= 0 && daysLeft >= -7) {
      setSimResult({
        status: 'GRACE_GRANTED',
        memberName: member.name,
        message: `GRACE PERIOD ACTIVE: ${7 - Math.abs(daysLeft)} days remaining before cutoff.`,
        relayAction: 'RELAY ENERGIZED: Solenoid Open for 3.5 Seconds (Yellow LED)',
        timestamp: new Date().toLocaleTimeString(),
      });
      return;
    }

    // Active
    setSimResult({
      status: 'GRANTED',
      memberName: member.name,
      message: `Verified: ${member.name} (${member.plan}) • ${daysLeft} days remaining.`,
      relayAction: 'RELAY ENERGIZED: Turnstile Rotary Unlocked (Green LED)',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const activeCount = keys.filter((k) => k.status === 'Active').length;
  const totalPings = keys.reduce((acc, k) => acc + k.totalPings, 0);

  return (
    <div className="space-y-6">
      {/* Header and KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">developer_board</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Registered Terminals</div>
            <div className="text-xl font-headline font-bold text-on-surface font-mono mt-0.5">{keys.length} Gates</div>
            <div className="text-[10px] text-tertiary">Turnstiles &amp; Biometrics</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">lock_open</span>
          </div>
          <div>
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Armed &amp; Authorized</span>
            </div>
            <div className="text-xl font-headline font-bold text-emerald-300 font-mono mt-0.5">{activeCount} Active Keys</div>
            <div className="text-[10px] text-on-surface-variant">Live Rotary Actuators</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">history</span>
          </div>
          <div>
            <div className="text-[11px] text-on-surface-variant font-medium">Telemetry Check-ins</div>
            <div className="text-xl font-headline font-bold text-on-surface font-mono mt-0.5">
              {totalPings.toLocaleString()} Pings
            </div>
            <div className="text-[10px] text-on-surface-variant">Turnstile Ingress/Egress</div>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-2xl border border-blue-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">network_check</span>
          </div>
          <div>
            <div className="text-[11px] text-blue-400 font-medium">Avg Heartbeat Ping</div>
            <div className="text-xl font-headline font-bold text-blue-300 font-mono mt-0.5">14ms Relay</div>
            <div className="text-[10px] text-on-surface-variant">Local LAN &amp; Cloud Gateway</div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                HARDWARE TERMINAL SECURITY
              </span>
              <span className="text-xs text-on-surface-variant font-mono">Turnstile Gate Authorizer</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Turnstile Hardware Terminal Key Manager
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
              Generate, monitor, and revoke dedicated hardware access keys for physical optical turnstiles, RFID turnstiles, biometric fingerprint pods, and facial recognition terminals across gym franchise locations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs flex items-center gap-2 shadow-lg shadow-primary/25 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Issue New Hardware Token</span>
            </button>
          </div>
        </div>

        {/* Hardware Keys Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-3">Terminal Gate / Type</th>
                <th className="py-3 px-3">Location &amp; Tenant</th>
                <th className="py-3 px-3">Hardware Access Token</th>
                <th className="py-3 px-3">Scopes &amp; Permissions</th>
                <th className="py-3 px-3">Telemetry / Latency</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-sans">
              {keys.map((k) => {
                const isActive = k.status === 'Active';
                return (
                  <tr key={k.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {k.terminalType === 'turnstile_qr'
                            ? 'qr_code_scanner'
                            : k.terminalType === 'biometric_fingerprint'
                            ? 'fingerprint'
                            : k.terminalType === 'facial_recognition_kiosk'
                            ? 'face'
                            : 'contactless'}
                        </span>
                        <span>{k.name}</span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                        ID: <code className="text-primary">{k.gateIdentifier}</code>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-on-surface">{k.locationName}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">{k.tenantName}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface">
                        <span className="truncate max-w-[170px]">{k.terminalKey}</span>
                        <button
                          onClick={() => copyText(k.terminalKey, 'Hardware Token')}
                          className="hover:text-primary transition-colors cursor-pointer"
                          title="Copy Hardware Token"
                        >
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        </button>
                      </div>
                      <div className="text-[9px] text-on-surface-variant mt-0.5">Expires: {k.expiresAt}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((sc) => (
                          <span
                            key={sc}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-container border border-outline-variant/40 text-on-surface-variant"
                          >
                            {sc.split(':')[1]}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <div className="text-primary font-semibold">{k.lastPingAt}</div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">
                        {k.totalPings.toLocaleString()} scans • IP {k.lastPingIp}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                        <span>{k.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePingTerminal(k)}
                          title="Send Hardware Test Ping"
                          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">speed</span>
                        </button>

                        <button
                          onClick={() => handleToggleRevoke(k.id)}
                          title={isActive ? 'Revoke Hardware Token (Lock Gate)' : 'Re-arm Hardware Token'}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-surface-container hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">{isActive ? 'block' : 'lock_open'}</span>
                          <span>{isActive ? 'Revoke' : 'Re-arm'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Hardware Terminal Scanner Simulator */}
        <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
            </span>
            <div>
              <h3 className="font-headline font-bold text-sm text-on-surface">Interactive Turnstile Terminal Simulator</h3>
              <p className="text-[11px] text-on-surface-variant">
                Simulate a member barcode / RFID card swipe at a physical turnstile gate to test authorization logic
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-on-surface-variant">Select Physical Gate</label>
              <select
                value={simSelectedKeyId}
                onChange={(e) => setSimSelectedKeyId(e.target.value)}
                className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary"
              >
                {keys.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-on-surface-variant">Member Code / Card ID</label>
              <input
                type="text"
                value={simMemberCode}
                onChange={(e) => setSimMemberCode(e.target.value)}
                placeholder="e.g. MEM-1001, MEM-1004"
                className="w-full bg-surface-container-high px-3 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSimulateScan}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code</span>
                <span>Simulate Turnstile Scan</span>
              </button>
            </div>
          </div>

          {/* Simulator Result Output */}
          {simResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
                simResult.status === 'GRANTED'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : simResult.status === 'GRACE_GRANTED'
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">
                    {simResult.status === 'GRANTED'
                      ? 'check_circle'
                      : simResult.status === 'GRACE_GRANTED'
                      ? 'warning'
                      : 'block'}
                  </span>
                  <span>{simResult.status === 'GRANTED' ? 'TURNSTILE UNLOCKED' : simResult.status === 'GRACE_GRANTED' ? 'GRACE UNLOCKED (YELLOW WARNING)' : 'ENTRY BARRED'}</span>
                </span>
                <span className="font-mono text-[10px] opacity-80">{simResult.timestamp}</span>
              </div>
              <div className="leading-relaxed">{simResult.message}</div>
              <div className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[15px]">settings_input_component</span>
                <span>Hardware Action: <strong>{simResult.relayAction}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE KEY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-low border border-primary/30 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-on-surface space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </span>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface">Issue Hardware Terminal Key</h3>
                  <p className="text-xs text-on-surface-variant">Generate dedicated token for turnstiles &amp; readers</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface-variant">Terminal / Gate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gate 4 - Free Weights Ingress Turnstile"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-on-surface-variant">Franchise Tenant</label>
                  <select
                    value={newTenantId}
                    onChange={(e) => setNewTenantId(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  >
                    {saasLicenses.map((lic) => (
                      <option key={lic.id} value={lic.id}>
                        {lic.gymName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-on-surface-variant">Hardware Type</label>
                  <select
                    value={newTerminalType}
                    onChange={(e: any) => setNewTerminalType(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="turnstile_qr">Optical QR / Barcode Gate</option>
                    <option value="turnstile_rfid">RFID Smart Card Turnstile</option>
                    <option value="biometric_fingerprint">Biometric Fingerprint Scanner</option>
                    <option value="facial_recognition_kiosk">AI Face Recognition Tablet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-on-surface-variant">Gate Hardware ID</label>
                  <input
                    type="text"
                    value={newGateId}
                    onChange={(e) => setNewGateId(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-on-surface-variant">Physical Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-on-surface-variant">Authorized Scopes</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { scope: 'attendance:checkin', label: 'Log Attendance & Unlock' },
                    { scope: 'access:verify', label: 'Verify Validity' },
                    { scope: 'emergency:unlock', label: 'Fire Alarm / Emergency Override' },
                  ].map((s) => {
                    const checked = selectedScopes.includes(s.scope as any);
                    return (
                      <label
                        key={s.scope}
                        className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                          checked
                            ? 'bg-primary/20 border-primary text-primary font-semibold'
                            : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, s.scope as any]);
                            } else {
                              setSelectedScopes(selectedScopes.filter((sc) => sc !== s.scope));
                            }
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span>{s.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface-variant">Token Expiry Window</label>
                <select
                  value={keyLifetime}
                  onChange={(e: any) => setKeyLifetime(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-mono"
                >
                  <option value="90d">90 Days (Quarterly Audit Required)</option>
                  <option value="365d">1 Year (Annual Cycle)</option>
                  <option value="never">Permanent (Manual Revocation Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-lg shadow-primary/25 cursor-pointer transition-all"
                >
                  Issue Terminal Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
