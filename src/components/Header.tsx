import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { BranchId } from '../types';
import { PersistentNotificationBell } from './PersistentNotificationBell';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currentBranch,
    setBranch,
    branches,
    openModal,
    showToast,
    currentUser,
    logout,
    setActiveScreen,
    activeScreen,
    switchRole,
    isDemoMode,
    toggleDemoMode,
    isLoadingData,
    refreshData,
    members,
    isSidebarCollapsed,
    toggleSidebar,
  } = useGym();
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Global Member Search State
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const matchingMembers = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.email.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [globalSearch, members]);

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
      case 'workouts-diets':
        return {
          fn: 'Studio & Fitness',
          sub: activeScreen === 'workouts-diets' ? 'Indian Diets & Workouts' : 'Classes & PT Calendar',
          icon: activeScreen === 'workouts-diets' ? 'restaurant' : 'calendar_month'
        };
      case 'announcements':
      case 'complaints':
        return {
          fn: 'Daily Operations Desk',
          sub: activeScreen === 'complaints' ? 'Complaints & Maintenance' : 'WhatsApp Broadcasts',
          icon: activeScreen === 'complaints' ? 'report_problem' : 'campaign'
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
    <header className={`fixed top-0 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 z-40 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ${
      isSidebarCollapsed ? 'left-20' : 'left-64'
    }`}>
      {/* Left: Burger Button, Location / Branch Selector & Active Function Breadcrumb */}
      <div className="flex items-center gap-2.5 relative">
        {/* Burger Button to Toggle Sidebar */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/30 flex items-center justify-center cursor-pointer group"
          title={isSidebarCollapsed ? "Expand Sidebar (Burger Menu)" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <span className="material-symbols-outlined text-[20px] text-primary transition-transform group-hover:scale-110">
            {isSidebarCollapsed ? 'menu' : 'menu_open'}
          </span>
        </button>

        <button
          onClick={() => setShowBranchMenu(!showBranchMenu)}
          className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/40 text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
          <span className="hidden sm:inline">{currentBranch.name}</span>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">expand_more</span>
        </button>

        {/* Function Module Breadcrumb Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-surface-container/70 rounded-xl border border-outline-variant/30 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">{currentFn.icon}</span>
            <span>{currentFn.fn}</span>
          </span>
          <span className="text-on-surface-variant/50 text-[10px]">/</span>
          <span className="text-on-surface font-medium text-xs truncate max-w-[140px]">
            {currentFn.sub}
          </span>
        </div>

        {showBranchMenu && (
          <div className="absolute top-12 left-10 w-64 bg-surface-container-high border border-outline-variant/50 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
      </div>

      {/* Center: Global Member Search Input */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xs md:max-w-md mx-3 text-[12px]">
        <div className="relative flex items-center">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search members, trainers, payments, classes..."
            className="w-full bg-surface-container/90 hover:bg-surface-container focus:bg-surface-container-high pl-9 pr-8 py-1.5 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-xs"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-full cursor-pointer"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown Popover */}
        {isSearchFocused && globalSearch.trim().length > 0 && (
          <div
            className="absolute top-11 left-0 right-0 bg-surface-container-high/95 backdrop-blur-md border border-outline-variant/50 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[380px] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-on-surface-variant border-b border-outline-variant/20 mb-1">
              <span>MATCHING MEMBERS ({matchingMembers.length})</span>
              <span className="text-[10px]">Esc to close</span>
            </div>

            {matchingMembers.length === 0 ? (
              <div className="py-6 px-4 text-center">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40 block mb-1">person_search</span>
                <p className="text-xs text-on-surface font-medium">No members found for "{globalSearch}"</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Try searching by member name, phone, or #MEM ID</p>
                <button
                  onClick={() => {
                    setGlobalSearch('');
                    setIsSearchFocused(false);
                    openModal('register-member');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  <span>Register New Member</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {matchingMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      setGlobalSearch('');
                      setIsSearchFocused(false);
                      openModal('member-details', member);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                          <span className="truncate">{member.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-surface-container rounded text-primary border border-primary/20">
                            {member.memberCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant truncate">
                          {member.plan} • {member.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        member.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : member.status === 'expired'
                          ? 'bg-error/15 text-error'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {member.status}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
          onClick={() => {
            toggleTheme();
            showToast('Theme Mode Switched', `Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`, 'info');
          }}
          className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/30 flex items-center gap-1.5 group cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Light and Dark Mode"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500 transition-transform group-hover:rotate-45">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="hidden sm:inline text-xs font-semibold">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Club & Date Indicator Badge (Matching inspiration image) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs">
          <span className="font-semibold text-on-surface">Ironline Strength Club</span>
          <span className="text-[11px] font-mono text-on-surface-variant">07/13/2026</span>
          <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
            <span className="material-symbols-outlined text-[12px]">fitness_center</span>
          </div>
        </div>

        {/* Persistent Real-Time Operations Alerts Notification Bell */}
        <PersistentNotificationBell />

        {/* Profile Avatar & Role Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
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
