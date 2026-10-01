import React from 'react';
import { useGym } from '../context/GymContext';
import { ScreenId } from '../types';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: string | number;
  badgeColor?: 'primary' | 'orange' | 'green';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    currentUser,
    isSidebarCollapsed,
    toggleSidebar,
    logout,
    theme,
    toggleTheme,
  } = useGym();

  const isSuperAdmin = currentUser?.role === 'superadmin';

  // Navigation Groups matching the exact UI & UX from inspiration images
  const navGroups: NavGroup[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
      ],
    },
    {
      title: 'MEMBERSHIP',
      items: [
        { id: 'members', label: 'Members', icon: 'group' },
        { id: 'memberships' as ScreenId, label: 'Memberships', icon: 'credit_card', badge: 6, badgeColor: 'orange' },
        { id: 'attendance', label: 'Attendance', icon: 'event_available' },
        { id: 'payments', label: 'Payments', icon: 'payments' },
      ],
    },
    {
      title: 'STUDIO',
      items: [
        { id: 'staff-hr', label: 'Trainers', icon: 'fitness_center' },
        { id: 'classes-pt', label: 'Classes', icon: 'calendar_month' },
        { id: 'workouts-diets' as ScreenId, label: 'Workouts & Diets', icon: 'restaurant', badge: 'New', badgeColor: 'green' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'announcements' as ScreenId, label: 'Broadcasts', icon: 'campaign', badge: 4, badgeColor: 'orange' },
        { id: 'complaints' as ScreenId, label: 'Complaints Desk', icon: 'report_problem', badge: 5, badgeColor: 'orange' },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        { id: 'expenses' as ScreenId, label: 'Expenses', icon: 'receipt_long' },
        { id: 'analytics' as ScreenId, label: 'Analytics', icon: 'insights' },
        { id: 'reports', label: 'Reports', icon: 'description' },
      ],
    },
    {
      title: 'PLATFORM',
      items: [
        { id: 'landing', label: 'Product Showcase', icon: 'storefront' },
        { id: 'crm-leads', label: 'CRM & Leads', icon: 'contacts' },
        { id: 'tenant-rbac', label: 'Tenant RBAC', icon: 'shield_person' },
        ...(isSuperAdmin
          ? [
              { id: 'super-admin' as ScreenId, label: 'Super Admin', icon: 'key' },
              { id: 'system-settings' as ScreenId, label: 'System Diagnostics', icon: 'database' },
            ]
          : []),
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline-variant/30 flex flex-col justify-between z-40 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header: Brand & Club Profile */}
      <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
        <div
          onClick={() => setActiveScreen('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
        >
          {/* GymFlow / Ironline Club Icon */}
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">fitness_center</span>
          </div>

          {!isSidebarCollapsed && (
            <div className="truncate">
              <div className="text-sm font-headline font-bold text-on-surface truncate flex items-center gap-1.5">
                <span>Ironline Strength</span>
              </div>
              <div className="text-[10px] text-on-surface-variant font-medium">Gym Management</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isSidebarCollapsed ? (
              <div className="text-[10px] font-mono font-bold text-on-surface-variant/70 tracking-wider uppercase px-3 py-1">
                {group.title}
              </div>
            ) : (
              <div className="h-2"></div>
            )}

            {group.items.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`material-symbols-outlined text-[19px] shrink-0 transition-colors ${
                        isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.badgeColor === 'orange'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Footer: Collapse & User Bar */}
      <div className="p-3 border-t border-outline-variant/20 space-y-1.5">
        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center ${
            isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors`}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          {!isSidebarCollapsed && (
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center ${
            isSidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors`}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!isSidebarCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
