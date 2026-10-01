export type ScreenId =
  | 'dashboard'
  | 'members'
  | 'memberships'
  | 'attendance'
  | 'classes-pt'
  | 'workouts-diets'
  | 'crm-leads'
  | 'announcements'
  | 'complaints'
  | 'staff-hr'
  | 'payments'
  | 'expenses'
  | 'analytics'
  | 'reports'
  | 'settings'
  | 'tenant-rbac'
  | 'landing'
  | 'login'
  | 'super-admin'
  | 'system-settings';

export interface Expense {
  id: string;
  ref: string;
  date: string;
  category: 'Supplies' | 'Salaries' | 'Marketing' | 'Utilities' | 'Rent' | 'Maintenance' | 'Equipment' | 'Other';
  description: string;
  amount: number;
  paymentMethod: 'Card' | 'Cash' | 'Bank Transfer' | 'Mobile Payment' | 'UPI';
  receiptUrl?: string;
  notes?: string;
}

export type UserRole = 'superadmin' | 'director' | 'manager' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  branchAccess?: string[];
}

export interface SaaSPackage {
  id: string;
  name: string;
  tier: 'starter' | 'pro' | 'elite' | 'enterprise' | 'custom';
  maxMembers: number;
  maxStaff: number;
  maxLocations: number;
  monthlyPrice: number;
  annualDiscountPercent: number;
  features: {
    qrTurnstileGate: boolean;
    aiChurnPrediction: boolean;
    whatsappSmsAutomation: boolean;
    brandedMemberApp: boolean;
    multiBranchRoaming: boolean;
    prioritySupport247: boolean;
    customReporting: boolean;
  };
  description: string;
}

export type OperationStatus =
  | 'Online & Operational'
  | 'Degraded Latency'
  | 'Maintenance Mode'
  | 'Hardware Locked';

export interface SaaSLicense {
  id: string;
  licenseKey: string;
  gymName: string;
  contactEmail: string;
  adminName: string;
  tier: string;
  maxMembers: number;
  maxStaff: number;
  maxLocations: number;
  currentMembersUsed: number;
  currentLocationsUsed: number;
  issueDate: string;
  expiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Suspended' | 'Revoked';
  // Operational Status & Telemetry
  operationStatus: OperationStatus;
  turnstilesOnline: number;
  totalTurnstiles: number;
  liveFloorOccupancy: number;
  syncLatencyMs: number;
  lastHeartbeat: string;
  clusterHub: string;
  features: string[];
  hardwareBinding?: string;
  signature: string;
}

export type BranchId = 'downtown' | 'westside' | 'metro' | 'north';

export interface Branch {
  id: BranchId;
  name: string;
  address: string;
  capacity: number;
  activeMembers: number;
}

export type MembershipPlan =
  | 'VIP Annual'
  | 'Monthly Standard'
  | 'Pro Monthly'
  | 'Student Pass'
  | 'Standard Semi-Annual'
  | 'Day Pass';

export type MemberStatus = 'active' | 'frozen' | 'expired' | 'cancelled' | 'pending';

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
  plan: MembershipPlan;
  status: MemberStatus;
  joinedDate: string;
  expiryDate: string;
  lastVisit: string;
  totalCheckIns: number;
  assignedTrainer?: string;
  emergencyContact?: string;
  // Mandatory Verification & KYC Fields
  aadhaarNumber?: string;
  aadhaarDocUrl?: string;
  aadhaarDocName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  // Gymify Gamification & Points Engine
  gymifyPoints?: number;
  gymifyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  referralsCount?: number;
  referralsList?: GymifyReferral[];
  pointsHistory?: GymifyPointsHistory[];
}

export interface GymifyReferral {
  id: string;
  referredName: string;
  referredPhone: string;
  date: string;
  status: 'Joined (Awarded)' | 'Trial Active' | 'Pending Contact';
  pointsAwarded: number;
}

export interface GymifyPointsHistory {
  id: string;
  type: 'attendance' | 'referral' | 'streak_bonus' | 'redemption' | 'manual_adjustment';
  points: number;
  description: string;
  timestamp: string;
}

export interface BiometricLog {
  id: string;
  personType: 'member' | 'staff';
  personId: string;
  personName: string;
  roleOrPlan: string;
  timestamp: string;
  timeFormatted: string;
  verificationMethod: 'Camera Biometrics (Face Match)' | 'Anti-Spoofing Liveness Scan';
  confidenceScore: number;
  status: 'Verified Match' | 'Flagged / Low Confidence' | 'Access Denied';
  capturedPhotoUrl?: string;
  terminal: string;
  pointsAwarded?: number;
}

export type CheckInMethod = 'QR Scanner' | 'Manual Entry' | 'RFID Wristband' | 'Biometric Camera' | 'Facial Recognition';
export type CheckInStatus = 'Allowed' | 'Expired' | 'Access Denied';

export interface CheckInLog {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  photoUrl?: string;
  plan: MembershipPlan;
  timestamp: string;
  timeFormatted: string;
  method: CheckInMethod;
  status: CheckInStatus;
  terminal: string;
}

export interface ClassSession {
  id: string;
  title: string;
  category: 'High Intensity' | 'Mind & Body' | 'Strength' | 'Cardio';
  studio: 'Studio A' | 'Zen Studio' | 'Main Arena' | 'Cycle Studio';
  durationMins: number;
  timeFormatted: string;
  trainerName: string;
  trainerPhoto: string;
  capacity: number;
  enrolled: number;
  waitlist: number;
  status: 'live' | 'upcoming' | 'completed';
}

export interface PTSession {
  id: string;
  clientName: string;
  clientId: string;
  clientPhoto: string;
  trainerName: string;
  timeSlot: string; // e.g. "07:00 AM" or "07:00 AM - 08:00 AM"
  packageType: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date?: string;
  focus?: 'Strength & Conditioning' | 'Hypertrophy & Muscle' | 'Fat Loss & HIIT' | 'Posture & Rehab' | 'Athletic Performance' | 'Boxing / Combat';
  durationMins?: number;
  notes?: string;
  price?: number;
}

export type LeadStage =
  | 'New Inquiry'
  | 'Trial Booked'
  | 'Trial Completed'
  | 'Negotiation'
  | 'Won / Converted'
  | 'Lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  source: 'Instagram Ad' | 'Website' | 'Referral' | 'Walk-in' | 'Google Search';
  assignedRep: string;
  assignedRepInitials: string;
  lastInteraction: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  staffCode: string;
  name: string;
  role: 'Senior Trainer' | 'Operations Manager' | 'Front Desk Lead' | 'Personal Trainer' | 'Yoga Instructor';
  category: 'trainer' | 'frontdesk' | 'management';
  phone: string;
  photoUrl: string;
  shiftHours: string;
  shiftType: string;
  geofenceStatus: 'Verified Inside' | 'Outside Geofence';
  onShift: boolean;
  // Mandatory Compliance & Trainer Qualifications
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
}

export interface StaffCheckInFeed {
  id: string;
  staffName: string;
  photoUrl: string;
  timeFormatted: string;
  gpsOffset: string;
  isInside: boolean;
  status: 'Photo Verified' | 'Manager Review Required' | 'Approved by Manager' | 'Rejected';
  onTime: boolean;
}

export type PaymentMethod = 'Stripe' | 'UPI' | 'Credit Card' | 'Cash' | 'Bank Transfer';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Refunded';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  memberInitials: string;
  planOrDescription: string;
  amount: number;
  method: PaymentMethod;
  dateTimeFormatted: string;
  status: InvoiceStatus;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

// ==========================================
// Tenant Admin RBAC & Function Permissions
// ==========================================

export type RBACModule =
  | 'dashboard_analytics'
  | 'members_crm'
  | 'gate_access'
  | 'classes_pt_scheduler'
  | 'billing_payments'
  | 'staff_hr_payroll'
  | 'tenant_settings'
  | 'security_audit';

export interface RBACPermission {
  id: string;
  name: string;
  description: string;
  module: RBACModule;
  category: 'View' | 'Create' | 'Edit' | 'Delete' | 'Execute';
  isDangerous?: boolean;
}

export interface TenantRole {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  isSystemDefault: boolean;
  permissionIds: string[];
}

export interface UserRoleAssignment {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  roleId: string;
  roleName: string;
  hasCustomOverrides: boolean;
  customGrantedPermissions: string[]; // explicit custom added functions
  customRevokedPermissions: string[]; // explicit custom removed functions
  status: 'Active' | 'Suspended' | 'Pending Review';
  department: 'Operations' | 'Training' | 'Front Desk' | 'Finance' | 'Executive';
  lastActive: string;
  assignedBranchId?: BranchId | 'all';
}

// ==========================================
// SuperAdmin Tenant-Wise Database Provisioning
// ==========================================

export type DatabaseEngine = 'postgres' | 'mongodb';

export type TenantDbIsolationStrategy =
  | 'dedicated_database'     // Separate database per tenant (e.g. gymos_apex_prod)
  | 'dedicated_schema'       // Dedicated PostgreSQL schema per tenant (e.g. schema_apex.*)
  | 'isolated_collection'    // Isolated MongoDB collection prefix per tenant
  | 'custom_cluster_uri';    // Completely separate customer-hosted database URI / VPC

export interface TenantDatabaseConfig {
  id: string;
  tenantId: string;
  tenantName: string;
  engine: DatabaseEngine;
  strategy: TenantDbIsolationStrategy;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
  connectionString?: string;
  connectionUriMasked: string;
  sslEnabled: boolean;
  sslMode: 'require' | 'prefer' | 'verify-full' | 'disable';
  poolMin: number;
  poolMax: number;
  idleTimeoutMs: number;
  status: 'Connected' | 'Degraded' | 'Provisioning' | 'Offline' | 'Standalone Fallback';
  latencyMs: number;
  storageMb: number;
  collectionsOrTablesCount: number;
  lastChecked: string;
  lastMigrationVersion: string;
  features: {
    autoBackupEnabled: boolean;
    cdcEnabled: boolean; // Change Data Capture
    encryptionAtRest: boolean;
    readReplicas: number;
  };
}

// ==========================================
// SuperAdmin Google Sheets Bi-Directional Sync
// ==========================================

export type SheetSyncDirection = 'two_way' | 'gymos_to_sheet' | 'sheet_to_gymos';
export type SheetSyncFrequency = 'realtime' | '15_min' | 'hourly' | 'daily' | 'manual';
export type SheetSyncEntity = 'members' | 'attendance' | 'payments' | 'leads' | 'staff';

export interface SheetFieldMapping {
  sheetColumn: string;
  gymosField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean';
  isRequired: boolean;
}

export interface GoogleSheetIntegration {
  id: string;
  tenantId: string; // Specific tenant ID or 'all' for platform-wide
  tenantName: string;
  sheetTitle: string;
  spreadsheetId: string;
  sheetUrl: string;
  tabName: string;
  direction: SheetSyncDirection;
  entities: SheetSyncEntity[];
  frequency: SheetSyncFrequency;
  status: 'Active' | 'Syncing' | 'Paused' | 'Error';
  lastSyncedAt?: string;
  syncedRowsCount: number;
  webhookSecretToken: string;
  fieldMappings: SheetFieldMapping[];
  serviceAccountEmail?: string;
  errorMessage?: string;
}

// ==========================================
// Complaints & Maintenance Ticketing
// ==========================================
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Complaint {
  id: string;
  ticketNumber: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  category: 'Equipment' | 'Cleanliness' | 'Air Conditioning' | 'Turnstile / Access' | 'Trainer / Staff' | 'Billing' | 'Locker' | 'Other';
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  branchId?: string;
}

// ==========================================
// Announcements & WhatsApp Broadcasts
// ==========================================
export interface Announcement {
  id: string;
  title: string;
  category: 'Urgent Alert' | 'Festival Timings' | 'Class Update' | 'Maintenance' | 'Promotion';
  content: string;
  date: string;
  targetAudience: 'All Members' | 'Trainers' | 'VIP Members' | 'Morning Batch';
  sentViaWhatsApp: boolean;
  author: string;
}

// ==========================================
// Workout & Diet Plans
// ==========================================
export interface WorkoutDay {
  dayName: string;
  focus: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
  }[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  category: 'Hypertrophy PPL' | 'Desi Akhada Strength' | 'Fat Loss HIIT' | 'Beginner Strength' | 'CrossFit Elite';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  daysPerWeek: number;
  description: string;
  days: WorkoutDay[];
  assignedMembersCount: number;
}

export interface DietMeal {
  mealName: string;
  time: string;
  items: string[];
  proteinGrams: number;
  calories: number;
}

export interface DietPlan {
  id: string;
  name: string;
  dietType: 'Indian Veg High-Protein' | 'Indian Non-Veg Lean Muscle' | 'Desi Fat Loss' | 'Keto Clean' | 'Weight Gainer Bulk';
  totalCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  description: string;
  meals: DietMeal[];
  assignedMembersCount: number;
}

// ==========================================
// Landing Page CMS & Pricing Customization
// ==========================================

export interface LandingCMSPlan {
  id: string;
  name: string;
  tier: 'starter' | 'growth' | 'pro' | 'enterprise';
  monthlyPrice: number;
  yearlyPrice: number;
  annualDiscountPercent?: number;
  badge?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  maxMembers?: string;
  hardwareGates?: string;
  setupFee?: number;
  trialDays?: number;
  ctaText?: string;
  gstNote?: string;
}

export interface LandingCMSConfig {
  badgeText: string;
  heroHeadline: string;
  heroHighlight: string;
  heroSubtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  announcementBanner: string;
  showAnnouncement: boolean;
  globalAnnualDiscountPercent?: number;
  plans: LandingCMSPlan[];
  lastUpdated: string;
}


