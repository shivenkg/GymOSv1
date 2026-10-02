import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { SaaSPackage, SaaSLicense, OperationStatus } from '../types';
import { TenantDatabaseManager } from '../components/TenantDatabaseManager';
import { GoogleSheetsManager } from '../components/GoogleSheetsManager';
import { LandingCmsManager } from '../components/LandingCmsManager';
import { JwtSecurityManager } from '../components/JwtSecurityManager';
import { TurnstileKeyManager } from '../components/TurnstileKeyManager';

export const SuperAdminView: React.FC = () => {
  const {
    saasPackages,
    saveSaaSPackage,
    deleteSaaSPackage,
    saasLicenses,
    generateLicense,
    updateLicenseStatus,
    updateOperationStatus,
    applyLicenseToTenant,
    activeTenantLicense,
    setActiveScreen,
    logout,
    showToast,
  } = useGym();

  const [activeTab, setActiveTab] = useState<'packages' | 'generator' | 'landing-cms' | 'tenants' | 'telemetry' | 'databases' | 'google-sheets' | 'hardware-keys' | 'jwt-security'>('packages');

  // Package Customizer State
  const [customMembers, setCustomMembers] = useState<number>(1500);
  const [customStaff, setCustomStaff] = useState<number>(12);
  const [customLocations, setCustomLocations] = useState<number>(3);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [customAddons, setCustomAddons] = useState({
    qrHardware: true,
    aiRetention: true,
    whatsappSms: true,
    brandedApp: false,
    multiBranchRoaming: true,
    prioritySupport247: false,
    customReporting: true,
  });

  const [newBlueprintName, setNewBlueprintName] = useState<string>('');
  const [showSaveBlueprintModal, setShowSaveBlueprintModal] = useState<boolean>(false);

  // License Generator Form State
  const [genGymName, setGenGymName] = useState<string>('Olympus Athletics & Wellness');
  const [genContactEmail, setGenContactEmail] = useState<string>('licensing@olympusfit.com');
  const [genAdminName, setGenAdminName] = useState<string>('Marcus Vance');
  const [genTier, setGenTier] = useState<string>('Pro Multi-Gym');
  const [genMembers, setGenMembers] = useState<number>(2000);
  const [genStaff, setGenStaff] = useState<number>(16);
  const [genLocations, setGenLocations] = useState<number>(4);
  const [genDurationMonths, setGenDurationMonths] = useState<number>(12);
  const [genHardwareBinding, setGenHardwareBinding] = useState<string>('HW-MAC-5C:96:56:88:B3:01');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'QR Turnstile Gate',
    'AI Churn Prediction',
    'WhatsApp Automation',
    'Multi-Branch Roaming',
  ]);

  const [generatedResult, setGeneratedResult] = useState<SaaSLicense | null>(null);

  // Search & Filter in Registry: Tenant-Wise Licence & Status of Operation
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<string>('all');
  const [operationStatusFilter, setOperationStatusFilter] = useState<string>('all');
  const [selectedAuditLicense, setSelectedAuditLicense] = useState<SaaSLicense | null>(null);

  // Dynamic SaaS Pricing Calculation Engine (INR)
  const calculatePricing = () => {
    // Base platform access
    let base = 3999;

    // Member pricing: Tiered marginal cost per 100 members (₹450 per 100 members)
    const memberHundreds = Math.ceil(customMembers / 100);
    const memberCost = memberHundreds * 450;

    // Staff seats cost: ₹499 / staff / month
    const staffCost = customStaff * 499;

    // Location multiplier: 1st location included, additional +₹2,999 / branch
    const locationCost = (customLocations - 1) * 2999;

    // Addon modules
    let addonsTotal = 0;
    if (customAddons.qrHardware) addonsTotal += 2499 * customLocations;
    if (customAddons.aiRetention) addonsTotal += 3999;
    if (customAddons.whatsappSms) addonsTotal += 1999;
    if (customAddons.brandedApp) addonsTotal += 6999;
    if (customAddons.multiBranchRoaming) addonsTotal += 1999;
    if (customAddons.prioritySupport247) addonsTotal += 4999;
    if (customAddons.customReporting) addonsTotal += 1999;

    const rawMonthly = base + memberCost + staffCost + locationCost + addonsTotal;
    const finalMonthly = Math.round(rawMonthly);
    const annualTotal = Math.round(finalMonthly * 12 * 0.8); // 20% discount on annual
    const effectiveMonthlyAnnual = Math.round(annualTotal / 12);
    const costPerMember = (finalMonthly / (customMembers || 1)).toFixed(1);

    return {
      monthly: finalMonthly,
      annualTotal,
      effectiveMonthlyAnnual,
      costPerMember,
      breakdown: {
        base,
        memberCost: Math.round(memberCost),
        staffCost,
        locationCost,
        addonsTotal,
      },
    };
  };

  const currentPricing = calculatePricing();

  // Load a preset into the customizer
  const applyPackageToCustomizer = (pkg: SaaSPackage) => {
    setCustomMembers(pkg.maxMembers);
    setCustomStaff(pkg.maxStaff);
    setCustomLocations(pkg.maxLocations);
    setCustomAddons({
      qrHardware: pkg.features.qrTurnstileGate,
      aiRetention: pkg.features.aiChurnPrediction,
      whatsappSms: pkg.features.whatsappSmsAutomation,
      brandedApp: pkg.features.brandedMemberApp,
      multiBranchRoaming: pkg.features.multiBranchRoaming,
      prioritySupport247: pkg.features.prioritySupport247,
      customReporting: pkg.features.customReporting,
    });
    showToast('Package Loaded into Engine', `Applied "${pkg.name}" parameters to customizer`, 'info');
  };

  // Push current customizer settings to License Generator
  const pushToGenerator = () => {
    setGenMembers(customMembers);
    setGenStaff(customStaff);
    setGenLocations(customLocations);
    setGenTier(`Custom (${customMembers.toLocaleString()} Mems / ${customLocations} Locs)`);

    const features: string[] = [];
    if (customAddons.qrHardware) features.push('QR Turnstile Gate');
    if (customAddons.aiRetention) features.push('AI Churn Prediction');
    if (customAddons.whatsappSms) features.push('WhatsApp Automation');
    if (customAddons.brandedApp) features.push('Branded Member App');
    if (customAddons.multiBranchRoaming) features.push('Multi-Branch Roaming');
    if (customAddons.prioritySupport247) features.push('Priority 24/7 SLA');
    if (customAddons.customReporting) features.push('Custom BI Reporting');
    setSelectedFeatures(features);

    setActiveTab('generator');
    showToast('Transferred to Generator', 'Custom package specs loaded into License Engine', 'success');
  };

  const handleSaveBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlueprintName.trim()) return;

    const newPkg: SaaSPackage = {
      id: `pkg-${Date.now().toString(36)}`,
      name: newBlueprintName.trim(),
      tier: 'custom',
      maxMembers: customMembers,
      maxStaff: customStaff,
      maxLocations: customLocations,
      monthlyPrice: currentPricing.monthly,
      annualDiscountPercent: 20,
      features: {
        qrTurnstileGate: customAddons.qrHardware,
        aiChurnPrediction: customAddons.aiRetention,
        whatsappSmsAutomation: customAddons.whatsappSms,
        brandedMemberApp: customAddons.brandedApp,
        multiBranchRoaming: customAddons.multiBranchRoaming,
        prioritySupport247: customAddons.prioritySupport247,
        customReporting: customAddons.customReporting,
      },
      description: `Custom package supporting ${customMembers.toLocaleString()} members across ${customLocations} locations with ${customStaff} staff seats.`,
    };

    saveSaaSPackage(newPkg);
    setShowSaveBlueprintModal(false);
    setNewBlueprintName('');
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const lic = generateLicense({
      gymName: genGymName,
      contactEmail: genContactEmail,
      adminName: genAdminName,
      tier: genTier,
      maxMembers: genMembers,
      maxStaff: genStaff,
      maxLocations: genLocations,
      durationMonths: genDurationMonths,
      features: selectedFeatures,
      hardwareBinding: genHardwareBinding,
    });
    setGeneratedResult(lic);
  };

  const handleDownloadCertificate = (license: SaaSLicense) => {
    const payload = {
      $schema: 'https://gymify.cloud/schemas/v2/license.json',
      system: 'Gymify Next-Gen Operating System',
      licenseId: license.id,
      licenseKey: license.licenseKey,
      organization: license.gymName,
      contactEmail: license.contactEmail,
      issuedTo: license.adminName,
      tier: license.tier,
      quotas: {
        maxMembers: license.maxMembers,
        maxStaff: license.maxStaff,
        maxLocations: license.maxLocations,
      },
      validity: {
        issuedAt: license.issueDate,
        expiresAt: license.expiryDate,
        status: license.status,
      },
      hardwareBinding: license.hardwareBinding,
      entitlements: license.features,
      cryptographicSignature: license.signature,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gymos-license-${license.licenseKey.slice(0, 16)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Certificate Downloaded', `Saved ${link.download}`, 'success');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', `${label}: ${text.slice(0, 24)}...`, 'info');
  };

  // Filtered Licenses supporting tenant-wise license and status of operation
  const filteredLicenses = saasLicenses.filter((lic) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      lic.gymName.toLowerCase().includes(q) ||
      lic.licenseKey.toLowerCase().includes(q) ||
      lic.contactEmail.toLowerCase().includes(q) ||
      lic.adminName.toLowerCase().includes(q) ||
      (lic.hardwareBinding && lic.hardwareBinding.toLowerCase().includes(q));

    const matchesTenant = tenantFilter === 'all' || lic.id === tenantFilter || lic.gymName === tenantFilter;
    const matchesTier = tierFilter === 'all' || lic.tier.toLowerCase().includes(tierFilter.toLowerCase());
    const matchesLicenseStatus = licenseStatusFilter === 'all' || lic.status === licenseStatusFilter;
    const matchesOperationStatus = operationStatusFilter === 'all' || lic.operationStatus === operationStatusFilter;

    return matchesSearch && matchesTenant && matchesTier && matchesLicenseStatus && matchesOperationStatus;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-8 text-on-surface">
      {/* Super Admin Command Center Top Bar */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-3xl p-6 border border-primary/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-xs font-semibold uppercase tracking-wider border border-primary/30">
                SYSTEM ROOT SUPERADMIN
              </span>
              <span className="text-xs text-on-surface-variant font-mono">
                Instance #POTQE-CLOUD-EAST1
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-headline font-bold text-on-surface tracking-tight">
              SaaS Engine &amp; License Provisioning Center
            </h1>
            <p className="text-xs text-on-surface-variant mt-1 max-w-2xl leading-relaxed">
              Configure multi-tenant SaaS tiers based on gym member limits, staff quotas, and branch locations. Issue cryptographically verified hardware licenses for turnstile gate controllers.
            </p>
          </div>

          {/* Quick Platform Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveScreen('dashboard');
                showToast('Switched to Tenant View', 'Viewing Downtown Branch operations as superadmin', 'info');
              }}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary">store</span>
              <span>Open Gym Tenant View</span>
            </button>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-error/15 hover:bg-error/25 border border-error/30 text-xs font-semibold text-error flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Global SaaS Platform Telemetry KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/30">
          <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium">Platform SaaS MRR</div>
            <div className="text-xl font-headline font-bold text-primary mt-1 font-mono">₹1,24,50,000</div>
            <div className="text-[10px] text-primary/80 flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              <span>+18.4% this quarter</span>
            </div>
          </div>

          <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium">Active Tenant Clubs</div>
            <div className="text-xl font-headline font-bold text-on-surface mt-1 font-mono">
              {saasLicenses.length + 43} Franchises
            </div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">
              Across 112 locations
            </div>
          </div>

          <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium">Total End-Members</div>
            <div className="text-xl font-headline font-bold text-on-surface mt-1 font-mono">
              64,280 Members
            </div>
            <div className="text-[10px] text-tertiary mt-0.5">
              31,450 daily check-ins
            </div>
          </div>

          <div className="bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20">
            <div className="text-[11px] text-on-surface-variant font-medium">Hardware Gate Hubs</div>
            <div className="text-xl font-headline font-bold text-on-surface mt-1 font-mono">
              164 Online
            </div>
            <div className="text-[10px] text-primary/90 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>Optical QR relays 100% active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'packages'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>1. Package Customisation (SaaS Pricing)</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'generator'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">key</span>
          <span>2. License Generation Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('landing-cms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'landing-cms'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">web</span>
          <span>3. Landing Page CMS &amp; Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'tenants'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
          <span>4. Tenant License Registry ({saasLicenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">monitoring</span>
          <span>4. Hardware Hubs &amp; Audit Pings</span>
        </button>

        <button
          onClick={() => setActiveTab('databases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'databases'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">database</span>
          <span>5. Tenant DB Engines (PostgreSQL &amp; MongoDB)</span>
        </button>

        <button
          onClick={() => setActiveTab('google-sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'google-sheets'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
          <span>6. Google Sheets Linking &amp; Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('hardware-keys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'hardware-keys'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">developer_board</span>
          <span>7. Turnstile Hardware Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('jwt-security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeTab === 'jwt-security'
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>8. JWT &amp; Security Manager</span>
        </button>
      </div>

      {/* TAB 1: PACKAGE CUSTOMISATION */}
      {activeTab === 'packages' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: Sliders & Options */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">sliders</span>
                    <span>SaaS Quota Scaling Engine</span>
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Adjust member volume, staff seats, and location count to generate custom pricing or enterprise proposals.
                  </p>
                </div>

                {/* 1. Gym Members Slider */}
                <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-on-surface">Gym Active Members Quota</span>
                      <div className="text-[11px] text-on-surface-variant">Database records, barcode/QR profiles, check-in history</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={100}
                        max={50000}
                        step={100}
                        value={customMembers}
                        onChange={(e) => setCustomMembers(Math.max(100, parseInt(e.target.value) || 100))}
                        className="w-24 px-2.5 py-1 bg-surface-container-high border border-outline-variant/50 rounded-lg text-sm text-right font-mono font-bold text-primary focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-on-surface-variant font-medium">members</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={15000}
                    step={100}
                    value={customMembers}
                    onChange={(e) => setCustomMembers(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>100</span>
                    <span>1,500 (Pro)</span>
                    <span>5,000 (Elite)</span>
                    <span>15,000+ (Franchise)</span>
                  </div>
                </div>

                {/* 2. Staff Accounts Slider */}
                <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-on-surface">Staff &amp; Trainer Licenses</span>
                      <div className="text-[11px] text-on-surface-variant">Front desk check-in, geofence GPS attendance, PT rosters</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={250}
                        value={customStaff}
                        onChange={(e) => setCustomStaff(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2.5 py-1 bg-surface-container-high border border-outline-variant/50 rounded-lg text-sm text-right font-mono font-bold text-primary focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-on-surface-variant font-medium">seats</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    step={1}
                    value={customStaff}
                    onChange={(e) => setCustomStaff(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>1 seat</span>
                    <span>12 seats</span>
                    <span>30 seats</span>
                    <span>60+ seats</span>
                  </div>
                </div>

                {/* 3. Number of Locations Slider */}
                <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-on-surface">Number of Gym Locations / Branches</span>
                      <div className="text-[11px] text-on-surface-variant">Multi-facility synchronization, roaming access, regional billing</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={customLocations}
                        onChange={(e) => setCustomLocations(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2.5 py-1 bg-surface-container-high border border-outline-variant/50 rounded-lg text-sm text-right font-mono font-bold text-primary focus:outline-none focus:border-primary"
                      />
                      <span className="text-xs text-on-surface-variant font-medium">clubs</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={customLocations}
                    onChange={(e) => setCustomLocations(parseInt(e.target.value))}
                    className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                    <span>1 Club (Single)</span>
                    <span>3 Clubs (Metro)</span>
                    <span>8 Clubs (State)</span>
                    <span>20+ (Franchise)</span>
                  </div>
                </div>

                {/* 4. Add-on Feature Modules */}
                <div>
                  <span className="text-xs font-bold text-on-surface block mb-3">
                    Feature Modules &amp; Hardware Drivers
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20">
                      <input
                        type="checkbox"
                        checked={customAddons.qrHardware}
                        onChange={(e) => setCustomAddons({ ...customAddons, qrHardware: e.target.checked })}
                        className="mt-0.5 rounded border-outline-variant/50 bg-surface text-primary"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-on-surface">QR &amp; Turnstile Gateway</div>
                        <div className="text-[11px] text-on-surface-variant">+₹2,499/loc/mo (Hardware Relay)</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20">
                      <input
                        type="checkbox"
                        checked={customAddons.aiRetention}
                        onChange={(e) => setCustomAddons({ ...customAddons, aiRetention: e.target.checked })}
                        className="mt-0.5 rounded border-outline-variant/50 bg-surface text-primary"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-on-surface">AI Churn Retention Engine</div>
                        <div className="text-[11px] text-on-surface-variant">+₹3,999/mo (Predictive scoring)</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20">
                      <input
                        type="checkbox"
                        checked={customAddons.whatsappSms}
                        onChange={(e) => setCustomAddons({ ...customAddons, whatsappSms: e.target.checked })}
                        className="mt-0.5 rounded border-outline-variant/50 bg-surface text-primary"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-on-surface">WhatsApp / SMS Reminders</div>
                        <div className="text-[11px] text-on-surface-variant">+₹1,999/mo (Auto-renew &amp; overdue)</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20">
                      <input
                        type="checkbox"
                        checked={customAddons.brandedApp}
                        onChange={(e) => setCustomAddons({ ...customAddons, brandedApp: e.target.checked })}
                        className="mt-0.5 rounded border-outline-variant/50 bg-surface text-primary"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-on-surface">Branded Member Mobile App</div>
                        <div className="text-[11px] text-on-surface-variant">+₹6,999/mo (iOS &amp; Android)</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20">
                      <input
                        type="checkbox"
                        checked={customAddons.multiBranchRoaming}
                        onChange={(e) => setCustomAddons({ ...customAddons, multiBranchRoaming: e.target.checked })}
                        className="mt-0.5 rounded border-outline-variant/50 bg-surface text-primary"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-on-surface">Cross-Gym Roaming Engine</div>
                        <div className="text-[11px] text-on-surface-variant">+₹1,999/mo (Universal QR pass)</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20">
                      <input
                        type="checkbox"
                        checked={customAddons.prioritySupport247}
                        onChange={(e) => setCustomAddons({ ...customAddons, prioritySupport247: e.target.checked })}
                        className="mt-0.5 rounded border-outline-variant/50 bg-surface text-primary"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-on-surface">24/7 Dedicated SLA Manager</div>
                        <div className="text-[11px] text-on-surface-variant">+₹4,999/mo (15m response guarantee)</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Real-Time Pricing Card & Actions */}
            <div className="lg:col-span-5 space-y-6">
              {/* Dynamic Pricing Engine Card */}
              <div className="bg-gradient-to-br from-surface-container to-surface-container-high p-6 rounded-3xl border border-primary/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">calculate</span>
                    <span>Live SaaS Calculation Engine</span>
                  </div>
                  {/* Billing cycle pill toggle */}
                  <div className="flex items-center p-0.5 rounded-lg bg-surface border border-outline-variant/40">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        billingCycle === 'monthly' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('annual')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 ${
                        billingCycle === 'annual' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      <span>Annual</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-tertiary text-on-tertiary font-bold">-20%</span>
                    </button>
                  </div>
                </div>

                {/* Big Price Display */}
                <div className="my-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-headline font-bold text-on-surface font-mono">
                      ₹{billingCycle === 'monthly' ? currentPricing.monthly.toLocaleString('en-IN') : currentPricing.effectiveMonthlyAnnual.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-on-surface-variant font-medium">/ month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-xs text-primary font-mono mt-1">
                      Billed annually at ₹{currentPricing.annualTotal.toLocaleString('en-IN')}/yr (saves ₹{(currentPricing.monthly * 12 - currentPricing.annualTotal).toLocaleString('en-IN')})
                    </div>
                  )}
                  <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface font-mono text-[11px]">
                      ~₹{currentPricing.costPerMember} / active member / mo
                    </span>
                    <span>• High margin SaaS tier</span>
                  </div>
                </div>

                {/* Pricing Component Breakdown */}
                <div className="space-y-2 pt-4 border-t border-outline-variant/30 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Base Platform Hub:</span>
                    <span className="font-mono text-on-surface">₹{currentPricing.breakdown.base.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Member Quota ({customMembers.toLocaleString()} members):</span>
                    <span className="font-mono text-on-surface">₹{currentPricing.breakdown.memberCost.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Staff Accounts ({customStaff} seats @ ₹499):</span>
                    <span className="font-mono text-on-surface">₹{currentPricing.breakdown.staffCost.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Branch Locations ({customLocations} clubs):</span>
                    <span className="font-mono text-on-surface">₹{currentPricing.breakdown.locationCost.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Enabled Modules &amp; Gate Drivers:</span>
                    <span className="font-mono text-on-surface">₹{currentPricing.breakdown.addonsTotal.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-6 space-y-2.5">
                  <button
                    onClick={pushToGenerator}
                    className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>Generate Instant License From This Spec</span>
                  </button>

                  <button
                    onClick={() => setShowSaveBlueprintModal(true)}
                    className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-outline-variant/40 text-on-surface font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
                    <span>Save as Custom Package Blueprint</span>
                  </button>
                </div>
              </div>

              {/* Current Active Tenant Quotas Card */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-on-surface">Active Tenant Instance Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-semibold">
                    {activeTenantLicense?.status || 'Active'}
                  </span>
                </div>
                <div className="text-xs text-on-surface font-semibold">{activeTenantLicense?.gymName || 'Apex Fitness Platform'}</div>
                <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">{activeTenantLicense?.tier || 'Enterprise'}</div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-outline-variant/20 text-center">
                  <div>
                    <div className="text-[10px] text-on-surface-variant">Member Cap</div>
                    <div className="text-xs font-mono font-bold text-primary">{(activeTenantLicense?.maxMembers ?? 10000).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant">Staff Seats</div>
                    <div className="text-xs font-mono font-bold text-on-surface">{activeTenantLicense?.maxStaff ?? 15}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant">Locations</div>
                    <div className="text-xs font-mono font-bold text-on-surface">{activeTenantLicense?.maxLocations ?? 3}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standard SaaS Preset Blueprint Catalog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-headline font-bold text-on-surface">
                  SaaS Package Blueprint Catalog
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Select a pre-configured tier to immediately load its parameters or issue licenses.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {saasPackages.map((pkg) => {
                const isSelected =
                  customMembers === pkg.maxMembers &&
                  customStaff === pkg.maxStaff &&
                  customLocations === pkg.maxLocations;

                return (
                  <div
                    key={pkg.id}
                    className={`p-5 rounded-2xl transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-surface-container-high border-2 border-primary shadow-xl shadow-primary/10'
                        : 'bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary font-mono uppercase">
                          {pkg.tier}
                        </span>
                        {pkg.tier === 'pro' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-headline font-bold text-on-surface">{pkg.name}</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">{pkg.description}</p>

                      <div className="my-4">
                        <span className="text-2xl font-headline font-bold font-mono text-on-surface">
                          ₹{pkg.monthlyPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-on-surface-variant"> / month</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-on-surface border-t border-outline-variant/20 pt-3">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">groups</span>
                          <span>Up to <strong>{pkg.maxMembers.toLocaleString()}</strong> members</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">badge</span>
                          <span><strong>{pkg.maxStaff}</strong> staff &amp; trainer seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">store</span>
                          <span><strong>{pkg.maxLocations}</strong> gym location{pkg.maxLocations > 1 ? 's' : ''}</span>
                        </div>
                        {pkg.features.aiChurnPrediction && (
                          <div className="flex items-center gap-1.5 text-tertiary">
                            <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                            <span>AI Churn Intelligence</span>
                          </div>
                        )}
                        {pkg.features.qrTurnstileGate && (
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
                            <span>QR Optical Gate Controller</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center gap-2">
                      <button
                        onClick={() => applyPackageToCustomizer(pkg)}
                        className="flex-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-semibold text-on-surface border border-outline-variant/40 transition-all text-center"
                      >
                        Load Spec
                      </button>
                      {pkg.tier === 'custom' && (
                        <button
                          onClick={() => deleteSaaSPackage(pkg.id)}
                          className="p-1.5 rounded-lg text-error hover:bg-error/15 transition-colors"
                          title="Remove custom package"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LICENSE GENERATION ENGINE */}
      {activeTab === 'generator' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: Generator Input Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleGenerateLicense} className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 shadow-xl space-y-5">
                <div>
                  <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">key</span>
                    <span>License Key &amp; Cryptographic Signer</span>
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Mint digital license tokens signed with SHA-256 for physical hardware gates and gym operating terminals.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Gym Franchise / Tenant Name
                    </label>
                    <input
                      type="text"
                      required
                      value={genGymName}
                      onChange={(e) => setGenGymName(e.target.value)}
                      placeholder="e.g. Iron Vault Fitness LLC"
                      className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Billing Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={genContactEmail}
                      onChange={(e) => setGenContactEmail(e.target.value)}
                      placeholder="admin@fitnesscorp.com"
                      className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Authorized Director / Signer
                    </label>
                    <input
                      type="text"
                      required
                      value={genAdminName}
                      onChange={(e) => setGenAdminName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Subscription Tier Label
                    </label>
                    <input
                      type="text"
                      required
                      value={genTier}
                      onChange={(e) => setGenTier(e.target.value)}
                      placeholder="Pro / Elite / Custom"
                      className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Quota Limits Inputs */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-surface-container rounded-2xl border border-outline-variant/20">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Max Members</label>
                    <input
                      type="number"
                      min={100}
                      value={genMembers}
                      onChange={(e) => setGenMembers(parseInt(e.target.value) || 100)}
                      className="w-full px-2.5 py-1.5 bg-surface-container-high border border-outline-variant/40 rounded-lg text-xs font-mono font-bold text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Max Staff Seats</label>
                    <input
                      type="number"
                      min={1}
                      value={genStaff}
                      onChange={(e) => setGenStaff(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-surface-container-high border border-outline-variant/40 rounded-lg text-xs font-mono font-bold text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">Max Locations</label>
                    <input
                      type="number"
                      min={1}
                      value={genLocations}
                      onChange={(e) => setGenLocations(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-surface-container-high border border-outline-variant/40 rounded-lg text-xs font-mono font-bold text-on-surface"
                    />
                  </div>
                </div>

                {/* Term / Duration and Hardware Binding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      License Term / Duration
                    </label>
                    <select
                      value={genDurationMonths}
                      onChange={(e) => setGenDurationMonths(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value={1}>1 Month (Monthly Rolling)</option>
                      <option value={3}>3 Months (Quarterly Trial)</option>
                      <option value={12}>1 Year (Commercial Standard)</option>
                      <option value={24}>2 Years (Multi-Year Enterprise)</option>
                      <option value={36}>3 Years (Franchise Long-Term)</option>
                      <option value={120}>10 Years (Perpetual Appliance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-1">
                      Hardware Controller Binding (MAC/UID)
                    </label>
                    <input
                      type="text"
                      value={genHardwareBinding}
                      onChange={(e) => setGenHardwareBinding(e.target.value)}
                      placeholder="e.g. HW-MAC-5C:96:56:88:B3:01"
                      className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Enabled Entitlements checklist */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase mb-2">
                    Enabled License Entitlements
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      'QR Turnstile Gate',
                      'AI Churn Prediction',
                      'WhatsApp Automation',
                      'Branded Member App',
                      'Multi-Branch Roaming',
                      'Priority 24/7 SLA',
                      'Custom BI Reporting',
                    ].map((feature) => {
                      const isChecked = selectedFeatures.includes(feature);
                      return (
                        <label
                          key={feature}
                          className="flex items-center gap-2 p-2 rounded-lg bg-surface-container border border-outline-variant/20 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFeatures([...selectedFeatures, feature]);
                              } else {
                                setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
                              }
                            }}
                            className="rounded border-outline-variant/50 text-primary"
                          />
                          <span className={isChecked ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                            {feature}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Mint &amp; Sign Cryptographic License Key</span>
                </button>
              </form>
            </div>

            {/* Right 5 Cols: Output Certificate Card */}
            <div className="lg:col-span-5 space-y-6">
              {generatedResult ? (
                <div className="bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-6 rounded-3xl border border-primary/50 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface">Gymify Digital Certificate</div>
                        <div className="text-[10px] text-primary font-mono">STATUS: ISSUED &amp; VERIFIED</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface border border-outline-variant/30 font-mono text-on-surface-variant">
                      v2.4
                    </span>
                  </div>

                  {/* License Key Box */}
                  <div>
                    <label className="text-[10px] font-semibold text-on-surface-variant uppercase font-mono tracking-wider block mb-1">
                      License Key
                    </label>
                    <div className="p-3 bg-surface rounded-xl border border-outline-variant/40 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-primary break-all">
                        {generatedResult.licenseKey}
                      </span>
                      <button
                        onClick={() => copyToClipboard(generatedResult.licenseKey, 'License Key')}
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors shrink-0"
                        title="Copy Key"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                    </div>
                  </div>

                  {/* License Metadata */}
                  <div className="space-y-2 text-xs p-3.5 bg-surface/60 rounded-xl border border-outline-variant/20">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Organization:</span>
                      <span className="font-semibold text-on-surface">{generatedResult.gymName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Admin / Contact:</span>
                      <span className="font-mono text-on-surface">{generatedResult.contactEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Plan Tier:</span>
                      <span className="font-semibold text-primary">{generatedResult.tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Quotas:</span>
                      <span className="font-mono text-on-surface">
                        {generatedResult.maxMembers.toLocaleString()} mems • {generatedResult.maxStaff} staff • {generatedResult.maxLocations} locs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Valid Until:</span>
                      <span className="font-mono text-on-surface">{generatedResult.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">HW Binding:</span>
                      <span className="font-mono text-[10px] text-on-surface-variant">{generatedResult.hardwareBinding}</span>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div>
                    <label className="text-[10px] font-semibold text-on-surface-variant uppercase font-mono tracking-wider block mb-1">
                      Cryptographic Signature (SHA-256)
                    </label>
                    <div className="p-2.5 bg-surface/80 rounded-lg border border-outline-variant/20 text-[10px] font-mono text-on-surface-variant break-all">
                      {generatedResult.signature}
                    </div>
                  </div>

                  {/* Actions: Download Certificate & Apply to Tenant */}
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => handleDownloadCertificate(generatedResult)}
                      className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px] text-tertiary">download</span>
                      <span>Download .JSON License Certificate</span>
                    </button>

                    <button
                      onClick={() => applyLicenseToTenant(generatedResult)}
                      className="w-full py-2.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-xs font-semibold text-primary flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                      <span>Activate on Current Tenant (Downtown Club)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-low p-8 rounded-3xl border border-dashed border-outline-variant/40 text-center flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
                    <span className="material-symbols-outlined text-[28px]">token</span>
                  </div>
                  <h3 className="text-sm font-headline font-bold text-on-surface">No License Minted Yet</h3>
                  <p className="text-xs text-on-surface-variant max-w-xs mt-1">
                    Fill out the client specifications on the left and click "Mint &amp; Sign" to generate a verifiable hardware token.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TENANT LICENSE & OPERATIONS REGISTRY */}
      {activeTab === 'tenants' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono text-[10px] font-bold uppercase tracking-wider">
                  MULTI-TENANT TELEMETRY
                </span>
                <span className="text-xs text-on-surface-variant">•</span>
                <span className="text-xs text-on-surface-variant font-mono">Live Hardware Relay Matrix</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                Tenant License &amp; Status of Operation Registry
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Filter and audit tenant-wise commercial licenses, turnstile hardware states, and real-time operational health.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('generator')}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Issue New Tenant License</span>
            </button>
          </div>

          {/* Quick Filter KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Total Tenants */}
            <div
              onClick={() => {
                setTenantFilter('all');
                setOperationStatusFilter('all');
                setLicenseStatusFilter('all');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                operationStatusFilter === 'all' && tenantFilter === 'all' && licenseStatusFilter === 'all'
                  ? 'bg-surface-container-high border-primary/60 shadow-md shadow-primary/10'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span className="text-[11px] font-semibold uppercase">Total Tenants</span>
                <span className="material-symbols-outlined text-[18px] text-primary">domain</span>
              </div>
              <div className="text-2xl font-headline font-bold font-mono text-on-surface">
                {saasLicenses.length}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">All Franchises</div>
            </div>

            {/* Online & Operational */}
            <div
              onClick={() => {
                setOperationStatusFilter('Online & Operational');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                operationStatusFilter === 'Online & Operational'
                  ? 'bg-surface-container-high border-primary/60 shadow-md shadow-primary/10'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span className="text-[11px] font-semibold uppercase">Operational</span>
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              </div>
              <div className="text-2xl font-headline font-bold font-mono text-primary">
                {saasLicenses.filter((l) => l.operationStatus === 'Online & Operational').length}
              </div>
              <div className="text-[10px] text-primary font-semibold mt-1">Gates Armed &amp; Synced</div>
            </div>

            {/* Degraded Latency */}
            <div
              onClick={() => {
                setOperationStatusFilter('Degraded Latency');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                operationStatusFilter === 'Degraded Latency'
                  ? 'bg-surface-container-high border-amber-500/60 shadow-md shadow-amber-500/10'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span className="text-[11px] font-semibold uppercase">Degraded Ping</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              </div>
              <div className="text-2xl font-headline font-bold font-mono text-amber-400">
                {saasLicenses.filter((l) => l.operationStatus === 'Degraded Latency').length}
              </div>
              <div className="text-[10px] text-amber-400/80 font-semibold mt-1">High Ping (&gt;150ms)</div>
            </div>

            {/* Maintenance Mode */}
            <div
              onClick={() => {
                setOperationStatusFilter('Maintenance Mode');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                operationStatusFilter === 'Maintenance Mode'
                  ? 'bg-surface-container-high border-orange-500/60 shadow-md shadow-orange-500/10'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span className="text-[11px] font-semibold uppercase">Maintenance</span>
                <span className="material-symbols-outlined text-[18px] text-orange-400">engineering</span>
              </div>
              <div className="text-2xl font-headline font-bold font-mono text-orange-400">
                {saasLicenses.filter((l) => l.operationStatus === 'Maintenance Mode').length}
              </div>
              <div className="text-[10px] text-orange-400/80 font-semibold mt-1">Firmware / Offline Bypass</div>
            </div>

            {/* Hardware Locked / Suspended */}
            <div
              onClick={() => {
                setOperationStatusFilter('Hardware Locked');
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                operationStatusFilter === 'Hardware Locked'
                  ? 'bg-surface-container-high border-error/60 shadow-md shadow-error/10'
                  : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                <span className="text-[11px] font-semibold uppercase">Locked / Suspended</span>
                <span className="material-symbols-outlined text-[18px] text-error">lock</span>
              </div>
              <div className="text-2xl font-headline font-bold font-mono text-error">
                {saasLicenses.filter((l) => l.operationStatus === 'Hardware Locked' || l.status === 'Suspended').length}
              </div>
              <div className="text-[10px] text-error/80 font-semibold mt-1">Turnstiles Disabled</div>
            </div>
          </div>

          {/* Granular Filtering Control Toolbar */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <div className="text-xs font-semibold text-on-surface flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">filter_alt</span>
                <span>Filter Tenant-Wise Licence &amp; Status of Operation</span>
              </div>

              {(searchQuery || tenantFilter !== 'all' || tierFilter !== 'all' || licenseStatusFilter !== 'all' || operationStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTenantFilter('all');
                    setTierFilter('all');
                    setLicenseStatusFilter('all');
                    setOperationStatusFilter('all');
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-mono font-medium"
                >
                  <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {/* 1. Free-text Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search gym, key, MAC, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              {/* 2. Tenant-Wise Franchise Filter */}
              <div>
                <select
                  value={tenantFilter}
                  onChange={(e) => setTenantFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary font-medium"
                >
                  <option value="all">🏢 All Tenants (Tenant-Wise)</option>
                  {saasLicenses.map((lic) => (
                    <option key={lic.id} value={lic.id}>
                      {lic.gymName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. License Tier Filter */}
              <div>
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">⭐ All License Tiers</option>
                  <option value="Starter">Starter Club</option>
                  <option value="Pro">Pro Multi-Gym</option>
                  <option value="Elite">Elite Powerhouse</option>
                  <option value="Enterprise">Franchise Enterprise</option>
                  <option value="Custom">Custom Quota</option>
                </select>
              </div>

              {/* 4. Licence Validity / Status Filter */}
              <div>
                <select
                  value={licenseStatusFilter}
                  onChange={(e) => setLicenseStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="all">📜 All Licence Statuses</option>
                  <option value="Active">Licence Active Only</option>
                  <option value="Expiring Soon">Expiring Soon (&lt; 60 Days)</option>
                  <option value="Suspended">Licence Suspended</option>
                </select>
              </div>

              {/* 5. Status of Operation Filter */}
              <div>
                <select
                  value={operationStatusFilter}
                  onChange={(e) => setOperationStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary font-semibold text-primary"
                >
                  <option value="all">⚡ All Statuses of Operation</option>
                  <option value="Online & Operational">🟢 Online &amp; Operational</option>
                  <option value="Degraded Latency">🟡 Degraded Latency</option>
                  <option value="Maintenance Mode">🟠 Maintenance Mode</option>
                  <option value="Hardware Locked">🔴 Hardware Locked</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary Pill Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-[10px] text-on-surface-variant font-mono uppercase mr-1">Matching:</span>
              <span className="px-2 py-0.5 bg-surface-container-highest rounded-full text-[11px] font-mono font-bold text-on-surface">
                {filteredLicenses.length} of {saasLicenses.length} Tenants
              </span>

              {tenantFilter !== 'all' && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[11px] font-medium flex items-center gap-1">
                  <span>Tenant: {saasLicenses.find(l => l.id === tenantFilter)?.gymName}</span>
                  <span onClick={() => setTenantFilter('all')} className="cursor-pointer font-bold">×</span>
                </span>
              )}

              {operationStatusFilter !== 'all' && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[11px] font-medium flex items-center gap-1">
                  <span>Operation: {operationStatusFilter}</span>
                  <span onClick={() => setOperationStatusFilter('all')} className="cursor-pointer font-bold">×</span>
                </span>
              )}

              {licenseStatusFilter !== 'all' && (
                <span className="px-2 py-0.5 bg-tertiary/20 text-tertiary rounded-full text-[11px] font-medium flex items-center gap-1">
                  <span>Licence: {licenseStatusFilter}</span>
                  <span onClick={() => setLicenseStatusFilter('all')} className="cursor-pointer font-bold">×</span>
                </span>
              )}

              {tierFilter !== 'all' && (
                <span className="px-2 py-0.5 bg-surface-container-high rounded-full text-[11px] font-medium flex items-center gap-1">
                  <span>Tier: {tierFilter}</span>
                  <span onClick={() => setTierFilter('all')} className="cursor-pointer font-bold">×</span>
                </span>
              )}
            </div>
          </div>

          {/* Licenses & Operations Table */}
          <div className="bg-surface-container-low rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                    <th className="py-3 px-4">Tenant Franchise &amp; Hub</th>
                    <th className="py-3 px-4">Licence Spec &amp; Tier</th>
                    <th className="py-3 px-4">Status of Operation</th>
                    <th className="py-3 px-4">Member Quota</th>
                    <th className="py-3 px-4">Branches</th>
                    <th className="py-3 px-4">Licence Validity</th>
                    <th className="py-3 px-4 text-right">Superadmin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 block mb-2">
                          search_off
                        </span>
                        <div className="text-sm font-semibold">No Tenants Match the Selected Filters</div>
                        <div className="text-xs text-on-surface-variant/80 mt-1">
                          Try resetting the tenant-wise licence or status of operation filters above.
                        </div>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setTenantFilter('all');
                            setTierFilter('all');
                            setLicenseStatusFilter('all');
                            setOperationStatusFilter('all');
                          }}
                          className="mt-3 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredLicenses.map((lic) => {
                      const usagePercent = Math.min(100, Math.round((lic.currentMembersUsed / lic.maxMembers) * 100));
                      const isCurrentTenant = lic.id === activeTenantLicense?.id;

                      return (
                        <tr key={lic.id} className="hover:bg-surface-container/60 transition-colors">
                          {/* Tenant & Cluster Hub */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-on-surface text-sm">{lic.gymName}</span>
                              {isCurrentTenant && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary font-mono font-bold">
                                  CURRENT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">{lic.contactEmail}</div>
                            <div className="text-[10px] text-on-surface-variant/80 mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-primary">hub</span>
                              <span>{lic.clusterHub || 'Asia-South (Mumbai Hub)'}</span>
                            </div>
                          </td>

                          {/* Licence Spec & Key */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] font-bold text-primary flex items-center gap-1.5">
                              <span>{lic.licenseKey.slice(0, 16)}...</span>
                              <button
                                onClick={() => copyToClipboard(lic.licenseKey, 'License Key')}
                                className="text-on-surface-variant hover:text-primary transition-colors"
                                title="Copy Full Key"
                              >
                                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-semibold">
                                {lic.tier}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                                  lic.status === 'Active'
                                    ? 'bg-primary/20 text-primary'
                                    : lic.status === 'Expiring Soon'
                                    ? 'bg-amber-400/20 text-amber-400'
                                    : 'bg-error/20 text-error'
                                }`}
                              >
                                {lic.status}
                              </span>
                            </div>
                          </td>

                          {/* Status of Operation */}
                          <td className="py-3 px-4">
                            <div className="space-y-1.5">
                              {/* Status Badge with LED */}
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    lic.operationStatus === 'Online & Operational'
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                      : lic.operationStatus === 'Degraded Latency'
                                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                      : lic.operationStatus === 'Maintenance Mode'
                                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                      : 'bg-error/15 text-error border-error/30'
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      lic.operationStatus === 'Online & Operational'
                                        ? 'bg-emerald-400 animate-pulse'
                                        : lic.operationStatus === 'Degraded Latency'
                                        ? 'bg-amber-400'
                                        : lic.operationStatus === 'Maintenance Mode'
                                        ? 'bg-orange-400'
                                        : 'bg-error'
                                    }`}
                                  ></span>
                                  <span>{lic.operationStatus || 'Online & Operational'}</span>
                                </span>
                              </div>

                              {/* Telemetry Numbers */}
                              <div className="text-[10px] text-on-surface-variant flex items-center gap-2 font-mono">
                                <span>Turnstiles: <strong className="text-on-surface">{lic.turnstilesOnline ?? 4}/{lic.totalTurnstiles ?? 4} Armed</strong></span>
                                <span>•</span>
                                <span>Ping: <strong className={lic.syncLatencyMs && lic.syncLatencyMs > 100 ? 'text-amber-400' : 'text-primary'}>{lic.syncLatencyMs ?? 14}ms</strong></span>
                              </div>

                              {/* Direct Superadmin Operation Switcher */}
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-on-surface-variant font-mono uppercase">Set Op:</span>
                                <select
                                  value={lic.operationStatus || 'Online & Operational'}
                                  onChange={(e) => updateOperationStatus(lic.id, e.target.value as OperationStatus)}
                                  className="text-[10px] py-0.5 px-1.5 bg-surface-container rounded-lg border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary font-medium"
                                  title="Change Status of Operation"
                                >
                                  <option value="Online & Operational">Online &amp; Operational</option>
                                  <option value="Degraded Latency">Degraded Latency</option>
                                  <option value="Maintenance Mode">Maintenance Mode</option>
                                  <option value="Hardware Locked">Hardware Locked</option>
                                </select>
                              </div>
                            </div>
                          </td>

                          {/* Member Quota */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                              <span className="font-bold text-on-surface">{lic.currentMembersUsed.toLocaleString()}</span>
                              <span className="text-on-surface-variant">/ {lic.maxMembers.toLocaleString()}</span>
                            </div>
                            <div className="w-28 bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  usagePercent > 90 ? 'bg-error' : usagePercent > 75 ? 'bg-amber-400' : 'bg-primary'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-mono">{usagePercent}% utilized</span>
                          </td>

                          {/* Branches */}
                          <td className="py-3 px-4 font-mono">
                            <span className="font-bold text-on-surface">{lic.maxLocations}</span>
                            <span className="text-on-surface-variant"> hubs</span>
                          </td>

                          {/* Licence Validity */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-on-surface font-semibold">{lic.expiryDate}</div>
                            <div className="text-[10px] text-on-surface-variant">Issued: {lic.issueDate}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Audit Telemetry Modal */}
                              <button
                                onClick={() => setSelectedAuditLicense(lic)}
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary transition-colors"
                                title="Inspect Full Telemetry & Cryptographic Token"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>

                              {/* Download Token */}
                              <button
                                onClick={() => handleDownloadCertificate(lic)}
                                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                                title="Download JSON License Token"
                              >
                                <span className="material-symbols-outlined text-[16px]">download</span>
                              </button>

                              {/* Suspend / Reactivate */}
                              <button
                                onClick={() => {
                                  const nextStatus = lic.status === 'Active' ? 'Suspended' : 'Active';
                                  updateLicenseStatus(lic.id, nextStatus as any);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  lic.status === 'Active'
                                    ? 'bg-surface-container hover:bg-error/20 text-on-surface-variant hover:text-error'
                                    : 'bg-primary/20 text-primary hover:bg-primary/30'
                                }`}
                                title={lic.status === 'Active' ? 'Suspend License' : 'Reactivate License'}
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {lic.status === 'Active' ? 'pause_circle' : 'play_circle'}
                                </span>
                              </button>

                              {/* Mount */}
                              <button
                                onClick={() => applyLicenseToTenant(lic)}
                                className="px-2 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-semibold text-[11px] transition-colors"
                                title="Mount license on active session"
                              >
                                Mount
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Telemetry Inspector Modal */}
          {selectedAuditLicense && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container-high rounded-3xl border border-outline-variant/40 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">monitoring</span>
                    <div>
                      <h3 className="font-headline font-bold text-base text-on-surface">
                        {selectedAuditLicense.gymName}
                      </h3>
                      <span className="text-[11px] font-mono text-on-surface-variant">
                        Tenant ID: {selectedAuditLicense.id}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAuditLicense(null)}
                    className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Status of Operation Overview */}
                <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface-variant uppercase">Current Status of Operation</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        selectedAuditLicense.operationStatus === 'Online & Operational'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : selectedAuditLicense.operationStatus === 'Degraded Latency'
                          ? 'bg-amber-500/20 text-amber-400'
                          : selectedAuditLicense.operationStatus === 'Maintenance Mode'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-error/20 text-error'
                      }`}
                    >
                      {selectedAuditLicense.operationStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="p-2 bg-surface-container-high rounded-xl">
                      <div className="text-[10px] text-on-surface-variant">TURNSTILES</div>
                      <div className="text-sm font-bold text-primary">
                        {selectedAuditLicense.turnstilesOnline}/{selectedAuditLicense.totalTurnstiles} Armed
                      </div>
                    </div>
                    <div className="p-2 bg-surface-container-high rounded-xl">
                      <div className="text-[10px] text-on-surface-variant">FLOOR OCCUPANCY</div>
                      <div className="text-sm font-bold text-on-surface">
                        {selectedAuditLicense.liveFloorOccupancy} Athletes
                      </div>
                    </div>
                    <div className="p-2 bg-surface-container-high rounded-xl">
                      <div className="text-[10px] text-on-surface-variant">PING LATENCY</div>
                      <div className="text-sm font-bold text-primary">
                        {selectedAuditLicense.syncLatencyMs}ms
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Key & Hardware Binding */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Hardware Controller Binding</label>
                    <div className="p-2.5 bg-surface-container font-mono text-[11px] rounded-xl text-primary mt-1 border border-outline-variant/30 flex items-center justify-between">
                      <span>{selectedAuditLicense.hardwareBinding || 'HW-UNBOUND'}</span>
                      <button
                        onClick={() => copyToClipboard(selectedAuditLicense.hardwareBinding || '', 'Hardware MAC')}
                        className="text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Full License Key</label>
                    <div className="p-2.5 bg-surface-container font-mono text-[11px] rounded-xl text-on-surface mt-1 border border-outline-variant/30 break-all">
                      {selectedAuditLicense.licenseKey}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">SHA-256 Digital Signature</label>
                    <div className="p-2.5 bg-surface-container font-mono text-[10px] rounded-xl text-on-surface-variant mt-1 border border-outline-variant/30 break-all">
                      {selectedAuditLicense.signature}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                  <button
                    onClick={() => handleDownloadCertificate(selectedAuditLicense)}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-xs font-semibold text-on-surface flex items-center gap-1.5 border border-outline-variant/30"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download JSON Token</span>
                  </button>
                  <button
                    onClick={() => setSelectedAuditLicense(null)}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: GLOBAL HARDWARE HUBS & TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">
              Hardware Relay &amp; Scanner Terminal Clusters
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live telemetry pings from physical optical scanners and turnstile microcontrollers across all licensed tenant facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Turnstile Gateway Controller #01</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <div className="text-[11px] text-on-surface-variant font-mono">MAC: 74:D0:2B:99:A1:FE</div>
              <div className="text-xs text-on-surface">Apex Fitness • Downtown Hub</div>
              <div className="text-[10px] text-on-surface-variant">Latency: 12ms • Relays triggered today: 412</div>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Turnstile Gateway Controller #02</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <div className="text-[11px] text-on-surface-variant font-mono">MAC: 00:1B:44:11:3A:B7</div>
              <div className="text-xs text-on-surface">Iron Vault • National HQ</div>
              <div className="text-[10px] text-on-surface-variant">Latency: 18ms • Relays triggered today: 894</div>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Optical QR Pod #03</span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <div className="text-[11px] text-on-surface-variant font-mono">MAC: 3C:07:54:6F:89:C2</div>
              <div className="text-xs text-on-surface">Pulse Cycle • Studio A</div>
              <div className="text-[10px] text-on-surface-variant">Latency: 15ms • Relays triggered today: 168</div>
            </div>
          </div>

          {/* Audit Verification Log Stream */}
          <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">stream</span>
                <span className="text-xs font-bold text-on-surface">Real-Time Heartbeat &amp; License Validation Stream</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-mono">AUTOSYNC ACTIVE</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">[AUTH_OK]</span>
                  <span>License Heartbeat: GOS-PRO-2026-X89K validated</span>
                </div>
                <span className="text-on-surface-variant text-[10px]">Just now</span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">[GATE_PULSE]</span>
                  <span>Relay #04 fired (500ms trigger) - Member #MEM-84920 allowed</span>
                </div>
                <span className="text-on-surface-variant text-[10px]">4s ago</span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="text-tertiary font-bold">[QUOTA_PING]</span>
                  <span>Titan Athletic Franchises: 9,410 / 10,000 members (94.1% capacity)</span>
                </div>
                <span className="text-on-surface-variant text-[10px]">12s ago</span>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">[GEO_VERIFY]</span>
                  <span>Staff GPS attendance check verified within 50m perimeter</span>
                </div>
                <span className="text-on-surface-variant text-[10px]">28s ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TENANT-WISE DATABASES (POSTGRESQL & MONGODB) */}
      {activeTab === 'databases' && (
        <div className="animate-in fade-in duration-200">
          <TenantDatabaseManager />
        </div>
      )}

      {/* TAB 6: GOOGLE SHEETS LIVE LINKING */}
      {activeTab === 'google-sheets' && (
        <div className="animate-in fade-in duration-200">
          <GoogleSheetsManager />
        </div>
      )}

      {/* TAB 7: LANDING PAGE CMS & PRICING */}
      {activeTab === 'landing-cms' && (
        <div className="animate-in fade-in duration-200">
          <LandingCmsManager />
        </div>
      )}

      {/* TAB 8: HARDWARE TURNSTILE TERMINAL KEY MANAGER */}
      {activeTab === 'hardware-keys' && (
        <div className="animate-in fade-in duration-200">
          <TurnstileKeyManager />
        </div>
      )}

      {/* TAB 9: INTERACTIVE JWT & SECURITY MANAGER */}
      {activeTab === 'jwt-security' && (
        <div className="animate-in fade-in duration-200">
          <JwtSecurityManager />
        </div>
      )}

      {/* Save Custom Blueprint Modal */}
      {showSaveBlueprintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-headline font-bold text-on-surface mb-1">
              Save Package Blueprint
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Name this custom plan configuration to add it to your SaaS catalog.
            </p>

            <form onSubmit={handleSaveBlueprint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Plan Blueprint Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Studio Plus"
                  value={newBlueprintName}
                  onChange={(e) => setNewBlueprintName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 bg-surface-container rounded-xl text-xs space-y-1 text-on-surface-variant">
                <div>Members Quota: <strong className="text-on-surface">{customMembers.toLocaleString()}</strong></div>
                <div>Staff Accounts: <strong className="text-on-surface">{customStaff} seats</strong></div>
                <div>Locations: <strong className="text-on-surface">{customLocations} clubs</strong></div>
                <div>Calculated Price: <strong className="text-primary">₹{currentPricing.monthly.toLocaleString('en-IN')}/mo</strong></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveBlueprintModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  Save Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
