import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerCreditAccount, SupplierDebitAccount, LedgerEntry } from '../../types';
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
  CheckCircle2
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
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
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
            <div className="text-xs text-slate-400 font-medium">Active Udhar Accounts</div>
            <div className="text-2xl font-extrabold text-indigo-300 tracking-tight">
              {customers.length + suppliers.length} Ledgers
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              WhatsApp reminders ready
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tab Switcher: Customers vs Suppliers */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
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
        </div>

        {activeTab === 'customers' ? (
          <button
            onClick={() => setShowAddCustModal(true)}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Customer Account</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAddSupModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Supplier Account</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'customers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Customer Accounts List */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-white text-sm">Customer Accounts ({customers.length})</h3>

              <div className="space-y-2">
                {customers.map(c => {
                  const isSelected = selectedCustomer?.id === c.id;

                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
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
                })}
              </div>
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
                    <span>Account Statement Ledger</span>
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
                        {selectedCustomer.ledgerHistory.map((e) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                Select a customer account to view ledger statement.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Supplier Tab View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-white text-sm">Wholesaler Distributors ({suppliers.length})</h3>

              <div className="space-y-2">
                {suppliers.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSupplier(s)}
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
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {selectedSupplier && (
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
                  <h4 className="font-bold text-white text-sm">Supplier Ledger History</h4>
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
                        {selectedSupplier.ledgerHistory.map(e => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

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

    </div>
  );
};
