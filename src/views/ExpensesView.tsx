import React, { useState, useMemo } from 'react';
import { useGym } from '../context/GymContext';
import { Expense } from '../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, showToast } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('year');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formDesc, setFormDesc] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<Expense['category']>('Supplies');
  const [formMethod, setFormMethod] = useState<Expense['paymentMethod']>('Card');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Derived filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch =
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.ref.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || exp.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalExpenseAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  // KPIs
  const monthlyExpenses = 6494.00;
  const monthlyRevenue = 456.00;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;

  const handleExportCSV = () => {
    const headers = ['REF', 'DATE', 'CATEGORY', 'DESCRIPTION', 'AMOUNT', 'METHOD'];
    const rows = filteredExpenses.map(e => [e.ref, e.date, e.category, `"${e.description}"`, e.amount, e.paymentMethod]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gymify_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Expenses Exported', `Generated CSV with ${filteredExpenses.length} records.`, 'success');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (!formDesc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Validation Error', 'Please enter a valid description and positive amount.', 'error');
      return;
    }

    addExpense({
      ref: `EXP-${String(expenses.length + 22).padStart(4, '0')}`,
      date: formDate,
      category: formCategory,
      description: formDesc.trim(),
      amount: parsedAmount,
      paymentMethod: formMethod,
    });

    setFormDesc('');
    setFormAmount('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Expenses</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {expenses.length} expenses recorded.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 rounded-xl text-xs font-semibold text-on-surface transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-semibold shadow-md shadow-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">add</span>
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Expenses this month */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">Expenses this month</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1.5">
              ₹{monthlyExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
        </div>

        {/* Card 2: Revenue this month */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">Revenue this month</div>
            <div className="text-2xl font-bold font-headline text-on-surface font-mono mt-1.5">
              ₹{monthlyRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">currency_rupee</span>
          </div>
        </div>

        {/* Card 3: Profit this month */}
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/30 flex items-center justify-between">
          <div>
            <div className="text-xs text-on-surface-variant font-medium">Profit this month</div>
            <div className="text-2xl font-bold font-headline text-red-500 font-mono mt-1.5">
              -₹{Math.abs(monthlyProfit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">trending_down</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description..."
              className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All categories</option>
            <option value="supplies">Supplies</option>
            <option value="salaries">Salaries</option>
            <option value="marketing">Marketing</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="maintenance">Maintenance</option>
            <option value="equipment">Equipment</option>
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-surface-container-low px-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="year">This Year</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="text-xs font-mono text-on-surface-variant shrink-0">
          {filteredExpenses.length} shown • ₹{totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[10px] uppercase font-mono text-on-surface-variant tracking-wider bg-surface-container-low/50">
                <th className="py-3 px-4 font-semibold">Ref</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-on-surface-variant">
                    No expense records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-on-surface-variant text-[11px]">
                      {exp.ref}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-on-surface-variant text-[11px]">
                      {exp.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-container-high border border-outline-variant/30 text-on-surface">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-on-surface">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-on-surface">
                      ₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-on-surface-variant">
                        <button
                          onClick={() => showToast('Edit Expense', `Editing ${exp.ref}`, 'info')}
                          className="p-1 hover:text-primary rounded hover:bg-surface-container transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 hover:text-error rounded hover:bg-surface-container transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature highlight tags matching Image 5 footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/20 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</span>
          Expense Categories
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/20 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</span>
          Profit Tracking
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-surface-container text-on-surface border border-outline-variant/20 shadow-xs">
          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</span>
          CSV Export
        </span>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container w-full max-w-md rounded-2xl p-6 border border-outline-variant/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="text-base font-headline font-bold text-on-surface">+ Record New Expense</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-on-surface mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Protein shake restock, Dumbbells set"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface font-mono border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-medium text-on-surface mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface font-mono border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-on-surface mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Supplies">Supplies</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-on-surface mb-1">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Payment">Mobile Payment</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-on-primary font-semibold shadow-md shadow-primary/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
