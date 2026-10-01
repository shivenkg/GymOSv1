import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { StaffMember } from '../types';
import { AsyncDataState } from '../components/AsyncDataState';

export const StaffHRView: React.FC = () => {
  const {
    staff,
    staffFeed,
    approveStaffCheckIn,
    rejectStaffCheckIn,
    openModal,
    showToast
  } = useGym();

  const [activeFilter, setActiveFilter] = useState<'all' | 'trainer' | 'frontdesk' | 'management' | 'shift'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'trainer') return matchesSearch && s.category === 'trainer';
    if (activeFilter === 'frontdesk') return matchesSearch && s.category === 'frontdesk';
    if (activeFilter === 'management') return matchesSearch && s.category === 'management';
    if (activeFilter === 'shift') return matchesSearch && s.onShift;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="font-semibold uppercase tracking-wider text-primary font-headline">
              Human Resources
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-on-surface-variant">Payroll &amp; Compliance Active</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Staff &amp; HR Management
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage staff directory, shift rosters, GPS/photo attendance verification, and payroll records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Timesheet Exported', 'Downloaded bi-weekly employee punch logs CSV.', 'success')}
            className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-bright transition-all flex items-center gap-2 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Timesheet</span>
          </button>
          <button
            onClick={() => openModal('add-staff')}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      <AsyncDataState entityName="Staff HR">
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface font-mono">24</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-primary font-semibold">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+2 joined this month</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Active Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
            </div>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface font-mono">18</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            <span>6 on scheduled break/off</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Pending Leave
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[18px]">event_busy</span>
            </div>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface font-mono">3</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-error font-semibold">
            <span className="material-symbols-outlined text-[14px]">priority_high</span>
            <span>Requires manager review</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Compliance Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="text-3xl font-headline font-bold text-on-surface font-mono">98.5%</div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-tertiary font-semibold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>GPS &amp; photo verified</span>
          </div>
        </div>
      </div>

      {/* Filter Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container p-2.5 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 text-xs">
          {[
            { id: 'all', label: 'All Staff (24)' },
            { id: 'trainer', label: 'Trainers (12)' },
            { id: 'frontdesk', label: 'Front Desk (6)' },
            { id: 'management', label: 'Management (6)' },
            { id: 'shift', label: 'On Shift Now (18)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50 border border-outline-variant/30"
            placeholder="Search staff by name, role, ID..."
            type="text"
          />
        </div>
      </div>

      {/* Main Content Layout (Two Columns: Directory Table + Side Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Staff Directory Table (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
          <div className="p-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">Staff Directory</h2>
              <p className="text-xs text-on-surface-variant">
                Active directory roster and real-time geofence compliance status
              </p>
            </div>
            <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Downtown Branch
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-high text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-5">Staff Member</th>
                  <th className="py-3 px-4">Role &amp; ID</th>
                  <th className="py-3 px-4">Shift Hours</th>
                  <th className="py-3 px-4">Geofence Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/50 text-xs text-on-surface">
                {filteredStaff.map((person) => {
                  const isVerified = person.geofenceStatus === 'Verified Inside';

                  return (
                    <tr key={person.id} className="hover:bg-surface-container-high/30 transition-colors group">
                      <td className="py-3.5 px-5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden shrink-0 ring-1 ring-outline-variant/30">
                          <img
                            className="w-full h-full object-cover"
                            alt={person.name}
                            src={person.photoUrl}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface flex items-center gap-1.5">
                            <span>{person.name}</span>
                            {person.aadhaarNumber && (
                              <span className="material-symbols-outlined text-emerald-500 text-[14px]" title="Aadhaar KYC & Academic Credentials Verified">
                                verified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-on-surface-variant font-mono">{person.phone}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">{person.role}</div>
                        <div className="text-[10px] text-primary uppercase font-mono">{person.staffCode}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-on-surface font-mono">{person.shiftHours}</div>
                        <div className="text-[11px] text-on-surface-variant">{person.shiftType}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isVerified ? 'bg-primary/10 text-primary' : 'bg-error/15 text-error animate-pulse'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-primary' : 'bg-error'}`}
                          ></span>
                          {person.geofenceStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal('view-staff-profile', person)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                            title="View Profile"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                          <button
                            onClick={() => openModal('view-staff-schedule', person)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                            title="Schedule"
                          >
                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          </button>
                          <button
                            onClick={() => openModal('edit-staff', person)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-surface-container-high/20 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/20">
            <span>Showing {filteredStaff.length} staff members</span>
            <div className="flex items-center gap-1.5">
              <button className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold">1</button>
              <button className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright">2</button>
              <button className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright">Next</button>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Stream & Payroll Summary (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Live Check-in Stream & Verification */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
                <h3 className="text-base font-headline font-bold text-on-surface">Live Attendance Feed</h3>
              </div>
              <span className="text-[11px] font-bold text-primary uppercase font-mono">GPS ACTIVE</span>
            </div>

            <div className="space-y-3">
              {staffFeed.map((feedItem) => {
                const isNeedsReview = feedItem.status === 'Manager Review Required';
                const isApproved = feedItem.status === 'Approved by Manager';
                const isRejected = feedItem.status === 'Rejected';

                return (
                  <div
                    key={feedItem.id}
                    className={`p-3.5 rounded-xl bg-surface-container-high/60 flex items-start gap-3 border ${
                      !feedItem.isInside && isNeedsReview ? 'border-error/40' : 'border-outline-variant/20'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-surface-container shrink-0 ring-1 ring-outline-variant/30">
                      <img className="w-full h-full object-cover" alt={feedItem.staffName} src={feedItem.photoUrl} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface text-xs truncate">{feedItem.staffName}</span>
                        <span className={`text-[11px] font-mono ${feedItem.isInside ? 'text-primary' : 'text-error'}`}>
                          {feedItem.timeFormatted}
                        </span>
                      </div>

                      <div className="text-[11px] flex items-center gap-1 mt-0.5 text-on-surface-variant font-mono">
                        <span className="material-symbols-outlined text-[13px] text-primary">my_location</span>
                        <span className={!feedItem.isInside ? 'text-error font-medium' : ''}>{feedItem.gpsOffset}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        {isNeedsReview ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => approveStaffCheckIn(feedItem.id)}
                              className="px-2.5 py-0.5 rounded bg-primary text-on-primary text-[10px] font-semibold hover:brightness-110 transition-all"
                            >
                              Approve Check-in
                            </button>
                            <button
                              onClick={() => rejectStaffCheckIn(feedItem.id)}
                              className="px-2.5 py-0.5 rounded bg-error/20 text-error text-[10px] font-semibold hover:bg-error/30 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              isApproved
                                ? 'bg-primary/20 text-primary'
                                : isRejected
                                ? 'bg-error/20 text-error'
                                : 'bg-primary/20 text-primary'
                            }`}
                          >
                            {feedItem.status}
                          </span>
                        )}
                        {feedItem.onTime && (
                          <span className="text-[10px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded">
                            On Time
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payroll & Compensation Summary Card */}
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-headline font-bold text-on-surface">Payroll &amp; Compensation</h3>
              <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/50 border border-outline-variant/20">
                <div>
                  <div className="text-[11px] text-on-surface-variant">Current Cycle Status</div>
                  <div className="text-xs font-semibold text-primary mt-0.5">Bi-Weekly (Oct 1 - Oct 14)</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  Processing
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high/50 border border-outline-variant/20">
                <div>
                  <div className="text-[11px] text-on-surface-variant">Projected Payout</div>
                  <div className="text-xl font-headline font-bold text-on-surface font-mono mt-0.5">₹13,44,000.00</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-tertiary font-semibold font-mono">24 Staff included</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openModal('view-payslips')}
                  className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  <span>View Detailed Payslips &amp; Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </AsyncDataState>
    </div>
  );
};
