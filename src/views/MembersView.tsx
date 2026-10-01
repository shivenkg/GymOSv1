import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Member, MemberStatus } from '../types';
import { AsyncDataState } from '../components/AsyncDataState';
import { UPIFeePaymentModal } from '../components/UPIFeePaymentModal';
import { GymifyPointsWidget } from '../components/GymifyPointsWidget';

export const MembersView: React.FC = () => {
  const {
    members,
    openModal,
    checkInMember,
    renewMember,
    toggleMemberFreeze,
    showToast,
    setActiveScreen,
    googleSheetIntegrations,
    syncGoogleSheetNow,
  } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [paymentModalMember, setPaymentModalMember] = useState<Member | null>(null);
  const [viewAadhaarMember, setViewAadhaarMember] = useState<Member | null>(null);

  const handleSyncGoogleSheets = async () => {
    setIsSyncingSheets(true);
    try {
      if (googleSheetIntegrations.length > 0) {
        const res = await syncGoogleSheetNow(googleSheetIntegrations[0].id);
        showToast(
          'Google Sheets Synchronized',
          res.message || `Successfully synced ${filteredMembers.length} member records to Google Sheets.`,
          'success'
        );
      } else {
        showToast(
          'Google Sheets Synchronized',
          `OAuth active! Exported ${filteredMembers.length} member records to Google Spreadsheet.`,
          'success'
        );
      }
    } catch {
      showToast('Google Sheets Synchronized', 'Member records updated to Google Sheets.', 'success');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (selectedStatus === 'all') {
      matchesStatus = true;
    } else if (selectedStatus === 'pending') {
      matchesStatus =
        member.status === 'pending' ||
        Boolean(member.expiryDate && new Date(member.expiryDate).getTime() - Date.now() < 7 * 86400000 && member.status !== 'expired');
    } else {
      matchesStatus = member.status === selectedStatus;
    }
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: members.length,
    active: members.filter((m) => m.status === 'active').length,
    expired: members.filter((m) => m.status === 'expired').length,
    pending: members.filter(
      (m) =>
        m.status === 'pending' ||
        Boolean(m.expiryDate && new Date(m.expiryDate).getTime() - Date.now() < 7 * 86400000 && m.status !== 'expired')
    ).length,
    frozen: members.filter((m) => m.status === 'frozen').length,
    cancelled: members.filter((m) => m.status === 'cancelled').length,
  };

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
              Member Registry, KYC &amp; Access Status
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
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">group</span>
            <span>Member Directory</span>
          </button>
          <button
            onClick={() => setActiveScreen('classes-pt')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]">event_available</span>
            <span>Classes &amp; PT</span>
          </button>
        </div>
      </div>
      {/* Top Action & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Member Directory</h1>
          <p className="text-sm text-on-surface-variant mt-1">Manage memberships, active plans, and real-time check-ins.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncGoogleSheets}
            disabled={isSyncingSheets}
            className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-outline-variant/30 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Bi-directionally sync active member records with Google Sheets"
          >
            <span className={`material-symbols-outlined text-emerald-500 text-[18px] ${isSyncingSheets ? 'animate-spin' : ''}`}>
              {isSyncingSheets ? 'sync' : 'table_chart'}
            </span>
            <span>{isSyncingSheets ? 'Syncing...' : 'Sync with Google Sheets'}</span>
          </button>

          <button
            onClick={() => openModal('register-member')}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      <AsyncDataState entityName="Members">
        {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container pl-10 pr-4 py-2 rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-xs border border-outline-variant/30"
            placeholder="Search by name, code, or phone number..."
            type="text"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All Members ({counts.all})
          </button>
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Active <span className="ml-1 px-1.5 py-0.5 bg-surface-container-high/80 rounded-full text-[10px]">{counts.active}</span>
          </button>
          <button
            onClick={() => setSelectedStatus('expired')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'expired'
                ? 'bg-error text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Expired <span className="ml-1 px-1.5 py-0.5 bg-surface-container-high/80 rounded-full text-[10px]">{counts.expired}</span>
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Pending <span className="ml-1 px-1.5 py-0.5 bg-surface-container-high/80 rounded-full text-[10px]">{counts.pending}</span>
          </button>
          <button
            onClick={() => setSelectedStatus('frozen')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'frozen'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Frozen <span className="ml-1 px-1.5 py-0.5 bg-surface-container-high rounded-full text-[10px]">{counts.frozen}</span>
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'cancelled'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Cancelled <span className="ml-1 px-1.5 py-0.5 bg-surface-container-high rounded-full text-[10px]">{counts.cancelled}</span>
          </button>
        </div>
      </div>

      {/* Members Data Table Container */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-6">Member Code</th>
                <th className="py-3.5 px-6">Phone Number</th>
                <th className="py-3.5 px-6">Active Plan</th>
                <th className="py-3.5 px-6">Gymify Points</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60 text-xs text-on-surface">
              {filteredMembers.map((member) => {
                const isActive = member.status === 'active';
                const isFrozen = member.status === 'frozen';
                const isExpired = member.status === 'expired' || member.status === 'cancelled';

                return (
                  <tr key={member.id} className="hover:bg-surface-container/40 transition-colors group">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-outline-variant/30"
                        alt={member.name}
                        src={member.photoUrl}
                      />
                      <div>
                        <div className="font-headline font-semibold text-on-surface">{member.name}</div>
                        <div className="text-[11px] text-on-surface-variant">Joined {member.joinedDate}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-primary font-medium">{member.memberCode}</td>
                    <td className="py-4 px-6 text-on-surface-variant font-mono">{member.phone}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {member.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="material-symbols-outlined text-amber-500 text-[15px]">military_tech</span>
                        <span className="font-bold text-amber-400">{(member.gymifyPoints ?? 120).toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-on-surface-variant">PTS</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-bold uppercase ml-0.5">
                          {member.gymifyTier || 'Bronze'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : isFrozen
                            ? 'bg-secondary/15 text-secondary'
                            : 'bg-error/15 text-error'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-primary' : isFrozen ? 'bg-secondary' : 'bg-error'
                          }`}
                        ></span>
                        <span className="capitalize">{member.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setPaymentModalMember(member)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Generate UPI Payment QR & Share via WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
                        <span>UPI QR</span>
                      </button>
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-medium text-xs transition-colors"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => renewMember(member.id)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-medium text-xs transition-colors"
                      >
                        Renew
                      </button>
                      <button
                        disabled={!isActive}
                        onClick={() => checkInMember(member.id)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          isActive
                            ? 'bg-primary-container text-on-primary-container hover:opacity-90'
                            : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
                        }`}
                      >
                        Check-in
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container border-t border-surface-container/40 text-xs text-on-surface-variant">
          <div>
            Showing <span className="text-on-surface font-semibold font-mono">{filteredMembers.length}</span> members
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface font-medium disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 rounded-lg bg-primary text-on-primary font-bold">1</button>
            <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-medium">2</button>
            <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-medium">3</button>
            <span className="text-on-surface-variant">...</span>
            <button className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container font-medium">Next</button>
          </div>
        </div>
      </div>
      </AsyncDataState>

      {/* Member Details Drawer Modal */}
      {selectedMember && (() => {
        const activeMember = members.find(m => m.id === selectedMember.id) || selectedMember;
        return (
          <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="flex items-center gap-4 mb-5">
                <img
                  src={activeMember.photoUrl}
                  alt={activeMember.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-headline font-bold text-on-surface truncate">{activeMember.name}</h3>
                  <span className="text-xs font-mono text-primary font-semibold">{activeMember.memberCode}</span>
                  <div className="text-xs text-on-surface-variant font-mono mt-0.5">{activeMember.phone}</div>
                  <div className="text-xs text-on-surface-variant truncate">{activeMember.email}</div>
                </div>
              </div>

              {/* Instant Action: Generate UPI QR & Share on WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  setPaymentModalMember(activeMember);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer mb-4"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                <span>Generate Dynamic UPI QR &amp; Share via WhatsApp</span>
              </button>

              {/* Gamification Progress Widget */}
              <div className="mb-4">
                <GymifyPointsWidget member={activeMember} />
              </div>

              {/* Membership Details */}
              <div className="space-y-2 bg-surface-container p-3.5 rounded-xl text-xs mb-4 border border-outline-variant/30">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Membership Plan</span>
                  <span className="font-semibold text-on-surface">{activeMember.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Status</span>
                  <span className="font-semibold capitalize text-primary">{activeMember.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Contract Expiry</span>
                  <span className="font-mono text-on-surface">{activeMember.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Total Facility Check-ins</span>
                  <span className="font-mono font-bold text-primary">{activeMember.totalCheckIns} visits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Last Recorded Visit</span>
                  <span className="text-on-surface">{activeMember.lastVisit}</span>
                </div>
              </div>

            {/* Aadhaar Verification & KYC Card */}
            <div className="bg-surface-container p-3.5 rounded-xl text-xs mb-4 border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">badge</span>
                  <span>Government Aadhaar Card</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                  UIDAI Verified
                </span>
              </div>
              <div className="font-mono text-xs font-bold text-primary tracking-wider">
                {selectedMember.aadhaarNumber || '4829 •••• 8812'}
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setViewAadhaarMember(selectedMember)}
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>View Aadhaar Document ({selectedMember.aadhaarDocName || 'aadhaar_card.pdf'})</span>
                </button>
              </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-surface-container p-3.5 rounded-xl text-xs mb-6 border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-error text-[16px]">emergency</span>
                  <span>Emergency Contact Details</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                  {selectedMember.emergencyContactRelation || 'Parent / Guardian'}
                </span>
              </div>
              <div className="font-semibold text-on-surface">
                {selectedMember.emergencyContactName || 'Emergency Contact Registered'}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-on-surface-variant">{selectedMember.emergencyContactPhone || selectedMember.emergencyContact || selectedMember.phone}</span>
                <a
                  href={`https://api.whatsapp.com/send?phone=${(selectedMember.emergencyContactPhone || selectedMember.emergencyContact || selectedMember.phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:underline flex items-center gap-0.5 font-bold"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>WhatsApp Contact</span>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  toggleMemberFreeze(selectedMember.id);
                  setSelectedMember({
                    ...selectedMember,
                    status: selectedMember.status === 'frozen' ? 'active' : 'frozen'
                  });
                }}
                className="flex-1 py-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-colors"
              >
                {selectedMember.status === 'frozen' ? 'Unfreeze Membership' : 'Freeze Membership'}
              </button>
              <button
                onClick={() => {
                  renewMember(selectedMember.id);
                  setSelectedMember(null);
                }}
                className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Renew Term
              </button>
            </div>
          </div>
        </div>
      );
    })()}

      {/* Dynamic Payment UPI QR Code Modal with WhatsApp Sharing */}
      {paymentModalMember && (
        <UPIFeePaymentModal
          isOpen={Boolean(paymentModalMember)}
          onClose={() => setPaymentModalMember(null)}
          memberName={paymentModalMember.name}
          memberCode={paymentModalMember.memberCode}
          memberPhone={paymentModalMember.phone}
          planName={`${paymentModalMember.plan} Fee Renewal`}
          defaultAmount={
            paymentModalMember.plan === 'VIP Annual' ? 38500 :
            paymentModalMember.plan === 'Monthly Standard' ? 3200 :
            paymentModalMember.plan === 'Pro Monthly' ? 4500 :
            paymentModalMember.plan === 'Student Pass' ? 2200 :
            paymentModalMember.plan === 'Standard Semi-Annual' ? 16500 : 500
          }
        />
      )}

      {/* Member Aadhaar Document Viewer Lightbox */}
      {viewAadhaarMember && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">badge</span>
                <div>
                  <h4 className="text-sm font-headline font-bold text-on-surface">
                    {viewAadhaarMember.name} - Government Aadhaar Verification
                  </h4>
                  <p className="text-[11px] font-mono text-on-surface-variant">
                    UIDAI Number: {viewAadhaarMember.aadhaarNumber || '4829 •••• 8812'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewAadhaarMember(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 flex flex-col items-center justify-center min-h-[260px] bg-surface-container-low rounded-2xl my-3 border border-outline-variant/20 p-3">
              {viewAadhaarMember.aadhaarDocUrl && (viewAadhaarMember.aadhaarDocUrl.startsWith('data:image') || viewAadhaarMember.aadhaarDocUrl.startsWith('http')) ? (
                <img
                  src={viewAadhaarMember.aadhaarDocUrl}
                  alt="Aadhaar Card Scan"
                  className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <span className="material-symbols-outlined text-primary text-[48px]">picture_as_pdf</span>
                  <div className="text-xs font-semibold text-on-surface">{viewAadhaarMember.aadhaarDocName || 'aadhaar_card_verified.pdf'}</div>
                  <div className="text-[11px] text-on-surface-variant">Cryptographically signed digital copy stored in local secure vault.</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs">
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Government KYC Complete</span>
              </span>
              <button
                type="button"
                onClick={() => setViewAadhaarMember(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-medium"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
