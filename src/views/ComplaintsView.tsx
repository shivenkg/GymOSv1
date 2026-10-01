import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types';

export const ComplaintsView: React.FC = () => {
  const { complaints, addComplaint, updateComplaintStatus, members, showToast } = useGym();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected complaint for resolution note modal
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

  // New ticket modal
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newMemberId, setNewMemberId] = useState(members[0]?.id || '');
  const [newCategory, setNewCategory] = useState<Complaint['category']>('Air Conditioning');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('Medium');
  const [assignedStaff, setAssignedStaff] = useState('Front Desk Lead');

  const filteredTickets = complaints.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const openCount = complaints.filter((c) => c.status === 'Open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find((m) => m.id === newMemberId);
    if (!member) return;

    addComplaint({
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      category: newCategory,
      subject: newSubject,
      description: newDescription,
      priority: newPriority,
      assignedTo: assignedStaff,
    });

    setIsNewTicketModalOpen(false);
    setNewSubject('');
    setNewDescription('');
  };

  const handleSaveResolution = () => {
    if (!selectedTicket) return;
    updateComplaintStatus(selectedTicket.id, 'Resolved', resolutionText);
    showToast(
      'Ticket Resolved',
      `Ticket #${selectedTicket.ticketNumber} marked as Resolved. Member notified via WhatsApp.`,
      'success'
    );
    setIsResolutionModalOpen(false);
    setSelectedTicket(null);
    setResolutionText('');
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e50914]/10 text-[#e50914] uppercase tracking-wider font-mono">
              CORE MODULE 12 • SERVICE DESK
            </span>
            <span className="text-on-surface-variant">• Floor Maintenance &amp; Member Grievances</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">
            Complaints &amp; Maintenance Desk
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1">
            Ensure member issues with AC cooling, turnstiles, dumbbells, showers, and billing never get lost in WhatsApp chats. Full status lifecycle from Open to Resolved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Export Complete', 'Exported maintenance tickets to CSV', 'info')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Log</span>
          </button>

          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-xs transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_alert</span>
            <span>+ Raise New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Open Tickets
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-amber-500 font-mono">
              {openCount}
            </span>
            <span className="text-[11px] text-on-surface-variant">Awaiting action</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              In Progress
            </span>
            <span className="material-symbols-outlined text-blue-400 text-[18px]">build</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-blue-400 font-mono">
              {inProgressCount}
            </span>
            <span className="text-[11px] text-on-surface-variant">Assigned to staff</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Resolved Tickets
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-emerald-400 font-mono">
              {resolvedCount}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">+98% resolution rate</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Avg Resolution Time
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">timer</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">
              2.4h
            </span>
            <span className="text-[11px] text-primary font-semibold">Under 4h SLA</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container p-3 rounded-2xl border border-outline-variant/30">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-1">search</span>
          <input
            type="text"
            placeholder="Search by ticket #, member, issue, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-on-surface focus:outline-hidden placeholder:text-on-surface-variant/60"
          >
          </input>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface font-medium cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs text-on-surface font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Air Conditioning">Air Conditioning</option>
            <option value="Turnstile / Access">Turnstile / Access</option>
            <option value="Equipment">Equipment</option>
            <option value="Cleanliness">Cleanliness</option>
            <option value="Billing">Billing &amp; GST</option>
            <option value="Locker">Locker</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[10px] font-mono text-on-surface-variant uppercase bg-surface-container-low">
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Subject &amp; Details</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {filteredTickets.map((ticket) => {
                const isOpen = ticket.status === 'Open';
                const isInProgress = ticket.status === 'In Progress';
                const isResolved = ticket.status === 'Resolved';

                return (
                  <tr key={ticket.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#e50914] whitespace-nowrap">
                      {ticket.ticketNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-on-surface">{ticket.memberName}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">{ticket.memberPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface-container-high text-on-surface">
                        {ticket.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-on-surface truncate">{ticket.subject}</div>
                      <div className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                        {ticket.description}
                      </div>
                      {ticket.resolutionNote && (
                        <div className="mt-1 text-[10px] text-emerald-400 font-mono">
                          ✓ Note: {ticket.resolutionNote}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          ticket.priority === 'Urgent'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : ticket.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isOpen
                            ? 'bg-amber-500/15 text-amber-400'
                            : isInProgress
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-emerald-500/15 text-emerald-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isOpen ? 'bg-amber-400' : isInProgress ? 'bg-blue-400' : 'bg-emerald-400'
                        }`}></span>
                        <span>{ticket.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap text-[11px]">
                      {ticket.assignedTo}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isOpen && (
                          <button
                            onClick={() => {
                              updateComplaintStatus(ticket.id, 'In Progress');
                              showToast('Ticket Updated', `Ticket #${ticket.ticketNumber} marked as In Progress.`, 'info');
                            }}
                            className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 font-semibold text-[11px] hover:bg-blue-500/30 cursor-pointer"
                          >
                            Mark In Progress
                          </button>
                        )}

                        {!isResolved && (
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setIsResolutionModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] hover:bg-emerald-500/30 cursor-pointer"
                          >
                            Resolve Ticket
                          </button>
                        )}

                        {isResolved && (
                          <span className="text-[11px] text-emerald-400 font-mono">
                            Resolved
                          </span>
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

      {/* MODAL 1: Resolve Ticket with Notes */}
      {isResolutionModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-high border border-outline-variant/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#e50914] font-bold uppercase">
                  CLOSE MAINTENANCE TICKET
                </span>
                <h3 className="font-headline font-bold text-lg text-on-surface">
                  Resolve #{selectedTicket.ticketNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-container text-xs space-y-1">
              <div className="font-bold text-on-surface">{selectedTicket.subject}</div>
              <div className="text-on-surface-variant">{selectedTicket.memberName} • {selectedTicket.category}</div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono">
                Resolution Action Note (sent to member)
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Cleaned biometric lens, replaced dumbbell collar, calibrated AC thermostat to 21C..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResolution}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Raise New Ticket */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface-container-high border border-outline-variant/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Raise Service / Maintenance Ticket
              </h3>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Reporting Member
                </label>
                <select
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone}) - {m.memberCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                  >
                    <option value="Air Conditioning">Air Conditioning</option>
                    <option value="Turnstile / Access">Turnstile / Access</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Billing">Billing &amp; GST</option>
                    <option value="Trainer / Staff">Trainer / Staff</option>
                    <option value="Locker">Locker</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-trainer belt slipping or AC cooling low in cardio section"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Include floor location, machine number, time observed, or specific member request..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase font-mono mb-1">
                  Assign Staff Technician
                </label>
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface"
                >
                  <option value="Amit Kumar (HVAC Lead)">Amit Kumar (HVAC Lead)</option>
                  <option value="Rajesh Nair (Hardware Tech)">Rajesh Nair (Hardware Tech)</option>
                  <option value="Pooja Iyer (Accounts Desk)">Pooja Iyer (Accounts Desk)</option>
                  <option value="Facility Supervisor">Facility Supervisor</option>
                  <option value="Fitness Floor Marshals">Fitness Floor Marshals</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#e50914] text-white font-bold hover:bg-[#b80710] shadow-md shadow-red-600/20"
                >
                  Log Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
