import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReviewItem {
  id: string;
  name: string;
  gymName: string;
  city: string;
  rating: number;
  date: string;
  quote: string;
  verified: boolean;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Marcus Bell',
    gymName: 'Ironline Strength Club',
    city: 'Austin, TX',
    rating: 5,
    date: '2 days ago',
    quote: 'Running our front desk with Gymify PRO has saved us at least 15 hours a week. The one-click check-ins and automatic expiry countdowns eliminated awkward payment conversations completely.',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'Elena Rossi',
    gymName: 'Vitality Studio & Yoga',
    city: 'Denver, CO',
    rating: 5,
    date: '1 week ago',
    quote: 'The fact that it runs locally in our browser with zero subscription fees is incredible. We own our data, track trainer class loads effortlessly, and can export receipts and reports in one click.',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Darnell Woods',
    gymName: 'Apex Boxing & HIIT Arena',
    city: 'Chicago, IL',
    rating: 5,
    date: '2 weeks ago',
    quote: 'Class capacity tracking and real-time expense monitoring gave us total clarity on where the money goes. Revenue and profit charts are cleaner than any $200/month SaaS we ever used.',
    verified: true,
  },
  {
    id: 'rev-4',
    name: 'Priya Nair',
    gymName: 'Zenith Performance Lab',
    city: 'Seattle, WA',
    rating: 5,
    date: '3 weeks ago',
    quote: 'Super clean, ultra-fast, and works offline whenever internet drops. Our trainers love having their schedules and assigned member rosters in one accessible dashboard.',
    verified: true,
  },
];

type ShowcaseModuleId =
  | 'dashboard'
  | 'members'
  | 'attendance'
  | 'payments'
  | 'trainers'
  | 'classes'
  | 'expenses'
  | 'analytics'
  | 'reports';

type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'AED' | 'EUR';

interface PlanPriceInfo {
  monthly: number;
  yearly: number;
  symbol: string;
  formattedMonthly: string;
  formattedYearly: string;
  annualBillingTotal: string;
  annualSavings: string;
}

const PLAN_PRICING: Record<
  'starter' | 'growth' | 'pro',
  Record<CurrencyCode, PlanPriceInfo>
> = {
  starter: {
    INR: { monthly: 2500, yearly: 2000, symbol: '₹', formattedMonthly: '₹2,500', formattedYearly: '₹2,000', annualBillingTotal: '₹24,000', annualSavings: 'Save ₹6,000/yr' },
    USD: { monthly: 29, yearly: 23, symbol: '$', formattedMonthly: '$29', formattedYearly: '$23', annualBillingTotal: '$276', annualSavings: 'Save $72/yr' },
    GBP: { monthly: 24, yearly: 19, symbol: '£', formattedMonthly: '£24', formattedYearly: '£19', annualBillingTotal: '£228', annualSavings: 'Save £60/yr' },
    EUR: { monthly: 27, yearly: 21, symbol: '€', formattedMonthly: '€27', formattedYearly: '€21', annualBillingTotal: '€252', annualSavings: 'Save €72/yr' },
    AED: { monthly: 109, yearly: 87, symbol: 'د.إ', formattedMonthly: '109 د.إ', formattedYearly: '87 د.إ', annualBillingTotal: '1,044 د.إ', annualSavings: 'Save 264 د.إ/yr' },
  },
  growth: {
    INR: { monthly: 4000, yearly: 3200, symbol: '₹', formattedMonthly: '₹4,000', formattedYearly: '₹3,200', annualBillingTotal: '₹38,400', annualSavings: 'Save ₹9,600/yr' },
    USD: { monthly: 49, yearly: 39, symbol: '$', formattedMonthly: '$49', formattedYearly: '$39', annualBillingTotal: '$468', annualSavings: 'Save $120/yr' },
    GBP: { monthly: 39, yearly: 31, symbol: '£', formattedMonthly: '£39', formattedYearly: '£31', annualBillingTotal: '£372', annualSavings: 'Save £96/yr' },
    EUR: { monthly: 45, yearly: 36, symbol: '€', formattedMonthly: '€45', formattedYearly: '€36', annualBillingTotal: '€432', annualSavings: 'Save €108/yr' },
    AED: { monthly: 179, yearly: 143, symbol: 'د.إ', formattedMonthly: '179 د.إ', formattedYearly: '143 د.إ', annualBillingTotal: '1,716 د.إ', annualSavings: 'Save 432 د.إ/yr' },
  },
  pro: {
    INR: { monthly: 7000, yearly: 5600, symbol: '₹', formattedMonthly: '₹7,000', formattedYearly: '₹5,600', annualBillingTotal: '₹67,200', annualSavings: 'Save ₹16,800/yr' },
    USD: { monthly: 89, yearly: 71, symbol: '$', formattedMonthly: '$89', formattedYearly: '$71', annualBillingTotal: '$852', annualSavings: 'Save $216/yr' },
    GBP: { monthly: 69, yearly: 55, symbol: '£', formattedMonthly: '£69', formattedYearly: '£55', annualBillingTotal: '£660', annualSavings: 'Save £168/yr' },
    EUR: { monthly: 82, yearly: 65, symbol: '€', formattedMonthly: '€82', formattedYearly: '€65', annualBillingTotal: '€780', annualSavings: 'Save €204/yr' },
    AED: { monthly: 329, yearly: 263, symbol: 'د.إ', formattedMonthly: '329 د.إ', formattedYearly: '263 د.إ', annualBillingTotal: '3,156 د.إ', annualSavings: 'Save 792 د.إ/yr' },
  },
};

const currencyDetails: Record<CurrencyCode, { flag: string; label: string; symbol: string; singlePrice: string; proPrice: string; subtitle: string }> = {
  INR: { flag: '🇮🇳', label: 'IN INR', symbol: '₹', singlePrice: '₹3,999', proPrice: '₹7,999', subtitle: 'Lifetime License • Instant UPI & Card Activation' },
  USD: { flag: '🇺🇸', label: 'US USD', symbol: '$', singlePrice: '$49', proPrice: '$99', subtitle: 'One-time payment • Free lifetime updates' },
  GBP: { flag: '🇬🇧', label: 'GB GBP', symbol: '£', singlePrice: '£39', proPrice: '£79', subtitle: 'One-off fee • Zero recurring subscriptions' },
  AED: { flag: '🇦🇪', label: 'AE AED', symbol: 'د.إ', singlePrice: '179 د.إ', proPrice: '359 د.إ', subtitle: 'Single purchase • Works offline locally' },
  EUR: { flag: '🇪🇺', label: 'EU EUR', symbol: '€', singlePrice: '€45', proPrice: '€89', subtitle: 'Einmalige Zahlung • Keine monatlichen Kosten' },
};

export const LandingTourView: React.FC = () => {
  const { setActiveScreen, showToast, theme, toggleTheme } = useGym();

  // Pricing Billing Cycle Toggle (Monthly vs Yearly matching User Image)
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Currency Selector State matching Image Inspiration (IN INR)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Interactive ROI & Plan Calculator
  const [pricingMembersSlider, setPricingMembersSlider] = useState<number>(180);
  const [showPricingComparison, setShowPricingComparison] = useState<boolean>(false);
  const [pricingFaqOpen, setPricingFaqOpen] = useState<Record<number, boolean>>({ 0: true });

  // Plan Enrollment / Checkout Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedEnrollPlan, setSelectedEnrollPlan] = useState<'Starter' | 'Growth' | 'Pro' | 'Enterprise'>('Growth');
  const [enrollGymName, setEnrollGymName] = useState('');
  const [enrollOwnerName, setEnrollOwnerName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollCity, setEnrollCity] = useState('');
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  // Book Free Demo Modal State
  const [isBookDemoModalOpen, setIsBookDemoModalOpen] = useState(false);
  const [demoGymName, setDemoGymName] = useState('');
  const [demoOwnerName, setDemoOwnerName] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoCity, setDemoCity] = useState('');
  const [demoSlot, setDemoSlot] = useState('Today 3:00 PM (IST)');
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  // Download Apps Modal State
  const [isDownloadAppsModalOpen, setIsDownloadAppsModalOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Active module in the Live Product Showcase Window
  const [activeShowcaseModule, setActiveShowcaseModule] = useState<ShowcaseModuleId>('dashboard');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Legal Document & Newsletter State matching Footer
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms' | 'dpdp' | 'gdpr' | 'deletion' | 'cookies'>('privacy');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  // Core Modules Inspector Modal State (Images 2 & 3)
  const [inspectedModule, setInspectedModule] = useState<{
    num: string;
    title: string;
    description: string;
    tag: string;
    screenId: string;
    featureAction?: string;
    indiaContext?: string;
    showcaseId?: ShowcaseModuleId;
  } | null>(null);

  // Reviews State & Modal
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewGym, setNewReviewGym] = useState('');
  const [newReviewCity, setNewReviewCity] = useState('');
  const [newReviewQuote, setNewReviewQuote] = useState('');

  // Interactive front desk check-in demo state in showcase
  const [mockCheckins, setMockCheckins] = useState<Record<string, boolean>>({});

  // 3 Connected Apps Switcher State (gymify.co.in/features inspired)
  const [selectedAppRole, setSelectedAppRole] = useState<'owner' | 'trainer' | 'member'>('owner');

  // Interactive Live QR / Biometric Scanner Simulator State
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [liveOccupancyCount, setLiveOccupancyCount] = useState(78);
  const [lastScannedMember, setLastScannedMember] = useState<{
    name: string;
    id: string;
    plan: string;
    status: 'granted' | 'expiring' | 'expired';
    time: string;
    avatar: string;
  } | null>({
    name: 'Rahul Verma',
    id: 'GC-1082',
    plan: 'Annual Unlimited VIP',
    status: 'granted',
    time: 'Just now',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  });

  // Web Audio Scanner Beep
  const playScanChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5 note
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio playback blocked or unallowed
    }
  };

  const handleSimulateScan = () => {
    if (isSimulatingScan) return;
    setIsSimulatingScan(true);
    playScanChime();

    const sampleMembers = [
      { name: 'Sneha Roy', id: 'GC-2041', plan: 'Standard 6-Month', status: 'granted' as const, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' },
      { name: 'Vikram Malhotra', id: 'GC-3019', plan: 'Quarterly CrossFit Pass', status: 'granted' as const, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
      { name: 'Ananya Sharma', id: 'GC-1055', plan: 'Student Special Monthly', status: 'expiring' as const, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' },
      { name: 'Arjun Kapoor', id: 'GC-4092', plan: 'Annual Strength Elite', status: 'granted' as const, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
    ];
    const picked = sampleMembers[Math.floor(Math.random() * sampleMembers.length)];

    setTimeout(() => {
      setIsSimulatingScan(false);
      setLiveOccupancyCount((prev) => prev + 1);
      setLastScannedMember({
        ...picked,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
      showToast(
        'Turnstile Unlocked • Access Granted',
        `${picked.name} (${picked.id}) checked in successfully. Headcount: ${liveOccupancyCount + 1}`,
        'success'
      );
    }, 800);
  };

  // Interactive GST Invoice Modal State
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);

  // Interactive WhatsApp Reminder Simulator State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedWaTemplate, setSelectedWaTemplate] = useState<'7days' | 'due_today' | 'overdue'>('7days');

  // Interactive Class Seat Reservation Simulator State
  const [classSeats, setClassSeats] = useState<Record<string, { booked: number; capacity: number }>>({
    'c-1': { booked: 18, capacity: 20 },
    'c-2': { booked: 14, capacity: 15 },
    'c-3': { booked: 22, capacity: 25 },
    'c-4': { booked: 11, capacity: 12 },
  });

  const handleReserveClassSeat = (classId: string, className: string) => {
    setClassSeats((prev) => {
      const cur = prev[classId] || { booked: 10, capacity: 20 };
      if (cur.booked >= cur.capacity) {
        showToast('Class Full', `${className} has reached maximum capacity of ${cur.capacity}. Added to waitlist #1`, 'info');
        return prev;
      }
      const updated = { ...cur, booked: cur.booked + 1 };
      showToast('Seat Reserved!', `Spot confirmed for ${className}! Capacity: ${updated.booked}/${updated.capacity}`, 'success');
      return { ...prev, [classId]: updated };
    });
  };

  const toggleMockCheckin = (memberId: string, memberName: string) => {
    setMockCheckins((prev) => {
      const isCheckedIn = !prev[memberId];
      showToast(
        isCheckedIn ? 'Checked In' : 'Checked Out',
        `${memberName} ${isCheckedIn ? 'is now logged inside facility' : 'checked out'}`,
        'success'
      );
      return { ...prev, [memberId]: isCheckedIn };
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDemoBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoGymName.trim() || !demoPhone.trim()) {
      showToast('Missing Details', 'Please enter your Gym Name and WhatsApp Phone Number.', 'error');
      return;
    }
    setIsSubmittingDemo(true);
    setTimeout(() => {
      setIsSubmittingDemo(false);
      setIsBookDemoModalOpen(false);
      showToast(
        'Free Demo Booked!',
        `Thank you ${demoOwnerName || 'Coach'}! Our Gymify specialist will connect on WhatsApp at ${demoPhone} for ${demoSlot}.`,
        'success'
      );
      setDemoGymName('');
      setDemoOwnerName('');
      setDemoPhone('');
      setDemoCity('');
    }, 600);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast('Missing details', 'Please fill out your name, email and message.', 'error');
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      showToast('Message Sent!', 'Thank you! The Gymify PRO team will get back to you shortly.', 'success');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 500);
  };

  const openLegalModal = (tab: 'privacy' | 'terms' | 'dpdp' | 'gdpr' | 'deletion' | 'cookies') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      showToast('Email Required', 'Please enter your email address.', 'error');
      return;
    }
    setIsSubmittingNewsletter(true);
    setTimeout(() => {
      setIsSubmittingNewsletter(false);
      showToast('2026 Playbook Sent!', `The Gymify Management Playbook was sent to ${newsletterEmail}.`, 'success');
      setNewsletterEmail('');
    }, 500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewQuote.trim()) {
      showToast('Missing Details', 'Please provide your name and review quote.', 'error');
      return;
    }
    const createdReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: newReviewName.trim(),
      gymName: newReviewGym.trim() || 'Independent Gym',
      city: newReviewCity.trim() || 'Verified Gym Owner',
      rating: 5,
      date: 'Just now',
      quote: newReviewQuote.trim(),
      verified: true,
    };
    setReviews([createdReview, ...reviews]);
    setIsReviewModalOpen(false);
    setNewReviewName('');
    setNewReviewGym('');
    setNewReviewCity('');
    setNewReviewQuote('');
    showToast('Review Published', 'Thank you for your feedback on Gymify PRO!', 'success');
  };

  // 12 Core Modules directly from Images 2 & 3
  const CORE_MODULES_LIST = [
    {
      num: '01',
      title: 'Member Management',
      description: 'Create member profiles, track active plans, store contact details, manage renewals, record measurements, and see attendance and payment history from one profile.',
      tag: 'Profiles • KYC • Expiry',
      icon: 'badge',
      screenId: 'members',
      showcaseId: 'members' as ShowcaseModuleId,
      indiaContext: 'Indian phone verification (+91), Aadhaar/ID photo vault, emergency contact tracking, and instant WhatsApp member welcome.'
    },
    {
      num: '02',
      title: 'Trainer Management',
      description: 'Add trainers, assign members, manage sessions, track trainer check-ins, and give every trainer a mobile workflow for daily client handling.',
      tag: 'HRMS • PT Split • Shifts',
      icon: 'fitness_center',
      screenId: 'staff-hr',
      showcaseId: 'trainers' as ShowcaseModuleId,
      indiaContext: 'PT commission payout calculator (70/30 split), biometric shift punches, and client progress logging.'
    },
    {
      num: '03',
      title: 'Billing, Payments, and GST Invoices',
      description: 'Create plans, record UPI, cash, or online payments, generate invoices, track dues, and keep collection status visible to the owner team.',
      tag: 'GST 18% • SAC 999723 • UPI',
      icon: 'receipt_long',
      screenId: 'payments',
      showcaseId: 'payments' as ShowcaseModuleId,
      indiaContext: 'Full compliance with Indian GST laws: 18% GST (9% CGST + 9% SGST), SAC code 999723, dynamic UPI QR code generator (PhonePe, GPay, Paytm), and instant PDF tax invoices.'
    },
    {
      num: '04',
      title: 'Biometric Attendance',
      description: 'Support biometric check-ins, manual attendance, QR/app check-ins, and attendance history for members, trainers, and staff.',
      tag: 'eSSL • Mantra • RFID • Turnstile',
      icon: 'fingerprint',
      screenId: 'attendance',
      showcaseId: 'attendance' as ShowcaseModuleId,
      indiaContext: 'Native hardware bridge for Indian gym turnstiles: eSSL, Mantra, BioMax, and ZKTeco tripod gates with 0.18s relay response.'
    },
    {
      num: '05',
      title: 'Class Scheduling and Booking',
      description: 'Create batches, set capacities, assign trainers, manage class attendance, and let members see relevant sessions from their app.',
      tag: 'Batches • Yoga • CrossFit • Zumba',
      icon: 'calendar_month',
      screenId: 'classes-pt',
      showcaseId: 'classes' as ShowcaseModuleId,
      indiaContext: 'Morning and evening rush batches, waiting lists, instant member class passes, and instructor attendance sync.'
    },
    {
      num: '06',
      title: 'Workout and Diet Plans',
      description: 'Build structured workout and diet plans, assign them to members, and let trainers update guidance without repeated chat messages.',
      tag: 'Indian Veg/Non-Veg • PPL • Akhada',
      icon: 'restaurant',
      screenId: 'workouts-diets',
      featureAction: 'workout-diet',
      indiaContext: 'Customized Indian diet splits (Paneer Bhurji, Sattu drink, Moong Dal Chilla, Dal Tadka, Whey) and Push-Pull-Legs + Desi Akhada strength routines.'
    },
    {
      num: '07',
      title: 'Renewal and Due Follow-ups',
      description: 'Track expiring plans, pending dues, and renewal opportunities so the front desk does not depend on memory or handwritten notes.',
      tag: '7-Day Warning • WhatsApp Direct',
      icon: 'notification_important',
      screenId: 'memberships',
      featureAction: 'renewals',
      indiaContext: 'Automatic WhatsApp 7-day and 3-day countdown alerts with 1-click UPI autopay payment links.'
    },
    {
      num: '08',
      title: 'Announcements and Notifications',
      description: 'Send gym updates, class changes, renewal reminders, birthday messages, and important alerts to members and trainers.',
      tag: 'WhatsApp Broadcasts • In-App',
      icon: 'campaign',
      screenId: 'announcements',
      featureAction: 'announcements',
      indiaContext: 'Instant festival timing announcements (Holi, Diwali, Independence Day), hardware maintenance notices, and cafe specials.'
    },
    {
      num: '09',
      title: 'Reports and Analytics',
      description: 'Review active members, collections, revenue, attendance trends, expenses, trainer activity, renewals, and branch performance.',
      tag: 'P&L • Churn Cohorts • GSTR-1',
      icon: 'insights',
      screenId: 'reports',
      showcaseId: 'reports' as ShowcaseModuleId,
      indiaContext: 'Monthly profit & loss statement, GSTR-1 B2B/B2C sales summary, cohort retention, and peak hour footfall analytics.'
    },
    {
      num: '10',
      title: 'Expense Tracking',
      description: 'Log rent, salaries, equipment, utilities, and other expenses to understand actual gym profitability.',
      tag: 'Rent • Payroll • Electricity',
      icon: 'account_balance_wallet',
      screenId: 'expenses',
      showcaseId: 'expenses' as ShowcaseModuleId,
      indiaContext: 'Track facility lease rent, electricity power bills, trainer commissions, and supplement store inventory purchases.'
    },
    {
      num: '11',
      title: 'Complaints Management',
      description: 'Members can raise complaints from the app. Staff can resolve them with status tracking, so issues do not disappear in chat threads.',
      tag: 'AC • Machines • Water • Lockers',
      icon: 'report_problem',
      screenId: 'complaints',
      featureAction: 'complaints',
      indiaContext: 'Real-time service tickets for AC cooling, RO water filter replacement, machine maintenance, and locker issues with Open/In Progress/Resolved states.'
    },
    {
      num: '12',
      title: 'Multi-Branch Management',
      description: 'Manage multiple locations, compare branch-wise revenue and attendance, and keep owners aligned without daily manual reporting.',
      tag: 'Indore • Mumbai • Delhi • Bengaluru',
      icon: 'hub',
      screenId: 'tenant-rbac',
      featureAction: 'branches',
      indiaContext: 'Multi-club operations across Indore Flagship, Mumbai Bandra, Delhi Connaught Place, and Bengaluru Indiranagar with consolidated revenue radar.'
    }
  ];

  const handleCoreModuleClick = (m: typeof CORE_MODULES_LIST[0]) => {
    setInspectedModule(m);
  };

  // Analytics mock data for showcase
  const financialData = [
    { month: 'Feb 2026', revenue: 750, expenses: 6200, profit: -5450 },
    { month: 'Mar 2026', revenue: 1100, expenses: 6100, profit: -5000 },
    { month: 'Apr 2026', revenue: 1750, expenses: 6350, profit: -4600 },
    { month: 'May 2026', revenue: 2300, expenses: 6050, profit: -3750 },
    { month: 'Jun 2026', revenue: 1550, expenses: 6300, profit: -4750 },
    { month: 'Jul 2026', revenue: 4378, expenses: 6494, profit: -2116 },
  ];

  const planData = [
    { name: 'Starter Monthly', value: 18, color: '#f97316' },
    { name: 'Student Monthly', value: 34, color: '#3b82f6' },
    { name: 'Standard Quarterly', value: 16, color: '#06b6d4' },
    { name: 'Premium Half-Year', value: 20, color: '#10b981' },
    { name: 'Annual Unlimited', value: 12, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Header Bar: Gymify Navbar matching Image Inspiration */}
      <header className={`sticky top-0 z-50 border-b px-4 sm:px-8 py-3.5 transition-colors backdrop-blur-md ${
        theme === 'dark'
          ? 'bg-[#0d0d0d]/95 border-white/10 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#e50914] text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">fitness_center</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-lg font-headline font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Gymify
              </span>
              <span className="bg-[#e50914] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links matching Image Inspiration */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => scrollToSection('features')}
              className="text-[#ff7b72] hover:text-[#e50914] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className={`transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('why-gymify')}
              className={`transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Why Gymify
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className={`transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('india')}
              className={`transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              India
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className={`transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className={`transition-colors cursor-pointer ${
                theme === 'dark' ? 'text-neutral-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FAQ
            </button>
          </nav>

          {/* Right Action Cluster matching Image Inspiration */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button (Light/Dark Mode) */}
            <button
              onClick={() => {
                toggleTheme();
                showToast(
                  'Theme Mode Switched',
                  `Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`,
                  'info'
                );
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer group border ${
                theme === 'dark'
                  ? 'bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              <span className={`material-symbols-outlined text-[17px] group-hover:rotate-45 transition-transform ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-500'
              }`}>
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="hidden sm:inline font-medium">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Currency Selector Pill */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer border ${
                  theme === 'dark'
                    ? 'bg-[#1c1c1e] hover:bg-[#2c2c2e] text-white border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
                title="Select country & currency"
              >
                <span>{currencyDetails[selectedCurrency].flag}</span>
                <span className="font-mono">{currencyDetails[selectedCurrency].label}</span>
                <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {isCurrencyDropdownOpen && (
                <div className={`absolute right-0 top-10 w-48 border rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  theme === 'dark' ? 'bg-[#1c1c1e] border-white/15' : 'bg-white border-slate-200 shadow-xl'
                }`}>
                  {(Object.keys(currencyDetails) as CurrencyCode[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setSelectedCurrency(code);
                        setIsCurrencyDropdownOpen(false);
                        showToast('Currency Updated', `Prices switched to ${currencyDetails[code].label}`, 'info');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selectedCurrency === code
                          ? 'bg-[#e50914] text-white font-bold'
                          : theme === 'dark'
                          ? 'text-neutral-300 hover:bg-[#2c2c2e] hover:text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{currencyDetails[code].flag}</span>
                        <span>{currencyDetails[code].label}</span>
                      </div>
                      <span className="font-mono">{currencyDetails[code].symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Apps Pill */}
            <button
              onClick={() => setIsDownloadAppsModalOpen(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                theme === 'dark'
                  ? 'bg-[#242426] hover:bg-[#323234] text-white border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <span>Download Apps</span>
            </button>

            {/* Sign In Pill */}
            <button
              onClick={() => setActiveScreen('login')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
                theme === 'dark'
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#e50914]">login</span>
              <span>Sign In</span>
            </button>

            {/* Book Free Demo Pill */}
            <button
              onClick={() => setIsBookDemoModalOpen(true)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>Book Free Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation pill strip */}
        <div className={`lg:hidden flex items-center gap-4 overflow-x-auto scrollbar-none pt-2.5 pb-1 border-t mt-2 text-xs font-medium ${
          theme === 'dark' ? 'border-white/10 text-neutral-300' : 'border-slate-200 text-slate-600'
        }`}>
          <button
            onClick={() => {
              toggleTheme();
              showToast('Theme Mode Switched', `Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`, 'info');
            }}
            className="flex items-center gap-1 text-amber-500 font-semibold whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={() => scrollToSection('features')} className="text-[#ff7b72] font-semibold whitespace-nowrap cursor-pointer">Features</button>
          <button onClick={() => scrollToSection('pricing')} className="whitespace-nowrap cursor-pointer hover:text-primary">Pricing</button>
          <button onClick={() => scrollToSection('why-gymify')} className="whitespace-nowrap cursor-pointer hover:text-primary">Why Gymify</button>
          <button onClick={() => scrollToSection('about')} className="whitespace-nowrap cursor-pointer hover:text-primary">About</button>
          <button onClick={() => scrollToSection('india')} className="whitespace-nowrap cursor-pointer hover:text-primary">India</button>
          <button onClick={() => scrollToSection('blog')} className="whitespace-nowrap cursor-pointer hover:text-primary">Blog</button>
          <button onClick={() => scrollToSection('faq')} className="whitespace-nowrap cursor-pointer hover:text-primary">FAQ</button>
          <button onClick={() => setIsDownloadAppsModalOpen(true)} className="font-semibold whitespace-nowrap cursor-pointer text-primary">Download Apps</button>
          <button onClick={() => setActiveScreen('login')} className="text-white font-bold bg-[#e50914] px-2.5 py-0.5 rounded-full whitespace-nowrap cursor-pointer">Sign In</button>
        </div>
      </header>

      {/* 2. Hero Section: Inspired by gymify.co.in/features */}
      <section id="hero" className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-[#0d0d0d] via-surface to-surface">
        {/* Animated Background Ambience */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[380px] bg-gradient-to-tr from-[#e50914]/20 via-amber-500/10 to-primary/10 rounded-full blur-3xl pointer-events-none animate-cinematic-pulse"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Top Pill Emblem */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e50914]/10 border border-[#e50914]/30 text-[#ff7b72] text-xs font-bold font-mono uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff7b72] animate-ping"></span>
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Comprehensive Gym Management Operating System</span>
          </div>

          {/* Headline matching gymify.co.in/features */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline font-extrabold text-white tracking-tight leading-[1.12]">
            Everything you need to run and scale your gym operations in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7b72] via-[#e50914] to-amber-400">
              one powerful system
            </span>
          </h1>

          {/* Subtitle matching gymify.co.in/features */}
          <p className="text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Connect owners, front desk teams, trainers, and members within a single seamless ecosystem.
            Say goodbye to fragmented spreadsheets, disconnected biometric software, and expensive monthly SaaS fees.
          </p>

          {/* 5 Floating Telemetry Badges with Smooth Animation */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1c] text-neutral-200 border border-white/10 shadow-xs hover:border-[#ff7b72]/40 transition-colors animate-float-slow">
              <span className="w-5 h-5 rounded-full bg-[#e50914]/20 text-[#ff7b72] flex items-center justify-center text-[11px] font-bold">⚡</span>
              <span>2.1s Quick Check-in</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1c] text-neutral-200 border border-white/10 shadow-xs hover:border-emerald-500/40 transition-colors animate-float-slow [animation-delay:400ms]">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">📈</span>
              <span>+32% Retention Nudges</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1c] text-neutral-200 border border-white/10 shadow-xs hover:border-blue-500/40 transition-colors animate-float-slow [animation-delay:800ms]">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">🧾</span>
              <span>100% GST &amp; SAC 999723</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1c] text-neutral-200 border border-white/10 shadow-xs hover:border-purple-500/40 transition-colors animate-float-slow [animation-delay:1200ms]">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px] font-bold">📱</span>
              <span>3 Connected Apps</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1a1a1c] text-neutral-200 border border-white/10 shadow-xs hover:border-amber-500/40 transition-colors animate-float-slow [animation-delay:1600ms]">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px] font-bold">₹</span>
              <span>0% Commission UPI QR</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => setIsBookDemoModalOpen(true)}
              className="flex items-center gap-2 bg-[#e50914] hover:bg-[#b80710] text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-red-600/35 hover:shadow-2xl hover:shadow-red-600/45 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Book Free Demo</span>
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </button>
            <button
              onClick={() => scrollToSection('connected-apps')}
              className="flex items-center gap-2 bg-[#202022] hover:bg-[#2c2c30] text-white px-6 py-3.5 rounded-2xl font-semibold text-sm border border-white/15 transition-all cursor-pointer"
            >
              <span>Explore 3 Connected Apps</span>
              <span className="material-symbols-outlined text-[18px]">layers</span>
            </button>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface px-6 py-3.5 rounded-2xl font-semibold text-sm border border-outline-variant/30 transition-all cursor-pointer"
            >
              <span>Launch Live App</span>
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2B. Three Connected Apps Showcase (Owner Dashboard • Trainer App • Member App) */}
      <section id="connected-apps" className="py-16 px-4 sm:px-8 bg-surface-container-low/60 border-y border-outline-variant/25">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Built for Daily Operations Box (Directly from User Image 4) */}
          <div className={`p-6 sm:p-10 rounded-3xl border transition-all ${
            theme === 'dark'
              ? 'bg-[#0f0f13] border-white/10 shadow-2xl'
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left description */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-[11px] font-mono font-bold tracking-widest uppercase text-[#e50914]">
                  BUILT FOR DAILY OPERATIONS
                </div>
                <h3 className={`text-2xl sm:text-3xl font-headline font-extrabold tracking-tight leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Replace registers, spreadsheets, and scattered WhatsApp updates.
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                }`}>
                  Gymify keeps every operational workflow connected. When a member joins, pays, checks in, receives a workout plan, renews, or raises a complaint, the right team can see it.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsBookDemoModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Book Free 1-on-1 Demo</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Right 2x2 Grid matching Image 4 */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* For Front Desk Teams */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-[#15151c] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}>
                  <h4 className={`text-sm font-headline font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    For Front Desk Teams
                  </h4>
                  <p className={`text-xs leading-relaxed ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Faster enrollments, cleaner payments, due tracking, plan renewals, attendance checks, and member profile access.
                  </p>
                </div>

                {/* For Owners */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-[#15151c] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}>
                  <h4 className={`text-sm font-headline font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    For Owners
                  </h4>
                  <p className={`text-xs leading-relaxed ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Revenue visibility, active members, branch performance, expenses, complaints, and daily operations in one dashboard.
                  </p>
                </div>

                {/* For Trainers */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-[#15151c] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}>
                  <h4 className={`text-sm font-headline font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    For Trainers
                  </h4>
                  <p className={`text-xs leading-relaxed ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Assigned member lists, schedules, workouts, diet plans, attendance, and follow-ups from the Trainer App.
                  </p>
                </div>

                {/* For Members */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  theme === 'dark'
                    ? 'bg-[#15151c] border-white/10 hover:border-white/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}>
                  <h4 className={`text-sm font-headline font-bold mb-1.5 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    For Members
                  </h4>
                  <p className={`text-xs leading-relaxed ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Plan details, attendance, renewals, trainer information, workouts, diet guidance, BMI, and announcements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Three Connected Apps Cards matching Image 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: OWNER */}
            <div className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between ${
              selectedAppRole === 'owner'
                ? 'border-[#e50914] shadow-lg shadow-red-600/10'
                : 'border-white/10 hover:border-white/20'
            } ${theme === 'dark' ? 'bg-[#101015]' : 'bg-white shadow-sm'}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#e50914]/40 text-[#e50914] bg-[#e50914]/10">
                    OWNER
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">Desktop &amp; Web</span>
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-headline font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Run the gym without spreadsheets
                  </h3>
                  <p className={`text-xs leading-relaxed mt-1.5 ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Full control of every member, trainer, plan, payment, class, expense, and branch.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs">
                  {[
                    'Members and trainers',
                    'Plans, payments, and invoices',
                    'Biometric and manual attendance',
                    'Classes and schedules',
                    'Workout and diet plan builder',
                    'Expenses and reports',
                    'Complaints and announcements',
                    'Multi-branch controls'
                  ].map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] shrink-0"></span>
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-700'}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => { setSelectedAppRole('owner'); }}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedAppRole === 'owner'
                      ? 'bg-[#e50914] text-white shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span>{selectedAppRole === 'owner' ? 'Viewing Active Role' : 'Select Owner View'}</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 2: TRAINER */}
            <div className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between ${
              selectedAppRole === 'trainer'
                ? 'border-[#e50914] shadow-lg shadow-red-600/10'
                : 'border-white/10 hover:border-white/20'
            } ${theme === 'dark' ? 'bg-[#101015]' : 'bg-white shadow-sm'}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#e50914] text-white">
                    TRAINER
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">iOS &amp; Android</span>
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-headline font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Dedicated Trainer App
                  </h3>
                  <p className={`text-xs leading-relaxed mt-1.5 ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Trainers manage clients, plans, sessions, attendance, and follow-ups on the go.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs">
                  {[
                    'Assigned members',
                    'Schedule and sessions',
                    'Trainer attendance',
                    'Workout assignment',
                    'Diet plan assignment',
                    'Member progress notes',
                    'Complaints handling',
                    'Notifications and profile'
                  ].map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] shrink-0"></span>
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-700'}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => { setSelectedAppRole('trainer'); }}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedAppRole === 'trainer'
                      ? 'bg-[#e50914] text-white shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span>{selectedAppRole === 'trainer' ? 'Viewing Active Role' : 'Select Trainer View'}</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Card 3: MEMBER */}
            <div className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between ${
              selectedAppRole === 'member'
                ? 'border-[#e50914] shadow-lg shadow-red-600/10'
                : 'border-white/10 hover:border-white/20'
            } ${theme === 'dark' ? 'bg-[#101015]' : 'bg-white shadow-sm'}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#e50914]/40 text-[#e50914] bg-[#e50914]/10">
                    MEMBER
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">iOS &amp; Android</span>
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-headline font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Member App with self-service
                  </h3>
                  <p className={`text-xs leading-relaxed mt-1.5 ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    Members view plans, workouts, diet charts, attendance, trainers, and announcements.
                  </p>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs">
                  {[
                    'My plan and renewals',
                    'Attendance and classes',
                    'Workout plan',
                    'Diet plan',
                    'Assigned trainer',
                    'BMI calculator',
                    'Gym partner',
                    'Announcements and notifications'
                  ].map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] shrink-0"></span>
                      <span className={theme === 'dark' ? 'text-neutral-300' : 'text-slate-700'}>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => { setSelectedAppRole('member'); }}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    selectedAppRole === 'member'
                      ? 'bg-[#e50914] text-white shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span>{selectedAppRole === 'member' ? 'Viewing Active Role' : 'Select Member View'}</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3 pt-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold font-mono uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>LIVE ROLE SIMULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight">
              Test Drive Each Role in <span className="text-[#ff7b72]">Real-Time</span>
            </h2>
          </div>

          {/* App Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-surface-container rounded-2xl border border-outline-variant/30 max-w-xl mx-auto">
            <button
              onClick={() => setSelectedAppRole('owner')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedAppRole === 'owner'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-600/25'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span>Owner Dashboard</span>
            </button>

            <button
              onClick={() => setSelectedAppRole('trainer')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedAppRole === 'trainer'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-600/25'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">fitness_center</span>
              <span>Trainer App</span>
            </button>

            <button
              onClick={() => setSelectedAppRole('member')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedAppRole === 'member'
                  ? 'bg-[#e50914] text-white shadow-md shadow-red-600/25'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
              <span>Member App</span>
            </button>
          </div>

          {/* Interactive Role Showcase Container */}
          <div className="bg-surface rounded-3xl border border-outline-variant/35 p-6 sm:p-8 shadow-xl overflow-hidden">
            {selectedAppRole === 'owner' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e50914]/10 text-[#ff7b72] text-xs font-mono font-bold">
                    <span>👑 COMMAND CENTER FOR GYM DIRECTORS</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
                    Real-Time Oversight Over Revenue, Staff &amp; Attendance
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    The Owner Dashboard acts as your central cockpit. Monitor live headcount inside facilities, track GST tax invoices, approve new plans, automate overdue collections, and switch between branches with zero lag.
                  </p>

                  <div className="space-y-2.5 text-xs text-on-surface">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Live Occupancy Radar</strong> with hardware turnstile &amp; gate controls</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>GST Compliant Invoicing</strong> (SAC 999723) with 1-click GSTR-1 CSV exports</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Automated WhatsApp CRM</strong> for 7-day, expiry, and overdue follow-ups</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Multi-Branch Aggregation</strong> for multi-club owners &amp; franchises</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveScreen('dashboard')}
                      className="px-5 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-[#b80710] shadow-md shadow-red-600/25 transition-all cursor-pointer"
                    >
                      Open Live Owner Dashboard
                    </button>
                    <button
                      onClick={() => scrollToSection('showcase')}
                      className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high border border-outline-variant/30 transition-all cursor-pointer"
                    >
                      Inspect Interactive Preview
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-on-surface">Gymify Director Cockpit</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">All 3 Branches Online</span>
                  </div>

                  {/* Micro KPI Grid */}
                  <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                    <div className="bg-surface p-3 rounded-xl border border-outline-variant/25">
                      <span className="text-[10px] text-on-surface-variant block">Today's Headcount</span>
                      <span className="text-lg font-mono font-bold text-on-surface">{liveOccupancyCount} Inside</span>
                    </div>
                    <div className="bg-surface p-3 rounded-xl border border-outline-variant/25">
                      <span className="text-[10px] text-on-surface-variant block">Monthly Revenue</span>
                      <span className="text-lg font-mono font-bold text-emerald-500">₹3,48,900</span>
                    </div>
                    <div className="bg-surface p-3 rounded-xl border border-outline-variant/25">
                      <span className="text-[10px] text-on-surface-variant block">Expiring in 7 Days</span>
                      <span className="text-lg font-mono font-bold text-amber-500">14 Members</span>
                    </div>
                  </div>

                  {/* Live Stream item */}
                  <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                      <span>LATEST FRONT-DESK CHECK-IN</span>
                      <span className="text-emerald-500 font-bold">0.1s turnstile relay</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={lastScannedMember?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                          alt="Member"
                          className="w-8 h-8 rounded-full object-cover border border-outline-variant/40"
                        />
                        <div>
                          <div className="text-xs font-bold text-on-surface">{lastScannedMember?.name || 'Rahul Verma'}</div>
                          <div className="text-[10px] text-on-surface-variant">{lastScannedMember?.id || 'GC-1082'} • {lastScannedMember?.plan || 'Annual VIP'}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                        ACCESS GRANTED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedAppRole === 'trainer' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono font-bold">
                    <span>💪 DEDICATED APP FOR PERSONAL TRAINERS &amp; COACHES</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
                    Empower Trainers with Client Rosters, Workouts &amp; Diet Plans
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    No more scribbled gym notebooks or messy WhatsApp chats. Trainers get their own dedicated mobile interface to log PT sessions, assign custom training splits, calculate commissions, and track client weight progress.
                  </p>

                  <div className="space-y-2.5 text-xs text-on-surface">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Assigned Client Roster</strong> with PT session balances &amp; renewal alerts</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Workout Split Builder</strong> (Hypertrophy, Strength, HIIT, Mobility)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Macro &amp; Calorie Diet Charts</strong> deliverable directly in member's app</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Commission Ledger</strong> with transparent session payout tracking</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveScreen('staff-hr')}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                    >
                      Open Trainer Profiles &amp; Rosters
                    </button>
                    <button
                      onClick={() => setIsDownloadAppsModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high border border-outline-variant/30 transition-all cursor-pointer"
                    >
                      Get Trainer App for iOS &amp; Android
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-inner space-y-4">
                  <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-400 text-[18px]">sports</span>
                      <span className="text-xs font-bold text-on-surface">Coach Alex Morgan • PT Portal</span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold">6 Sessions Today</span>
                  </div>

                  {/* Trainer Client Cards */}
                  <div className="space-y-2 text-xs">
                    {[
                      { name: 'Sameer Joshi', goal: 'Strength & Hypertrophy', time: 'Today 10:00 AM', balance: '8 / 12 Sessions Left' },
                      { name: 'Kavita Menon', goal: 'Weight Loss & Conditioning', time: 'Today 2:30 PM', balance: '4 / 10 Sessions Left' },
                      { name: 'David Miller', goal: 'Powerlifting Prep', time: 'Today 5:00 PM', balance: '11 / 20 Sessions Left' },
                    ].map((c, i) => (
                      <div key={i} className="bg-surface p-3 rounded-xl border border-outline-variant/25 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-on-surface">{c.name}</div>
                          <div className="text-[11px] text-on-surface-variant">{c.goal} • {c.time}</div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                          {c.balance}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Workout template quick-badge */}
                  <div className="bg-surface p-3 rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#ff7b72] text-[18px]">assignment</span>
                      <span>Assigned Workout: <strong>4-Day Push/Pull/Legs Split</strong></span>
                    </div>
                    <span className="text-emerald-500 font-bold text-[11px]">Synced with Member App</span>
                  </div>
                </div>
              </div>
            )}

            {selectedAppRole === 'member' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                    <span>📱 SELF-SERVICE MOBILE APP FOR GYM MEMBERS</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
                    Digital QR Entry, Class Bookings &amp; 1-Tap UPI Renewals
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Give your members an elite mobile experience. They can scan into the gym with their dynamic smartphone QR pass, view class schedules, reserve cycling or HIIT spots, review assigned diets, and pay membership renewals instantly with PhonePe/GPay.
                  </p>

                  <div className="space-y-2.5 text-xs text-on-surface">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Dynamic Contactless QR Pass</strong> for frictionless turnstile access</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Class &amp; Studio Bookings</strong> with live seat reservation counters</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>1-Tap UPI &amp; Card Renewals</strong> with instant GST tax receipts</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[12px] font-bold">✓</span>
                      <span><strong>Body Metrics &amp; Workout Progress</strong> synced live with personal coach</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setIsDownloadAppsModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      Download Member Mobile App
                    </button>
                    <button
                      onClick={() => setActiveScreen('members')}
                      className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high border border-outline-variant/30 transition-all cursor-pointer"
                    >
                      Inspect Member Directory
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 shadow-inner flex justify-center">
                  {/* Smartphone Frame Simulation */}
                  <div className="w-full max-w-xs bg-[#121214] rounded-[36px] p-4 border-4 border-[#2c2c30] shadow-2xl space-y-4">
                    {/* Phone speaker & camera notch */}
                    <div className="flex justify-center mb-1">
                      <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-neutral-800"></div>
                        <div className="w-2.5 h-1.5 rounded-full bg-neutral-800"></div>
                      </div>
                    </div>

                    {/* Member Pass Card */}
                    <div className="bg-gradient-to-br from-[#1e1e24] to-[#141418] p-4 rounded-2xl border border-white/10 text-white space-y-3 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#e50914]/20 rounded-full blur-xl pointer-events-none"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-[#e50914] text-white flex items-center justify-center font-bold text-[12px]">G</div>
                          <span className="text-xs font-bold">Gymify Access</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Active Member</span>
                      </div>

                      <div className="text-center py-2 space-y-1">
                        <div className="inline-block p-2 bg-white rounded-xl shadow-md">
                          <span className="material-symbols-outlined text-black text-[56px] block leading-none">qr_code_2</span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">Scan at turnstile gate</div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                        <div>
                          <div className="font-bold text-white text-xs">Priya Sharma</div>
                          <div className="text-[10px] text-neutral-400">ID: GC-4028 • Annual Elite</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400">Valid Until</div>
                          <div className="font-mono text-xs font-bold text-emerald-400">31 Dec 2026</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons in App */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => showToast('Class Schedule', 'Browsing today\'s 4 group fitness classes', 'info')}
                        className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-center space-y-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-primary text-[18px] block mx-auto">calendar_month</span>
                        <span className="font-semibold block text-[11px] text-on-surface">Book Class</span>
                      </button>
                      <button
                        onClick={() => showToast('UPI Renewal', 'Dynamic UPI QR generated for instant renewal', 'success')}
                        className="p-2.5 rounded-xl bg-[#e50914]/15 hover:bg-[#e50914]/25 border border-[#e50914]/30 text-center space-y-1 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[#ff7b72] text-[18px] block mx-auto">payment</span>
                        <span className="font-semibold block text-[11px] text-[#ff7b72]">Renew Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Product Showcase Window (The Browser Frame from Screenshots) */}
      <section id="showcase" className="py-12 px-3 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE INTERACTIVE SHOWCASE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            Experience Every Module in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto">
            Click any tab below to inspect the live interface, test buttons, review financials, and see how your gym operates seamlessly.
          </p>
        </div>

        {/* Module Tab Selector */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-x-auto scrollbar-none mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
            { id: 'members', label: 'Members', icon: 'group' },
            { id: 'attendance', label: 'Attendance', icon: 'event_available' },
            { id: 'payments', label: 'Payments', icon: 'payments' },
            { id: 'trainers', label: 'Trainers', icon: 'fitness_center' },
            { id: 'classes', label: 'Classes', icon: 'calendar_month' },
            { id: 'expenses', label: 'Expenses', icon: 'receipt_long' },
            { id: 'analytics', label: 'Analytics', icon: 'insights' },
            { id: 'reports', label: 'Reports', icon: 'description' },
          ].map((tab) => {
            const isActive = activeShowcaseModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveShowcaseModule(tab.id as ShowcaseModuleId)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Browser Mockup Container */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/40 shadow-2xl overflow-hidden transition-all">
          {/* macOS Browser Chrome Bar */}
          <div className="bg-surface-container px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between gap-4">
            {/* Window control traffic dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
            </div>

            {/* Address bar pill: gymflow-pro • runs locally in your browser */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs font-mono text-on-surface-variant max-w-sm w-full justify-center shadow-inner">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span className="text-on-surface font-medium">gymflow-pro</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="text-on-surface-variant">runs locally in your browser</span>
            </div>

            {/* Theme & action icon */}
            <div className="flex items-center gap-2 text-on-surface-variant text-xs">
              <span className="hidden sm:inline font-mono">Ironline Club</span>
            </div>
          </div>

          {/* Browser Inner Header */}
          <div className="bg-surface-container-low/60 px-4 sm:px-6 py-3 border-b border-outline-variant/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">fitness_center</span>
              </div>
              <div>
                <span className="font-bold text-on-surface">Ironline Strength Club</span>
                <span className="text-[10px] text-on-surface-variant block">Gym Management</span>
              </div>
            </div>

            <div className="flex-1 max-w-xs hidden md:block">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                <input
                  type="text"
                  readOnly
                  placeholder="Search members, trainers, payments, classes..."
                  className="w-full bg-surface-container pl-8 pr-3 py-1.5 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-on-surface-variant font-mono text-[11px]">
              <span>Ironline Strength Club</span>
              <span className="font-bold text-on-surface">07/13/2026</span>
              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px]">fitness_center</span>
              </div>
            </div>
          </div>

          {/* Live Inner Screen Content based on activeShowcaseModule */}
          <div className="p-4 sm:p-6 bg-surface min-h-[460px]">
            {/* MODULE 1: DASHBOARD */}
            {activeShowcaseModule === 'dashboard' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Dashboard</h3>
                    <p className="text-xs text-on-surface-variant">Welcome back — here's how Ironline Strength Club is doing today.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveScreen('attendance')}
                      className="px-3 py-1.5 bg-surface-container text-on-surface border border-outline-variant/30 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>Check-in</span>
                    </button>
                    <button
                      onClick={() => setActiveScreen('members')}
                      className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>+ New Member</span>
                    </button>
                  </div>
                </div>

                {/* 8 KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Total Members</span>
                      <span className="material-symbols-outlined text-primary text-[17px]">group</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-on-surface mt-2">44</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">26 active</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Active Members</span>
                      <span className="material-symbols-outlined text-emerald-500 text-[17px]">person_check</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-on-surface mt-2">26</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">currently in good standing</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Expiring Soon</span>
                      <span className="material-symbols-outlined text-amber-500 text-[17px]">schedule</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-on-surface mt-2">6</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">within 7 days</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Expired</span>
                      <span className="material-symbols-outlined text-red-500 text-[17px]">warning</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-red-500 mt-2">7</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">need renewal</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Today's Check-ins</span>
                      <span className="material-symbols-outlined text-blue-500 text-[17px]">event</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-on-surface mt-2">0</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">as of 12:37 AM</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Monthly Revenue</span>
                      <span className="material-symbols-outlined text-emerald-500 text-[17px]">attach_money</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-on-surface mt-2">$456.00</div>
                    <div className="text-[10px] text-red-500 font-mono mt-0.5">▼ 19% vs last month</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Monthly Expenses</span>
                      <span className="material-symbols-outlined text-amber-500 text-[17px]">receipt_long</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-on-surface mt-2">$6,494.00</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Jul 2026</div>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Monthly Profit</span>
                      <span className="material-symbols-outlined text-red-500 text-[17px]">trending_down</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-red-500 mt-2">-$6,038.00</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">revenue - expenses</div>
                  </div>
                </div>

                {/* Alerts Box */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2 text-xs">
                  <div className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">notifications_active</span>
                    <span>Alerts &amp; reminders</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between">
                    <span>6 memberships are expiring within 7 days.</span>
                    <button onClick={() => setActiveScreen('members')} className="font-bold underline text-[11px]">
                      Review &amp; renew
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 flex items-center justify-between">
                    <span>7 memberships have expired.</span>
                    <button onClick={() => setActiveScreen('members')} className="font-bold underline text-[11px]">
                      See list
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 2: MEMBERS */}
            {activeShowcaseModule === 'members' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Members</h3>
                    <p className="text-xs text-on-surface-variant">44 members in your database.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveScreen('members')} className="px-3 py-1.5 bg-surface-container text-on-surface border border-outline-variant/30 rounded-xl text-xs font-semibold">
                      Export CSV
                    </button>
                    <button onClick={() => setActiveScreen('members')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold">
                      + Add Member
                    </button>
                  </div>
                </div>

                {/* Member Table */}
                <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase">
                        <th className="py-2.5 px-3">Member</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Expiry</th>
                        <th className="py-2.5 px-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                      {[
                        { name: 'Aiden Nguyen', code: 'M-0001', plan: 'Student Monthly', status: 'Expiring Soon', statusColor: 'amber', expiry: '07/18/2026 (5 days)', joined: '08/26/2025' },
                        { name: 'Amara Reyes', code: 'M-0016', plan: 'Annual Unlimited', status: 'Frozen', statusColor: 'blue', expiry: '10/18/2026 (97 days)', joined: '04/26/2025' },
                        { name: 'Aria Okafor', code: 'M-0042', plan: 'Annual Unlimited', status: 'Active', statusColor: 'green', expiry: '09/26/2026 (75 days)', joined: '01/11/2025' },
                        { name: 'Ava Walsh', code: 'M-0010', plan: 'Starter Monthly', status: 'Expired', statusColor: 'red', expiry: '05/25/2026 (49d ago)', joined: '08/05/2025' },
                        { name: 'Blake Nguyen', code: 'M-0041', plan: 'Student Monthly', status: 'Active', statusColor: 'green', expiry: '02/20/2027 (222 days)', joined: '06/11/2026' },
                      ].map((m) => (
                        <tr key={m.code} className="hover:bg-surface-container/50">
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                              {m.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold">{m.name}</div>
                              <div className="text-[10px] font-mono text-on-surface-variant">{m.code}</div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-on-surface-variant">{m.plan}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              m.statusColor === 'green' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                              m.statusColor === 'amber' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                              m.statusColor === 'blue' ? 'bg-blue-500/15 text-blue-500' : 'bg-red-500/15 text-red-500'
                            }`}>
                              • {m.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{m.expiry}</td>
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{m.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODULE 3: ATTENDANCE (FRONT-DESK QUICK CHECK-IN) */}
            {activeShowcaseModule === 'attendance' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Attendance</h3>
                    <p className="text-xs text-on-surface-variant">Check members in and review visit history.</p>
                  </div>
                  <button onClick={() => setActiveScreen('attendance')} className="px-3 py-1.5 bg-surface-container text-on-surface border border-outline-variant/30 rounded-xl text-xs font-semibold">
                    Export CSV
                  </button>
                </div>

                {/* Quick Check-in Container */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-3">
                  <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                    <span>Front desk — quick check-in</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {[
                      { id: 'an', name: 'Aiden Nguyen', code: 'M-0001', status: 'Expiring Soon' },
                      { id: 'ar', name: 'Amara Reyes', code: 'M-0016', status: 'Frozen' },
                      { id: 'ao', name: 'Aria Okafor', code: 'M-0042', status: 'Active' },
                      { id: 'aw', name: 'Ava Walsh', code: 'M-0010', status: 'Expired' },
                      { id: 'bn', name: 'Blake Nguyen', code: 'M-0041', status: 'Active' },
                      { id: 'ca', name: 'Caleb Ahmed', code: 'M-0031', status: 'Active' },
                    ].map((member) => {
                      const isChecked = !!mockCheckins[member.id];
                      return (
                        <div
                          key={member.id}
                          className="bg-surface p-2.5 rounded-xl border border-outline-variant/20 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                              {member.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-on-surface truncate">{member.name}</div>
                              <div className="text-[10px] font-mono text-on-surface-variant">{member.code}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleMockCheckin(member.id, member.name)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                              isChecked
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary text-on-primary hover:opacity-90'
                            }`}
                          >
                            <span>✓</span>
                            <span>{isChecked ? 'Inside' : 'In'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-xl font-bold font-mono text-on-surface">
                      {Object.values(mockCheckins).filter(Boolean).length}
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Today</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-xl font-bold font-mono text-on-surface">67</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Last 7 days</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-xl font-bold font-mono text-on-surface">98</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Jul 2026</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-xl font-bold font-mono text-on-surface">5.3</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5">Avg / day (30d)</div>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 4: PAYMENTS */}
            {activeShowcaseModule === 'payments' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Payments</h3>
                    <p className="text-xs text-on-surface-variant">83 payments recorded.</p>
                  </div>
                  <button onClick={() => setActiveScreen('payments')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold">
                    + Record Payment
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-on-surface-variant">Total received (all time)</div>
                      <div className="text-xl font-bold font-mono text-on-surface mt-1">$9,742.00</div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">attach_money</span>
                  </div>
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-on-surface-variant">This month</div>
                      <div className="text-xl font-bold font-mono text-on-surface mt-1">$456.00</div>
                    </div>
                    <span className="material-symbols-outlined text-primary text-[20px]">trending_up</span>
                  </div>
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-on-surface-variant">Outstanding (5)</div>
                      <div className="text-xl font-bold font-mono text-amber-500 mt-1">$277.00</div>
                    </div>
                    <span className="material-symbols-outlined text-amber-500 text-[20px]">schedule</span>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase">
                        <th className="py-2.5 px-3">Receipt</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Member</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                      {[
                        { ref: 'PAY-0053', date: '04/27/2027', name: 'Caleb Ahmed', amount: '$29.00', method: 'Bank Transfer' },
                        { ref: 'PAY-0068', date: '02/21/2027', name: 'Rohan Flores', amount: '$29.00', method: 'Bank Transfer' },
                        { ref: 'PAY-0064', date: '02/02/2027', name: 'Owen Vargas', amount: '$99.00', method: 'Bank Transfer' },
                        { ref: 'PAY-0059', date: '01/15/2027', name: 'Freya Santos', amount: '$99.00', method: 'Cash' },
                        { ref: 'PAY-0030', date: '12/05/2026', name: 'Chloe Larsen', amount: '$29.00', method: 'Card' },
                      ].map((p) => (
                        <tr key={p.ref} className="hover:bg-surface-container/50">
                          <td className="py-2.5 px-3 font-mono font-medium text-on-surface-variant text-[11px]">{p.ref}</td>
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{p.date}</td>
                          <td className="py-2.5 px-3 font-semibold">{p.name}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{p.amount}</td>
                          <td className="py-2.5 px-3 text-on-surface-variant">{p.method}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-emerald-500 font-semibold text-[11px] flex items-center gap-1">
                              <span>•</span> Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODULE 5: TRAINERS */}
            {activeShowcaseModule === 'trainers' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Trainers</h3>
                    <p className="text-xs text-on-surface-variant">5 trainers on your team.</p>
                  </div>
                  <button onClick={() => setActiveScreen('staff-hr')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold">
                    + Add Trainer
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {[
                    { initials: 'DW', name: 'Darnell Woods', spec: 'Boxing & HIIT', code: 'T-03', status: 'Active', members: 3, classes: 3 },
                    { initials: 'ER', name: 'Elena Rossi', spec: 'Yoga & Mobility', code: 'T-02', status: 'Active', members: 7, classes: 3 },
                    { initials: 'MB', name: 'Marcus Bell', spec: 'Strength & Conditioning', code: 'T-01', status: 'Active', members: 6, classes: 2 },
                    { initials: 'PN', name: 'Priya Nair', spec: 'Personal Training', code: 'T-04', status: 'Active', members: 5, classes: 0 },
                    { initials: 'SM', name: 'Sofia Marin', spec: 'Spin & Cardio', code: 'T-05', status: 'On Leave', members: 2, classes: 2 },
                  ].map((tr) => (
                    <div key={tr.code} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                            {tr.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface text-xs">{tr.name}</div>
                            <div className="text-[10px] text-on-surface-variant">{tr.spec} • {tr.code}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                          tr.status === 'Active' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          • {tr.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>{tr.members} members</span>
                        <span>{tr.classes} classes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 6: CLASSES */}
            {activeShowcaseModule === 'classes' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Classes</h3>
                    <p className="text-xs text-on-surface-variant">Schedule sessions and manage sign-ups.</p>
                  </div>
                  <button onClick={() => setActiveScreen('classes-pt')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold">
                    + Schedule Class
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {[
                    { title: 'Core & Abs', time: '07/13/2026 • 7:00 AM–7:30 AM', instructor: 'Darnell Woods • Main Floor', reg: 7, max: 20 },
                    { title: 'Power Lifting', time: '07/14/2026 • 4:00 PM–5:30 PM', instructor: 'Marcus Bell • Weight Room', reg: 5, max: 8 },
                    { title: 'Zumba Party', time: '07/16/2026 • 7:30 PM–8:30 PM', instructor: 'Sofia Marin • Studio B', reg: 12, max: 24 },
                    { title: 'Evening Stretch', time: '07/18/2026 • 8:00 PM–8:40 PM', instructor: 'Elena Rossi • Studio A', reg: 14, max: 18 },
                  ].map((cls) => {
                    const pct = Math.round((cls.reg / cls.max) * 100);
                    return (
                      <div key={cls.title} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-on-surface">{cls.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/15 text-blue-500">• Scheduled</span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant">{cls.time}</div>
                          <div className="text-[10px] text-on-surface-variant mt-0.5">{cls.instructor}</div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-mono text-on-surface-variant">
                            <span>{cls.reg} / {cls.max} registered</span>
                            <span className="text-primary font-bold">{cls.max - cls.reg} left</span>
                          </div>
                          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODULE 7: EXPENSES */}
            {activeShowcaseModule === 'expenses' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Expenses</h3>
                    <p className="text-xs text-on-surface-variant">23 expenses recorded.</p>
                  </div>
                  <button onClick={() => setActiveScreen('expenses')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold">
                    + Add Expense
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                    <div className="text-[11px] text-on-surface-variant">Expenses this month</div>
                    <div className="text-xl font-bold font-mono text-on-surface mt-1">$6,494.00</div>
                  </div>
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                    <div className="text-[11px] text-on-surface-variant">Revenue this month</div>
                    <div className="text-xl font-bold font-mono text-on-surface mt-1">$456.00</div>
                  </div>
                  <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
                    <div className="text-[11px] text-on-surface-variant">Profit this month</div>
                    <div className="text-xl font-bold font-mono text-red-500 mt-1">-$6,038.00</div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase">
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                      {[
                        { ref: 'EXP-0021', cat: 'Supplies', desc: 'New kettlebells set (16kg & 24kg)', amount: '$564.00', method: 'Mobile Payment' },
                        { ref: 'EXP-0023', cat: 'Supplies', desc: 'Protein bar restock', amount: '$210.00', method: 'Cash' },
                        { ref: 'EXP-0022', cat: 'Marketing', desc: 'Instagram promo boost', amount: '$120.00', method: 'Card' },
                        { ref: 'EXP-0019', cat: 'Salaries', desc: 'Trainer & front-desk payroll', amount: '$3,443.00', method: 'Bank Transfer' },
                        { ref: 'EXP-0020', cat: 'Utilities', desc: 'Electricity, water & internet', amount: '$307.00', method: 'Card' },
                      ].map((e) => (
                        <tr key={e.ref} className="hover:bg-surface-container/50">
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{e.ref}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-container text-on-surface">{e.cat}</span>
                          </td>
                          <td className="py-2.5 px-3 font-medium">{e.desc}</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{e.amount}</td>
                          <td className="py-2.5 px-3 text-on-surface-variant">{e.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODULE 8: ANALYTICS */}
            {activeShowcaseModule === 'analytics' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Analytics</h3>
                    <p className="text-xs text-on-surface-variant">Understand trends across revenue, members and attendance.</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/30">
                    Last 6 Months
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant">Revenue</div>
                    <div className="text-lg font-bold font-mono text-on-surface mt-1">$4,378.00</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant">Expenses</div>
                    <div className="text-lg font-bold font-mono text-on-surface mt-1">$34,324.00</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant">Profit</div>
                    <div className="text-lg font-bold font-mono text-red-500 mt-1">-$29,946.00</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant">New Members</div>
                    <div className="text-lg font-bold font-mono text-primary mt-1">10</div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                  <div className="text-xs font-bold text-on-surface mb-2">Revenue, Expenses &amp; Profit</div>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height={190}>
                      <LineChart data={financialData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" vertical={false} />
                        <XAxis dataKey="month" stroke="rgba(128, 128, 128, 0.6)" fontSize={10} tickLine={false} />
                        <YAxis stroke="rgba(128, 128, 128, 0.6)" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="profit" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 9: REPORTS */}
            {activeShowcaseModule === 'reports' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">Reports</h3>
                    <p className="text-xs text-on-surface-variant">Generate, print and export detailed reports.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveScreen('reports')} className="px-3 py-1.5 bg-surface-container text-on-surface border border-outline-variant/30 rounded-xl text-xs font-semibold">
                      Print
                    </button>
                    <button onClick={() => setActiveScreen('reports')} className="px-3 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase">
                        <th className="py-2.5 px-3">Member ID</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Plan</th>
                        <th className="py-2.5 px-3">Start</th>
                        <th className="py-2.5 px-3">Expiry</th>
                        <th className="py-2.5 px-3">Days Left</th>
                        <th className="py-2.5 px-3">Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface">
                      {[
                        { id: 'M-0026', name: 'Hana Bell', plan: 'Starter Monthly', start: '07/06/2026', exp: '08/06/2026', left: '24d', phone: '(555) 819-7086' },
                        { id: 'M-0025', name: 'Theo Delgado', plan: 'Starter Monthly', start: '07/10/2026', exp: '08/10/2026', left: '28d', phone: '(555) 376-9635' },
                        { id: 'M-0024', name: 'Layla Lindqvist', plan: 'Premium Half-Year', start: '02/14/2026', exp: '08/14/2026', left: '32d', phone: '(555) 885-2506' },
                        { id: 'M-0029', name: 'Samir Hansen', plan: 'Standard Quarterly', start: '06/07/2026', exp: '09/07/2026', left: '56d', phone: '(555) 331-9366' },
                      ].map((r) => (
                        <tr key={r.id} className="hover:bg-surface-container/50">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">{r.id}</td>
                          <td className="py-2.5 px-3 font-semibold">{r.name}</td>
                          <td className="py-2.5 px-3 text-on-surface-variant">{r.plan}</td>
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{r.start}</td>
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{r.exp}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-primary">{r.left}</td>
                          <td className="py-2.5 px-3 font-mono text-on-surface-variant text-[11px]">{r.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Browser Footer Callout to Launch App */}
          <div className="bg-surface-container px-4 py-3 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-on-surface-variant">
              Viewing preview of module <strong className="text-on-surface capitalize font-mono">{activeShowcaseModule}</strong>. All data is fully interactive and operational.
            </span>
            <button
              onClick={() => setActiveScreen(activeShowcaseModule === 'trainers' ? 'staff-hr' : activeShowcaseModule === 'classes' ? 'classes-pt' : activeShowcaseModule as any)}
              className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
            >
              <span>Open this module in full app</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Core Modules: Detailed Gymify Features (Directly from User Images 2 & 3) */}
      <section id="modules" className={`py-20 px-4 sm:px-8 border-y transition-colors ${
        theme === 'dark' ? 'bg-[#0a0a0d] border-white/10' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header matching Images 2 & 3 */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold tracking-widest uppercase text-[#e50914]">
              CORE MODULES
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              Detailed Gymify Features
            </h2>
            <p className={`text-sm sm:text-base max-w-3xl leading-relaxed ${
              theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
            }`}>
              Each module is built around daily gym operations: enrollment, collection, attendance, follow-up, training, retention, and owner reporting.
            </p>
          </div>

          {/* 12 Core Modules Grid (3 cols on lg, 2 on md, 1 on sm) matching Images 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CORE_MODULES_LIST.map((m) => (
              <div
                key={m.num}
                onClick={() => handleCoreModuleClick(m)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'bg-[#121217] border-white/10 hover:border-[#e50914]/50 hover:shadow-xl hover:shadow-red-600/10'
                    : 'bg-white border-slate-200 hover:border-[#e50914]/50 hover:shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-neutral-400 group-hover:text-[#e50914] transition-colors">
                      {m.num}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  </div>

                  <h3 className={`text-base sm:text-lg font-headline font-bold leading-snug group-hover:text-[#e50914] transition-colors ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {m.title}
                  </h3>

                  <p className={`text-xs leading-relaxed ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                  }`}>
                    {m.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-[11px] text-neutral-500 border-t border-outline-variant/15 mt-3">
                  <span className="font-mono truncate max-w-[180px]">{m.tag}</span>
                  <span className="text-[#e50914] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Explore Module</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Deep-Dive Feature Spotlights: Inspired directly by gymify.co.in/features */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/10 border border-[#e50914]/25 text-[#ff7b72] text-xs font-bold font-mono uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">featured_play_list</span>
            <span>CORE FEATURES OF GYMIFY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            Engineered for High-Velocity <span className="text-[#ff7b72]">Gym Operations</span>
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            Explore the specialized modules built to automate daily administrative friction so you and your coaches can focus on members.
          </p>
        </div>

        {/* Feature 01: Biometric & Contactless QR-Based Attendance with Live Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-mono font-bold">
              <span>FEATURE 01 • CONTACTLESS ACCESS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Biometric &amp; QR Attendance with <span className="text-emerald-500">Instant Turnstile Relay</span>
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Speed through morning and peak rush hours with under 0.2-second check-in times. Support for Android front-desk tablet cameras, USB barcode guns, RFID badges, fingerprint scanners, and smart tripod turnstiles.
            </p>

            <div className="space-y-2 text-xs text-on-surface pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                <span><strong>Hardware turnstile relay</strong> (Ethernet / IP / Relay board triggers)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                <span><strong>100% Offline verification</strong> even when broadband internet drops</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                <span><strong>Instant expiry lockout</strong> prevents unpaid members from gaining entry</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSimulateScan}
                disabled={isSimulatingScan}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[17px]">qr_code_scanner</span>
                <span>{isSimulatingScan ? 'Scanning QR code...' : 'Simulate Live Turnstile Scan'}</span>
              </button>
              <button
                onClick={() => setActiveScreen('attendance')}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                Open Attendance Screen
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4 relative overflow-hidden">
            {/* Live Camera Viewfinder Simulation */}
            <div className="relative bg-black rounded-2xl p-4 border border-white/10 overflow-hidden text-center">
              {/* Radar laser sweep when scanning */}
              {isSimulatingScan && (
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff7b72] to-transparent shadow-[0_0_12px_#ff7b72] animate-radar-scan z-20"></div>
              )}

              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <div className={`w-28 h-28 rounded-2xl border-2 ${isSimulatingScan ? 'border-[#ff7b72] scale-105' : 'border-emerald-500'} border-dashed flex items-center justify-center transition-all relative`}>
                  <span className="material-symbols-outlined text-white text-[48px]">qr_code_2</span>
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>
                </div>
                <div className="text-[11px] font-mono text-neutral-300">
                  {isSimulatingScan ? 'Target identified • Reading credentials...' : 'Align member QR code or tap RFID card'}
                </div>
              </div>

              {/* Headcount pill in camera frame */}
              <div className="flex items-center justify-between text-[11px] font-mono border-t border-white/10 pt-2.5 text-neutral-400">
                <span>GATE 01 • MAIN ENTRY</span>
                <span className="text-emerald-400 font-bold">LIVE OCCUPANCY: {liveOccupancyCount}</span>
              </div>
            </div>

            {/* Last verified member banner */}
            {lastScannedMember && (
              <div className="bg-surface p-3.5 rounded-2xl border border-outline-variant/30 flex items-center justify-between animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-3">
                  <img
                    src={lastScannedMember.avatar}
                    alt={lastScannedMember.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-on-surface">{lastScannedMember.name}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono">
                      {lastScannedMember.id} • {lastScannedMember.plan}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    ACCESS UNLOCKED
                  </span>
                  <div className="text-[10px] text-on-surface-variant font-mono mt-1">{lastScannedMember.time}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature 02: Billing, GST Invoices & Payment Automation with Live Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:flex-row-reverse">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono font-bold">
              <span>FEATURE 02 • TAX &amp; PAYMENTS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              GST Tax Invoicing &amp; <span className="text-blue-500">Zero-Fee UPI Collections</span>
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Generate 100% compliant Indian GST invoices complete with SAC Code 999723, automatic split calculation (CGST 9% + SGST 9% or IGST 18%), customer GSTIN records, and direct UPI QR codes with zero merchant processing fee.
            </p>

            <div className="space-y-2 text-xs text-on-surface pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                <span><strong>SAC Code 999723</strong> Fitness Centre Services pre-configured</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                <span><strong>Dynamic UPI QR</strong> on customer invoice with zero payment gateway cut</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                <span><strong>Monthly GSTR-1 CSV</strong> export ready for your Chartered Accountant</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsGstModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">receipt_long</span>
                <span>Preview GST Tax Invoice</span>
              </button>
              <button
                onClick={() => setActiveScreen('payments')}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                Open Payments Ledger
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">TAX INVOICE #GC-2026-0842</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">PAID VIA UPI</span>
            </div>

            {/* Simulated GST Line Items */}
            <div className="space-y-2 text-xs">
              <div className="bg-surface p-3 rounded-xl border border-outline-variant/20 flex justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Annual Strength Unlimited (12 Months)</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">SAC: 999723 • Member: Rahul Verma</div>
                </div>
                <div className="font-mono font-bold text-on-surface">₹14,999.00</div>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-outline-variant/20 flex justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Personal Training Starter Pack (10 Sessions)</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">SAC: 999723 • Coach: Alex Morgan</div>
                </div>
                <div className="font-mono font-bold text-on-surface">₹6,000.00</div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="bg-surface p-3.5 rounded-xl border border-outline-variant/20 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-on-surface-variant">
                <span>Taxable Amount</span>
                <span>₹20,999.00</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>CGST (9.0%)</span>
                <span>₹1,889.91</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>SGST (9.0%)</span>
                <span>₹1,889.91</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-on-surface pt-2 border-t border-outline-variant/20">
                <span>Total Invoice Value (incl. 18% GST)</span>
                <span className="text-emerald-500 text-sm">₹24,778.82</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 03: Automated WhatsApp CRM & Retention Sequences */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
              <span>FEATURE 03 • RETENTION ENGINE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Automated WhatsApp Alerts &amp; <span className="text-[#ff7b72]">Zero-Awkward Renewals</span>
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Eliminate uncomfortable front-desk conversations about payment dues. Pre-configured WhatsApp and SMS triggers automatically notify members 7 days before, on expiry day, and 3 days overdue with their personalized UPI renewal link.
            </p>

            <div className="space-y-2 text-xs text-on-surface pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff7b72] text-[18px]">check_circle</span>
                <span><strong>TRAI DLT compliant templates</strong> pre-registered for instant delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff7b72] text-[18px]">check_circle</span>
                <span><strong>Missed-visit re-engagement sequences</strong> for members inactive 14+ days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff7b72] text-[18px]">check_circle</span>
                <span><strong>Birthday &amp; anniversary rewards</strong> sent automatically on schedule</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">chat</span>
                <span>Test Live WhatsApp Template</span>
              </button>
              <button
                onClick={() => setActiveScreen('memberships')}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                View Expiry Radar
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-4">
            {/* WhatsApp Chat Bubble Simulation */}
            <div className="bg-[#0b141a] rounded-2xl p-4 border border-white/10 text-white space-y-3 font-sans">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center font-bold text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Gymify Automated Bot</span>
                    <span className="material-symbols-outlined text-[#25d366] text-[14px]">verified</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Official Business Account • DLT Verified</div>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="bg-[#005c4b] p-3.5 rounded-2xl rounded-tl-xs max-w-sm text-xs leading-relaxed space-y-2">
                <p>
                  👋 Hi <strong>Ananya</strong>! Your <strong>Student Monthly Pass</strong> at Ironline Strength Club expires in <strong>3 days</strong> (on 18 Oct 2026).
                </p>
                <p>
                  Renew now to retain your current fee and avoid turnstile access interruption.
                </p>
                <div className="bg-black/30 p-2.5 rounded-xl space-y-1 text-[11px] font-mono">
                  <div className="text-neutral-300">Renewal Amount: ₹1,499.00</div>
                  <div className="text-[#25d366] underline cursor-pointer">upi://pay?pa=ironline@upi&amp;am=1499</div>
                </div>
                <div className="text-right text-[10px] text-neutral-300 font-mono flex items-center justify-end gap-1">
                  <span>10:42 AM</span>
                  <span className="text-[#53bdeb]">✓✓</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono">
              <span>Automatic trigger: 72 hours prior to expiry</span>
              <span className="text-emerald-500 font-bold">100% Delivery Rate</span>
            </div>
          </div>
        </div>

        {/* Feature 04: Class Scheduling & Studio Bookings with Live Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:flex-row-reverse">
          <div className="lg:col-span-6 lg:order-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-mono font-bold">
              <span>FEATURE 04 • GROUP FITNESS &amp; STUDIOS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Class Capacity Tracking &amp; <span className="text-purple-400">Live Seat Bookings</span>
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Keep studio floors organized and prevent overcrowded rooms. Manage recurring schedules for CrossFit, Yoga, Spinning, Pilates, and Boxing with live capacity caps, instructor assignments, and automated waitlist bumps.
            </p>

            <div className="space-y-2 text-xs text-on-surface pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[18px]">check_circle</span>
                <span><strong>Real-time seat reservations</strong> directly inside the member companion app</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[18px]">check_circle</span>
                <span><strong>Automated waitlist management</strong> fills empty spots on cancellation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[18px]">check_circle</span>
                <span><strong>Trainer class attendance logs</strong> calculate class coach payouts automatically</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveScreen('classes-pt')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">calendar_month</span>
                <span>Manage Studio Class Schedules</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-1 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 text-xs">
              <span className="font-bold text-on-surface">TODAY'S GROUP CLASSES</span>
              <span className="text-[11px] font-mono text-primary font-bold">Interactive Seat Reservation</span>
            </div>

            {[
              { id: 'c-1', name: 'CrossFit MetCon & Strength', coach: 'Coach Marcus', time: '6:30 AM', color: 'border-l-primary' },
              { id: 'c-2', name: 'Vinyasa Power Yoga', coach: 'Elena Rossi', time: '8:00 AM', color: 'border-l-emerald-500' },
              { id: 'c-3', name: 'HIIT Boxing Conditioning', coach: 'Darnell Woods', time: '5:30 PM', color: 'border-l-amber-500' },
              { id: 'c-4', name: 'Spinning Sprint Arena', coach: 'Priya Nair', time: '7:00 PM', color: 'border-l-purple-500' },
            ].map((cls) => {
              const seat = classSeats[cls.id] || { booked: 15, capacity: 20 };
              const isFull = seat.booked >= seat.capacity;
              const pct = Math.min(100, (seat.booked / seat.capacity) * 100);

              return (
                <div key={cls.id} className={`bg-surface p-3.5 rounded-xl border border-outline-variant/20 border-l-4 ${cls.color} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-on-surface">{cls.name}</div>
                      <div className="text-[11px] text-on-surface-variant">{cls.coach} • {cls.time}</div>
                    </div>
                    <button
                      onClick={() => handleReserveClassSeat(cls.id, cls.name)}
                      disabled={isFull}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isFull
                          ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                          : 'bg-[#e50914] text-white hover:bg-[#b80710] shadow-xs'
                      }`}
                    >
                      {isFull ? 'Full (Waitlist)' : '+ Reserve Spot'}
                    </button>
                  </div>

                  {/* Seat Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                      <span>Booked Seats</span>
                      <span className={isFull ? 'text-red-500 font-bold' : 'text-on-surface'}>
                        {seat.booked} / {seat.capacity} {isFull ? '(FULL)' : ''}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature 05: Multi-Branch & Centralized Director Oversight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-mono font-bold">
              <span>FEATURE 05 • MULTI-CLUB SCALE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface tracking-tight">
              Multi-Branch Roaming &amp; <span className="text-amber-500">Centralized BI</span>
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Own multiple gym locations or fitness studios? Gymify provides a unified director cockpit with instantaneous branch-switching, centralized member roaming permissions, and side-by-side revenue comparisons.
            </p>

            <div className="space-y-2 text-xs text-on-surface pt-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">check_circle</span>
                <span><strong>Cross-branch turnstile access</strong> for VIP all-access members</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">check_circle</span>
                <span><strong>Consolidated P&amp;L reports</strong> with individual branch expense tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">check_circle</span>
                <span><strong>Role-based branch permissions</strong> for regional managers vs front-desk staff</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveScreen('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Test Multi-Branch Switcher</span>
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 text-xs">
              <span className="font-bold text-on-surface">BRANCH PERFORMANCE RADAR</span>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">● ALL 3 ONLINE</span>
            </div>

            {[
              { name: 'Downtown Main Flagship', members: '184 Active', rev: '₹1,84,000', occ: '42 inside', status: 'Optimal' },
              { name: 'Westside Cross-Training Box', members: '96 Active', rev: '₹98,500', occ: '24 inside', status: 'Optimal' },
              { name: 'Express Aerobics & Yoga Studio', members: '68 Active', rev: '₹66,400', occ: '12 inside', status: 'Optimal' },
            ].map((b, i) => (
              <div key={i} className="bg-surface p-3.5 rounded-xl border border-outline-variant/20 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-on-surface">{b.name}</div>
                  <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">{b.members} • {b.occ}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-500">{b.rev}</div>
                  <span className="text-[10px] font-mono text-neutral-400">Monthly Run-rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature 06: Competitive Matrix (Gymify vs Old SaaS vs Spreadsheets) */}
        <div className="pt-8">
          <div className="text-center space-y-3 mb-8">
            <span className="text-xs font-mono font-bold uppercase text-[#ff7b72] tracking-wider">UNCOMPROMISING ARCHITECTURE</span>
            <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              How Gymify Compares with Legacy Software
            </h3>
          </div>

          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container text-on-surface text-[11px] font-mono">
                  <th className="py-3.5 px-4 font-bold">Capability</th>
                  <th className="py-3.5 px-4 font-bold text-[#ff7b72] bg-[#e50914]/10">Gymify PRO</th>
                  <th className="py-3.5 px-4 font-bold text-on-surface-variant">Legacy Cloud SaaS</th>
                  <th className="py-3.5 px-4 font-bold text-on-surface-variant">Google Sheets / Excel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-on-surface">
                {[
                  { feature: 'Pricing Model', gc: 'Pay once, lifetime ownership', saas: '$150 - $300 / month recurring', sheet: 'Free (but manual & slow)' },
                  { feature: 'Turnstile & Biometric Gates', gc: 'Hardwired 0.1s instant relay', saas: 'Requires expensive third-party bridges', sheet: 'Not supported' },
                  { feature: 'Offline Reliability', gc: 'Runs 100% locally with zero internet', saas: 'Down when your broadband drops', sheet: 'Prone to sync conflicts' },
                  { feature: 'Indian GST & SAC 999723', gc: 'Built-in auto split & GSTR-1 CSV', saas: 'Western software without GST', sheet: 'Manual tax calculation' },
                  { feature: 'WhatsApp Automated Nudges', gc: 'Integrated official DLT alerts', saas: 'Extra add-on fee per message', sheet: 'Manual phone texting' },
                  { feature: '3 Role-Specific Native Apps', gc: 'Owner, Trainer & Member included', saas: 'Additional fee per active trainer', sheet: 'None' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/50">
                    <td className="py-3 px-4 font-semibold text-on-surface">{row.feature}</td>
                    <td className="py-3 px-4 font-bold text-[#ff7b72] bg-[#e50914]/5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                      <span>{row.gc}</span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.saas}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{row.sheet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5B. Why Gymify Section matching nav link */}
      <section id="why-gymify" className="py-20 px-4 sm:px-8 bg-surface-container-low/40 border-t border-outline-variant/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/10 border border-[#e50914]/25 text-[#ff7b72] text-xs font-bold font-mono uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>THE GYMIFY ADVANTAGE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
              Why 2,400+ Fitness Clubs <span className="text-[#ff7b72]">Choose Gymify</span>
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
              Built to replace bloated monthly SaaS platforms with ultra-fast, locally run, hardware-integrated gym management software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 space-y-3 shadow-xs hover:border-[#ff7b72]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">savings</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface">Zero SaaS Tax</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pay once and keep 100% of your gym earnings. No monthly subscriptions, no fee per active member, and no mandatory cloud fees.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 space-y-3 shadow-xs hover:border-[#ff7b72]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">door_front</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface">Turnstile &amp; Biometrics</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Hardwired USB/Ethernet turnstile control, RFID access cards, and barcode scanners verify credentials and open gates in &lt;0.1s.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 space-y-3 shadow-xs hover:border-[#ff7b72]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">mark_chat_unread</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface">WhatsApp Retention</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Automated WhatsApp and SMS reminders at 7 days, 3 days, and expiry date. Eliminates awkward front-desk payment collection talks.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 space-y-3 shadow-xs hover:border-[#ff7b72]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[26px]">cloud_sync</span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface">Google Sheets Sync</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Operates 100% offline without broadband dependency, and seamlessly pushes roster updates and revenue telemetry to your Google Spreadsheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section: Inspired directly by gymcare.co.in/pricing */}
      <section id="pricing" className={`py-24 px-4 sm:px-8 border-t transition-colors relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-[#0a0a0c] text-white border-white/10'
          : 'bg-slate-50 text-slate-900 border-slate-200'
      }`}>
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-gradient-to-r from-red-600/10 via-rose-600/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-red-500/30 bg-red-500/10 text-[#ff4d4f]">
              <span className="w-2 h-2 rounded-full bg-[#ff4d4f] animate-ping"></span>
              <span>TRANSPARENT PRICING • NO FEATURE LOCKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold tracking-tight">
              Simple, Member-Based Plans For Every Fitness Business
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
              Full access to the <strong>Owner Dashboard</strong>, <strong>Trainer App</strong>, and <strong>Member App</strong> with zero per-trainer charges. Switch currencies or save 20% on annual billing.
            </p>
          </div>

          {/* Controls: Billing Cycle Toggle & Quick Currency Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Monthly / Yearly Billing Cycle Toggle */}
            <div className={`inline-flex items-center p-1 rounded-full border shadow-xl ${
              theme === 'dark' ? 'bg-[#18181b] border-white/15' : 'bg-slate-200 border-slate-300'
            }`}>
              <button
                onClick={() => setPricingCycle('monthly')}
                className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  pricingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#f43f5e] text-white shadow-lg shadow-red-600/50'
                    : theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>

              <button
                onClick={() => setPricingCycle('yearly')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  pricingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-[#e50914] to-[#f43f5e] text-white shadow-lg shadow-red-600/50'
                    : theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Yearly</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  pricingCycle === 'yearly'
                    ? 'bg-white/20 text-white'
                    : 'text-[#f87171] bg-red-950/60 border border-red-500/30'
                }`}>
                  Save 20%
                </span>
              </button>
            </div>

            {/* Quick Currency Selector in Pricing Section */}
            <div className={`flex items-center gap-1 p-1 rounded-full border text-xs font-semibold ${
              theme === 'dark' ? 'bg-[#18181b] border-white/15' : 'bg-slate-200 border-slate-300'
            }`}>
              {(Object.keys(currencyDetails) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedCurrency(code);
                    showToast('Currency Switched', `Pricing displayed in ${currencyDetails[code].label}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    selectedCurrency === code
                      ? 'bg-[#e50914] text-white font-bold shadow-xs'
                      : theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={currencyDetails[code].label}
                >
                  <span className="mr-1">{currencyDetails[code].flag}</span>
                  <span>{code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {/* Card 1: Starter */}
            <div className={`rounded-2xl border p-7 flex flex-col justify-between transition-all group ${
              theme === 'dark'
                ? 'bg-[#121214]/90 backdrop-blur-md border-white/10 hover:border-white/25 shadow-xl text-white'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl text-slate-900'
            }`}>
              <div className="space-y-6">
                <div>
                  <span className="text-[#ff7b72] font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                    FOR SMALL GYMS
                  </span>
                  <h3 className="text-3xl font-headline font-bold tracking-tight">Starter</h3>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Ideal for boutique studios &amp; single-room fitness clubs.
                  </p>
                </div>

                <div>
                  <div className="text-[#ff4d4f] font-mono text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {pricingCycle === 'monthly'
                      ? PLAN_PRICING.starter[selectedCurrency].formattedMonthly
                      : PLAN_PRICING.starter[selectedCurrency].formattedYearly}
                  </div>
                  <div className={`font-mono text-[11px] font-bold tracking-wider mt-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    PER MONTH {pricingCycle === 'yearly' ? `• BILLED ANNUALLY (${PLAN_PRICING.starter[selectedCurrency].annualBillingTotal})` : ''}
                  </div>
                  {pricingCycle === 'yearly' && (
                    <div className="text-emerald-500 font-mono text-[11px] font-bold mt-0.5">
                      ✓ {PLAN_PRICING.starter[selectedCurrency].annualSavings}
                    </div>
                  )}
                </div>

                <div className={`space-y-3.5 text-xs pt-4 border-t ${
                  theme === 'dark' ? 'border-white/10 text-neutral-300' : 'border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span><strong>Up to 100 active members</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>1 Gym branch location included</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Owner Dashboard, Trainer App &amp; Member App</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Plans, payments &amp; GST tax invoices</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Biometric &amp; manual attendance check-in</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>100% offline POS mode with cloud sync</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span className={theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}>Applicable GST extra</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    setSelectedEnrollPlan('Starter');
                    setIsEnrollModalOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-xs active:scale-98 ${
                    theme === 'dark'
                      ? 'bg-[#242426] hover:bg-[#323236] text-white border border-white/10 hover:border-white/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 hover:border-slate-400'
                  }`}
                >
                  ENROLL NOW
                </button>
              </div>
            </div>

            {/* Card 2: Growth (RECOMMENDED / HIGHLIGHTED) */}
            <div className={`rounded-2xl border-2 border-[#e50914] p-7 flex flex-col justify-between shadow-2xl relative group transform xl:-translate-y-2 transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-[#1b1214] via-[#141215] to-[#100f12] text-white shadow-red-950/60'
                : 'bg-gradient-to-b from-red-50/60 via-white to-white text-slate-900 shadow-red-500/10'
            }`}>
              {/* Highlight ribbon */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e50914] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                ★ MOST POPULAR
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[#ff4d4f] font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                    RECOMMENDED FOR MOST GYMS
                  </span>
                  <h3 className="text-3xl font-headline font-bold tracking-tight">Growth</h3>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                    High-performing clubs scaling member retention &amp; revenue.
                  </p>
                </div>

                <div>
                  <div className="text-[#ff4d4f] font-mono text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {pricingCycle === 'monthly'
                      ? PLAN_PRICING.growth[selectedCurrency].formattedMonthly
                      : PLAN_PRICING.growth[selectedCurrency].formattedYearly}
                  </div>
                  <div className={`font-mono text-[11px] font-bold tracking-wider mt-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    PER MONTH {pricingCycle === 'yearly' ? `• BILLED ANNUALLY (${PLAN_PRICING.growth[selectedCurrency].annualBillingTotal})` : ''}
                  </div>
                  {pricingCycle === 'yearly' && (
                    <div className="text-emerald-500 font-mono text-[11px] font-bold mt-0.5">
                      ✓ {PLAN_PRICING.growth[selectedCurrency].annualSavings}
                    </div>
                  )}
                </div>

                <div className="space-y-3.5 text-xs pt-4 border-t border-red-500/20">
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span><strong>Up to 200 active members</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Everything in Starter included</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Expense tracking &amp; Net Profit reports</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Automated WhatsApp fee dues &amp; receipt triggers</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Trainer roster &amp; commission management</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>SAC 999723 GST input tax credit receipts</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span className={theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}>Applicable GST extra</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    setSelectedEnrollPlan('Growth');
                    setIsEnrollModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#e50914] to-[#f43f5e] hover:from-[#d00812] hover:to-[#e11d48] text-white font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-lg shadow-red-600/50 hover:shadow-red-600/70 active:scale-98"
                >
                  ENROLL NOW
                </button>
              </div>
            </div>

            {/* Card 3: Pro */}
            <div className={`rounded-2xl border p-7 flex flex-col justify-between transition-all group ${
              theme === 'dark'
                ? 'bg-[#121214]/90 backdrop-blur-md border-white/10 hover:border-white/25 shadow-xl text-white'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl text-slate-900'
            }`}>
              <div className="space-y-6">
                <div>
                  <span className="text-[#ff7b72] font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                    FOR ESTABLISHED GYMS
                  </span>
                  <h3 className="text-3xl font-headline font-bold tracking-tight">Pro</h3>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Comprehensive gym management with hardware &amp; class ticketing.
                  </p>
                </div>

                <div>
                  <div className="text-[#ff4d4f] font-mono text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {pricingCycle === 'monthly'
                      ? PLAN_PRICING.pro[selectedCurrency].formattedMonthly
                      : PLAN_PRICING.pro[selectedCurrency].formattedYearly}
                  </div>
                  <div className={`font-mono text-[11px] font-bold tracking-wider mt-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    PER MONTH {pricingCycle === 'yearly' ? `• BILLED ANNUALLY (${PLAN_PRICING.pro[selectedCurrency].annualBillingTotal})` : ''}
                  </div>
                  {pricingCycle === 'yearly' && (
                    <div className="text-emerald-500 font-mono text-[11px] font-bold mt-0.5">
                      ✓ {PLAN_PRICING.pro[selectedCurrency].annualSavings}
                    </div>
                  )}
                </div>

                <div className={`space-y-3.5 text-xs pt-4 border-t ${
                  theme === 'dark' ? 'border-white/10 text-neutral-300' : 'border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span><strong>Up to 400 active members</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Everything in Growth included</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Complaints &amp; maintenance ticketing</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Custom workout plans &amp; diet macro splits</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Turnstile &amp; face-recognition terminal sync</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Priority chat support (&lt; 15 min response)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span className={theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}>Applicable GST extra</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => {
                    setSelectedEnrollPlan('Pro');
                    setIsEnrollModalOpen(true);
                  }}
                  className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-xs active:scale-98 ${
                    theme === 'dark'
                      ? 'bg-[#242426] hover:bg-[#323236] text-white border border-white/10 hover:border-white/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 hover:border-slate-400'
                  }`}
                >
                  ENROLL NOW
                </button>
              </div>
            </div>

            {/* Card 4: Enterprise */}
            <div className={`rounded-2xl border p-7 flex flex-col justify-between transition-all group ${
              theme === 'dark'
                ? 'bg-[#121214]/90 backdrop-blur-md border-white/10 hover:border-white/25 shadow-xl text-white'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl text-slate-900'
            }`}>
              <div className="space-y-6">
                <div>
                  <span className="text-[#ff7b72] font-mono text-[11px] font-bold uppercase tracking-widest block mb-2">
                    FOR CHAINS &amp; FRANCHISES
                  </span>
                  <h3 className="text-3xl font-headline font-bold tracking-tight">Enterprise</h3>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                    For multi-branch gym chains, luxury fitness clubs &amp; franchises.
                  </p>
                </div>

                <div>
                  <div className="text-[#ff4d4f] font-mono text-4xl sm:text-5xl font-extrabold tracking-tight">
                    Custom
                  </div>
                  <div className={`font-mono text-[11px] font-bold tracking-wider mt-1.5 uppercase ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'
                  }`}>
                    CUSTOM VOLUME PRICING
                  </div>
                  <div className="text-primary font-mono text-[11px] font-bold mt-0.5">
                    Tailored SLA &amp; dedicated engineer
                  </div>
                </div>

                <div className={`space-y-3.5 text-xs pt-4 border-t ${
                  theme === 'dark' ? 'border-white/10 text-neutral-300' : 'border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span><strong>Custom active members (400+ to 50,000+)</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Multi-branch centralized command dashboard</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>White-label branding &amp; custom domain</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Cross-gym biometric roaming check-ins</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Dedicated SLA, phone support &amp; account manager</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5 shadow-[0_0_6px_#ff4d4f]"></span>
                    <span>Free white-glove data migration in &lt; 24 hours</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => setIsBookDemoModalOpen(true)}
                  className={`w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-xs active:scale-98 ${
                    theme === 'dark'
                      ? 'bg-[#242426] hover:bg-[#323236] text-white border border-white/10 hover:border-white/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 hover:border-slate-400'
                  }`}
                >
                  CONTACT SALES
                </button>
              </div>
            </div>
          </div>

          {/* Interactive ROI & Member Plan Calculator */}
          <div className={`rounded-3xl border p-6 sm:p-10 space-y-8 shadow-xl ${
            theme === 'dark'
              ? 'bg-[#121214] border-white/10'
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[#ff7b72] font-mono text-[11px] font-bold uppercase tracking-widest block mb-1">
                  INTERACTIVE ESTIMATOR
                </span>
                <h3 className="text-2xl font-headline font-bold tracking-tight">
                  Calculate Your Plan &amp; Monthly ROI
                </h3>
                <p className={`text-xs sm:text-sm mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Drag the slider to your active member count to find the ideal tier and software cost ratio.
                </p>
              </div>

              <div className="text-right">
                <div className="text-3xl font-mono font-extrabold text-[#ff4d4f]">
                  {pricingMembersSlider} <span className="text-sm font-sans font-medium text-neutral-400">Members</span>
                </div>
                <div className="text-xs font-semibold text-emerald-500">
                  Recommended: {
                    pricingMembersSlider <= 100 ? 'Starter Plan' :
                    pricingMembersSlider <= 200 ? 'Growth Plan' :
                    pricingMembersSlider <= 400 ? 'Pro Plan' : 'Enterprise Plan'
                  }
                </div>
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-2">
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={pricingMembersSlider}
                onChange={(e) => setPricingMembersSlider(Number(e.target.value))}
                className="w-full h-2.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
              />
              <div className={`flex justify-between text-[11px] font-mono ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                <span>50 Members (Starter)</span>
                <span>200 Members (Growth)</span>
                <span>400 Members (Pro)</span>
                <span>1,000+ Members (Enterprise)</span>
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20">
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`text-[11px] font-mono uppercase ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Est. Gym Monthly Revenue
                </div>
                <div className="text-2xl font-mono font-extrabold text-[#ff4d4f] mt-1">
                  {currencyDetails[selectedCurrency].symbol}
                  {(pricingMembersSlider * (selectedCurrency === 'INR' ? 1500 : selectedCurrency === 'USD' ? 45 : selectedCurrency === 'GBP' ? 35 : selectedCurrency === 'EUR' ? 40 : 165)).toLocaleString()}
                </div>
                <div className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Based on avg {currencyDetails[selectedCurrency].symbol}{selectedCurrency === 'INR' ? '1,500' : selectedCurrency === 'USD' ? '45' : selectedCurrency === 'GBP' ? '35' : selectedCurrency === 'EUR' ? '40' : '165'}/member dues
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`text-[11px] font-mono uppercase ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Software Cost Ratio
                </div>
                <div className="text-2xl font-mono font-extrabold text-emerald-500 mt-1">
                  &lt; 1.2%
                </div>
                <div className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Fraction of gym cashflow for full automation
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`text-[11px] font-mono uppercase ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Admin Time Saved
                </div>
                <div className="text-2xl font-mono font-extrabold text-[#38bdf8] mt-1">
                  ~{Math.round(pricingMembersSlider * 0.08 + 10)} hrs / mo
                </div>
                <div className={`text-[10px] mt-1 ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Zero manual WhatsApp calls &amp; register ledger entries
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-neutral-400">
                Need a custom hardware bundle with turnstiles? We provide plug-and-play biometric integrations.
              </div>
              <button
                onClick={() => {
                  const plan = pricingMembersSlider <= 100 ? 'Starter' : pricingMembersSlider <= 200 ? 'Growth' : pricingMembersSlider <= 400 ? 'Pro' : 'Enterprise';
                  if (plan === 'Enterprise') {
                    setIsBookDemoModalOpen(true);
                  } else {
                    setSelectedEnrollPlan(plan);
                    setIsEnrollModalOpen(true);
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-[#e50914] hover:bg-[#b80710] text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 cursor-pointer whitespace-nowrap"
              >
                Enroll in {pricingMembersSlider <= 100 ? 'Starter' : pricingMembersSlider <= 200 ? 'Growth' : pricingMembersSlider <= 400 ? 'Pro' : 'Enterprise'}
              </button>
            </div>
          </div>

          {/* Add-ons Section matching gymcare.co.in/pricing */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[#ff7b72] font-mono text-[11px] font-bold uppercase tracking-widest">
                EXPAND YOUR SYSTEM
              </span>
              <h3 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight">
                Add-Ons &amp; Hardware Integrations
              </h3>
              <p className={`text-xs sm:text-sm max-w-xl mx-auto ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
                Scale your capacity, automate WhatsApp communications, and link physical turnstiles with zero headaches.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Addon 1: Extra Members Pack */}
              <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                theme === 'dark' ? 'bg-[#121214] border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#ff4d4f] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">group_add</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-sm">Extra Member Pack</h4>
                  <div className="text-[#ff4d4f] font-mono font-bold text-lg">
                    {selectedCurrency === 'INR' ? '₹500' : '$7'} / mo
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">Min 50 members block</div>
                </div>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Need more members without upgrading to the next tier? Add active capacity in flexible 50-member packs anytime.
                </p>
              </div>

              {/* Addon 2: WhatsApp Cloud API */}
              <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                theme === 'dark' ? 'bg-[#121214] border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-[#25d366]/10 text-[#25d366] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">chat</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-sm">WhatsApp Cloud API</h4>
                  <div className="text-emerald-500 font-mono font-bold text-lg">
                    {selectedCurrency === 'INR' ? '₹0.35' : '$0.005'} / msg
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">Pay-as-you-use credits</div>
                </div>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Send automated fee renewal alerts, instant UPI payment receipts, and birthday greetings with official Meta green tick support.
                </p>
              </div>

              {/* Addon 3: Biometric Turnstiles API */}
              <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                theme === 'dark' ? 'bg-[#121214] border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">sensor_door</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-sm">Turnstile Hardware Sync</h4>
                  <div className="text-blue-500 font-mono font-bold text-lg">
                    {selectedCurrency === 'INR' ? '₹4,999' : '$69'} one-time
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">Zero recurring fees</div>
                </div>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Hardware API bridge for eSSL, ZKTeco, Hikvision and Realtime turnstiles and facial recognition gates.
                </p>
              </div>

              {/* Addon 4: Free Data Migration */}
              <div className={`p-6 rounded-2xl border space-y-3 shadow-xs ${
                theme === 'dark' ? 'bg-[#121214] border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">move_to_inbox</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-headline font-bold text-sm">White-Glove Migration</h4>
                  <div className="text-purple-500 font-mono font-bold text-lg">
                    100% FREE
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">Completed in &lt; 24h</div>
                </div>
                <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Switching from Excel, GymFlow, or legacy software? Our engineering team migrates your member data with zero downtime.
                </p>
              </div>
            </div>
          </div>

          {/* Toggleable Comprehensive Feature Comparison Matrix */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowPricingComparison(!showPricingComparison)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#18181b] hover:bg-[#27272a] text-white border-white/15'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[17px] text-primary">
                {showPricingComparison ? 'unfold_less' : 'table_chart'}
              </span>
              <span>{showPricingComparison ? 'Hide Feature Comparison' : 'Compare All Plan Features & Limits'}</span>
              <span className="material-symbols-outlined text-[15px]">
                {showPricingComparison ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>

          {showPricingComparison && (
            <div className={`rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200 ${
              theme === 'dark' ? 'bg-[#121214] border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={theme === 'dark' ? 'bg-white/5 border-b border-white/10' : 'bg-slate-100 border-b border-slate-200'}>
                    <tr>
                      <th className="py-4 px-6 font-headline font-bold">Features &amp; Capabilities</th>
                      <th className="py-4 px-4 font-headline font-bold text-center">Starter</th>
                      <th className="py-4 px-4 font-headline font-bold text-center text-[#ff4d4f]">Growth (★)</th>
                      <th className="py-4 px-4 font-headline font-bold text-center">Pro</th>
                      <th className="py-4 px-4 font-headline font-bold text-center">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme === 'dark' ? 'divide-white/10' : 'divide-slate-200'}`}>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Active Member Limit</td>
                      <td className="py-3 px-4 text-center font-mono">100</td>
                      <td className="py-3 px-4 text-center font-mono text-[#ff4d4f] font-bold">200</td>
                      <td className="py-3 px-4 text-center font-mono">400</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Branches Included</td>
                      <td className="py-3 px-4 text-center font-mono">1</td>
                      <td className="py-3 px-4 text-center font-mono text-[#ff4d4f] font-bold">1</td>
                      <td className="py-3 px-4 text-center font-mono">1</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">Multi-Branch</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Owner Web Dashboard</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Trainer Mobile App (Android/iOS)</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Member Mobile App (Digital QR Pass)</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Biometric Turnstile Hardware Sync</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Indian GST Tax Invoices (SAC 999723)</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">100% Offline POS Mode</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Expense &amp; Net Profit Analytics</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Automated WhatsApp Dues Reminders</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Complaints &amp; Support Ticket Desk</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Custom Workout &amp; Diet Plan Builder</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">White-label Branding &amp; Custom Domain</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-6 font-semibold">Dedicated Account Manager &amp; 24/7 SLA</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-neutral-500">—</td>
                      <td className="py-3 px-4 text-center text-emerald-500 font-bold">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pricing FAQ Accordion */}
          <div className="space-y-6 max-w-4xl mx-auto pt-6">
            <div className="text-center space-y-1">
              <span className="text-[#ff7b72] font-mono text-[11px] font-bold uppercase tracking-widest">
                FREQUENTLY ASKED QUESTIONS
              </span>
              <h3 className="text-2xl font-headline font-bold tracking-tight">
                Everything You Need to Know About Billing
              </h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: 'Are there any per-trainer fees or hidden transaction charges?',
                  a: 'Zero. Unlike other gym software that charges $15–$30 for every trainer account you create, Gymify includes unlimited trainer seats and unlimited staff logins on every plan.',
                },
                {
                  q: 'How does the 20% annual discount work?',
                  a: 'When you choose the Yearly billing cycle, you receive a flat 20% discount on the entire 12-month period, saving up to 2.4 months of subscription cost upfront.',
                },
                {
                  q: 'What happens when my gym grows and exceeds the plan member limit?',
                  a: 'You have two options: seamlessly upgrade to the next tier with prorated billing, or purchase flexible +50 Member Pack add-ons without altering your plan.',
                },
                {
                  q: 'Is GST included in the displayed prices?',
                  a: 'Prices are exclusive of applicable Indian GST (18%). All paid invoices include your gym’s GSTIN and SAC 999723 for full input tax credit (ITC) claims.',
                },
                {
                  q: 'How does the free data migration service work?',
                  a: 'Simply export your existing member roster, active plans, and pending balances from Excel or your old gym software. Our onboarding team maps and imports everything within 24 hours at zero charge.',
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    theme === 'dark' ? 'bg-[#121214] border-white/10' : 'bg-white border-slate-200'
                  }`}
                >
                  <button
                    onClick={() =>
                      setPricingFaqOpen((prev) => ({
                        ...prev,
                        [idx]: !prev[idx],
                      }))
                    }
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[18px] text-primary shrink-0 transition-transform">
                      {pricingFaqOpen[idx] ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {pricingFaqOpen[idx] && (
                    <div className={`px-5 pb-5 text-xs leading-relaxed border-t pt-3 ${
                      theme === 'dark' ? 'border-white/10 text-neutral-400' : 'border-slate-100 text-slate-600'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Reviews Section */}
      <section id="reviews" className="py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-[#ff7b72] tracking-wider">TESTIMONIALS</span>
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight mt-1">
              Loved by Gym Owners Worldwide
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              Real feedback from strength coaches, yoga instructors, and fitness studio directors.
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-xs font-semibold text-on-surface transition-all shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">rate_review</span>
            <span>Write a Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {'★'.repeat(rev.rating)}
                  </div>
                  <span className="text-[11px] font-mono text-on-surface-variant">{rev.date}</span>
                </div>
                <p className="text-xs text-on-surface leading-relaxed italic">"{rev.quote}"</p>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-on-surface">{rev.name}</div>
                  <div className="text-[11px] text-on-surface-variant">{rev.gymName} • {rev.city}</div>
                </div>
                {rev.verified && (
                  <span className="text-[10px] font-mono font-semibold text-emerald-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7B. About Gymify Section matching nav link */}
      <section id="about" className="py-20 px-4 sm:px-8 bg-surface-container-low/40 border-t border-outline-variant/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/10 text-[#ff7b72] border border-[#e50914]/20 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span>ABOUT GYMIFY PRO</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-on-surface tracking-tight">
                Engineered by Gym Owners, <span className="text-[#ff7b72]">For Gym Owners</span>
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Gymify was built out of frustration with sluggish, fragile cloud SaaS platforms that crashed right when morning rush hour hit at 6:00 AM. We wanted something ultra-responsive, completely reliable, and free of extortionate monthly subscriber taxes.
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Today, Gymify powers thousands of independent fitness studios, CrossFit boxes, combat academies, and wellness centers worldwide with local storage, instant turnstile hardware control, and seamless bi-directional Google Sheets synchronization.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setIsBookDemoModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] text-white text-xs font-bold hover:bg-[#b80710] shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  Book Free Walkthrough
                </button>
                <button
                  onClick={() => setActiveScreen('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold border border-outline-variant/30 transition-all cursor-pointer"
                >
                  Explore Interactive App
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 text-center shadow-xs">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-on-surface">2,400+</div>
                <div className="text-xs text-on-surface-variant mt-1 font-medium">Clubs Worldwide</div>
              </div>
              <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 text-center shadow-xs">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#ff7b72]">250K+</div>
                <div className="text-xs text-on-surface-variant mt-1 font-medium">Daily Check-ins</div>
              </div>
              <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 text-center shadow-xs">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-500">99.98%</div>
                <div className="text-xs text-on-surface-variant mt-1 font-medium">Offline Uptime</div>
              </div>
              <div className="bg-surface p-6 rounded-3xl border border-outline-variant/30 text-center shadow-xs">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">0%</div>
                <div className="text-xs text-on-surface-variant mt-1 font-medium">Revenue Commission</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7C. India Fitness Operations Section matching nav link */}
      <section id="india" className="py-20 px-4 sm:px-8 bg-surface border-t border-outline-variant/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-mono font-bold uppercase tracking-wider">
              <span>🇮🇳</span>
              <span>GYMIFY INDIA ECOSYSTEM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
              Tailored for <span className="text-[#ff7b72]">Indian Gym Operations</span>
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
              Fully compliant with Indian banking, UPI payments, GST accounting, and WhatsApp messaging protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
              </div>
              <h3 className="text-base font-headline font-bold text-on-surface">Dynamic UPI QR</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Display PhonePe, Google Pay, and Paytm dynamic payment QRs on your front-desk tablet. 0% gateway commission directly into your club account.
              </p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </div>
              <h3 className="text-base font-headline font-bold text-on-surface">GST Compliant (999723)</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Generate professional tax invoices with SAC Code 999723, automatic CGST/SGST splitting, and one-click monthly GSTR-1 CSV exports.
              </p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">sms</span>
              </div>
              <h3 className="text-base font-headline font-bold text-on-surface">TRAI DLT &amp; WhatsApp</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pre-approved DLT SMS templates and official WhatsApp Cloud API triggers for welcome packs, OTP logins, and renewal reminders.
              </p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[22px]">location_city</span>
              </div>
              <h3 className="text-base font-headline font-bold text-on-surface">Active Across India</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Trusted by 1,200+ gyms in Mumbai, Bengaluru, Delhi-NCR, Hyderabad, Pune, Chennai, Ahmedabad, Jaipur, and Chandigarh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7D. Blog & Playbooks Section matching nav link */}
      <section id="blog" className="py-20 px-4 sm:px-8 bg-surface-container-low/40 border-t border-outline-variant/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/10 text-[#ff7b72] border border-[#e50914]/20 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                <span>GYMIFY INSIGHTS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-on-surface tracking-tight">
                Gym Growth Playbooks &amp; <span className="text-[#ff7b72]">Masterclasses</span>
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Actionable operational strategies from gym founders doing $20k+ to $100k+ in monthly memberships.
              </p>
            </div>

            <button
              onClick={() => setActiveScreen('reports')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface transition-all cursor-pointer self-start sm:self-auto"
            >
              <span>View All Guides</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: 'Retention & Churn',
                title: 'How Ironline Strength Cut Membership Churn from 18% to 4.2%',
                desc: 'A step-by-step breakdown of how 7-day automated WhatsApp alerts eliminated forgotten renewals and stabilized cash flow.',
                readTime: '5 min read',
                author: 'Marcus Bell, Club Director',
              },
              {
                tag: 'Hardware & Access',
                title: 'Biometrics vs QR Scanners: Which Entry System Scales Better for 500+ Members?',
                desc: 'We tested fingerprint gates, face terminals, and smartphone QR codes during 6:30 PM peak load. Here are the latency numbers.',
                readTime: '7 min read',
                author: 'Tech Engineering Team',
              },
              {
                tag: 'Trainer Economics',
                title: 'Structuring Personal Training Commissions that Keep Coaches for 3+ Years',
                desc: 'The tiered bonus matrix that incentivized trainers to hit 85% class capacity while increasing overall gym gross profit.',
                readTime: '6 min read',
                author: 'Elena Rossi, Studio Owner',
              },
            ].map((art, idx) => (
              <div
                key={idx}
                onClick={() => showToast('Playbook Preview', `Opening "${art.title}"`, 'info')}
                className="bg-surface p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between space-y-4 hover:border-[#ff7b72]/40 hover:shadow-lg transition-all group cursor-pointer"
              >
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff7b72] bg-[#e50914]/10 px-2.5 py-1 rounded-full inline-block">
                    {art.tag}
                  </span>
                  <h3 className="text-base font-headline font-bold text-on-surface group-hover:text-[#ff7b72] transition-colors leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {art.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant font-mono">
                  <span>{art.author}</span>
                  <span className="text-primary font-medium">{art.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7E. FAQ Section matching nav link */}
      <section id="faq" className="py-20 px-4 sm:px-8 bg-surface border-t border-outline-variant/20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e50914]/10 text-[#ff7b72] border border-[#e50914]/20 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">help</span>
              <span>COMMON QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-headline font-extrabold text-on-surface tracking-tight">
              Frequently Asked <span className="text-[#ff7b72]">Questions</span>
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Everything you need to know about licensing, hardware turnstiles, offline mode, and Google Sheets sync.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Is Gymify truly a one-time purchase, or are there hidden annual charges?',
                a: '100% pay once, lifetime access. When you acquire Gymify, you own your software license forever. There are zero recurring monthly SaaS fees, zero charges per member, and you run it locally on your computer or front-desk tablet with no server costs.'
              },
              {
                q: 'What happens if the internet goes down at our gym during morning rush hour?',
                a: 'Gymify is architected offline-first. All check-ins, member roster queries, and attendance logs run seamlessly on your local hardware without relying on the internet. As soon as connectivity returns, your Google Sheets backup synchronizes automatically.'
              },
              {
                q: 'What turnstiles, barcode scanners, and RFID card readers are supported?',
                a: 'Gymify connects with any standard USB or Bluetooth barcode scanner, HID RFID 125kHz / 13.56MHz card readers, and Ethernet/IP-relay tripod turnstiles. In addition, members can check in using smartphone QR codes or front-desk lookup.'
              },
              {
                q: 'How does the bi-directional Google Sheets integration work?',
                a: 'You can connect your Google Sheet in one click. Gymify will pull new member rows from your spreadsheet into your database, or push member updates, renewals, and live growth trend telemetry into your Google Sheet on demand.'
              },
              {
                q: 'Can I import our existing members from Excel or another gym software?',
                a: 'Yes! Gymify includes a one-click CSV importer. You can map member names, phone numbers, email addresses, membership plans, and renewal dates in less than 2 minutes.'
              },
              {
                q: 'How do I book a personalized walkthrough for my fitness club?',
                a: 'Simply click "Book Free Demo" in the top bar. Our Gymify team will connect on WhatsApp or Google Meet to demonstrate turnstile integration, UPI billing, and answer all your club-specific questions.'
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-headline font-bold text-sm sm:text-base text-on-surface hover:text-[#ff7b72] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[20px] text-[#ff7b72] shrink-0 transition-transform">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/15 pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Comprehensive Footer matching User Image & Gymify */}
      <footer id="contact" className={`mt-auto border-t transition-colors pt-16 pb-12 px-4 sm:px-8 ${
        theme === 'dark'
          ? 'bg-[#09090c] border-white/10 text-neutral-300'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Newsletter & Playbook Banner */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-[#141419] via-[#111116] to-[#181822] border-white/10 shadow-2xl'
              : 'bg-gradient-to-r from-white via-slate-50 to-white border-slate-200 shadow-md'
          }`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e50914]/15 text-[#e50914] border border-[#e50914]/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e50914] animate-pulse"></span>
                    Gymify Growth Network
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Trusted by 1,200+ Fitness Clubs & Studios
                  </span>
                </div>
                <h3 className={`text-xl sm:text-2xl font-headline font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  Ready to Modernize Your Gym Facility?
                </h3>
                <p className={`text-xs sm:text-sm max-w-xl ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                }`}>
                  Get our free 2026 Gym Management Playbook, turnstile hardware compatibility guide, and revenue growth template.
                </p>
              </div>

              {/* Newsletter / CTA Form */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
                <form onSubmit={handleNewsletterSubmit} className="flex items-center w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-neutral-400">mail</span>
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your gym email..."
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-[#e50914] transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-white/15 text-white placeholder-neutral-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingNewsletter}
                    className="ml-2 px-4 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-xs transition-all shadow-md shadow-red-600/20 whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingNewsletter ? 'Sending...' : 'Get Playbook'}
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </form>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBookDemoModalOpen(true)}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      theme === 'dark'
                        ? 'border-white/20 hover:bg-white/10 text-white'
                        : 'border-slate-300 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#ff7b72]">calendar_month</span>
                    <span>Book Demo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Links & Brand Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Column 1: Brand & Contact Info (span 4) */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e50914] text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
                  <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-headline font-black tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    GYMIFY
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e50914]/20 text-[#e50914] border border-[#e50914]/30">
                    PRO
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed max-w-sm ${
                theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
              }`}>
                The all-in-one gym management operating system engineered for gym owners, fitness trainers, and health clubs. Real-time biometric attendance, UPI automated billing, GST invoices, and mobile apps with zero recurring cloud tax.
              </p>

              {/* Direct Contact Info */}
              <div className={`space-y-2.5 text-xs pt-1 ${
                theme === 'dark' ? 'text-neutral-300' : 'text-slate-700'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#e50914]/10 text-[#e50914] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[15px]">mail</span>
                  </span>
                  <a href="mailto:contact@visionus.io" className="hover:text-[#e50914] transition-colors">
                    contact@visionus.io / support@gymifypro.com
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#e50914]/10 text-[#e50914] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[15px]">call</span>
                  </span>
                  <a href="tel:+918602376477" className="hover:text-[#e50914] transition-colors">
                    Phone / WhatsApp: +91 86023 76477
                  </a>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-[#e50914]/10 text-[#e50914] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[15px]">location_on</span>
                  </span>
                  <span>
                    HQ: 402 Tech Boulevard, Vijay Nagar, Indore, MP 452010, India
                  </span>
                </div>
              </div>

              {/* Operational Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All systems operational • 99.98% Local-First Uptime</span>
              </div>

              {/* Social Channels */}
              <div className="flex items-center gap-2.5 pt-2">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Gymify on X / Twitter"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white' : 'bg-slate-200 hover:bg-[#e50914] text-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">𝕏</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Gymify on LinkedIn"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white' : 'bg-slate-200 hover:bg-[#e50914] text-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">in</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Gymify on Instagram"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white' : 'bg-slate-200 hover:bg-[#e50914] text-slate-700 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Gymify on YouTube"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-[#e50914] text-neutral-300 hover:text-white' : 'bg-slate-200 hover:bg-[#e50914] text-slate-700 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">smart_display</span>
                </a>
                <a
                  href="https://wa.me/918602376477"
                  target="_blank"
                  rel="noreferrer"
                  title="Chat directly on WhatsApp"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-[#25D366] text-neutral-300 hover:text-white' : 'bg-slate-200 hover:bg-[#25D366] text-slate-700 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                </a>
              </div>
            </div>

            {/* Column 2: PRODUCT (span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-[#e50914]">
                PRODUCT
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span>Compare</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-500 font-semibold">VS</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('showcase')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Gallery
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('blog')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsBookDemoModalOpen(true)} className="hover:text-[#e50914] transition-colors cursor-pointer text-left flex items-center gap-1">
                    <span>Book a demo</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e50914]"></span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsDownloadAppsModalOpen(true)} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Download Apps
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    ROI Calculator
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: COMPANY (span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-[#e50914]">
                COMPANY
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    About Gymify
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    About VisionUs
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('contact')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Contact sales
                  </button>
                </li>
                <li>
                  <a href="mailto:contact@visionus.io" className="hover:text-[#e50914] transition-colors block text-left">
                    Email: contact@visionus.io
                  </a>
                </li>
                <li>
                  <a href="tel:+918602376477" className="hover:text-[#e50914] transition-colors block text-left">
                    Phone / WhatsApp: +91 8602376477
                  </a>
                </li>
                <li>
                  <button onClick={() => showToast('Partner Program', 'Connect with partners@gymify.io for hardware reseller opportunities.', 'info')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Hardware Partners
                  </button>
                </li>
                <li>
                  <button onClick={() => showToast('Careers at Gymify', 'We are hiring Frontend & Fullstack Engineers! Email jobs@visionus.io', 'info')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span>Careers</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Hiring</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('reviews')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Customer Reviews
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: INDIA & LOCATIONS (span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-[#e50914]">
                INDIA
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => scrollToSection('india')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left font-medium">
                    Gym Management Software India
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCurrency('INR'); scrollToSection('pricing'); }} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Pricing for India (₹ INR)
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Gym Management Software
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Gym Billing Software
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Gym Attendance Software
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('connected-apps')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Gym Member App
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Gym CRM
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('india')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    All India Locations
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('india')} className={`hover:text-[#e50914] transition-colors cursor-pointer text-left ${theme === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
                    Gym Software Indore
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: LEGAL (span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-[#e50914]">
                LEGAL
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => openLegalModal('privacy')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('terms')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('deletion')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Account & Data Deletion
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('dpdp')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span>DPDP compliance (India)</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold">2023</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('gdpr')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    GDPR compliance (EU)
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('cookies')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Cookie policy
                  </button>
                </li>
                <li>
                  <button onClick={() => openLegalModal('terms')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Security & Encryption
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('hero')} className="hover:text-[#e50914] transition-colors cursor-pointer text-left">
                    Sitemap
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Contact Form Strip */}
          <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
            theme === 'dark' ? 'bg-[#121217] border-white/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e50914] text-[20px]">support_agent</span>
                  <h4 className={`text-base font-headline font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    Need a Custom Franchise Setup?
                  </h4>
                </div>
                <p className={`text-xs leading-relaxed ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'
                }`}>
                  Send a quick message to our team. We assist with hardware biometric sync, automated WhatsApp templates, and zero-downtime data migration.
                </p>
              </div>

              <div className="lg:col-span-2">
                <form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your Name *"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#e50914] transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-white/15 text-white placeholder-neutral-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email Address *"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#e50914] transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-white/15 text-white placeholder-neutral-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Gym Name & Details *"
                      className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#e50914] transition-colors ${
                        theme === 'dark'
                          ? 'bg-black/50 border-white/15 text-white placeholder-neutral-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="w-full h-full py-2.5 px-4 rounded-xl bg-[#e50914] hover:bg-[#b80710] disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">send</span>
                      <span>{isSubmittingContact ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Trust Badges & Quick Action Links */}
          <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
            <div className="space-y-1 text-center md:text-left">
              <div className={theme === 'dark' ? 'text-neutral-400' : 'text-slate-600'}>
                &copy; {new Date().getFullYear()} Gymify PRO. All rights reserved. A product of VisionUs built for modern fitness clubs worldwide.
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-emerald-400">verified_user</span>
                  <span>DPDP Act 2023 Compliant</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-blue-400">lock</span>
                  <span>256-Bit Local Encryption</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-purple-400">receipt</span>
                  <span>GST Ready E-Invoices</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-amber-400">wifi_off</span>
                  <span>100% Offline-First</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveScreen('dashboard')}
                className="text-[#e50914] hover:underline transition-colors cursor-pointer font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">rocket_launch</span>
                <span>Launch Live App</span>
              </button>
              <span>•</span>
              <button onClick={() => setIsDownloadAppsModalOpen(true)} className="hover:text-[#e50914] transition-colors cursor-pointer">
                Download Apps
              </button>
              <span>•</span>
              <button onClick={() => setIsBookDemoModalOpen(true)} className="hover:text-[#e50914] transition-colors cursor-pointer">
                Book Free Demo
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  toggleTheme();
                  showToast('Theme Mode Switched', `Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`, 'info');
                }}
                className="hover:text-[#e50914] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <span>•</span>
              <button onClick={() => scrollToSection('hero')} className="hover:text-[#e50914] transition-colors cursor-pointer flex items-center gap-1 font-semibold">
                <span>Back to Top</span>
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Legal & Compliance Modal */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[88vh] flex flex-col ${
            theme === 'dark'
              ? 'bg-[#141419] border-white/15 text-neutral-200'
              : 'bg-white border-slate-300 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#e50914] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">
                    {legalModalTab === 'privacy' && 'policy'}
                    {legalModalTab === 'terms' && 'description'}
                    {legalModalTab === 'dpdp' && 'verified_user'}
                    {legalModalTab === 'gdpr' && 'gavel'}
                    {legalModalTab === 'deletion' && 'delete_forever'}
                    {legalModalTab === 'cookies' && 'cookie'}
                  </span>
                </div>
                <div>
                  <h3 className={`text-lg font-headline font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {legalModalTab === 'privacy' && 'Privacy Policy'}
                    {legalModalTab === 'terms' && 'Terms of Service & License'}
                    {legalModalTab === 'dpdp' && 'DPDP Act 2023 Compliance (India)'}
                    {legalModalTab === 'gdpr' && 'GDPR Compliance (EU/EEA)'}
                    {legalModalTab === 'deletion' && 'Account & Data Erasure'}
                    {legalModalTab === 'cookies' && 'Cookie & Local Storage Policy'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Official compliance statement • VisionUs / Gymify PRO
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLegalModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Legal Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-outline-variant/15 scrollbar-none">
              {(['privacy', 'terms', 'dpdp', 'gdpr', 'deletion', 'cookies'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLegalModalTab(tab)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    legalModalTab === tab
                      ? 'bg-[#e50914] text-white shadow-xs'
                      : theme === 'dark'
                      ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'privacy' && 'Privacy Policy'}
                  {tab === 'terms' && 'Terms of Service'}
                  {tab === 'dpdp' && 'DPDP Act (India)'}
                  {tab === 'gdpr' && 'GDPR (EU)'}
                  {tab === 'deletion' && 'Data Deletion'}
                  {tab === 'cookies' && 'Cookies'}
                </button>
              ))}
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="overflow-y-auto space-y-4 text-xs pr-1 leading-relaxed text-neutral-300 flex-1">
              {legalModalTab === 'privacy' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                    <p className="font-semibold text-[#e50914] mb-1">Privacy-First Architecture</p>
                    <p>Gymify PRO by VisionUs is built upon a local-first browser sandboxing framework. Your fitness center data, member phone numbers, and revenue logs remain securely encrypted and under your administrative control.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">1. Information We Collect</h5>
                    <p>We process information submitted by gym owners: member profiles (name, phone, emergency contact), biometric check-in timestamps, membership start/expiry dates, class bookings, and payment receipt logs.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">2. How Data is Used</h5>
                    <p>Data is solely used to facilitate gym operations: check-in authorization, attendance rosters, automated WhatsApp renewal reminders (with user consent), and GST-compliant invoice generation.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">3. Zero Third-Party Advertising</h5>
                    <p>We never sell, rent, or monetize your gym or member data to third-party ad networks or brokers. All data belongs exclusively to the gym owner.</p>
                  </div>
                </div>
              )}

              {legalModalTab === 'terms' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                    <p className="font-semibold text-[#e50914] mb-1">Terms of Service & License</p>
                    <p>By accessing or subscribing to Gymify PRO, you agree to these commercial terms. Licenses are granted per active gym facility as outlined in your selected tier.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">1. Commercial License</h5>
                    <p>Gymify grants you a non-exclusive, revocable license to utilize the gym operating system for managing members, staff, classes, and turnstiles.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">2. Hardware Compatibility</h5>
                    <p>Gymify interfaces with standard USB, IP LAN turnstiles, and biometric devices via standard web APIs and local bridge drivers.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">3. Payment & Invoicing</h5>
                    <p>Subscription fees or one-time license fees are billed in your chosen local currency (INR, USD, GBP, EUR, AED). GST invoices are generated upon payment confirmation.</p>
                  </div>
                </div>
              )}

              {legalModalTab === 'dpdp' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                    <p className="font-semibold text-blue-400 mb-1">Digital Personal Data Protection (DPDP) Act, 2023</p>
                    <p>Gymify complies with India's DPDP Act 2023 regarding data fiduciary and data principal safeguards for fitness clubs operating within India.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">1. Notice & Consent</h5>
                    <p>Gym owners are provided consent banners and WhatsApp opt-in templates to present to members before recording personal fitness health notes or phone numbers.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">2. Rights of Data Principals</h5>
                    <p>Members have the right to obtain confirmation of whether their personal data is being processed, a summary of processed data, correction of inaccurate entries, and erasure of expired accounts.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">3. Grievance Officer</h5>
                    <p>In compliance with DPDP provisions, questions or grievances can be directed to the Data Protection Officer at: <span className="font-mono text-white">dpo@gymify.io</span> or VisionUs Solutions, Indore, MP 452010.</p>
                  </div>
                </div>
              )}

              {legalModalTab === 'gdpr' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'}`}>
                    <p className="font-semibold text-purple-400 mb-1">EU General Data Protection Regulation (GDPR)</p>
                    <p>For European Union members and studios, Gymify complies with Regulation (EU) 2016/679.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Articles 15-22 Rights</h5>
                    <p>Right of access, right to rectification, right to erasure ('right to be forgotten'), right to restriction of processing, and right to data portability in JSON/CSV formats.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Data Minimization</h5>
                    <p>We do not collect unnecessary biometrics beyond verification tokens required for physical turnstile gym access.</p>
                  </div>
                </div>
              )}

              {legalModalTab === 'deletion' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    <p className="font-semibold text-[#e50914] mb-1">Account & Member Data Erasure</p>
                    <p>Gym owners and members can initiate complete deletion of stored records, attendance traces, and transaction logs at any time.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Instant Local Erasure</h5>
                    <p>Clicking the button below will immediately wipe temporary browser cache, member demo profiles, and offline state on this device.</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        showToast('Local Data Purged', 'Local demo cache and member entries have been wiped.', 'info');
                        setIsLegalModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Purge Local Demo Cache</span>
                    </button>
                  </div>
                </div>
              )}

              {legalModalTab === 'cookies' && (
                <div className="space-y-3">
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                    <p className="font-semibold text-amber-400 mb-1">Zero Third-Party Advertising Cookies</p>
                    <p>Gymify does not use intrusive behavioral tracking cookies. We only use essential browser storage to remember your chosen theme (Light/Dark), active session tokens, and local gym records.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-white mb-1">Essential Storage Items</h5>
                    <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-1">
                      <li><strong className="text-white">gymify_theme</strong>: Stores your Light / Dark preference.</li>
                      <li><strong className="text-white">gymify_currency</strong>: Stores your preferred pricing currency.</li>
                      <li><strong className="text-white">gymify_cache</strong>: Enables instant offline turnstile check-ins.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-neutral-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">verified</span>
                <span>VisionUs Solutions Private Limited • Indore, MP, India</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('contact@visionus.io');
                    showToast('Email Copied', 'contact@visionus.io copied to clipboard', 'info');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer ${
                    theme === 'dark' ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  Copy Legal Email
                </button>
                <button
                  type="button"
                  onClick={() => setIsLegalModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#e50914] text-white font-semibold text-xs cursor-pointer hover:bg-[#b80710]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Core Module Detail Modal (Directly from User Images 2 & 3 with India Operations) */}
      {inspectedModule && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col ${
            theme === 'dark'
              ? 'bg-[#141419] border-white/15 text-neutral-200'
              : 'bg-white border-slate-300 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e50914] text-white flex items-center justify-center font-bold font-mono shadow-md shadow-red-600/30">
                  <span>{inspectedModule.num}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e50914]/20 text-[#e50914]">
                      CORE MODULE {inspectedModule.num}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {inspectedModule.tag}
                    </span>
                  </div>
                  <h3 className={`text-xl font-headline font-bold mt-0.5 ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {inspectedModule.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setInspectedModule(null)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto space-y-4 text-xs pr-1 leading-relaxed flex-1">
              {/* Feature Description */}
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-bold text-[#e50914] mb-1 text-xs uppercase font-mono">Feature Overview</h4>
                <p className="text-sm font-medium leading-relaxed">
                  {inspectedModule.description}
                </p>
              </div>

              {/* India-Based Gym Operations Context */}
              <div className={`p-4 rounded-2xl border ${
                theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-400">verified</span>
                  <h4 className="font-bold text-xs uppercase font-mono">India Operations &amp; Best Practices</h4>
                </div>
                <p className="text-xs leading-relaxed">
                  {inspectedModule.indiaContext}
                </p>
              </div>

              {/* Specialized Interactive Mini-Preview based on Module */}
              {inspectedModule.num === '03' && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">GST 18% Tax Invoice Simulator</span>
                    <span className="font-mono text-emerald-400 font-bold">SAC: 999723</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-neutral-400">Base Fee</div>
                      <div className="font-bold font-mono mt-0.5 text-white">₹3,390</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-neutral-400">CGST (9%)</div>
                      <div className="font-bold font-mono mt-0.5 text-amber-400">₹305</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-neutral-400">SGST (9%)</div>
                      <div className="font-bold font-mono mt-0.5 text-amber-400">₹305</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#e50914]/20 border border-[#e50914]/40">
                      <div className="text-[10px] text-[#e50914] font-bold">Total (Gross)</div>
                      <div className="font-bold font-mono mt-0.5 text-white">₹4,000</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                    <span>Payment: UPI Autopay / PhonePe / GPay</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>ITC Tax Deductible</span>
                    </span>
                  </div>
                </div>
              )}

              {inspectedModule.num === '04' && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Turnstile Hardware Relay Benchmark</span>
                    <span className="font-mono text-emerald-400">0.18s Latch Trigger</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-neutral-400">Supported Hardware</div>
                      <div className="font-semibold text-white mt-0.5">eSSL / Mantra / BioMax</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-neutral-400">Network Mode</div>
                      <div className="font-semibold text-emerald-400 mt-0.5">Offline LAN First</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-neutral-400">Throughput</div>
                      <div className="font-semibold text-white mt-0.5">38 Check-ins/min</div>
                    </div>
                  </div>
                </div>
              )}

              {inspectedModule.num === '06' && (
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Sample Indian Veg Macro Split</span>
                    <span className="font-mono text-amber-400 font-bold">145g Protein • 2,250 kcal</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-neutral-300">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Breakfast: 3 Moong Dal Chillas + 100g Paneer Bhurji</span>
                      <span className="font-mono text-white">32g Protein</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Mid-day: Chana Sattu Drink (40g) + Roasted Chana</span>
                      <span className="font-mono text-white">20g Protein</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Lunch: 2 Rotis + 1 Bowl Thick Dal Tadka + 150g Curd</span>
                      <span className="font-mono text-white">28g Protein</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Post-Workout: Whey Isolate + Banana + 5 Almonds</span>
                      <span className="font-mono text-white">30g Protein</span>
                    </div>
                  </div>
                </div>
              )}

              {inspectedModule.num === '11' && (
                <div className={`p-4 rounded-2xl border space-y-2.5 ${
                  theme === 'dark' ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">Active Service Desk Tickets</span>
                    <span className="text-[11px] text-amber-400 font-mono">2 Open • 1 Resolved</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">Cardio AC Cooling Low (Peak Hours)</span>
                        <div className="text-[10px] text-neutral-400">Assigned: Amit HVAC • Downtown Flagship</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">In Progress</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">Turnstile Gate 2 QR Scanner Calibrated</span>
                        <div className="text-[10px] text-neutral-400">Lens cleaned &amp; restarted</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">Resolved</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-neutral-400 text-[11px]">
                Built for daily gym operations in Indian gyms &amp; fitness studios.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedModule.screenId;
                    setInspectedModule(null);
                    setActiveScreen(target as any);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#e50914] text-white font-bold text-xs hover:bg-[#b80710] shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Module in Live App</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedModule(null)}
                  className={`px-3 py-2 rounded-xl border text-xs cursor-pointer ${
                    theme === 'dark' ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Free Demo Modal */}
      {isBookDemoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e50914] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Book Free 1-on-1 Demo</h3>
                  <p className="text-[11px] text-on-surface-variant">See turnstile sync, UPI autopay, and member workflows live</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookDemoModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleDemoBookingSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Gym / Studio Name *</label>
                  <input
                    type="text"
                    required
                    value={demoGymName}
                    onChange={(e) => setDemoGymName(e.target.value)}
                    placeholder="e.g. Ironline Strength Club"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">Your Name</label>
                  <input
                    type="text"
                    value={demoOwnerName}
                    onChange={(e) => setDemoOwnerName(e.target.value)}
                    placeholder="e.g. Marcus Bell"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={demoPhone}
                    onChange={(e) => setDemoPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">City / Location</label>
                  <input
                    type="text"
                    value={demoCity}
                    onChange={(e) => setDemoCity(e.target.value)}
                    placeholder="e.g. Bengaluru / Austin"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">Preferred Demo Time Slot</label>
                <select
                  value={demoSlot}
                  onChange={(e) => setDemoSlot(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
                >
                  <option value="Today 3:00 PM (IST)">Today • 3:00 PM (IST)</option>
                  <option value="Today 6:00 PM (IST)">Today • 6:00 PM (IST)</option>
                  <option value="Tomorrow 11:00 AM (IST)">Tomorrow • 11:00 AM (IST)</option>
                  <option value="Tomorrow 4:00 PM (IST)">Tomorrow • 4:00 PM (IST)</option>
                  <option value="Weekend Special Slot">Weekend Slot (Sat/Sun)</option>
                </select>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmittingDemo}
                  className="w-full py-3 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[17px]">event_available</span>
                  <span>{isSubmittingDemo ? 'Scheduling Demo...' : 'Confirm Free 1-on-1 Walkthrough'}</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-on-surface-variant">OR</span>
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsBookDemoModalOpen(false);
                    setActiveScreen('dashboard');
                  }}
                  className="w-full py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#ff7b72]">rocket_launch</span>
                  <span>Launch Instant Live Interactive App Right Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Download Apps Modal */}
      {isDownloadAppsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#242426] text-white flex items-center justify-center font-bold border border-white/10">
                  <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Download Gymify Apps</h3>
                  <p className="text-[11px] text-on-surface-variant">Available across Android tablets, iOS, desktop, and hardware turnstiles</p>
                </div>
              </div>
              <button
                onClick={() => setIsDownloadAppsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* App 1: Front-desk tablet */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-on-surface">Front-Desk Tablet APK</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-semibold">Android</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Designed for 10" Android tablets mounted at front-desk turnstiles for fast biometric &amp; QR camera check-ins.
                  </p>
                </div>
                <button
                  onClick={() => showToast('APK Download Started', 'Downloading Gymify_Terminal_v2.6.4.apk (24 MB)', 'success')}
                  className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download .APK (24 MB)</span>
                </button>
              </div>

              {/* App 2: Member PWA */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-on-surface">Member Companion PWA</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-500 font-semibold">iOS / Android</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Zero app store downloads. Members add to home screen in 2 seconds for digital barcode access &amp; PT class booking.
                  </p>
                </div>
                <button
                  onClick={() => showToast('PWA Prompt', 'Open this link on smartphone Safari or Chrome to install.', 'info')}
                  className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_to_home_screen</span>
                  <span>Install Web App</span>
                </button>
              </div>

              {/* App 3: Desktop Standalone */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-on-surface">Desktop Offline Suite</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-500 font-semibold">Win / macOS</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Runs 100% offline with zero cloud latency. Automatic background backups to local disk and Google Sheets.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Desktop Package', 'Downloading Gymify_Desktop_Setup.exe (68 MB)', 'success')}
                  className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">computer</span>
                  <span>Download Desktop App</span>
                </button>
              </div>

              {/* App 4: Hardware Turnstile Daemon */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-on-surface">Hardware Turnstile Daemon</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-500 font-semibold">Daemon v1.4</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Lightweight background service for USB barcode guns, RFID 13.56MHz readers, and Ethernet relay turnstiles.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Hardware Daemon', 'Downloading Gymify_Turnstile_Bridge.zip (12 MB)', 'success')}
                  className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">settings_input_component</span>
                  <span>Download Bridge Daemon</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setIsDownloadAppsModalOpen(false);
                  setActiveScreen('dashboard');
                }}
                className="text-xs font-semibold text-[#ff7b72] hover:underline cursor-pointer"
              >
                Or test the full dashboard online in your browser →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GST Tax Invoice Preview Modal */}
      {isGstModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">GST Tax Invoice Generator</h3>
                  <p className="text-[11px] text-on-surface-variant font-mono">SAC Code 999723 • CGST (9%) + SGST (9%)</p>
                </div>
              </div>
              <button
                onClick={() => setIsGstModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Printable Invoice Sheet Preview */}
            <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30 space-y-4 text-xs font-sans">
              <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <div className="font-headline font-bold text-sm text-on-surface">IRONLINE FITNESS CLUB PVT LTD</div>
                  <div className="text-[11px] text-on-surface-variant">Plot 42, HSR Layout, Sector 2, Bengaluru, KA 560102</div>
                  <div className="text-[11px] font-mono text-primary mt-0.5">GSTIN: 29AABCU9603R1ZM</div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-on-surface">INVOICE: #GC-2026-0842</div>
                  <div className="text-[10px] text-on-surface-variant">Date: 14 Oct 2026</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                    PAID (UPI)
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-on-surface-variant uppercase">Billed To Member</div>
                <div className="font-bold text-on-surface text-xs mt-0.5">Rahul Verma (Member ID: GC-1082)</div>
                <div className="text-[11px] text-on-surface-variant">+91 98765 43210 • Bengaluru, Karnataka</div>
              </div>

              {/* Items Table */}
              <div className="border border-outline-variant/25 rounded-xl overflow-hidden text-xs">
                <div className="bg-surface-container px-3 py-2 flex justify-between font-mono font-bold text-[10px] text-on-surface-variant uppercase border-b border-outline-variant/20">
                  <span>Description / SAC</span>
                  <span>Amount</span>
                </div>
                <div className="p-3 divide-y divide-outline-variant/15 space-y-2">
                  <div className="flex justify-between pt-1">
                    <div>
                      <div className="font-semibold text-on-surface">Annual Unlimited Strength VIP Pass (12 Months)</div>
                      <div className="text-[10px] font-mono text-on-surface-variant">SAC 999723 • Fitness Club Services</div>
                    </div>
                    <div className="font-mono font-bold text-on-surface">₹14,999.00</div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <div>
                      <div className="font-semibold text-on-surface">1-on-1 Personal Training Pack (10 Sessions)</div>
                      <div className="text-[10px] font-mono text-on-surface-variant">SAC 999723 • Coach: Alex Morgan</div>
                    </div>
                    <div className="font-mono font-bold text-on-surface">₹6,000.00</div>
                  </div>
                </div>
              </div>

              {/* Totals and Tax Breakdown */}
              <div className="space-y-1.5 font-mono text-[11px] border-t border-outline-variant/20 pt-3">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Taxable Subtotal:</span>
                  <span>₹20,999.00</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Central GST (CGST @ 9%):</span>
                  <span>₹1,889.91</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>State GST (SGST @ 9%):</span>
                  <span>₹1,889.91</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-on-surface pt-2 border-t border-outline-variant/20">
                  <span>Grand Total (All Taxes Included):</span>
                  <span className="text-emerald-500 font-mono text-sm">₹24,778.82</span>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => showToast('PDF Exported', 'Downloaded GST_Invoice_GC-2026-0842.pdf', 'success')}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download GST Tax Invoice (PDF)</span>
              </button>
              <button
                onClick={() => showToast('Print Ready', 'Sent GST Tax Invoice to receipt printer', 'info')}
                className="py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-semibold text-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Template Simulator Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#25d366] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">WhatsApp Retention Automation</h3>
                  <p className="text-[11px] text-on-surface-variant font-mono">Official TRAI DLT Pre-Registered Sequences</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs">
              <button
                onClick={() => setSelectedWaTemplate('7days')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedWaTemplate === '7days' ? 'bg-[#25d366] text-black font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                7 Days Before
              </button>
              <button
                onClick={() => setSelectedWaTemplate('due_today')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedWaTemplate === 'due_today' ? 'bg-[#25d366] text-black font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Expiry Day
              </button>
              <button
                onClick={() => setSelectedWaTemplate('overdue')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedWaTemplate === 'overdue' ? 'bg-[#25d366] text-black font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                3 Days Overdue
              </button>
            </div>

            {/* Realistic WhatsApp Chat Preview */}
            <div className="bg-[#0b141a] rounded-2xl p-4 border border-white/10 text-white space-y-3 font-sans">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[16px]">fitness_center</span>
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Ironline Strength Gym</span>
                    <span className="material-symbols-outlined text-[#25d366] text-[14px]">verified</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">WhatsApp Business API • Registered DLT Header: GYMIFY</div>
                </div>
              </div>

              {/* Chat Message Bubble based on template */}
              <div className="bg-[#005c4b] p-3.5 rounded-2xl rounded-tl-xs text-xs leading-relaxed space-y-2">
                {selectedWaTemplate === '7days' && (
                  <>
                    <p>
                      Hello <strong>Ananya Sharma</strong>, your <strong>Student Monthly Membership</strong> at Ironline Strength Club expires in <strong>7 days</strong> (on 22 Oct 2026).
                    </p>
                    <p>
                      Keep your fitness streak alive! Renew before expiry to lock in early-bird renewal pricing and keep your turnstile access active.
                    </p>
                  </>
                )}

                {selectedWaTemplate === 'due_today' && (
                  <>
                    <p>
                      🚨 <strong>URGENT: Membership Expires Today</strong>
                    </p>
                    <p>
                      Hi <strong>Ananya Sharma</strong>, your gym pass at Ironline Club expires at 11:59 PM tonight. Turnstile gates will be locked tomorrow morning unless renewed.
                    </p>
                  </>
                )}

                {selectedWaTemplate === 'overdue' && (
                  <>
                    <p>
                      👋 We miss you, <strong>Ananya</strong>!
                    </p>
                    <p>
                      Your membership expired 3 days ago. Pay your pending dues of <strong>₹1,499.00</strong> now with zero penalty charges and resume workouts today.
                    </p>
                  </>
                )}

                <div className="bg-black/35 p-2.5 rounded-xl space-y-1 text-[11px] font-mono">
                  <div className="text-neutral-300">Renewal Amount: ₹1,499.00</div>
                  <div className="text-[#25d366] underline cursor-pointer">upi://pay?pa=ironline@upi&amp;am=1499</div>
                </div>

                <div className="text-right text-[10px] text-neutral-300 font-mono flex items-center justify-end gap-1">
                  <span>Just now</span>
                  <span className="text-[#53bdeb]">✓✓</span>
                </div>
              </div>
            </div>

            {/* Test Trigger Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  showToast(
                    'WhatsApp Alert Dispatched',
                    `Simulated automated WhatsApp DLT message to Ananya Sharma (+91 98765 43210)`,
                    'success'
                  );
                  setIsWhatsAppModalOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-[#25d366] hover:bg-[#1ebd5a] text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span>Send Simulated WhatsApp Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl p-6 border border-outline-variant/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="text-base font-headline font-bold text-on-surface">Write a Review for Gymify PRO</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-on-surface mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Gym Name</label>
                  <input
                    type="text"
                    value={newReviewGym}
                    onChange={(e) => setNewReviewGym(e.target.value)}
                    placeholder="e.g. Ironline Club"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">City / Location</label>
                  <input
                    type="text"
                    value={newReviewCity}
                    onChange={(e) => setNewReviewCity(e.target.value)}
                    placeholder="e.g. Miami, FL"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">Your Feedback / Review Quote</label>
                <textarea
                  rows={3}
                  required
                  value={newReviewQuote}
                  onChange={(e) => setNewReviewQuote(e.target.value)}
                  placeholder="Share how Gymify PRO has helped your fitness business..."
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-on-primary font-semibold shadow-md shadow-primary/20"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plan Enrollment Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e50914] text-white flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
                <div>
                  <h3 className="text-lg font-headline font-bold text-on-surface">Enroll in Gymify {selectedEnrollPlan}</h3>
                  <p className="text-[11px] text-on-surface-variant font-mono">
                    {pricingCycle === 'yearly' ? 'Annual Billing (20% Off)' : 'Monthly Billing'} • Instant Activation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Plan Price Summary Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-red-50/60 border-red-200'
            }`}>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff7b72] font-bold">SELECTED TIER</span>
                <div className="text-base font-headline font-bold text-on-surface">Gymify {selectedEnrollPlan} Plan</div>
                <div className="text-xs text-on-surface-variant">
                  {selectedEnrollPlan === 'Starter' ? 'Up to 100 active members' :
                   selectedEnrollPlan === 'Growth' ? 'Up to 200 active members' :
                   selectedEnrollPlan === 'Pro' ? 'Up to 400 active members' : 'Custom capacity'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-extrabold text-[#ff4d4f]">
                  {selectedEnrollPlan === 'Enterprise' ? 'Custom' :
                   pricingCycle === 'monthly'
                    ? (selectedEnrollPlan === 'Starter' ? PLAN_PRICING.starter[selectedCurrency].formattedMonthly :
                       selectedEnrollPlan === 'Growth' ? PLAN_PRICING.growth[selectedCurrency].formattedMonthly :
                       PLAN_PRICING.pro[selectedCurrency].formattedMonthly)
                    : (selectedEnrollPlan === 'Starter' ? PLAN_PRICING.starter[selectedCurrency].formattedYearly :
                       selectedEnrollPlan === 'Growth' ? PLAN_PRICING.growth[selectedCurrency].formattedYearly :
                       PLAN_PRICING.pro[selectedCurrency].formattedYearly)}
                </div>
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">
                  {pricingCycle === 'yearly' ? 'Per Month, Billed Annually' : 'Per Month'}
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsSubmittingEnroll(true);
                setTimeout(() => {
                  setIsSubmittingEnroll(false);
                  setIsEnrollModalOpen(false);
                  showToast(
                    'Enrollment Successful! 🎉',
                    `Welcome to Gymify PRO, ${enrollOwnerName || 'Coach'}! Activation link dispatched to ${enrollEmail || enrollPhone}.`,
                    'success'
                  );
                }, 900);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Gym / Fitness Club Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollGymName}
                    onChange={(e) => setEnrollGymName(e.target.value)}
                    placeholder="e.g. Ironline Strength Club"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">Owner / Manager Name *</label>
                  <input
                    type="text"
                    required
                    value={enrollOwnerName}
                    onChange={(e) => setEnrollOwnerName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singh"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={enrollPhone}
                    onChange={(e) => setEnrollPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-medium text-on-surface mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    placeholder="owner@ironlinegym.com"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-on-surface mb-1">City / Location</label>
                <input
                  type="text"
                  value={enrollCity}
                  onChange={(e) => setEnrollCity(e.target.value)}
                  placeholder="e.g. Bangalore / Mumbai / Delhi"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block font-medium text-on-surface mb-1">Preferred Activation Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                    theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <span className="material-symbols-outlined text-[18px] block mx-auto text-primary">qr_code_2</span>
                    <span className="text-[11px] block mt-0.5">UPI Autopay</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                    theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <span className="material-symbols-outlined text-[18px] block mx-auto text-emerald-500">credit_card</span>
                    <span className="text-[11px] block mt-0.5">Card / NetBank</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                    theme === 'dark' ? 'bg-[#18181b] border-white/10' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <span className="material-symbols-outlined text-[18px] block mx-auto text-blue-500">receipt_long</span>
                    <span className="text-[11px] block mt-0.5">GST Invoice</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnroll}
                  className="px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-bold shadow-md shadow-red-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEnroll ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Enrollment</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Sign-In Button (In place of Dark mode floating button) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <button
          onClick={() => {
            setActiveScreen('login');
            showToast('Sign In', 'Access your Gymify operations dashboard or explore role-based profiles.', 'info');
          }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border cursor-pointer bg-[#e50914] hover:bg-[#b80710] text-white border-white/25 shadow-red-600/40 group"
          title="Sign in to your Gymify Account"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-[16px]">login</span>
          </div>
          <span className="text-xs font-bold tracking-wide uppercase font-headline">
            Sign In
          </span>
          <span className="material-symbols-outlined text-[16px] -ml-1 transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};
