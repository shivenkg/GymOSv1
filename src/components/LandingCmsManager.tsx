import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { LandingCMSConfig, LandingCMSPlan } from '../types';

export const LandingCmsManager: React.FC = () => {
  const { landingCms, updateLandingCms, resetLandingCms, setActiveScreen, showToast } = useGym();

  const [cmsConfig, setCmsConfig] = useState<LandingCMSConfig>(landingCms);
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'pricing' | 'preview'>('content');
  const [previewCycle, setPreviewCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(cmsConfig.plans[0]?.id || '');
  const [newFeatureText, setNewFeatureText] = useState<string>('');

  // Sync if context updates from outside
  React.useEffect(() => {
    setCmsConfig(landingCms);
    if (!selectedPlanId && landingCms.plans.length > 0) {
      setSelectedPlanId(landingCms.plans[0].id);
    }
  }, [landingCms]);

  const selectedPlan = cmsConfig.plans.find((p) => p.id === selectedPlanId) || cmsConfig.plans[0];

  const handleUpdatePlan = (updatedFields: Partial<LandingCMSPlan>) => {
    if (!selectedPlan) return;
    const updatedPlans = cmsConfig.plans.map((p) =>
      p.id === selectedPlan.id ? { ...p, ...updatedFields } : p
    );
    setCmsConfig((prev) => ({ ...prev, plans: updatedPlans }));
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim() || !selectedPlan) return;
    const updatedFeatures = [...selectedPlan.features, newFeatureText.trim()];
    handleUpdatePlan({ features: updatedFeatures });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!selectedPlan) return;
    const updatedFeatures = selectedPlan.features.filter((_, i) => i !== index);
    handleUpdatePlan({ features: updatedFeatures });
  };

  const handleAddNewPlan = () => {
    const newId = `plan-custom-${Date.now().toString().slice(-4)}`;
    const newPlan: LandingCMSPlan = {
      id: newId,
      tier: 'pro',
      name: 'Custom Tier',
      monthlyPrice: 5500,
      yearlyPrice: 4400,
      badge: 'Custom Plan',
      description: 'Customized package tailored for special club operations.',
      features: [
        'Up to 500 Active Members',
        'Biometric Turnstile & Facial Recognition Gate',
        'Dynamic WhatsApp UPI QR Payments',
        'Personal Trainer & Schedule Calendar',
        'Member Aadhaar & KYC Verification Vault'
      ],
      isPopular: false
    };
    setCmsConfig((prev) => ({ ...prev, plans: [...prev.plans, newPlan] }));
    setSelectedPlanId(newId);
    showToast('Plan Added', 'New pricing tier created. Configure details below.', 'info');
  };

  const handleDeletePlan = (planId: string) => {
    if (cmsConfig.plans.length <= 1) {
      showToast('Cannot Delete', 'At least one pricing plan must remain on the landing page.', 'warning');
      return;
    }
    const updatedPlans = cmsConfig.plans.filter((p) => p.id !== planId);
    setCmsConfig((prev) => ({ ...prev, plans: updatedPlans }));
    setSelectedPlanId(updatedPlans[0].id);
    showToast('Plan Removed', 'Pricing tier deleted from configuration.', 'info');
  };

  // 20% Annual Discount Automation
  const handleApply20PercentDiscount = (planToUpdate?: LandingCMSPlan) => {
    const target = planToUpdate || selectedPlan;
    if (!target) return;
    const discountedRate = Math.round(target.monthlyPrice * 0.8);
    const updatedPlans = cmsConfig.plans.map((p) =>
      p.id === target.id
        ? { ...p, yearlyPrice: discountedRate, annualDiscountPercent: 20 }
        : p
    );
    setCmsConfig((prev) => ({ ...prev, plans: updatedPlans }));
    showToast('20% Annual Discount Applied', `Annual billing for ${target.name} set to ₹${discountedRate.toLocaleString('en-IN')}/mo (Save 20%).`, 'success');
  };

  const handleApply20PercentToAllPlans = () => {
    const updatedPlans = cmsConfig.plans.map((p) => ({
      ...p,
      yearlyPrice: Math.round(p.monthlyPrice * 0.8),
      annualDiscountPercent: 20,
    }));
    setCmsConfig((prev) => ({
      ...prev,
      globalAnnualDiscountPercent: 20,
      plans: updatedPlans,
    }));
    showToast('20% Applied to All Plans', 'All package tiers have been updated with a 20% annual discount.', 'success');
  };

  const handleSaveAndDeploy = () => {
    updateLandingCms(cmsConfig);
  };

  const handleReset = () => {
    if (window.confirm('Reset all landing page text and pricing tiers back to factory defaults?')) {
      resetLandingCms();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
              SUPERADMIN CMS MODULE
            </span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            Landing Page Content &amp; Pricing Customization
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Live customize hero headlines, announcement banners, value propositions, and dynamic pricing tiers displayed to prospective gym owners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveScreen('landing')}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30 cursor-pointer"
            title="Preview live public landing page"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>View Public Landing</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-error/20 hover:text-error text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-all border border-outline-variant/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAndDeploy}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            <span>Save &amp; Deploy to Landing</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => setActiveSubTab('content')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'content'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">edit_note</span>
          <span>1. Hero Copy &amp; Announcement Banner</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'pricing'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">currency_rupee</span>
          <span>2. Pricing Tiers &amp; Package Features ({cmsConfig.plans.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'preview'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">preview</span>
          <span>3. Interactive Live Preview</span>
        </button>
      </div>

      {/* TAB 1: Hero & Announcement Content */}
      {activeSubTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Form: Hero Headline & Subtitle */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">title</span>
                <span>Hero Section Copy</span>
              </h3>
              <span className="text-[11px] font-mono text-on-surface-variant">Top-of-fold view</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Top Badge Emblem Text
              </label>
              <input
                type="text"
                value={cmsConfig.badgeText}
                onChange={(e) => setCmsConfig({ ...cmsConfig, badgeText: e.target.value })}
                placeholder="e.g. 🇮🇳 India's #1 Local-First Gym Operating System"
                className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Hero Main Headline (Prefix)
              </label>
              <input
                type="text"
                value={cmsConfig.heroHeadline}
                onChange={(e) => setCmsConfig({ ...cmsConfig, heroHeadline: e.target.value })}
                placeholder="e.g. Complete Gym Management Software for Fitness Clubs"
                className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Gradient Highlight Phrase (Emphasized text)
              </label>
              <input
                type="text"
                value={cmsConfig.heroHighlight}
                onChange={(e) => setCmsConfig({ ...cmsConfig, heroHighlight: e.target.value })}
                placeholder="e.g. Runs 100% Offline • Zero SaaS Lock-in"
                className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Hero Subtitle Description
              </label>
              <textarea
                rows={3}
                value={cmsConfig.heroSubtitle}
                onChange={(e) => setCmsConfig({ ...cmsConfig, heroSubtitle: e.target.value })}
                placeholder="Detailed value proposition..."
                className="w-full bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Primary CTA Button Text
                </label>
                <input
                  type="text"
                  value={cmsConfig.primaryCtaText}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, primaryCtaText: e.target.value })}
                  placeholder="e.g. Explore Interactive Modules"
                  className="w-full bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Secondary CTA Button Text
                </label>
                <input
                  type="text"
                  value={cmsConfig.secondaryCtaText}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, secondaryCtaText: e.target.value })}
                  placeholder="e.g. Sign In to Terminal"
                  className="w-full bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Right Form: Announcement Bar & Live Preview */}
          <div className="space-y-6">
            <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <h3 className="text-base font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
                  <span>Announcement Banner</span>
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-medium text-on-surface">Enable Banner</span>
                  <input
                    type="checkbox"
                    checked={cmsConfig.showAnnouncement}
                    onChange={(e) => setCmsConfig({ ...cmsConfig, showAnnouncement: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Banner Text / Alert Message
                </label>
                <input
                  type="text"
                  disabled={!cmsConfig.showAnnouncement}
                  value={cmsConfig.announcementBanner}
                  onChange={(e) => setCmsConfig({ ...cmsConfig, announcementBanner: e.target.value })}
                  placeholder="e.g. 🚀 Dynamic WhatsApp UPI QR Codes & Mandatory Aadhaar Verification Engine Live!"
                  className="w-full bg-surface-container-high disabled:opacity-50 text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              {cmsConfig.showAnnouncement && (
                <div className="p-3 bg-gradient-to-r from-primary/10 via-amber-500/10 to-transparent border border-primary/30 rounded-xl flex items-center gap-2.5 text-xs text-primary font-medium">
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  <span className="flex-1">{cmsConfig.announcementBanner}</span>
                </div>
              )}
            </div>

            {/* Real-time Hero Snippet Preview */}
            <div className="bg-neutral-950 p-6 rounded-2xl border border-white/10 text-white space-y-4 shadow-xl">
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#ff7b72] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7b72] animate-ping"></span>
                <span>Live Hero Preview (Dark Mode)</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-[#ff7b72] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>{cmsConfig.badgeText}</span>
              </div>

              <h2 className="text-2xl font-headline font-extrabold tracking-tight leading-tight">
                {cmsConfig.heroHeadline}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7b72] via-[#e50914] to-amber-400">
                  {cmsConfig.heroHighlight}
                </span>
              </h2>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {cmsConfig.heroSubtitle}
              </p>

              <div className="flex items-center gap-2.5 pt-2">
                <button className="px-4 py-2 rounded-full bg-[#e50914] text-white font-bold text-xs">
                  {cmsConfig.primaryCtaText}
                </button>
                <button className="px-4 py-2 rounded-full bg-white/10 text-white font-bold text-xs border border-white/20">
                  {cmsConfig.secondaryCtaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pricing Customization */}
      {activeSubTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Plan Selector List (4 Cols) */}
          <div className="lg:col-span-4 bg-surface-container rounded-2xl p-5 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <h3 className="text-sm font-headline font-bold text-on-surface">Pricing Tiers</h3>
                <p className="text-[11px] text-on-surface-variant">Select a plan to edit its pricing &amp; features</p>
              </div>
              <button
                onClick={handleAddNewPlan}
                className="p-1.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center gap-1 text-xs font-semibold px-2.5 cursor-pointer"
                title="Add new pricing plan"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New Tier</span>
              </button>
            </div>

            {/* Quick Global Action: Apply 20% to All Plans */}
            <button
              type="button"
              onClick={handleApply20PercentToAllPlans}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600/15 via-rose-600/15 to-transparent hover:from-red-600/25 hover:via-rose-600/25 border border-red-500/30 text-[#ff4d4f] text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Automatically calculate and apply 20% discount on all packages"
            >
              <span className="material-symbols-outlined text-[16px]">percent</span>
              <span>Apply 20% Annual Discount to ALL Plans</span>
            </button>

            <div className="space-y-2">
              {cmsConfig.plans.map((p) => {
                const isSelected = p.id === selectedPlan?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-sm'
                        : 'bg-surface-container-high border-outline-variant/30 hover:border-outline-variant/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-headline font-bold text-on-surface">{p.name}</span>
                        {p.isPopular && (
                          <span className="text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
                        ₹{p.monthlyPrice.toLocaleString('en-IN')}/mo • ₹{p.yearlyPrice.toLocaleString('en-IN')}/yr
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {p.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-medium">
                          {p.badge}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(p.id);
                        }}
                        className="p-1 text-on-surface-variant hover:text-error rounded transition-colors"
                        title="Delete plan"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Editor Form (8 Cols) */}
          {selectedPlan && (
            <div className="lg:col-span-8 bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                    EDITING PLAN: {selectedPlan.name}
                  </span>
                  <h3 className="text-lg font-headline font-bold text-on-surface mt-0.5">
                    Plan Specifications &amp; Pricing Customization
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApply20PercentDiscount(selectedPlan)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
                    title="Automatically set annual price to 20% off monthly price"
                  >
                    <span className="material-symbols-outlined text-[16px]">percent</span>
                    <span>Apply 20% Annual Discount</span>
                  </button>

                  <label className="flex items-center gap-2 cursor-pointer bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/30">
                    <span className="text-xs font-semibold text-on-surface">Mark as Most Popular</span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedPlan.isPopular)}
                      onChange={(e) => handleUpdatePlan({ isPopular: e.target.checked })}
                      className="w-4 h-4 accent-[#e50914] rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* 1. Pricing Engine: Monthly vs Annual with 20% Automation */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[17px]">calculate</span>
                      <span>Subscription Pricing Engine</span>
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">Configure monthly base and annual discount rate (20% default)</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-on-surface-variant font-mono uppercase">Quick Presets:</span>
                    {[10, 15, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const discounted = Math.round(selectedPlan.monthlyPrice * (1 - pct / 100));
                          handleUpdatePlan({
                            yearlyPrice: discounted,
                            annualDiscountPercent: pct,
                          });
                          showToast(`${pct}% Discount Applied`, `Annual price set to ₹${discounted}/mo`, 'info');
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          (selectedPlan.annualDiscountPercent === pct || (!selectedPlan.annualDiscountPercent && pct === 20))
                            ? 'bg-[#e50914] text-white shadow-xs'
                            : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {pct}%{pct === 20 ? ' (Default)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Monthly Base Price (₹ INR / month) *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant font-mono text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={selectedPlan.monthlyPrice}
                        onChange={(e) => {
                          const newMonthly = Number(e.target.value) || 0;
                          const pct = selectedPlan.annualDiscountPercent || 20;
                          handleUpdatePlan({
                            monthlyPrice: newMonthly,
                            yearlyPrice: Math.round(newMonthly * (1 - pct / 100)),
                          });
                        }}
                        className="w-full bg-surface-container-high text-on-surface pl-8 pr-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-on-surface">
                        Annual Rate (₹ INR / mo when billed annually) *
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.2 rounded-full">
                        {Math.round(((selectedPlan.monthlyPrice - selectedPlan.yearlyPrice) / (selectedPlan.monthlyPrice || 1)) * 100)}% DISCOUNT
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant font-mono text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={selectedPlan.yearlyPrice}
                        onChange={(e) => handleUpdatePlan({ yearlyPrice: Number(e.target.value) || 0 })}
                        className="w-full bg-surface-container-high text-on-surface pl-8 pr-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono font-bold text-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Calculation Summary Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Monthly Cycle:</span>
                    <span className="font-mono font-bold text-on-surface text-sm">
                      ₹{selectedPlan.monthlyPrice.toLocaleString('en-IN')}<span className="text-[10px] font-sans font-normal text-on-surface-variant">/mo</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Annual Cycle:</span>
                    <span className="font-mono font-bold text-emerald-500 text-sm">
                      ₹{selectedPlan.yearlyPrice.toLocaleString('en-IN')}<span className="text-[10px] font-sans font-normal text-on-surface-variant">/mo</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-mono block">Total Annual Bill:</span>
                    <span className="font-mono font-bold text-on-surface text-sm">
                      ₹{(selectedPlan.yearlyPrice * 12).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-500 uppercase font-mono block font-bold">Annual Savings:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₹{((selectedPlan.monthlyPrice - selectedPlan.yearlyPrice) * 12).toLocaleString('en-IN')} (20% Off)
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Package Identity & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Plan Display Name *
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.name}
                    onChange={(e) => handleUpdatePlan({ name: e.target.value })}
                    className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Tier Category
                  </label>
                  <select
                    value={selectedPlan.tier}
                    onChange={(e) => handleUpdatePlan({ tier: e.target.value as any })}
                    className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                  >
                    <option value="starter">Starter Club</option>
                    <option value="growth">Growth Performance</option>
                    <option value="pro">Pro Heavy Iron</option>
                    <option value="enterprise">Franchise Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Badge / Tag Ribbon
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.badge || ''}
                    onChange={(e) => handleUpdatePlan({ badge: e.target.value })}
                    placeholder="e.g. Boutique Studios or Athletic Centers"
                    className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Plan Description / Subtitle
                </label>
                <input
                  type="text"
                  value={selectedPlan.description}
                  onChange={(e) => handleUpdatePlan({ description: e.target.value })}
                  placeholder="Ideal for neighborhood gyms, yoga centers and fitness studios."
                  className="w-full bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                />
              </div>

              {/* 3. Commercial & Hardware Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-outline-variant/20">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Active Members Limit
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.maxMembers || ''}
                    onChange={(e) => handleUpdatePlan({ maxMembers: e.target.value })}
                    placeholder="e.g. Up to 350 Active Members"
                    className="w-full bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Turnstile Hardware Relays
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.hardwareGates || ''}
                    onChange={(e) => handleUpdatePlan({ hardwareGates: e.target.value })}
                    placeholder="e.g. 2 Biometric Gates with RFID"
                    className="w-full bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Call To Action Button Label
                  </label>
                  <input
                    type="text"
                    value={selectedPlan.ctaText || 'ENROLL NOW'}
                    onChange={(e) => handleUpdatePlan({ ctaText: e.target.value })}
                    placeholder="e.g. ENROLL NOW or START FREE TRIAL"
                    className="w-full bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                  />
                </div>
              </div>

              {/* 4. Features List Editor with Quick-Add Suggestions */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-on-surface">
                    Included Package Features ({selectedPlan.features.length})
                  </label>
                  <span className="text-[11px] text-on-surface-variant font-mono">Bullet points on landing page card</span>
                </div>

                {/* Quick Add Common Features Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-on-surface-variant font-mono text-[10px]">Quick Add:</span>
                  {[
                    'Biometric Turnstile Relay (0.1s unlock)',
                    'WhatsApp Dynamic UPI QR Codes',
                    'Indian GST Compliant Invoices (SAC 999723)',
                    'Member Aadhaar KYC Verification Vault',
                    'Staff GPS Geofencing & Roster Tracking',
                    'Bi-Directional Google Sheets Roster Sync',
                    'Unlimited Trainer & Staff Accounts'
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => {
                        if (!selectedPlan.features.includes(tpl)) {
                          handleUpdatePlan({ features: [...selectedPlan.features, tpl] });
                          showToast('Feature Added', `Added "${tpl}" to ${selectedPlan.name}`, 'info');
                        }
                      }}
                      className="px-2 py-0.5 rounded-lg bg-surface-container-high hover:bg-primary/20 hover:text-primary text-on-surface text-[10px] transition-all border border-outline-variant/20 cursor-pointer"
                    >
                      + {tpl.slice(0, 26)}...
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Type custom feature and press Enter..."
                    className="flex-1 bg-surface-container-high text-on-surface px-3.5 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Feature</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {selectedPlan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-surface-container-high rounded-xl text-xs text-on-surface group"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const updated = [...selectedPlan.features];
                            updated[idx] = e.target.value;
                            handleUpdatePlan({ features: updated });
                          }}
                          className="w-full bg-transparent outline-none text-xs text-on-surface focus:text-primary transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="opacity-60 hover:opacity-100 text-error p-1 rounded transition-opacity"
                        title="Remove feature"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Full Landing Page Pricing Preview */}
      {activeSubTab === 'preview' && (
        <div className="space-y-6 bg-neutral-950 p-8 rounded-3xl border border-white/10 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[#ff7b72] font-mono text-xs font-bold uppercase tracking-wider block">
                PRICING CARDS RENDER PREVIEW
              </span>
              <h3 className="text-2xl font-headline font-bold text-white mt-1">
                How Gym Owners View Your Pricing
              </h3>
            </div>

            {/* Monthly / Yearly Toggle */}
            <div className="inline-flex items-center p-1 rounded-full bg-neutral-900 border border-white/15">
              <button
                onClick={() => setPreviewCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  previewCycle === 'monthly' ? 'bg-[#e50914] text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setPreviewCycle('yearly')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  previewCycle === 'yearly' ? 'bg-[#e50914] text-white shadow-md' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Annual (Save 20%)</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch pt-2">
            {cmsConfig.plans.map((plan) => {
              const price = previewCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const savings = (plan.monthlyPrice - plan.yearlyPrice) * 12;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-[#1b1214] via-[#141215] to-[#100f12] border-[#e50914] shadow-2xl shadow-red-950/60 xl:-translate-y-2'
                      : 'bg-[#121214]/90 border-white/10 hover:border-white/25 shadow-xl'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e50914] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
                      ★ MOST POPULAR
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      {plan.badge && (
                        <span className="text-[#ff7b72] font-mono text-[10px] font-bold uppercase tracking-widest block mb-1">
                          {plan.badge}
                        </span>
                      )}
                      <h4 className="text-2xl font-headline font-bold text-white tracking-tight">{plan.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1">{plan.description}</p>
                    </div>

                    <div>
                      <div className="text-[#ff4d4f] font-mono text-4xl font-extrabold tracking-tight">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      <div className="font-mono text-[10px] font-bold tracking-wider mt-1 text-neutral-400 uppercase">
                        PER MONTH {previewCycle === 'yearly' ? `• BILLED ANNUALLY (₹${(price * 12).toLocaleString('en-IN')})` : ''}
                      </div>
                      {previewCycle === 'yearly' && savings > 0 && (
                        <div className="text-emerald-400 font-mono text-[11px] font-bold mt-0.5">
                          ✓ Save ₹{savings.toLocaleString('en-IN')}/yr
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 text-xs pt-4 border-t border-white/10 text-neutral-300">
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4f] shrink-0 mt-1.5"></span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => showToast('Plan Selected in Preview', `Simulated enroll in ${plan.name}`, 'info')}
                      className={`w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider text-center transition-all ${
                        plan.isPopular
                          ? 'bg-[#e50914] hover:bg-[#ff2020] text-white shadow-lg shadow-red-600/30'
                          : 'bg-[#242426] hover:bg-[#323236] text-white border border-white/10'
                      }`}
                    >
                      ENROLL NOW
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
