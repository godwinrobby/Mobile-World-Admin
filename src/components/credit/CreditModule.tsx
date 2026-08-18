import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerCreditAccount, ExpenseItem, LedgerEntry } from '../../types';
import { Pagination } from '../common/Pagination';
import {
  Plus,
  Receipt,
  Trash2,
  Filter,
  Search,
  TrendingDown,
  Tag,
  CreditCard,
  Users,
  Eye,
  Edit2,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Check
} from 'lucide-react';

export const CreditModule: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordCustomerPayment,
    recordCustomerUdhar,
    suppliers,
    recordSupplierPayment,
    settings
  } = useApp();

  // Navigation Sub-Tab State
  const [activeMainTab, setActiveMainTab] = useState<'customer-credits' | 'expenses' | 'wholesaler-debts'>('customer-credits');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // 1. CUSTOMER UDHAR KHATA STATES & LOGIC
  // ==========================================
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('All');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(10);

  // Customer Modals
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedViewCustomer, setSelectedViewCustomer] = useState<CustomerCreditAccount | null>(null);
  const [selectedEditCustomer, setSelectedEditCustomer] = useState<CustomerCreditAccount | null>(null);
  const [selectedDeleteCustomer, setSelectedDeleteCustomer] = useState<CustomerCreditAccount | null>(null);

  // Quick Action Modals for Customer (Payment / Udhar)
  const [payCustomer, setPayCustomer] = useState<CustomerCreditAccount | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [payNote, setPayNote] = useState('');

  const [udharCustomer, setUdharCustomer] = useState<CustomerCreditAccount | null>(null);
  const [udharAmount, setUdharAmount] = useState('');
  const [udharRefInvoice, setUdharRefInvoice] = useState('');
  const [udharNote, setUdharNote] = useState('');

  // Customer Form Data (Add / Edit)
  const [custForm, setCustForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: '10000',
    status: 'Active' as CustomerCreditAccount['status']
  });

  // Customer Calculations
  const totalUdharOutstanding = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const totalCreditLimitAllocated = customers.reduce((sum, c) => sum + (c.creditLimit || 0), 0);
  const overdueCustomerCount = customers.filter(c => c.status === 'Overdue Alert' || (c.currentBalance > (c.creditLimit || 0))).length;

  const filteredCustomers = customers.filter(c => {
    const matchesStatus = customerStatusFilter === 'All' || c.status === customerStatusFilter;
    const q = customerSearchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
    return matchesStatus && matchesQuery;
  });

  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * customerPageSize,
    customerPage * customerPageSize
  );

  const handleOpenAddCustomer = () => {
    setCustForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: '10000',
      status: 'Active'
    });
    setShowAddCustomerModal(true);
  };

  const handleSaveCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name.trim() || !custForm.phone.trim()) return;

    const limitVal = parseFloat(custForm.creditLimit) || 0;

    if (selectedEditCustomer) {
      updateCustomer(selectedEditCustomer.id, {
        name: custForm.name.trim(),
        phone: custForm.phone.trim(),
        email: custForm.email.trim() || undefined,
        address: custForm.address.trim() || undefined,
        creditLimit: limitVal,
        status: custForm.status
      });
      showToast(`Updated customer "${custForm.name}" profile & credit limit successfully!`);
      // Update view modal if open
      if (selectedViewCustomer?.id === selectedEditCustomer.id) {
        setSelectedViewCustomer(prev => prev ? {
          ...prev,
          name: custForm.name.trim(),
          phone: custForm.phone.trim(),
          email: custForm.email.trim() || undefined,
          address: custForm.address.trim() || undefined,
          creditLimit: limitVal,
          status: custForm.status
        } : null);
      }
      setSelectedEditCustomer(null);
    } else {
      addCustomer({
        name: custForm.name.trim(),
        phone: custForm.phone.trim(),
        email: custForm.email.trim() || undefined,
        address: custForm.address.trim() || undefined,
        creditLimit: limitVal,
        status: custForm.status
      });
      showToast(`Created new Udhar Khata account for "${custForm.name}"!`);
      setShowAddCustomerModal(false);
    }
  };

  const handleOpenEditCustomer = (c: CustomerCreditAccount) => {
    setSelectedEditCustomer(c);
    setCustForm({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      creditLimit: (c.creditLimit || 0).toString(),
      status: c.status || 'Active'
    });
  };

  const handleDeleteCustomerConfirm = () => {
    if (!selectedDeleteCustomer) return;
    deleteCustomer(selectedDeleteCustomer.id);
    showToast(`Deleted customer "${selectedDeleteCustomer.name}" account.`);
    if (selectedViewCustomer?.id === selectedDeleteCustomer.id) {
      setSelectedViewCustomer(null);
    }
    setSelectedDeleteCustomer(null);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payCustomer || !payAmount || parseFloat(payAmount) <= 0) return;

    const amt = parseFloat(payAmount);
    recordCustomerPayment(payCustomer.id, amt, payMode, payNote.trim() || 'Payment Received');
    showToast(`Recorded ${settings.currencySymbol}${amt} payment from ${payCustomer.name}!`);

    // Refresh view customer state if open
    if (selectedViewCustomer?.id === payCustomer.id) {
      const updated = customers.find(c => c.id === payCustomer.id);
      if (updated) {
        setSelectedViewCustomer({
          ...updated,
          currentBalance: Math.max(0, updated.currentBalance - amt)
        });
      }
    }

    setPayCustomer(null);
    setPayAmount('');
    setPayNote('');
  };

  const handleRecordUdharSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!udharCustomer || !udharAmount || parseFloat(udharAmount) <= 0) return;

    const amt = parseFloat(udharAmount);
    recordCustomerUdhar(udharCustomer.id, amt, udharRefInvoice.trim() || 'UDHAR-MANUAL', udharNote.trim() || 'Credit Sale');
    showToast(`Added ${settings.currencySymbol}${amt} Udhar entry to ${udharCustomer.name}!`);

    // Refresh view customer state if open
    if (selectedViewCustomer?.id === udharCustomer.id) {
      const updated = customers.find(c => c.id === udharCustomer.id);
      if (updated) {
        setSelectedViewCustomer({
          ...updated,
          currentBalance: updated.currentBalance + amt
        });
      }
    }

    setUdharCustomer(null);
    setUdharAmount('');
    setUdharRefInvoice('');
    setUdharNote('');
  };

  // ==========================================
  // 2. STORE EXPENSES STATES & LOGIC
  // ==========================================
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedViewExpense, setSelectedViewExpense] = useState<ExpenseItem | null>(null);
  const [selectedEditExpense, setSelectedEditExpense] = useState<ExpenseItem | null>(null);
  const [selectedDeleteExpense, setSelectedDeleteExpense] = useState<ExpenseItem | null>(null);

  const [expCategory, setExpCategory] = useState<ExpenseItem['category']>('Rent');
  const [expCustomCategory, setExpCustomCategory] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().substring(0, 10));
  const [expPaymentMethod, setExpPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other'>('UPI');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expNotes, setExpNotes] = useState('');

  const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('All');
  const [expensePage, setExpensePage] = useState(1);
  const [expensePageSize, setExpensePageSize] = useState(10);

  const totalShopExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayStr = new Date().toISOString().substring(0, 10);
  const todaysExpenses = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

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

  const handleOpenAddExpense = () => {
    setSelectedEditExpense(null);
    setExpCategory('Rent');
    setExpCustomCategory('');
    setExpAmount('');
    setExpDate(todayStr);
    setExpPaymentMethod('UPI');
    setExpPaidTo('');
    setExpNotes('');
    setShowAddExpenseModal(true);
  };

  const handleOpenEditExpense = (exp: ExpenseItem) => {
    setSelectedEditExpense(exp);
    const isStandardCat = [
      'Rent', 'Food & Refreshments', 'Mobile / DTH Recharge', 'Internet & Wifi',
      'Electricity & Utilities', 'Salaries & Wages', 'Maintenance & Repairs',
      'Printing & Stationery', 'Tea & Snacks', 'Marketing & Ads',
      'Transportation & Freight', 'Shop Equipment'
    ].includes(exp.category);

    if (isStandardCat) {
      setExpCategory(exp.category);
      setExpCustomCategory('');
    } else {
      setExpCategory('Custom Expense');
      setExpCustomCategory(exp.category);
    }

    setExpAmount(exp.amount.toString());
    setExpDate(exp.date || todayStr);
    setExpPaymentMethod(exp.paymentMethod || 'UPI');
    setExpPaidTo(exp.paidTo || '');
    setExpNotes(exp.notes || '');
    setShowAddExpenseModal(true);
  };

  const handleSaveExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || parseFloat(expAmount) <= 0) return;

    const isCustom = expCategory === 'Other Expense' || expCategory === 'Custom Expense';
    const catName = isCustom && expCustomCategory.trim()
      ? (expCustomCategory.trim() as any)
      : expCategory;

    if (selectedEditExpense) {
      updateExpense(selectedEditExpense.id, {
        category: catName,
        amount: parseFloat(expAmount),
        date: expDate || todayStr,
        paymentMethod: expPaymentMethod,
        paidTo: expPaidTo.trim() || undefined,
        notes: expNotes.trim() || undefined
      });
      showToast(`Updated expense voucher ${selectedEditExpense.expenseNumber}!`);
      // Update view modal if active
      if (selectedViewExpense?.id === selectedEditExpense.id) {
        setSelectedViewExpense({
          ...selectedViewExpense,
          category: catName,
          amount: parseFloat(expAmount),
          date: expDate || todayStr,
          paymentMethod: expPaymentMethod,
          paidTo: expPaidTo.trim() || undefined,
          notes: expNotes.trim() || undefined
        });
      }
      setSelectedEditExpense(null);
    } else {
      addExpense({
        category: catName,
        amount: parseFloat(expAmount),
        date: expDate || todayStr,
        paymentMethod: expPaymentMethod,
        paidTo: expPaidTo.trim() || undefined,
        notes: expNotes.trim() || undefined
      });
      showToast(`Recorded store outflow expense of ${settings.currencySymbol}${parseFloat(expAmount).toLocaleString()}!`);
    }

    setShowAddExpenseModal(false);
  };

  const handleDeleteExpenseConfirm = () => {
    if (!selectedDeleteExpense) return;
    deleteExpense(selectedDeleteExpense.id);
    showToast(`Deleted expense voucher ${selectedDeleteExpense.expenseNumber}.`);
    if (selectedViewExpense?.id === selectedDeleteExpense.id) {
      setSelectedViewExpense(null);
    }
    setSelectedDeleteExpense(null);
  };

  // Helper formatting for credit status badges
  const getCreditStatusBadge = (status: CustomerCreditAccount['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Overdue Alert':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Blocked':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="credit-module-container" className="space-y-6">

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Module Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 space-x-8 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('customer-credits')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'customer-credits'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Customer Udhar & Credit Khata</span>
          {overdueCustomerCount > 0 && (
            <span className="ml-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {overdueCustomerCount} Alert
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('expenses')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'expenses'
              ? 'border-purple-500 text-purple-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Store Outflow Expenses ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('wholesaler-debts')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeMainTab === 'wholesaler-debts'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Wholesaler Payable Debts ({suppliers.length})</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* SUBTAB 1: CUSTOMER UDHAR & CREDIT KHATA     */}
      {/* ========================================== */}
      {activeMainTab === 'customer-credits' && (
        <div className="space-y-6">
          {/* KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Total Udhar Outstanding</div>
                <div className="text-2xl font-extrabold text-amber-400 tracking-tight mt-0.5">
                  {settings.currencySymbol}{totalUdharOutstanding.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Owed by customers</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Active Udhar Accounts</div>
                <div className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  {customers.length} Accounts
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Registered in store ledger</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Credit Limit Allocated</div>
                <div className="text-2xl font-extrabold text-indigo-300 tracking-tight mt-0.5">
                  {settings.currencySymbol}{totalCreditLimitAllocated.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Total allowed limit sum</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Overdue / Limit Alerts</div>
                <div className={`text-2xl font-extrabold tracking-tight mt-0.5 ${overdueCustomerCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {overdueCustomerCount} Accounts
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Require repayment follow-up</div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${overdueCustomerCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Title & Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Customer Udhar Khata Ledger</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage customer credit limits, outstanding balances, and repayment ledgers</p>
            </div>

            <button
              onClick={handleOpenAddCustomer}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-900/30 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Udhar Account</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers by name, phone number, or email..."
                value={customerSearchQuery}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value);
                  setCustomerPage(1);
                }}
                className="w-full bg-slate-950 text-slate-100 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 text-xs placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-400 font-medium">Status:</span>
                <select
                  value={customerStatusFilter}
                  onChange={(e) => {
                    setCustomerStatusFilter(e.target.value);
                    setCustomerPage(1);
                  }}
                  className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">All Statuses ({customers.length})</option>
                  <option value="Active" className="bg-slate-900 text-white">Active Accounts</option>
                  <option value="Overdue Alert" className="bg-slate-900 text-white">Overdue Alert</option>
                  <option value="Blocked" className="bg-slate-900 text-white">Blocked / Frozen</option>
                </select>
              </div>

              <div className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                Filtered Owed: {settings.currencySymbol}{filteredCustomers.reduce((sum, c) => sum + c.currentBalance, 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* LISTING TABLE FOR CUSTOMERS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-500 opacity-50" />
                <div className="text-sm font-semibold">No customer credit accounts match your search</div>
                <button
                  onClick={handleOpenAddCustomer}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/30 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Customer Account</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="p-3.5">Customer Profile</th>
                        <th className="p-3.5">Credit Usage & Limit</th>
                        <th className="p-3.5">Last Activity</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Udhar Balance</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {paginatedCustomers.map(c => {
                        const usagePct = c.creditLimit > 0 ? Math.min(100, Math.round((c.currentBalance / c.creditLimit) * 100)) : 0;

                        return (
                          <tr key={c.id} className="hover:bg-slate-800/40 transition">
                            {/* Customer Profile */}
                            <td className="p-3.5">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                                  {c.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-sm">{c.name}</div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    <span>{c.phone}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Credit Usage Bar */}
                            <td className="p-3.5 min-w-[180px]">
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-400 font-medium">Used Limit:</span>
                                <span className="font-bold text-slate-200">
                                  {settings.currencySymbol}{c.currentBalance.toLocaleString()} / {settings.currencySymbol}{c.creditLimit.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    usagePct >= 90 ? 'bg-rose-500' : usagePct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${usagePct}%` }}
                                />
                              </div>
                            </td>

                            {/* Last Activity */}
                            <td className="p-3.5">
                              <div className="text-slate-200 font-mono text-[11px]">
                                {c.lastPaymentDate || 'No payments yet'}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {c.ledgerHistory.length} ledger record(s)
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCreditStatusBadge(c.status)}`}>
                                {c.status}
                              </span>
                            </td>

                            {/* Udhar Balance */}
                            <td className="p-3.5 text-right font-extrabold text-sm">
                              {c.currentBalance > 0 ? (
                                <span className="text-amber-400">
                                  {settings.currencySymbol}{c.currentBalance.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-emerald-400">Clear (0)</span>
                              )}
                            </td>

                            {/* Actions: VIEW & EDIT OPTIONS */}
                            <td className="p-3.5">
                              <div className="flex items-center justify-center space-x-1.5">
                                {/* VIEW OPTION */}
                                <button
                                  onClick={() => setSelectedViewCustomer(c)}
                                  className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition cursor-pointer"
                                  title="View Full Udhar Ledger & Account Statement"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* EDIT OPTION */}
                                <button
                                  onClick={() => handleOpenEditCustomer(c)}
                                  className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                                  title="Edit Customer Profile & Credit Limit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* RECORD PAYMENT QUICK ACTION */}
                                <button
                                  onClick={() => setPayCustomer(c)}
                                  className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                                  title="Collect Udhar Repayment"
                                >
                                  <Wallet className="w-4 h-4" />
                                </button>

                                {/* DELETE OPTION */}
                                <button
                                  onClick={() => setSelectedDeleteCustomer(c)}
                                  className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                                  title="Delete Udhar Account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-800 bg-slate-950/40 p-2.5">
                  <Pagination
                    currentPage={customerPage}
                    totalPages={Math.ceil(filteredCustomers.length / customerPageSize) || 1}
                    totalItems={filteredCustomers.length}
                    pageSize={customerPageSize}
                    onPageChange={(p) => setCustomerPage(p)}
                    onPageSizeChange={(sz) => {
                      setCustomerPageSize(sz);
                      setCustomerPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20, 50]}
                    className="border-0 bg-transparent p-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUBTAB 2: STORE OUTFLOW EXPENSES           */}
      {/* ========================================== */}
      {activeMainTab === 'expenses' && (
        <div className="space-y-6">
          {/* Expenses KPI Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Total Shop Expenses Logged</div>
                <div className="text-2xl font-extrabold text-purple-400 tracking-tight mt-0.5">
                  {settings.currencySymbol}{totalShopExpenses.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Cumulative store outflow</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Today's Outflow Expense</div>
                <div className="text-2xl font-extrabold text-amber-400 tracking-tight mt-0.5">
                  {settings.currencySymbol}{todaysExpenses.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Logged today ({todayStr})</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <div className="text-xs text-slate-400 font-medium">Total Vouchers Logged</div>
                <div className="text-2xl font-extrabold text-slate-100 tracking-tight mt-0.5">
                  {expenses.length} Vouchers
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Operational store vouchers</div>
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
              <p className="text-xs text-slate-400 mt-0.5">Track shop rent, salaries, wifi, utilities, snacks, and daily operational expenditures</p>
            </div>

            <button
              onClick={handleOpenAddExpense}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-900/30 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Store Outflow Expense</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search expenses by category, recipient, notes..."
                value={expenseSearchQuery}
                onChange={(e) => {
                  setExpenseSearchQuery(e.target.value);
                  setExpensePage(1);
                }}
                className="w-full bg-slate-950 text-slate-100 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 text-xs placeholder-slate-500"
              />
            </div>

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

          {/* LISTING TABLE FOR EXPENSES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Receipt className="w-10 h-10 mx-auto text-slate-500 opacity-50" />
                <div className="text-sm font-semibold">No store expenses match the filter criteria</div>
                <button
                  onClick={handleOpenAddExpense}
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record New Expense</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                      <tr>
                        <th className="p-3.5">Date & Ref #</th>
                        <th className="p-3.5">Type of Expense</th>
                        <th className="p-3.5">Paid To / Recipient</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">Notes / Purpose</th>
                        <th className="p-3.5 text-right">Amount</th>
                        <th className="p-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {paginatedExpenses.map(e => (
                        <tr key={e.id} className="hover:bg-slate-800/40 transition">
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

                          {/* Actions: VIEW & EDIT OPTIONS FOR EXPENSE */}
                          <td className="p-3.5">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* VIEW EXPENSE VOUCHER */}
                              <button
                                onClick={() => setSelectedViewExpense(e)}
                                className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition cursor-pointer"
                                title="View Expense Voucher Receipt"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* EDIT EXPENSE VOUCHER */}
                              <button
                                onClick={() => handleOpenEditExpense(e)}
                                className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition cursor-pointer"
                                title="Edit Expense Voucher"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* DELETE EXPENSE */}
                              <button
                                onClick={() => setSelectedDeleteExpense(e)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                                title="Delete Expense Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-800 bg-slate-950/40 p-2.5">
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
                    className="border-0 bg-transparent p-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUBTAB 3: WHOLESALER PAYABLE DEBTS         */}
      {/* ========================================== */}
      {activeMainTab === 'wholesaler-debts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span>Wholesaler & Supplier Khata Debts</span>
              </h2>
              <p className="text-xs text-slate-400">
                Track B2B phone distributors, credit terms, and store payable ledgers
              </p>
            </div>
            <div className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-xl">
              Total Payable: {settings.currencySymbol}{suppliers.reduce((s, x) => s + x.currentPayable, 0).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{s.companyName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Contact: {s.contactPerson} • {s.phone}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                    {s.category}
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Shop Owed Debt:</span>
                  <span className={`font-extrabold text-base ${s.currentPayable > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {settings.currencySymbol}{s.currentPayable.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Last Activity: {s.lastTransactionDate}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const amt = prompt(`Enter payment amount to pay supplier "${s.companyName}":`);
                        if (amt && parseFloat(amt) > 0) {
                          recordSupplierPayment(s.id, parseFloat(amt), 'Bank Transfer', 'Wholesaler Settlement');
                          showToast(`Recorded ${settings.currencySymbol}${amt} payment to ${s.companyName}!`);
                        }
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                    >
                      Pay Wholesaler
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: VIEW CUSTOMER CREDIT LEDGER (EYE BUTTON)                    */}
      {/* ==================================================================== */}
      {selectedViewCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-800 text-white">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-lg">
                  {selectedViewCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>{selectedViewCustomer.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCreditStatusBadge(selectedViewCustomer.status)}`}>
                      {selectedViewCustomer.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span><Phone className="w-3 h-3 inline mr-1" />{selectedViewCustomer.phone}</span>
                    {selectedViewCustomer.email && <span><Mail className="w-3 h-3 inline mr-1" />{selectedViewCustomer.email}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer text-xs flex items-center gap-1.5"
                  title="Print Ledger Statement"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => setSelectedViewCustomer(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="printable-area p-6 space-y-6">
              
              {/* Account Balance Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Current Outstanding Udhar</div>
                  <div className={`text-2xl font-extrabold mt-1 ${selectedViewCustomer.currentBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {settings.currencySymbol}{selectedViewCustomer.currentBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Owed to store</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Allowed Credit Limit</div>
                  <div className="text-2xl font-extrabold text-indigo-300 mt-1">
                    {settings.currencySymbol}{(selectedViewCustomer.creditLimit || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Maximum credit threshold</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400">Available Credit Margin</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {settings.currencySymbol}{Math.max(0, (selectedViewCustomer.creditLimit || 0) - selectedViewCustomer.currentBalance).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Remaining allowance</div>
                </div>
              </div>

              {/* Quick Actions Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-300">Quick Ledger Actions:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setPayCustomer(selectedViewCustomer);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>+ Collect Payment</span>
                  </button>

                  <button
                    onClick={() => {
                      setUdharCustomer(selectedViewCustomer);
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Record Udhar Entry</span>
                  </button>

                  <button
                    onClick={() => {
                      handleOpenEditCustomer(selectedViewCustomer);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              {/* Complete Inner Ledger Transactions History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Ledger Statement & Transaction History</span>
                  <span className="text-slate-500 font-normal text-[11px]">
                    {selectedViewCustomer.ledgerHistory.length} Record(s)
                  </span>
                </h4>

                {selectedViewCustomer.ledgerHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                    <FileText className="w-8 h-8 mx-auto text-slate-500 opacity-50 mb-2" />
                    <p className="text-xs font-medium">No ledger entries recorded yet for this customer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-semibold">
                        <tr>
                          <th className="p-3">Date / Time</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Ref Invoice / Mode</th>
                          <th className="p-3">Note / Description</th>
                          <th className="p-3">Recorded By</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {selectedViewCustomer.ledgerHistory.map(entry => {
                          const isCredit = entry.type === 'Credit (Payment Received)';

                          return (
                            <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                              <td className="p-3 font-mono text-[11px] text-slate-300">
                                {entry.timestamp}
                              </td>

                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isCredit
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}>
                                  {isCredit ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                  {isCredit ? 'Payment Received' : 'Udhar Given'}
                                </span>
                              </td>

                              <td className="p-3 font-mono text-slate-300">
                                {entry.referenceInvoice || entry.paymentMode || '-'}
                              </td>

                              <td className="p-3 text-slate-300 max-w-xs truncate">
                                {entry.note || '-'}
                              </td>

                              <td className="p-3 text-slate-400">
                                {entry.recordedBy || 'Staff'}
                              </td>

                              <td className={`p-3 text-right font-extrabold text-sm ${
                                isCredit ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {isCredit ? '-' : '+'}{settings.currencySymbol}{entry.amount.toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: EDIT / ADD CUSTOMER PROFILE (EDIT BUTTON)                    */}
      {/* ==================================================================== */}
      {(showAddCustomerModal || selectedEditCustomer) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {selectedEditCustomer ? 'Edit Customer Udhar Profile' : 'Register New Udhar Khata Account'}
                  </h3>
                  <p className="text-xs text-slate-400">Manage contact information and allowed credit limits</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddCustomerModal(false);
                  setSelectedEditCustomer(null);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={custForm.name}
                  onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={custForm.email}
                    onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Shop #42, Main Market, City"
                  value={custForm.address}
                  onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Credit Limit ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={custForm.creditLimit}
                    onChange={(e) => setCustForm({ ...custForm, creditLimit: e.target.value })}
                    className="w-full bg-slate-950 text-indigo-300 font-bold px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Account Status</label>
                  <select
                    value={custForm.status}
                    onChange={(e) => setCustForm({ ...custForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Active">Active (Allowed Udhar)</option>
                    <option value="Overdue Alert">Overdue Alert</option>
                    <option value="Blocked">Blocked / Frozen</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCustomerModal(false);
                    setSelectedEditCustomer(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-900/30 transition cursor-pointer"
                >
                  {selectedEditCustomer ? 'Save Customer Changes' : 'Create Udhar Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: VIEW EXPENSE VOUCHER DETAIL (EYE BUTTON)                     */}
      {/* ==================================================================== */}
      {selectedViewExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-800 text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Expense Voucher Receipt</h3>
                  <p className="text-xs font-mono text-purple-400">{selectedViewExpense.expenseNumber}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer text-xs flex items-center gap-1.5"
                  title="Print Expense Voucher"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => setSelectedViewExpense(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Body */}
            <div className="printable-area bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{settings.shopName || 'Mobile Shop Store'}</div>
                  <div className="text-slate-400 text-[11px]">Official Expense Voucher Record</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Date Logged</div>
                  <div className="font-mono font-bold text-slate-200">{selectedViewExpense.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Expense Category</span>
                  <span className="inline-block mt-1 font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30">
                    {selectedViewExpense.category}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Payment Method</span>
                  <span className="inline-block mt-1 font-mono text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                    {selectedViewExpense.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Paid To / Recipient</span>
                  <span className="font-semibold text-slate-200 mt-1 block">
                    {selectedViewExpense.paidTo || 'General Store Expense'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Recorded By Staff</span>
                  <span className="font-semibold text-slate-200 mt-1 block">
                    {selectedViewExpense.createdBy || 'Store Admin'}
                  </span>
                </div>
              </div>

              {selectedViewExpense.notes && (
                <div className="text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Purpose / Notes</span>
                  <p className="text-slate-200 mt-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    {selectedViewExpense.notes}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Voucher Amount:</span>
                <span className="text-2xl font-extrabold text-purple-400">
                  {settings.currencySymbol}{selectedViewExpense.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  handleOpenEditExpense(selectedViewExpense);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Voucher</span>
              </button>

              <button
                onClick={() => setSelectedViewExpense(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: RECORD STORE OUTFLOW EXPENSE / EDIT EXPENSE                 */}
      {/* ==================================================================== */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full overflow-y-auto p-6 text-slate-100 space-y-5 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {selectedEditExpense ? 'Edit Expense Voucher' : 'Record Store Outflow Expense'}
                  </h3>
                  <p className="text-xs text-slate-400">Log shop bills, salaries, rent, or daily operational costs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddExpenseModal(false);
                  setSelectedEditExpense(null);
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpenseSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Type of Expense *</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-100 font-medium px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer"
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
                    className="w-full bg-slate-950 text-purple-300 font-extrabold text-sm px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 font-medium"
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
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Expense Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Payment Method</label>
                  <select
                    value={expPaymentMethod}
                    onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer"
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
                    className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
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
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    setSelectedEditExpense(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{selectedEditExpense ? 'Save Expense Changes' : 'Save Expense Voucher'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: COLLECT REPAYMENT FROM CUSTOMER                             */}
      {/* ==================================================================== */}
      {payCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Wallet className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Collect Repayment</h3>
              </div>
              <button onClick={() => setPayCustomer(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Record payment received from <strong className="text-white">{payCustomer.name}</strong> ({payCustomer.phone}).
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Outstanding Udhar:</span>
              <span className="font-extrabold text-amber-400 text-sm">
                {settings.currencySymbol}{payCustomer.currentBalance.toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Repayment Amount ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 2000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-950 text-emerald-400 font-extrabold text-sm px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Method</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Note / Payment Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref #99812, Partial Settlement"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition cursor-pointer"
                >
                  Confirm & Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: RECORD NEW UDHAR ENTRY FOR CUSTOMER                         */}
      {/* ==================================================================== */}
      {udharCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Plus className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Record New Udhar Entry</h3>
              </div>
              <button onClick={() => setUdharCustomer(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Add credit entry to <strong className="text-white">{udharCustomer.name}</strong> ({udharCustomer.phone}).
            </p>

            <form onSubmit={handleRecordUdharSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Udhar Amount ({settings.currencySymbol}) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 3500"
                  value={udharAmount}
                  onChange={(e) => setUdharAmount(e.target.value)}
                  className="w-full bg-slate-950 text-amber-400 font-extrabold text-sm px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Reference Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-8812"
                  value={udharRefInvoice}
                  onChange={(e) => setUdharRefInvoice(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Note / Item Details</label>
                <input
                  type="text"
                  placeholder="e.g. Purchased Glass Protector + Case on Credit"
                  value={udharNote}
                  onChange={(e) => setUdharNote(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUdharCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition cursor-pointer"
                >
                  Add Udhar Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: DELETE CONFIRMATION FOR CUSTOMER                           */}
      {/* ==================================================================== */}
      {selectedDeleteCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Udhar Account?</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete <strong className="text-white">{selectedDeleteCustomer.name}</strong>?
              {selectedDeleteCustomer.currentBalance > 0 && (
                <span className="block text-amber-400 font-semibold mt-1">
                  Warning: This customer has an active outstanding Udhar balance of {settings.currencySymbol}{selectedDeleteCustomer.currentBalance.toLocaleString()}.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedDeleteCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomerConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md cursor-pointer"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 8: DELETE CONFIRMATION FOR EXPENSE                            */}
      {/* ==================================================================== */}
      {selectedDeleteExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-800 text-white">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Expense Voucher?</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete voucher <strong className="text-white">{selectedDeleteExpense.expenseNumber}</strong> ({selectedDeleteExpense.category} - {settings.currencySymbol}{selectedDeleteExpense.amount.toLocaleString()})?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedDeleteExpense(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpenseConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md cursor-pointer"
              >
                Yes, Delete Voucher
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
