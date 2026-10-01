import { LandingCMSConfig } from '../types';

export const DEFAULT_LANDING_CMS: LandingCMSConfig = {
  badgeText: '🇮🇳 India\'s #1 Local-First Gym Operating System',
  heroHeadline: 'Complete Gym Management Software for Fitness Clubs',
  heroHighlight: 'Runs 100% Offline • Zero SaaS Lock-in',
  heroSubtitle: 'Hardwired Turnstile Gates • Indian GST Invoicing • WhatsApp Automation • Dynamic UPI QR Codes • Member & Trainer KYC Compliance.',
  primaryCtaText: 'Explore Interactive Modules',
  secondaryCtaText: 'Sign In to Terminal',
  announcementBanner: '🚀 New v2.6.4: Dynamic WhatsApp UPI QR Codes & Mandatory Aadhaar Verification Engine Live!',
  showAnnouncement: true,
  lastUpdated: new Date().toISOString(),
  plans: [
    {
      id: 'plan-starter',
      tier: 'starter',
      name: 'Starter Club',
      monthlyPrice: 2500,
      yearlyPrice: 2000,
      badge: 'Boutique Studios',
      description: 'Ideal for neighborhood gyms, yoga centers and fitness studios.',
      features: [
        'Up to 100 Active Members',
        '1 Biometric Turnstile / Face Gate Relay',
        'WhatsApp Automated Fee Renewal Nudges',
        'Indian GST Invoicing with SAC 999723',
        'Digital QR Member Passes & Gate Terminal',
        'Unlimited Trainer & Staff Accounts'
      ],
      isPopular: false
    },
    {
      id: 'plan-growth',
      tier: 'growth',
      name: 'Growth Performance',
      monthlyPrice: 4000,
      yearlyPrice: 3200,
      badge: 'Most Popular',
      description: 'Engineered for scaling fitness clubs with classes, trainers, and high floor traffic.',
      features: [
        'Up to 350 Active Members',
        '2 Biometric Gates with RFID Wristbands',
        'Class & Personal Trainer Scheduling Grid',
        'Staff GPS Geofenced Attendance Verification',
        'Bi-Directional Google Sheets Roster Sync',
        'WhatsApp Dynamic UPI Payment QR Dispatch',
        'Indian Macro Diet & Workout Plan Generator'
      ],
      isPopular: true
    },
    {
      id: 'plan-pro',
      tier: 'pro',
      name: 'Pro Heavy Iron',
      monthlyPrice: 7000,
      yearlyPrice: 5600,
      badge: 'Athletic Centers',
      description: 'For premier high-volume fitness centers requiring advanced analytics and CRM.',
      features: [
        'Up to 1,000 Active Members',
        'Multi-Gate Fast Turnstile Relays (0.1s)',
        'Full CRM Pipeline with WhatsApp Auto Lead Nurturing',
        'Granular Role-Based Access Control (Tenant RBAC)',
        'Expense Tracking & Monthly Profit Analytics',
        'Member Aadhaar & KYC Verification Vault',
        'Trainer Academic & Certification Document Vault'
      ],
      isPopular: false
    },
    {
      id: 'plan-enterprise',
      tier: 'enterprise',
      name: 'Franchise Enterprise',
      monthlyPrice: 12000,
      yearlyPrice: 9600,
      badge: 'Multi-Branch Chains',
      description: 'Multi-branch gym chains, regional franchises, and university sports complexes.',
      features: [
        'Unlimited Members & Unlimited Staff Accounts',
        'Multi-Location Roaming Access for Members',
        'Dedicated Database Engine (PostgreSQL or MongoDB)',
        'White-Label Branded Member Portal & Invoicing',
        'Custom Cloud Webhooks & Google Apps Script Sync',
        'Dedicated 24/7 Engineering SLA & Hardware Bridge',
        'Custom Financial Audit Exports & Multi-Branch P&L'
      ],
      isPopular: false
    }
  ]
};
