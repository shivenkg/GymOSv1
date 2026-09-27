import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { BranchId } from '../types';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentBranch,
    setBranch,
    branches,
    openModal,
    showToast,
    isTerminalLocked,
    simulateScan,
    currentUser,
    logout,
    setActiveScreen,
    activeScreen,
    switchRole,
    isDemoMode,
    toggleDemoMode,
    isLoadingData,
    refreshData,
  } = useGym();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Geofence Offset Detected', text: 'David Chen checked in 45m outside perimeter', time: '12:55 PM', urgent: true },
    { id: 2, title: 'Expiring Memberships', text: '18 memberships expire in next 7 days', time: '1h ago', urgent: true },
    { id: 3, title: 'Pending Follow-up', text: 'Kevin Durant trial ended 2 days ago', time: '2h ago', urgent: false },
    { id: 4, title: 'Class Capacity Alert', text: 'Power Yoga Flow is full with 6 on waitlist', time: '3h ago', urgent: false },
  ];

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const getFunctionInfo = () => {
    switch (activeScreen) {
      case 'dashboard':
      case 'reports':
        return {
          fn: 'Analytics & Reports',
          sub: activeScreen === 'dashboard' ? 'Executive Telemetry' : 'BI & Financial Reports',
          icon: 'insights'
        };
      case 'attendance':
      case 'members':
      case 'classes-pt':
        return {
          fn: 'Operation',
          sub: activeScreen === 'attendance' ? 'Floor & Gate' : activeScreen === 'members' ? 'Member Registry' : 'Classes & PT Calendar',
          icon: 'tune'
        };
      case 'crm-leads':
        return { fn: 'CRM & Leads', sub: 'Inquiries & Pipeline', icon: 'contacts' };
      case 'staff-hr':
        return { fn: 'HRMS', sub: 'Staff & Payroll', icon: 'badge' };
      case 'payments':
        return { fn: 'Accounts & Finance', sub: 'UPI QR & Invoices', icon: 'payments' };
      case 'tenant-rbac':
      case 'settings':
        return { fn: 'Administration', sub: activeScreen === 'tenant-rbac' ? 'User RBAC Matrix' : 'Facility Settings', icon: 'shield_person' };
      case 'super-admin':
        return { fn: 'Super Admin Platform', sub: 'Multi-Tenant SaaS Registry', icon: 'admin_panel_settings' };
      default:
        return { fn: 'Operation', sub: 'Club Hub', icon: 'store' };
    }
  };

  const currentFn = getFunctionInfo();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between px-8">
      {/* Left: Location / Branch Selector & Active Function Breadcrumb */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setShowBranchMenu(!showBranchMenu)}
          className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
          <span>{currentBranch.name}</span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
        </button>

        {/* Function Module Breadcrumb Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface-container/70 rounded-xl border border-outline-variant/30 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">{currentFn.icon}</span>
            <span>{currentFn.fn}</span>
          </span>
          <span className="text-on-surface-variant/50 text-[10px]">/</span>
          <span className="text-on-surface font-medium text-xs truncate max-w-[140px] xl:max-w-[200px]">
            {currentFn.sub}
          </span>
        </div>

        {showBranchMenu && (
          <div className="absolute top-12 left-0 w-64 bg-surface-container-high border border-outline-variant/50 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-semibold text-on-surface-variant uppercase px-3 py-1.5 tracking-wider">
              Select Branch Location
            </div>
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setBranch(b.id as BranchId);
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                  currentBranch.id === b.id
                    ? 'bg-primary-container text-on-primary-container font-medium'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-[11px] opacity-70">{b.address}</div>
                </div>
                {currentBranch.id === b.id && (
                  <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Quick Quick-Scan trigger directly from header */}
        <button
          onClick={() => {
            simulateScan();
          }}
          disabled={isTerminalLocked}
          title="Quick simulate member check-in scan"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary text-xs font-medium border border-outline-variant/30 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">qr_code_scanner</span>
          <span>Quick Scan</span>
        </button>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-3 relative">
        {/* Live Postgres vs Demo Mode Indicator */}
        <button
          onClick={() => toggleDemoMode()}
          title={isDemoMode ? 'Running in Mock Demo Mode. Click to switch to Live PostgreSQL.' : 'Connected to Live PostgreSQL. Click to toggle Demo Mode.'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
            isDemoMode
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
          <span className="hidden sm:inline">{isDemoMode ? 'DEMO MODE' : 'POSTGRES LIVE'}</span>
        </button>

        {/* Async Data Sync / Loading Spinner */}
        {!isDemoMode && (
          <button
            onClick={() => refreshData()}
            disabled={isLoadingData}
            title="Refresh database records"
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/30 flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            <span className={`material-symbols-outlined text-[16px] text-primary ${isLoadingData ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>
        )}

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

        {/* Tenant Admin RBAC Quick Switcher */}
        <button
          onClick={() => setActiveScreen(activeScreen === 'tenant-rbac' ? 'dashboard' : 'tenant-rbac')}
          className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
            activeScreen === 'tenant-rbac'
              ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-outline-variant/30'
          }`}
          title="Tenant Admin User-Wise RBAC & Function Permissions"
        >
          <span className="material-symbols-outlined text-[16px] text-tertiary">shield_person</span>
          <span>Tenant RBAC</span>
        </button>

        {/* Quick Record Payment Action Button */}
        <button
          onClick={() => openModal('record-payment')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/30"
        >
          <span className="material-symbols-outlined text-[16px] text-tertiary">payments</span>
          <span>Record Payment</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-surface-container-high border border-outline-variant/50 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <span className="font-headline font-semibold text-sm text-on-surface">System Alerts</span>
                <span className="text-[11px] text-primary font-medium cursor-pointer hover:underline" onClick={() => showToast('Notifications', 'All marked as read', 'info')}>
                  Mark all read
                </span>
              </div>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest transition-colors cursor-pointer">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-semibold ${n.urgent ? 'text-error' : 'text-on-surface'}`}>{n.title}</span>
                      <span className="text-[10px] text-on-surface-variant">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-snug">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Switcher Button - ONLY VISIBLE TO SUPER ADMIN */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveScreen(activeScreen === 'super-admin' ? 'dashboard' : 'super-admin')}
            className={`hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
              activeScreen === 'super-admin'
                ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                : 'bg-primary/20 text-primary border-primary/40 hover:bg-primary/30'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {activeScreen === 'super-admin' ? 'store' : 'shield_person'}
            </span>
            <span>{activeScreen === 'super-admin' ? 'Gym Operations' : 'Super Admin Portal'}</span>
          </button>
        )}

        {/* Profile Avatar & Role Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 pl-2.5 bg-surface-container rounded-full hover:bg-surface-container-high transition-all border border-outline-variant/40"
          >
            <span className="text-xs font-semibold text-on-surface hidden lg:inline">
              {currentUser ? (currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.name) : 'Guest'}
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md ${
              currentUser?.role === 'superadmin' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'
            }`}>
              {currentUser?.role === 'superadmin' ? (
                <span className="material-symbols-outlined text-[18px]">shield</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">person</span>
              )}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-64 bg-surface-container-high border border-outline-variant/50 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
              <div className="px-2 py-2 border-b border-outline-variant/20 mb-2">
                <div className="font-semibold text-sm text-on-surface">
                  {currentUser ? currentUser.name : 'Not Signed In'}
                </div>
                <div className="text-[11px] text-on-surface-variant font-mono">
                  {currentUser ? currentUser.email : 'guest@gymos.cloud'}
                </div>
                <div className="mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold uppercase">
                    {currentUser ? currentUser.role : 'Guest'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-on-surface-variant uppercase px-2 py-1 font-semibold">Switch Role</div>
              {(isSuperAdmin
                ? (['superadmin', 'director', 'manager', 'staff'] as const)
                : (['director', 'manager', 'staff'] as const)
              ).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowProfileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    currentUser?.role === r ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="capitalize">{r === 'superadmin' ? 'Super Admin' : r}</span>
                  {currentUser?.role === r && <span className="material-symbols-outlined text-[16px]">check</span>}
                </button>
              ))}

              <div className="mt-2 pt-2 border-t border-outline-variant/20 space-y-1">
                <button
                  onClick={() => {
                    setActiveScreen('tenant-rbac');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-tertiary hover:bg-tertiary/10 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                  <span>Tenant Admin RBAC</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-on-surface hover:bg-surface-container transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                    <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono uppercase">Toggle</span>
                </button>

                {/* Super Admin Portal link ONLY for platform superadmin */}
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setActiveScreen('super-admin');
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    <span>Super Admin Portal</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-error hover:bg-error/15 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
