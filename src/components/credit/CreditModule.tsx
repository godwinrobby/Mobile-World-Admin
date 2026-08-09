import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseItem } from '../../types';
import { Pagination } from '../common/Pagination';
import {
  Plus,
  Receipt,
  Trash2,
  Filter,
  Search,
  TrendingDown,
  Tag
} from 'lucide-react';

export const CreditModule: React.FC = () => {
  const {
    expenses,
    addExpense,
    deleteExpense,
    settings
  } = useApp();

  // Expense Modals & Filter State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseItem['category']>('Rent');
  const [expCustomCategory, setExpCustomCategory] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().substring(0, 10));
  const [expPaymentMethod, setExpPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other'>('UPI');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('All');

  // Pagination States
  const [expensePage, setExpensePage] = useState(1);
  const [expensePageSize, setExpensePageSize] = useState(10);

  // Total Summary Math
  const totalShopExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const todayStr = new Date().toISOString().substring(0, 10);
  const todaysExpenses = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Filtered & Paginated Expenses Logic
  const filteredExpenses = expenses.filter(e => {
    const matchesCat = selectedExpenseCategory === 'All' || e.category === selectedExpenseCategory;
    const q = expenseSearchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      e.category.toLowerCase().includes(q) ||
      e.expenseNumber.toLowerCase().includes(q) ||
      (e.paidTo && e.paidTo.toLowerCase().includes(q)) ||
      (e.notes && e.notes.toLowerCase().includes(q)) ||
      e.paymentMethod.toLowerCase().includes(q)
    );
    return matchesCat && matchesQuery;
  });

  const filteredExpensesTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const paginatedExpenses = filteredExpenses.slice(
    (expensePage - 1) * expensePageSize,
    expensePage * expensePageSize
  );

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || parseFloat(expAmount) <= 0) return;

    const isCustom = expCategory === 'Other Expense' || expCategory === 'Custom Expense';
    const catName = isCustom && expCustomCategory.trim()
      ? (expCustomCategory.trim() as any)
      : expCategory;

    addExpense({
      category: catName,
      amount: parseFloat(expAmount),
      date: expDate || todayStr,
      paymentMethod: expPaymentMethod,
      paidTo: expPaidTo.trim() || undefined,
      notes: expNotes.trim() || undefined
    });

    // Reset Form
    setExpAmount('');
    setExpCustomCategory('');
    setExpPaidTo('');
    setExpNotes('');
    setShowAddExpenseModal(false);
  };

  return (
    <div id="credit-module-container" className="space-y-6">
      
      {/* Top Banner & KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Shop Expenses Logged</div>
            <div className="text-2xl font-extrabold text-purple-400 tracking-tight">
              {settings.currencySymbol}{totalShopExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Cumulative store outflow
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400 font-medium">Today's Outflow Expense</div>
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {settings.currencySymbol}{todaysExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Logged today ({todayStr})
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Vouchers Logged</div>
            <div className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {expenses.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Expense vouchers on record
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Module Title & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            <span>Store Outflow Expenses</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Track shop bills, salaries, maintenance, rent, and daily operational expenditures</p>
        </div>

        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Record Store Outflow Expense</span>
        </button>
      </div>

      {/* Expenses Management View */}
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by category, recipient, notes..."
              value={expenseSearchQuery}
              onChange={(e) => {
                setExpenseSearchQuery(e.target.value);
                setExpensePage(1);
              }}
              className="w-full bg-slate-950 text-slate-100 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-slate-400 font-medium">Type:</span>
              <select
                value={selectedExpenseCategory}
                onChange={(e) => {
                  setSelectedExpenseCategory(e.target.value);
                  setExpensePage(1);
                }}
                className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Expense Types ({expenses.length})</option>
                <option value="Rent" className="bg-slate-900 text-white">🏢 Rent</option>
                <option value="Food & Refreshments" className="bg-slate-900 text-white">🍔 Food & Refreshments</option>
                <option value="Mobile / DTH Recharge" className="bg-slate-900 text-white">📱 Mobile / DTH Recharge</option>
                <option value="Internet & Wifi" className="bg-slate-900 text-white">🌐 Internet & Wifi</option>
                <option value="Electricity & Utilities" className="bg-slate-900 text-white">⚡ Electricity & Utilities</option>
                <option value="Salaries & Wages" className="bg-slate-900 text-white">👨‍💼 Salaries & Wages</option>
                <option value="Maintenance & Repairs" className="bg-slate-900 text-white">🛠️ Maintenance & Repairs</option>
                <option value="Printing & Stationery" className="bg-slate-900 text-white">🖨️ Printing & Stationery</option>
                <option value="Tea & Snacks" className="bg-slate-900 text-white">☕ Tea & Snacks</option>
                <option value="Marketing & Ads" className="bg-slate-900 text-white">📢 Marketing & Ads</option>
                <option value="Transportation & Freight" className="bg-slate-900 text-white">🚚 Transportation & Freight</option>
                <option value="Shop Equipment" className="bg-slate-900 text-white">💻 Shop Equipment</option>
                <option value="Other Expense" className="bg-slate-900 text-white">📦 Other Expense</option>
              </select>
            </div>

            <div className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl">
              Subtotal: {settings.currencySymbol}{filteredExpensesTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Expense List Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Receipt className="w-10 h-10 mx-auto text-slate-600 opacity-50" />
              <div className="text-sm font-semibold">No store expenses match the filter criteria</div>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record New Expense</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Date & Ref #</th>
                      <th className="p-3.5">Type of Expense</th>
                      <th className="p-3.5">Paid To / Recipient</th>
                      <th className="p-3.5">Method</th>
                      <th className="p-3.5">Notes / Purpose</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {paginatedExpenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-800/50 transition">
                        <td className="p-3.5">
                          <div className="font-mono text-slate-200 font-bold">{e.expenseNumber}</div>
                          <div className="text-[10px] text-slate-400">{e.date}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {e.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">
                          {e.paidTo || 'General Vendor'}
                        </td>
                        <td className="p-3.5">
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                            {e.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate">
                          {e.notes || '-'}
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-purple-400 text-sm">
                          {settings.currencySymbol}{e.amount.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Delete expense voucher ${e.expenseNumber} (${settings.currencySymbol}${e.amount})?`)) {
                                deleteExpense(e.id);
                              }
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                            title="Delete Expense Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Expense List Pagination */}
              <Pagination
                currentPage={expensePage}
                totalPages={Math.ceil(filteredExpenses.length / expensePageSize) || 1}
                totalItems={filteredExpenses.length}
                pageSize={expensePageSize}
                onPageChange={(p) => setExpensePage(p)}
                onPageSizeChange={(sz) => {
                  setExpensePageSize(sz);
                  setExpensePage(1);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Record Store Outflow Expense - SIDE POPUP DRAWER */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full overflow-y-auto p-6 text-slate-100 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Record Store Outflow Expense</h3>
                  <p className="text-xs text-slate-400">Log shop bills, salaries, rent, or daily operational costs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Type of Expense *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-100 font-medium px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="Rent">🏢 Rent</option>
                    <option value="Food & Refreshments">🍔 Food & Refreshments</option>
                    <option value="Mobile / DTH Recharge">📱 Mobile / DTH Recharge</option>
                    <option value="Internet & Wifi">🌐 Internet & Wifi</option>
                    <option value="Electricity & Utilities">⚡ Electricity & Utilities</option>
                    <option value="Salaries & Wages">👨‍💼 Salaries & Wages</option>
                    <option value="Maintenance & Repairs">🛠️ Maintenance & Repairs</option>
                    <option value="Printing & Stationery">🖨️ Printing & Stationery</option>
                    <option value="Tea & Snacks">☕ Tea & Snacks</option>
                    <option value="Marketing & Ads">📢 Marketing & Ads</option>
                    <option value="Transportation & Freight">🚚 Transportation & Freight</option>
                    <option value="Shop Equipment">💻 Shop Equipment</option>
                    <option value="Custom Expense">✨ Custom Expense (Add Custom Name)</option>
                    <option value="Other Expense">📦 Other Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Expense Amount ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-800 text-purple-300 font-extrabold text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {(expCategory === 'Other Expense' || expCategory === 'Custom Expense') && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Specify Custom Expense Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop License Fee, Pest Control, Cleaning, etc."
                    value={expCustomCategory}
                    onChange={(e) => setExpCustomCategory(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Paid To / Recipient</label>
                  <input
                    type="text"
                    placeholder="e.g. Landlord, Airtel, Tea Stall, Staff"
                    value={expPaidTo}
                    onChange={(e) => setExpPaidTo(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Expense Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Payment Method</label>
                  <select
                    value={expPaymentMethod}
                    onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Notes / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Bill payment reference, monthly bill..."
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Outflow Entry:</span>
                <span className="font-extrabold text-purple-400 text-base">
                  {settings.currencySymbol}{expAmount ? parseFloat(expAmount).toLocaleString() : '0'}
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 transition flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Save Expense Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
