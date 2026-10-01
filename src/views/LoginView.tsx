import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { APP_LOGO } from '../data/mockData';

export const LoginView: React.FC = () => {
  const { login, setActiveScreen, theme, toggleTheme, isDemoMode, toggleDemoMode, dbHealth } = useGym();
  const [username, setUsername] = useState(isDemoMode ? 'admin@gymos.io' : 'admin@ironcore.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live heart rate telemetry simulation
  const [liveBpm, setLiveBpm] = useState(138);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBpm((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(165, Math.max(120, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication service error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setUsername('admin@gymos.io');
    setPassword('demo');
    setErrorMessage(null);
  };

  const handleFillDemoStaff = () => {
    setUsername('staff@gymos.io');
    setPassword('demo');
    setErrorMessage(null);
  };

  const handleFillDemoSuperAdmin = () => {
    setUsername('superadmin');
    setPassword('demo');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-surface text-on-surface relative overflow-hidden py-6 px-4 sm:px-8">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-luminosity z-0"
        src="https://assets.mixkit.co/videos/preview/mixkit-man-training-with-battle-ropes-in-a-gym-43026-large.mp4"
      />

      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Top Header Navigation */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between z-20 pb-4">
        <div 
          onClick={() => setActiveScreen('landing')}
          className="flex items-center gap-3 group cursor-pointer"
          title="Go to Product Showcase"
        >
          <img
            alt="Gymofy Logo"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            src={APP_LOGO}
          />
          <div>
            <span className="text-xl font-headline font-bold text-primary tracking-tight">Gymofy</span>
            <span className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">
              Enterprise Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/30 flex items-center justify-center group"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            <span className="material-symbols-outlined text-[18px] text-primary transition-transform group-hover:rotate-45">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={() => setActiveScreen('landing')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-95 transition-all shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Product Showcase</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Cinematic Gym Animation on Left, Login Form on Right */}
      <div className="max-w-7xl w-full mx-auto z-10 my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (7 Cols): Cinematic Gym Ambiance & Telemetry Animation */}
        <div className="lg:col-span-7 hidden md:flex flex-col justify-center relative rounded-3xl p-8 overflow-hidden bg-surface-container-low border border-outline-variant/40 shadow-2xl min-h-[560px]">
          {/* Layer 1: Ambient Laser Grid Sweep */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(125, 211, 252, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(125, 211, 252, 0.15) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
              perspective: '600px',
              transform: 'rotateX(20deg) scale(1.1)'
            }}
          ></div>

          {/* Layer 2: Moving diagonal neon laser ray */}
          <div className="absolute top-0 -left-1/4 w-[150%] h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent blur-xl pointer-events-none animate-laser-sweep"></div>

          {/* Layer 3: Floating Chalk / Dust Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary/40 blur-[0.5px]"
                style={{
                  top: `${15 + (i * 5.2) % 80}%`,
                  left: `${10 + (i * 5.8) % 85}%`,
                  animation: `particleDrift ${4 + (i % 4)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`
                }}
              ></div>
            ))}
          </div>

          {/* Layer 4: Cinematic Gym Equipment Hero Animation (Olympic Barbell & Neon Plates) */}
          <div className="relative z-10 flex flex-col items-center justify-center my-6">
            <div className="relative animate-barbell-float">
              {/* Glowing Aura Behind Weights */}
              <div className="absolute inset-0 bg-primary/25 rounded-full blur-3xl scale-125 pointer-events-none"></div>

              {/* Stylized Olympic Barbell SVG Illustration with Neon Rim Lights */}
              <svg
                width="420"
                height="140"
                viewBox="0 0 420 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_24px_rgba(125,211,252,0.45)] w-full max-w-[420px]"
              >
                {/* Steel Knurled Bar Shaft */}
                <line x1="20" y1="70" x2="400" y2="70" stroke="var(--c-primary)" strokeWidth="6" strokeLinecap="round" />
                <line x1="120" y1="70" x2="300" y2="70" stroke="#ffffff" strokeWidth="3" strokeDasharray="3 3" opacity="0.8" />

                {/* Left Weight Plates Stack */}
                <g filter="url(#glow)">
                  {/* Outer Clamp Collar */}
                  <rect x="36" y="52" width="8" height="36" rx="3" fill="var(--c-outline)" />
                  {/* 10kg Plate */}
                  <rect x="46" y="42" width="10" height="56" rx="3" fill="#38bdf8" />
                  {/* 20kg Plate */}
                  <rect x="58" y="25" width="14" height="90" rx="4" fill="#0284c7" />
                  {/* 25kg Olympic Plate */}
                  <rect x="74" y="12" width="18" height="116" rx="5" fill="#0369a1" stroke="var(--c-primary)" strokeWidth="2" />
                  {/* Inner Sleeve Collar */}
                  <rect x="94" y="50" width="12" height="40" rx="3" fill="var(--c-primary-fixed)" />
                </g>

                {/* Right Weight Plates Stack */}
                <g filter="url(#glow)">
                  {/* Inner Sleeve Collar */}
                  <rect x="314" y="50" width="12" height="40" rx="3" fill="var(--c-primary-fixed)" />
                  {/* 25kg Olympic Plate */}
                  <rect x="328" y="12" width="18" height="116" rx="5" fill="#0369a1" stroke="var(--c-primary)" strokeWidth="2" />
                  {/* 20kg Plate */}
                  <rect x="348" y="25" width="14" height="90" rx="4" fill="#0284c7" />
                  {/* 10kg Plate */}
                  <rect x="364" y="42" width="10" height="56" rx="3" fill="#38bdf8" />
                  {/* Outer Clamp Collar */}
                  <rect x="376" y="52" width="8" height="36" rx="3" fill="var(--c-outline)" />
                </g>

                {/* Center Laser Focus Ring */}
                <circle cx="210" cy="70" r="14" fill="none" stroke="var(--c-primary)" strokeWidth="2" strokeDasharray="4 4" className="animate-spin origin-center" />
                <circle cx="210" cy="70" r="4" fill="var(--c-primary)" />
              </svg>

              {/* Floor Shadow */}
              <div className="w-80 h-4 bg-primary/20 rounded-full blur-md mx-auto mt-2"></div>
            </div>

            {/* Motivational Tagline */}
            <div className="mt-6 text-center">
              <span className="text-[11px] font-mono tracking-widest text-primary font-bold uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/25">
                DISCIPLINE • POWER • REAL-TIME TELEMETRY
              </span>
              <h2 className="text-xl font-headline font-bold text-on-surface mt-2">
                Engineered for High-Performance Gyms
              </h2>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
                Automated QR turnstile access, live attendance telemetry, and seamless club operations.
              </p>
            </div>
          </div>

          {/* Layer 5: Live Heart Rate & Terminal Telemetry HUD Overlay */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-outline-variant/30 text-xs">
            <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>ATHLETE TELEMETRY</span>
                <span className="material-symbols-outlined text-[14px] text-error animate-pulse">favorite</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-lg font-bold text-on-surface">{liveBpm}</span>
                <span className="text-[10px] text-on-surface-variant">BPM</span>
              </div>
              {/* Animated pulse wave */}
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-error rounded-full transition-all duration-700"
                  style={{ width: `${(liveBpm / 180) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>GATE STATUS</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              </div>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-lg font-bold text-primary">ARMED</span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1.5 font-mono">
                Turnstiles 1-4 Online
              </div>
            </div>

            <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <span>ACCESS PROTOCOL</span>
                <span className="material-symbols-outlined text-[14px] text-tertiary">qr_code_scanner</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1 font-mono">
                <span className="text-lg font-bold text-tertiary">ENFORCED</span>
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1.5 font-mono">
                Zero-Trust Entry
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Main Sign-In Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-3 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[24px]">vpn_key</span>
              </div>
              <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                Sign In to Gymofy
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Enter your credentials to access your club terminal or platform engine.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-error/15 border border-error/30 text-error text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Login ID / Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                    badge
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. superadmin or admin@gymos.io"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-primary hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-11 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-outline-variant/50 bg-surface-container text-primary focus:ring-0"
                  />
                  <span>Remember this terminal</span>
                </label>
                <span className="text-[11px] text-on-surface-variant/70">
                  SSL 256-Bit
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Mode & Demo Logins Section */}
            <div className="mt-6 pt-5 border-t border-outline-variant/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-on-surface-variant uppercase font-mono tracking-widest">
                  Authentication Mode
                </span>
                <button
                  type="button"
                  onClick={() => toggleDemoMode()}
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border transition-all ${
                    isDemoMode
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {isDemoMode ? 'DEMO MODE (OFFLINE)' : 'POSTGRESQL (LIVE)'}
                </button>
              </div>

              {isDemoMode ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleFillDemoAdmin}
                      className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary group-hover:underline">Tenant Admin</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">Demo</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">admin@gymos.io</div>
                    </button>

                    <button
                      type="button"
                      onClick={handleFillDemoStaff}
                      className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-tertiary group-hover:underline">Desk Staff</span>
                        <span className="text-[10px] bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded font-mono">Demo</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant mt-0.5">staff@gymos.io</div>
                    </button>
                  </div>

                  <div className="p-2 rounded-xl bg-surface-container/60 flex items-center justify-between border border-outline-variant/20 text-xs">
                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">shield</span>
                      <span>Demo Superadmin:</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemoSuperAdmin}
                      className="text-[11px] font-mono font-bold text-primary hover:underline"
                    >
                      Fill Demo Superadmin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-container/50 border border-outline-variant/20 text-xs text-on-surface-variant leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                    <span className="material-symbols-outlined text-sm">database</span>
                    <span>Database-Backed Auth Active</span>
                  </div>
                  Enter your registered tenant email and password. Use the credentials generated during database seeding (e.g.{' '}
                  <code className="text-primary font-mono text-[11px]">admin@ironcore.com</code>).
                </div>
              )}

              {/* Explore Showcase Callout */}
              <div className="mt-4 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setActiveScreen('landing')}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/30 text-xs font-semibold text-primary flex items-center justify-center gap-2 transition-all group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-primary transition-transform group-hover:scale-110">
                    storefront
                  </span>
                  <span>Explore Product Showcase &amp; Interactive Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-on-surface-variant/70 z-10 pt-4">
        Gymofy™ Enterprise Infrastructure • Telemetry &amp; Access System v2.6.4
      </div>
    </div>
  );
};
