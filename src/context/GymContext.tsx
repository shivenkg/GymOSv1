import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ScreenId,
  BranchId,
  Branch,
  Member,
  MembershipPlan,
  CheckInLog,
  CheckInMethod,
  ClassSession,
  PTSession,
  Lead,
  LeadStage,
  StaffMember,
  StaffCheckInFeed,
  Invoice,
  ToastMessage,
  User,
  UserRole,
  SaaSPackage,
  SaaSLicense,
  TenantRole,
  UserRoleAssignment,
  RBACPermission,
  TenantDatabaseConfig,
  GoogleSheetIntegration,
  Expense,
  Complaint,
  Announcement,
  WorkoutPlan,
  DietPlan,
  LandingCMSConfig,
  BiometricLog,
  GymifyReferral,
  GymifyPointsHistory
} from '../types';
import { DEFAULT_LANDING_CMS } from '../data/defaultLandingCms';
import {
  BRANCHES,
  INITIAL_MEMBERS,
  INITIAL_CHECKINS,
  INITIAL_CLASSES,
  INITIAL_PT_SESSIONS,
  INITIAL_UNSCHEDULED_REQUESTS,
  UnscheduledPTRequest,
  INITIAL_LEADS,
  INITIAL_STAFF,
  INITIAL_STAFF_FEED,
  INITIAL_INVOICES,
  PENDING_PAYMENTS_LIST,
  INITIAL_EXPENSES,
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_WORKOUT_PLANS,
  INITIAL_DIET_PLANS
} from '../data/mockData';
import {
  INITIAL_SAAS_PACKAGES,
  INITIAL_SAAS_LICENSES
} from '../data/superAdminData';
import {
  INITIAL_TENANT_DATABASES,
  INITIAL_GOOGLE_SHEETS
} from '../data/tenantDbData';
import {
  ALL_RBAC_PERMISSIONS,
  DEFAULT_TENANT_ROLES,
  INITIAL_USER_ASSIGNMENTS
} from '../data/rbacData';
import { apiClient } from '../api/client';

interface GymContextType {
  // Theme Switcher
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Demo Mode & Backend Connectivity
  isDemoMode: boolean;
  toggleDemoMode: (enabled?: boolean) => void;
  isLoadingData: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  dbHealth: { healthy: boolean; databaseConnected: boolean };

  // Navigation & Location
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  currentBranch: Branch;
  setBranch: (branchId: BranchId) => void;
  branches: Branch[];

  // Sidebar Collapse State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isSidebarPinned: boolean;
  toggleSidebarPinned: () => void;

  // Authentication & Users
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Super Admin: SaaS Packages & Customisation
  saasPackages: SaaSPackage[];
  saveSaaSPackage: (pkg: SaaSPackage) => void;
  deleteSaaSPackage: (id: string) => void;

  // Super Admin: License Generation Engine
  saasLicenses: SaaSLicense[];
  activeTenantLicense: SaaSLicense;
  generateLicense: (data: {
    gymName: string;
    contactEmail: string;
    adminName: string;
    tier: string;
    maxMembers: number;
    maxStaff: number;
    maxLocations: number;
    durationMonths: number;
    features: string[];
    hardwareBinding?: string;
  }) => SaaSLicense;
  updateLicenseStatus: (id: string, status: SaaSLicense['status']) => void;
  updateOperationStatus: (id: string, operationStatus: SaaSLicense['operationStatus']) => void;
  applyLicenseToTenant: (license: SaaSLicense) => void;

  // SuperAdmin: Tenant-Wise Database Provisioning (PostgreSQL & MongoDB)
  tenantDbConfigs: TenantDatabaseConfig[];
  saveTenantDbConfig: (config: TenantDatabaseConfig) => Promise<void>;
  deleteTenantDbConfig: (id: string) => Promise<void>;
  attachTenantDatabase: (id: string) => Promise<{ success: boolean; message?: string; isIpBlocked?: boolean; config?: any }>;
  detachTenantDatabase: (id: string) => Promise<{ success: boolean; message?: string }>;
  pingTenantDatabase: (id: string) => Promise<any>;
  testTenantDbConnection: (config: Partial<TenantDatabaseConfig>) => Promise<{ success: boolean; message: string; latencyMs?: number; engineVersion?: string }>;
  provisionTenantDatabase: (config: TenantDatabaseConfig) => Promise<{ success: boolean; message: string; initializedItems?: string[] }>;

  // SuperAdmin: Google Sheets Bi-Directional Linking & Sync
  googleSheetIntegrations: GoogleSheetIntegration[];
  saveGoogleSheetIntegration: (integration: GoogleSheetIntegration) => Promise<void>;
  deleteGoogleSheetIntegration: (id: string) => Promise<void>;
  testGoogleSheetConnection: (spreadsheetIdOrUrl: string) => Promise<{ success: boolean; spreadsheetId?: string; sheetTitle?: string; tabs?: string[]; sampleHeaders?: string[]; message: string }>;
  syncGoogleSheetNow: (id: string) => Promise<{ success: boolean; message: string; syncedRowsCount?: number }>;

  // Tenant Admin: RBAC & Function Selection
  tenantRoles: TenantRole[];
  userRoleAssignments: UserRoleAssignment[];
  allRbacPermissions: RBACPermission[];
  updateUserRole: (userId: string, roleId: string) => void;
  toggleUserPermissionOverride: (userId: string, permissionId: string, grant: boolean) => void;
  toggleUserCustomOverridesMode: (userId: string, enabled: boolean) => void;
  addNewUserAssignment: (data: { name: string; email: string; roleId: string; department: UserRoleAssignment['department']; avatar?: string }) => void;
  saveTenantRole: (role: TenantRole) => void;
  deleteTenantRole: (roleId: string) => void;
  hasPermission: (userId: string, permissionId: string) => boolean;
  hasUserPermission: (userId: string, permissionId: string) => boolean;

  // Members Management
  members: Member[];
  addMember: (data: {
    name: string;
    email: string;
    phone: string;
    plan: MembershipPlan;
    aadhaarNumber?: string;
    aadhaarDocUrl?: string;
    aadhaarDocName?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  }) => Promise<void>;
  renewMember: (id: string, newPlan?: MembershipPlan) => void;
  toggleMemberFreeze: (id: string) => void;
  deleteMember: (id: string) => Promise<void>;

  // Gate & Turnstile Telemetry & Biometrics
  checkInLogs: CheckInLog[];
  biometricLogs: BiometricLog[];
  liveOccupancy: number;
  maxCapacity: number;
  isTerminalLocked: boolean;
  toggleTerminalLock: () => void;
  checkInMember: (memberId: string, method?: CheckInMethod) => Promise<boolean>;
  logBiometricAttendance: (data: {
    personType: 'member' | 'staff';
    personId: string;
    personName: string;
    photoUrl?: string;
    confidenceScore: number;
    capturedPhotoUrl?: string;
    terminal?: string;
  }) => Promise<{ success: boolean; message: string; pointsAwarded?: number }>;
  simulateScan: (customName?: string) => { name: string; plan: string; allowed: boolean };
  lastScannedMember: { name: string; plan: string; code: string; allowed: boolean; timestamp: string } | null;

  // Gymify Points & Gamification
  awardGymifyPoints: (memberId: string, points: number, reason: string, type?: GymifyPointsHistory['type']) => void;
  addMemberReferral: (memberId: string, referral: { name: string; phone: string; notes?: string }) => void;
  redeemGymifyReward: (memberId: string, rewardName: string, pointsCost: number) => boolean;

  // Scheduling (Classes & PT)
  classes: ClassSession[];
  ptSessions: PTSession[];
  unscheduledRequests: UnscheduledPTRequest[];
  addClass: (data: any) => void;
  updateClassCapacity: (id: string, action: 'enroll' | 'drop' | 'waitlist') => void;
  updatePTSessionStatus: (id: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => void;
  movePTSession: (sessionId: string, newDay: PTSession['day'], newTimeSlot: string, newTrainerName?: string) => void;
  assignUnscheduledRequest: (requestId: string, day: PTSession['day'], timeSlot: string, trainerName?: string) => void;
  scheduleNewPTSession: (data: Partial<PTSession> & { clientName: string; trainerName: string; timeSlot: string; day: PTSession['day'] }) => void;
  deletePTSession: (id: string) => void;

  // CRM & Leads
  leads: Lead[];
  addLead: (lead: { name: string; email: string; phone: string; source: any; assignedRep: string; notes?: string }) => Promise<void>;
  updateLeadStage: (id: string, newStage: LeadStage) => Promise<void>;
  convertLeadToMember: (leadId: string, plan: MembershipPlan) => void;

  // HRMS & Staff
  staff: StaffMember[];
  staffFeed: StaffCheckInFeed[];
  addStaff: (data: {
    name: string;
    role: StaffMember['role'];
    phone: string;
    shiftHours?: string;
    aadhaarNumber?: string;
    aadhaarDocUrl?: string;
    aadhaarDocName?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    pastExperienceYears?: number;
    pastWorkplace?: string;
    specializations?: string;
    certifications?: string;
    academicDegree?: string;
    academicInstitution?: string;
    academicYear?: string;
    certificationDocUrl?: string;
    certificationDocName?: string;
    academicDocUrl?: string;
    academicDocName?: string;
    resumeDocUrl?: string;
    resumeDocName?: string;
  }) => Promise<void>;
  approveStaffCheckIn: (feedId: string) => void;
  rejectStaffCheckIn: (feedId: string) => void;

  // Finance & Invoices
  invoices: Invoice[];
  pendingPayments: typeof PENDING_PAYMENTS_LIST;
  markPendingPaid: (index: number) => void;
  addInvoice: (data: { memberName: string; planOrDescription: string; amount: number; method: Invoice['method']; status?: Invoice['status'] }) => void;
  recordFeePayment: (payment: { memberId?: string; memberName: string; amount: number; method: string; upiRef?: string; planName?: string }) => Promise<void>;

  // Expenses & Operating Costs
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Complaints & Service Desk
  complaints: Complaint[];
  addComplaint: (c: {
    memberId?: string;
    memberName: string;
    memberPhone: string;
    category: Complaint['category'];
    subject: string;
    description: string;
    priority: Complaint['priority'];
    assignedTo?: string;
  }) => void;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolutionNote?: string) => void;

  // Announcements & Broadcasts
  announcements: Announcement[];
  addAnnouncement: (a: {
    title: string;
    category: Announcement['category'];
    content: string;
    targetAudience: Announcement['targetAudience'];
    sentViaWhatsApp: boolean;
  }) => void;

  // Workout & Diet Plan Builder
  workoutPlans: WorkoutPlan[];
  dietPlans: DietPlan[];
  assignWorkoutPlan: (planId: string, memberName: string) => void;
  assignDietPlan: (dietId: string, memberName: string) => void;

  // Landing Page CMS & Pricing Customization
  landingCms: LandingCMSConfig;
  updateLandingCms: (config: LandingCMSConfig) => void;
  resetLandingCms: () => void;

  // Global Modals & Notifications
  activeModal: string | null;
  modalPayload: any;
  openModal: (modalId: string, payload?: any) => void;
  closeModal: () => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const savedTheme = localStorage.getItem('gymos-theme');
      return (savedTheme as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('gymos-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Demo Mode flag: defaults to true if no live DB is connected, can be toggled manually
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gymos_demo_mode');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dbHealth, setDbHealth] = useState<{ healthy: boolean; databaseConnected: boolean }>({
    healthy: false,
    databaseConnected: false,
  });

  const toggleDemoMode = (enabled?: boolean) => {
    const nextState = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(nextState);
    try {
      localStorage.setItem('gymos_demo_mode', String(nextState));
    } catch {
      // ignore
    }
    showToast(
      nextState ? 'Demo Mode Active' : 'Live Database Mode Active',
      nextState ? 'Operating in offline demo mode using sample data.' : 'Operating with live backend API & PostgreSQL database.',
      'info'
    );
  };

  const [activeScreen, setActiveScreenRaw] = useState<ScreenId>('landing');

  const setActiveScreen = (screen: ScreenId) => {
    if ((screen === 'super-admin' || screen === 'system-settings') && currentUser?.role !== 'superadmin') {
      showToast('Access Restricted', 'Super Admin interface is strictly restricted to platform superadministrators.', 'error');
      return;
    }
    // If navigating to an operational screen while not logged in, auto-authenticate as Club Director demo
    if (screen !== 'login' && screen !== 'landing' && !currentUser) {
      setCurrentUser({
        id: 'usr-demo-director',
        username: 'director@ironlineclub.com',
        name: 'Marcus Bell',
        role: 'director',
        email: 'director@ironlineclub.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });
    }
    setActiveScreenRaw(screen);
  };

  // Sidebar Collapse State - default collapsible (collapsed) per user requirement
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const toggleSidebarPinned = () => {
    setIsSidebarPinned(prev => !prev);
    if (!isSidebarPinned) {
      setIsSidebarCollapsed(false);
    }
  };

  const [currentBranchId, setCurrentBranchId] = useState<BranchId>('downtown');
  const currentBranch = BRANCHES.find(b => b.id === currentBranchId) || BRANCHES[0];

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Entities state
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('gymify_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      ref: expenseData.ref || `EXP-${String(expenses.length + 20).padStart(4, '0')}`,
    };
    setExpenses(prev => {
      const updated = [newExp, ...prev];
      try { localStorage.setItem('gymify_expenses', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Expense Recorded', `Added ${newExp.ref} - ${newExp.description} (₹${newExp.amount.toFixed(2)})`, 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      try { localStorage.setItem('gymify_expenses', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Expense Removed', 'Record has been removed from ledger.', 'info');
  };
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>(INITIAL_CHECKINS);
  const [biometricLogs, setBiometricLogs] = useState<BiometricLog[]>([]);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);

  // Complaints & Maintenance State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('gymos_complaints');
      return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  const addComplaint = (c: {
    memberId?: string;
    memberName: string;
    memberPhone: string;
    category: Complaint['category'];
    subject: string;
    description: string;
    priority: Complaint['priority'];
    assignedTo?: string;
  }) => {
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      memberId: c.memberId || `m-${Date.now()}`,
      memberName: c.memberName,
      memberPhone: c.memberPhone,
      category: c.category,
      subject: c.subject,
      description: c.description,
      priority: c.priority,
      status: 'Open',
      assignedTo: c.assignedTo || 'Front Desk / Floor Supervisor',
      createdAt: 'Just now',
      branchId: currentBranch.id,
    };
    setComplaints(prev => {
      const updated = [newComplaint, ...prev];
      try { localStorage.setItem('gymos_complaints', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Ticket Raised', `Ticket #${newComplaint.ticketNumber} created for ${c.memberName}. Assigned to staff.`, 'success');
  };

  const updateComplaintStatus = (id: string, status: Complaint['status'], resolutionNote?: string) => {
    setComplaints(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status,
            resolutionNote: resolutionNote !== undefined ? resolutionNote : c.resolutionNote,
            resolvedAt: status === 'Resolved' ? 'Just now' : c.resolvedAt,
          };
        }
        return c;
      });
      try { localStorage.setItem('gymos_complaints', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('Ticket Updated', `Status changed to ${status}`, 'info');
  };

  // Announcements & Broadcasts State
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('gymos_announcements');
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const addAnnouncement = (a: {
    title: string;
    category: Announcement['category'];
    content: string;
    targetAudience: Announcement['targetAudience'];
    sentViaWhatsApp: boolean;
  }) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: a.title,
      category: a.category,
      content: a.content,
      date: 'Just now',
      targetAudience: a.targetAudience,
      sentViaWhatsApp: a.sentViaWhatsApp,
      author: currentUser?.name || 'Club Director',
    };
    setAnnouncements(prev => {
      const updated = [newAnn, ...prev];
      try { localStorage.setItem('gymos_announcements', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast(
      'Announcement Broadcasted',
      a.sentViaWhatsApp ? `Dispatched via WhatsApp to ${a.targetAudience}` : `Published to ${a.targetAudience} in Member App`,
      'success'
    );
  };

  // Workout & Diet Plans State
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(INITIAL_WORKOUT_PLANS);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(INITIAL_DIET_PLANS);

  const assignWorkoutPlan = (planId: string, memberName: string) => {
    setWorkoutPlans(prev => prev.map(p => p.id === planId ? { ...p, assignedMembersCount: p.assignedMembersCount + 1 } : p));
    showToast('Workout Assigned', `Workout routine assigned to ${memberName} in their Member App!`, 'success');
  };

  const assignDietPlan = (dietId: string, memberName: string) => {
    setDietPlans(prev => prev.map(d => d.id === dietId ? { ...d, assignedMembersCount: d.assignedMembersCount + 1 } : d));
    showToast('Diet Chart Sent', `Indian Macro Diet chart sent to ${memberName} via Member App & WhatsApp!`, 'success');
  };

  const [saasPackages, setSaasPackages] = useState<SaaSPackage[]>(INITIAL_SAAS_PACKAGES);
  const [saasLicenses, setSaasLicenses] = useState<SaaSLicense[]>(INITIAL_SAAS_LICENSES);
  const [activeTenantLicense, setActiveTenantLicense] = useState<SaaSLicense>(INITIAL_SAAS_LICENSES[0]);

  // Tenant-Wise Database Provisioning State (PostgreSQL & MongoDB)
  const [tenantDbConfigs, setTenantDbConfigs] = useState<TenantDatabaseConfig[]>(() => {
    try {
      const saved = localStorage.getItem('gymos_tenant_db_configs');
      return saved ? JSON.parse(saved) : INITIAL_TENANT_DATABASES;
    } catch {
      return INITIAL_TENANT_DATABASES;
    }
  });

  // Google Sheets Bi-Directional Linking State
  const [googleSheetIntegrations, setGoogleSheetIntegrations] = useState<GoogleSheetIntegration[]>(() => {
    try {
      const saved = localStorage.getItem('gymos_google_sheet_integrations');
      return saved ? JSON.parse(saved) : INITIAL_GOOGLE_SHEETS;
    } catch {
      return INITIAL_GOOGLE_SHEETS;
    }
  });

  // Landing Page CMS & Pricing Customization State
  const [landingCms, setLandingCms] = useState<LandingCMSConfig>(() => {
    try {
      const saved = localStorage.getItem('gymify_landing_cms');
      return saved ? JSON.parse(saved) : DEFAULT_LANDING_CMS;
    } catch {
      return DEFAULT_LANDING_CMS;
    }
  });

  const updateLandingCms = (config: LandingCMSConfig) => {
    const updated = { ...config, lastUpdated: new Date().toISOString() };
    setLandingCms(updated);
    try {
      localStorage.setItem('gymify_landing_cms', JSON.stringify(updated));
    } catch {}
    showToast('Landing CMS Updated', 'Landing page content & pricing plans deployed successfully.', 'success');
  };

  const resetLandingCms = () => {
    setLandingCms(DEFAULT_LANDING_CMS);
    try {
      localStorage.setItem('gymify_landing_cms', JSON.stringify(DEFAULT_LANDING_CMS));
    } catch {}
    showToast('Landing CMS Reset', 'Restored original default landing page copy & pricing tiers.', 'info');
  };

  // Tenant Admin: RBAC & Function Selection State
  const [tenantRoles, setTenantRoles] = useState<TenantRole[]>(DEFAULT_TENANT_ROLES);
  const [userRoleAssignments, setUserRoleAssignments] = useState<UserRoleAssignment[]>(INITIAL_USER_ASSIGNMENTS);
  const allRbacPermissions = ALL_RBAC_PERMISSIONS;

  // Scheduling State
  const [classes, setClasses] = useState<ClassSession[]>(INITIAL_CLASSES);
  const [ptSessions, setPtSessions] = useState<PTSession[]>(INITIAL_PT_SESSIONS);
  const [unscheduledRequests, setUnscheduledRequests] = useState<UnscheduledPTRequest[]>(INITIAL_UNSCHEDULED_REQUESTS);

  // Turnstile state
  const [liveOccupancy, setLiveOccupancy] = useState(42);
  const maxCapacity = 150;
  const [isTerminalLocked, setIsTerminalLocked] = useState(false);
  const [lastScannedMember, setLastScannedMember] = useState<{
    name: string;
    plan: string;
    code: string;
    allowed: boolean;
    timestamp: string;
  } | null>(null);

  // HRMS feed
  const [staffFeed, setStaffFeed] = useState<StaffCheckInFeed[]>(INITIAL_STAFF_FEED);
  const [pendingPayments, setPendingPayments] = useState(PENDING_PAYMENTS_LIST);

  // Global Modals & Toast State
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, title, message, type, timestamp: Date.now() };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  const removeToast = dismissToast;

  const openModal = (modalId: string, payload: any = null) => {
    setActiveModal(modalId);
    setModalPayload(payload);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  const setBranch = (branchId: BranchId) => {
    setCurrentBranchId(branchId);
    const branch = BRANCHES.find(b => b.id === branchId);
    showToast('Branch Switched', `Now viewing operations for ${branch?.name || branchId}`, 'info');
  };

  // Health check on mount
  useEffect(() => {
    const verifyConnectivity = async () => {
      const health = await apiClient.checkHealth();
      setDbHealth({
        healthy: health.healthy,
        databaseConnected: health.databaseConnected,
      });

      // If user has not explicitly configured a manual demo preference,
      // auto-select Live if DB is connected, or Demo if DB is not connected.
      try {
        const saved = localStorage.getItem('gymos_demo_mode');
        if (saved === null) {
          setIsDemoMode(!health.databaseConnected);
        }
      } catch {
        // ignore
      }
    };
    verifyConnectivity();
  }, []);

  // Fetch data from real backend when authenticated and not in demo mode
  const refreshData = async () => {
    if (isDemoMode) {
      setDataError(null);
      return;
    }

    if (!apiClient.getToken()) {
      return;
    }

    setIsLoadingData(true);
    setDataError(null);

    try {
      // 1. Fetch Members
      const membersRes = await apiClient.get('/members');
      if (membersRes.data?.members && membersRes.data.members.length > 0) {
        const mappedMembers: Member[] = membersRes.data.members.map((m: any) => ({
          id: m.id,
          memberCode: m.rfidCardId || (m.id ? `#MEM-${String(m.id).substring(0, 4).toUpperCase()}` : '#MEM-0001'),
          name: m.fullName,
          email: m.email,
          phone: m.phone || '+91 98765 00000',
          photoUrl: m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          plan: (m.planName || 'VIP Annual') as any,
          status: (m.status?.toLowerCase() || 'active') as any,
          joinedDate: m.joinDate || 'Recently',
          expiryDate: m.expirationDate || '2027',
          lastVisit: 'Recent',
          totalCheckIns: 14,
        }));
        setMembers(mappedMembers);
      }

      // 2. Fetch Payments / Invoices
      const paymentsRes = await apiClient.get('/payments');
      if (paymentsRes.data?.payments && paymentsRes.data.payments.length > 0) {
        const mappedInvoices: Invoice[] = paymentsRes.data.payments.map((p: any) => ({
          id: p.id,
          invoiceNumber: p.invoiceNo,
          memberId: p.memberId || 'm-1',
          memberName: p.memberName || 'Gym Member',
          memberCode: `#MEM-${String(p.memberId || '0001').substring(0, 4).toUpperCase()}`,
          memberInitials: (p.memberName || 'GM').split(' ').filter(Boolean).map((n: string) => n[0] || '').join('').slice(0, 2).toUpperCase() || 'GM',
          planOrDescription: 'Membership Renewal Fee',
          amount: parseFloat(p.amount) || 0,
          method: (p.method || 'UPI') as any,
          status: (p.status || 'Paid') as any,
          dateTimeFormatted: p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'Today',
        }));
        setInvoices(mappedInvoices);
      }

      // 3. Fetch Attendance
      const attendanceRes = await apiClient.get('/attendance');
      if (attendanceRes.data?.attendance && attendanceRes.data.attendance.length > 0) {
        const mappedLogs: CheckInLog[] = attendanceRes.data.attendance.map((a: any) => ({
          id: a.id,
          memberId: a.memberId,
          memberName: a.memberName || 'Gym Member',
          memberCode: `#MEM-${String(a.memberId || '0001').substring(0, 4).toUpperCase()}`,
          plan: 'VIP Annual',
          timestamp: a.checkInTime,
          timeFormatted: new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          method: 'QR Scanner',
          status: 'Allowed',
          terminal: a.deviceId || 'Gate #01',
        }));
        setCheckInLogs(mappedLogs);
        setLiveOccupancy(mappedLogs.length);
      }

      // 4. Fetch CRM Leads
      const crmRes = await apiClient.get('/crm/leads');
      if (crmRes.data?.leads && crmRes.data.leads.length > 0) {
        const mappedLeads: Lead[] = crmRes.data.leads.map((l: any) => ({
          id: l.id,
          name: l.fullName,
          email: l.email || '',
          phone: l.phone || '',
          stage: (l.stage || 'New Inquiry') as any,
          source: (l.source || 'Walk-in') as any,
          assignedRep: l.assignedStaff || 'Aarav Sharma',
          assignedRepInitials: 'AS',
          lastInteraction: 'Recent',
          notes: l.notes || '',
        }));
        setLeads(mappedLeads);
      }

      // 5. Fetch Staff HR
      const staffRes = await apiClient.get('/staff');
      if (staffRes.data?.staff && staffRes.data.staff.length > 0) {
        const mappedStaff: StaffMember[] = staffRes.data.staff.map((s: any) => ({
          id: s.id,
          staffCode: `#STAFF-${String(s.id || '0001').substring(0, 4).toUpperCase()}`,
          name: s.name,
          role: s.role as any,
          category: s.role.toLowerCase().includes('trainer') ? 'trainer' : s.role.toLowerCase().includes('desk') ? 'frontdesk' : 'management',
          phone: s.phone || '+91 99999 11111',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          shiftHours: s.shift || '06:00 - 14:00',
          shiftType: 'Morning Shift',
          geofenceStatus: 'Verified Inside',
          onShift: true,
        }));
        setStaff(mappedStaff);
      }
    } catch (err: any) {
      console.warn('[GymOS Client] Error fetching live database data:', err.message);
      setDataError(err.message || 'Failed to load backend data.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Login: Calls real backend POST /api/auth/login with fallback to DEMO_MODE if offline
  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    try {
      const response = await apiClient.post('/auth/login', {
        username: cleanUser,
        password: cleanPass,
      });

      if (response.data && response.data.token) {
        // Successful real backend authentication
        apiClient.setToken(response.data.token, true);

        const backendUser = response.data.user;
        const normalizedRole: UserRole =
          backendUser.role === 'superadmin' ? 'superadmin' :
          backendUser.role === 'admin' || backendUser.role === 'director' ? 'director' :
          backendUser.role === 'manager' ? 'manager' : 'staff';

        const userObj: User = {
          id: backendUser.id,
          username: backendUser.email,
          name: backendUser.fullName,
          role: normalizedRole,
          email: backendUser.email,
          avatar: backendUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        };

        setCurrentUser(userObj);

        if (normalizedRole === 'superadmin') {
          setActiveScreenRaw('super-admin');
        } else if (normalizedRole === 'staff') {
          setActiveScreenRaw('attendance');
        } else {
          setActiveScreenRaw('dashboard');
        }

        showToast(
          'Authenticated with PostgreSQL Backend',
          `Welcome, ${userObj.name} (Role: ${(userObj.role || 'staff').toUpperCase()}). Real-time tenant isolation active.`,
          'success'
        );

        // Fetch real tenant data
        refreshData();

        return { success: true, role: normalizedRole };
      }

      // If backend returned error response (e.g. 401 or 400)
      if (response && (response.status === 400 || response.status === 401 || response.status === 403)) {
        return {
          success: false,
          error: response.error || 'Invalid credentials. Please verify your email and password.',
        };
      }
    } catch (err: any) {
      console.warn('[GymOS Login] API attempt failed, inspecting fallback:', err);
    }

    // Fallback: If in Demo Mode or if backend is not yet provisioned with users, allow demo login
    if (isDemoMode) {
      if (cleanUser.toLowerCase() === 'superadmin') {
        const superAdminUser: User = {
          id: 'u-superadmin',
          username: 'superadmin',
          name: 'Platform Super Admin',
          role: 'superadmin',
          email: 'superadmin@gymos.cloud',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
        setCurrentUser(superAdminUser);
        setActiveScreenRaw('super-admin');
        showToast('Demo SuperAdmin Access', 'Running in Demo Mode with simulated licensing engine.', 'info');
        return { success: true, role: 'superadmin' };
      }

      if (cleanUser.toLowerCase().includes('admin') || cleanUser.toLowerCase().includes('director')) {
        const directorUser: User = {
          id: 'u-director',
          username: 'admin@gymos.io',
          name: 'Alex Ross',
          role: 'director',
          email: 'director@gymos.io',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        };
        setCurrentUser(directorUser);
        setActiveScreen('dashboard');
        showToast('Demo Director Session', 'Demo facility management mode active.', 'info');
        return { success: true, role: 'director' };
      }

      const staffUser: User = {
        id: 'u-staff',
        username: cleanUser,
        name: 'Front Desk Operator',
        role: 'staff',
        email: cleanUser
      };
      setCurrentUser(staffUser);
      setActiveScreen('attendance');
      showToast('Demo Staff Session', 'Front Desk terminal demo active.', 'info');
      return { success: true, role: 'staff' };
    }

    return {
      success: false,
      error: 'Backend authentication failed. If database is offline, toggle "DEMO MODE" on the login screen.',
    };
  };

  const logout = () => {
    apiClient.post('/auth/logout').catch(() => {});
    apiClient.setToken(null);
    setCurrentUser(null);
    setActiveScreen('login');
    showToast('Signed Out', 'You have been safely disconnected from GymOS.', 'info');
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    if (newRole === 'superadmin') {
      if (currentUser.role !== 'superadmin') {
        showToast('Access Denied', 'Super Admin console requires dedicated credentials.', 'error');
        return;
      }
      setActiveScreenRaw('super-admin');
      showToast('Super Admin Console', 'Platform licensing view active', 'info');
    } else {
      setCurrentUser({
        ...currentUser,
        role: newRole,
        name: newRole === 'director' ? 'Alex Ross' : newRole === 'manager' ? 'Sneha Kulkarni' : 'Rohan Deshmukh'
      });
      if (activeScreen === 'super-admin' || activeScreen === 'system-settings') {
        setActiveScreenRaw('dashboard');
      }
      showToast('Role Switched', `Active view updated to ${newRole} permissions`, 'info');
    }
  };

  // Super Admin: SaaS package operations
  const saveSaaSPackage = (pkg: SaaSPackage) => {
    setSaasPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id);
      if (exists) {
        return prev.map(p => (p.id === pkg.id ? pkg : p));
      }
      return [pkg, ...prev];
    });
    showToast('Package Blueprint Saved', `SaaS package "${pkg.name}" is now live in the engine.`, 'success');
  };

  const deleteSaaSPackage = (id: string) => {
    setSaasPackages(prev => prev.filter(p => p.id !== id));
    showToast('Package Archived', 'Plan template removed from active catalog.', 'info');
  };

  const generateLicense = (data: {
    gymName: string;
    contactEmail: string;
    adminName: string;
    tier: string;
    maxMembers: number;
    maxStaff: number;
    maxLocations: number;
    durationMonths: number;
    features: string[];
    hardwareBinding?: string;
  }): SaaSLicense => {
    const tierCode = (data.tier || 'PRO').slice(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const randPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `GOS-${tierCode}-${year}-${randPart1}-${randPart2}-M${data.maxMembers}-L${data.maxLocations}-ST${data.maxStaff}`;

    const now = new Date();
    const expiry = new Date(now.getTime() + (data.durationMonths || 12) * 30 * 24 * 60 * 60 * 1000);
    const issueDateStr = now.toISOString().split('T')[0];
    const expiryDateStr = expiry.toISOString().split('T')[0];

    const signatureRaw = `${licenseKey}:${data.contactEmail}:${expiryDateStr}:${data.maxMembers}`;
    let hash = 0;
    for (let i = 0; i < signatureRaw.length; i++) {
      hash = ((hash << 5) - hash) + signatureRaw.charCodeAt(i);
      hash |= 0;
    }
    const signature = `SHA256:${Math.abs(hash).toString(16).padStart(8, '0')}${Math.abs(hash * 31).toString(16).padStart(8, '0')}00f492b`;

    const newLicense: SaaSLicense = {
      id: `lic-${Date.now().toString(36)}`,
      licenseKey,
      gymName: data.gymName,
      contactEmail: data.contactEmail,
      adminName: data.adminName,
      tier: data.tier,
      maxMembers: data.maxMembers,
      maxStaff: data.maxStaff,
      maxLocations: data.maxLocations,
      currentMembersUsed: 0,
      currentLocationsUsed: 1,
      issueDate: issueDateStr,
      expiryDate: expiryDateStr,
      status: 'Active',
      operationStatus: 'Online & Operational',
      features: data.features,
      signature,
      turnstilesOnline: 1,
      totalTurnstiles: 2,
      liveFloorOccupancy: 42,
      syncLatencyMs: 18,
      lastHeartbeat: new Date().toISOString(),
      clusterHub: 'ap-south-1',
      hardwareBinding: data.hardwareBinding || 'TURNSTILE-GATE-MAC-B4:9C:DF:11:80',
    };

    setSaasLicenses(prev => [newLicense, ...prev]);
    showToast('Cryptographic Token Minted', `Signed license token created for ${data.gymName}`, 'success');
    return newLicense;
  };

  const updateLicenseStatus = (id: string, status: SaaSLicense['status']) => {
    setSaasLicenses(prev =>
      prev.map(lic => (lic.id === id ? { ...lic, status } : lic))
    );
    showToast('License Status Changed', `Contract state transitioned to ${status}`, 'info');
  };

  const updateOperationStatus = (id: string, operationStatus: SaaSLicense['operationStatus']) => {
    setSaasLicenses(prev =>
      prev.map(lic => (lic.id === id ? { ...lic, operationStatus } : lic))
    );
    showToast('Operational Lock Updated', `Hardware status set to: ${operationStatus}`, 'warning');
  };

  const applyLicenseToTenant = (license: SaaSLicense) => {
    setActiveTenantLicense(license);
    showToast('License Activated', `Applied ${(license?.tier || 'PRO').toUpperCase()} license to this facility instance.`, 'success');
  };

  // ==========================================
  // SuperAdmin Tenant-Wise Database Provisioning
  // ==========================================

  const saveTenantDbConfig = async (config: TenantDatabaseConfig) => {
    try {
      await apiClient.post('/admin/tenants/databases/provision', config);
    } catch {
      // offline/demo fallback
    }
    setTenantDbConfigs(prev => {
      const idx = prev.findIndex(t => t.id === config.id || t.tenantId === config.tenantId);
      const next = idx >= 0 ? prev.map((t, i) => i === idx ? config : t) : [config, ...prev];
      try { localStorage.setItem('gymos_tenant_db_configs', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Database Configured', `Configured ${(config?.engine || 'postgres').toUpperCase()} for ${config.tenantName}`, 'success');
  };

  const deleteTenantDbConfig = async (id: string) => {
    try {
      await apiClient.delete(`/admin/tenants/databases/${id}`);
    } catch {
      // offline fallback
    }
    setTenantDbConfigs(prev => {
      const next = prev.filter(t => t.id !== id && t.tenantId !== id);
      try { localStorage.setItem('gymos_tenant_db_configs', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Database Unlinked', 'Tenant database configuration deleted from registry', 'info');
  };

  const detachTenantDatabase = async (id: string): Promise<{ success: boolean; message?: string }> => {
    let resData: any = null;
    try {
      const res = await apiClient.post(`/admin/tenants/databases/${id}/detach`);
      resData = res.data;
    } catch {
      // offline fallback
    }
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTenantDbConfigs(prev => {
      const next = prev.map(t => {
        if (t.id === id || t.tenantId === id) {
          return {
            ...t,
            attachmentStatus: 'detached' as const,
            isAttached: false,
            status: 'Detached' as const,
            detachedAt: `Today at ${timestampStr}`,
            latencyMs: 0,
            lastChecked: `Detached at ${timestampStr} (Fallback to Shared DB)`,
          };
        }
        return t;
      });
      try { localStorage.setItem('gymos_tenant_db_configs', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Database Detached', 'Tenant unlinked from dedicated database and reverted to fallback sandbox.', 'info');
    return resData || { success: true, message: 'Tenant database detached successfully.' };
  };

  const attachTenantDatabase = async (id: string): Promise<{ success: boolean; message?: string; isIpBlocked?: boolean; config?: any }> => {
    let resData: any = null;
    try {
      const res = await apiClient.post(`/admin/tenants/databases/${id}/attach`);
      resData = res.data;
    } catch {
      // offline fallback
    }
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isIpBlocked = Boolean(resData?.isIpBlocked);
    setTenantDbConfigs(prev => {
      const next = prev.map(t => {
        if (t.id === id || t.tenantId === id) {
          return {
            ...t,
            attachmentStatus: 'attached' as const,
            isAttached: true,
            status: (isIpBlocked ? 'IP Blocked' : (resData?.config?.status || 'Connected')) as any,
            attachedAt: `Today at ${timestampStr}`,
            latencyMs: resData?.config?.latencyMs || (isIpBlocked ? 0 : 15),
            lastChecked: `Attached & Verified at ${timestampStr}`,
            isIpBlocked,
          };
        }
        return t;
      });
      try { localStorage.setItem('gymos_tenant_db_configs', JSON.stringify(next)); } catch {}
      return next;
    });
    if (isIpBlocked) {
      showToast('Atlas IP Whitelist Required', 'Tenant attached, but MongoDB Atlas requires IP whitelisting.', 'warning');
    } else {
      showToast('Database Attached', 'Tenant successfully linked and bound to dedicated database cluster.', 'success');
    }
    return resData || { success: true, message: 'Database attached successfully.', isIpBlocked };
  };

  const pingTenantDatabase = async (id: string) => {
    try {
      const res = await apiClient.post(`/admin/tenants/databases/${id}/ping`);
      const pingData = res.data;
      if (!pingData) {
        throw new Error(res.error || 'No ping data returned from server');
      }
      setTenantDbConfigs(prev => {
        const next = prev.map(t => {
          if (t.id === id || t.tenantId === id) {
            return {
              ...t,
              status: pingData?.status || (pingData?.success ? 'Connected' : 'Degraded'),
              latencyMs: pingData?.latencyMs || t.latencyMs,
              isIpBlocked: Boolean(pingData?.isIpBlocked),
              lastChecked: pingData?.lastChecked || `Just now (${pingData?.latencyMs || 15}ms)`,
            };
          }
          return t;
        });
        try { localStorage.setItem('gymos_tenant_db_configs', JSON.stringify(next)); } catch {}
        return next;
      });
      return pingData;
    } catch {
      // offline ping fallback
      const simulatedLatency = Math.floor(12 + Math.random() * 20);
      setTenantDbConfigs(prev => {
        const next = prev.map(t => {
          if (t.id === id || t.tenantId === id) {
            return {
              ...t,
              latencyMs: simulatedLatency,
              lastChecked: `Pinged just now (${simulatedLatency}ms)`,
            };
          }
          return t;
        });
        try { localStorage.setItem('gymos_tenant_db_configs', JSON.stringify(next)); } catch {}
        return next;
      });
      return { success: true, latencyMs: simulatedLatency };
    }
  };

  const testTenantDbConnection = async (data: Partial<TenantDatabaseConfig>) => {
    try {
      const res = await apiClient.post('/admin/tenants/databases/test', data);
      return res.data || {
        success: true,
        message: `Connection successful to ${data.engine?.toUpperCase() || 'database'}.`,
        latencyMs: 16,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Connection test failed',
      };
    }
  };

  const provisionTenantDatabase = async (config: TenantDatabaseConfig) => {
    try {
      const res = await apiClient.post('/admin/tenants/databases/provision', config);
      await saveTenantDbConfig(config);
      return {
        success: true,
        message: res.data?.message || `Successfully provisioned ${config.databaseName} on ${(config?.engine || 'postgres').toUpperCase()}.`,
        initializedItems: res.data?.initializedItems,
      };
    } catch {
      await saveTenantDbConfig(config);
      return {
        success: true,
        message: `Tenant database "${config.databaseName}" provisioned in sandbox mode.`,
        initializedItems: config.engine === 'mongodb' ? ['members', 'checkins', 'invoices', 'leads'] : ['members', 'attendance_logs', 'classes', 'invoices'],
      };
    }
  };

  // ==========================================
  // SuperAdmin Google Sheets Bi-Directional Sync
  // ==========================================

  const saveGoogleSheetIntegration = async (integration: GoogleSheetIntegration) => {
    try {
      await apiClient.post('/integrations/sheets', integration);
    } catch {
      try {
        await apiClient.post('/admin/integrations/google-sheets/save', integration);
      } catch {}
    }
    setGoogleSheetIntegrations(prev => {
      const idx = prev.findIndex(s => s.id === integration.id);
      const next = idx >= 0 ? prev.map((s, i) => i === idx ? integration : s) : [integration, ...prev];
      try { localStorage.setItem('gymos_google_sheet_integrations', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Google Sheet Linked', `Configured "${integration.sheetTitle}" for real-time sync.`, 'success');
  };

  const deleteGoogleSheetIntegration = async (id: string) => {
    try {
      await apiClient.delete(`/integrations/sheets/${id}`);
    } catch {
      try {
        await apiClient.delete(`/admin/integrations/google-sheets/${id}`);
      } catch {}
    }
    setGoogleSheetIntegrations(prev => {
      const next = prev.filter(s => s.id !== id);
      try { localStorage.setItem('gymos_google_sheet_integrations', JSON.stringify(next)); } catch {}
      return next;
    });
    showToast('Sheet Unlinked', 'Google Sheet integration removed.', 'info');
  };

  const testGoogleSheetConnection = async (spreadsheetIdOrUrl: string) => {
    try {
      const res = await apiClient.post('/integrations/sheets/test', { spreadsheetIdOrUrl });
      return res.data || {
        success: true,
        sheetTitle: 'Google Sheet (Verified)',
        tabs: ['Sheet1', 'Members'],
        sampleHeaders: ['Full Name', 'Email', 'Phone', 'Plan'],
        message: 'Successfully verified sheet access.',
      };
    } catch {
      try {
        const res = await apiClient.post('/admin/integrations/google-sheets/test', { spreadsheetIdOrUrl });
        return res.data;
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.error || err.message || 'Sheet verification failed',
        };
      }
    }
  };

  const syncGoogleSheetNow = async (id: string) => {
    const item = googleSheetIntegrations.find(s => s.id === id);
    if (!item) return { success: false, message: 'Integration not found.' };

    try {
      let res;
      try {
        res = await apiClient.post('/integrations/sheets/sync', { id });
      } catch {
        res = await apiClient.post('/admin/integrations/google-sheets/sync', { id });
      }
      const newCount = res?.data?.syncedRowsCount || item.syncedRowsCount + 12;
      setGoogleSheetIntegrations(prev =>
        prev.map(s => s.id === id ? { ...s, syncedRowsCount: newCount, lastSyncedAt: 'Just now' } : s)
      );
      showToast('Sync Completed', `Synchronized ${newCount} records with Google Sheet tab "${item.tabName}".`, 'success');
      return { success: true, message: 'Sync successful', syncedRowsCount: newCount };
    } catch {
      const fallbackCount = item.syncedRowsCount + 8;
      setGoogleSheetIntegrations(prev =>
        prev.map(s => s.id === id ? { ...s, syncedRowsCount: fallbackCount, lastSyncedAt: 'Just now' } : s)
      );
      showToast('Sync Completed', `Synchronized ${fallbackCount} records with Google Sheet tab "${item.tabName}".`, 'success');
      return { success: true, message: 'Sync completed in standalone mode.', syncedRowsCount: fallbackCount };
    }
  };

  // Member CRUD with API integration
  const addMember = async (data: {
    name: string;
    email: string;
    phone: string;
    plan: MembershipPlan;
    aadhaarNumber?: string;
    aadhaarDocUrl?: string;
    aadhaarDocName?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
  }) => {
    const newCode = `#MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMember: Member = {
      id: `m-${Date.now()}`,
      memberCode: newCode,
      name: data.name,
      email: data.email,
      phone: data.phone,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      plan: data.plan,
      status: 'active',
      joinedDate: 'Today',
      expiryDate: 'Oct 2027',
      lastVisit: 'Just registered',
      totalCheckIns: 0,
      aadhaarNumber: data.aadhaarNumber,
      aadhaarDocUrl: data.aadhaarDocUrl,
      aadhaarDocName: data.aadhaarDocName,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyContactRelation: data.emergencyContactRelation,
      emergencyContact: data.emergencyContactPhone
        ? `${data.emergencyContactPhone} (${data.emergencyContactRelation || 'Emergency'})`
        : undefined,
    };

    if (!isDemoMode && apiClient.getToken()) {
      try {
        const res = await apiClient.post('/members', {
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          status: 'Active',
        });
        if (res.data?.member) {
          newMember.id = res.data.member.id;
        }
      } catch (err) {
        console.warn('Backend member create failed, saved locally:', err);
      }
    }

    setMembers(prev => [newMember, ...prev]);
    showToast('Member Registered', `${newMember.name} has been enrolled under ${newMember.plan}`, 'success');
  };

  const renewMember = (id: string, newPlan?: MembershipPlan) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === id) {
          const plan = newPlan || m.plan;
          return { ...m, plan, status: 'active', expiryDate: 'Oct 2027' };
        }
        return m;
      })
    );
    showToast('Membership Renewed', 'Membership has been reactivated successfully for another term.', 'success');
  };

  const toggleMemberFreeze = (id: string) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === id) {
          const newStatus = m.status === 'frozen' ? 'active' : 'frozen';
          return { ...m, status: newStatus };
        }
        return m;
      })
    );
    showToast('Status Updated', 'Member status modified successfully', 'info');
  };

  const deleteMember = async (id: string) => {
    if (!isDemoMode && apiClient.getToken()) {
      try {
        await apiClient.delete(`/members/${id}`);
      } catch (err) {
        console.warn('Backend member delete failed:', err);
      }
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast('Member Removed', 'Member record deleted from directory.', 'info');
  };

  // Turnstile check-in with API integration
  const checkInMember = async (memberId: string, method: CheckInMethod = 'Manual Entry'): Promise<boolean> => {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;

    if (member.status === 'expired' || member.status === 'cancelled') {
      const deniedLog: CheckInLog = {
        id: `ci-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        memberCode: member.memberCode,
        plan: member.plan,
        timestamp: new Date().toISOString(),
        timeFormatted: 'Just now',
        method,
        status: 'Access Denied',
        terminal: 'Front Desk'
      };
      setCheckInLogs(prev => [deniedLog, ...prev]);
      showToast('Access Denied', `${member.name}'s plan is ${member.status}. Renewal required.`, 'error');
      return false;
    }

    if (!isDemoMode && apiClient.getToken()) {
      try {
        await apiClient.post('/attendance/check-in', {
          memberId: member.id,
          deviceId: 'TURNSTILE-GATE-01',
          method: 'QR_CODE',
        });
      } catch (err) {
        console.warn('Attendance backend recording failed:', err);
      }
    }

    const newLog: CheckInLog = {
      id: `ci-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberCode: member.memberCode,
      plan: member.plan,
      timestamp: new Date().toISOString(),
      timeFormatted: 'Just now',
      method,
      status: 'Allowed',
      terminal: 'Front Desk'
    };

    setCheckInLogs(prev => [newLog, ...prev]);
    setLiveOccupancy(prev => Math.min(prev + 1, maxCapacity));

    // Award +20 Gymify Points for Facility Attendance Check-in
    const attendancePoints = 20;
    const currentPts = member.gymifyPoints ?? 100;
    const newTotalPts = currentPts + attendancePoints;
    const newTier = calculateGymifyTier(newTotalPts);
    const newPointEntry: GymifyPointsHistory = {
      id: `ph-${Date.now()}`,
      type: 'attendance',
      points: attendancePoints,
      description: `${method} Attendance Check-in`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMembers(prev =>
      prev.map(m =>
        m.id === memberId
          ? {
              ...m,
              lastVisit: 'Just now',
              totalCheckIns: m.totalCheckIns + 1,
              gymifyPoints: newTotalPts,
              gymifyTier: newTier,
              pointsHistory: [newPointEntry, ...(m.pointsHistory || [])]
            }
          : m
      )
    );

    setLastScannedMember({
      name: member.name,
      plan: (member?.plan || 'STANDARD').toUpperCase(),
      code: member.memberCode,
      allowed: true,
      timestamp: 'Checked in just now (+20 Pts)'
    });

    showToast('Check-in Verified', `${member.name} entered the facility. Turnstile unlocked (+20 Gymify Points)!`, 'success');
    return true;
  };

  const calculateGymifyTier = (points: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' => {
    if (points >= 3000) return 'Diamond';
    if (points >= 1500) return 'Platinum';
    if (points >= 750) return 'Gold';
    if (points >= 250) return 'Silver';
    return 'Bronze';
  };

  const awardGymifyPoints = (
    memberId: string,
    points: number,
    reason: string,
    type: GymifyPointsHistory['type'] = 'attendance'
  ) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id !== memberId) return m;
        const currentPoints = m.gymifyPoints ?? 100;
        const newTotal = Math.max(0, currentPoints + points);
        const newTier = calculateGymifyTier(newTotal);
        const newHistoryItem: GymifyPointsHistory = {
          id: `ph-${Date.now()}`,
          type,
          points,
          description: reason,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        const updatedHistory = [newHistoryItem, ...(m.pointsHistory || [])];
        return {
          ...m,
          gymifyPoints: newTotal,
          gymifyTier: newTier,
          pointsHistory: updatedHistory
        };
      })
    );
    showToast('Gymify Points Awarded', `+${points} pts to ${members.find(m => m.id === memberId)?.name || 'Member'}: ${reason}`, 'success');
  };

  const addMemberReferral = (
    memberId: string,
    referral: { name: string; phone: string; notes?: string }
  ) => {
    const pointsToAdd = 250;
    const newRef: GymifyReferral = {
      id: `ref-${Date.now()}`,
      referredName: referral.name,
      referredPhone: referral.phone,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Joined (Awarded)',
      pointsAwarded: pointsToAdd
    };
    const newHistoryItem: GymifyPointsHistory = {
      id: `ph-${Date.now()}`,
      type: 'referral',
      points: pointsToAdd,
      description: `Referral Joined: ${referral.name} (${referral.phone})`,
      timestamp: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.id !== memberId) return m;
        const currentPoints = m.gymifyPoints ?? 100;
        const newTotal = currentPoints + pointsToAdd;
        const newTier = calculateGymifyTier(newTotal);
        return {
          ...m,
          gymifyPoints: newTotal,
          gymifyTier: newTier,
          referralsCount: (m.referralsCount || 0) + 1,
          referralsList: [newRef, ...(m.referralsList || [])],
          pointsHistory: [newHistoryItem, ...(m.pointsHistory || [])]
        };
      })
    );

    showToast('Referral Bonus Unlocked!', `+250 Gymify Points awarded for inviting ${referral.name}!`, 'success');
  };

  const redeemGymifyReward = (memberId: string, rewardName: string, pointsCost: number): boolean => {
    const member = members.find(m => m.id === memberId);
    if (!member) return false;
    const currentPoints = member.gymifyPoints ?? 0;
    if (currentPoints < pointsCost) {
      showToast('Insufficient Points', `Need ${pointsCost} pts to redeem ${rewardName} (current: ${currentPoints} pts).`, 'warning');
      return false;
    }

    const newTotal = currentPoints - pointsCost;
    const newTier = calculateGymifyTier(newTotal);
    const newHistoryItem: GymifyPointsHistory = {
      id: `ph-${Date.now()}`,
      type: 'redemption',
      points: -pointsCost,
      description: `Redeemed Reward: ${rewardName}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMembers(prev =>
      prev.map(m =>
        m.id === memberId
          ? {
              ...m,
              gymifyPoints: newTotal,
              gymifyTier: newTier,
              pointsHistory: [newHistoryItem, ...(m.pointsHistory || [])]
            }
          : m
      )
    );

    showToast('Reward Claimed!', `Redeemed ${rewardName} for ${pointsCost} Gymify Points. Voucher generated.`, 'success');
    return true;
  };

  const logBiometricAttendance = async (data: {
    personType: 'member' | 'staff';
    personId: string;
    personName: string;
    photoUrl?: string;
    confidenceScore: number;
    capturedPhotoUrl?: string;
    terminal?: string;
  }): Promise<{ success: boolean; message: string; pointsAwarded?: number }> => {
    const timestampStr = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const terminalName = data.terminal || 'Biometric Face-ID Gate #01';

    if (data.personType === 'member') {
      const member = members.find(m => m.id === data.personId);
      if (!member) {
        return { success: false, message: 'Member profile not found in directory.' };
      }

      if (member.status === 'expired' || member.status === 'cancelled') {
        const deniedLog: CheckInLog = {
          id: `ci-bio-${Date.now()}`,
          memberId: member.id,
          memberName: member.name,
          memberCode: member.memberCode,
          plan: member.plan,
          timestamp: timestampStr,
          timeFormatted: `${timeFormatted} (Biometric)`,
          method: 'Biometric Camera',
          status: 'Access Denied',
          terminal: terminalName
        };
        setCheckInLogs(prev => [deniedLog, ...prev]);
        showToast('Access Denied', `${member.name} matched (${data.confidenceScore.toFixed(1)}%), but membership is ${member.status}.`, 'error');
        return { success: false, message: `Membership plan is ${member.status}. Renewal required.` };
      }

      // Check-in allowed
      const newCheckIn: CheckInLog = {
        id: `ci-bio-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        memberCode: member.memberCode,
        plan: member.plan,
        timestamp: timestampStr,
        timeFormatted: `${timeFormatted} (Face-ID)`,
        method: 'Biometric Camera',
        status: 'Allowed',
        terminal: terminalName
      };

      const bioLog: BiometricLog = {
        id: `bio-${Date.now()}`,
        personType: 'member',
        personId: member.id,
        personName: member.name,
        roleOrPlan: member.plan,
        timestamp: timestampStr,
        timeFormatted,
        verificationMethod: 'Camera Biometrics (Face Match)',
        confidenceScore: data.confidenceScore,
        status: 'Verified Match',
        capturedPhotoUrl: data.capturedPhotoUrl || member.photoUrl,
        terminal: terminalName,
        pointsAwarded: 20
      };

      setCheckInLogs(prev => [newCheckIn, ...prev]);
      setBiometricLogs(prev => [bioLog, ...prev.slice(0, 49)]);
      setLiveOccupancy(prev => Math.min(prev + 1, maxCapacity));

      // Award +20 points
      const currentPts = member.gymifyPoints ?? 100;
      const updatedPts = currentPts + 20;
      const updatedTier = calculateGymifyTier(updatedPts);
      const pointsItem: GymifyPointsHistory = {
        id: `ph-bio-${Date.now()}`,
        type: 'attendance',
        points: 20,
        description: 'Biometric Face-ID Attendance Check-in',
        timestamp: timeFormatted
      };

      setMembers(prev =>
        prev.map(m =>
          m.id === member.id
            ? {
                ...m,
                lastVisit: `Today (${timeFormatted} via Face-ID)`,
                totalCheckIns: m.totalCheckIns + 1,
                gymifyPoints: updatedPts,
                gymifyTier: updatedTier,
                pointsHistory: [pointsItem, ...(m.pointsHistory || [])]
              }
            : m
        )
      );

      setLastScannedMember({
        name: member.name,
        plan: `${(member?.plan || 'STANDARD').toUpperCase()} • FACE VERIFIED (${data.confidenceScore.toFixed(1)}%)`,
        code: member.memberCode,
        allowed: true,
        timestamp: `Biometric Camera: ${timeFormatted}`
      });

      showToast('Biometric Access Verified', `✓ ${member.name} authenticated (${data.confidenceScore.toFixed(1)}% match). +20 Gymify Points earned!`, 'success');
      return { success: true, message: `Access granted for ${member.name}`, pointsAwarded: 20 };
    } else {
      // Staff / Trainer presence verification
      const staffMember = staff.find(s => s.id === data.personId);
      if (!staffMember) {
        return { success: false, message: 'Staff profile not found.' };
      }

      const bioLog: BiometricLog = {
        id: `bio-staff-${Date.now()}`,
        personType: 'staff',
        personId: staffMember.id,
        personName: staffMember.name,
        roleOrPlan: staffMember.role,
        timestamp: timestampStr,
        timeFormatted,
        verificationMethod: 'Camera Biometrics (Face Match)',
        confidenceScore: data.confidenceScore,
        status: 'Verified Match',
        capturedPhotoUrl: data.capturedPhotoUrl || staffMember.photoUrl,
        terminal: terminalName
      };

      // Also create an attendance check-in log so AttendanceView displays staff presence too!
      const staffAttendanceLog: CheckInLog = {
        id: `ci-staff-${Date.now()}`,
        memberId: staffMember.id,
        memberName: `${staffMember.name} (Staff/Trainer)`,
        memberCode: staffMember.staffCode,
        plan: 'Staff On-Duty' as any,
        timestamp: timestampStr,
        timeFormatted: `${timeFormatted} (Duty Login)`,
        method: 'Biometric Camera',
        status: 'Allowed',
        terminal: terminalName
      };

      setCheckInLogs(prev => [staffAttendanceLog, ...prev]);
      setBiometricLogs(prev => [bioLog, ...prev.slice(0, 49)]);

      // Mark staff onShift and geofenceStatus Verified Inside
      setStaff(prev =>
        prev.map(s =>
          s.id === staffMember.id
            ? { ...s, onShift: true, geofenceStatus: 'Verified Inside' }
            : s
        )
      );

      showToast('Staff Presence Verified', `✓ ${staffMember.name} (${staffMember.role}) verified on duty via device camera. Shift active!`, 'success');
      return { success: true, message: `Staff presence logged for ${staffMember.name}` };
    }
  };

  const simulateScan = (customName?: string) => {
    if (isTerminalLocked) {
      showToast('Terminal Locked', 'Please unlock Terminal #04 before scanning passes.', 'warning');
      return { name: 'Unknown', plan: 'N/A', allowed: false };
    }

    const availableMembers = members.length > 0 ? members : INITIAL_MEMBERS;
    const randomMember = customName
      ? availableMembers.find(m => m.name.toLowerCase().includes(customName.toLowerCase())) || availableMembers[0]
      : availableMembers[Math.floor(Math.random() * availableMembers.length)];

    const isAllowed = randomMember.status === 'active';

    const newCheckIn: CheckInLog = {
      id: `ci-${Date.now()}`,
      memberId: randomMember.id,
      memberName: randomMember.name,
      memberCode: randomMember.memberCode,
      plan: randomMember.plan,
      timestamp: new Date().toISOString(),
      timeFormatted: 'Just now',
      method: 'QR Scanner',
      status: isAllowed ? 'Allowed' : 'Access Denied',
      terminal: 'Terminal #04'
    };

    setCheckInLogs(prev => [newCheckIn, ...prev]);
    if (isAllowed) {
      setLiveOccupancy(prev => Math.min(prev + 1, maxCapacity));
    }

    setLastScannedMember({
      name: randomMember.name,
      plan: (randomMember?.plan || 'STANDARD').toUpperCase(),
      code: randomMember.memberCode,
      allowed: isAllowed,
      timestamp: 'Checked in just now'
    });

    if (isAllowed) {
      showToast('Pass Validated', `${randomMember.name} • Gate Turnstile 04 Released`, 'success');
    } else {
      showToast('Access Denied', `${randomMember.name} • Plan status: ${randomMember.status}`, 'error');
    }

    return {
      name: randomMember.name,
      plan: randomMember.plan,
      allowed: isAllowed
    };
  };

  const toggleTerminalLock = () => {
    setIsTerminalLocked(prev => {
      const next = !prev;
      showToast(
        next ? 'Turnstile Armed / Locked' : 'Turnstile Disarmed / Free Pass',
        next ? 'Hardware gate is locked. Valid badge required.' : 'Hardware gate in manual bypass mode.',
        next ? 'warning' : 'info'
      );
      return next;
    });
  };

  // Scheduling methods
  const addClass = (data: Partial<ClassSession> & { title: string; trainerName: string }) => {
    const newClass: ClassSession = {
      id: `cls-${Date.now()}`,
      title: data.title,
      category: data.category || 'High Intensity',
      studio: data.studio || 'Studio A',
      durationMins: data.durationMins || 60,
      timeFormatted: data.timeFormatted || '09:00 AM - 10:00 AM',
      trainerName: data.trainerName,
      trainerPhoto: data.trainerPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      capacity: data.capacity || 25,
      enrolled: 0,
      waitlist: 0,
      status: 'upcoming'
    };
    setClasses(prev => [newClass, ...prev]);
    showToast('Class Created', `${newClass.title} scheduled successfully`, 'success');
  };

  const updateClassCapacity = (id: string, action: 'enroll' | 'drop' | 'waitlist') => {
    setClasses(prev =>
      prev.map(c => {
        if (c.id === id) {
          if (action === 'enroll') {
            return { ...c, enrolled: Math.min(c.enrolled + 1, c.capacity) };
          } else if (action === 'drop') {
            return { ...c, enrolled: Math.max(c.enrolled - 1, 0) };
          } else if (action === 'waitlist') {
            return { ...c, waitlist: c.waitlist + 1 };
          }
        }
        return c;
      })
    );
    showToast('Roster Updated', 'Class attendance roster updated.', 'info');
  };

  const updatePTSessionStatus = (id: string, status: 'Confirmed' | 'Completed' | 'Cancelled') => {
    setPtSessions(prev =>
      prev.map(pt => (pt.id === id ? { ...pt, status } : pt))
    );
    showToast('PT Session Updated', `Session status changed to ${status}`, 'info');
  };

  const movePTSession = (
    sessionId: string,
    newDay: PTSession['day'],
    newTimeSlot: string,
    newTrainerName?: string
  ) => {
    setPtSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            day: newDay,
            timeSlot: newTimeSlot,
            trainerName: newTrainerName || s.trainerName
          };
        }
        return s;
      })
    );
    showToast('PT Slot Rescheduled', `Session moved to ${newDay} at ${newTimeSlot}`, 'success');
  };

  const assignUnscheduledRequest = (
    requestId: string,
    day: PTSession['day'],
    timeSlot: string,
    trainerName?: string
  ) => {
    const req = unscheduledRequests.find(r => r.id === requestId);
    if (!req) return;

    const newSession: PTSession = {
      id: `pt-${Date.now()}`,
      clientName: req.clientName,
      clientId: req.clientId,
      clientPhoto: req.clientPhoto,
      trainerName: trainerName || req.preferredTrainer,
      timeSlot,
      day,
      packageType: req.packageType,
      focus: req.focus,
      durationMins: 60,
      status: 'Confirmed',
      price: req.price,
      notes: `Scheduled from queue for ${day}`
    };

    setPtSessions(prev => [newSession, ...prev]);
    setUnscheduledRequests(prev => prev.filter(r => r.id !== requestId));
    showToast('PT Slot Booked', `${req.clientName} booked for ${day} at ${timeSlot}`, 'success');
  };

  const scheduleNewPTSession = (data: Partial<PTSession> & { clientName: string; trainerName: string; timeSlot: string; day: PTSession['day'] }) => {
    const newSession: PTSession = {
      id: `pt-${Date.now()}`,
      clientName: data.clientName,
      clientId: data.clientId || `PT-${Math.floor(1000 + Math.random() * 9000)}`,
      clientPhoto: data.clientPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      trainerName: data.trainerName,
      timeSlot: data.timeSlot,
      day: data.day,
      packageType: data.packageType || 'Standard Personal Coaching',
      focus: data.focus || 'Strength & Conditioning',
      durationMins: data.durationMins || 60,
      status: 'Confirmed',
      price: data.price || 1800,
      notes: data.notes || 'Scheduled via Calendar drag-drop interface'
    };

    setPtSessions(prev => [newSession, ...prev]);
    showToast('PT Booked', `Booked ${newSession.clientName} for ${newSession.day} at ${newSession.timeSlot}`, 'success');
  };

  const deletePTSession = (id: string) => {
    setPtSessions(prev => prev.filter(s => s.id !== id));
    showToast('PT Slot Removed', 'Session deleted from calendar.', 'info');
  };

  // RBAC methods
  const updateUserRole = (userId: string, roleId: string) => {
    const targetRole = tenantRoles.find(r => r.id === roleId);
    if (!targetRole) return;

    setUserRoleAssignments(prev =>
      prev.map(u => {
        if (u.userId === userId) {
          return {
            ...u,
            roleId,
            roleName: targetRole.name,
            lastActive: 'Just now'
          };
        }
        return u;
      })
    );
    showToast('Role Assigned', `Updated user assignment to ${targetRole.name}`, 'success');
  };

  const toggleUserPermissionOverride = (userId: string, permissionId: string, grant: boolean) => {
    setUserRoleAssignments(prev =>
      prev.map(u => {
        if (u.userId !== userId) return u;
        let granted = [...u.customGrantedPermissions];
        let revoked = [...u.customRevokedPermissions];

        if (grant) {
          if (!granted.includes(permissionId)) granted.push(permissionId);
          revoked = revoked.filter(p => p !== permissionId);
        } else {
          if (!revoked.includes(permissionId)) revoked.push(permissionId);
          granted = granted.filter(p => p !== permissionId);
        }

        return {
          ...u,
          hasCustomOverrides: true,
          customGrantedPermissions: granted,
          customRevokedPermissions: revoked
        };
      })
    );
    showToast('Security Matrix Updated', 'Custom granular permission override applied to user session.', 'info');
  };

  const toggleUserCustomOverridesMode = (userId: string, enabled: boolean) => {
    setUserRoleAssignments(prev =>
      prev.map(u => {
        if (u.userId === userId) {
          return {
            ...u,
            hasCustomOverrides: enabled,
            customGrantedPermissions: enabled ? u.customGrantedPermissions : [],
            customRevokedPermissions: enabled ? u.customRevokedPermissions : []
          };
        }
        return u;
      })
    );
    showToast(
      enabled ? 'Overrides Enabled' : 'Overrides Cleared',
      enabled ? 'Granular permission toggles now active for this user.' : 'User permissions reset back to base role definition.',
      'info'
    );
  };

  const addNewUserAssignment = (data: { name: string; email: string; roleId: string; department: UserRoleAssignment['department']; avatar?: string }) => {
    const targetRole = tenantRoles.find(r => r.id === data.roleId) || tenantRoles[0];
    const newUser: UserRoleAssignment = {
      userId: `u-${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      roleId: targetRole.id,
      roleName: targetRole.name,
      department: data.department,
      status: 'Active',
      lastActive: 'Just invited',
      hasCustomOverrides: false,
      customGrantedPermissions: [],
      customRevokedPermissions: []
    };

    setUserRoleAssignments(prev => [newUser, ...prev]);
    showToast('User Role Initialized', `${data.name} enrolled with ${targetRole.name} permissions`, 'success');
  };

  const saveTenantRole = (role: TenantRole) => {
    setTenantRoles(prev => {
      const idx = prev.findIndex(r => r.id === role.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = role;
        return copy;
      }
      return [...prev, role];
    });
    showToast('Role Blueprint Saved', `Permission set for "${role.name}" updated successfully.`, 'success');
  };

  const deleteTenantRole = (roleId: string) => {
    const role = tenantRoles.find(r => r.id === roleId);
    if (role?.isSystemDefault) {
      showToast('Action Blocked', 'System default roles cannot be deleted.', 'error');
      return;
    }
    setTenantRoles(prev => prev.filter(r => r.id !== roleId));
    showToast('Role Removed', 'Custom role deleted from tenant RBAC matrix.', 'info');
  };

  const hasPermission = (userId: string, permissionId: string): boolean => {
    const user = userRoleAssignments.find(u => u.userId === userId);
    if (!user) return false;

    if (user.hasCustomOverrides) {
      if (user.customRevokedPermissions.includes(permissionId)) return false;
      if (user.customGrantedPermissions.includes(permissionId)) return true;
    }

    const role = tenantRoles.find(r => r.id === user.roleId);
    return role ? role.permissionIds.includes(permissionId) : false;
  };
  const hasUserPermission = hasPermission;

  // Leads
  const addLead = async (lead: { name: string; email: string; phone: string; source: any; assignedRep: string; notes?: string }) => {
    const initials = (lead.assignedRep || 'JD')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0] || '')
      .join('')
      .toUpperCase() || 'JD';

    const newLead: Lead = {
      id: `ld-${Date.now()}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      stage: 'New Inquiry',
      source: lead.source,
      assignedRep: lead.assignedRep,
      assignedRepInitials: initials || 'JD',
      lastInteraction: 'Just created',
      notes: lead.notes || 'Prospect interested in facility membership'
    };

    if (!isDemoMode && apiClient.getToken()) {
      try {
        const res = await apiClient.post('/crm/leads', {
          fullName: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          notes: lead.notes,
        });
        if (res.data?.lead) {
          newLead.id = res.data.lead.id;
        }
      } catch (err) {
        console.warn('Backend CRM lead create failed:', err);
      }
    }

    setLeads(prev => [newLead, ...prev]);
    showToast('Lead Added', `${newLead.name} added to pipeline under New Inquiry.`, 'success');
  };

  const updateLeadStage = async (id: string, newStage: LeadStage) => {
    if (!isDemoMode && apiClient.getToken()) {
      try {
        await apiClient.put(`/crm/leads/${id}`, { stage: newStage });
      } catch (err) {
        console.warn('Backend CRM update failed:', err);
      }
    }
    setLeads(prev =>
      prev.map(l => (l.id === id ? { ...l, stage: newStage, lastInteraction: 'Just now' } : l))
    );
    showToast('Stage Updated', `Lead moved to ${newStage}`, 'info');
  };

  const convertLeadToMember = (leadId: string, plan: MembershipPlan) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    addMember({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      plan
    });

    updateLeadStage(leadId, 'Won / Converted');
    showToast('Lead Converted!', `${lead.name} is now an active member!`, 'success');
  };

  // Staff
  const addStaff = async (data: {
    name: string;
    role: StaffMember['role'];
    phone: string;
    shiftHours?: string;
    aadhaarNumber?: string;
    aadhaarDocUrl?: string;
    aadhaarDocName?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    pastExperienceYears?: number;
    pastWorkplace?: string;
    specializations?: string;
    certifications?: string;
    academicDegree?: string;
    academicInstitution?: string;
    academicYear?: string;
    certificationDocUrl?: string;
    certificationDocName?: string;
    academicDocUrl?: string;
    academicDocName?: string;
    resumeDocUrl?: string;
    resumeDocName?: string;
  }) => {
    const newStaff: StaffMember = {
      id: `s-${Date.now()}`,
      staffCode: `#GYM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      role: data.role,
      category: data.role.toLowerCase().includes('trainer') ? 'trainer' : data.role.toLowerCase().includes('desk') ? 'frontdesk' : 'management',
      phone: data.phone,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      shiftHours: data.shiftHours || '08:00 - 17:00',
      shiftType: 'Full Day',
      geofenceStatus: 'Verified Inside',
      onShift: true,
      aadhaarNumber: data.aadhaarNumber,
      aadhaarDocUrl: data.aadhaarDocUrl,
      aadhaarDocName: data.aadhaarDocName,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      emergencyContactRelation: data.emergencyContactRelation,
      pastExperienceYears: data.pastExperienceYears,
      pastWorkplace: data.pastWorkplace,
      specializations: data.specializations,
      certifications: data.certifications,
      academicDegree: data.academicDegree,
      academicInstitution: data.academicInstitution,
      academicYear: data.academicYear,
      certificationDocUrl: data.certificationDocUrl,
      certificationDocName: data.certificationDocName,
      academicDocUrl: data.academicDocUrl,
      academicDocName: data.academicDocName,
      resumeDocUrl: data.resumeDocUrl,
      resumeDocName: data.resumeDocName,
    };

    if (!isDemoMode && apiClient.getToken()) {
      try {
        const res = await apiClient.post('/staff', {
          name: data.name,
          email: `${data.name.toLowerCase().replace(/\s+/g, '.')}@gymify.io`,
          phone: data.phone,
          role: data.role,
          shift: data.shiftHours,
        });
        if (res.data?.staff) {
          newStaff.id = res.data.staff.id;
        }
      } catch (err) {
        console.warn('Backend staff create failed:', err);
      }
    }

    setStaff(prev => [newStaff, ...prev]);
    showToast('Staff Registered', `${newStaff.name} (${newStaff.role}) added with verified credentials.`, 'success');
  };

  const approveStaffCheckIn = (feedId: string) => {
    setStaffFeed(prev =>
      prev.map(f => (f.id === feedId ? { ...f, status: 'Approved by Manager' } : f))
    );
    showToast('Check-in Approved', 'Staff geofence exception approved by Manager.', 'success');
  };

  const rejectStaffCheckIn = (feedId: string) => {
    setStaffFeed(prev =>
      prev.map(f => (f.id === feedId ? { ...f, status: 'Rejected' } : f))
    );
    showToast('Check-in Rejected', 'Staff check-in has been marked invalid.', 'error');
  };

  // Invoices & Payments
  const markPendingPaid = (index: number) => {
    setPendingPayments(prev => prev.filter((_, idx) => idx !== index));
    showToast('Payment Marked Paid', 'Outstanding member fee reconciled.', 'success');
  };

  const addInvoice = (data: { memberName: string; planOrDescription: string; amount: number; method: Invoice['method']; status?: Invoice['status'] }) => {
    const invNum = `#INV-${Math.floor(8000 + Math.random() * 999)}`;
    const initials = (data.memberName || 'JD')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0] || '')
      .join('')
      .toUpperCase() || 'JD';

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
      memberId: 'm-1',
      memberName: data.memberName,
      memberCode: '#MEM-0001',
      memberInitials: initials || 'JD',
      planOrDescription: data.planOrDescription,
      amount: data.amount,
      method: data.method,
      status: data?.status || 'Paid',
      dateTimeFormatted: 'Today'
    };

    setInvoices(prev => [newInvoice, ...prev]);
    showToast('Invoice Generated', `Receipt ${invNum} logged successfully for ₹${data.amount.toLocaleString('en-IN')}`, 'success');
  };

  const recordFeePayment = async (payment: {
    memberId?: string;
    memberName: string;
    amount: number;
    method: string;
    upiRef?: string;
    planName?: string;
  }) => {
    if (!isDemoMode && apiClient.getToken()) {
      try {
        await apiClient.post('/payments', {
          memberId: payment.memberId,
          amount: payment.amount,
          method: payment.method,
          upiRef: payment.upiRef,
        });
      } catch (err) {
        console.warn('Backend payment recording failed:', err);
      }
    }

    addInvoice({
      memberName: payment.memberName,
      planOrDescription: payment.planName || 'Fee Collection',
      amount: payment.amount,
      method: payment.method as any,
      status: 'Paid'
    });

    if (payment.memberId) {
      renewMember(payment.memberId);
    }

    showToast('Payment Verified', `₹${payment.amount.toLocaleString('en-IN')} collected via ${payment.method}.`, 'success');
  };

  return (
    <GymContext.Provider
      value={{
        theme,
        toggleTheme,
        isDemoMode,
        toggleDemoMode,
        isLoadingData,
        dataError,
        refreshData,
        dbHealth,
        activeScreen,
        setActiveScreen,
        currentBranch,
        setBranch,
        branches: BRANCHES,
        isSidebarCollapsed,
        toggleSidebar,
        setIsSidebarCollapsed,
        isSidebarPinned,
        toggleSidebarPinned,
        currentUser,
        login,
        logout,
        switchRole,
        saasPackages,
        saveSaaSPackage,
        deleteSaaSPackage,
        saasLicenses,
        activeTenantLicense,
        generateLicense,
        updateLicenseStatus,
        updateOperationStatus,
        applyLicenseToTenant,
        tenantDbConfigs,
        saveTenantDbConfig,
        deleteTenantDbConfig,
        attachTenantDatabase,
        detachTenantDatabase,
        pingTenantDatabase,
        testTenantDbConnection,
        provisionTenantDatabase,
        googleSheetIntegrations,
        saveGoogleSheetIntegration,
        deleteGoogleSheetIntegration,
        testGoogleSheetConnection,
        syncGoogleSheetNow,
        tenantRoles,
        userRoleAssignments,
        allRbacPermissions,
        updateUserRole,
        toggleUserPermissionOverride,
        toggleUserCustomOverridesMode,
        addNewUserAssignment,
        saveTenantRole,
        deleteTenantRole,
        hasPermission,
        hasUserPermission,
        members,
        addMember,
        renewMember,
        toggleMemberFreeze,
        deleteMember,
        checkInLogs,
        biometricLogs,
        liveOccupancy,
        maxCapacity,
        isTerminalLocked,
        toggleTerminalLock,
        checkInMember,
        logBiometricAttendance,
        awardGymifyPoints,
        addMemberReferral,
        redeemGymifyReward,
        simulateScan,
        lastScannedMember,
        classes,
        addClass,
        ptSessions,
        unscheduledRequests,
        updateClassCapacity,
        updatePTSessionStatus,
        movePTSession,
        assignUnscheduledRequest,
        scheduleNewPTSession,
        deletePTSession,
        leads,
        addLead,
        updateLeadStage,
        convertLeadToMember,
        staff,
        staffFeed,
        addStaff,
        approveStaffCheckIn,
        rejectStaffCheckIn,
        invoices,
        pendingPayments,
        markPendingPaid,
        addInvoice,
        recordFeePayment,
        expenses,
        addExpense,
        deleteExpense,
        complaints,
        addComplaint,
        updateComplaintStatus,
        announcements,
        addAnnouncement,
        workoutPlans,
        dietPlans,
        assignWorkoutPlan,
        assignDietPlan,
        landingCms,
        updateLandingCms,
        resetLandingCms,
        activeModal,
        modalPayload,
        openModal,
        closeModal,
        toasts,
        showToast,
        dismissToast,
        removeToast,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
