import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerCreditAccount, SupplierDebitAccount, LedgerEntry, ExpenseItem } from '../../types';
import { Pagination } from '../common/Pagination';
import {
  CreditCard,
  UserCheck,
  Plus,
  DollarSign,
  MessageSquare,
  Send,
  Building2,
  Phone,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Search,
  CheckCircle2,
  Receipt,
  Trash2,
  Filter,
  Coffee,
  Wifi,
  Zap,
  Smartphone,
  Wrench,
  Printer,
  Tag,
  TrendingDown
} from 'lucide-react';

export const CreditModule: React.FC = () => {
  const {
    customers,
    addCustomer,
    recordCustomerPayment,
    recordCustomerUdhar,
    suppliers,
    addSupplier,
    recordSupplierPayment,
    recordSupplierPurchaseDebt,
    expenses,
    addExpense,
    deleteExpense,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers' | 'expenses'>('customers');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCreditAccount | null>(customers[0] || null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDebitAccount | null>(suppliers[0] || null);

  // Modals state
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showAddUdharModal, setShowAddUdharModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Supplier Modals State
  const [showAddSupModal, setShowAddSupModal] = useState(false);
  const [showSupPayModal, setShowSupPayModal] = useState(false);

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

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(5);

  const [custLedgerPage, setCustLedgerPage] = useState(1);
  const [custLedgerPageSize, setCustLedgerPageSize] = useState(5);

  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierPageSize, setSupplierPageSize] = useState(5);

  const [supLedgerPage, setSupLedgerPage] = useState(1);
  const [supLedgerPageSize, setSupLedgerPageSize] = useState(5);

  // Form Inputs
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentNote, setPaymentNote] = useState('');

  const [udharAmount, setUdharAmount] = useState('');
  const [udharInvoice, setUdharInvoice] = useState('');
  const [udharNote, setUdharNote] = useState('');

  // New Customer Input
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustLimit, setNewCustLimit] = useState('50000');

  // New Supplier Input
  const [newSupCompany, setNewSupCompany] = useState('');
  const [newSupPerson, setNewSupPerson] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCategory, setNewSupCategory] = useState<SupplierDebitAccount['category']>('Smartphones Wholesaler');

  // Total Summary Math
  const totalCustomerUdharOwed = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const totalSupplierPayable = suppliers.reduce((sum, s) => sum + s.currentPayable, 0);
  const totalShopExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

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

  // Filtered & Paginated Customers
  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * customerPageSize,
    customerPage * customerPageSize
  );

  // Paginated Selected Customer Ledger History
  const custLedgerHistory = selectedCustomer?.ledgerHistory || [];
  const paginatedCustLedger = custLedgerHistory.slice(
    (custLedgerPage - 1) * custLedgerPageSize,
    custLedgerPage * custLedgerPageSize
  );

  // Filtered & Paginated Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const q = supplierSearch.toLowerCase().trim();
    return !q || s.companyName.toLowerCase().includes(q) || s.contactPerson.toLowerCase().includes(q) || s.phone.includes(q);
  });

  const paginatedSuppliers = filteredSuppliers.slice(
    (supplierPage - 1) * supplierPageSize,
    supplierPage * supplierPageSize
  );

  // Paginated Selected Supplier Ledger History
  const supLedgerHistory = selectedSupplier?.ledgerHistory || [];
  const paginatedSupLedger = supLedgerHistory.slice(
    (supLedgerPage - 1) * supLedgerPageSize,
    supLedgerPage * supLedgerPageSize
  );

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount || parseFloat(expAmount) <= 0) return;

    const finalCategory = (expCategory === 'Other Expense' && expCustomCategory.trim())
      ? (expCustomCategory.trim() as any)
      : expCategory;

    addExpense({
      category: finalCategory,
      amount: parseFloat(expAmount),
      date: expDate || new Date().toISOString().substring(0, 10),
      paymentMethod: expPaymentMethod,
      paidTo: expPaidTo || 'General Vendor',
      notes: expNotes || 'Shop expense entry'
    });

    setShowAddExpenseModal(false);
    setExpAmount('');
    setExpPaidTo('');
    setExpNotes('');
    setExpCustomCategory('');
  };

  const handleRecordCustomerPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount) return;

    recordCustomerPayment(
      selectedCustomer.id,
      parseFloat(paymentAmount),
      paymentMode,
      paymentNote || 'Payment received against balance'
    );

    setShowAddPaymentModal(false);
    setPaymentAmount('');
    setPaymentNote('');
  };

  const handleRecordCustomerUdharSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !udharAmount) return;

    recordCustomerUdhar(
      selectedCustomer.id,
      parseFloat(udharAmount),
      udharInvoice || 'MANUAL-ENTRY',
      udharNote || 'Direct Udhar entry'
    );

    setShowAddUdharModal(false);
    setUdharAmount('');
    setUdharNote('');
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      creditLimit: parseFloat(newCustLimit) || 50000,
      status: 'Active'
    });

    setShowAddCustModal(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupCompany || !newSupPhone) return;

    addSupplier({
      companyName: newSupCompany,
      contactPerson: newSupPerson || 'Wholesale Representative',
      phone: newSupPhone,
      category: newSupCategory
    });

    setShowAddSupModal(false);
    setNewSupCompany('');
    setNewSupPhone('');
  };

  const handleRecordSupplierPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !paymentAmount) return;

    recordSupplierPayment(
      selectedSupplier.id,
      parseFloat(paymentAmount),
      paymentMode,
      paymentNote || 'Payment sent to distributor'
    );

    setShowSupPayModal(false);
    setPaymentAmount('');
    setPaymentNote('');
  };

  return (
    <div id="credit-module-container" className="space-y-6">
      
      {/* Top Banner & KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Customer Udhar (Receivable)</div>
            <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {settings.currencySymbol}{totalCustomerUdharOwed.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              From {customers.filter(c => c.currentBalance > 0).length} customers
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Wholesaler Debt (Payable)</div>
            <div className="text-2xl font-extrabold text-rose-400 tracking-tight">
              {settings.currencySymbol}{totalSupplierPayable.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              To {suppliers.filter(s => s.currentPayable > 0).length} distributors
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Shop Expenses Logged</div>
            <div className="text-2xl font-extrabold text-purple-400 tracking-tight">
              {settings.currencySymbol}{totalShopExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {expenses.length} Expense Vouchers
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tab Switcher: Customers vs Suppliers vs Expenses */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('customers')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === 'customers' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Customer Udhar Ledger (Receivables)
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
              activeTab === 'suppliers' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Supplier Debt Ledger (Payables)
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'expenses' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Store Outflow Expenses</span>
          </button>
        </div>

        {activeTab === 'customers' && (
          <button
            onClick={() => setShowAddCustModal(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer Account</span>
          </button>
        )}

        {activeTab === 'suppliers' && (
          <button
            onClick={() => setShowAddSupModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Supplier Account</span>
          </button>
        )}

        {activeTab === 'expenses' && (
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Expense</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'customers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Customer Accounts List */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Customer Accounts ({filteredCustomers.length})</h3>
              </div>

              {/* Customer Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, phone..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerPage(1);
                  }}
                  className="w-full bg-slate-950 text-slate-100 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                {paginatedCustomers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No matching customer accounts found</div>
                ) : (
                  paginatedCustomers.map(c => {
                    const isSelected = selectedCustomer?.id === c.id;

                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustLedgerPage(1);
                        }}
                        className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 text-white border-amber-500/50 shadow-md'
                            : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-100">{c.name}</div>
                          <div className="text-[11px] text-slate-400">{c.phone}</div>
                        </div>

                        <div className="text-right">
                          <div className={`font-extrabold text-sm ${c.currentBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {settings.currencySymbol}{c.currentBalance.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {c.currentBalance > 0 ? 'Udhar Balance' : 'Clear Balance'}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Customer List Pagination */}
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
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          </div>

          {/* Selected Customer Statement & Controls */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {selectedCustomer ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                
                {/* Account Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedCustomer.name}</h3>
                    <p className="text-xs text-slate-400">Phone: {selectedCustomer.phone} • Credit Limit: {settings.currencySymbol}{selectedCustomer.creditLimit.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReminderModal(true)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Reminder</span>
                    </button>

                    <button
                      onClick={() => setShowAddPaymentModal(true)}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record Payment</span>
                    </button>

                    <button
                      onClick={() => setShowAddUdharModal(true)}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Udhar</span>
                    </button>
                  </div>
                </div>

                {/* Account Balance Summary Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Net Outstanding Balance Owed</span>
                    <div className="text-2xl font-extrabold text-amber-400">
                      {settings.currencySymbol}{selectedCustomer.currentBalance.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-slate-400">Last Payment Date:</div>
                    <div className="font-bold text-slate-200">{selectedCustomer.lastPaymentDate || 'No payments recorded'}</div>
                  </div>
                </div>

                {/* Ledger History Statement Table */}
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Account Statement Ledger ({custLedgerHistory.length})</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Date / Time</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Reference / Note</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {paginatedCustLedger.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500">No ledger transactions found</td>
                          </tr>
                        ) : (
                          paginatedCustLedger.map((e) => (
                            <tr key={e.id} className="hover:bg-slate-800/50 transition">
                              <td className="p-3 text-slate-400 font-mono">{e.timestamp}</td>
                              <td className="p-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  e.type.includes('Debit') ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {e.type}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="text-slate-200">{e.note}</div>
                                {e.referenceInvoice && (
                                  <div className="text-[10px] text-indigo-400 font-mono">Ref: {e.referenceInvoice}</div>
                                )}
                              </td>
                              <td className={`p-3 text-right font-bold ${
                                e.type.includes('Debit') ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {settings.currencySymbol}{e.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Ledger Pagination */}
                  <Pagination
                    currentPage={custLedgerPage}
                    totalPages={Math.ceil(custLedgerHistory.length / custLedgerPageSize) || 1}
                    totalItems={custLedgerHistory.length}
                    pageSize={custLedgerPageSize}
                    onPageChange={(p) => setCustLedgerPage(p)}
                    onPageSizeChange={(sz) => {
                      setCustLedgerPageSize(sz);
                      setCustLedgerPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                Select a customer account to view ledger statement.
              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'suppliers' ? (
        /* Supplier Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-white text-sm">Wholesaler Distributors ({filteredSuppliers.length})</h3>

              {/* Supplier Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search wholesaler company, person, phone..."
                  value={supplierSearch}
                  onChange={(e) => {
                    setSupplierSearch(e.target.value);
                    setSupplierPage(1);
                  }}
                  className="w-full bg-slate-950 text-slate-100 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-2">
                {paginatedSuppliers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No matching wholesaler distributors found</div>
                ) : (
                  paginatedSuppliers.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSupplier(s);
                        setSupLedgerPage(1);
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                        selectedSupplier?.id === s.id
                          ? 'bg-rose-500/10 text-white border-rose-500/50 shadow-md'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-100">{s.companyName}</div>
                        <div className="text-[11px] text-slate-400">{s.category}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-sm text-rose-400">
                          {settings.currencySymbol}{s.currentPayable.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">Shop Owes</div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Supplier List Pagination */}
              <Pagination
                currentPage={supplierPage}
                totalPages={Math.ceil(filteredSuppliers.length / supplierPageSize) || 1}
                totalItems={filteredSuppliers.length}
                pageSize={supplierPageSize}
                onPageChange={(p) => setSupplierPage(p)}
                onPageSizeChange={(sz) => {
                  setSupplierPageSize(sz);
                  setSupplierPage(1);
                }}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {selectedSupplier ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedSupplier.companyName}</h3>
                    <p className="text-xs text-slate-400">Contact: {selectedSupplier.contactPerson} • {selectedSupplier.phone}</p>
                  </div>

                  <button
                    onClick={() => setShowSupPayModal(true)}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pay Wholesaler</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Outstanding Debt Owed By Shop</span>
                    <div className="text-2xl font-extrabold text-rose-400">
                      {settings.currencySymbol}{selectedSupplier.currentPayable.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Ledger History */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">Supplier Ledger History ({supLedgerHistory.length})</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Note</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {paginatedSupLedger.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-500">No supplier ledger entries found</td>
                          </tr>
                        ) : (
                          paginatedSupLedger.map(e => (
                            <tr key={e.id} className="hover:bg-slate-800/50">
                              <td className="p-3 font-mono text-slate-400">{e.timestamp}</td>
                              <td className="p-3">
                                <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                                  {e.type}
                                </span>
                              </td>
                              <td className="p-3 text-slate-200">{e.note}</td>
                              <td className="p-3 text-right font-bold text-rose-400">
                                {settings.currencySymbol}{e.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Supplier Ledger Pagination */}
                  <Pagination
                    currentPage={supLedgerPage}
                    totalPages={Math.ceil(supLedgerHistory.length / supLedgerPageSize) || 1}
                    totalItems={supLedgerHistory.length}
                    pageSize={supLedgerPageSize}
                    onPageChange={(p) => setSupLedgerPage(p)}
                    onPageSizeChange={(sz) => {
                      setSupLedgerPageSize(sz);
                      setSupLedgerPage(1);
                    }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </div>

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                Select a wholesaler account to view ledger statement.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Expenses Management View */}
      {activeTab === 'expenses' && (
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
                onChange={(e) => setExpenseSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            {/* Category Filter Dropdown & Quick Action */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-400 font-medium">Type:</span>
                <select
                  value={selectedExpenseCategory}
                  onChange={(e) => setSelectedExpenseCategory(e.target.value)}
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

              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-purple-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Record Expense</span>
              </button>
            </div>
          </div>

          {/* Quick Category Summary Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Rent', icon: Building2, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
              { label: 'Food & Refreshments', icon: Coffee, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
              { label: 'Mobile / DTH Recharge', icon: Smartphone, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
              { label: 'Internet & Wifi', icon: Wifi, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
              { label: 'Electricity & Utilities', icon: Zap, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
              { label: 'Tea & Snacks', icon: Coffee, color: 'text-pink-400 border-pink-500/30 bg-pink-500/10' }
            ].map((cat) => {
              const catTotal = expenses
                .filter(e => e.category === cat.label)
                .reduce((sum, e) => sum + e.amount, 0);
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedExpenseCategory(selectedExpenseCategory === cat.label ? 'All' : cat.label)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedExpenseCategory === cat.label
                      ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-500'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${cat.color}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {expenses.filter(e => e.category === cat.label).length} logs
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-300 truncate">{cat.label}</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {settings.currencySymbol}{catTotal.toLocaleString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expense Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-3">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">
                  Logged Outflow Expenses ({filteredExpenses.length})
                </h3>
                {selectedExpenseCategory !== 'All' && (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Filtered: {selectedExpenseCategory}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Total Filtered Outflow: <strong className="text-purple-300">{settings.currencySymbol}{filteredExpensesTotal.toLocaleString()}</strong>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Receipt className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-medium">No expense records found.</p>
                <p className="text-xs text-slate-500">
                  Click "Record Expense" to log Rent, Food, Recharges, Tea, or Utilities.
                </p>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Expense</span>
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
      )}

      {/* WhatsApp Payment Reminder Modal */}
      {showReminderModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>WhatsApp Payment Reminder</span>
              </h3>
              <button onClick={() => setShowReminderModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Sending payment reminder to <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone}):
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-sans text-slate-200 space-y-2">
              <div className="text-emerald-400 font-bold">Preview Message:</div>
              <p className="leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                "Hello {selectedCustomer.name}, gentle reminder from {settings.shopName}. Your outstanding Udhar credit balance is {settings.currencySymbol}{selectedCustomer.currentBalance.toLocaleString()}. You can pay via UPI to shop UPI ID: {settings.phone}@upi. Thank you!"
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setShowReminderModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Demo Reminder sent via WhatsApp to ${selectedCustomer.phone}!`);
                  setShowReminderModal(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Customer Payment Modal */}
      {showAddPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Record Payment Received</h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordCustomerPaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Amount ({settings.currencySymbol})</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-800 text-emerald-400 font-bold px-3 py-2 rounded-xl border border-slate-700 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Note / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. GPay Ref 98217391283"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Customer Udhar Modal */}
      {showAddUdharModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Record New Udhar / Loan</h3>
              <button onClick={() => setShowAddUdharModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordCustomerUdharSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Udhar Amount ({settings.currencySymbol})</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={udharAmount}
                  onChange={(e) => setUdharAmount(e.target.value)}
                  className="w-full bg-slate-800 text-amber-400 font-bold px-3 py-2 rounded-xl border border-slate-700 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Reference Invoice / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Spare screen repair debt"
                  value={udharNote}
                  onChange={(e) => setUdharNote(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUdharModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Record Udhar Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Account Modal */}
      {showAddCustModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Add New Customer Account</h3>
              <button onClick={() => setShowAddCustModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765..."
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Credit Limit ({settings.currencySymbol})</label>
                <input
                  type="number"
                  value={newCustLimit}
                  onChange={(e) => setNewCustLimit(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Add New Wholesaler Supplier</h3>
              <button onClick={() => setShowAddSupModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Mobile Wholesalers"
                  value={newSupCompany}
                  onChange={(e) => setNewSupCompany(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Manish Jain"
                  value={newSupPerson}
                  onChange={(e) => setNewSupPerson(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98111..."
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Add Wholesaler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Wholesaler Modal */}
      {showSupPayModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Record Payment to Wholesaler</h3>
              <button onClick={() => setShowSupPayModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordSupplierPaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Amount ({settings.currencySymbol})</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-800 text-rose-400 font-bold px-3 py-2 rounded-xl border border-slate-700 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                >
                  <option value="Bank Transfer">RTGS / NEFT Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupPayModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record New Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">Record Store Outflow Expense</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
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
                    className="w-full bg-slate-800 text-slate-100 font-medium px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
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

              {expCategory === 'Other Expense' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Specify Custom Expense Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop License Fee, Pest Control, etc."
                    value={expCustomCategory}
                    onChange={(e) => setExpCustomCategory(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
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

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Total Outflow Entry:</span>
                <span className="font-extrabold text-purple-400 text-sm">
                  {settings.currencySymbol}{expAmount ? parseFloat(expAmount).toLocaleString() : '0'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
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
