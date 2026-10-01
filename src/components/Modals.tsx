import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { MembershipPlan, StaffMember } from '../types';

export const Modals: React.FC = () => {
  const {
    activeModal,
    closeModal,
    modalPayload,
    addMember,
    addInvoice,
    addClass,
    addLead,
    addStaff,
    classes,
    updateClassCapacity,
    simulateScan,
    lastScannedMember,
    isTerminalLocked,
    checkInMember,
    renewMember,
    toggleMemberFreeze,
    showToast,
    setActiveScreen,
  } = useGym();

  // Register Member state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPlan, setNewMemberPlan] = useState<MembershipPlan>('Monthly Standard');

  // Record Payment state
  const [paymentMember, setPaymentMember] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('3200.00');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'UPI' | 'Credit Card' | 'Cash'>('UPI');
  const [paymentDesc, setPaymentDesc] = useState('Monthly Membership Dues');

  // Schedule Class state
  const [classTitle, setClassTitle] = useState('');
  const [classCategory, setClassCategory] = useState<'High Intensity' | 'Mind & Body' | 'Strength' | 'Cardio'>('High Intensity');
  const [classStudio, setClassStudio] = useState<'Studio A' | 'Zen Studio' | 'Main Arena' | 'Cycle Studio'>('Studio A');
  const [classTime, setClassTime] = useState('07:00 AM');
  const [classCapacity, setClassCapacity] = useState(25);
  const [classTrainer, setClassTrainer] = useState('Sarah Jenkins');

  // Add Lead state
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSource, setLeadSource] = useState<'Instagram Ad' | 'Website' | 'Walk-in' | 'Referral'>('Instagram Ad');
  const [leadRep, setLeadRep] = useState('Marcus K.');
  const [leadNotes, setLeadNotes] = useState('');

  // Add Staff state
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('Personal Trainer');
  const [staffPhone, setStaffPhone] = useState('');

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Modal: Register Member */}
        {activeModal === 'register-member' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Register New Member</h3>
            <p className="text-xs text-on-surface-variant mb-5">Create a member record, generate digital QR code, and assign plan.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMemberName.trim()) return;
                addMember({
                  name: newMemberName,
                  email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                  phone: newMemberPhone || '+1 (555) 000-0000',
                  plan: newMemberPlan
                });
                closeModal();
                setNewMemberName('');
                setNewMemberEmail('');
                setNewMemberPhone('');
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Johnathan Davis"
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Membership Plan *
                </label>
                <select
                  value={newMemberPlan}
                  onChange={(e) => setNewMemberPlan(e.target.value as MembershipPlan)}
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="VIP Annual">VIP Annual (₹38,500/yr) - Full Access + PT</option>
                  <option value="Monthly Standard">Monthly Standard (₹3,200/mo) - Gym Floor</option>
                  <option value="Pro Monthly">Pro Monthly (₹4,500/mo) - Floor + Classes</option>
                  <option value="Student Pass">Student Pass (₹2,200/mo) - Standard Floor</option>
                  <option value="Standard Semi-Annual">Standard Semi-Annual (₹16,500/6mo)</option>
                  <option value="Day Pass">Day Pass (₹500/day)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Record Payment */}
        {activeModal === 'record-payment' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Record Payment</h3>
            <p className="text-xs text-on-surface-variant mb-5">Process membership billing, personal training fees, or locker rentals.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(paymentAmount) || 0;
                addInvoice({
                  memberName: paymentMember || 'Aarav Sharma',
                  planOrDescription: paymentDesc || 'Membership Dues',
                  amount: amt,
                  method: paymentMethod,
                  status: 'Paid'
                });
                closeModal();
                setPaymentMember('');
                setPaymentAmount('3200.00');
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Member Name or ID *
                </label>
                <input
                  type="text"
                  required
                  value={paymentMember}
                  onChange={(e) => setPaymentMember(e.target.value)}
                  placeholder="e.g. Aarav Sharma or #MEM-8402"
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Amount (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="UPI">UPI / QR (BHIM/GPay/PhonePe)</option>
                    <option value="Credit Card">Credit/Debit Card (POS)</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Stripe">Online Card Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Description / Item
                </label>
                <input
                  type="text"
                  value={paymentDesc}
                  onChange={(e) => setPaymentDesc(e.target.value)}
                  placeholder="e.g. VIP Annual Renewal"
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Process &amp; Issue Receipt
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Scan QR Check-in */}
        {activeModal === 'scan-qr' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Scan QR Check-in</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Hold the member smartphone QR pass or keytag in front of the lens.
            </p>

            <div className="w-full h-60 bg-surface-container-low rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrIikuUxBYkm1nQqvJybui807YbSA_gPajB0oEvr2fQA_OM0OtjwHrO91MmzoTTnhYli_03-kyC-zqo5WTPW5AFfKzh14vMUpNabPayQG-Ke3ohF8QCnmnbslowKCTixO8G9cJqMkkq4WsQA99LMYQyervgGW1kfsGoGL__rLIcxiYCkSHXbxZmrEufHzC5mwd0nxYd8uP3xfgjryKdVHsGJe8vrMf3qbPAzVG5mIF3VSjvrSUvI3VEw')" }}></div>
              <span className="material-symbols-outlined text-primary text-[56px] animate-pulse relative z-10">qr_code_scanner</span>
              <span className="text-sm font-medium text-on-surface mt-2 relative z-10">Listening for scan input...</span>
              <span className="text-xs text-on-surface-variant mt-1 relative z-10">Terminal #04 • Main Gate Turnstile</span>

              {lastScannedMember && (
                <div className="absolute bottom-2 left-2 right-2 bg-surface-container-high/90 backdrop-blur-md p-2 rounded-lg border border-primary/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-primary">{lastScannedMember.name}</span>
                    <span className="text-on-surface-variant ml-2">{lastScannedMember.plan}</span>
                  </div>
                  <span className="text-primary font-bold">ALLOWED</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => simulateScan()}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>Trigger Quick Scan</span>
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors text-sm font-medium"
              >
                Close Scanner
              </button>
            </div>
          </div>
        )}

        {/* Modal: Schedule Class */}
        {activeModal === 'schedule-class' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Schedule New Class</h3>
            <p className="text-xs text-on-surface-variant mb-5">Publish a group fitness session to the branch timetable and member app.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!classTitle.trim()) return;
                addClass({
                  title: classTitle,
                  category: classCategory,
                  studio: classStudio,
                  durationMins: 45,
                  timeFormatted: classTime,
                  trainerName: classTrainer,
                  trainerPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDW7_stQOOHDWeye17Rp9YxGGuAzEitTkqcL5jhZFIpltzS7VeHiMoNdM1AjJUpsDXyUt1IR5SZm3pif9iH7sk1BVzYo89h9qu8A0-pEzCrxUh4pTN7NC03Q2NgQNVDutUByP4SMb7SofcAmyIIrom3LgFhVgHvs87JTFk7MBFO2rqLXh2vJRY6ahZad3K2Gfczn7r3xkIyMWtN-IzyLWlaeadToOSdV15Vy-zHL4ivRd2QNAZzIXUCOQ',
                  capacity: Number(classCapacity) || 25
                });
                closeModal();
                setClassTitle('');
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  placeholder="e.g. Extreme Kettlebell Circuit"
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={classCategory}
                    onChange={(e) => setClassCategory(e.target.value as any)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="High Intensity">High Intensity</option>
                    <option value="Strength">Strength</option>
                    <option value="Mind & Body">Mind &amp; Body</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Studio / Room
                  </label>
                  <select
                    value={classStudio}
                    onChange={(e) => setClassStudio(e.target.value as any)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Studio A">Studio A (Functional)</option>
                    <option value="Zen Studio">Zen Studio (Yoga &amp; Pilates)</option>
                    <option value="Main Arena">Main Arena (CrossFit / Turf)</option>
                    <option value="Cycle Studio">Cycle Studio (Spin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    placeholder="07:00 AM"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Capacity (Spots)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(Number(e.target.value))}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Assigned Coach / Trainer
                </label>
                <select
                  value={classTrainer}
                  onChange={(e) => setClassTrainer(e.target.value)}
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (Senior Trainer)</option>
                  <option value="Marcus Vance">Marcus Vance (Yoga &amp; Mobility)</option>
                  <option value="Dave Callahan">Dave Callahan (Strength &amp; CrossFit)</option>
                  <option value="Elena Rostova">Elena Rostova (Cycle / Ops)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Confirm &amp; Publish Schedule
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Lead */}
        {activeModal === 'add-lead' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Add New Prospect</h3>
            <p className="text-xs text-on-surface-variant mb-5">Create a CRM lead record and kick off automated onboarding nurture sequence.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!leadName.trim()) return;
                addLead({
                  name: leadName,
                  email: leadEmail || `${leadName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
                  phone: leadPhone || '+1 (555) 000-0000',
                  source: leadSource,
                  assignedRep: leadRep,
                  notes: leadNotes
                });
                closeModal();
                setLeadName('');
                setLeadEmail('');
                setLeadPhone('');
                setLeadNotes('');
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Lead Source
                  </label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value as any)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Instagram Ad">Instagram Ad</option>
                    <option value="Website">Website Form</option>
                    <option value="Walk-in">Walk-in Inquiry</option>
                    <option value="Referral">Member Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Assigned Rep
                  </label>
                  <select
                    value={leadRep}
                    onChange={(e) => setLeadRep(e.target.value)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Marcus K.">Marcus K.</option>
                    <option value="Sarah L.">Sarah L.</option>
                    <option value="John D.">John D.</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Initial Notes / Goals
                </label>
                <textarea
                  rows={2}
                  value={leadNotes}
                  onChange={(e) => setLeadNotes(e.target.value)}
                  placeholder="Looking for strength coaching, weekend classes..."
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Enroll in Pipeline
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Staff */}
        {activeModal === 'add-staff' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Add New Staff Member</h3>
            <p className="text-xs text-on-surface-variant mb-5">Register employee profile, set geofence permissions and assign shift hours.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!staffName.trim()) return;
                addStaff({
                  name: staffName,
                  role: staffRole,
                  phone: staffPhone || '+1 (555) 000-0000',
                  shiftHours: '06:00 - 14:00'
                });
                closeModal();
                setStaffName('');
                setStaffPhone('');
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Senior Trainer">Senior Trainer</option>
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Front Desk Lead">Front Desk Lead</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Yoga Instructor">Yoga Instructor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: View Payslips / Payroll Breakdown */}
        {activeModal === 'view-payslips' && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Payroll &amp; Tax Withholding</h3>
            <p className="text-xs text-on-surface-variant mb-4">Bi-Weekly Pay Cycle (Oct 1 - Oct 14) • Downtown HQ</p>

            <div className="space-y-3 text-xs mb-5">
              <div className="p-3 bg-surface-container rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface block">Gross Compensation</span>
                  <span className="text-on-surface-variant text-[11px]">24 Staff • 1,920 Hours Logged</span>
                </div>
                <span className="font-mono font-bold text-on-surface text-sm">₹12,45,000.00</span>
              </div>

              <div className="p-3 bg-surface-container rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface block">Trainer Commission (PT Splits)</span>
                  <span className="text-on-surface-variant text-[11px]">78 Sessions Conducted (60/40 Split)</span>
                </div>
                <span className="font-mono font-bold text-tertiary text-sm">₹2,84,000.00</span>
              </div>

              <div className="p-3 bg-surface-container rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-on-surface block">Tax &amp; Compliance Withholding</span>
                  <span className="text-on-surface-variant text-[11px]">TDS, EPF &amp; ESIC Bank Transfer Processing</span>
                </div>
                <span className="font-mono font-bold text-error text-sm">-₹1,85,000.00</span>
              </div>

              <div className="p-3 bg-primary-container/20 border border-primary/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-semibold text-primary block">Net NEFT / IMPS Salary Total</span>
                  <span className="text-on-surface-variant text-[11px]">Scheduled for 1st of month direct deposit</span>
                </div>
                <span className="font-mono font-bold text-primary text-base">₹13,44,000.00</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-outline-variant/30 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-medium text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Exporting Payroll Automated Clearing House (ACH) batch file.');
                  closeModal();
                }}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity text-xs"
              >
                Export ACH File
              </button>
            </div>
          </div>
        )}

        {/* Modal: View Staff Profile */}
        {activeModal === 'view-staff-profile' && modalPayload && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Staff Profile: {modalPayload.name}</h3>
            <p className="text-xs text-on-surface-variant mb-4">Role: {modalPayload.role} • ID: {modalPayload.staffCode}</p>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-4 mb-4">
              <img src={modalPayload.photoUrl} alt={modalPayload.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20" />
              <div>
                <p className="text-sm font-semibold text-on-surface">{modalPayload.name}</p>
                <p className="text-xs text-on-surface-variant">Phone: {modalPayload.phone}</p>
                <p className="text-xs text-on-surface-variant">Shift: {modalPayload.shiftHours} ({modalPayload.shiftType})</p>
                <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  modalPayload.geofenceStatus === 'Verified Inside' ? 'bg-primary/10 text-primary' : 'bg-error/15 text-error'
                }`}>
                  {modalPayload.geofenceStatus}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors text-xs">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal: View Staff Schedule */}
        {activeModal === 'view-staff-schedule' && modalPayload && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Schedule: {modalPayload.name}</h3>
            <p className="text-xs text-on-surface-variant mb-4">Bi-weekly shift schedule for {modalPayload.role}</p>
            <div className="bg-surface-container rounded-xl p-4 mb-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-surface-container-high/50 rounded-lg">
                  <span className="font-semibold text-on-surface">Monday - Friday</span>
                  <span className="text-on-surface-variant">{modalPayload.shiftHours}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/50 rounded-lg">
                  <span className="font-semibold text-on-surface">Saturday</span>
                  <span className="text-on-surface-variant">Off</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-surface-container-high/50 rounded-lg">
                  <span className="font-semibold text-on-surface">Sunday</span>
                  <span className="text-on-surface-variant">Off</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/30">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors text-xs">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Modal: Edit Staff */}
        {activeModal === 'edit-staff' && modalPayload && (
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Edit Staff: {modalPayload.name}</h3>
            <p className="text-xs text-on-surface-variant mb-4">Update employee profile and settings.</p>
            <form onSubmit={(e) => { e.preventDefault(); closeModal(); }} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Phone Number</label>
                <input type="tel" defaultValue={modalPayload.phone} className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">Shift Hours</label>
                <input type="text" defaultValue={modalPayload.shiftHours} className="w-full bg-surface-container text-on-surface px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all font-mono" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">Save Changes</button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Manage Class */}
        {activeModal === 'manage-class' && modalPayload && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold">{modalPayload.category}</span>
              <span className="text-xs text-on-surface-variant">{modalPayload.studio} • {modalPayload.timeFormatted}</span>
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{modalPayload.title}</h3>
            <p className="text-xs text-on-surface-variant mb-4">Trainer: {modalPayload.trainerName} • Capacity: {modalPayload.enrolled}/{modalPayload.capacity}</p>

            <div className="bg-surface-container p-3 rounded-xl mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Class Attendance Level</span>
                <span className="font-semibold text-primary">{Math.round((modalPayload.enrolled / modalPayload.capacity) * 100)}% Full</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${Math.min(100, (modalPayload.enrolled / modalPayload.capacity) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-on-surface-variant pt-1">
                <span>Enrolled: {modalPayload.enrolled}</span>
                <span>Waitlist: {modalPayload.waitlist}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateClassCapacity(modalPayload.id, 'enroll');
                    closeModal();
                  }}
                  disabled={modalPayload.enrolled >= modalPayload.capacity}
                  className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-medium text-xs hover:opacity-90 disabled:opacity-40"
                >
                  + Enroll Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateClassCapacity(modalPayload.id, 'waitlist');
                    closeModal();
                  }}
                  className="flex-1 py-2 rounded-xl bg-surface-container-highest text-on-surface font-medium text-xs hover:bg-surface-bright"
                >
                  + Add to Waitlist
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateClassCapacity(modalPayload.id, 'drop');
                  closeModal();
                }}
                className="py-2 rounded-xl bg-error/20 text-error font-medium text-xs hover:bg-error/30 transition-colors"
              >
                Drop / Remove 1 Attendee
              </button>
            </div>
          </div>
        )}
        {/* Modal: Member Details Profile View */}
        {activeModal === 'member-details' && modalPayload && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {modalPayload.photoUrl ? (
                <img
                  src={modalPayload.photoUrl}
                  alt={modalPayload.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-outline-variant/40"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary text-xl font-bold flex items-center justify-center">
                  {modalPayload.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-headline font-bold text-on-surface">{modalPayload.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    modalPayload.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : modalPayload.status === 'expired'
                      ? 'bg-error/20 text-error'
                      : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {modalPayload.status}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant font-mono mt-0.5">
                  ID: <span className="text-primary font-semibold">{modalPayload.memberCode}</span>
                </div>
              </div>
            </div>

            {/* Quick telemetry summary */}
            <div className="grid grid-cols-2 gap-2 bg-surface-container p-3 rounded-xl border border-outline-variant/30 text-xs">
              <div>
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">Plan</div>
                <div className="font-semibold text-on-surface mt-0.5">{modalPayload.plan}</div>
              </div>
              <div>
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">Expiry Date</div>
                <div className="font-semibold text-on-surface mt-0.5">{modalPayload.expiryDate || 'N/A'}</div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">Phone</div>
                <div className="font-semibold text-on-surface mt-0.5">{modalPayload.phone}</div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">Email</div>
                <div className="font-semibold text-on-surface mt-0.5 truncate">{modalPayload.email}</div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">Total Visits</div>
                <div className="font-semibold text-primary mt-0.5">{modalPayload.totalCheckIns || 0} visits</div>
              </div>
              <div className="mt-2">
                <div className="text-[10px] text-on-surface-variant uppercase font-mono">Last Visit</div>
                <div className="font-semibold text-on-surface mt-0.5">{modalPayload.lastVisit || 'Today'}</div>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await checkInMember(modalPayload.id);
                  closeModal();
                }}
                disabled={modalPayload.status !== 'active'}
                className="flex-1 py-2 px-3 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>Check-in Now</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  renewMember(modalPayload.id);
                  closeModal();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">autorenew</span>
                <span>Renew Plan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeModal();
                  setActiveScreen('members');
                }}
                className="w-full py-2 px-3 rounded-xl bg-surface-container text-on-surface font-medium text-xs hover:bg-surface-container-high transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>Open in Full Member Directory</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
