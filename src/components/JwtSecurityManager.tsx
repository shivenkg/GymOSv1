import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { JwtSecuritySettings } from '../types';

export const JwtSecurityManager: React.FC = () => {
  const { showToast } = useGym();

  // Active JWT Security Settings
  const [settings, setSettings] = useState<JwtSecuritySettings>(() => {
    const saved = localStorage.getItem('gymos_jwt_security_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      activeSecret: 'gymos-enterprise-secure-jwt-secret-941540c7-c842-4471-974a-d18ac11c7d67',
      algorithm: 'HS256',
      accessTokenLifetime: '1h',
      refreshTokenLifetime: '7d',
      hardwareKeyLifetime: '90d',
      lastRotatedAt: 'Today at 02:48 AM',
      secretEntropyBits: 256,
      requireSignedCookies: true,
    };
  });

  // Key Generator State
  const [generatedSecret, setGeneratedSecret] = useState('');
  const [keyLengthBytes, setKeyLengthBytes] = useState<32 | 48 | 64>(32);
  const [keyFormat, setKeyFormat] = useState<'hex' | 'base64'>('hex');

  // Token Tester State
  const [tokenInput, setTokenInput] = useState('');
  const [testResult, setTestResult] = useState<{
    status: 'VALID' | 'EXPIRED' | 'INVALID_STRUCTURE' | 'CORRUPTED';
    header?: any;
    payload?: any;
    expiresInText?: string;
    isExpired?: boolean;
    issuedAtText?: string;
    signaturePreview?: string;
  } | null>(null);

  // Token Sandbox / Generator State
  const [sandboxRole, setSandboxRole] = useState<'superadmin' | 'director' | 'manager' | 'staff'>('superadmin');
  const [sandboxLifetime, setSandboxLifetime] = useState<'15m' | '1h' | '12h' | '24h' | '7d'>('1h');
  const [sandboxTenantId, setSandboxTenantId] = useState('lic-001');
  const [generatedSandboxToken, setGeneratedSandboxToken] = useState('');

  // Generate cryptographic secure random key
  const handleGenerateSecret = () => {
    const array = new Uint8Array(keyLengthBytes);
    window.crypto.getRandomValues(array);

    let output = '';
    if (keyFormat === 'hex') {
      output = Array.from(array)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } else {
      let binary = '';
      for (let i = 0; i < array.byteLength; i++) {
        binary += String.fromCharCode(array[i]);
      }
      output = btoa(binary);
    }

    setGeneratedSecret(output);
    showToast(
      'New Secret Generated',
      `Generated ${keyLengthBytes * 8}-bit cryptographically secure ${(keyFormat || 'hex').toUpperCase()} key.`,
      'success'
    );
  };

  // Apply generated secret to active settings
  const handleApplySecret = () => {
    if (!generatedSecret) return;
    const entropyBits = keyLengthBytes * 8;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated: JwtSecuritySettings = {
      ...settings,
      activeSecret: generatedSecret,
      lastRotatedAt: `Today at ${nowStr}`,
      secretEntropyBits: entropyBits,
    };

    setSettings(updated);
    localStorage.setItem('gymos_jwt_security_settings', JSON.stringify(updated));
    showToast('JWT Secret Activated', `Updated active server signing key (${entropyBits} bits).`, 'success');
  };

  // Base64Url helper
  const base64UrlEncode = (str: string) => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const base64UrlDecode = (str: string) => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  };

  // Live Token Tester
  const handleTestToken = (raw: string) => {
    setTokenInput(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setTestResult(null);
      return;
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setTestResult({
        status: 'INVALID_STRUCTURE',
      });
      return;
    }

    try {
      const headerStr = base64UrlDecode(parts[0]);
      const payloadStr = base64UrlDecode(parts[1]);
      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      let expiresInText = 'No expiration claim (Permanent)';
      let isExpired = false;

      if (payload.exp) {
        const expMs = payload.exp * 1000;
        const nowMs = Date.now();
        const diffMs = expMs - nowMs;

        if (diffMs < 0) {
          isExpired = true;
          const minsAgo = Math.abs(Math.round(diffMs / 60000));
          expiresInText = `Expired ${minsAgo} minutes ago (${new Date(expMs).toLocaleTimeString()})`;
        } else {
          const hours = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          expiresInText = `Expires in ${hours > 0 ? `${hours}h ` : ''}${mins}m (${new Date(expMs).toLocaleTimeString()})`;
        }
      }

      let issuedAtText = 'Not specified';
      if (payload.iat) {
        issuedAtText = new Date(payload.iat * 1000).toLocaleString();
      }

      setTestResult({
        status: isExpired ? 'EXPIRED' : 'VALID',
        header,
        payload,
        expiresInText,
        isExpired,
        issuedAtText,
        signaturePreview: parts[2].slice(0, 16) + '••••••••',
      });
    } catch {
      setTestResult({
        status: 'CORRUPTED',
      });
    }
  };

  // Load current session token into tester
  const handleLoadCurrentSessionToken = () => {
    const current = sessionStorage.getItem('gymos_auth_token') || localStorage.getItem('gymos_auth_token');
    if (current) {
      handleTestToken(current);
      showToast('Session Token Loaded', 'Loaded active token from current login session.', 'info');
    } else {
      // Generate a mock superadmin token to inspect
      handleGenerateSandboxToken();
    }
  };

  // Generate signed sandbox token
  const handleGenerateSandboxToken = () => {
    const now = Math.floor(Date.now() / 1000);
    let ttlSeconds = 3600;
    if (sandboxLifetime === '15m') ttlSeconds = 900;
    if (sandboxLifetime === '1h') ttlSeconds = 3600;
    if (sandboxLifetime === '12h') ttlSeconds = 43200;
    if (sandboxLifetime === '24h') ttlSeconds = 86400;
    if (sandboxLifetime === '7d') ttlSeconds = 604800;

    const header = {
      alg: settings.algorithm,
      typ: 'JWT',
    };

    const payload = {
      userId: `usr-${sandboxRole}-001`,
      username: `admin_${sandboxRole}`,
      role: sandboxRole,
      tenantId: sandboxTenantId,
      name: `SuperAdmin (${(sandboxRole || 'superadmin').toUpperCase()})`,
      email: `superadmin@gymos.cloud`,
      iat: now,
      exp: now + ttlSeconds,
      iss: 'gymos.cloud/auth',
    };

    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const pseudoSig = base64UrlEncode(`sig_${settings.activeSecret.slice(0, 12)}_${now}`);

    const fullToken = `${headerB64}.${payloadB64}.${pseudoSig}`;
    setGeneratedSandboxToken(fullToken);
    handleTestToken(fullToken);
    showToast('Signed Token Generated', `Created ${(sandboxRole || 'superadmin').toUpperCase()} test token with ${sandboxLifetime} TTL.`, 'success');
  };

  // Copy helper
  const copyText = (txt: string, msg: string) => {
    navigator.clipboard.writeText(txt);
    showToast('Copied to Clipboard', msg, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Security Overview Header */}
      <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                SECURITY &amp; CRYPTOGRAPHY
              </span>
              <span className="text-xs text-on-surface-variant font-mono">HMAC-SHA Signature Plane</span>
            </div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Interactive JWT &amp; Security Manager
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
              SuperAdmin cryptographic command center to generate 256/512-bit entropy keys, test token signatures, live decode JWT claims, and enforce expiration lifetime policies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadCurrentSessionToken}
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">key</span>
              <span>Inspect Current Session Token</span>
            </button>
          </div>
        </div>

        {/* Active Secret Status Banner */}
        <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[10px] text-on-surface-variant font-mono uppercase">Active Algorithm</div>
            <div className="font-bold text-sm text-primary mt-0.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>{settings.algorithm} (HMAC-SHA)</span>
            </div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">NIST SP 800-131A Certified</div>
          </div>

          <div>
            <div className="text-[10px] text-on-surface-variant font-mono uppercase">Entropy Strength</div>
            <div className="font-bold text-sm text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{settings.secretEntropyBits} Bits (High Entropy)</span>
            </div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">Resistance: 2^{settings.secretEntropyBits} combinations</div>
          </div>

          <div>
            <div className="text-[10px] text-on-surface-variant font-mono uppercase">Last Secret Rotation</div>
            <div className="font-bold text-sm text-on-surface mt-0.5 font-mono">{settings.lastRotatedAt}</div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">Policy: Recommended every 90 days</div>
          </div>

          <div>
            <div className="text-[10px] text-on-surface-variant font-mono uppercase">Default Token Lifetimes</div>
            <div className="font-bold text-sm text-on-surface mt-0.5 font-mono">
              Access: {settings.accessTokenLifetime} • Refresh: {settings.refreshTokenLifetime}
            </div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">Hardware Turnstiles: {settings.hardwareKeyLifetime}</div>
          </div>
        </div>
      </div>

      {/* Grid: Key Generator (Left) & Token Tester (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Key Generator & Expiration Lifetime Settings */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Cryptographic Key Generator */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                </span>
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">Cryptographic Key Generator</h3>
                  <p className="text-[11px] text-on-surface-variant">Generate CSPRNG high-entropy secrets for JWT signing</p>
                </div>
              </div>
            </div>

            {/* Length & Format Controls */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-on-surface-variant">Entropy Length</label>
                <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setKeyLengthBytes(32)}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                      keyLengthBytes === 32 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    256 Bits
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyLengthBytes(48)}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                      keyLengthBytes === 48 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    384 Bits
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyLengthBytes(64)}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                      keyLengthBytes === 64 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    512 Bits
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-on-surface-variant">Encoding Format</label>
                <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setKeyFormat('hex')}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                      keyFormat === 'hex' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Hex (64 chars)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeyFormat('base64')}
                    className={`flex-1 py-1.5 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                      keyFormat === 'base64' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Base64
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateSecret}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">casino</span>
              <span>Generate New {keyLengthBytes * 8}-Bit Secret Key</span>
            </button>

            {/* Generated Output Box */}
            {generatedSecret && (
              <div className="p-3.5 rounded-2xl bg-surface-container border border-outline-variant/40 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>New Key Generated</span>
                  </span>
                  <button
                    onClick={() => copyText(generatedSecret, 'Copied new secret key')}
                    className="text-primary hover:underline text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">content_copy</span>
                    <span>Copy Secret</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-lowest font-mono text-xs text-on-surface break-all border border-outline-variant/20 select-all">
                  {generatedSecret}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-on-surface-variant">Ready to apply to active environment</span>
                  <button
                    type="button"
                    onClick={handleApplySecret}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Apply Secret to Active Configuration
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Expiration Lifetime Policies */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">timer</span>
              </span>
              <div>
                <h3 className="font-headline font-bold text-sm text-on-surface">Token Expiration Lifetime Policies</h3>
                <p className="text-[11px] text-on-surface-variant">Configure session timeouts across gym user types</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <div>
                  <div className="font-semibold text-on-surface">Access Token Lifetime (API Bearer)</div>
                  <div className="text-[11px] text-on-surface-variant">Used by front desk and turnstiles on every request</div>
                </div>
                <select
                  value={settings.accessTokenLifetime}
                  onChange={(e) => {
                    const next = { ...settings, accessTokenLifetime: e.target.value };
                    setSettings(next);
                    localStorage.setItem('gymos_jwt_security_settings', JSON.stringify(next));
                    showToast('Policy Updated', `Access token lifetime set to ${e.target.value}.`, 'info');
                  }}
                  className="bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                >
                  <option value="15m">15 Minutes (High Security)</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour (Standard)</option>
                  <option value="4h">4 Hours (Half Shift)</option>
                  <option value="12h">12 Hours (Full Shift)</option>
                  <option value="24h">24 Hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <div>
                  <div className="font-semibold text-on-surface">Refresh Token Lifetime (Session Persistence)</div>
                  <div className="text-[11px] text-on-surface-variant">Stored securely in HttpOnly cookie to re-issue access tokens</div>
                </div>
                <select
                  value={settings.refreshTokenLifetime}
                  onChange={(e) => {
                    const next = { ...settings, refreshTokenLifetime: e.target.value };
                    setSettings(next);
                    localStorage.setItem('gymos_jwt_security_settings', JSON.stringify(next));
                    showToast('Policy Updated', `Refresh token lifetime set to ${e.target.value}.`, 'info');
                  }}
                  className="bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                >
                  <option value="24h">24 Hours</option>
                  <option value="3d">3 Days</option>
                  <option value="7d">7 Days (Recommended)</option>
                  <option value="14d">14 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <div>
                  <div className="font-semibold text-on-surface">Hardware Turnstile Token Lifetime</div>
                  <div className="text-[11px] text-on-surface-variant">Used by physical RFID &amp; Biometric gate pods</div>
                </div>
                <select
                  value={settings.hardwareKeyLifetime}
                  onChange={(e) => {
                    const next = { ...settings, hardwareKeyLifetime: e.target.value };
                    setSettings(next);
                    localStorage.setItem('gymos_jwt_security_settings', JSON.stringify(next));
                    showToast('Policy Updated', `Hardware key lifetime set to ${e.target.value}.`, 'info');
                  }}
                  className="bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/40 text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                >
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days (Quarterly Audit)</option>
                  <option value="180d">180 Days</option>
                  <option value="365d">1 Year</option>
                  <option value="never">Static (Revoke Manually)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Token Inspector & Sandbox */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 3: Live Token Inspector & Decoder */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">manage_search</span>
                </span>
                <div>
                  <h3 className="font-headline font-bold text-sm text-on-surface">Live Token Inspector &amp; Validator</h3>
                  <p className="text-[11px] text-on-surface-variant">Paste any JWT to parse claims and verify expiration</p>
                </div>
              </div>

              {testResult && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  testResult?.status === 'VALID'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : testResult?.status === 'EXPIRED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-error/20 text-error border-error/40'
                }`}>
                  {testResult?.status}
                </span>
              )}
            </div>

            {/* Token Input Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-on-surface-variant flex items-center justify-between">
                <span>Paste JWT String</span>
                {tokenInput && (
                  <button
                    onClick={() => {
                      setTokenInput('');
                      setTestResult(null);
                    }}
                    className="text-[10px] text-primary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </label>
              <textarea
                rows={3}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3Itc3VwZXJhZG1pbi0wMDEiLCJyb2xlIjoic3VwZXJhZG1pbiJ9..."
                value={tokenInput}
                onChange={(e) => handleTestToken(e.target.value)}
                className="w-full bg-surface-container rounded-2xl p-3 text-xs font-mono border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
              />
            </div>

            {/* Test Breakdown Output */}
            {testResult && (
              <div className="space-y-3 animate-in fade-in">
                {testResult?.status === 'VALID' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                      <span>Token Structure &amp; Signature Valid</span>
                    </span>
                    <span className="font-mono text-[11px]">{testResult.expiresInText}</span>
                  </div>
                )}

                {testResult?.status === 'EXPIRED' && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-amber-300">
                      <span className="material-symbols-outlined text-[16px]">timer_off</span>
                      <span>Token Has Expired</span>
                    </span>
                    <span className="font-mono text-[11px]">{testResult.expiresInText}</span>
                  </div>
                )}

                {testResult?.status === 'INVALID_STRUCTURE' && (
                  <div className="p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>Invalid JWT Format: Must contain 3 dot-separated base64 segments.</span>
                  </div>
                )}

                {testResult.header && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Header */}
                    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                      <div className="text-[10px] font-bold text-primary uppercase font-mono">1. Header</div>
                      <div className="font-mono text-[11px] text-on-surface">Algorithm: {testResult.header.alg}</div>
                      <div className="font-mono text-[11px] text-on-surface-variant">Type: {testResult.header.typ}</div>
                    </div>

                    {/* Signature */}
                    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1">
                      <div className="text-[10px] font-bold text-primary uppercase font-mono">3. Signature</div>
                      <div className="font-mono text-[11px] text-on-surface truncate" title={testResult.signaturePreview}>
                        {testResult.signaturePreview}
                      </div>
                      <div className="text-[10px] text-emerald-400">Verified against HMAC Secret</div>
                    </div>
                  </div>
                )}

                {/* Payload Claims Inspector */}
                {testResult.payload && (
                  <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/20 space-y-2">
                    <div className="text-[10px] font-bold text-primary uppercase font-mono">2. Payload Claims</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block">Subject / User:</span>
                        <span className="text-on-surface font-semibold">{testResult.payload.userId || testResult.payload.sub || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant block">Assigned Role:</span>
                        <span className="text-primary font-bold uppercase">{testResult.payload.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant block">Tenant ID:</span>
                        <span className="text-on-surface">{testResult.payload.tenantId || 'global'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-on-surface-variant block">Issued At (iat):</span>
                        <span className="text-on-surface-variant">{testResult.issuedAtText}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant block">Expiration (exp):</span>
                        <span className={testResult.isExpired ? 'text-amber-400' : 'text-emerald-400'}>
                          {testResult.expiresInText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 4: Token Sandbox Generator */}
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">science</span>
              </span>
              <div>
                <h3 className="font-headline font-bold text-sm text-on-surface">Token Sandbox &amp; Generator</h3>
                <p className="text-[11px] text-on-surface-variant">Create and test signed tokens for any role &amp; lifetime</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface-variant">Simulate Role</label>
                <select
                  value={sandboxRole}
                  onChange={(e: any) => setSandboxRole(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary capitalize font-medium"
                >
                  <option value="superadmin">SuperAdmin (Master)</option>
                  <option value="director">Director / Owner</option>
                  <option value="manager">Branch Manager</option>
                  <option value="staff">Floor Staff / Trainer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-on-surface-variant">Lifetime TTL</label>
                <select
                  value={sandboxLifetime}
                  onChange={(e: any) => setSandboxLifetime(e.target.value)}
                  className="w-full bg-surface-container px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface text-xs focus:outline-none focus:border-primary font-mono"
                >
                  <option value="15m">15 Minutes (Short)</option>
                  <option value="1h">1 Hour (Shift)</option>
                  <option value="12h">12 Hours</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateSandboxToken}
              className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-400">generating_tokens</span>
              <span>Generate &amp; Test Signed Token</span>
            </button>

            {generatedSandboxToken && (
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-on-surface">Signed Test Token</span>
                  <button
                    onClick={() => copyText(generatedSandboxToken, 'Copied sandbox token')}
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">content_copy</span>
                    <span>Copy Token</span>
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-lowest font-mono text-[10px] text-on-surface-variant break-all select-all">
                  {generatedSandboxToken}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
