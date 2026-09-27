import React, { useState } from 'react';
import { useGym } from '../context/GymContext';

export const LandingTourView: React.FC = () => {
  const { setActiveScreen, showToast, currentUser, theme, toggleTheme } = useGym();
  const [calcMembers, setCalcMembers] = useState(1500);
  const [calcStaff, setCalcStaff] = useState(12);
  const [calcLocations, setCalcLocations] = useState(3);
  const [calcAnnual, setCalcAnnual] = useState(false);

  // Quick estimator formula in INR (Scale realistic Indian SaaS pricing)
  const baseMonthly = 3999 + Math.ceil(calcMembers / 100) * 600 + calcStaff * 450 + (calcLocations - 1) * 3500;
  const estimatedMonthly = Math.round(calcAnnual ? baseMonthly * 0.8 : baseMonthly);

  return (
    <div className="min-h-screen bg-surface text-on-surface py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col w-full pb-20 space-y-10">
      {/* Top Standalone Navigation Bar with Quick Access to Sign In & Super Admin */}
      <nav className="flex flex-col sm:flex-row items-center justify-between p-4 bg-surface-container-high/90 backdrop-blur-md rounded-2xl border border-outline-variant/30 gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary font-bold shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-[24px]">fitness_center</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-lg tracking-tight text-on-surface">GymOS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                Enterprise
              </span>
            </div>
            <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Product Showcase &amp; Portal</span>
              <span className="hidden md:inline font-mono opacity-60">• Hardware Relay Ready</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface border border-outline-variant/40 transition-all flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <button
            onClick={() => setActiveScreen('login')}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface border border-outline-variant/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">login</span>
            <span>Sign In</span>
          </button>

          {currentUser?.role === 'superadmin' && (
            <button
              onClick={() => setActiveScreen('super-admin')}
              className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-primary/10"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span>Super Admin Portal</span>
            </button>
          )}

          <button
            onClick={() => setActiveScreen('dashboard')}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 flex items-center gap-1.5 transition-all shadow-md shadow-primary/20"
          >
            <span>Live Club Demo</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 px-8 bg-surface-container-low rounded-3xl border border-outline-variant/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary text-xs font-semibold mb-4 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Next-Gen Gym Operating System</span>
            </div>
            <h1 className="font-headline font-bold text-4xl lg:text-5xl text-on-surface mb-4 leading-tight tracking-tight">
              Run Your Gym Without Friction
            </h1>
            <p className="text-base text-on-surface-variant max-w-xl mb-6 leading-relaxed">
              Empower your fitness empire with automated member management, lightning-fast QR check-ins, and seamless recurring billing in one unified dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  showToast('Trial Activated', 'Enjoy 14 days of enterprise GymOS access!', 'success');
                  setActiveScreen('dashboard');
                }}
                className="px-6 py-3 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
              >
                <span>Start Free Trial</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                onClick={() => setActiveScreen('attendance')}
                className="px-6 py-3 bg-surface-container-high text-on-surface font-semibold text-sm rounded-xl hover:bg-surface-bright transition-all flex items-center gap-2 border border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
                <span>Launch QR Terminal</span>
              </button>
            </div>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-outline-variant/30 w-full">
              <div>
                <div className="text-2xl font-headline font-bold text-primary font-mono">99.9%</div>
                <div className="text-xs text-on-surface-variant">Uptime SLA</div>
              </div>
              <div className="w-px h-8 bg-outline-variant/30"></div>
              <div>
                <div className="text-2xl font-headline font-bold text-primary font-mono">₹350Cr+</div>
                <div className="text-xs text-on-surface-variant">Processed Billing</div>
              </div>
              <div className="w-px h-8 bg-outline-variant/30"></div>
              <div>
                <div className="text-2xl font-headline font-bold text-primary font-mono">1,200+</div>
                <div className="text-xs text-on-surface-variant">Active Gyms</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-surface-container p-6 rounded-2xl shadow-xl relative overflow-hidden border border-outline-variant/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase font-mono tracking-wider">
                  LIVE TERMINAL
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface">Aarav Sharma</div>
                      <div className="text-[11px] text-on-surface-variant">Checked in via QR • 2s ago</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-tertiary/20 flex items-center justify-center text-tertiary">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-on-surface">Membership Renewed</div>
                      <div className="text-[11px] text-on-surface-variant">Sneha Kulkarni • ₹4,500/mo</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold">
                    Paid
                  </span>
                </div>

                <div className="p-3.5 bg-surface-container-lowest rounded-xl flex items-center justify-between border border-outline-variant/20">
                  <div>
                    <div className="text-[11px] text-on-surface-variant">Current Capacity</div>
                    <div className="text-sm font-headline font-bold text-primary font-mono">142 / 200 Members</div>
                  </div>
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-variant"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></path>
                      <path
                        className="text-primary"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="71, 100"
                        strokeLinecap="round"
                        strokeWidth="3"
                      ></path>
                    </svg>
                    <span className="absolute text-[10px] font-bold text-on-surface font-mono">71%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metric Counter Strip */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase font-medium">Active Check-ins</span>
            <span className="material-symbols-outlined text-primary text-[20px]">how_to_reg</span>
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface mb-1 font-mono">1,482</div>
          <div className="flex items-center gap-1 text-primary text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+12% from last hour</span>
          </div>
        </div>

        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase font-medium">Monthly Revenue</span>
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface mb-1 font-mono">₹48,25,000</div>
          <div className="flex items-center gap-1 text-primary text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+8.4% this month</span>
          </div>
        </div>

        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase font-medium">Retention Rate</span>
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface mb-1 font-mono">94.6%</div>
          <div className="flex items-center gap-1 text-primary text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+2.1% vs industry avg</span>
          </div>
        </div>

        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-on-surface-variant uppercase font-medium">Avg. Check-in Speed</span>
            <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
          </div>
          <div className="text-2xl font-headline font-bold text-on-surface mb-1 font-mono">0.4s</div>
          <div className="flex items-center gap-1 text-primary text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Optimal performance</span>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
            Engineered for Elite Fitness Businesses
          </h2>
          <p className="text-xs text-on-surface-variant">
            Everything you need to scale operations, delight members, and eliminate administrative bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            onClick={() => setActiveScreen('crm-leads')}
            className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all cursor-pointer border border-outline-variant/30 group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Member Lifecycle</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Track prospect pipelines, automate onboarding sequences, and engage at-risk members before they churn.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center text-primary text-xs font-semibold">
              <span>Explore lifecycle</span>
              <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveScreen('attendance')}
            className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all cursor-pointer border border-outline-variant/30 group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Fast QR Check-in</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Lightning-fast entry scanning via mobile app or front desk terminals. Eliminate lobby bottlenecks entirely.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center text-primary text-xs font-semibold">
              <span>View scanner hardware</span>
              <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveScreen('payments')}
            className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all cursor-pointer border border-outline-variant/30 group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Automated Billing</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Zero failed payments with smart retry logic, automated invoicing, and integrated merchant processing.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center text-primary text-xs font-semibold">
              <span>See billing engine</span>
              <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveScreen('settings')}
            className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition-all cursor-pointer border border-outline-variant/30 group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface mb-2">Role-Based Access</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Granular permissions for front desk staff, personal trainers, facility managers, and multi-location owners.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-outline-variant/30 flex items-center text-primary text-xs font-semibold">
              <span>Configure roles</span>
              <span className="material-symbols-outlined text-[16px] ml-1 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive SaaS Package Calculator Section */}
      <section className="bg-surface-container-low p-8 rounded-3xl border border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-2">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Transparent SaaS Licensing</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-headline font-bold text-on-surface">
            Customize Your Plan Based on Gym Scale
          </h2>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Scale seamlessly from single boutique studios to 50-location mega franchises. No hidden hardware markups.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders on Left */}
          <div className="lg:col-span-7 space-y-5">
            {/* Members Slider */}
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">Active Gym Members</span>
                <span className="font-mono font-bold text-primary text-sm">{calcMembers.toLocaleString()} members</span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={calcMembers}
                onChange={(e) => setCalcMembers(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>100</span>
                <span>2,500</span>
                <span>5,000</span>
                <span>10,000+</span>
              </div>
            </div>

            {/* Staff Slider */}
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">Staff &amp; Trainer Seats</span>
                <span className="font-mono font-bold text-on-surface text-sm">{calcStaff} seats</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={calcStaff}
                onChange={(e) => setCalcStaff(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>1 seat</span>
                <span>15 seats</span>
                <span>35 seats</span>
                <span>50 seats</span>
              </div>
            </div>

            {/* Locations Slider */}
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-on-surface">Club Locations / Facilities</span>
                <span className="font-mono font-bold text-on-surface text-sm">{calcLocations} club{calcLocations > 1 ? 's' : ''}</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={calcLocations}
                onChange={(e) => setCalcLocations(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>1 club</span>
                <span>3 clubs</span>
                <span>8 clubs</span>
                <span>15 clubs</span>
              </div>
            </div>
          </div>

          {/* Pricing Quote on Right */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container p-6 rounded-2xl border border-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-primary font-mono">
                  {calcMembers <= 500 ? 'STARTER CLUB TIER' : calcMembers <= 2500 ? 'PRO MULTI-GYM TIER' : 'ELITE ENTERPRISE TIER'}
                </span>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={calcAnnual}
                    onChange={(e) => setCalcAnnual(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span>Annual (-20%)</span>
                </label>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-headline font-bold text-on-surface font-mono">
                    ₹{estimatedMonthly.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-on-surface-variant">/ month</span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Est. ₹{(estimatedMonthly / (calcMembers || 1)).toFixed(0)} per active member/month
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-on-surface border-t border-outline-variant/20 pt-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                  <span>Turnstile QR &amp; Biometric controller driver included</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                  <span>Unlimited automated billing &amp; Stripe Connect sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                  <span>Multi-branch real-time attendance telemetry</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    showToast('Trial Initiated', `Testing plan with ${calcMembers.toLocaleString()} members & ${calcLocations} locations`, 'success');
                    setActiveScreen('dashboard');
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                >
                  <span>Launch Live Demo with this Scale</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>

                {currentUser?.role === 'superadmin' && (
                  <button
                    onClick={() => setActiveScreen('super-admin')}
                    className="w-full py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface font-semibold border border-outline-variant/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-tertiary">key</span>
                    <span>Open Super Admin License Generator</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
            Trusted by Industry Leaders
          </h2>
          <p className="text-xs text-on-surface-variant">
            See how gym owners scale their revenue and reclaim their time with GymOS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-1 text-primary mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined material-symbols-fill text-[16px]">
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface leading-relaxed mb-4">
                "GymOS completely transformed our front desk workflow. Check-in lines are gone, and our billing recovery went from 80% to 99% in the first month."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/30">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgVe-lWwuvsr0DqeCH6zvmL0hpnXfVKek_RGr08YfFblJuqmSY8PQxapX6DLvGlmHM8ARzZ9lWBl0rZTxSMZo149HOYtWGBgfmlmaobTeyNYsiuX1MH2XwLwtYKpbkwZZA7ZSBer_h9rsT7D4Sat7hLRO1ZeTS90bKyzFB7CsBzRYmNIAkWk5mXuadKUHr7pvOuh2yow9v7mFwRnaq1TL0WV1pF7jTrqRQDoYF5gXQpOAl5PnNl1yF9A"
                alt="Marcus Vance"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-primary/40"
              />
              <div>
                <div className="font-semibold text-xs text-on-surface">Marcus Vance</div>
                <div className="text-[11px] text-on-surface-variant">Owner, Apex Fitness (4 Locations)</div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-1 text-primary mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined material-symbols-fill text-[16px]">
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface leading-relaxed mb-4">
                "The automated billing engine alone saves us 20 hours a week in administrative overhead. The member portal is sleek, intuitive, and lightning fast."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/30">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPh55c_Y8uUz2RpoZLH5ilYJ7lqYAFojTjNHshiYnzqITyTTQeFgtNhO399JaMhKd9R1pjEwCK4gXB2zn1FwQECnFRjgNLFt63b4uDIHICJOcHlADHDK0cgSu2C1zSIe1j-w32QNAE9n8ISmtwNHJYeWub1KxK0t22uZwO5vlEWkWRgEshFLa9D-HR0NX5vdQpSb5zRV6JpecfCDcElCbzQZu9SHgo9veqdZ5XPBC5lXJithD4roDQQg"
                alt="Elena Rostova"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-primary/40"
              />
              <div>
                <div className="font-semibold text-xs text-on-surface">Elena Rostova</div>
                <div className="text-[11px] text-on-surface-variant">Head Coach, Iron Forge CrossFit</div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-1 text-primary mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="material-symbols-outlined material-symbols-fill text-[16px]">
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface leading-relaxed mb-4">
                "Migrating our 1,500+ members to GymOS took less than an afternoon. The customer support team is world-class and the analytics are unmatched."
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/30">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA24PuO2yWeLrAZzERP6Jes1tlstsGpUZLMREr_vX4x9wEQ6ZQZHqKrZgVZB5IvO64DBjxrYmPG7B9QCieeSnGX3x_1_PeaRmWKFAaQeG35Y-aRZ3wIjxEHHRfEOecVV_rtYdJYDgi-bn5Gvzvn6dQ25ieeCBCQmCS9Ciwv9ZFSJvKmjjjGHcodSNNlcxP4CBTyXsTo7u26Bm4XeuCjh7IOi7hTDMtwfvH791HuciVx8UWxTk_bZmCeJA"
                alt="David Kim"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-primary/40"
              />
              <div>
                <div className="font-semibold text-xs text-on-surface">David Kim</div>
                <div className="text-[11px] text-on-surface-variant">Director, Zenith Athletics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="bg-surface-container p-8 rounded-3xl text-center relative overflow-hidden border border-outline-variant/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.08)_0,transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-xl mx-auto">
          <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Ready to Modernize Your Gym?
          </h2>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            Join over 1,200 gym owners who scaled their operations without adding friction. Start your 14-day free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                showToast('Welcome to GymOS', 'Free trial profile created.', 'success');
                setActiveScreen('dashboard');
              }}
              className="px-6 py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              Get Started Free
            </button>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="px-6 py-2.5 bg-surface-container-highest text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-variant transition-all border border-outline-variant/30"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
