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
  const [newMemberAadhaar, setNewMemberAadhaar] = useState('');
  const [newMemberAadhaarDoc, setNewMemberAadhaarDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [newMemberEmergName, setNewMemberEmergName] = useState('');
  const [newMemberEmergRelation, setNewMemberEmergRelation] = useState('Parent / Guardian');
  const [newMemberEmergPhone, setNewMemberEmergPhone] = useState('');

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

  // Add Staff & Physical Trainer state
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('Personal Trainer');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffShiftHours, setStaffShiftHours] = useState('06:00 - 14:00');
  const [staffAadhaar, setStaffAadhaar] = useState('');
  const [staffAadhaarDoc, setStaffAadhaarDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [staffEmergName, setStaffEmergName] = useState('');
  const [staffEmergRelation, setStaffEmergRelation] = useState('Spouse');
  const [staffEmergPhone, setStaffEmergPhone] = useState('');
  const [staffExpYears, setStaffExpYears] = useState<number>(3);
  const [staffPastWorkplace, setStaffPastWorkplace] = useState('');
  const [staffSpecializations, setStaffSpecializations] = useState('');
  const [staffCertifications, setStaffCertifications] = useState('');
  const [staffCertDoc, setStaffCertDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [staffAcademicDegree, setStaffAcademicDegree] = useState('');
  const [staffAcademicInstitution, setStaffAcademicInstitution] = useState('');
  const [staffAcademicYear, setStaffAcademicYear] = useState('');
  const [staffAcademicDoc, setStaffAcademicDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [staffResumeDoc, setStaffResumeDoc] = useState<{ name: string; dataUrl: string } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; docName?: string; docUrl?: string } | null>(null);

  // File upload reader helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (doc: { name: string; dataUrl: string }) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('File Too Large', 'Please upload a document under 8MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        callback({
          name: file.name,
          dataUrl: reader.result as string
        });
        showToast('Document Uploaded', `${file.name} ready for verification.`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

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
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              <h3 className="text-xl font-headline font-bold text-on-surface">Register New Member</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Mandatory KYC registration: Full profile, UIDAI Aadhaar verification &amp; emergency contact required.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMemberName.trim()) {
                  showToast('Missing Field', 'Please enter member full name.', 'error');
                  return;
                }
                if (!newMemberPhone.trim()) {
                  showToast('Missing Field', 'Please enter member phone number.', 'error');
                  return;
                }
                if (!newMemberAadhaar.trim() || newMemberAadhaar.replace(/\s/g, '').length < 12) {
                  showToast('Aadhaar Required', 'Please enter a valid 12-digit Aadhaar number.', 'error');
                  return;
                }
                if (!newMemberAadhaarDoc) {
                  showToast('Document Missing', 'Please upload a scan or photo of the Aadhaar card.', 'error');
                  return;
                }
                if (!newMemberEmergName.trim() || !newMemberEmergPhone.trim()) {
                  showToast('Emergency Contact Required', 'Please fill emergency contact name and phone.', 'error');
                  return;
                }

                addMember({
                  name: newMemberName,
                  email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s+/g, '.')}@gymify.io`,
                  phone: newMemberPhone,
                  plan: newMemberPlan,
                  aadhaarNumber: newMemberAadhaar,
                  aadhaarDocUrl: newMemberAadhaarDoc.dataUrl,
                  aadhaarDocName: newMemberAadhaarDoc.name,
                  emergencyContactName: newMemberEmergName,
                  emergencyContactPhone: newMemberEmergPhone,
                  emergencyContactRelation: newMemberEmergRelation
                });

                closeModal();
                setNewMemberName('');
                setNewMemberEmail('');
                setNewMemberPhone('');
                setNewMemberAadhaar('');
                setNewMemberAadhaarDoc(null);
                setNewMemberEmergName('');
                setNewMemberEmergPhone('');
              }}
              className="space-y-4 text-xs"
            >
              {/* Basic Personal Details */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block">
                  1. Personal Identity &amp; Contact
                </span>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Full Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Rahul Deshmukh"
                    className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Phone Number (WhatsApp Active) <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      placeholder="+91 98201 44521"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Email Address <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="rahul@example.in"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Membership Plan <span className="text-error">*</span>
                  </label>
                  <select
                    value={newMemberPlan}
                    onChange={(e) => setNewMemberPlan(e.target.value as MembershipPlan)}
                    className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs cursor-pointer font-medium"
                  >
                    <option value="VIP Annual">VIP Annual (₹38,500/yr) - Full Access + PT</option>
                    <option value="Monthly Standard">Monthly Standard (₹3,200/mo) - Gym Floor</option>
                    <option value="Pro Monthly">Pro Monthly (₹4,500/mo) - Floor + Classes</option>
                    <option value="Student Pass">Student Pass (₹2,200/mo) - Standard Floor</option>
                    <option value="Standard Semi-Annual">Standard Semi-Annual (₹16,500/6mo)</option>
                    <option value="Day Pass">Day Pass (₹500/day)</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Aadhaar KYC Section */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">badge</span>
                    <span>2. Government Aadhaar Card KYC</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Mandatory
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Aadhaar Card Number (12 Digits) <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={newMemberAadhaar}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setNewMemberAadhaar(formatted);
                    }}
                    placeholder="4829 1049 8812"
                    className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs font-mono tracking-wider font-semibold"
                  />
                </div>

                {/* Aadhaar Document Upload */}
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Upload Aadhaar Card Document (Front/Back) <span className="text-error">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-primary text-[20px]">cloud_upload</span>
                      <span className="text-xs font-medium text-on-surface">
                        {newMemberAadhaarDoc ? newMemberAadhaarDoc.name : 'Choose File / Photo (PDF, JPG, PNG)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setNewMemberAadhaarDoc)}
                      />
                    </label>
                    {newMemberAadhaarDoc && (
                      <button
                        type="button"
                        onClick={() => setNewMemberAadhaarDoc(null)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                  {newMemberAadhaarDoc && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Document attached: {newMemberAadhaarDoc.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mandatory Emergency Contact Section */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block">
                  3. Emergency Contact Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Contact Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newMemberEmergName}
                      onChange={(e) => setNewMemberEmergName(e.target.value)}
                      placeholder="e.g. Sunita Deshmukh"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Relationship <span className="text-error">*</span>
                    </label>
                    <select
                      value={newMemberEmergRelation}
                      onChange={(e) => setNewMemberEmergRelation(e.target.value)}
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs cursor-pointer"
                    >
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Physician">Physician / Doctor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Emergency Phone <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newMemberEmergPhone}
                      onChange={(e) => setNewMemberEmergPhone(e.target.value)}
                      placeholder="+91 98201 00000"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary transition-all text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
                  <span>Complete KYC &amp; Register</span>
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

        {/* Modal: Add Staff & Physical Trainer */}
        {activeModal === 'add-staff' && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
              <h3 className="text-xl font-headline font-bold text-on-surface">Register Staff &amp; Physical Trainer</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Mandatory onboarding KYC: Complete background verification, government Aadhaar, past fitness experience, academic degrees &amp; all document uploads required.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!staffName.trim()) {
                  showToast('Missing Field', 'Please enter employee/trainer full name.', 'error');
                  return;
                }
                if (!staffPhone.trim()) {
                  showToast('Missing Field', 'Please enter employee phone number.', 'error');
                  return;
                }
                if (!staffAadhaar.trim() || staffAadhaar.replace(/\s/g, '').length < 12) {
                  showToast('Aadhaar Required', 'Please enter a valid 12-digit Aadhaar number.', 'error');
                  return;
                }
                if (!staffAadhaarDoc) {
                  showToast('Document Missing', 'Please upload a copy/scan of the Aadhaar card.', 'error');
                  return;
                }
                if (!staffEmergName.trim() || !staffEmergPhone.trim()) {
                  showToast('Emergency Contact Required', 'Please provide emergency contact name and phone.', 'error');
                  return;
                }
                if (!staffPastWorkplace.trim()) {
                  showToast('Past Experience Required', 'Please enter previous gym / workplace experience.', 'error');
                  return;
                }
                if (!staffAcademicDegree.trim() || !staffAcademicInstitution.trim()) {
                  showToast('Academic Qualification Required', 'Please enter academic degree and university/institution.', 'error');
                  return;
                }
                if (!staffCertDoc && !staffAcademicDoc && !staffResumeDoc) {
                  showToast('Document Required', 'Please upload at least one qualification certificate or resume.', 'error');
                  return;
                }

                addStaff({
                  name: staffName,
                  role: staffRole,
                  phone: staffPhone,
                  shiftHours: staffShiftHours,
                  aadhaarNumber: staffAadhaar,
                  aadhaarDocUrl: staffAadhaarDoc?.dataUrl,
                  aadhaarDocName: staffAadhaarDoc?.name,
                  emergencyContactName: staffEmergName,
                  emergencyContactPhone: staffEmergPhone,
                  emergencyContactRelation: staffEmergRelation,
                  pastExperienceYears: staffExpYears,
                  pastWorkplace: staffPastWorkplace,
                  specializations: staffSpecializations,
                  certifications: staffCertifications,
                  academicDegree: staffAcademicDegree,
                  academicInstitution: staffAcademicInstitution,
                  academicYear: staffAcademicYear,
                  certificationDocUrl: staffCertDoc?.dataUrl,
                  certificationDocName: staffCertDoc?.name,
                  academicDocUrl: staffAcademicDoc?.dataUrl,
                  academicDocName: staffAcademicDoc?.name,
                  resumeDocUrl: staffResumeDoc?.dataUrl,
                  resumeDocName: staffResumeDoc?.name,
                });

                closeModal();
                setStaffName('');
                setStaffPhone('');
                setStaffAadhaar('');
                setStaffAadhaarDoc(null);
                setStaffEmergName('');
                setStaffEmergPhone('');
                setStaffPastWorkplace('');
                setStaffSpecializations('');
                setStaffCertifications('');
                setStaffCertDoc(null);
                setStaffAcademicDegree('');
                setStaffAcademicInstitution('');
                setStaffAcademicYear('');
                setStaffAcademicDoc(null);
                setStaffResumeDoc(null);
              }}
              className="space-y-4 text-xs"
            >
              {/* 1. Basic Employee Profile & Shift */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block">
                  1. Basic Profile &amp; Role
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Assigned Role *
                    </label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none focus:ring-1 focus:ring-primary text-xs cursor-pointer"
                    >
                      <option value="Senior Trainer">Senior Trainer (PT &amp; Floor Lead)</option>
                      <option value="Personal Trainer">Personal Trainer (1-on-1 Coaching)</option>
                      <option value="Yoga Instructor">Yoga &amp; Mind-Body Instructor</option>
                      <option value="Operations Manager">Operations &amp; Branch Manager</option>
                      <option value="Front Desk Lead">Front Desk Lead &amp; Cashier</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Phone Number (WhatsApp Active) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="+91 99304 88122"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Shift Schedule Hours *
                    </label>
                    <select
                      value={staffShiftHours}
                      onChange={(e) => setStaffShiftHours(e.target.value)}
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs cursor-pointer font-mono"
                    >
                      <option value="06:00 - 14:00">06:00 - 14:00 (Morning Rush Shift)</option>
                      <option value="14:00 - 22:00">14:00 - 22:00 (Evening Peak Shift)</option>
                      <option value="08:00 - 17:00">08:00 - 17:00 (Full Day Operations)</option>
                      <option value="11:00 - 20:00">11:00 - 20:00 (Mid-Day Split Shift)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Mandatory Aadhaar Identity & Document Upload */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">badge</span>
                    <span>2. Government Aadhaar Card KYC</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Mandatory
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Aadhaar Card Number (12 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={staffAadhaar}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setStaffAadhaar(formatted);
                    }}
                    placeholder="7192 4810 9943"
                    className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono font-semibold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Upload Aadhaar Card Document (Front/Back) *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-primary text-[20px]">cloud_upload</span>
                      <span className="text-xs font-medium text-on-surface">
                        {staffAadhaarDoc ? staffAadhaarDoc.name : 'Choose Aadhaar File / Photo (PDF, JPG, PNG)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setStaffAadhaarDoc)}
                      />
                    </label>
                    {staffAadhaarDoc && (
                      <button
                        type="button"
                        onClick={() => setStaffAadhaarDoc(null)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                  {staffAadhaarDoc && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Attached: {staffAadhaarDoc.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Emergency Contact Details */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono block">
                  3. Emergency Contact Details (Mandatory)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffEmergName}
                      onChange={(e) => setStaffEmergName(e.target.value)}
                      placeholder="e.g. Kavita Rao"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Relationship *
                    </label>
                    <select
                      value={staffEmergRelation}
                      onChange={(e) => setStaffEmergRelation(e.target.value)}
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs cursor-pointer"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Guardian">Guardian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Emergency Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={staffEmergPhone}
                      onChange={(e) => setStaffEmergPhone(e.target.value)}
                      placeholder="+91 99304 77100"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Past Professional Experience & Certifications */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">fitness_center</span>
                    <span>4. Past Experience &amp; Trainer Certifications</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Mandatory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Years of Experience *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      required
                      value={staffExpYears}
                      onChange={(e) => setStaffExpYears(Number(e.target.value) || 0)}
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Previous Gyms / Workplaces *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffPastWorkplace}
                      onChange={(e) => setStaffPastWorkplace(e.target.value)}
                      placeholder="e.g. Gold's Gym Indiranagar & Talwalkars"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Fitness Specializations
                    </label>
                    <input
                      type="text"
                      value={staffSpecializations}
                      onChange={(e) => setStaffSpecializations(e.target.value)}
                      placeholder="e.g. Hypertrophy, Powerlifting, HIIT, Mobility"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Certifications (e.g. ACE CPT, ACSM, ISSA)
                    </label>
                    <input
                      type="text"
                      value={staffCertifications}
                      onChange={(e) => setStaffCertifications(e.target.value)}
                      placeholder="e.g. ACE Certified Personal Trainer, CPR/AED"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Upload Certification Credential Document (PDF/Image) *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-primary text-[20px]">workspace_premium</span>
                      <span className="text-xs font-medium text-on-surface">
                        {staffCertDoc ? staffCertDoc.name : 'Upload Trainer Certification Document (PDF/JPG)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setStaffCertDoc)}
                      />
                    </label>
                    {staffCertDoc && (
                      <button
                        type="button"
                        onClick={() => setStaffCertDoc(null)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                  {staffCertDoc && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Attached: {staffCertDoc.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Academic Qualifications & Document Vault */}
              <div className="bg-surface-container/60 p-3.5 rounded-2xl border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary font-mono flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">school</span>
                    <span>5. Academic Qualifications &amp; Documents</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    Mandatory
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Academic Degree / Diploma *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffAcademicDegree}
                      onChange={(e) => setStaffAcademicDegree(e.target.value)}
                      placeholder="e.g. B.Sc. Sports Science / B.P.Ed"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      University / Institution *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffAcademicInstitution}
                      onChange={(e) => setStaffAcademicInstitution(e.target.value)}
                      placeholder="e.g. Manipal Academy / Delhi Univ"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-1">
                      Graduation Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffAcademicYear}
                      onChange={(e) => setStaffAcademicYear(e.target.value)}
                      placeholder="2020"
                      className="w-full bg-surface-container text-on-surface px-3 py-2 rounded-xl border border-outline-variant/40 focus:border-primary outline-none text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Upload Degree Certificate */}
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Upload Academic Degree Certificate (PDF/Image) *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                      <span className="text-xs font-medium text-on-surface">
                        {staffAcademicDoc ? staffAcademicDoc.name : 'Upload Degree / Marksheet Scan (PDF/JPG)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setStaffAcademicDoc)}
                      />
                    </label>
                    {staffAcademicDoc && (
                      <button
                        type="button"
                        onClick={() => setStaffAcademicDoc(null)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                  {staffAcademicDoc && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Attached: {staffAcademicDoc.name}</span>
                    </div>
                  )}
                </div>

                {/* Upload Resume / CV Document */}
                <div>
                  <label className="block font-semibold text-on-surface mb-1">
                    Upload Professional Resume / CV (PDF/DOC) *
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-outline-variant/50 hover:border-primary/60 bg-surface-container hover:bg-surface-container-high rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                      <span className="text-xs font-medium text-on-surface">
                        {staffResumeDoc ? staffResumeDoc.name : 'Upload Comprehensive Trainer / Staff Resume (PDF)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setStaffResumeDoc)}
                      />
                    </label>
                    {staffResumeDoc && (
                      <button
                        type="button"
                        onClick={() => setStaffResumeDoc(null)}
                        className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                  {staffResumeDoc && (
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-500 font-medium">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Attached: {staffResumeDoc.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">how_to_reg</span>
                  <span>Complete Registration &amp; Onboard Staff</span>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                  VERIFIED EMPLOYEE DOSSIER
                </span>
                <h3 className="text-xl font-headline font-bold text-on-surface">
                  {modalPayload.name}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                  ID: {modalPayload.staffCode} • Role: {modalPayload.role}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                modalPayload.geofenceStatus === 'Verified Inside'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-error/15 text-error'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{modalPayload.geofenceStatus}</span>
              </span>
            </div>

            {/* Profile Avatar & Shifts */}
            <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/30">
              <img
                src={modalPayload.photoUrl}
                alt={modalPayload.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
              />
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-on-surface text-sm">{modalPayload.name}</div>
                <div className="text-on-surface-variant font-mono flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">phone</span>
                  <span>{modalPayload.phone}</span>
                </div>
                <div className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>Shift: {modalPayload.shiftHours} ({modalPayload.shiftType || 'Full Day'})</span>
                </div>
              </div>
            </div>

            {/* Aadhaar Verification & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Aadhaar Card */}
              <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px]">badge</span>
                    <span>Government Aadhaar</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                    UIDAI Verified
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-primary tracking-wider">
                  {modalPayload.aadhaarNumber || '7192 •••• 9943'}
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        title: `${modalPayload.name} - Government Aadhaar Document`,
                        docName: modalPayload.aadhaarDocName || 'Aadhaar_KYC_Verified.pdf',
                        docUrl: modalPayload.aadhaarDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
                      })
                    }
                    className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>View Aadhaar Document ({modalPayload.aadhaarDocName || 'aadhaar_card.pdf'})</span>
                  </button>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-error text-[16px]">emergency</span>
                    <span>Emergency Contact</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-medium">
                    {modalPayload.emergencyContactRelation || 'Spouse'}
                  </span>
                </div>
                <div className="font-semibold text-on-surface">
                  {modalPayload.emergencyContactName || 'Family Contact Registered'}
                </div>
                <div className="font-mono text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>{modalPayload.emergencyContactPhone || modalPayload.phone}</span>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${(modalPayload.emergencyContactPhone || modalPayload.phone).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
                  >
                    <span className="material-symbols-outlined text-[12px]">chat</span>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Past Professional Experience & Certifications */}
            <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2 text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">fitness_center</span>
                <span>Past Professional Experience &amp; Specializations</span>
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-on-surface-variant text-[11px] block">Experience</span>
                  <span className="font-semibold text-on-surface font-mono">
                    {modalPayload.pastExperienceYears !== undefined ? `${modalPayload.pastExperienceYears} Years in Fitness` : '5+ Years in Fitness'}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant text-[11px] block">Previous Gyms</span>
                  <span className="font-semibold text-on-surface">
                    {modalPayload.pastWorkplace || "Gold's Gym & Cult.fit"}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-on-surface-variant text-[11px] block">Specializations</span>
                <span className="text-on-surface">
                  {modalPayload.specializations || 'Strength Coaching, Hypertrophy, Mobility, Core Stability'}
                </span>
              </div>
              <div className="pt-1 flex items-center justify-between border-t border-outline-variant/20">
                <div>
                  <span className="text-on-surface-variant text-[11px] block">Certifications</span>
                  <span className="font-semibold text-on-surface text-[11px]">
                    {modalPayload.certifications || 'ACE-CPT, ISSA Fitness Trainer, CPR/AED'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewDoc({
                      title: `${modalPayload.name} - Professional Certification Credentials`,
                      docName: modalPayload.certificationDocName || 'Trainer_Certificate_Credential.pdf',
                      docUrl: modalPayload.certificationDocUrl || 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80',
                    })
                  }
                  className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                  <span>View Certificate</span>
                </button>
              </div>
            </div>

            {/* Academic Qualifications & Document Vault */}
            <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2 text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">school</span>
                <span>Academic Qualifications &amp; Resume Vault</span>
              </span>
              <div className="flex justify-between items-center pt-1">
                <div>
                  <div className="font-semibold text-on-surface">
                    {modalPayload.academicDegree || 'B.Sc. Exercise & Sports Science'}
                  </div>
                  <div className="text-on-surface-variant text-[11px]">
                    {modalPayload.academicInstitution || 'Manipal Academy of Higher Education'} • Class of {modalPayload.academicYear || '2020'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        title: `${modalPayload.name} - Academic Degree Certificate`,
                        docName: modalPayload.academicDocName || 'Academic_Degree_Certificate.pdf',
                        docUrl: modalPayload.academicDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
                      })
                    }
                    className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    title="View Degree Certificate"
                  >
                    <span className="material-symbols-outlined text-[14px]">school</span>
                    <span>Degree</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewDoc({
                        title: `${modalPayload.name} - Curriculum Vitae / Resume`,
                        docName: modalPayload.resumeDocName || 'Employee_CV_Resume.pdf',
                        docUrl: modalPayload.resumeDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
                      })
                    }
                    className="p-1.5 rounded-lg bg-primary text-on-primary text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:opacity-90"
                    title="View Employee Resume"
                  >
                    <span className="material-symbols-outlined text-[14px]">description</span>
                    <span>Resume</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-medium hover:bg-surface-container-high transition-colors text-xs cursor-pointer"
              >
                Close Dossier
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
                    modalPayload?.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : modalPayload?.status === 'expired'
                      ? 'bg-error/20 text-error'
                      : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {modalPayload?.status || 'active'}
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
                disabled={modalPayload?.status !== 'active'}
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

      {/* Document Lightbox / Verification Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified_user</span>
                <div>
                  <h4 className="text-sm font-headline font-bold text-on-surface">{previewDoc.title}</h4>
                  <p className="text-[11px] font-mono text-on-surface-variant">{previewDoc.docName || 'Document_Verified.pdf'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-4 flex-1 flex flex-col items-center justify-center min-h-[300px] overflow-hidden bg-surface-container-low rounded-2xl my-2 border border-outline-variant/20 p-2">
              {previewDoc.docUrl && (previewDoc.docUrl.startsWith('data:image') || previewDoc.docUrl.startsWith('http')) ? (
                <img
                  src={previewDoc.docUrl}
                  alt={previewDoc.title}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <span className="material-symbols-outlined text-primary text-[48px]">picture_as_pdf</span>
                  <div className="text-xs font-semibold text-on-surface">{previewDoc.docName}</div>
                  <div className="text-[11px] text-on-surface-variant">Cryptographically signed digital copy stored in local secure vault.</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30 text-xs">
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>UIDAI / Academic Registry Verified</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewDoc.docUrl || '#';
                    a.download = previewDoc.docName || 'verified_document.pdf';
                    a.click();
                    showToast('Document Downloaded', `Saved ${previewDoc.docName}`, 'success');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-semibold flex items-center gap-1.5 hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
