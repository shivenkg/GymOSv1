import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { ClassSession } from '../types';
import { PTCalendarScheduler } from '../components/PTCalendarScheduler';

export const ClassesPTView: React.FC = () => {
  const { classes, ptSessions, updatePTSessionStatus, openModal, showToast, setActiveScreen } = useGym();
  const [activeTab, setActiveTab] = useState<'calendar' | 'all' | 'group' | 'pt' | 'roster'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trainerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studio.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'group') return matchesSearch && c.category !== 'Strength';
    if (activeTab === 'pt') return false; // Show in dedicated table
    return matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Consolidated Function: Operation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              FUNCTION: OPERATION
            </div>
            <div className="text-xs font-semibold text-on-surface">
              Classes &amp; Drag-and-Drop Personal Training Scheduling
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/20 overflow-x-auto">
          <button
            onClick={() => setActiveScreen('attendance')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
            <span>Floor &amp; Gates</span>
          </button>
          <button
            onClick={() => setActiveScreen('members')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">group</span>
            <span>Member Directory</span>
          </button>
          <button
            onClick={() => setActiveScreen('classes-pt')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">event_available</span>
            <span>Classes &amp; PT</span>
          </button>
        </div>
      </div>
      {/* Top Action Bar & Page Title Integration */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-semibold text-primary uppercase tracking-wider font-headline">
              Gymofy Schedule &amp; Operations
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-on-surface-variant">Real-time Telemetry</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Class &amp; PT Bookings
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => showToast('Roster Exported', 'CSV roster downloaded for all active bookings', 'success')}
            className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface text-xs font-semibold transition-all flex items-center gap-2 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => openModal('record-payment')}
            className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface text-xs font-semibold transition-all flex items-center gap-2 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
            <span>Book PT Session</span>
          </button>

          <button
            onClick={() => openModal('schedule-class')}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Schedule New Class</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container relative overflow-hidden group border border-outline-variant/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[56px] text-primary">event</span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Total Classes Today
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">{classes.length * 3}</span>
            <span className="text-[11px] font-semibold text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px] mr-0.5">trending_up</span> +2 vs yesterday
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between text-xs text-on-surface-variant">
            <span>Completed: 4</span>
            <span>Upcoming: 8</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container relative overflow-hidden group border border-outline-variant/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[56px] text-tertiary">fitness_center</span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Active PT Sessions
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">28</span>
            <span className="text-[11px] font-semibold text-tertiary flex items-center bg-tertiary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px] mr-0.5">schedule</span> 6 in progress
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between text-xs text-on-surface-variant">
            <span>Available Trainers: 14</span>
            <span className="font-semibold text-tertiary">Utilization: 92%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container relative overflow-hidden group border border-outline-variant/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[56px] text-primary">analytics</span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Utilization Rate
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-headline font-bold text-primary font-mono">88.5%</span>
            <span className="text-[11px] font-semibold text-primary flex items-center bg-primary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px] mr-0.5">trending_up</span> +4.2%
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '88.5%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-surface-container-low transition-all hover:bg-surface-container relative overflow-hidden group border border-outline-variant/30">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[56px] text-error">group</span>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">
            Waitlist Count
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">14</span>
            <span className="text-[11px] font-semibold text-error flex items-center bg-error/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px] mr-0.5">priority_high</span> Action req.
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/20 flex justify-between text-xs text-on-surface-variant">
            <span>Auto-promoted: 5</span>
            <span className="text-error font-medium">Pending: 9</span>
          </div>
        </div>
      </div>

      {/* Filter Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/20 pb-4 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'calendar', label: 'Drag & Drop PT Calendar', icon: 'drag_indicator', badge: 'Interactive' },
            { id: 'all', label: 'Today\'s Group Classes', icon: 'groups' },
            { id: 'pt', label: 'PT Table Roster', icon: 'table_rows' },
            { id: 'roster', label: 'Trainer Workload', icon: 'fitness_center' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {tab.icon && (
                <span className="material-symbols-outlined text-[15px]">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                  activeTab === tab.id ? 'bg-primary-container text-on-primary-container' : 'bg-primary/20 text-primary'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[16px] text-on-surface-variant">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-container-low pl-9 pr-4 py-1.5 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary w-56 border border-outline-variant/30"
              placeholder="Search classes or coaches..."
              type="text"
            />
          </div>
        </div>
      </div>

      {/* Primary Tab: Interactive Drag-and-Drop Personal Training Calendar */}
      {activeTab === 'calendar' && (
        <PTCalendarScheduler />
      )}

      {/* Secondary Tab: Standard Group Schedule & Utilization */}
      {activeTab !== 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Schedule Time Slots / Live Classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold text-on-surface">Today's Schedule &amp; Classes</h2>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span> Live Now
              <span className="w-2 h-2 rounded-full bg-tertiary inline-block ml-3"></span> Upcoming
            </div>
          </div>

          {filteredClasses.map((item) => {
            const percent = Math.round((item.enrolled / item.capacity) * 100);
            const isFull = item.enrolled >= item.capacity;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/30"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-headline ${
                      item.status === 'live' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {item.timeFormatted.split(' ')[0]}
                    </span>
                    <span className="text-base font-bold">{item.timeFormatted.split(' ')[1]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'live' ? 'bg-primary/20 text-primary' : 'bg-tertiary/20 text-tertiary'
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {item.studio} • {item.durationMins} mins
                      </span>
                    </div>
                    <h3 className="text-base font-headline font-semibold text-on-surface mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <img
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-outline-variant/40"
                        alt={item.trainerName}
                        src={item.trainerPhoto}
                      />
                      <span>Trainer: {item.trainerName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant font-mono font-medium">
                      Capacity: {item.enrolled}/{item.capacity}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${isFull ? 'bg-error' : 'bg-primary'}`}
                    ></span>
                  </div>
                  <div className="w-32 bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? 'bg-error' : 'bg-primary'}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {item.waitlist > 0 && (
                      <span className="text-[11px] text-tertiary font-semibold font-mono">
                        {item.waitlist} on waitlist
                      </span>
                    )}
                    {isFull && item.waitlist === 0 && (
                      <span className="text-[11px] text-error font-semibold">Full</span>
                    )}
                    {!isFull && (
                      <span className="text-[11px] text-on-surface-variant">
                        {item.capacity - item.enrolled} spots left
                      </span>
                    )}
                    <button
                      onClick={() => openModal('manage-class', item)}
                      className="px-3 py-1 bg-surface-container-highest hover:bg-surface-bright text-on-surface rounded-lg text-xs font-semibold transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Quick Trainer Load & Room Utilization Widget */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <h3 className="text-base font-headline font-bold text-on-surface mb-4">
              Trainer Workload Today
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Sarah Jenkins', stat: '6 hrs / 4 classes', pct: 85, color: 'bg-primary' },
                { name: 'Marcus Vance', stat: '5 hrs / 3 classes', pct: 70, color: 'bg-primary' },
                { name: 'Dave Callahan', stat: '7 hrs / 5 classes', pct: 95, color: 'bg-error' },
                { name: 'Elena Rostova', stat: '4 hrs / 2 classes', pct: 55, color: 'bg-tertiary' }
              ].map((tr) => (
                <div key={tr.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface font-medium">{tr.name}</span>
                    <span className="text-on-surface-variant font-mono">{tr.stat}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div className={`${tr.color} h-full rounded-full`} style={{ width: `${tr.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Studio Allocation */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <h3 className="text-base font-headline font-bold text-on-surface mb-4">Studio Allocation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">door_sliding</span>
                  <div>
                    <div className="text-xs font-semibold text-on-surface">Studio A</div>
                    <div className="text-[11px] text-on-surface-variant">HIIT &amp; Functional</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
                  In Use
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">self_improvement</span>
                  <div>
                    <div className="text-xs font-semibold text-on-surface">Zen Studio</div>
                    <div className="text-[11px] text-on-surface-variant">Yoga &amp; Pilates</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
                  In Use
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">pedal_bike</span>
                  <div>
                    <div className="text-xs font-semibold text-on-surface">Cycle Studio</div>
                    <div className="text-[11px] text-on-surface-variant">Spin &amp; Cardio</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-highest text-on-surface-variant">
                  Available at 2 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Dedicated Personal Training Appointment Management Table (When in PT Table or All mode) */}
      {(activeTab === 'pt' || activeTab === 'all') && (
      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Personal Training Appointments
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Manage 1-on-1 coaching slots, client packages, and status verifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Filter Applied', 'Showing confirmed slots only', 'info')}
              className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-highest transition-all border border-outline-variant/30"
            >
              Filter Status
            </button>
            <button
              onClick={() => openModal('record-payment')}
              className="px-3 py-1.5 rounded-xl bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-highest transition-all border border-outline-variant/30"
            >
              Assign Trainer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="pb-3 px-3">Client Name</th>
                <th className="pb-3 px-3">Assigned Trainer</th>
                <th className="pb-3 px-3">Time Slot</th>
                <th className="pb-3 px-3">Package Type</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-xs">
              {ptSessions.map((pt) => {
                const isConfirmed = pt.status === 'Confirmed';
                const isCompleted = pt.status === 'Completed';
                const isCancelled = pt.status === 'Cancelled';

                return (
                  <tr key={pt.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3.5 px-3 flex items-center gap-3">
                      <img
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/30"
                        alt={pt.clientName}
                        src={pt.clientPhoto}
                      />
                      <div>
                        <div className="font-semibold text-on-surface">{pt.clientName}</div>
                        <div className="text-[11px] text-on-surface-variant font-mono">{pt.clientId}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-on-surface font-medium">{pt.trainerName}</td>
                    <td className="py-3.5 px-3 text-on-surface-variant font-mono">{pt.timeSlot}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-tertiary/10 text-tertiary">
                        {pt.packageType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                          isConfirmed
                            ? 'bg-primary/20 text-primary'
                            : isCompleted
                            ? 'bg-surface-container-highest text-on-surface-variant'
                            : 'bg-error/20 text-error'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isConfirmed ? 'bg-primary' : isCompleted ? 'bg-on-surface-variant' : 'bg-error'
                          }`}
                        ></span>
                        {pt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-1">
                      {isConfirmed && (
                        <button
                          onClick={() => updatePTSessionStatus(pt.id, 'Completed')}
                          className="p-1.5 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-primary transition-colors"
                          title="Mark Completed"
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>
                      )}
                      {!isCancelled && (
                        <button
                          onClick={() => updatePTSessionStatus(pt.id, 'Cancelled')}
                          className="p-1.5 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-error transition-colors"
                          title="Cancel Slot"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                        </button>
                      )}
                      {isCancelled && (
                        <button
                          onClick={() => updatePTSessionStatus(pt.id, 'Confirmed')}
                          className="p-1.5 hover:bg-surface-container-highest rounded text-on-surface-variant hover:text-primary transition-colors"
                          title="Re-activate Slot"
                        >
                          <span className="material-symbols-outlined text-[16px]">refresh</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
