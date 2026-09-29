import React, { useState, useEffect } from 'react';
import { useGym } from '../context/GymContext';
import { ScreenId } from '../types';
import { APP_LOGO } from '../data/mockData';

interface SubMenuItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: string | number;
}

interface FunctionModule {
  id: string;
  name: string;
  icon: string;
  badge?: string | number;
  badgeColor?: string;
  primaryScreen: ScreenId;
  description?: string;
  children?: SubMenuItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    isTerminalLocked,
    liveOccupancy,
    maxCapacity,
    currentUser,
    logout,
    theme,
    toggleTheme,
    isSidebarCollapsed,
    toggleSidebar,
    isSidebarPinned,
    toggleSidebarPinned,
  } = useGym();

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Consolidated Business Functions
  const functionModules: FunctionModule[] = [
    {
      id: 'analytics-reports',
      name: 'Analytics & Reports',
      icon: 'insights',
      primaryScreen: 'dashboard',
      description: 'Executive KPIs & D3 Heatmaps',
      children: [
        { id: 'dashboard', label: 'Executive Telemetry', icon: 'dashboard', badge: 'D3 Live' },
        { id: 'reports', label: 'BI & Financial Reports', icon: 'bar_chart' }
      ]
    },
    {
      id: 'operation',
      name: 'Operation',
      icon: 'tune',
      badge: `${Math.round((liveOccupancy / maxCapacity) * 100)}%`,
      badgeColor: 'primary',
      primaryScreen: 'attendance',
      description: 'Gate, Members & PT Calendar',
      children: [
        { id: 'attendance', label: 'Floor & Turnstiles', icon: 'how_to_reg', badge: `${liveOccupancy} In` },
        { id: 'members', label: 'Member Directory', icon: 'group' },
        { id: 'classes-pt', label: 'Classes & PT Calendar', icon: 'event_available', badge: 'Interactive' }
      ]
    },
    {
      id: 'crm-leads',
      name: 'CRM & Leads',
      icon: 'contacts',
      primaryScreen: 'crm-leads',
      description: 'Inquiries, Trials & Conversions'
    },
    {
      id: 'hrms',
      name: 'HRMS',
      icon: 'badge',
      primaryScreen: 'staff-hr',
      description: 'Staff, Geofence & Payroll'
    },
    {
      id: 'accounts-finance',
      name: 'Accounts & Finance',
      icon: 'payments',
      primaryScreen: 'payments',
      description: 'UPI QR, Dues & Invoices'
    },
    {
      id: 'administration',
      name: 'Tenant Administration',
      icon: 'shield_person',
      badge: 'Admin',
      badgeColor: 'tertiary',
      primaryScreen: 'tenant-rbac',
      description: 'User RBAC & Facility Config',
      children: [
        { id: 'tenant-rbac', label: 'User RBAC Matrix', icon: 'security', badge: 'RBAC' },
        { id: 'settings', label: 'Facility Settings', icon: 'settings' }
      ]
    },
    ...(isSuperAdmin ? [{
      id: 'super-admin-group',
      name: 'Platform Infrastructure',
      icon: 'shield',
      badge: 'Root',
      badgeColor: 'tertiary',
      primaryScreen: 'super-admin' as ScreenId,
      description: 'Licensing & DB Diagnostics',
      children: [
        { id: 'super-admin' as ScreenId, label: 'License & SaaS Engine', icon: 'key' },
        { id: 'system-settings' as ScreenId, label: 'Database & Diagnostics', icon: 'database', badge: 'Postgres' }
      ]
    }] : [])
  ];

  // Auto-expand the module that contains the active screen
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'analytics-reports': true,
    'operation': true,
    'administration': false
  });

  useEffect(() => {
    functionModules.forEach((mod) => {
      if (mod.children?.some((child) => child.id === activeScreen)) {
        setExpandedModules((prev) => ({ ...prev, [mod.id]: true }));
      }
    });
  }, [activeScreen]);

  const toggleModule = (modId: string, primaryScreen?: ScreenId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
    if (primaryScreen) {
      setActiveScreen(primaryScreen);
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-surface-container-low z-50 flex flex-col pt-4 pb-4 border-r border-outline-variant/30 select-none transition-all duration-300 ease-in-out ${
      isSidebarCollapsed ? 'w-20' : 'w-64'
    }`}>
      {/* Brand Logo Header & Pin / Collapse Button */}
      <div className={`px-4 mb-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div 
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          onClick={() => setActiveScreen('dashboard')}
          title="GymOS Dashboard"
        >
          <img
            alt="GymOS Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            src={APP_LOGO}
          />
          {!isSidebarCollapsed && (
            <div className="truncate">
              <span className="text-xl font-headline font-bold text-primary tracking-tight truncate block">GymOS</span>
              <span className="block text-[9px] text-on-surface-variant font-mono uppercase tracking-widest leading-none mt-0.5 truncate">
                ERP &amp; Operations
              </span>
            </div>
          )}
        </div>

        {/* Pin / Collapse Actions (Only shown when expanded or hover) */}
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebarPinned}
              title={isSidebarPinned ? "Pinned: Always expanded" : "Pin sidebar expanded"}
              className={`p-1.5 rounded-lg transition-all ${
                isSidebarPinned
                  ? 'bg-primary/20 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${isSidebarPinned ? 'fill-1' : ''}`}>
                push_pin
              </span>
            </button>
            <button
              onClick={toggleSidebar}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Links - Grouped by Function */}
      <nav className={`flex-1 space-y-1.5 overflow-y-auto ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
        {/* Super Admin Command Center Link - ONLY VISIBLE TO SUPER ADMIN */}
        {isSuperAdmin && (
          <div className="relative group">
            <button
              onClick={() => setActiveScreen('super-admin')}
              className={`w-full flex items-center ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } rounded-xl transition-all text-xs font-semibold mb-2 ${
                activeScreen === 'super-admin'
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25'
              }`}
              title={isSidebarCollapsed ? "Super Admin Platform (SaaS)" : undefined}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">admin_panel_settings</span>
                {!isSidebarCollapsed && <span>Super Admin Platform</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  activeScreen === 'super-admin' ? 'bg-black/30 text-white' : 'bg-primary/20 text-primary'
                }`}>
                  SaaS
                </span>
              )}
            </button>

            {/* Collapsed Mode Tooltip */}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-surface-container-high px-2.5 py-1.5 rounded-xl border border-outline-variant/40 shadow-xl text-xs font-semibold text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Super Admin Platform
              </div>
            )}
          </div>
        )}

        {!isSidebarCollapsed && (
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-on-surface-variant/80 font-bold">
            Core Functions
          </div>
        )}

        {functionModules.map((module) => {
          const hasChildren = Boolean(module.children && module.children.length > 0);
          const isModuleActive = hasChildren
            ? module.children?.some((c) => c.id === activeScreen)
            : activeScreen === module.primaryScreen;
          const isExpanded = expandedModules[module.id] ?? false;

          return (
            <div key={module.id} className="space-y-0.5 relative group">
              {/* Function Module Button */}
              <button
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setActiveScreen(module.primaryScreen);
                    return;
                  }
                  if (hasChildren) {
                    toggleModule(module.id, isModuleActive ? undefined : module.primaryScreen);
                  } else {
                    setActiveScreen(module.primaryScreen);
                  }
                }}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                } rounded-xl transition-all text-xs font-medium ${
                  isModuleActive
                    ? 'bg-primary/15 text-primary font-semibold border border-primary/25 shadow-xs'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
                title={isSidebarCollapsed ? `${module.name} - ${module.description}` : undefined}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`material-symbols-outlined text-[20px] shrink-0 ${
                    isModuleActive ? 'text-primary' : 'text-on-surface-variant'
                  }`}>
                    {module.icon}
                  </span>
                  {!isSidebarCollapsed && (
                    <div className="text-left truncate">
                      <span className="truncate block font-semibold">{module.name}</span>
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {module.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        module.badgeColor === 'tertiary'
                          ? 'bg-tertiary/20 text-tertiary'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {module.badge}
                      </span>
                    )}

                    {hasChildren && (
                      <span className={`material-symbols-outlined text-[16px] text-on-surface-variant transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-primary' : ''
                      }`}>
                        expand_more
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Collapsed Mode Popover Tooltip */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-surface-container-high p-2.5 rounded-xl border border-outline-variant/40 shadow-xl text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 min-w-[140px]">
                  <div className="font-semibold text-on-surface">{module.name}</div>
                  {module.description && (
                    <div className="text-[10px] text-on-surface-variant mt-0.5">{module.description}</div>
                  )}
                  {hasChildren && (
                    <div className="mt-2 pt-1.5 border-t border-outline-variant/30 space-y-1">
                      {module.children?.map(c => (
                        <div
                          key={c.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveScreen(c.id);
                          }}
                          className={`text-[11px] px-1.5 py-0.5 rounded cursor-pointer pointer-events-auto flex items-center justify-between ${
                            activeScreen === c.id ? 'text-primary font-bold bg-primary/10' : 'text-on-surface hover:text-primary'
                          }`}
                        >
                          <span>{c.label}</span>
                          {c.badge && <span className="text-[9px] opacity-70 font-mono">{c.badge}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Items / Consolidated Screens in Expanded Mode */}
              {!isSidebarCollapsed && hasChildren && isExpanded && (
                <div className="pl-6 pr-1 py-0.5 space-y-0.5 border-l-2 border-primary/30 ml-4 animate-in fade-in duration-150">
                  {module.children?.map((child) => {
                    const isChildActive = activeScreen === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => setActiveScreen(child.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          isChildActive
                            ? 'bg-primary text-on-primary font-semibold shadow-sm shadow-primary/20'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`material-symbols-outlined text-[15px] ${
                            isChildActive ? 'text-on-primary' : 'text-on-surface-variant'
                          }`}>
                            {child.icon}
                          </span>
                          <span className="truncate">{child.label}</span>
                        </div>

                        {child.badge && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                            isChildActive ? 'bg-black/30 text-white' : 'bg-surface-container-highest text-on-surface-variant'
                          }`}>
                            {child.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section: Tour Showcase (Super Admin ONLY) & Live Terminal Status */}
      <div className={`pt-2.5 mt-auto border-t border-outline-variant/30 space-y-2 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
        {/* Public Showcase / Tour Link - ONLY FOR SUPER ADMIN */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveScreen('landing')}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-1.5'
            } rounded-xl text-xs font-medium transition-all ${
              activeScreen === 'landing'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            title="Product Showcase (Super Admin Only)"
          >
            <span className="material-symbols-outlined text-[18px] text-tertiary">rocket_launch</span>
            {!isSidebarCollapsed && (
              <>
                <div className="text-left flex-1 truncate">
                  <div className="font-semibold text-on-surface text-[11px]">Product Showcase</div>
                </div>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </>
            )}
          </button>
        )}

        {/* Live Terminal Mini Status Card */}
        <div className={`bg-surface-container rounded-xl border border-outline-variant/20 ${
          isSidebarCollapsed ? 'p-2 flex flex-col items-center justify-center' : 'p-2.5'
        }`}>
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-1" title={`Terminal #04: ${liveOccupancy}/${maxCapacity} Inside`}>
              <span className={`w-2 h-2 rounded-full ${isTerminalLocked ? 'bg-error' : 'bg-primary animate-pulse'}`}></span>
              <span className="text-[10px] font-mono font-bold text-primary">{liveOccupancy}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-on-surface-variant font-medium">Gate Terminal #04</span>
                <span className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                  isTerminalLocked ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isTerminalLocked ? 'bg-error' : 'bg-primary animate-pulse'}`}></span>
                  {isTerminalLocked ? 'Locked' : 'Armed'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-on-surface">
                <span>Capacity</span>
                <span className="font-mono font-bold text-primary">{liveOccupancy} / {maxCapacity}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full mt-1 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (liveOccupancy / maxCapacity) * 100)}%` }}
                ></div>
              </div>
            </>
          )}
        </div>

        {/* Current User Session Bar */}
        <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
          {currentUser ? (
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'justify-between w-full'}`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  currentUser.role === 'superadmin' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'
                }`} title={`${currentUser.name} (${currentUser.role})`}>
                  {currentUser.role === 'superadmin' ? (
                    <span className="material-symbols-outlined text-[16px]">shield</span>
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="truncate">
                    <div className="text-xs font-semibold text-on-surface truncate">
                      {currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.name}
                    </div>
                    <div className="text-[9px] text-on-surface-variant uppercase font-mono tracking-wider">
                      {currentUser.role}
                    </div>
                  </div>
                )}
              </div>

              {!isSidebarCollapsed && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                  </button>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/15 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveScreen('login')}
              className={`w-full py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-all text-center flex items-center justify-center gap-1.5 ${
                isSidebarCollapsed ? 'px-1' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              {!isSidebarCollapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
