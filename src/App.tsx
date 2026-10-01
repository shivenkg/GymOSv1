/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Modals } from './components/Modals';
import { ToastContainer } from './components/ToastContainer';

import { DashboardOverview } from './views/DashboardOverview';
import { MembersView } from './views/MembersView';
import { AttendanceView } from './views/AttendanceView';
import { ClassesPTView } from './views/ClassesPTView';
import { WorkoutsDietsView } from './views/WorkoutsDietsView';
import { CRMLeadsView } from './views/CRMLeadsView';
import { ComplaintsView } from './views/ComplaintsView';
import { AnnouncementsView } from './views/AnnouncementsView';
import { StaffHRView } from './views/StaffHRView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsAnalyticsView } from './views/ReportsAnalyticsView';
import { ExpensesView } from './views/ExpensesView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { LandingTourView } from './views/LandingTourView';
import { LoginView } from './views/LoginView';
import { SuperAdminView } from './views/SuperAdminView';
import { TenantAdminRBACView } from './views/TenantAdminRBACView';
import { SystemSettingsView } from './views/SystemSettingsView';

const MainContent: React.FC = () => {
  const { activeScreen, currentUser, isSidebarCollapsed } = useGym();

  // Full screen dedicated login experience
  if (activeScreen === 'login') {
    return (
      <div className="min-h-screen bg-surface text-on-surface">
        <LoginView />
        <ToastContainer />
      </div>
    );
  }

  // Full screen product showcase landing page (no sidebar)
  if (activeScreen === 'landing') {
    return (
      <div className="min-h-screen bg-surface text-on-surface">
        <LandingTourView />
        <Modals />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Sidebar />
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <Header />
        <main className="relative pt-20 px-4 sm:px-8 min-h-screen bg-surface">
          {activeScreen === 'dashboard' && <DashboardOverview />}
          {activeScreen === 'members' && <MembersView />}
          {activeScreen === 'memberships' && <MembersView />}
          {activeScreen === 'attendance' && <AttendanceView />}
          {activeScreen === 'classes-pt' && <ClassesPTView />}
          {activeScreen === 'workouts-diets' && <WorkoutsDietsView />}
          {activeScreen === 'crm-leads' && <CRMLeadsView />}
          {activeScreen === 'announcements' && <AnnouncementsView />}
          {activeScreen === 'complaints' && <ComplaintsView />}
          {activeScreen === 'staff-hr' && <StaffHRView />}
          {activeScreen === 'payments' && <PaymentsView />}
          {activeScreen === 'expenses' && <ExpensesView />}
          {activeScreen === 'analytics' && <AnalyticsView />}
          {activeScreen === 'reports' && <ReportsAnalyticsView />}
          {activeScreen === 'settings' && <SettingsView />}
          {activeScreen === 'tenant-rbac' && <TenantAdminRBACView />}
          {activeScreen === 'system-settings' && (
            currentUser?.role === 'superadmin' ? <SystemSettingsView /> : <DashboardOverview />
          )}
          {activeScreen === 'super-admin' && (
            currentUser?.role === 'superadmin' ? <SuperAdminView /> : <DashboardOverview />
          )}
        </main>
      </div>

      <Modals />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <GymProvider>
      <MainContent />
    </GymProvider>
  );
}
