import React from 'react';
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
  Percent
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { sales, products, exchanges, customers, suppliers, users, setActiveTab, settings } = useApp();

  const totalSalesVal = sales.reduce((a, b) => a + b.totalAmount, 0);
  const totalPhonesSold = sales.reduce((acc, s) => acc + s.items.filter(i => i.imei).length, 0);
  const totalTradeInVal = exchanges.reduce((a, b) => a + b.agreedValue, 0);
  const totalUdharReceivable = customers.reduce((a, b) => a + b.currentBalance, 0);
  const lowStockProducts = products.filter(p => p.stock <= settings.lowStockThreshold);

  // Requested KPI Metric Cards
  const requestedKpiCards = [
    {
      label: 'Total Orders',
      percentage: '12%',
      value: sales.length > 0 ? sales.length.toString() : '0',
      icon: ShoppingBag,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      label: 'Sell Requests',
      percentage: '2%',
      value: '0',
      icon: ShoppingCart,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      label: 'Repair Bookings',
      percentage: '24%',
      value: '0',
      icon: Wrench,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      label: 'Product Sales',
      percentage: '18%',
      value: `${settings.currencySymbol}${totalSalesVal.toLocaleString()}`,
      icon: Tag,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      label: 'Recycling Requests',
      percentage: '5%',
      value: '0',
      icon: RefreshCw,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30'
    },
    {
      label: 'Revenue Metrics',
      percentage: '15%',
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
      percentage: '30%',
      value: '0',
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    },
    {
      label: 'Purchase Orders',
      percentage: '3%',
      value: '0',
      icon: Package,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    },
    {
      label: 'Active Spend',
      percentage: '5%',
      value: `${settings.currencySymbol}0`,
      icon: CreditCard,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30'
    }
  ];

  // Mock weekly revenue chart data
  const chartData = [
    { day: 'Mon', sales: 42000, tradeIns: 12000 },
    { day: 'Tue', sales: 68000, tradeIns: 18000 },
    { day: 'Wed', sales: 55000, tradeIns: 15000 },
    { day: 'Thu', sales: 89000, tradeIns: 24000 },
    { day: 'Fri', sales: 112000, tradeIns: 28000 },
    { day: 'Sat', sales: 145000, tradeIns: 35000 },
    { day: 'Today', sales: totalSalesVal || 136900, tradeIns: totalTradeInVal || 18000 }
  ];

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
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% from yesterday
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
            {exchanges.length} devices evaluated
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
              className={`p-3 rounded-2xl bg-slate-900 border ${mod.color} text-left transition flex items-center gap-2.5 group`}
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
              <p className="text-xs text-slate-400">Daily breakdown of counter sales vs device buyback credit.</p>
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
                    <button onClick={() => setActiveTab('catalog')} className="block text-[10px] text-indigo-400 font-semibold hover:underline">
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
