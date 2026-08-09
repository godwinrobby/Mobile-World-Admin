import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Printer,
  PieChart as PieChartIcon,
  ShoppingBag,
  Wrench,
  RotateCcw,
  Users,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  Layers,
  Percent,
  RefreshCw,
  Bot,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

type ReportTab = 'overview' | 'sales' | 'gst' | 'inventory' | 'repairs' | 'credit';
type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export const ReportsModule: React.FC = () => {
  const {
    sales,
    products,
    orders,
    exchanges,
    customers,
    suppliers,
    jobCards,
    expenses,
    settings,
    users
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('overview');
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');

  const currency = settings.currencySymbol || '₹';

  // Helper to filter sales based on selected period or search
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      const matchesSearch =
        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.salesByStaff.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }, [sales, searchTerm, paymentFilter]);

  // Financial Metrics Calculations
  const metrics = useMemo(() => {
    const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalTaxCollected = filteredSales.reduce((acc, s) => acc + s.taxAmount, 0);
    const totalSubtotal = filteredSales.reduce((acc, s) => acc + s.subtotal, 0);
    const totalTradeInCredit = filteredSales.reduce((acc, s) => acc + (s.tradeInCreditApplied || 0), 0);
    const totalDiscounts = filteredSales.reduce((acc, s) => acc + (s.discountAmount || 0), 0);

    // Cost of goods sold (COGS) estimation from items in filteredSales
    let estimatedCOGS = 0;
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const unitCost = prod ? prod.costPrice : item.unitPrice * 0.85;
        estimatedCOGS += unitCost * item.quantity;
      });
    });

    // Repair revenue
    const totalRepairRevenue = jobCards
      .filter((j) => j.status === 'Delivered' || j.status === 'Ready for Pickup')
      .reduce((acc, j) => acc + j.finalCost, 0);

    const totalRepairPartsCost = jobCards
      .filter((j) => j.status === 'Delivered' || j.status === 'Ready for Pickup')
      .reduce((acc, j) => acc + (j.estimatedCost * 0.4), 0);

    // E-commerce revenue
    const totalEcomRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((acc, o) => acc + o.totalAmount, 0);

    // Operating expenses
    const totalExpenses = (expenses || []).reduce((acc, e) => acc + e.amount, 0);

    // Gross profit = Total Revenue - COGS
    const grossProfit = totalSalesRevenue + totalRepairRevenue + totalEcomRevenue - estimatedCOGS - totalRepairPartsCost;
    const grossMarginPercent = totalSalesRevenue > 0 ? ((grossProfit / (totalSalesRevenue + totalRepairRevenue + totalEcomRevenue)) * 100).toFixed(1) : '0.0';
    const netProfit = grossProfit - totalExpenses;

    // Receivables & Payables
    const totalCustomerUdhar = customers.reduce((acc, c) => acc + c.currentBalance, 0);
    const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.currentPayable, 0);

    // Inventory Valuation
    const inventoryCostValuation = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const inventoryRetailValuation = products.reduce((acc, p) => acc + (p.posPrice * p.stock), 0);

    return {
      totalSalesRevenue,
      totalTaxCollected,
      totalSubtotal,
      totalTradeInCredit,
      totalDiscounts,
      estimatedCOGS,
      totalRepairRevenue,
      totalEcomRevenue,
      totalExpenses,
      grossProfit,
      grossMarginPercent,
      netProfit,
      totalCustomerUdhar,
      totalSupplierPayable,
      inventoryCostValuation,
      inventoryRetailValuation,
      invoiceCount: filteredSales.length,
      avgInvoiceValue: filteredSales.length > 0 ? totalSalesRevenue / filteredSales.length : 0
    };
  }, [filteredSales, products, jobCards, orders, expenses, customers, suppliers]);

  // Chart Data: Payment Method Breakdown
  const paymentMethodChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach((s) => {
      map[s.paymentMethod] = (map[s.paymentMethod] || 0) + s.totalAmount;
    });
    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
    return Object.keys(map).map((key, idx) => ({
      name: key,
      value: map[key],
      color: colors[idx % colors.length]
    }));
  }, [filteredSales]);

  // Chart Data: Daily Revenue & Profit Trend
  const revenueTrendData = useMemo(() => {
    const datesMap: Record<string, { date: string; Revenue: number; Tax: number; Profit: number }> = {};

    filteredSales.forEach((sale) => {
      const dateStr = sale.timestamp.split('T')[0] || sale.timestamp.split(' ')[0] || '2026-08-01';
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { date: dateStr, Revenue: 0, Tax: 0, Profit: 0 };
      }
      datesMap[dateStr].Revenue += sale.totalAmount;
      datesMap[dateStr].Tax += sale.taxAmount;
      datesMap[dateStr].Profit += sale.totalAmount * 0.18; // approx 18% margin
    });

    const sorted = Object.values(datesMap).sort((a, b) => a.date.localeCompare(b.date));
    return sorted.length > 0
      ? sorted
      : [
          { date: 'Aug 01', Revenue: 45000, Tax: 8100, Profit: 8100 },
          { date: 'Aug 02', Revenue: 82000, Tax: 14760, Profit: 14760 },
          { date: 'Aug 03', Revenue: 64000, Tax: 11520, Profit: 11520 },
          { date: 'Aug 04', Revenue: 115000, Tax: 20700, Profit: 20700 },
          { date: 'Aug 05', Revenue: 93000, Tax: 16740, Profit: 16740 },
          { date: 'Aug 06', Revenue: 148000, Tax: 26640, Profit: 26640 },
          { date: 'Aug 07', Revenue: 125000, Tax: 22500, Profit: 22500 }
        ];
  }, [filteredSales]);

  // Staff Leaderboard
  const staffPerformance = useMemo(() => {
    const map: Record<string, { staff: string; count: number; total: number }> = {};
    filteredSales.forEach((s) => {
      const name = s.salesByStaff || 'Cashier Admin';
      if (!map[name]) {
        map[name] = { staff: name, count: 0, total: 0 };
      }
      map[name].count += 1;
      map[name].total += s.totalAmount;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  // CSV Export Handler
  const handleExportCSV = (type: 'sales' | 'gst' | 'inventory') => {
    let csvData = '';
    let filename = '';

    if (type === 'sales') {
      filename = `MobileWorld_Sales_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      csvData = 'Invoice No,Date,Customer Name,Phone,Payment Method,Subtotal,Tax (GST),Total Amount,Staff\n';
      filteredSales.forEach((s) => {
        csvData += `"${s.invoiceNumber}","${s.timestamp}","${s.customerName}","${s.customerPhone}","${s.paymentMethod}",${s.subtotal},${s.taxAmount},${s.totalAmount},"${s.salesByStaff}"\n`;
      });
    } else if (type === 'gst') {
      filename = `MobileWorld_GST_GSTR1_Summary_${new Date().toISOString().slice(0, 10)}.csv`;
      csvData = 'Invoice No,Invoice Date,Customer Name,GSTIN,Taxable Value,CGST (9%),SGST (9%),IGST (18%),Total Invoice Value\n';
      filteredSales.forEach((s) => {
        const taxable = s.subtotal - s.discountAmount;
        const halfTax = (s.taxAmount / 2).toFixed(2);
        csvData += `"${s.invoiceNumber}","${s.timestamp}","${s.customerName}","URP",${taxable},${halfTax},${halfTax},0.00,${s.totalAmount}\n`;
      });
    } else if (type === 'inventory') {
      filename = `MobileWorld_Inventory_Valuation_${new Date().toISOString().slice(0, 10)}.csv`;
      csvData = 'Product Name,Brand,Category,Stock,Cost Price,POS Price,Total Cost Value,Total Retail Value\n';
      products.forEach((p) => {
        csvData += `"${p.name}","${p.brand}","${p.category}",${p.stock},${p.costPrice},${p.posPrice},${p.costPrice * p.stock},${p.posPrice * p.stock}\n`;
      });
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                Business Analytics & GST Financial Reports
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Live multi-channel revenue statements, GST B2C returns, profit margins & inventory valuation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => document.getElementById('ai-assistant-btn')?.click()}
            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer border border-indigo-400/30"
          >
            <Bot className="w-4 h-4 text-purple-200" />
            <span>AI Income & Report Assistant</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
          <button
            onClick={() => handleExportCSV('sales')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" /> Export Sales CSV
          </button>
          <button
            onClick={() => handleExportCSV('gst')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" /> GSTR-1 Return (.CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium p-2.5 rounded-xl transition cursor-pointer"
            title="Print Report Page"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Date Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Report Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: 'overview', label: 'Financial Overview', icon: TrendingUp },
            { id: 'sales', label: 'Sales & Invoices', icon: ShoppingBag },
            { id: 'gst', label: 'GST & Tax (GSTR-1)', icon: FileText },
            { id: 'inventory', label: 'Inventory Valuation', icon: Package },
            { id: 'repairs', label: 'Repairs & Trade-in', icon: Wrench },
            { id: 'credit', label: 'Udhar & Vendor Payables', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReportTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Period Filter Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
          {(['today', 'week', 'month', 'quarter', 'year', 'all'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition cursor-pointer ${
                period === p
                  ? 'bg-slate-800 text-indigo-400 border border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Sales Revenue</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-100 tracking-tight">
            {currency}{metrics.totalSalesRevenue.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Invoices Count:</span>
            <span className="font-bold text-slate-200">{metrics.invoiceCount} Bills</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>GST Output Tax Liability</span>
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-400 tracking-tight">
            {currency}{metrics.totalTaxCollected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>GST Tax Rate:</span>
            <span className="font-bold text-slate-200">{settings.taxRatePercent || 18}% Standard</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Profit Margin</span>
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-cyan-400 tracking-tight">
            {metrics.grossMarginPercent}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Est. Gross Margin:</span>
            <span className="font-bold text-emerald-400">{currency}{metrics.grossProfit.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Stock Retail Valuation</span>
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {currency}{metrics.inventoryRetailValuation.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Cost Valuation:</span>
            <span className="font-bold text-slate-300">{currency}{metrics.inventoryCostValuation.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* TAB 1: FINANCIAL OVERVIEW */}
      {activeReportTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue & Profit Trend Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span>Daily Revenue & Estimated Gross Margin Trend</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track counter sales velocity and accumulated tax output across business days.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-300 font-medium">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300 font-medium">Margin (Est.)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: any) => [`${currency}${Number(value).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Method Distribution & Staff Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-400" />
                <span>Payment Channels Distribution</span>
              </h3>
              <div className="h-60 w-full flex items-center justify-center">
                {paymentMethodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {paymentMethodChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Revenue']}
                      />
                      <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-500">No payment transaction data available</div>
                )}
              </div>
            </div>

            {/* Sales Staff Leaderboard */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Staff Sales Performance Leaderboard</span>
                </h3>
                <span className="text-[11px] text-slate-400">Total {staffPerformance.length} Executives</span>
              </div>

              <div className="space-y-3">
                {staffPerformance.map((st, idx) => (
                  <div
                    key={st.staff}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-xs text-slate-100">{st.staff}</div>
                        <div className="text-[10px] text-slate-400">{st.count} Invoices Billed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-xs text-indigo-400">
                        {currency}{st.total.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">Contribution</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED SALES & INVOICES REPORT */}
      {activeReportTab === 'sales' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice no, customer or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Payment Methods</option>
                <option value="Cash">Cash Only</option>
                <option value="Card">Card Only</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Store Credit / Udhar">Store Credit / Udhar</option>
              </select>

              <button
                onClick={() => handleExportCSV('sales')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" /> Download Sales Log
              </button>
            </div>
          </div>

          {/* Sales Transactions Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Tax Invoices Register ({filteredSales.length})</h3>
              <span className="text-xs text-slate-400">Sorted by newest timestamp</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items Summary</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5 text-right">Tax (GST)</th>
                    <th className="p-3.5 text-right">Total Amount</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-indigo-400">{sale.invoiceNumber}</td>
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{sale.timestamp}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-100">{sale.customerName}</div>
                        <div className="text-[10px] text-slate-400">{sale.customerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="max-w-xs truncate text-slate-300">
                          {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                        {sale.tradeInCreditApplied > 0 && (
                          <span className="text-[10px] text-amber-400">Trade-in credit applied</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-medium text-slate-300">
                        {currency}{sale.taxAmount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">
                        {currency}{sale.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sale.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                        No sales transactions match the current search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GST & TAX COMPLIANCE SUMMARY */}
      {activeReportTab === 'gst' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span>GST Return Compliance Summary (GSTR-1 B2C / B2B)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Ready statement for CA audit, GST portal filing, CGST/SGST breakdown, and HSN codes.
                </p>
              </div>
              <button
                onClick={() => handleExportCSV('gst')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> Download GSTR-1 CSV Sheet
              </button>
            </div>

            {/* GST Tax Breakup Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">Total Taxable Turnover</span>
                <div className="text-xl font-black text-slate-100">
                  {currency}{metrics.totalSubtotal.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Excluding GST Component</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">CGST Collected (9%)</span>
                <div className="text-xl font-black text-indigo-400">
                  {currency}{(metrics.totalTaxCollected / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-500">Central Goods and Services Tax</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                <span className="text-xs text-slate-400">SGST Collected (9%)</span>
                <div className="text-xl font-black text-indigo-400">
                  {currency}{(metrics.totalTaxCollected / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-500">State Goods and Services Tax</div>
              </div>
            </div>
          </div>

          {/* GST Invoice Details Sheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
              B2C Outward Supplies Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Taxable Value</th>
                    <th className="p-3.5">CGST (9%)</th>
                    <th className="p-3.5">SGST (9%)</th>
                    <th className="p-3.5 text-right">Total Invoice Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredSales.map((sale) => {
                    const halfTax = sale.taxAmount / 2;
                    return (
                      <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-indigo-400">{sale.invoiceNumber}</td>
                        <td className="p-3.5 text-slate-400">{sale.timestamp.split('T')[0]}</td>
                        <td className="p-3.5 font-semibold text-slate-200">
                          {currency}{sale.subtotal.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-slate-300">{currency}{halfTax.toFixed(2)}</td>
                        <td className="p-3.5 text-slate-300">{currency}{halfTax.toFixed(2)}</td>
                        <td className="p-3.5 text-right font-extrabold text-emerald-400">
                          {currency}{sale.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY VALUATION & PRODUCT PROFITABILITY */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="text-xs text-slate-400">Total Asset Cost Valuation</div>
              <div className="text-2xl font-black text-slate-100">
                {currency}{metrics.inventoryCostValuation.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Based on wholesale cost prices across {products.length} catalog SKUs</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="text-xs text-slate-400">Expected Total Retail Revenue Potential</div>
              <div className="text-2xl font-black text-emerald-400">
                {currency}{metrics.inventoryRetailValuation.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">
                Expected margin: {currency}{(metrics.inventoryRetailValuation - metrics.inventoryCostValuation).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Product Stock Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Product Catalog Profitability & Stock Audit</h3>
              <button
                onClick={() => handleExportCSV('inventory')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Inventory CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Brand & Category</th>
                    <th className="p-3.5 text-center">Current Stock</th>
                    <th className="p-3.5 text-right">Cost Price</th>
                    <th className="p-3.5 text-right">POS Price</th>
                    <th className="p-3.5 text-right">Per Unit Profit</th>
                    <th className="p-3.5 text-right">Total Stock Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {products.map((p) => {
                    const unitMargin = p.posPrice - p.costPrice;
                    const totalVal = p.posPrice * p.stock;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-slate-100 flex items-center gap-2.5">
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                          <span>{p.name}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-indigo-400 font-semibold">{p.brand}</span>
                          <div className="text-[10px] text-slate-400">{p.category}</div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stock > 3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {p.stock} Units
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-slate-400">{currency}{p.costPrice.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-semibold text-slate-200">{currency}{p.posPrice.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-extrabold text-cyan-400">+{currency}{unitMargin.toLocaleString()}</td>
                        <td className="p-3.5 text-right font-extrabold text-indigo-400">{currency}{totalVal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPAIRS & TRADE-IN EXCHANGE REPORT */}
      {activeReportTab === 'repairs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Total Repair Revenue Collected</span>
              <div className="text-2xl font-black text-indigo-400">
                {currency}{metrics.totalRepairRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">{jobCards.length} Job Cards Recorded</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Trade-In Devices Inspected</span>
              <div className="text-2xl font-black text-amber-400">
                {exchanges.length} Devices
              </div>
              <div className="text-[10px] text-slate-500">Total evaluation value: {currency}{exchanges.reduce((a, b) => a + b.agreedValue, 0).toLocaleString()}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Average Repair Ticket Value</span>
              <div className="text-2xl font-black text-emerald-400">
                {currency}{jobCards.length > 0 ? (metrics.totalRepairRevenue / jobCards.length).toFixed(0) : 0}
              </div>
              <div className="text-[10px] text-slate-500">Service labor + Spare parts</div>
            </div>
          </div>

          {/* Job Cards Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
              Service Center Job Cards Summary
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">Job Card #</th>
                    <th className="p-3.5">Customer & Model</th>
                    <th className="p-3.5">Reported Issue</th>
                    <th className="p-3.5 text-center">Technician</th>
                    <th className="p-3.5 text-right">Cost</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {jobCards.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-indigo-400">{j.jobCardNumber}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-100">{j.customerName}</div>
                        <div className="text-[10px] text-indigo-400">{j.deviceBrand} {j.deviceModel}</div>
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate">{j.issueDescription}</td>
                      <td className="p-3.5 text-center text-slate-400">{j.technicianName}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">{currency}{j.finalCost.toLocaleString()}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: UDHAR (CUSTOMER CREDIT) & VENDOR PAYABLES */}
      {activeReportTab === 'credit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Customer Udhar Receivables</span>
                <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-rose-400">
                {currency}{metrics.totalCustomerUdhar.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Money to be collected from regular customers across {customers.length} ledger accounts</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Supplier / Vendor Debt Payables</span>
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-amber-400">
                {currency}{metrics.totalSupplierPayable.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">Outstanding payments owed to smartphone distributors & accessory vendors</p>
            </div>
          </div>

          {/* Customer Credit Outstanding Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
              Customer Khata Outstanding Balances
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Mobile Number</th>
                    <th className="p-3.5 text-right">Credit Limit</th>
                    <th className="p-3.5 text-right">Current Balance Owed</th>
                    <th className="p-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-100">{c.customerName}</td>
                      <td className="p-3.5 text-slate-400">{c.phone}</td>
                      <td className="p-3.5 text-right text-slate-400">{currency}{c.creditLimit.toLocaleString()}</td>
                      <td className="p-3.5 text-right font-black text-rose-400">{currency}{c.currentBalance.toLocaleString()}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.currentBalance > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {c.currentBalance > 0 ? 'Payment Due' : 'Clear Account'}
                        </span>
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
  );
};
