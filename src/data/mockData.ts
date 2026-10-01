import {
  Branch,
  Member,
  CheckInLog,
  ClassSession,
  PTSession,
  Lead,
  StaffMember,
  StaffCheckInFeed,
  Invoice,
  Expense,
  Complaint,
  Announcement,
  WorkoutPlan,
  DietPlan
} from '../types';

export const APP_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUP-8_flvki-ZmX5_fHcfdgi2gZd4-5f61Cl88TgInYOILlELUWxWw6AID74nyRkVaBDzb3zJrKa9fb4TdmvjFxhcq2JA-KbwzMsNj2YiwRCWZMHyKeoRXHfOLtB04fFv0IP10ztdCh1W4n3zV8rKR9U3AW7sjpXTMNfWjFSHmGHIs_nyIBnzE9M3iNvdc_CGQZ6fSw4UZBGTBHqa0OnBW7HMvfgVcjhM-rg2k3ipZBO9TWWpQiPC0AA';

export const BRANCHES: Branch[] = [
  { id: 'downtown', name: 'Indiranagar Flagship', address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038', capacity: 220, activeMembers: 1248 },
  { id: 'westside', name: 'Koramangala Club', address: '80 Feet Road, 4th Block Koramangala, Bengaluru, Karnataka 560034', capacity: 190, activeMembers: 980 },
  { id: 'metro', name: 'BKC Executive Arena', address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051', capacity: 380, activeMembers: 1650 },
  { id: 'north', name: 'Connaught Place Club', address: 'Inner Circle, Connaught Place, New Delhi, Delhi 110001', capacity: 160, activeMembers: 720 },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    memberCode: '#MEM-8402',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@fitpro.in',
    phone: '+91 98201 44521',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    plan: 'VIP Annual',
    status: 'active',
    joinedDate: 'Oct 2023',
    expiryDate: 'Oct 24, 2027',
    lastVisit: 'Today (06:01 AM)',
    totalCheckIns: 184,
    assignedTrainer: 'Vikramaditya Rao',
    aadhaarNumber: '4829 1049 8812',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'aarav_aadhaar_card.pdf',
    emergencyContactName: 'Sunita Sharma',
    emergencyContactPhone: '+91 98201 99012',
    emergencyContactRelation: 'Mother',
    emergencyContact: '+91 98201 99012 (Mother)',
    gymifyPoints: 860,
    gymifyTier: 'Gold',
    referralsCount: 2,
    referralsList: [
      { id: 'ref-1', referredName: 'Kunal Singhal', referredPhone: '+91 98201 11223', date: 'Oct 12, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 },
      { id: 'ref-2', referredName: 'Sameer Joshi', referredPhone: '+91 98201 44889', date: 'Sep 28, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 },
    ],
    pointsHistory: [
      { id: 'ph-1', type: 'attendance', points: 20, description: 'Biometric Face-ID Check-in', timestamp: 'Today, 06:01 AM' },
      { id: 'ph-2', type: 'referral', points: 250, description: 'Referral Joined: Kunal Singhal', timestamp: 'Oct 12, 2026' },
      { id: 'ph-3', type: 'streak_bonus', points: 50, description: '7-Day Iron Attendance Streak Bonus', timestamp: 'Oct 10, 2026' },
      { id: 'ph-4', type: 'referral', points: 250, description: 'Referral Joined: Sameer Joshi', timestamp: 'Sep 28, 2026' },
    ],
  },
  {
    id: 'm2',
    memberCode: '#MEM-8403',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@zenfitness.in',
    phone: '+91 99304 88122',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    plan: 'Pro Monthly',
    status: 'active',
    joinedDate: 'Jan 2024',
    expiryDate: 'Nov 15, 2026',
    lastVisit: 'Today (05:58 AM)',
    totalCheckIns: 142,
    aadhaarNumber: '7192 4810 9943',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'vikram_aadhaar_card.pdf',
    emergencyContactName: 'Kavita Rao',
    emergencyContactPhone: '+91 99304 77100',
    emergencyContactRelation: 'Spouse',
    emergencyContact: '+91 99304 77100 (Spouse)',
    gymifyPoints: 540,
    gymifyTier: 'Silver',
    referralsCount: 1,
    referralsList: [
      { id: 'ref-3', referredName: 'Arjun Mehta', referredPhone: '+91 99304 22001', date: 'Oct 04, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 }
    ],
    pointsHistory: [
      { id: 'ph-5', type: 'attendance', points: 20, description: 'Biometric Face-ID Check-in', timestamp: 'Today, 05:58 AM' },
      { id: 'ph-6', type: 'referral', points: 250, description: 'Referral Joined: Arjun Mehta', timestamp: 'Oct 04, 2026' }
    ]
  },
  {
    id: 'm3',
    memberCode: '#MEM-7910',
    name: 'Pooja Iyer',
    email: 'pooja.iyer@athletics.org.in',
    phone: '+91 98450 12940',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    plan: 'Standard Semi-Annual',
    status: 'frozen',
    joinedDate: 'Jun 2023',
    expiryDate: 'Dec 10, 2026',
    lastVisit: 'Yesterday (07:30 PM)',
    totalCheckIns: 98,
    aadhaarNumber: '8839 2100 4491',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'pooja_aadhaar_front_back.pdf',
    emergencyContactName: 'Ramesh Iyer',
    emergencyContactPhone: '+91 98450 88210',
    emergencyContactRelation: 'Father',
    emergencyContact: '+91 98450 88210 (Father)',
    gymifyPoints: 310,
    gymifyTier: 'Silver',
    referralsCount: 0,
    referralsList: [],
    pointsHistory: [
      { id: 'ph-7', type: 'attendance', points: 20, description: 'Turnstile Check-in', timestamp: 'Yesterday, 07:30 PM' }
    ]
  },
  {
    id: 'm4',
    memberCode: '#MEM-5120',
    name: 'Rohan Verma',
    email: 'rohan.verma@designwave.in',
    phone: '+91 98110 77881',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    plan: 'VIP Annual',
    status: 'expired',
    joinedDate: 'Dec 2021',
    expiryDate: 'Oct 15, 2026',
    lastVisit: '25 mins ago',
    totalCheckIns: 215,
    aadhaarNumber: '9214 3820 1194',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'rohan_aadhaar_card.pdf',
    emergencyContactName: 'Meera Verma',
    emergencyContactPhone: '+91 98110 99012',
    emergencyContactRelation: 'Spouse',
    emergencyContact: '+91 98110 99012 (Spouse)',
    gymifyPoints: 140,
    gymifyTier: 'Bronze',
    referralsCount: 0,
    referralsList: [],
    pointsHistory: [
      { id: 'ph-8', type: 'attendance', points: 20, description: 'Turnstile Check-in', timestamp: '25 mins ago' }
    ]
  },
  {
    id: 'm5',
    memberCode: '#MEM-6294',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@studioflux.in',
    phone: '+91 98210 44329',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    plan: 'Pro Monthly',
    status: 'active',
    joinedDate: 'Mar 2023',
    expiryDate: 'Nov 30, 2026',
    lastVisit: 'Today (11:00 AM)',
    totalCheckIns: 164,
    aadhaarNumber: '5520 8912 3341',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'ananya_aadhaar_scan.pdf',
    emergencyContactName: 'Dr. Suresh Deshmukh',
    emergencyContactPhone: '+91 98210 77110',
    emergencyContactRelation: 'Father',
    emergencyContact: '+91 98210 77110 (Father)',
    gymifyPoints: 1120,
    gymifyTier: 'Gold',
    referralsCount: 3,
    referralsList: [
      { id: 'ref-4', referredName: 'Shreya Patel', referredPhone: '+91 98210 99221', date: 'Sep 15, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 },
      { id: 'ref-5', referredName: 'Tanvi Shinde', referredPhone: '+91 98210 33881', date: 'Aug 22, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 },
      { id: 'ref-6', referredName: 'Radhika K.', referredPhone: '+91 98210 11990', date: 'Jul 10, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 }
    ],
    pointsHistory: [
      { id: 'ph-9', type: 'attendance', points: 20, description: 'Biometric Face-ID Check-in', timestamp: 'Today, 11:00 AM' },
      { id: 'ph-10', type: 'referral', points: 250, description: 'Referral Joined: Shreya Patel', timestamp: 'Sep 15, 2026' }
    ]
  },
  {
    id: 'm6',
    memberCode: '#MEM-8402',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@corpfitness.in',
    phone: '+91 99201 12499',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    plan: 'VIP Annual',
    status: 'active',
    joinedDate: 'May 2023',
    expiryDate: 'May 10, 2027',
    lastVisit: '04:22 PM',
    totalCheckIns: 204,
    aadhaarNumber: '6619 4402 8820',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'sneha_aadhaar_verified.pdf',
    emergencyContactName: 'Ajay Kulkarni',
    emergencyContactPhone: '+91 99201 88320',
    emergencyContactRelation: 'Spouse',
    emergencyContact: '+91 99201 88320 (Spouse)',
    gymifyPoints: 1740,
    gymifyTier: 'Platinum',
    referralsCount: 4,
    referralsList: [
      { id: 'ref-7', referredName: 'Deepak Shah', referredPhone: '+91 99201 55667', date: 'Aug 05, 2026', status: 'Joined (Awarded)', pointsAwarded: 250 }
    ],
    pointsHistory: [
      { id: 'ph-11', type: 'attendance', points: 20, description: 'Biometric Camera Check-in', timestamp: '04:22 PM' }
    ]
  },
  {
    id: 'm7',
    memberCode: '#MEM-9104',
    name: 'Aditya Nair',
    email: 'aditya.nair@apexteam.in',
    phone: '+91 97402 44189',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    plan: 'Monthly Standard',
    status: 'active',
    joinedDate: 'Aug 2023',
    expiryDate: 'Dec 18, 2026',
    lastVisit: '04:18 PM',
    totalCheckIns: 88,
    aadhaarNumber: '3481 9902 4410',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'aditya_nair_aadhaar.pdf',
    emergencyContactName: 'Malini Nair',
    emergencyContactPhone: '+91 97402 11099',
    emergencyContactRelation: 'Mother',
    emergencyContact: '+91 97402 11099 (Mother)',
  },
  {
    id: 'm8',
    memberCode: '#MEM-1192',
    name: 'Divya Sen',
    email: 'divya.sen@iitb.ac.in',
    phone: '+91 98300 77421',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    plan: 'Student Pass',
    status: 'expired',
    joinedDate: 'Jan 2023',
    expiryDate: 'Sep 30, 2026',
    lastVisit: '04:10 PM',
    totalCheckIns: 65,
    aadhaarNumber: '7729 4410 8823',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'divya_aadhaar_card.pdf',
    emergencyContactName: 'Prabir Sen',
    emergencyContactPhone: '+91 98300 22100',
    emergencyContactRelation: 'Father',
    emergencyContact: '+91 98300 22100 (Father)',
  },
  {
    id: 'm9',
    memberCode: '#MEM-5521',
    name: 'Kabir Singhania',
    email: 'kabir.s@foundation.org.in',
    phone: '+91 98200 88033',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    plan: 'VIP Annual',
    status: 'active',
    joinedDate: 'Feb 2023',
    expiryDate: 'Feb 15, 2027',
    lastVisit: '03:55 PM',
    totalCheckIns: 176,
  }
];

export const INITIAL_CHECKINS: CheckInLog[] = [
  {
    id: 'c1',
    memberId: 'm7',
    memberName: 'Aditya Nair',
    memberCode: '#MEM-84920',
    plan: 'VIP Annual',
    timestamp: '2026-09-26T10:42:00',
    timeFormatted: 'Just now (10:42 AM)',
    method: 'QR Scanner',
    status: 'Allowed',
    terminal: 'Terminal #04'
  },
  {
    id: 'c2',
    memberId: 'm1',
    memberName: 'Aarav Sharma',
    memberCode: '#MEM-39281',
    plan: 'Monthly Standard',
    timestamp: '2026-09-26T10:39:00',
    timeFormatted: '3 mins ago (10:39 AM)',
    method: 'QR Scanner',
    status: 'Allowed',
    terminal: 'Terminal #04'
  },
  {
    id: 'c3',
    memberId: 'm3',
    memberName: 'Rohan Verma',
    memberCode: '#MEM-10928',
    plan: 'Day Pass',
    timestamp: '2026-09-26T10:30:00',
    timeFormatted: '12 mins ago (10:30 AM)',
    method: 'Manual Entry',
    status: 'Allowed',
    terminal: 'Front Desk Terminal'
  },
  {
    id: 'c4',
    memberId: 'm4',
    memberName: 'Pooja Iyer',
    memberCode: '#MEM-55412',
    plan: 'Student Pass',
    timestamp: '2026-09-26T10:17:00',
    timeFormatted: '25 mins ago (10:17 AM)',
    method: 'QR Scanner',
    status: 'Access Denied',
    terminal: 'Terminal #04'
  },
  {
    id: 'c5',
    memberId: 'm6',
    memberName: 'Sneha Kulkarni',
    memberCode: '#MEM-8402',
    plan: 'VIP Annual',
    timestamp: '2026-09-26T16:22:00',
    timeFormatted: '04:22 PM',
    method: 'QR Scanner',
    status: 'Allowed',
    terminal: 'Turnstile A'
  },
  {
    id: 'c6',
    memberId: 'm7',
    memberName: 'Aditya Nair',
    memberCode: '#MEM-9104',
    plan: 'Monthly Standard',
    timestamp: '2026-09-26T16:18:00',
    timeFormatted: '04:18 PM',
    method: 'QR Scanner',
    status: 'Allowed',
    terminal: 'Turnstile B'
  },
  {
    id: 'c7',
    memberId: 'm8',
    memberName: 'Divya Sen',
    memberCode: '#MEM-1192',
    plan: 'Student Pass',
    timestamp: '2026-09-26T16:10:00',
    timeFormatted: '04:10 PM',
    method: 'QR Scanner',
    status: 'Expired',
    terminal: 'Turnstile A'
  },
  {
    id: 'c8',
    memberId: 'm9',
    memberName: 'Kabir Singhania',
    memberCode: '#MEM-5521',
    plan: 'VIP Annual',
    timestamp: '2026-09-26T15:55:00',
    timeFormatted: '03:55 PM',
    method: 'QR Scanner',
    status: 'Allowed',
    terminal: 'Turnstile A'
  }
];

export const INITIAL_CLASSES: ClassSession[] = [
  {
    id: 'cls1',
    title: 'Desi HIIT & Core Conditioning',
    category: 'High Intensity',
    studio: 'Studio A',
    durationMins: 45,
    timeFormatted: '06:00 AM',
    trainerName: 'Priya Sundaram',
    trainerPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    capacity: 30,
    enrolled: 28,
    waitlist: 2,
    status: 'live'
  },
  {
    id: 'cls2',
    title: 'Ashtanga Yoga & Vinyasa Flow',
    category: 'Mind & Body',
    studio: 'Zen Studio',
    durationMins: 60,
    timeFormatted: '08:30 AM',
    trainerName: 'Vikramaditya Rao',
    trainerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    capacity: 20,
    enrolled: 20,
    waitlist: 6,
    status: 'upcoming'
  },
  {
    id: 'cls3',
    title: 'CrossFit Power Endurance & WOD',
    category: 'Strength',
    studio: 'Main Arena',
    durationMins: 60,
    timeFormatted: '10:00 AM',
    trainerName: 'Devrat Chauhan',
    trainerPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    capacity: 25,
    enrolled: 18,
    waitlist: 0,
    status: 'upcoming'
  },
  {
    id: 'cls4',
    title: 'Bollywood Spin & Rhythm Ride',
    category: 'Cardio',
    studio: 'Cycle Studio',
    durationMins: 45,
    timeFormatted: '05:30 PM',
    trainerName: 'Pooja Iyer',
    trainerPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    capacity: 35,
    enrolled: 34,
    waitlist: 1,
    status: 'upcoming'
  }
];

export const INITIAL_PT_SESSIONS: PTSession[] = [
  {
    id: 'pt1',
    clientName: 'Rahul Mehra',
    clientId: 'ID: PT-8092',
    clientPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Vikramaditya Rao',
    timeSlot: '07:00 AM',
    day: 'Monday',
    packageType: 'Advanced Hypertrophy',
    focus: 'Hypertrophy & Muscle',
    durationMins: 60,
    status: 'Confirmed',
    price: 1800,
    notes: 'Focus on incline dumbbell press and back hypertrophy'
  },
  {
    id: 'pt2',
    clientName: 'Ananya Deshmukh',
    clientId: 'ID: PT-8095',
    clientPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Priya Sundaram',
    timeSlot: '08:00 AM',
    day: 'Monday',
    packageType: 'Fat Loss & Conditioning',
    focus: 'Fat Loss & HIIT',
    durationMins: 60,
    status: 'Confirmed',
    price: 1500,
    notes: 'Heart rate target zone: 145-165 BPM interval sprints'
  },
  {
    id: 'pt3',
    clientName: 'Rajesh Singhal',
    clientId: 'ID: PT-8102',
    clientPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Devrat Chauhan',
    timeSlot: '09:00 AM',
    day: 'Monday',
    packageType: 'Injury Rehabilitation',
    focus: 'Posture & Rehab',
    durationMins: 45,
    status: 'Confirmed',
    price: 2000,
    notes: 'Lower lumbar decompression & rotator cuff stabilization'
  },
  {
    id: 'pt4',
    clientName: 'Tanya Kapoor',
    clientId: 'ID: PT-8110',
    clientPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Pooja Iyer',
    timeSlot: '05:00 PM',
    day: 'Monday',
    packageType: 'Functional Strength',
    focus: 'Strength & Conditioning',
    durationMins: 60,
    status: 'Confirmed',
    price: 1600,
    notes: 'Barbell deadlift form check & kettlebell complex'
  },
  {
    id: 'pt5',
    clientName: 'Kunal Verma',
    clientId: 'ID: PT-8118',
    clientPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Vikramaditya Rao',
    timeSlot: '06:00 PM',
    day: 'Monday',
    packageType: 'Athletic Conditioning',
    focus: 'Athletic Performance',
    durationMins: 60,
    status: 'Confirmed',
    price: 1800,
    notes: 'Sprint acceleration & plyometric box jumps'
  },
  {
    id: 'pt6',
    clientName: 'Sneha Kulkarni',
    clientId: 'ID: PT-8125',
    clientPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Priya Sundaram',
    timeSlot: '07:00 AM',
    day: 'Tuesday',
    packageType: 'Functional Strength',
    focus: 'Strength & Conditioning',
    durationMins: 60,
    status: 'Confirmed',
    price: 1500,
    notes: 'Barbell squat depth and hip mobility'
  },
  {
    id: 'pt7',
    clientName: 'Arjun Patel',
    clientId: 'ID: PT-8130',
    clientPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Vikramaditya Rao',
    timeSlot: '08:00 AM',
    day: 'Tuesday',
    packageType: 'Advanced Hypertrophy',
    focus: 'Hypertrophy & Muscle',
    durationMins: 60,
    status: 'Confirmed',
    price: 1800,
    notes: 'Chest & triceps progressive overload'
  },
  {
    id: 'pt8',
    clientName: 'Divya Sen',
    clientId: 'ID: PT-8134',
    clientPhoto: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Pooja Iyer',
    timeSlot: '06:00 PM',
    day: 'Wednesday',
    packageType: 'Fat Loss & Conditioning',
    focus: 'Fat Loss & HIIT',
    durationMins: 60,
    status: 'Confirmed',
    price: 1600,
    notes: 'Kettlebell swings & rowing machine sprints'
  },
  {
    id: 'pt9',
    clientName: 'Kabir Singhania',
    clientId: 'ID: PT-8140',
    clientPhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Devrat Chauhan',
    timeSlot: '05:00 PM',
    day: 'Thursday',
    packageType: 'Boxing Conditioning',
    focus: 'Boxing / Combat',
    durationMins: 60,
    status: 'Confirmed',
    price: 2200,
    notes: 'Pad work combinations & footwork drills'
  },
  {
    id: 'pt10',
    clientName: 'Meera Nambiar',
    clientId: 'ID: PT-8148',
    clientPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Priya Sundaram',
    timeSlot: '07:00 AM',
    day: 'Friday',
    packageType: 'Posture & Core Rehab',
    focus: 'Posture & Rehab',
    durationMins: 60,
    status: 'Confirmed',
    price: 1500,
    notes: 'Thoracic extension & deep core activation'
  },
  {
    id: 'pt11',
    clientName: 'Vikram Joshi',
    clientId: 'ID: PT-8152',
    clientPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    trainerName: 'Vikramaditya Rao',
    timeSlot: '09:00 AM',
    day: 'Saturday',
    packageType: 'Strength Max Testing',
    focus: 'Strength & Conditioning',
    durationMins: 75,
    status: 'Confirmed',
    price: 2000,
    notes: '1-rep max bench and squat assessment'
  }
];

export interface UnscheduledPTRequest {
  id: string;
  clientName: string;
  clientId: string;
  clientPhoto: string;
  preferredTrainer: string;
  preferredTime: string;
  preferredDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  packageType: string;
  focus: 'Strength & Conditioning' | 'Hypertrophy & Muscle' | 'Fat Loss & HIIT' | 'Posture & Rehab' | 'Athletic Performance' | 'Boxing / Combat';
  requestedDate: string;
  price: number;
}

export const INITIAL_UNSCHEDULED_REQUESTS: UnscheduledPTRequest[] = [
  {
    id: 'req1',
    clientName: 'Ishaan Chopra',
    clientId: 'ID: PT-8160',
    clientPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    preferredTrainer: 'Vikramaditya Rao',
    preferredTime: '07:00 AM',
    preferredDay: 'Wednesday',
    packageType: 'Hypertrophy 10-Pack',
    focus: 'Hypertrophy & Muscle',
    requestedDate: 'Requested Today',
    price: 1800
  },
  {
    id: 'req2',
    clientName: 'Rhea Sengupta',
    clientId: 'ID: PT-8165',
    clientPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    preferredTrainer: 'Priya Sundaram',
    preferredTime: '08:00 AM',
    preferredDay: 'Thursday',
    packageType: 'Fat Loss HIIT Booster',
    focus: 'Fat Loss & HIIT',
    requestedDate: 'Requested 1h ago',
    price: 1500
  },
  {
    id: 'req3',
    clientName: 'Gaurav Khanna',
    clientId: 'ID: PT-8172',
    clientPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    preferredTrainer: 'Devrat Chauhan',
    preferredTime: '06:00 PM',
    preferredDay: 'Friday',
    packageType: 'Combat Conditioning',
    focus: 'Boxing / Combat',
    requestedDate: 'Requested Yesterday',
    price: 2200
  },
  {
    id: 'req4',
    clientName: 'Deepika Nair',
    clientId: 'ID: PT-8180',
    clientPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    preferredTrainer: 'Pooja Iyer',
    preferredTime: '10:00 AM',
    preferredDay: 'Saturday',
    packageType: 'Postural Spine Alignment',
    focus: 'Posture & Rehab',
    requestedDate: 'Requested 2h ago',
    price: 1600
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'ld1',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@gmail.com',
    phone: '+91 99201 12499',
    stage: 'Trial Booked',
    source: 'Instagram Ad',
    assignedRep: 'Manish K.',
    assignedRepInitials: 'MK',
    lastInteraction: '10 mins ago',
    notes: 'Trial session tomorrow @ 10:00 AM'
  },
  {
    id: 'ld2',
    name: 'Aditya Nair',
    email: 'aditya.nair@gmail.com',
    phone: '+91 97402 44189',
    stage: 'Negotiation',
    source: 'Website',
    assignedRep: 'Simran L.',
    assignedRepInitials: 'SL',
    lastInteraction: '2 hours ago',
    notes: 'Reviewing corporate couple package quote'
  },
  {
    id: 'ld3',
    name: 'Ritu Sen',
    email: 'ritu.sen@fitmail.in',
    phone: '+91 98451 90211',
    stage: 'Trial Booked',
    source: 'Referral',
    assignedRep: 'Manish K.',
    assignedRepInitials: 'MK',
    lastInteraction: 'Yesterday',
    notes: 'Trial expiring today, needs follow-up call'
  },
  {
    id: 'ld4',
    name: 'Karan Bhasin',
    email: 'karan.b@gympro.in',
    phone: '+91 98101 44123',
    stage: 'New Inquiry',
    source: 'Walk-in',
    assignedRep: 'Joy D.',
    assignedRepInitials: 'JD',
    lastInteraction: '3 hours ago',
    notes: 'Interested in Annual Unlimited with Locker'
  },
  {
    id: 'ld5',
    name: 'Kunal Joshi',
    email: 'kunal.j@techmumbai.com',
    phone: '+91 98205 77133',
    stage: 'Trial Completed',
    source: 'Google Search',
    assignedRep: 'Simran L.',
    assignedRepInitials: 'SL',
    lastInteraction: '2 days ago',
    notes: 'Trial ended 2 days ago • Needs WhatsApp reminder'
  },
  {
    id: 'ld6',
    name: 'Meera Nambiar',
    email: 'meera.n@studiofilms.in',
    phone: '+91 99401 99188',
    stage: 'New Inquiry',
    source: 'Instagram Ad',
    assignedRep: 'Joy D.',
    assignedRepInitials: 'JD',
    lastInteraction: '3 days ago',
    notes: 'Requested student discount pricing'
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's1',
    staffCode: '#GYM-1024',
    name: 'Vikramaditya Rao',
    role: 'Senior Trainer',
    category: 'trainer',
    phone: '+91 99304 88122',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    shiftHours: '06:00 - 14:00',
    shiftType: 'Morning Shift',
    geofenceStatus: 'Verified Inside',
    onShift: true,
    aadhaarNumber: '7192 4810 9943',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'vikram_aadhaar_verified.pdf',
    emergencyContactName: 'Kavita Rao',
    emergencyContactPhone: '+91 99304 77100',
    emergencyContactRelation: 'Spouse',
    pastExperienceYears: 7,
    pastWorkplace: 'Gold\'s Gym Indiranagar & Talwalkars',
    specializations: 'Hypertrophy, Powerlifting, Olympic Weightlifting',
    certifications: 'ACE Certified Personal Trainer (CPT), CSCS (NSCA)',
    academicDegree: 'B.Sc. Exercise & Sports Science',
    academicInstitution: 'Manipal Academy of Higher Education',
    academicYear: '2019',
    certificationDocUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=400&q=80',
    certificationDocName: 'ACE_CPT_Credential_2024.pdf',
    academicDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    academicDocName: 'manipal_bsc_degree_certificate.pdf',
    resumeDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    resumeDocName: 'vikram_senior_trainer_cv.pdf',
  },
  {
    id: 's2',
    staffCode: '#GYM-1001',
    name: 'Pooja Iyer',
    role: 'Operations Manager',
    category: 'management',
    phone: '+91 98450 12940',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    shiftHours: '08:00 - 17:00',
    shiftType: 'Full Day',
    geofenceStatus: 'Verified Inside',
    onShift: true,
    aadhaarNumber: '8839 2100 4491',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'pooja_aadhaar_card.pdf',
    emergencyContactName: 'Ramesh Iyer',
    emergencyContactPhone: '+91 98450 88210',
    emergencyContactRelation: 'Father',
    pastExperienceYears: 5,
    pastWorkplace: 'Cult.fit & Anytime Fitness Koramangala',
    specializations: 'Facility Operations, Front-Desk Ops, Member Retention',
    certifications: 'ISSA Fitness Facility Management, CPR/AED First Aid',
    academicDegree: 'B.B.A. Sports & Hospitality Management',
    academicInstitution: 'Christ University, Bengaluru',
    academicYear: '2021',
    certificationDocUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=400&q=80',
    certificationDocName: 'issa_ops_certification.pdf',
    academicDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    academicDocName: 'christ_bba_degree.pdf',
  },
  {
    id: 's3',
    staffCode: '#GYM-1055',
    name: 'Rohan Verma',
    role: 'Front Desk Lead',
    category: 'frontdesk',
    phone: '+91 98110 77881',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    shiftHours: '13:00 - 21:00',
    shiftType: 'Evening Shift',
    geofenceStatus: 'Outside Geofence',
    onShift: true,
    aadhaarNumber: '9214 3820 1194',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'rohan_verma_aadhaar.pdf',
    emergencyContactName: 'Meera Verma',
    emergencyContactPhone: '+91 98110 99012',
    emergencyContactRelation: 'Spouse',
    pastExperienceYears: 3,
    pastWorkplace: 'Snap Fitness & Gold\'s Gym Connaught Place',
    specializations: 'POS Billing, Member Retention, Client Relations',
    certifications: 'Front-Desk Operations Excellence, Customer Service Pro',
    academicDegree: 'B.Com Financial Management',
    academicInstitution: 'Delhi University',
    academicYear: '2022',
    certificationDocUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=400&q=80',
    certificationDocName: 'du_bcom_degree.pdf',
    resumeDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    resumeDocName: 'rohan_lead_resume.pdf'
  },
  {
    id: 's4',
    staffCode: '#GYM-1089',
    name: 'Priya Sundaram',
    role: 'Personal Trainer',
    category: 'trainer',
    phone: '+91 98201 44521',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    shiftHours: '06:00 - 14:00',
    shiftType: 'Morning Shift',
    geofenceStatus: 'Verified Inside',
    onShift: true,
    aadhaarNumber: '3948 2019 4482',
    aadhaarDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    aadhaarDocName: 'priya_aadhaar_card.pdf',
    emergencyContactName: 'Karthik Sundaram',
    emergencyContactPhone: '+91 98201 33201',
    emergencyContactRelation: 'Sibling',
    pastExperienceYears: 4,
    pastWorkplace: 'Cult.fit & Fitness First BKC',
    specializations: 'Functional Training, Kettlebells, Women\'s Strength, Pilates',
    certifications: 'ISSA Certified Personal Trainer, Kettlebell Level 2',
    academicDegree: 'B.Sc. Nutrition & Dietetics',
    academicInstitution: 'SNDT Women\'s University, Mumbai',
    academicYear: '2021',
    certificationDocUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=400&q=80',
    certificationDocName: 'issa_cpt_priya.pdf',
    academicDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    academicDocName: 'sndt_bsc_nutrition.pdf',
    resumeDocUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    resumeDocName: 'priya_trainer_profile.pdf'
  }
];

export const INITIAL_STAFF_FEED: StaffCheckInFeed[] = [
  {
    id: 'sf1',
    staffName: 'Vikramaditya Rao',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    timeFormatted: '05:58 AM',
    gpsOffset: 'GPS: 3m accuracy (Indiranagar HQ)',
    isInside: true,
    status: 'Photo Verified',
    onTime: true
  },
  {
    id: 'sf2',
    staffName: 'Rohan Verma',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    timeFormatted: '12:55 PM',
    gpsOffset: 'Outside Geofence (45m offset)',
    isInside: false,
    status: 'Manager Review Required',
    onTime: false
  },
  {
    id: 'sf3',
    staffName: 'Priya Sundaram',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    timeFormatted: '06:01 AM',
    gpsOffset: 'GPS: 1m accuracy (Indiranagar HQ)',
    isInside: true,
    status: 'Photo Verified',
    onTime: true
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: '#INV-8421',
    memberId: 'm6',
    memberName: 'Kabir Singhania',
    memberCode: 'MEM-9021',
    memberInitials: 'KS',
    planOrDescription: 'VIP Annual Membership',
    amount: 38500.00,
    method: 'UPI',
    dateTimeFormatted: 'Oct 24, 2026 09:42',
    status: 'Paid'
  },
  {
    id: 'inv2',
    invoiceNumber: '#INV-8420',
    memberId: 'm1',
    memberName: 'Aarav Sharma',
    memberCode: 'MEM-1422',
    memberInitials: 'AS',
    planOrDescription: 'Pro Monthly Package',
    amount: 4500.00,
    method: 'UPI',
    dateTimeFormatted: 'Oct 24, 2026 08:15',
    status: 'Paid'
  },
  {
    id: 'inv3',
    invoiceNumber: '#INV-8419',
    memberId: 'm7',
    memberName: 'Aditya Nair',
    memberCode: 'MEM-8831',
    memberInitials: 'AN',
    planOrDescription: 'Personal Training Pack (10s)',
    amount: 18000.00,
    method: 'Credit Card',
    dateTimeFormatted: 'Oct 23, 2026 19:30',
    status: 'Pending'
  },
  {
    id: 'inv4',
    invoiceNumber: '#INV-8418',
    memberId: 'm9',
    memberName: 'Manish Trivedi',
    memberCode: 'MEM-3321',
    memberInitials: 'MT',
    planOrDescription: 'Monthly Standard',
    amount: 3200.00,
    method: 'Cash',
    dateTimeFormatted: 'Oct 22, 2026 14:10',
    status: 'Overdue'
  },
  {
    id: 'inv5',
    invoiceNumber: '#INV-8417',
    memberId: 'm4',
    memberName: 'Ananya Deshmukh',
    memberCode: 'MEM-7712',
    memberInitials: 'AD',
    planOrDescription: 'Locker Rental (Annual)',
    amount: 6000.00,
    method: 'UPI',
    dateTimeFormatted: 'Oct 21, 2026 11:05',
    status: 'Refunded'
  }
];

export const PENDING_PAYMENTS_LIST = [
  { initials: 'RT', name: 'Rajesh Tiwari', subtitle: 'Monthly Gym Dues', amount: 3200.00, dueDate: '2 days ago', status: 'Overdue' },
  { initials: 'EL', name: 'Esha Lakhani', subtitle: 'Personal Training Pack (10 Sessions)', amount: 15000.00, dueDate: 'Today', status: 'Pending' },
  { initials: 'DP', name: 'Darshan Patel', subtitle: 'Executive Locker Rental', amount: 1500.00, dueDate: '5 days ago', status: 'Overdue' },
  { initials: 'KW', name: 'Kavita Walia', subtitle: 'Monthly Standard Dues', amount: 3200.00, dueDate: 'Tomorrow', status: 'Scheduled' },
];

export const AT_RISK_MEMBERS = [
  {
    id: 'ar1',
    initials: 'JD',
    name: 'Juhi Dutta',
    code: '#MS-88921',
    riskScore: 'High (88%)',
    lastVisit: '14 days ago',
    activePlan: 'VIP Annual',
    riskFactor: '0 visits in 14 days',
    riskType: 'high'
  },
  {
    id: 'ar2',
    initials: 'MR',
    name: 'Manav Rawat',
    code: '#MS-44102',
    riskScore: 'High (82%)',
    lastVisit: '9 days ago',
    activePlan: 'Monthly Unlimited',
    riskFactor: 'Expiring in 3 days',
    riskType: 'high'
  },
  {
    id: 'ar3',
    initials: 'AL',
    name: 'Ankita Lamba',
    code: '#MS-99231',
    riskScore: 'Medium (65%)',
    lastVisit: '5 days ago',
    activePlan: 'Standard 6-Month',
    riskFactor: 'Skipped 3 PT Sessions',
    riskType: 'medium'
  },
  {
    id: 'ar4',
    initials: 'KS',
    name: 'Karan Singhal',
    code: '#MS-33109',
    riskScore: 'Medium (58%)',
    lastVisit: '4 days ago',
    activePlan: 'Monthly Unlimited',
    riskFactor: 'Declined UPI Autopay Retry',
    riskType: 'medium'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', ref: 'EXP-0021', date: '07/15/2026', category: 'Supplies', description: 'New kettlebells set (16kg & 24kg)', amount: 564.00, paymentMethod: 'Mobile Payment' },
  { id: 'exp-2', ref: 'EXP-0023', date: '07/11/2026', category: 'Supplies', description: 'Protein bar restock & BCAA powders', amount: 210.00, paymentMethod: 'Cash' },
  { id: 'exp-3', ref: 'EXP-0022', date: '07/09/2026', category: 'Marketing', description: 'Instagram promo boost & summer ad blitz', amount: 120.00, paymentMethod: 'Card' },
  { id: 'exp-4', ref: 'EXP-0019', date: '07/05/2026', category: 'Salaries', description: 'Trainer & front-desk payroll (1st fortnight)', amount: 3443.00, paymentMethod: 'Bank Transfer' },
  { id: 'exp-5', ref: 'EXP-0020', date: '07/05/2026', category: 'Utilities', description: 'Electricity, water & gigabit internet', amount: 307.00, paymentMethod: 'Card' },
  { id: 'exp-6', ref: 'EXP-0018', date: '07/01/2026', category: 'Rent', description: 'Main gym facility monthly lease', amount: 1850.00, paymentMethod: 'Bank Transfer' },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'TKT-1082',
    memberId: 'm1',
    memberName: 'Aarav Sharma',
    memberPhone: '+91 98201 44521',
    category: 'Air Conditioning',
    subject: 'Cardio Section AC Cooling Low during 6:30 PM Peak',
    description: 'During evening peak hours, the cross-trainer and treadmill corner feels excessively humid. Temperature displayed was 27C instead of 21C.',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Amit Kumar (HVAC Lead)',
    createdAt: 'Today, 09:15 AM',
    branchId: 'downtown'
  },
  {
    id: 'cmp-2',
    ticketNumber: 'TKT-1081',
    memberId: 'm3',
    memberName: 'Priya Patel',
    memberPhone: '+91 98112 30911',
    category: 'Turnstile / Access',
    subject: 'Turnstile Tripod QR Scanner Delay',
    description: 'The mobile QR scanner took multiple attempts to trigger the tripod arm on Gate 2.',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Rajesh Nair (Hardware Tech)',
    createdAt: 'Yesterday, 07:30 AM',
    resolvedAt: 'Yesterday, 02:00 PM',
    resolutionNote: 'Cleaned camera lens on eSSL biometric terminal and restarted local turnstile relay driver.',
    branchId: 'downtown'
  },
  {
    id: 'cmp-3',
    ticketNumber: 'TKT-1079',
    memberId: 'm4',
    memberName: 'Rohan Mehra',
    memberPhone: '+91 97118 76543',
    category: 'Equipment',
    subject: 'Dumbbell 24kg Rubber Grip Loose',
    description: 'The right rubber ring on the 24kg hex dumbbell is vibrating during heavy presses.',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Fitness Floor Marshals',
    createdAt: '2 days ago',
    branchId: 'downtown'
  },
  {
    id: 'cmp-4',
    ticketNumber: 'TKT-1075',
    memberId: 'm2',
    memberName: 'Vikramaditya Rao',
    memberPhone: '+91 99304 88122',
    category: 'Cleanliness',
    subject: 'Steam Room Steam Flow Timing Extension',
    description: 'Requesting the steam room session cycle to be increased from 15 minutes to 20 minutes between auto-cycles.',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Facility Supervisor',
    createdAt: '3 days ago',
    resolvedAt: '2 days ago',
    resolutionNote: 'Adjusted digital timer relay in spa control unit.',
    branchId: 'downtown'
  },
  {
    id: 'cmp-5',
    ticketNumber: 'TKT-1071',
    memberId: 'm5',
    memberName: 'Neha Deshmukh',
    memberPhone: '+91 98450 11234',
    category: 'Billing',
    subject: 'GST Invoice ITC Credit Details on Receipt',
    description: 'Need company GSTIN updated on quarterly membership tax invoice for corporate wellness tax deduction.',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Pooja Iyer (Accounts Desk)',
    createdAt: '4 days ago',
    branchId: 'downtown'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Independence Day Mega Fitness Bootcamp & Pull-Up Challenge',
    category: 'Urgent Alert',
    content: 'Join our special morning session this Friday! Open to all active and trial members with customized prizes, protein shaker bottles, and gym merch.',
    date: 'Aug 13, 2026',
    targetAudience: 'All Members',
    sentViaWhatsApp: true,
    author: 'Coach Vikramaditya'
  },
  {
    id: 'ann-2',
    title: 'Sunday Morning Special Vinyasa Yoga Session with Guest Yogini',
    category: 'Class Update',
    content: '90-minute holistic mobility, breathwork & core endurance workshop. Pre-booking mandatory through the Member App (limit 25 slots).',
    date: 'Aug 10, 2026',
    targetAudience: 'All Members',
    sentViaWhatsApp: true,
    author: 'Front Desk Admin'
  },
  {
    id: 'ann-3',
    title: 'eSSL Biometric Gate Firmware & Sync Upgrade',
    category: 'Maintenance',
    content: 'Scheduled server and turnstile firmware upgrade on Sunday night (11:00 PM to 12:30 AM). Offline check-ins will cache automatically.',
    date: 'Aug 05, 2026',
    targetAudience: 'Trainers',
    sentViaWhatsApp: false,
    author: 'Systems Admin'
  },
  {
    id: 'ann-4',
    title: 'Fresh Stock: 100% Authentic Whey Isolate & Sattu Protein Cafe',
    category: 'Promotion',
    content: 'Restocked premium chocolate whey, creatine monohydrate, and pre-workout drinks at our front-desk nutrition counter. 10% off for Annual VIPs.',
    date: 'Aug 01, 2026',
    targetAudience: 'All Members',
    sentViaWhatsApp: true,
    author: 'Gym Store Team'
  }
];

export const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'wp-1',
    name: 'Push-Pull-Legs (PPL) Lean Hypertrophy',
    category: 'Hypertrophy PPL',
    difficulty: 'Intermediate',
    durationWeeks: 12,
    daysPerWeek: 6,
    description: 'Classic push-pull-legs split targeting progressive overload, hypertrophy, and joint longevity with structured rest days.',
    assignedMembersCount: 42,
    days: [
      {
        dayName: 'Day 1: Push (Chest, Shoulders & Triceps)',
        focus: 'Upper body pushing power',
        exercises: [
          { name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Maintain scapular retraction' },
          { name: 'Incline Dumbbell Press (30 deg)', sets: 3, reps: '10-12', rest: '75s', notes: 'Full stretch at bottom' },
          { name: 'Standing Dumbbell Lateral Raises', sets: 4, reps: '15-20', rest: '45s', notes: 'Lead with elbows' },
          { name: 'Overhead Cable Tricep Extension', sets: 3, reps: '12-15', rest: '60s' },
          { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15', rest: '45s' }
        ]
      },
      {
        dayName: 'Day 2: Pull (Back, Rear Delts & Biceps)',
        focus: 'Lat width & posterior chain density',
        exercises: [
          { name: 'Conventional Deadlift or Rack Pull', sets: 3, reps: '5-6', rest: '120s' },
          { name: 'Wide-Grip Lat Pulldowns', sets: 4, reps: '10-12', rest: '60s' },
          { name: 'Chest-Supported T-Bar Row', sets: 3, reps: '10-12', rest: '75s' },
          { name: 'Rear Delt Face Pulls with Rope', sets: 4, reps: '15-20', rest: '45s' },
          { name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '10-12', rest: '60s' }
        ]
      },
      {
        dayName: 'Day 3: Legs & Core Power',
        focus: 'Quad drive, hamstrings & calves',
        exercises: [
          { name: 'Barbell Back Squats', sets: 4, reps: '6-8', rest: '120s', notes: 'Hit parallel depth' },
          { name: 'Romanian Deadlifts (RDL)', sets: 3, reps: '8-10', rest: '90s' },
          { name: 'Leg Press (45 degree)', sets: 3, reps: '12-15', rest: '75s' },
          { name: 'Standing Calf Raises', sets: 4, reps: '15-20', rest: '45s' },
          { name: 'Hanging Leg Raises', sets: 3, reps: '15', rest: '45s' }
        ]
      }
    ]
  },
  {
    id: 'wp-2',
    name: 'Desi Akhada Functional Strength & Conditioning',
    category: 'Desi Akhada Strength',
    difficulty: 'Advanced',
    durationWeeks: 8,
    daysPerWeek: 4,
    description: 'Traditional Indian wrestling (Akhada) endurance and functional strength combined with modern barbell powerlifting.',
    assignedMembersCount: 28,
    days: [
      {
        dayName: 'Day 1: Clubbell Swings & Hindu Pushups',
        focus: 'Rotational core power & shoulder girdle resilience',
        exercises: [
          { name: 'Mugdar / Heavy Clubbell 360 Swings', sets: 4, reps: '20 each arm', rest: '60s' },
          { name: 'Dands (Hindu Pushups)', sets: 4, reps: '25-30', rest: '60s' },
          { name: 'Baithaks (Deep Hindu Squats)', sets: 4, reps: '50', rest: '60s' },
          { name: 'Farmer Carry with Heavy Trap Bar', sets: 4, reps: '40 meters', rest: '90s' }
        ]
      },
      {
        dayName: 'Day 2: Heavy Barbell Complex',
        focus: 'Raw posterior chain & overhead lockout',
        exercises: [
          { name: 'Overhead Barbell Military Press', sets: 5, reps: '5', rest: '90s' },
          { name: 'Barbell Clean & Strict Press', sets: 4, reps: '6', rest: '90s' },
          { name: 'Weighted Pull-Ups', sets: 4, reps: '6-8', rest: '75s' },
          { name: 'Heavy Kettlebell Snatches', sets: 3, reps: '15 each arm', rest: '60s' }
        ]
      }
    ]
  }
];

export const INITIAL_DIET_PLANS: DietPlan[] = [
  {
    id: 'dp-1',
    name: 'Indian Vegetarian High-Protein Split',
    dietType: 'Indian Veg High-Protein',
    totalCalories: 2250,
    proteinGrams: 145,
    carbsGrams: 230,
    fatsGrams: 65,
    description: 'Engineered specifically for Indian vegetarian lifters using whole foods (paneer, moong dal, sattu, curd) alongside whey supplementation.',
    assignedMembersCount: 56,
    meals: [
      {
        mealName: 'Meal 1: High Protein Breakfast (08:30 AM)',
        time: '08:30 AM',
        items: ['3 Besan / Moong Dal Chillas', '100g Fresh Low-Fat Paneer Bhurji', '1 Cup Green Tea / Black Coffee'],
        proteinGrams: 32,
        calories: 480
      },
      {
        mealName: 'Meal 2: Mid-Morning Energizer (11:30 AM)',
        time: '11:30 AM',
        items: ['1 Glass Chana Sattu Drink (40g sattu + lemon + jeera)', 'Handful Roasted Chana (30g)'],
        proteinGrams: 20,
        calories: 270
      },
      {
        mealName: 'Meal 3: Wholesome Indian Lunch (02:00 PM)',
        time: '02:00 PM',
        items: ['2 Multigrain / Jowar Rotis', '1 Large Bowl Dal Tadka (Toor / Moong)', '150g Low-fat Curd / Dahi', 'Cucumber Tomato Salad'],
        proteinGrams: 28,
        calories: 550
      },
      {
        mealName: 'Meal 4: Pre / Post-Workout Fuel (05:30 PM)',
        time: '05:30 PM',
        items: ['1 Scoop Whey Protein Isolate in water', '1 Robusta Banana', '5 Almonds + 2 Walnuts'],
        proteinGrams: 30,
        calories: 320
      },
      {
        mealName: 'Meal 5: Muscle Recovery Dinner (08:45 PM)',
        time: '08:45 PM',
        items: ['50g Soya Chunks Curry (boiled & cooked with light olive oil)', '1 Roti + Steamed Mixed Vegetables (Spinach, Broccoli, Carrots)'],
        proteinGrams: 35,
        calories: 430
      }
    ]
  },
  {
    id: 'dp-2',
    name: 'Indian Non-Veg Lean Muscle Shred',
    dietType: 'Indian Non-Veg Lean Muscle',
    totalCalories: 2450,
    proteinGrams: 180,
    carbsGrams: 240,
    fatsGrams: 62,
    description: 'High-protein diet featuring whole eggs, grilled chicken breast, fish, brown basmati rice, and desi peanut butter for rapid muscle recovery.',
    assignedMembersCount: 68,
    meals: [
      {
        mealName: 'Meal 1: Breakfast Power Bowl (08:00 AM)',
        time: '08:00 AM',
        items: ['4 Boiled Egg Whites + 2 Whole Eggs', '60g Rolled Oats with 200ml Skimmed Milk & Berries', 'Black Coffee'],
        proteinGrams: 38,
        calories: 510
      },
      {
        mealName: 'Meal 2: Mid-Day Snack (11:30 AM)',
        time: '11:30 AM',
        items: ['1 Medium Apple', '1 Scoop Whey Protein Shake', '10 Raw Almonds'],
        proteinGrams: 28,
        calories: 310
      },
      {
        mealName: 'Meal 3: Gym Pro Lunch (01:45 PM)',
        time: '01:45 PM',
        items: ['180g Grilled Lemon-Herb Chicken Breast', '150g Cooked Brown Basmati Rice', 'Steamed Green Beans & Beetroot'],
        proteinGrams: 48,
        calories: 580
      },
      {
        mealName: 'Meal 4: Pre-Workout Quick Snack (05:00 PM)',
        time: '05:00 PM',
        items: ['2 Slices Whole Wheat Bread with 25g 100% Desi Peanut Butter', '1 Black Coffee with Cinnamon'],
        proteinGrams: 14,
        calories: 280
      },
      {
        mealName: 'Meal 5: Dinner Recovery (08:30 PM)',
        time: '08:30 PM',
        items: ['150g Grilled Fish or Chicken Tikka', '1 Bowl Yellow Moong Dal', 'Large Mixed Veggie Bowl with Lemon'],
        proteinGrams: 52,
        calories: 570
      }
    ]
  }
];

