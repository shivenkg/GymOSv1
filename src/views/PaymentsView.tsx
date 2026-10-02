import React, { useState } from 'react';
import { useGym } from '../context/GymContext';
import { Invoice, InvoiceStatus } from '../types';
import { AsyncDataState } from '../components/AsyncDataState';
import { UPIFeePaymentModal } from '../components/UPIFeePaymentModal';

export const PaymentsView: React.FC = () => {
  const { invoices, openModal, showToast } = useGym();
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'pending' | 'subs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [upiPaymentTarget, setUpiPaymentTarget] = useState<{
    memberName: string;
    planName: string;
    memberCode: string;
    memberPhone: string;
    amount: number;
  } | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    if (!inv) return false;
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.memberName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.planOrDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.method || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'pending') {
      return matchesSearch && (inv.status === 'Pending' || inv.status === 'Overdue');
    }
    if (activeTab === 'invoices') {
      return matchesSearch && inv.status === 'Paid';
    }
    if (activeTab === 'subs') {
      return matchesSearch && ((inv.planOrDescription || '').toLowerCase().includes('annual') || (inv.planOrDescription || '').toLowerCase().includes('monthly'));
    }
    return matchesSearch;
  });

  const totalCollected = invoices
    .filter((i) => i && i.status === 'Paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 1845000);

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Payments &amp; Billing</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage invoices, UPI collections, membership billings, and outstanding dues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUpiPaymentTarget({
              memberName: 'Aarav Sharma',
              planName: 'Pro Monthly Membership Dues',
              memberCode: '#MEM-8402',
              memberPhone: '+91 98201 44521',
              amount: 4500
            })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            title="Generate custom UPI QR Code & Share via WhatsApp"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span>Generate UPI QR</span>
          </button>
          <button
            onClick={() => showToast('CSV Exported', 'Downloaded financial ledger (Oct 2026)', 'success')}
            className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openModal('record-payment')}
            className="bg-primary hover:bg-primary-fixed-dim text-on-primary text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <AsyncDataState entityName="Payments & Ledger">
      {/* KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue MTD */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Revenue MTD
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span> +12.4%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">vs ₹16,40,000 last month</p>
        </div>

        {/* Pending Collections */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Pending Collections
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">₹22,900</span>
            <span className="text-[11px] font-semibold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
              4 Overdue
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">Requires immediate follow-up</p>
        </div>

        {/* Today's Collection */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Today's Collection
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">today</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">₹1,84,500</span>
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              26 Txns
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">Peak hour: 07:00 AM - 09:30 AM</p>
        </div>

        {/* Failed / Refunded */}
        <div className="bg-surface-container rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5 border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Failed / Refunded
            </span>
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">error</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-headline font-bold text-on-surface font-mono">₹6,000</span>
            <span className="text-[11px] font-semibold text-error bg-error/10 px-2 py-0.5 rounded-full">
              1 item
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">Auto-retry scheduled</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-surface-container rounded-2xl p-3.5 flex flex-col lg:flex-row items-center justify-between gap-4 border border-outline-variant/30">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl w-full lg:w-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'invoices', label: 'Paid Invoices' },
            { id: 'pending', label: 'Pending / Overdue' },
            { id: 'subs', label: 'Subscriptions' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 lg:max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-outline-variant/30"
            placeholder="Search by member, invoice #..."
            type="text"
          />
        </div>
      </div>

      {/* Comprehensive Data Table */}
      <div className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-5">Invoice ID</th>
                <th className="py-3.5 px-5">Member Name</th>
                <th className="py-3.5 px-5">Plan / Description</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">Date &amp; Time</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low text-xs text-on-surface">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'Paid';
                const isPending = inv.status === 'Pending';
                const isOverdue = inv.status === 'Overdue';

                return (
                  <tr key={inv.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-primary font-semibold">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-[11px]">
                          {inv.memberInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface">{inv.memberName}</div>
                          <div className="text-[10px] text-on-surface-variant font-mono">{inv.memberCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-on-surface-variant">{inv.planOrDescription}</td>
                    <td className="py-3.5 px-5 font-mono font-bold">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-surface-container-low text-on-surface">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {inv.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-on-surface-variant font-mono text-[11px]">{inv.dateTimeFormatted}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isPaid
                            ? 'bg-primary/10 text-primary'
                            : isPending
                            ? 'bg-tertiary/10 text-tertiary'
                            : isOverdue
                            ? 'bg-error/10 text-error'
                            : 'bg-surface-variant text-on-surface-variant'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setUpiPaymentTarget({
                              memberName: inv.memberName,
                              planName: inv.planOrDescription,
                              memberCode: inv.memberCode,
                              memberPhone: '+91 98201 44521',
                              amount: inv.amount
                            });
                          }}
                          className="p-1.5 hover:bg-emerald-500/15 text-emerald-500 rounded-lg transition-colors"
                          title="Generate UPI QR & Share via WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            showToast('Receipt Generated', `Invoice ${inv.invoiceNumber} receipt ready`, 'info');
                          }}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                          title="Download / View Receipt"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant border-t border-outline-variant/20">
          <div>
            Showing <span className="font-semibold text-on-surface font-mono">{filteredInvoices.length}</span> recorded
            transactions
          </div>
          <div className="flex items-center gap-1.5">
            <button className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold">1</button>
            <button className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface">2</button>
            <button className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface">3</button>
            <button className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface">Next</button>
          </div>
        </div>
      </div>
      </AsyncDataState>

      {/* Invoice Details / Voucher Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-surface-dim/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="text-center pb-4 border-b border-outline-variant/30 mb-4">
              <span className="text-xs uppercase font-bold text-primary font-headline tracking-widest">
                Gymify Tax Invoice &amp; GST Receipt
              </span>
              <h3 className="text-2xl font-headline font-bold text-on-surface mt-1 font-mono">
                {selectedInvoice.invoiceNumber}
              </h3>
              <div className="text-[11px] text-on-surface-variant mt-0.5">
                GSTIN: 23AAGCV9820K1ZX • SAC: 999723 • {selectedInvoice.dateTimeFormatted}
              </div>
            </div>

            <div className="space-y-2.5 text-xs bg-surface-container p-4 rounded-xl mb-4">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Member Name</span>
                <span className="font-semibold text-on-surface">{selectedInvoice.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Member Code</span>
                <span className="font-mono text-on-surface">{selectedInvoice.memberCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Service / Plan</span>
                <span className="text-on-surface">{selectedInvoice.planOrDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Payment Method</span>
                <span className="font-semibold text-primary">{selectedInvoice.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Payment Status</span>
                <span className="font-semibold text-emerald-400">{selectedInvoice.status}</span>
              </div>

              {/* GST 18% Itemized Breakdown */}
              <div className="pt-2 border-t border-outline-variant/30 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Taxable Value (Base)</span>
                  <span>₹{Math.round(selectedInvoice.amount / 1.18).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>CGST (9.0%)</span>
                  <span>₹{Math.round((selectedInvoice.amount / 1.18) * 0.09).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>SGST (9.0%)</span>
                  <span>₹{Math.round((selectedInvoice.amount / 1.18) * 0.09).toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-1.5 border-t border-outline-variant/30 flex justify-between text-sm font-bold">
                  <span className="text-on-surface">Total Gross Amount</span>
                  <span className="text-[#e50914] font-headline">₹{selectedInvoice.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Generate & Share UPI QR Code */}
            <button
              type="button"
              onClick={() => {
                setUpiPaymentTarget({
                  memberName: selectedInvoice.memberName,
                  planName: selectedInvoice.planOrDescription,
                  memberCode: selectedInvoice.memberCode,
                  memberPhone: '+91 98201 44521',
                  amount: selectedInvoice.amount
                });
                setSelectedInvoice(null);
              }}
              className="w-full mb-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
              <span>Generate Dynamic UPI QR &amp; Share via WhatsApp</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  showToast('WhatsApp Sent', `GST Tax invoice PDF sent to ${selectedInvoice.memberName} via WhatsApp.`, 'success');
                  setSelectedInvoice(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Send WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  showToast('Print Job Sent', 'Sending thermal receipt to counter printer...', 'success');
                  setSelectedInvoice(null);
                }}
                className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
              >
                Print Voucher
              </button>
              <button
                onClick={() => {
                  showToast('Receipt Downloaded', `Saved ${selectedInvoice.invoiceNumber}.pdf`, 'success');
                  setSelectedInvoice(null);
                }}
                className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic UPI Fee Payment Modal with WhatsApp Dispatch */}
      {upiPaymentTarget && (
        <UPIFeePaymentModal
          isOpen={Boolean(upiPaymentTarget)}
          onClose={() => setUpiPaymentTarget(null)}
          memberName={upiPaymentTarget.memberName}
          memberCode={upiPaymentTarget.memberCode}
          memberPhone={upiPaymentTarget.memberPhone}
          planName={upiPaymentTarget.planName}
          defaultAmount={upiPaymentTarget.amount}
        />
      )}
    </div>
  );
};
