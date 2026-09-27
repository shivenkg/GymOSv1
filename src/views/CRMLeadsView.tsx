import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { LeadStage } from '../types';
import { AsyncDataState } from '../components/AsyncDataState';

export const CRMLeadsView: React.FC = () => {
  const { leads, updateLeadStage, convertLeadToMember, openModal, showToast } = useGym();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStage === 'all' || lead.stage === selectedStage;
    return matchesSearch && matchesStage;
  });

  const stages: LeadStage[] = [
    'New Inquiry',
    'Trial Booked',
    'Trial Completed',
    'Negotiation',
    'Won / Converted',
    'Lost'
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase font-headline">
              Sales &amp; Prospecting
            </span>
            <span className="text-on-surface-variant">• Updated 2m ago</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            CRM &amp; Leads Pipeline
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1">
            Manage prospect pipelines, automate onboarding sequences, and engage at-risk members before they churn.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Export Started', 'Exporting leads to CSV ledger...', 'info')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Leads</span>
          </button>

          <button
            onClick={() => openModal('add-lead')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      <AsyncDataState entityName="CRM Leads">
      {/* KPI Overview Cards (Bento Grid Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">{leads.length * 57}</span>
            <span className="text-[11px] text-primary font-semibold flex items-center">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +18 this week
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant">Pipeline volume steady</p>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Trials</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">fitness_center</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">48</span>
            <span className="text-[11px] text-error font-semibold flex items-center">
              <span className="material-symbols-outlined text-[12px]">schedule</span> 12 expiring today
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant">Requires immediate follow-up</p>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Conversion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">28.4%</span>
            <span className="text-[11px] text-primary font-semibold flex items-center">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +3.2% vs last mo
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant">Above target baseline (25%)</p>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden group hover:bg-surface-container-high transition-all border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Hot Prospects</span>
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">24</span>
            <span className="text-[11px] text-on-surface-variant font-medium">Ready to close</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">High engagement score</p>
        </div>
      </div>

      {/* Main Layout Split: Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Table/Kanban Workspace */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Toolbar & View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container p-3.5 rounded-2xl border border-outline-variant/30">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low pl-9 pr-4 py-2 rounded-xl text-on-surface text-xs placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-outline-variant/30"
                placeholder="Search leads by name, email, phone..."
                type="text"
              />
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'kanban' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                <span>Kanban</span>
              </button>
            </div>
          </div>

          {/* Pipeline Stages Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedStage === 'all'
                  ? 'bg-primary text-on-primary font-semibold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Leads ({leads.length})
            </button>
            {stages.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedStage === st
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-high text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-4 font-semibold">Lead Name</th>
                      <th className="py-3.5 px-3 font-semibold">Stage</th>
                      <th className="py-3.5 px-3 font-semibold">Source</th>
                      <th className="py-3.5 px-3 font-semibold">Assigned Rep</th>
                      <th className="py-3.5 px-3 font-semibold">Last Interaction</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                    {filteredLeads.map((lead) => {
                      const initials = lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();

                      return (
                        <tr key={lead.id} className="hover:bg-surface-container-high/40 transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-primary text-xs">
                                {initials}
                              </div>
                              <div>
                                <div className="font-semibold text-on-surface">{lead.name}</div>
                                <div className="text-[11px] text-on-surface-variant">{lead.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-tertiary/10 text-tertiary border border-tertiary/20 whitespace-nowrap">
                              {lead.stage}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-surface-variant text-on-surface-variant whitespace-nowrap">
                              {lead.source}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                {lead.assignedRepInitials}
                              </div>
                              <span className="text-[11px]">{lead.assignedRep}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-[11px] text-on-surface-variant font-mono">
                            {lead.lastInteraction}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => showToast('Calling Lead', `Dialing ${lead.phone}...`, 'info')}
                                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                                title="Call Lead"
                              >
                                <span className="material-symbols-outlined text-[16px]">call</span>
                              </button>
                              <button
                                onClick={() => showToast('Email Client', `Opened compose draft for ${lead.email}`, 'info')}
                                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                                title="Email Lead"
                              >
                                <span className="material-symbols-outlined text-[16px]">mail</span>
                              </button>
                              {lead.stage !== 'Won / Converted' ? (
                                <button
                                  onClick={() => convertLeadToMember(lead.id, 'Monthly Standard')}
                                  className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-on-primary text-[11px] transition-all font-semibold"
                                  title="Convert to Member"
                                >
                                  Convert
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-primary">Member</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KANBAN VIEW */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['New Inquiry', 'Trial Booked', 'Negotiation'].map((stageKey) => {
                const stageLeads = leads.filter((l) => l.stage === stageKey);
                return (
                  <div key={stageKey} className="bg-surface-container rounded-2xl p-4 flex flex-col gap-3 border border-outline-variant/30">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
                      <span className="font-headline font-bold text-on-surface text-xs">{stageKey}</span>
                      <span className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] text-on-surface-variant font-mono">
                        {stageLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {stageLeads.map((item) => (
                        <div
                          key={item.id}
                          className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant text-[10px]">
                              {item.source}
                            </span>
                            <span className="text-on-surface-variant">{item.lastInteraction}</span>
                          </div>

                          <div className="font-semibold text-sm text-on-surface">{item.name}</div>
                          <div className="text-[11px] text-on-surface-variant">{item.notes}</div>

                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-xs">
                            <span className="text-[10px] text-primary">Rep: {item.assignedRep}</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateLeadStage(item.id, 'Won / Converted')}
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                Win
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {stageLeads.length === 0 && (
                        <div className="text-center py-6 text-xs text-on-surface-variant/50">
                          No leads in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Lead Activity & Follow-up Sidebar Widget */}
        <div className="flex flex-col gap-5">
          {/* Overdue Touchpoints Card */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Overdue Touchpoints</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-error/10 text-error text-xs font-bold font-mono">2</span>
            </div>

            <div className="space-y-2.5">
              <div className="bg-surface-container-low p-3 rounded-xl flex items-start justify-between gap-3 border border-outline-variant/20">
                <div>
                  <div className="font-semibold text-on-surface text-xs">Kevin Durant</div>
                  <div className="text-[11px] text-on-surface-variant">Trial ended 2 days ago • No response</div>
                </div>
                <button
                  onClick={() => showToast('Calling Lead', 'Calling Kevin Durant (+1 555-771-3329)...', 'info')}
                  className="p-1.5 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                </button>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl flex items-start justify-between gap-3 border border-outline-variant/20">
                <div>
                  <div className="font-semibold text-on-surface text-xs">Amanda Seyfried</div>
                  <div className="text-[11px] text-on-surface-variant">Requested pricing info • 3d overdue</div>
                </div>
                <button
                  onClick={() => showToast('Sending Follow-up', 'Drafting promo email to Amanda Seyfried...', 'info')}
                  className="p-1.5 rounded bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">mail</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Follow-ups */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">event_upcoming</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Upcoming Today</h3>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">5 scheduled</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold font-mono">
                    11:00
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface text-xs">Jessica Davis</div>
                    <div className="text-[11px] text-on-surface-variant">Trial Session + Tour</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-tertiary/10 text-tertiary">
                  In 45m
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold font-mono">
                    02:30
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface text-xs">Alex Mercer</div>
                    <div className="text-[11px] text-on-surface-variant">Follow-up Call</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant">
                  Later
                </span>
              </div>
            </div>
          </div>

          {/* Automated Onboarding Sequence Status */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[18px]">smart_toy</span>
                <h3 className="font-headline font-bold text-on-surface text-sm">Active Automations</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-on-surface font-medium">7-Day Trial Nurture</span>
                  <span className="text-primary font-semibold font-mono">94% active</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[94%]"></div>
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">42 leads enrolled</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-on-surface font-medium">Winback Dormant (30d)</span>
                  <span className="text-tertiary font-semibold font-mono">88% active</span>
                </div>
                <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-[88%]"></div>
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">18 leads enrolled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AsyncDataState>
    </div>
  );
};
