import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  QrCode,
  Wallet,
  Building2,
  Wrench,
  ShoppingBag,
  User,
  X,
  Eye,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export interface UnifiedPaymentItem {
  id: string;
  transactionRef: string;
  date: string; // YYYY-MM-DD
  rawTimestamp: string;
  category: 'POS Sale' | 'Repair Service' | 'Credit Repayment' | 'Supplier Payment' | 'Exchange Cash Out';
  partyName: string;
  partyPhone?: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit / Udhar' | 'Bank Transfer' | 'Split' | 'Other';
  direction: 'Inflow' | 'Outflow';
  amount: number;
  status: 'Completed' | 'Partial' | 'Pending';
  notes?: string;
  details?: any;
}

export const PaymentsModule: React.FC = () => {
  const { sales, jobCards, customers, purchaseOrders, settings } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDirection, setSelectedDirection] = useState<string>('All');
  
  // Date Range Filter States
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Selected payment for detail modal
  const [selectedPayment, setSelectedPayment] = useState<UnifiedPaymentItem | null>(null);

  // Today's date helper
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Consolidate all payment records across POS Sales, Repairs, Credit Accounts, and Supplier POs
  const allPayments = useMemo<UnifiedPaymentItem[]>(() => {
    const list: UnifiedPaymentItem[] = [];

    // 1. POS Sales Payments
    sales.forEach(s => {
      const datePart = s.timestamp ? s.timestamp.split(' ')[0] : s.date || todayStr;
      const amt = s.paidAmount ?? s.totalAmount ?? 0;

      list.push({
        id: `pay-sale-${s.id}`,
        transactionRef: s.invoiceNumber,
        date: datePart,
        rawTimestamp: s.timestamp || `${datePart} 00:00`,
        category: 'POS Sale',
        partyName: s.customerName || 'Walk-in Customer',
        partyPhone: s.customerPhone,
        paymentMethod: (s.paymentMethod as any) || 'Cash',
        direction: 'Inflow',
        amount: amt,
        status: s.balanceAmount && s.balanceAmount > 0 ? 'Partial' : 'Completed',
        notes: s.notes || `Sale of ${s.items.length} item(s)`,
        details: s
      });
    });

    // 2. Repair Job Cards (Advance & Settlement Payments)
    jobCards.forEach(jc => {
      const datePart = jc.createdDate || todayStr;
      
      // Advance Payment
      if (jc.advancePaid > 0) {
        list.push({
          id: `pay-repair-adv-${jc.id}`,
          transactionRef: `${jc.jobCardNumber} (Advance)`,
          date: datePart,
          rawTimestamp: `${datePart} 10:00`,
          category: 'Repair Service',
          partyName: jc.customerName,
          partyPhone: jc.customerPhone,
          paymentMethod: 'UPI', // Default for advance
          direction: 'Inflow',
          amount: jc.advancePaid,
          status: 'Completed',
          notes: `Advance for ${jc.deviceBrand} ${jc.deviceModel} repair`,
          details: jc
        });
      }

      // Final Paid Settlement if Delivered/Completed
      if ((jc.status === 'Completed & Delivered' || jc.paymentStatus === 'Paid in Full') && jc.finalCost > jc.advancePaid) {
        const settledAmt = jc.finalCost - jc.advancePaid;
        list.push({
          id: `pay-repair-final-${jc.id}`,
          transactionRef: `${jc.jobCardNumber} (Final)`,
          date: datePart,
          rawTimestamp: `${datePart} 16:00`,
          category: 'Repair Service',
          partyName: jc.customerName,
          partyPhone: jc.customerPhone,
          paymentMethod: 'Cash',
          direction: 'Inflow',
          amount: settledAmt,
          status: 'Completed',
          notes: `Final settlement for ${jc.deviceBrand} ${jc.deviceModel}`,
          details: jc
        });
      }
    });

    // 3. Customer Udhar Ledger Repayments
    customers.forEach(cust => {
      if (cust.ledgerHistory && cust.ledgerHistory.length > 0) {
        cust.ledgerHistory.forEach(entry => {
          if (entry.type === 'Credit (Payment Received)' && entry.amount > 0) {
            const datePart = entry.timestamp ? entry.timestamp.split(' ')[0] : todayStr;
            list.push({
              id: `pay-ledger-${entry.id}`,
              transactionRef: entry.referenceInvoice || `REC-${entry.id.substring(0, 6)}`,
              date: datePart,
              rawTimestamp: entry.timestamp || `${datePart} 12:00`,
              category: 'Credit Repayment',
              partyName: cust.name,
              partyPhone: cust.phone,
              paymentMethod: (entry.paymentMode as any) || 'Cash',
              direction: 'Inflow',
              amount: entry.amount,
              status: 'Completed',
              notes: entry.note || 'Udhar repayment received',
              details: { customer: cust, ledger: entry }
            });
          }
        });
      }
    });

    // 4. Supplier / Wholesaler Outward Payments (POs)
    purchaseOrders.forEach(po => {
      if (po.paidAmount && po.paidAmount > 0) {
        const datePart = po.orderDate || todayStr;
        list.push({
          id: `pay-po-${po.id}`,
          transactionRef: po.poNumber,
          date: datePart,
          rawTimestamp: `${datePart} 11:00`,
          category: 'Supplier Payment',
          partyName: po.partyName,
          partyPhone: po.partyPhone,
          paymentMethod: 'Bank Transfer',
          direction: 'Outflow',
          amount: po.paidAmount,
          status: po.balanceAmount > 0 ? 'Partial' : 'Completed',
          notes: po.notes || `Stock purchase from ${po.partyName}`,
          details: po
        });
      }
    });

    // Sort descending by rawTimestamp / date
    return list.sort((a, b) => b.rawTimestamp.localeCompare(a.rawTimestamp));
  }, [sales, jobCards, customers, purchaseOrders, todayStr]);

  // Apply Date Range & Filter Logic
  const filteredPayments = useMemo(() => {
    return allPayments.filter(pay => {
      // 1. Search Query Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesRef = pay.transactionRef.toLowerCase().includes(q);
        const matchesParty = pay.partyName.toLowerCase().includes(q);
        const matchesPhone = pay.partyPhone ? pay.partyPhone.includes(q) : false;
        const matchesNotes = pay.notes ? pay.notes.toLowerCase().includes(q) : false;
        if (!matchesRef && !matchesParty && !matchesPhone && !matchesNotes) return false;
      }

      // 2. Payment Method Filter
      if (selectedMethod !== 'All') {
        if (selectedMethod === 'Cash' && pay.paymentMethod !== 'Cash') return false;
        if (selectedMethod === 'UPI' && pay.paymentMethod !== 'UPI') return false;
        if (selectedMethod === 'Card' && pay.paymentMethod !== 'Card') return false;
        if (selectedMethod === 'Credit / Udhar' && pay.paymentMethod !== 'Credit / Udhar') return false;
        if (selectedMethod === 'Bank Transfer' && pay.paymentMethod !== 'Bank Transfer') return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && pay.category !== selectedCategory) {
        return false;
      }

      // 4. Direction Filter
      if (selectedDirection !== 'All' && pay.direction !== selectedDirection) {
        return false;
      }

      // 5. Date Range Filter
      if (datePreset === 'today') {
        if (pay.date !== todayStr) return false;
      } else if (datePreset === 'yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yest = d.toISOString().split('T')[0];
        if (pay.date !== yest) return false;
      } else if (datePreset === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const weekAgo = d.toISOString().split('T')[0];
        if (pay.date < weekAgo) return false;
      } else if (datePreset === 'month') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const monthAgo = d.toISOString().split('T')[0];
        if (pay.date < monthAgo) return false;
      } else if (datePreset === 'custom') {
        if (fromDate && pay.date < fromDate) return false;
        if (toDate && pay.date > toDate) return false;
      }

      return true;
    });
  }, [allPayments, searchQuery, selectedMethod, selectedCategory, selectedDirection, datePreset, fromDate, toDate, todayStr]);

  // Aggregate Metrics for Filtered List
  const metrics = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let cashInflow = 0;
    let upiInflow = 0;
    let cardInflow = 0;
    let udharInflow = 0;

    filteredPayments.forEach(p => {
      if (p.direction === 'Inflow') {
        totalInflow += p.amount;
        if (p.paymentMethod === 'Cash') cashInflow += p.amount;
        else if (p.paymentMethod === 'UPI') upiInflow += p.amount;
        else if (p.paymentMethod === 'Card') cardInflow += p.amount;
        else if (p.paymentMethod === 'Credit / Udhar') udharInflow += p.amount;
      } else {
        totalOutflow += p.amount;
      }
    });

    return {
      totalInflow,
      totalOutflow,
      netBalance: totalInflow - totalOutflow,
      cashInflow,
      upiInflow,
      cardInflow,
      udharInflow,
      count: filteredPayments.length
    };
  }, [filteredPayments]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMethod('All');
    setSelectedCategory('All');
    setSelectedDirection('All');
    setDatePreset('all');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Payments Ledger & Transactions</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                All Collections
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete list of POS sales, repair advances, customer credit repayments, and supplier payments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-indigo-400" /> Print Report
          </button>
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Total Received</span>
          <div className="text-xl font-extrabold text-emerald-400 flex items-center justify-between">
            <span>{settings.currencySymbol}{metrics.totalInflow.toLocaleString('en-IN')}</span>
            <TrendingUp className="w-5 h-5 text-emerald-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">{metrics.count} payments listed</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">Cash Receipts</span>
          <div className="text-xl font-extrabold text-amber-400 flex items-center justify-between">
            <span>{settings.currencySymbol}{metrics.cashInflow.toLocaleString('en-IN')}</span>
            <Wallet className="w-5 h-5 text-amber-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">In-hand counter cash</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">UPI / QR Scan</span>
          <div className="text-xl font-extrabold text-cyan-400 flex items-center justify-between">
            <span>{settings.currencySymbol}{metrics.upiInflow.toLocaleString('en-IN')}</span>
            <QrCode className="w-5 h-5 text-cyan-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Direct bank transfer</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">Card Swipes</span>
          <div className="text-xl font-extrabold text-indigo-400 flex items-center justify-between">
            <span>{settings.currencySymbol}{metrics.cardInflow.toLocaleString('en-IN')}</span>
            <CreditCard className="w-5 h-5 text-indigo-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">POS machine settlements</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-rose-400 font-semibold uppercase tracking-wider">Supplier Outflow</span>
          <div className="text-xl font-extrabold text-rose-400 flex items-center justify-between">
            <span>{settings.currencySymbol}{metrics.totalOutflow.toLocaleString('en-IN')}</span>
            <TrendingDown className="w-5 h-5 text-rose-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Wholesaler PO payments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Net Cash Flow</span>
          <div className={`text-xl font-extrabold flex items-center justify-between ${metrics.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            <span>{settings.currencySymbol}{metrics.netBalance.toLocaleString('en-IN')}</span>
            <IndianRupee className="w-5 h-5 text-indigo-400 opacity-60" />
          </div>
          <p className="text-[10px] text-slate-500">Inflow minus Outflow</p>
        </div>
      </div>

      {/* FILTER & DATE RANGE CONTROLS PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Payments & Select Date Range</span>
          </h3>
          <button
            onClick={resetFilters}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        {/* Date Range Preset Selector */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold text-slate-300">Date Range Selection</label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'month', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom Date Range' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  datePreset === p.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {datePreset === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 animate-in fade-in">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Search & Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Search Keyword</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search Invoice #, Name, Phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Payment Method</label>
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / QR Scan</option>
              <option value="Card">Card POS Machine</option>
              <option value="Credit / Udhar">Credit / Udhar</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Category Source</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="POS Sale">POS Sales</option>
              <option value="Repair Service">Repair Job Cards</option>
              <option value="Credit Repayment">Customer Credit Repayments</option>
              <option value="Supplier Payment">Supplier Outflow</option>
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1">Transaction Type</label>
            <select
              value={selectedDirection}
              onChange={e => setSelectedDirection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Types (Inflow & Outflow)</option>
              <option value="Inflow">Inflow (Income Received)</option>
              <option value="Outflow">Outflow (Expense / Supplier)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PAYMENTS DATATABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>Payments Ledger Records</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-normal">
              Showing {filteredPayments.length} of {allPayments.length} transactions
            </span>
          </h3>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-slate-400 text-xs font-medium">No payment transactions match your search or date filters.</p>
            <button
              onClick={resetFilters}
              className="text-indigo-400 hover:underline text-xs font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Reference #</th>
                  <th className="p-3.5">Customer / Wholesaler</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Direction</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Date */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">{pay.date}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {pay.rawTimestamp.split(' ')[1] || '12:00'}
                      </div>
                    </td>

                    {/* Reference */}
                    <td className="p-3.5 font-mono">
                      <span className="font-bold text-indigo-300">{pay.transactionRef}</span>
                      {pay.notes && (
                        <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5" title={pay.notes}>
                          {pay.notes}
                        </div>
                      )}
                    </td>

                    {/* Party */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{pay.partyName}</div>
                      {pay.partyPhone && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pay.partyPhone}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      {pay.category === 'POS Sale' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          <ShoppingBag className="w-3 h-3" /> POS Sale
                        </span>
                      )}
                      {pay.category === 'Repair Service' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Wrench className="w-3 h-3" /> Repair Service
                        </span>
                      )}
                      {pay.category === 'Credit Repayment' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <User className="w-3 h-3" /> Credit Repayment
                        </span>
                      )}
                      {pay.category === 'Supplier Payment' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          <Building2 className="w-3 h-3" /> Supplier PO
                        </span>
                      )}
                    </td>

                    {/* Method */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {pay.paymentMethod === 'Cash' && <Wallet className="w-3 h-3 text-amber-400" />}
                        {pay.paymentMethod === 'UPI' && <QrCode className="w-3 h-3 text-cyan-400" />}
                        {pay.paymentMethod === 'Card' && <CreditCard className="w-3 h-3 text-indigo-400" />}
                        {pay.paymentMethod === 'Credit / Udhar' && <IndianRupee className="w-3 h-3 text-rose-400" />}
                        {pay.paymentMethod === 'Bank Transfer' && <Building2 className="w-3 h-3 text-blue-400" />}
                        <span>{pay.paymentMethod}</span>
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="p-3.5">
                      {pay.direction === 'Inflow' ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400">
                          <ArrowUpRight className="w-4 h-4" /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-400">
                          <ArrowDownRight className="w-4 h-4" /> Outflow
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-extrabold text-sm">
                      <span className={pay.direction === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'}>
                        {pay.direction === 'Inflow' ? '+' : '-'}{settings.currencySymbol}{pay.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedPayment(pay)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedPayment(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Payment Receipt Detail</h3>
                <p className="text-xs text-slate-400">Ref: {selectedPayment.transactionRef}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Date & Time</span>
                <span className="font-bold text-white">{selectedPayment.rawTimestamp}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Party Name</span>
                <span className="font-bold text-white">{selectedPayment.partyName} ({selectedPayment.partyPhone || 'N/A'})</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Category</span>
                <span className="font-bold text-indigo-300">{selectedPayment.category}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-bold text-amber-300">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Total Amount</span>
                <span className={`text-lg font-black ${selectedPayment.direction === 'Inflow' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {settings.currencySymbol}{selectedPayment.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {selectedPayment.notes && (
              <div className="bg-slate-800/40 p-3 rounded-xl text-xs">
                <span className="text-slate-400 block font-semibold mb-1">Notes / Description</span>
                <p className="text-slate-200">{selectedPayment.notes}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
