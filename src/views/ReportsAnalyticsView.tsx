import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { AT_RISK_MEMBERS } from '../data/mockData';
import { AsyncDataState } from '../components/AsyncDataState';

export const ReportsAnalyticsView: React.FC = () => {
  const { showToast, setActiveScreen } = useGym();
  const [forecastPeriod, setForecastPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [atRiskList, setAtRiskList] = useState(AT_RISK_MEMBERS);
  const [searchRiskQuery, setSearchRiskQuery] = useState('');

  const filteredAtRisk = atRiskList.filter((m) =>
    m.name.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
    m.activePlan.toLowerCase().includes(searchRiskQuery.toLowerCase())
  );

  const forecastData = {
    monthly: {
      memberships: '₹42,50,000',
      pt: '₹14,20,000',
      merch: '₹4,80,000',
      mGrowth: '+14%',
      ptGrowth: '+8%',
      merchGrowth: '+22%',
      mBar: 78,
      ptBar: 62,
      merchBar: 45
    },
    quarterly: {
      memberships: '₹1,27,50,000',
      pt: '₹42,60,000',
      merch: '₹14,40,000',
      mGrowth: '+18%',
      ptGrowth: '+11%',
      merchGrowth: '+29%',
      mBar: 84,
      ptBar: 68,
      merchBar: 52
    },
    yearly: {
      memberships: '₹5,10,00,000',
      pt: '₹1,70,40,000',
      merch: '₹57,60,000',
      mGrowth: '+24%',
      ptGrowth: '+16%',
      merchGrowth: '+35%',
      mBar: 92,
      ptBar: 75,
      merchBar: 60
    }
  };

  const currentForecast = forecastData[forecastPeriod];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Consolidated Function: Analytics & Reports Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[18px]">insights</span>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              FUNCTION: ANALYTICS &amp; REPORTS
            </div>
            <div className="text-xs font-semibold text-on-surface">
              Retention Intelligence, Predictive Churn &amp; Revenue BI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/20 overflow-x-auto">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">dashboard</span>
            <span>Executive Telemetry</span>
          </button>
          <button
            onClick={() => setActiveScreen('reports')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">bar_chart</span>
            <span>BI Reports &amp; Exports</span>
          </button>
        </div>
      </div>

      {/* Header & Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Advanced Analytics &amp; Retention Intelligence
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Predictive churn scoring, cohort retention curves, branch performance benchmarking, and revenue forecasting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container px-3.5 py-2 rounded-xl border border-outline-variant/30 text-xs">
            <span className="material-symbols-outlined text-primary text-[16px]">calendar_today</span>
            <span className="font-semibold text-on-surface">Last 30 Days</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">expand_more</span>
          </div>

          <button
            onClick={() => showToast('Report Exported', 'Comprehensive Q4 Retention Intelligence PDF generated.', 'success')}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <AsyncDataState entityName="Retention Intelligence">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Overall Retention Rate</span>
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">94.2%</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold font-mono">+1.8%</span>
            <span className="text-[11px] text-on-surface-variant">vs industry benchmark</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Predicted Churn Risk</span>
              <span className="material-symbols-outlined text-error text-[18px]">warning</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">3.4%</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-error/10 text-error px-2 py-0.5 rounded text-[10px] font-bold font-mono">42 flagged</span>
            <span className="text-[11px] text-on-surface-variant">Next 30 days</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">Avg. Customer LTV</span>
              <span className="material-symbols-outlined text-tertiary text-[18px]">trending_up</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">₹48,500</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded text-[10px] font-bold font-mono">+12% YoY</span>
            <span className="text-[11px] text-on-surface-variant">Lifetime value</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between text-on-surface-variant text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider">MRR Growth</span>
              <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            </div>
            <div className="text-3xl font-headline font-bold text-on-surface font-mono">₹18,50,000</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold font-mono">+8.4% MoM</span>
            <span className="text-[11px] text-on-surface-variant">Recurring revenue</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations Widget */}
      <div className="bg-surface-container-high rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden border border-outline-variant/30">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
          </div>
          <div>
            <h3 className="text-base font-headline font-bold text-on-surface">
              AI Retention Intelligence Alert
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              38 members on VIP Annual memberships have skipped workouts for &gt; 10 days. Automated re-engagement campaign recommended to prevent potential churn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => showToast('Cohort Selected', 'Filtered 38 inactive VIP members in table below.', 'info')}
            className="bg-surface-container px-4 py-2 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors border border-outline-variant/30"
          >
            Review Members
          </button>
          <button
            onClick={() => showToast('Campaign Deployed!', 'Automated SMS & WhatsApp workout reminders sent to 38 members.', 'success')}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
          >
            Deploy Campaign
          </button>
        </div>
      </div>

      {/* Churn Risk Matrix / At-Risk Members Table */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">At-Risk Members Matrix</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Identified via visit frequency drops, expiring contracts, and skipped PT sessions.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              value={searchRiskQuery}
              onChange={(e) => setSearchRiskQuery(e.target.value)}
              className="w-full bg-surface-container-low pl-9 pr-4 py-2 rounded-xl text-on-surface text-xs placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
              placeholder="Search at-risk members..."
              type="text"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                <th className="py-3 px-4 font-semibold">Member Name &amp; ID</th>
                <th className="py-3 px-4 font-semibold">Risk Score</th>
                <th className="py-3 px-4 font-semibold">Last Visit</th>
                <th className="py-3 px-4 font-semibold">Active Plan</th>
                <th className="py-3 px-4 font-semibold">Primary Risk Factor</th>
                <th className="py-3 px-4 font-semibold text-right">Quick Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
              {filteredAtRisk.map((member) => (
                <tr key={member.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface text-xs">
                      {member.initials}
                    </div>
                    <div>
                      <div className="font-semibold">{member.name}</div>
                      <div className="text-[11px] text-on-surface-variant font-mono">{member.code}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        member.riskType === 'high' ? 'bg-error/15 text-error' : 'bg-tertiary/15 text-tertiary'
                      }`}
                    >
                      {member.riskScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant">{member.lastVisit}</td>
                  <td className="py-3.5 px-4">{member.activePlan}</td>
                  <td className={`py-3.5 px-4 font-medium ${member.riskType === 'high' ? 'text-error' : 'text-tertiary'}`}>
                    {member.riskFactor}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => showToast('Intervention Initiated', `Dispatched SMS to ${member.name}`, 'success')}
                        className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-[10px] font-semibold hover:opacity-90"
                      >
                        Intervene
                      </button>
                      <button
                        onClick={() => showToast('Trainer Assigned', `Dedicated coach assigned to re-engage ${member.name}`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-surface-variant text-on-surface text-[10px] font-medium hover:bg-surface-container-highest"
                      >
                        Assign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid for Cohort Retention & Branch Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Retention Curve */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-headline font-bold text-on-surface">Cohort Retention Curve</h2>
              <span className="text-[11px] text-on-surface-variant font-mono">12-Month Heatmap</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">
              Month-over-month retention tracking across recent member acquisition cohorts.
            </p>
          </div>

          {/* Simulated Heatmap */}
          <div className="space-y-2.5">
            {[
              { name: 'Q1 Cohort', scores: ['100%', '92%', '88%', '85%', '82%', '80%'] },
              { name: 'Q2 Cohort', scores: ['100%', '95%', '90%', '87%', '84%', '-'] },
              { name: 'Q3 Cohort', scores: ['100%', '96%', '91%', '89%', '-', '-'] },
              { name: 'Q4 Cohort', scores: ['100%', '97%', '-', '-', '-', '-'] }
            ].map((cohort) => (
              <div key={cohort.name} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="w-20 font-medium text-[11px] shrink-0">{cohort.name}</span>
                <div className="flex-1 grid grid-cols-6 gap-1.5 font-mono">
                  {cohort.scores.map((sc, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                        sc === '-'
                          ? 'bg-surface-variant text-on-surface-variant/40'
                          : 'bg-primary/80 text-on-primary'
                      }`}
                    >
                      {sc}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Performance Benchmarking */}
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col justify-between border border-outline-variant/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-headline font-bold text-on-surface">Branch Benchmarking</h2>
              <span className="text-[11px] text-primary font-bold">Live Data</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">Comparative performance metrics across club locations.</p>
          </div>

          <div className="space-y-3">
            {[
              { code: 'IN', name: 'Indiranagar Flagship', util: '88%', churn: '2.8%', rev: '₹18,50,000', growth: '+12.4% MoM' },
              { code: 'KM', name: 'Koramangala Club', util: '74%', churn: '4.1%', rev: '₹12,90,000', growth: '+4.1% MoM' },
              { code: 'BKC', name: 'BKC Executive Arena', util: '92%', churn: '1.9%', rev: '₹24,80,000', growth: '+15.8% MoM' }
            ].map((br) => (
              <div key={br.code} className="bg-surface p-3.5 rounded-xl flex items-center justify-between border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs font-mono">
                    {br.code}
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface text-xs">{br.name}</div>
                    <div className="text-[11px] text-on-surface-variant">
                      Utilization: {br.util} • Churn: {br.churn}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-headline font-bold text-on-surface text-sm font-mono">{br.rev}</div>
                  <div className="text-[11px] text-primary font-semibold">{br.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Stream Breakdown & Forecasting */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface">
              Revenue Stream Breakdown &amp; Forecasting
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Projected income across memberships, personal training, and merchandise.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-outline-variant/30 text-xs">
            {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setForecastPeriod(period)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  forecastPeriod === period ? 'bg-surface-container text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-surface p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Memberships (Recurring)</div>
              <div className="text-2xl font-headline font-bold text-on-surface font-mono mt-1">
                {currentForecast.memberships}
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Forecasted Term</span>
                <span className="text-primary font-semibold font-mono">{currentForecast.mGrowth}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${currentForecast.mBar}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Personal Training Packages</div>
              <div className="text-2xl font-headline font-bold text-on-surface font-mono mt-1">
                {currentForecast.pt}
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Forecasted Term</span>
                <span className="text-primary font-semibold font-mono">{currentForecast.ptGrowth}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary h-full transition-all duration-500" style={{ width: `${currentForecast.ptBar}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-2xl flex flex-col justify-between border border-outline-variant/20">
            <div>
              <div className="text-xs text-on-surface-variant font-medium">Merchandise &amp; Supplements</div>
              <div className="text-2xl font-headline font-bold text-on-surface font-mono mt-1">
                {currentForecast.merch}
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                <span>Forecasted Term</span>
                <span className="text-primary font-semibold font-mono">{currentForecast.merchGrowth}</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${currentForecast.merchBar}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AsyncDataState>
    </div>
  );
};
