import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerCreditAccount, SaleTransaction, EcommerceOrder, RepairJobCard, TradeInExchange } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  TrendingUp,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building2,
  Tag,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingBag,
  ShoppingCart,
  Wrench,
  RefreshCw,
  Award,
  Star,
  ArrowUpRight,
  Check,
  Plus,
  X,
  Clock,
  Sparkles,
  ShieldCheck,
  Receipt,
  LayoutGrid,
  List,
  IndianRupee,
  ChevronRight,
  CornerDownRight,
  Send,
  Zap
} from 'lucide-react';

export const CustomerModule: React.FC = () => {
  const {
    customers,
    sales,
    orders,
    jobCards,
    exchanges,
    settings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    recordCustomerPayment,
    recordCustomerUdhar
  } = useApp();

  // Search, Filters & View Mode
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Retail' | 'Wholesale' | 'VIP' | 'Corporate'>('ALL');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'HAS_DEBT' | 'CLEAN'>('ALL');
  const [sortBy, setSortBy] = useState<'SPEND_DESC' | 'NAME_ASC' | 'DEBT_DESC' | 'ORDERS_DESC' | 'RECENT'>('SPEND_DESC');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerCreditAccount | null>(null);

  // Selected Customer Detail View Drawer/Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'SALES' | 'ECOMMERCE' | 'REPAIRS' | 'EXCHANGES' | 'LEDGER'>('SALES');

  // Quick Payment/Udhar Record Form state inside Detail View
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentModeInput, setPaymentModeInput] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Card'>('UPI');
  const [paymentNoteInput, setPaymentNoteInput] = useState('');
  const [recordType, setRecordType] = useState<'PAYMENT' | 'UDHAR'>('PAYMENT');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Customer Form state
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    customerType: 'Retail' as 'Retail' | 'Wholesale' | 'VIP' | 'Corporate' | 'Walk-in',
    creditLimit: 25000,
    gstin: '',
    notes: '',
    status: 'Active' as 'Active' | 'Blocked' | 'Overdue Alert'
  });

  // Open modal for new customer
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormState({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      customerType: 'Retail',
      creditLimit: 25000,
      gstin: '',
      notes: '',
      status: 'Active'
    });
    setIsAddEditModalOpen(true);
  };

  // Open modal for editing existing customer
  const handleOpenEditModal = (c: CustomerCreditAccount) => {
    setEditingCustomer(c);
    setFormState({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || '',
      city: c.city || '',
      customerType: c.customerType || 'Retail',
      creditLimit: c.creditLimit || 25000,
      gstin: c.gstin || '',
      notes: c.notes || '',
      status: c.status
    });
    setIsAddEditModalOpen(true);
  };

  // Form submit handler
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.phone.trim()) {
      alert('Please fill in Customer Name and Phone Number.');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formState.name,
        phone: formState.phone,
        email: formState.email || undefined,
        address: formState.address || undefined,
        city: formState.city || undefined,
        customerType: formState.customerType,
        creditLimit: Number(formState.creditLimit),
        gstin: formState.gstin || undefined,
        notes: formState.notes || undefined,
        status: formState.status
      });
      setActionSuccessMsg(`Updated customer "${formState.name}" successfully!`);
    } else {
      addCustomer({
        name: formState.name,
        phone: formState.phone,
        email: formState.email || undefined,
        address: formState.address || undefined,
        city: formState.city || undefined,
        customerType: formState.customerType,
        creditLimit: Number(formState.creditLimit),
        gstin: formState.gstin || undefined,
        notes: formState.notes || undefined,
        status: formState.status
      });
      setActionSuccessMsg(`Added new customer "${formState.name}" successfully!`);
    }

    setIsAddEditModalOpen(false);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Delete Customer
  const handleDeleteCustomer = (c: CustomerCreditAccount) => {
    if (c.currentBalance > 0) {
      if (!confirm(`⚠️ Warning: "${c.name}" has an outstanding Udhar balance of ${settings.currencySymbol}${c.currentBalance.toLocaleString()}. Are you sure you want to delete this customer?`)) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
        return;
      }
    }
    deleteCustomer(c.id);
    if (selectedCustomerId === c.id) {
      setSelectedCustomerId(null);
    }
    setActionSuccessMsg(`Customer "${c.name}" deleted.`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Build Comprehensive Customer Directory by aggregating customers + transactions
  const aggregatedCustomers = useMemo(() => {
    // Helper to clean phone numbers for matching
    const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').slice(-10);

    // Map of existing registered customer accounts
    const customerMap = new Map<string, {
      account: CustomerCreditAccount;
      matchedSales: SaleTransaction[];
      matchedOrders: EcommerceOrder[];
      matchedRepairs: RepairJobCard[];
      matchedExchanges: TradeInExchange[];
      totalSpent: number;
      totalOrdersCount: number;
      lastActivityDate: string;
      loyaltyPoints: number;
    }>();

    // Initialize registered customers
    customers.forEach(cust => {
      customerMap.set(cust.id, {
        account: cust,
        matchedSales: [],
        matchedOrders: [],
        matchedRepairs: [],
        matchedExchanges: [],
        totalSpent: 0,
        totalOrdersCount: 0,
        lastActivityDate: cust.createdAt || cust.lastPaymentDate || '2026-08-01',
        loyaltyPoints: 0
      });
    });

    // Cross-link Sales Transactions
    sales.forEach(sale => {
      const phoneDigits = cleanPhone(sale.customerPhone);
      let matchedId: string | null = null;

      for (const [id, data] of customerMap.entries()) {
        if (cleanPhone(data.account.phone) === phoneDigits || data.account.name.toLowerCase() === sale.customerName.toLowerCase()) {
          matchedId = id;
          break;
        }
      }

      if (matchedId) {
        const item = customerMap.get(matchedId)!;
        item.matchedSales.push(sale);
        item.totalSpent += sale.totalAmount;
        item.totalOrdersCount += 1;
        if (sale.timestamp > item.lastActivityDate) {
          item.lastActivityDate = sale.timestamp;
        }
      }
    });

    // Cross-link Ecommerce Orders
    orders.forEach(order => {
      const phoneDigits = cleanPhone(order.customerPhone);
      let matchedId: string | null = null;

      for (const [id, data] of customerMap.entries()) {
        if (cleanPhone(data.account.phone) === phoneDigits || data.account.name.toLowerCase() === order.customerName.toLowerCase()) {
          matchedId = id;
          break;
        }
      }

      if (matchedId) {
        const item = customerMap.get(matchedId)!;
        item.matchedOrders.push(order);
        item.totalSpent += order.totalAmount;
        item.totalOrdersCount += 1;
        if (order.date > item.lastActivityDate) {
          item.lastActivityDate = order.date;
        }
      }
    });

    // Cross-link Repair Job Cards
    jobCards.forEach(job => {
      const phoneDigits = cleanPhone(job.customerPhone);
      let matchedId: string | null = null;

      for (const [id, data] of customerMap.entries()) {
        if (cleanPhone(data.account.phone) === phoneDigits || data.account.name.toLowerCase() === job.customerName.toLowerCase()) {
          matchedId = id;
          break;
        }
      }

      if (matchedId) {
        const item = customerMap.get(matchedId)!;
        item.matchedRepairs.push(job);
        item.totalSpent += job.finalCost || job.estimatedCost || 0;
        item.totalOrdersCount += 1;
        if (job.createdDate > item.lastActivityDate) {
          item.lastActivityDate = job.createdDate;
        }
      }
    });

    // Cross-link Device Buybacks / Exchanges
    exchanges.forEach(exch => {
      const phoneDigits = cleanPhone(exch.customerPhone);
      let matchedId: string | null = null;

      for (const [id, data] of customerMap.entries()) {
        if (cleanPhone(data.account.phone) === phoneDigits || data.account.name.toLowerCase() === exch.customerName.toLowerCase()) {
          matchedId = id;
          break;
        }
      }

      if (matchedId) {
        const item = customerMap.get(matchedId)!;
        item.matchedExchanges.push(exch);
        if (exch.timestamp > item.lastActivityDate) {
          item.lastActivityDate = exch.timestamp;
        }
      }
    });

    // Calculate Loyalty Points (1 point per 100 spent)
    customerMap.forEach(item => {
      item.loyaltyPoints = Math.floor(item.totalSpent / 100);
    });

    return Array.from(customerMap.values());
  }, [customers, sales, orders, jobCards, exchanges]);

  // Overall Dashboard Metrics
  const dashboardStats = useMemo(() => {
    const totalCount = aggregatedCustomers.length;
    const totalLifetimeSpend = aggregatedCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgSpend = totalCount > 0 ? totalLifetimeSpend / totalCount : 0;
    const totalDebtOwed = customers.reduce((acc, c) => acc + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
    const vipCount = aggregatedCustomers.filter(c => c.account.customerType === 'VIP' || c.totalSpent >= 50000).length;

    return {
      totalCount,
      totalLifetimeSpend,
      avgSpend,
      totalDebtOwed,
      vipCount
    };
  }, [aggregatedCustomers, customers]);

  // Filtered and Sorted Customers List
  const filteredCustomers = useMemo(() => {
    return aggregatedCustomers.filter(item => {
      const c = item.account;

      // Search match
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q));

      // Type match
      const matchType = typeFilter === 'ALL' || (c.customerType || 'Retail') === typeFilter;

      // Balance match
      const matchBalance =
        balanceFilter === 'ALL' ||
        (balanceFilter === 'HAS_DEBT' && c.currentBalance > 0) ||
        (balanceFilter === 'CLEAN' && c.currentBalance <= 0);

      return matchSearch && matchType && matchBalance;
    }).sort((a, b) => {
      if (sortBy === 'SPEND_DESC') return b.totalSpent - a.totalSpent;
      if (sortBy === 'NAME_ASC') return a.account.name.localeCompare(b.account.name);
      if (sortBy === 'DEBT_DESC') return b.account.currentBalance - a.account.currentBalance;
      if (sortBy === 'ORDERS_DESC') return b.totalOrdersCount - a.totalOrdersCount;
      if (sortBy === 'RECENT') return b.lastActivityDate.localeCompare(a.lastActivityDate);
      return 0;
    });
  }, [aggregatedCustomers, searchTerm, typeFilter, balanceFilter, sortBy]);

  // Selected Active Customer Object
  const selectedCustomerData = useMemo(() => {
    if (!selectedCustomerId) return null;
    return aggregatedCustomers.find(c => c.account.id === selectedCustomerId) || null;
  }, [selectedCustomerId, aggregatedCustomers]);

  // Submit payment / Udhar record from inside Customer Drawer
  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerData) return;
    const amount = Number(paymentAmountInput);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (recordType === 'PAYMENT') {
      recordCustomerPayment(
        selectedCustomerData.account.id,
        amount,
        paymentModeInput,
        paymentNoteInput || `Payment received via ${paymentModeInput}`
      );
      setActionSuccessMsg(`Recorded payment of ${settings.currencySymbol}${amount.toLocaleString()} for ${selectedCustomerData.account.name}`);
    } else {
      recordCustomerUdhar(
        selectedCustomerData.account.id,
        amount,
        `MANUAL-${Date.now().toString().slice(-4)}`,
        paymentNoteInput || 'Manual Credit / Udhar Balance Entry'
      );
      setActionSuccessMsg(`Added Udhar debt of ${settings.currencySymbol}${amount.toLocaleString()} for ${selectedCustomerData.account.name}`);
    }

    setPaymentAmountInput('');
    setPaymentNoteInput('');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-extrabold shadow-2xl flex items-center gap-2 border border-emerald-300 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Customer CRM & Contact Directory</span>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {dashboardStats.totalCount} Registered
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Manage retail customers, wholesale dealers, VIP buyers, track transaction histories, and Udhar balances.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          id="btn-add-customer-top"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Dashboard Overview KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-100">{dashboardStats.totalCount}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{dashboardStats.vipCount} VIP / Top Buyers</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Lifetime Revenue / Spend</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-400">
            {settings.currencySymbol}{dashboardStats.totalLifetimeSpend.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">
            Across POS, Ecommerce & Service Repairs
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Spend / Customer</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-extrabold text-cyan-300">
            {settings.currencySymbol}{Math.round(dashboardStats.avgSpend).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">
            Per active registered profile
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Udhar / Debt Owed</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-400">
            {settings.currencySymbol}{dashboardStats.totalDebtOwed.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">
            Pending customer credit balances
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-customer-search"
            type="text"
            placeholder="Search customers by name, phone (+91...), email, GSTIN, or city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 text-xs text-slate-100 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Customer Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Customer Types</option>
            <option value="Retail">Retail Buyers</option>
            <option value="Wholesale">Wholesale Dealers</option>
            <option value="VIP">VIP Clients</option>
            <option value="Corporate">Corporate / B2B</option>
          </select>

          {/* Balance Filter */}
          <select
            value={balanceFilter}
            onChange={e => setBalanceFilter(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Balances</option>
            <option value="HAS_DEBT">⚠️ Has Udhar Debt</option>
            <option value="CLEAN">✓ Clean Balance</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 text-indigo-300 font-bold px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="SPEND_DESC">Sort: Highest Spend</option>
            <option value="ORDERS_DESC">Sort: Most Orders</option>
            <option value="DEBT_DESC">Sort: Highest Debt</option>
            <option value="NAME_ASC">Sort: Name (A-Z)</option>
            <option value="RECENT">Sort: Recent Activity</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'GRID' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'TABLE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Customer Directory Content */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No matching customers found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new customer to your database.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
          >
            + Add Customer
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(item => {
            const c = item.account;
            const isVip = c.customerType === 'VIP' || item.totalSpent >= 50000;
            const isWholesale = c.customerType === 'Wholesale';

            return (
              <div
                key={c.id}
                className={`bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-md relative group transition hover:border-indigo-500/50 flex flex-col justify-between ${
                  c.currentBalance > 0
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 via-slate-900 to-slate-900'
                    : 'border-slate-800'
                }`}
              >
                {/* Top Customer Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Avatar Initials */}
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm border shadow-md shrink-0 ${
                        isVip
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 border-amber-300'
                          : isWholesale
                          ? 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white border-purple-400'
                          : 'bg-slate-800 text-indigo-400 border-slate-700'
                      }`}>
                        {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-slate-100 text-sm group-hover:text-indigo-300 transition">
                            {c.name}
                          </h3>
                          
                          {/* Type Badge */}
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tight ${
                            c.customerType === 'VIP' || isVip
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : c.customerType === 'Wholesale'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : c.customerType === 'Corporate'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {c.customerType || 'Retail'}
                          </span>
                        </div>

                        <div className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition border border-rose-500/20"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Secondary Details: Email, Address, GSTIN */}
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                    {c.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{c.address} {c.city ? `(${c.city})` : ''}</span>
                      </div>
                    )}
                    {c.gstin && (
                      <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-[10px]">
                        <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>GSTIN: {c.gstin}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spending Metrics & Udhar Balance Box */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Lifetime Spend</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {settings.currencySymbol}{item.totalSpent.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Orders / Repairs</span>
                      <span className="font-extrabold text-indigo-300 text-sm">
                        {item.totalOrdersCount} Txns
                      </span>
                    </div>
                  </div>

                  {/* Udhar Balance Indicator */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Udhar Balance</span>
                    {c.currentBalance > 0 ? (
                      <span className="font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
                        {settings.currencySymbol}{c.currentBalance.toLocaleString()} Debt
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Clean
                      </span>
                    )}
                  </div>

                </div>

                {/* Bottom View Orders & Profile Trigger Button */}
                <button
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setActiveProfileTab('SALES');
                  }}
                  className="w-full bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700/80 group-hover:border-indigo-500/50 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                  <span>View Orders & Profile Details</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-500 group-hover:text-white" />
                </button>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Contact Info</th>
                  <th className="p-3.5">Type & Status</th>
                  <th className="p-3.5 text-right">Lifetime Spend</th>
                  <th className="p-3.5 text-center">Orders</th>
                  <th className="p-3.5 text-right">Udhar Balance</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map(item => {
                  const c = item.account;
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
                            {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100">{c.name}</div>
                            {c.city && <div className="text-[10px] text-slate-400">{c.city}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-slate-200">{c.phone}</div>
                        {c.email && <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{c.email}</div>}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                            {c.customerType || 'Retail'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-right font-extrabold text-emerald-400 text-sm">
                        {settings.currencySymbol}{item.totalSpent.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-300">
                        {item.totalOrdersCount}
                      </td>

                      <td className="p-3.5 text-right font-bold">
                        {c.currentBalance > 0 ? (
                          <span className="text-amber-400 font-extrabold">
                            {settings.currencySymbol}{c.currentBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-500">₹0</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setActiveProfileTab('SALES');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition"
                            title="View Profile & Orders"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg border border-slate-700"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg border border-rose-500/20"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>{editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}</span>
              </h2>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Customer Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formState.name}
                    onChange={e => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={formState.phone}
                    onChange={e => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formState.email}
                    onChange={e => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Customer Type
                  </label>
                  <select
                    value={formState.customerType}
                    onChange={e => setFormState({ ...formState, customerType: e.target.value as any })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Retail">Retail Walk-in</option>
                    <option value="Wholesale">Wholesale Dealer</option>
                    <option value="VIP">VIP Client</option>
                    <option value="Corporate">Corporate / Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Credit Limit ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={formState.creditLimit}
                    onChange={e => setFormState({ ...formState, creditLimit: Number(e.target.value) })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="07AAAAA0000A1Z5"
                    value={formState.gstin}
                    onChange={e => setFormState({ ...formState, gstin: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="New Delhi, Mumbai..."
                    value={formState.city}
                    onChange={e => setFormState({ ...formState, city: e.target.value })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Account Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={e => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Overdue Alert">Overdue Alert</option>
                    <option value="Blocked">Blocked / Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Full Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street address, shop number, locality..."
                  value={formState.address}
                  onChange={e => setFormState({ ...formState, address: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Internal Notes & Preferences
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prefers iPhone models, always asks for tax invoice..."
                  value={formState.notes}
                  onChange={e => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CUSTOMER DETAIL & HISTORY DRAWER / MODAL */}
      {selectedCustomerData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end overflow-hidden animate-in fade-in duration-200">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-4xl h-full flex flex-col shadow-2xl">
            
            {/* Drawer Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white font-black text-xl flex items-center justify-center border border-indigo-400 shadow-xl shrink-0">
                  {selectedCustomerData.account.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-extrabold text-white">
                      {selectedCustomerData.account.name}
                    </h2>
                    <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/40">
                      {selectedCustomerData.account.customerType || 'Retail'}
                    </span>
                    {selectedCustomerData.account.currentBalance > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                        ⚠️ Debt Owed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-500" /> {selectedCustomerData.account.phone}</span>
                    {selectedCustomerData.account.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-500" /> {selectedCustomerData.account.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedCustomerData.account)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setSelectedCustomerId(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Content Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Profile Details Bar & Spend Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifetime Spend</span>
                  <div className="text-lg font-extrabold text-emerald-400">
                    {settings.currencySymbol}{selectedCustomerData.totalSpent.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Orders / Repairs</span>
                  <div className="text-lg font-extrabold text-indigo-300">
                    {selectedCustomerData.totalOrdersCount} Transactions
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Loyalty Points</span>
                  <div className="text-lg font-extrabold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 fill-amber-400" />
                    <span>{selectedCustomerData.loyaltyPoints} Pts</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Udhar Balance</span>
                  <div className={`text-lg font-extrabold ${selectedCustomerData.account.currentBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {settings.currencySymbol}{selectedCustomerData.account.currentBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Extra Contact & GSTIN info if present */}
              {(selectedCustomerData.account.address || selectedCustomerData.account.gstin || selectedCustomerData.account.notes) && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  {selectedCustomerData.account.address && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{selectedCustomerData.account.address} {selectedCustomerData.account.city ? `, ${selectedCustomerData.account.city}` : ''}</span>
                    </div>
                  )}
                  {selectedCustomerData.account.gstin && (
                    <div className="flex items-center gap-2 text-indigo-300 font-mono">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>GSTIN: {selectedCustomerData.account.gstin}</span>
                    </div>
                  )}
                  {selectedCustomerData.account.notes && (
                    <div className="flex items-start gap-2 text-slate-400 italic">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Notes: "{selectedCustomerData.account.notes}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Record Payment / Udhar Ledger Action Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick Ledger Payment / Credit Entry</span>
                  </h4>

                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setRecordType('PAYMENT')}
                      className={`px-3 py-1 rounded-lg transition ${recordType === 'PAYMENT' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Receive Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordType('UDHAR')}
                      className={`px-3 py-1 rounded-lg transition ${recordType === 'UDHAR' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                    >
                      Give Udhar Credit
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRecordTransaction} className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="number"
                    placeholder={`Amount (${settings.currencySymbol})...`}
                    value={paymentAmountInput}
                    onChange={e => setPaymentAmountInput(e.target.value)}
                    className="w-full sm:w-36 bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  {recordType === 'PAYMENT' && (
                    <select
                      value={paymentModeInput}
                      onChange={e => setPaymentModeInput(e.target.value as any)}
                      className="w-full sm:w-28 bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                    >
                      <option value="UPI">UPI / QR</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  )}

                  <input
                    type="text"
                    placeholder="Note / Reference Invoice..."
                    value={paymentNoteInput}
                    onChange={e => setPaymentNoteInput(e.target.value)}
                    className="flex-1 w-full bg-slate-950 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none"
                  />

                  <button
                    type="submit"
                    className={`w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 shadow ${
                      recordType === 'PAYMENT'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-600 hover:bg-amber-500 text-white'
                    }`}
                  >
                    {recordType === 'PAYMENT' ? 'Record Payment' : 'Add Credit'}
                  </button>
                </form>
              </div>

              {/* Sub-Tabs Navigation for Orders & History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
                  
                  <button
                    onClick={() => setActiveProfileTab('SALES')}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      activeProfileTab === 'SALES'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>POS Bills ({selectedCustomerData.matchedSales.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileTab('ECOMMERCE')}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      activeProfileTab === 'ECOMMERCE'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ecommerce Orders ({selectedCustomerData.matchedOrders.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileTab('REPAIRS')}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      activeProfileTab === 'REPAIRS'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Service Repairs ({selectedCustomerData.matchedRepairs.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileTab('EXCHANGES')}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      activeProfileTab === 'EXCHANGES'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Trade-Ins ({selectedCustomerData.matchedExchanges.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveProfileTab('LEDGER')}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                      activeProfileTab === 'LEDGER'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Ledger History ({selectedCustomerData.account.ledgerHistory.length})</span>
                  </button>

                </div>

                {/* TAB 1: POS COUNTER SALES HISTORY */}
                {activeProfileTab === 'SALES' && (
                  <div className="space-y-3">
                    {selectedCustomerData.matchedSales.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                        No POS counter sales receipts recorded for this customer.
                      </div>
                    ) : (
                      selectedCustomerData.matchedSales.map(sale => (
                        <div key={sale.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                          
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div>
                              <div className="font-mono font-bold text-indigo-400">{sale.invoiceNumber}</div>
                              <div className="text-[10px] text-slate-400">{sale.timestamp} • Staff: {sale.salesByStaff}</div>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-emerald-400 text-sm">
                                {settings.currencySymbol}{sale.totalAmount.toLocaleString()}
                              </span>
                              <div className="text-[10px] text-slate-400">{sale.paymentMethod}</div>
                            </div>
                          </div>

                          {/* Purchased Items List */}
                          <div className="space-y-1.5">
                            {sale.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl text-[11px]">
                                <div>
                                  <span className="font-bold text-slate-200">{it.productName}</span>
                                  <span className="text-slate-400 ml-2">x{it.quantity}</span>
                                  {it.imei && (
                                    <div className="text-[10px] font-mono text-cyan-400">IMEI: {it.imei}</div>
                                  )}
                                </div>
                                <div className="font-bold text-slate-300">
                                  {settings.currencySymbol}{(it.unitPrice * it.quantity).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 2: ECOMMERCE ORDERS HISTORY */}
                {activeProfileTab === 'ECOMMERCE' && (
                  <div className="space-y-3">
                    {selectedCustomerData.matchedOrders.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                        No online storefront orders found for this customer.
                      </div>
                    ) : (
                      selectedCustomerData.matchedOrders.map(ord => (
                        <div key={ord.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div>
                              <div className="font-mono font-bold text-indigo-400">{ord.orderNumber}</div>
                              <div className="text-[10px] text-slate-400">{ord.date} • {ord.paymentMethod}</div>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-emerald-400 text-sm">
                                {settings.currencySymbol}{ord.totalAmount.toLocaleString()}
                              </span>
                              <div>
                                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-bold">
                                  {ord.orderStatus}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-slate-300">{it.productName} (x{it.quantity})</span>
                                <span className="font-bold text-slate-200">{settings.currencySymbol}{it.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 3: REPAIR JOB CARDS HISTORY */}
                {activeProfileTab === 'REPAIRS' && (
                  <div className="space-y-3">
                    {selectedCustomerData.matchedRepairs.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                        No service repair job cards found for this customer.
                      </div>
                    ) : (
                      selectedCustomerData.matchedRepairs.map(job => (
                        <div key={job.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div>
                              <div className="font-mono font-bold text-indigo-400">{job.jobCardNumber}</div>
                              <div className="text-slate-200 font-bold mt-0.5">{job.deviceBrand} {job.deviceModel}</div>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-emerald-400 text-sm">
                                {settings.currencySymbol}{job.finalCost || job.estimatedCost}
                              </span>
                              <div className="text-[10px] text-amber-400 font-bold">{job.status}</div>
                            </div>
                          </div>

                          <div className="text-slate-400 text-[11px]">
                            <span className="font-bold text-slate-300">Reported Fault:</span> "{job.reportedFault}"
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 4: TRADE-IN EXCHANGES HISTORY */}
                {activeProfileTab === 'EXCHANGES' && (
                  <div className="space-y-3">
                    {selectedCustomerData.matchedExchanges.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                        No device buybacks or trade-in exchanges found for this customer.
                      </div>
                    ) : (
                      selectedCustomerData.matchedExchanges.map(ex => (
                        <div key={ex.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div>
                              <div className="font-mono font-bold text-indigo-400">{ex.exchangeCode}</div>
                              <div className="text-slate-200 font-bold mt-0.5">{ex.deviceBrand} {ex.deviceModel} ({ex.storageColor})</div>
                            </div>

                            <div className="text-right">
                              <span className="font-extrabold text-amber-400 text-sm">
                                {settings.currencySymbol}{ex.agreedValue.toLocaleString()} Trade Credit
                              </span>
                              <div className="text-[10px] text-slate-400">{ex.grade}</div>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                            <span>IMEI: {ex.imeiNumber}</span>
                            <span className="text-emerald-400 font-bold">{ex.actionTaken}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 5: LEDGER HISTORY */}
                {activeProfileTab === 'LEDGER' && (
                  <div className="space-y-3">
                    {selectedCustomerData.account.ledgerHistory.length === 0 ? (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                        No credit/udhar ledger entries recorded for this account.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedCustomerData.account.ledgerHistory.map(led => (
                          <div key={led.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                                  led.type.includes('Credit') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {led.type}
                                </span>
                                {led.referenceInvoice && (
                                  <span className="font-mono text-[10px] text-slate-400">{led.referenceInvoice}</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-300 mt-1">{led.note}</div>
                              <div className="text-[10px] text-slate-500">{led.timestamp} • By {led.recordedBy}</div>
                            </div>

                            <div className="text-right">
                              <span className={`font-extrabold text-sm ${
                                led.type.includes('Credit') ? 'text-emerald-400' : 'text-amber-400'
                              }`}>
                                {led.type.includes('Credit') ? '-' : '+'}{settings.currencySymbol}{led.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
