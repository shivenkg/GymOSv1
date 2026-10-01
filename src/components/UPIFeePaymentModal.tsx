import React, { useState } from 'react';
import { useGym } from '../context/GymContext';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  memberName?: string;
  planName?: string;
  memberCode?: string;
  memberPhone?: string;
}

export const UPIFeePaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = 4500,
  memberName = 'Aarav Sharma',
  planName = 'Pro Monthly Membership',
  memberCode = '#MEM-8402',
  memberPhone = '+91 98201 44521'
}) => {
  const { showToast, addInvoice } = useGym();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [customDesc, setCustomDesc] = useState<string>(planName);
  const [whatsAppNumber, setWhatsAppNumber] = useState<string>(memberPhone);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'whatsapp'>('qr');

  if (!isOpen) return null;

  // Real UPI Deep Link string according to NPCI specs
  const upiId = 'gymofy.pay@icici';
  const merchantName = 'Gymify Fitness Club';
  const transactionRef = `GYM${Date.now().toString().slice(-6)}`;
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(customDesc)}&tr=${transactionRef}`;

  // High quality QR code URL via dynamic SVG QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=0f172a&margin=6`;

  // WhatsApp formatted invoice text
  const cleanPhone = whatsAppNumber.replace(/[^0-9]/g, '');
  const formattedWhatsAppMsg = `🏋️ *GYMIFY FITNESS CLUB - OFFICIAL FEE PAYMENT NOTICE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Member Name:* ${memberName}
💳 *Member ID:* ${memberCode}
📋 *Plan / Description:* ${customDesc}
💰 *Total Payable:* ₹${amount.toLocaleString('en-IN')}
🆔 *Transaction Ref:* ${transactionRef}
📅 *Invoice Date:* ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}

⚡ *Instant UPI Payment Deep Link:*
${upiLink}

📲 *UPI QR Code Pass:*
${qrCodeUrl}

_Please tap the UPI link on your mobile (Google Pay, PhonePe, Paytm, or BHIM) to complete your fee payment instantly._
━━━━━━━━━━━━━━━━━━━━━━━━━━
💪 Thank you for training with Gymify!`;

  const handleSimulatePayment = () => {
    setPaymentStatus('verifying');
    setTimeout(() => {
      setPaymentStatus('success');
      addInvoice({
        memberName: memberName,
        planOrDescription: customDesc,
        amount: amount,
        method: 'UPI',
        status: 'Paid'
      });
      showToast(
        '₹ UPI Payment Verified',
        `₹${amount.toLocaleString('en-IN')} received via UPI for ${memberName} (Ref: ${transactionRef})`,
        'success'
      );
      setTimeout(() => {
        setPaymentStatus('idle');
        onClose();
      }, 1400);
    }, 1200);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    showToast('UPI VPA Copied', `Copied ${upiId} to clipboard`, 'info');
  };

  const copyWhatsAppMessage = () => {
    navigator.clipboard.writeText(formattedWhatsAppMsg);
    setIsCopied(true);
    showToast('Payment Notice Copied', 'WhatsApp payment message copied to clipboard.', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareToWhatsApp = () => {
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Invalid Phone Number', 'Please enter a valid 10-digit mobile number for WhatsApp.', 'error');
      return;
    }
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(formattedWhatsAppMsg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    showToast('WhatsApp Dispatched', `Opening WhatsApp for ${memberName} (${targetPhone})`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-1">
            <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
            <span>Dynamic UPI Fee Engine</span>
          </div>
          <h3 className="text-xl font-headline font-bold text-on-surface">
            QR Code &amp; WhatsApp Fee Dispatch
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time dynamic UPI payment generation with 1-click WhatsApp delivery
          </p>
        </div>

        {/* Amount & Member Summary */}
        <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-on-surface">{memberName}</div>
            <div className="text-[11px] text-on-surface-variant font-mono">{memberCode} • {customDesc}</div>
            <div className="text-[11px] text-primary flex items-center gap-1 mt-0.5 font-mono">
              <span className="material-symbols-outlined text-[13px]">phone</span>
              <span>{whatsAppNumber}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-on-surface-variant block font-medium">Payable Amount</span>
            <span className="text-2xl font-headline font-bold text-primary font-mono">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Interactive Tabs: QR Scan View vs WhatsApp Dispatch */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl mb-4 border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
            <span>Live UPI QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
            <span>Share via WhatsApp</span>
          </button>
        </div>

        {/* TAB 1: LIVE QR CODE */}
        {activeTab === 'qr' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* QR Code Container */}
            <div className="bg-white p-5 rounded-2xl shadow-inner border border-outline-variant/40 flex flex-col items-center justify-center relative">
              {/* NPCI UPI branding badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold text-slate-800 tracking-wider font-mono">BHIM</span>
                <span className="text-[12px] font-bold text-primary font-sans">UPI</span>
                <span className="text-[10px] text-slate-500">• Auto-calculated for ₹{amount.toLocaleString('en-IN')}</span>
              </div>

              <div className="w-52 h-52 bg-white rounded-xl p-2 flex items-center justify-center relative border border-slate-200">
                {paymentStatus === 'verifying' ? (
                  <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-slate-700">Verifying bank settlement...</span>
                  </div>
                ) : paymentStatus === 'success' ? (
                  <div className="absolute inset-0 bg-emerald-50 rounded-xl flex flex-col items-center justify-center gap-1.5 animate-in zoom-in duration-200">
                    <span className="material-symbols-outlined text-emerald-600 text-[48px]">check_circle</span>
                    <span className="text-sm font-bold text-emerald-800">Payment Successful!</span>
                    <span className="text-[10px] text-emerald-600 font-mono">Txn ID: {transactionRef}</span>
                  </div>
                ) : null}

                <img
                  src={qrCodeUrl}
                  alt={`UPI QR Code for ₹${amount}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* VPA and Copy */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-mono text-[11px]">VPA: <strong>{upiId}</strong></span>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">content_copy</span>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Preset Amount Toggles */}
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Quick Fee Amount Presets
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[1500, 3200, 4500, 18000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-1.5 rounded-xl font-mono text-center font-semibold transition-all border cursor-pointer ${
                      amount === amt
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WHATSAPP DIRECT DISPATCH */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* WhatsApp Target Input */}
            <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Recipient WhatsApp Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="text"
                    value={whatsAppNumber.replace(/^\+91\s*/, '')}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="98201 44521"
                    className="w-full bg-surface-container-low text-on-surface pl-11 pr-3 py-2 rounded-xl text-xs font-mono border border-outline-variant/30 focus:border-emerald-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Will send the personalized invoice, dynamic UPI deep link, and QR pass directly to member's WhatsApp.
                </p>
              </div>

              {/* Message Preview Box */}
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Message Preview
                </label>
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 font-mono text-[11px] text-on-surface-variant whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                  {formattedWhatsAppMsg}
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Action */}
            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Send QR Code &amp; Invoice via WhatsApp</span>
            </button>
          </div>
        )}

        {/* Global Action Footer */}
        <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copyWhatsAppMessage}
              className="py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                {isCopied ? 'check' : 'content_copy'}
              </span>
              <span>{isCopied ? 'Copied Link!' : 'Copy Payment Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-all border border-emerald-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Dispatch WhatsApp</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={paymentStatus !== 'idle'}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 active:scale-[0.99] transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Simulate Customer Scan &amp; Record Payment</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel / Close
          </button>
        </div>

        <div className="mt-3 text-center text-[10px] text-on-surface-variant/70">
          Secured by ICICI Bank Unified Payments Interface • NPCI UPI Compliant
        </div>
      </div>
    </div>
  );
};
