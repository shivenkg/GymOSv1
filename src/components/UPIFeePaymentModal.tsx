import React, { useState } from 'react';
import { useGym } from '../context/GymContext';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  memberName?: string;
  planName?: string;
  memberCode?: string;
}

export const UPIFeePaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultAmount = 4500,
  memberName = 'Aarav Sharma',
  planName = 'Pro Monthly Membership',
  memberCode = '#MEM-8402'
}) => {
  const { showToast, addInvoice } = useGym();
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [selectedUPIApp, setSelectedUPIApp] = useState<'any' | 'gpay' | 'phonepe' | 'paytm'>('any');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle');
  const [customDesc, setCustomDesc] = useState<string>(planName);

  if (!isOpen) return null;

  // Real UPI Deep Link string according to NPCI specs
  const upiId = 'gymofy.pay@icici';
  const merchantName = 'Gymofy Fitness Club';
  const transactionRef = `GYM${Date.now().toString().slice(-6)}`;
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(customDesc)}&tr=${transactionRef}`;

  // High quality QR code URL via dynamic SVG QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=0f172a&margin=6`;

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

  return (
    <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-1">
            <span className="material-symbols-outlined text-[15px]">qr_code_2</span>
            <span>Instant UPI Fee Gateway</span>
          </div>
          <h3 className="text-xl font-headline font-bold text-on-surface">
            Pay Fees via QR Code
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Scan using Google Pay, PhonePe, Paytm or BHIM UPI
          </p>
        </div>

        {/* Amount & Member Summary */}
        <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/30 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-on-surface">{memberName}</div>
            <div className="text-[11px] text-on-surface-variant font-mono">{memberCode} • {customDesc}</div>
          </div>
          <div className="text-right">
            <span className="text-xs text-on-surface-variant block">Total Due</span>
            <span className="text-xl font-headline font-bold text-primary font-mono">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-5 rounded-2xl shadow-inner border border-outline-variant/40 flex flex-col items-center justify-center relative mb-4">
          {/* NPCI UPI branding badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-800 tracking-wider font-mono">BHIM</span>
            <span className="text-[12px] font-bold text-primary font-sans">UPI</span>
            <span className="text-[10px] text-slate-500">• 0% Transaction Surcharge</span>
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
              alt="UPI QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          {/* VPA and Copy */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-mono text-[11px]">VPA: <strong>{upiId}</strong></span>
            <button
              onClick={copyUpiId}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[12px]">content_copy</span>
              <span>Copy</span>
            </button>
          </div>
        </div>

        {/* Preset Amount Toggles */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
          {[1500, 3200, 4500, 18000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`py-1.5 rounded-xl font-mono text-center font-semibold transition-all border ${
                amount === amt
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
              }`}
            >
              ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSimulatePayment}
            disabled={paymentStatus !== 'idle'}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>Simulate Customer Scan &amp; Pay</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-colors"
          >
            Cancel / Close Gateway
          </button>
        </div>

        <div className="mt-3 text-center text-[10px] text-on-surface-variant/70">
          Secured by ICICI Bank Unified Payments Interface • ISO 27001 Certified
        </div>
      </div>
    </div>
  );
};
