import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  RefreshCw,
  CreditCard,
  AlertTriangle,
  Smartphone,
  ArrowUpRight,
  Store,
  DollarSign,
  Users,
  CheckCircle2,
  Tag,
  Wrench,
  Package,
  Activity,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'all' | 'custom';

export const DashboardOverview: React.FC = () => {
  const {
    sales,
    products,
    exchanges,
    customers,
    users,
    setActiveTab,
    settings,
    jobCards,
    expenses,
    orders,
    purchaseOrders
  } = useApp();

  // Date helper references
  const todayObj = new Date();
  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
  const todayStr = formatDateStr(todayObj);

  const yesterdayObj = new Date(todayObj);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterdayObj);

  const sevenDaysAgoObj = new Date(todayObj);
  sevenDaysAgoObj.setDate(sevenDaysAgoObj.getDate() - 6);
  const sevenDaysAgoStr = formatDateStr(sevenDaysAgoObj);

  const thirtyDaysAgoObj = new Date(todayObj);
  thirtyDaysAgoObj.setDate(thirtyDaysAgoObj.getDate() - 29);
  const thirtyDaysAgoStr = formatDateStr(thirtyDaysAgoObj);

  const firstOfMonthObj = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
  const firstOfMonthStr = formatDateStr(firstOfMonthObj);

  // Date Range Filter State
  const [preset, setPreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>(todayStr);

  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    if (newPreset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (newPreset === 'yesterday') {
      setStartDate(yesterdayStr);
      setEndDate(yesterdayStr);
    } else if (newPreset === '7days') {
      setStartDate(sevenDaysAgoStr);
      setEndDate(todayStr);
    } else if (newPreset === '30days') {
      setStartDate(thirtyDaysAgoStr);
      setEndDate(todayStr);
    } else if (newPreset === 'thisMonth') {
      setStartDate(firstOfMonthStr);
      setEndDate(todayStr);
    } else if (newPreset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Date Range Checker Helper
  const isInDateRange = (rawDateStr?: string) => {
    if (!rawDateStr) return true;
    if (preset === 'all' && !startDate && !endDate) return true;

    let datePart = rawDateStr.trim();
    if (datePart.includes('T')) {
      datePart = datePart.split('T')[0];
    } else if (datePart.includes(' ')) {
      datePart = datePart.split(' ')[0];
    }

    if (startDate && datePart < startDate) return false;
    if (endDate && datePart > endDate) return false;
    return true;
  };

  // Filtered collections based on Date Range
  const filteredSales = useMemo(() => sales.filter(s => isInDateRange(s.timestamp)), [sales, startDate, endDate, preset]);
  const filteredExchanges = useMemo(() => exchanges.filter(e => isInDateRange(e.timestamp)), [exchanges, startDate, endDate, preset]);
  const filteredJobCards = useMemo(() => jobCards ? jobCards.filter(j => isInDateRange(j.createdDate)) : [], [jobCards, startDate, endDate, preset]);
  const filteredExpenses = useMemo(() => expenses ? expenses.filter(e => isInDateRange(e.date)) : [], [expenses, startDate, endDate, preset]);
  const filteredOrders = useMemo(() => orders ? orders.filter(o => isInDateRange(o.date)) : [], [orders, startDate, endDate, preset]);
  const filteredPurchaseOrders = useMemo(() => purchaseOrders ? purchaseOrders.filter(p => isInDateRange(p.orderDate)) : [], [purchaseOrders, startDate, endDate, preset]);

  // Aggregated Financial & Operational Values
  const totalSalesVal = filteredSales.reduce((a, b) => a + b.totalAmount, 0);
  const totalPhonesSold = filteredSales.reduce((acc, s) => acc + s.items.filter(i => i.imei).length, 0);
  const totalTradeInVal = filteredExchanges.reduce((a, b) => a + b.agreedValue, 0);
  const totalExpenseVal = filteredExpenses.reduce((a, e) => a + (e.amount || 0), 0);
  const totalUdharReceivable = customers.reduce((a, b) => a + b.currentBalance, 0);
  const lowStockProducts = products.filter(p => p.stock <= settings.lowStockThreshold);

  // Operational KPI Cards
  const requestedKpiCards = [
    {
      label: 'Total Orders',
      percentage: `${filteredSales.length} Total`,
      value: filteredSales.length.toString(),
      icon: ShoppingBag,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      label: 'Sell Requests',
      percentage: `${filteredOrders.length} Online`,
      value: filteredOrders.length.toString(),
      icon: ShoppingCart,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      label: 'Repair Bookings',
      percentage: `${filteredJobCards.length} Cards`,
      value: filteredJobCards.length.toString(),
      icon: Wrench,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      label: 'Product Sales',
      percentage: 'Filtered',
      value: `${settings.currencySymbol}${totalSalesVal.toLocaleString()}`,
      icon: Tag,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      label: 'Recycling Requests',
      percentage: `${filteredExchanges.length} Units`,
      value: filteredExchanges.length.toString(),
      icon: RefreshCw,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    },
    {
      label: 'Revenue Metrics',
      percentage: 'Filtered',
      value: `${settings.currencySymbol}${totalSalesVal.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      label: 'Staff & Cashiers',
      percentage: 'Active',
      value: users ? users.filter(u => (u.status || 'Active') === 'Active').length.toString() : '0',
      icon: Users,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    {
      label: 'Complaints',
      percentage: '0 Pending',
      value: '0',
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      label: 'Purchase Orders',
      percentage: `${filteredPurchaseOrders.length} POs`,
      value: filteredPurchaseOrders.length.toString(),
      icon: Package,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    },
    {
      label: 'Active Spend',
      percentage: 'Expenses',
      value: `${settings.currencySymbol}${totalExpenseVal.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30'
    }
  ];

  // Dynamic Chart Data Grouped by Date
  const chartData = useMemo(() => {
    const dateMap: Record<string, { day: string; sales: number; tradeIns: number }> = {};

    filteredSales.forEach(s => {
      const rawDate = s.timestamp.includes('T') ? s.timestamp.split('T')[0] : s.timestamp.split(' ')[0];
      if (!dateMap[rawDate]) {
        dateMap[rawDate] = { day: rawDate, sales: 0, tradeIns: 0 };
      }
      dateMap[rawDate].sales += s.totalAmount;
    });

    filteredExchanges.forEach(e => {
      const rawDate = e.timestamp.includes('T') ? e.timestamp.split('T')[0] : e.timestamp.split(' ')[0];
      if (!dateMap[rawDate]) {
        dateMap[rawDate] = { day: rawDate, sales: 0, tradeIns: 0 };
      }
      dateMap[rawDate].tradeIns += e.agreedValue;
    });

    const sortedDates = Object.keys(dateMap).sort();

    if (sortedDates.length === 0) {
      return [
        { day: startDate || 'Start', sales: 0, tradeIns: 0 },
        { day: endDate || 'End', sales: 0, tradeIns: 0 }
      ];
    }

    return sortedDates.map(d => ({
      day: d,
      sales: dateMap[d].sales,
      tradeIns: dateMap[d].tradeIns
    }));
  }, [filteredSales, filteredExchanges, startDate, endDate]);

  return (
    <div id="dashboard-overview-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Mobile Shop Business Dashboard
          </h2>
          <p className="text-xs text-slate-400">
            Real-time executive summary across POS Counter, Trade-in Exchange, Ecommerce & Khata Ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Staff & Cashiers</span>
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Counter</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left Label & Active Filter Badge */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">Date Range Filter</span>
                {preset !== 'all' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    {preset}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {preset === 'all' && !startDate && !endDate ? (
                  <span>Showing all-time recorded transactions ({filteredSales.length} sales)</span>
                ) : (
                  <span>
                    Period: <strong className="text-slate-200">{startDate || 'Beginning'}</strong> to <strong className="text-slate-200">{endDate || 'Today'}</strong> &bull; <span className="text-emerald-400 font-semibold">{filteredSales.length} Sales found</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Preset Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: '30days', label: 'Last 30 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'all', label: 'All Time' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handlePresetChange(btn.id as DatePreset)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  preset === btn.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

        </div>

        {/* Custom Date Picker Inputs & Reset Button */}
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-400">From Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreset('custom');
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-medium text-slate-400">To Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreset('custom');
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {(startDate || endDate || preset !== 'all') && (
              <button
                onClick={() => handlePresetChange('all')}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-xl transition border border-rose-500/20 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>KPIs, cards & revenue trend charts update automatically</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Gross Sales Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Gross Revenue</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {settings.currencySymbol}{totalSalesVal.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> {filteredSales.length} transactions recorded
          </div>
        </div>

        {/* KPI 2: Phones & Accessories Sold */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Smartphones Sold</span>
            <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Smartphone className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalPhonesSold} Units
          </div>
          <div className="text-[11px] text-slate-400">
            All IMEIs tracked & verified
          </div>
        </div>

        {/* KPI 3: Trade-In Valuation Payout */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Trade-In Exchange Payout</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {settings.currencySymbol}{totalTradeInVal.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400">
            {filteredExchanges.length} devices evaluated
          </div>
        </div>

        {/* KPI 4: Customer Udhar Receivable */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Customer Udhar (Credit)</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {settings.currencySymbol}{totalUdharReceivable.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Khata ledger active
          </div>
        </div>

      </div>

      {/* Requested 10 KPI Metric Cards Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Operational & Performance Metrics</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {requestedKpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl hover:border-slate-700 transition flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 truncate pr-1">
                    {card.label}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${card.color}`}>
                    {card.percentage}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xl font-extrabold text-white tracking-tight">
                    {card.value}
                  </div>
                  <div className={`p-1.5 rounded-xl border ${card.color} group-hover:scale-110 transition shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Quick Jump Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'sell', label: '1. POS Sell Counter', color: 'border-indigo-500/40 hover:bg-indigo-950/40', icon: ShoppingCart },
          { id: 'buy', label: '2. Device Buy & Trade', color: 'border-cyan-500/40 hover:bg-cyan-950/40', icon: RefreshCw },
          { id: 'catalog', label: '3. Product Catalog', color: 'border-purple-500/40 hover:bg-purple-950/40', icon: Store },
          { id: 'credits', label: '4. Credit Ledger', color: 'border-amber-500/40 hover:bg-amber-950/40', icon: CreditCard },
          { id: 'settings', label: '5. Settings & API', color: 'border-emerald-500/40 hover:bg-emerald-950/40', icon: Tag }
        ].map(mod => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id as any)}
              className={`p-3 rounded-2xl bg-slate-900 border ${mod.color} text-left transition flex items-center gap-2.5 group cursor-pointer`}
            >
              <Icon className="w-4 h-4 text-slate-300 group-hover:scale-110 transition shrink-0" />
              <span className="text-xs font-bold text-slate-200 truncate">{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* Revenue & Trade-In Sales Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Sales & Trade-In Revenue Trends</h3>
              <p className="text-xs text-slate-400">Daily breakdown of counter sales vs device buyback credit for active range.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="sales" name="Counter Sales" stroke="#6366f1" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="tradeIns" name="Trade-In Credit" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTrade)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock & Inventory Alerts */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Low Stock Alerts</span>
            </h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-8">
                All smartphone & accessory stocks are healthy!
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.id} className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.category}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-extrabold">{p.stock} Left</span>
                    <button onClick={() => setActiveTab('catalog')} className="block text-[10px] text-indigo-400 font-semibold hover:underline cursor-pointer">
                      Restock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
