import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Member, MemberStatus } from '../types';
import { AsyncDataState } from '../components/AsyncDataState';

export const MembersView: React.FC = () => {
  const { members, openModal, checkInMember, renewMember, toggleMemberFreeze, showToast, setActiveScreen } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MemberStatus | 'all'>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

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
      {selectedMember && (
        <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedMember.photoUrl}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/40"
              />
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">{selectedMember.name}</h3>
                <span className="text-xs font-mono text-primary font-semibold">{selectedMember.memberCode}</span>
                <div className="text-xs text-on-surface-variant mt-0.5">{selectedMember.email}</div>
              </div>
            </div>

            <div className="space-y-3 bg-surface-container p-4 rounded-xl text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Plan</span>
                <span className="font-semibold text-on-surface">{selectedMember.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status</span>
                <span className="font-semibold capitalize text-primary">{selectedMember.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Contract Expiry</span>
                <span className="font-mono text-on-surface">{selectedMember.expiryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Total Facility Check-ins</span>
                <span className="font-mono font-bold text-primary">{selectedMember.totalCheckIns} visits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Last Recorded Visit</span>
                <span className="text-on-surface">{selectedMember.lastVisit}</span>
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
      )}
    </div>
  );
};
