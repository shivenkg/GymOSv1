import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6m');

  const monthlyFinancialTrends = [
    { month: 'Feb 2026', revenue: 750, expenses: 6200, profit: -5450 },
    { month: 'Mar 2026', revenue: 1100, expenses: 6100, profit: -5000 },
    { month: 'Apr 2026', revenue: 1750, expenses: 6350, profit: -4600 },
    { month: 'May 2026', revenue: 2300, expenses: 6050, profit: -3750 },
    { month: 'Jun 2026', revenue: 1550, expenses: 6300, profit: -4750 },
    { month: 'Jul 2026', revenue: 4378, expenses: 6494, profit: -2116 },
  ];

  const planDistribution = [
    { name: 'Starter Monthly', value: 18, color: '#f97316' },
    { name: 'Student Monthly', value: 34, color: '#3b82f6' },
    { name: 'Standard Quarterly', value: 16, color: '#06b6d4' },
    { name: 'Premium Half-Year', value: 20, color: '#10b981' },
    { name: 'Annual Unlimited', value: 12, color: '#8b5cf6' },
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Understand trends across revenue, members and attendance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-surface-container px-3.5 py-2 rounded-xl text-xs font-semibold text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-xs"
          >
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
            <option value="ytd">YTD 2026</option>
          </select>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">Revenue</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1.5">
              $4,378.00
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">attach_money</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">Expenses</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1.5">
              $34,324.00
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">Profit</div>
            <div className="text-2xl font-bold font-headline text-red-500 font-mono mt-1.5">
              -$29,946.00
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">trending_down</span>
          </div>
        </div>

        {/* New Members */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">New Members</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1.5">
              10
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">group_add</span>
          </div>
        </div>
      </div>

      {/* 2 Main Charts: Line Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue, Expenses & Profit Line Chart */}
        <div className="lg:col-span-2 bg-surface-container rounded-2xl p-5 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
              <h2 className="text-base font-headline font-bold text-on-surface">Revenue, Expenses &amp; Profit</h2>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Revenue
              </span>
              <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                Expenses
              </span>
              <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Profit
              </span>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyFinancialTrends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(128, 128, 128, 0.6)" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-surface-container-highest/95 backdrop-blur-md p-3 rounded-xl border border-outline-variant/40 shadow-xl text-xs space-y-1.5 min-w-[170px]">
                          <div className="font-semibold text-on-surface border-b border-outline-variant/30 pb-1">{label}</div>
                          {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                              <span className="text-on-surface-variant flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-on-surface">
                                ${entry.value?.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Most Popular Plans Donut Chart */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-headline font-bold text-on-surface">Most Popular Plans</h2>
            <span className="text-[11px] font-mono text-on-surface-variant">Active Enrolled</span>
          </div>

          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-surface-container-highest/95 backdrop-blur-md p-2.5 rounded-xl border border-outline-variant/40 shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-on-surface">{item.name}</div>
                          <div className="font-mono text-on-surface-variant">{item.value}% of total members</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20 text-xs">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-on-surface">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }}></span>
                  {plan.name}
                </span>
                <span className="font-mono font-bold text-on-surface-variant">{plan.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature highlight tags matching Image 11 footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/20 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</span>
          Interactive Charts
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/20 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</span>
          6-Month Trends
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/20 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</span>
          Plan Insights
        </span>
      </div>
    </div>
  );
};
