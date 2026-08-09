import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TradeInExchange } from '../../types';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Smartphone,
  ShieldCheck,
  FileText,
  Tag,
  Trash2,
  User,
  Phone,
  BadgeCheck,
  DollarSign,
  Building2,
  Sparkles,
  Printer,
  Copy,
  AlertCircle
} from 'lucide-react';

export const BuyModule: React.FC = () => {
  const { exchanges, updateExchangeStatus, settings, setActiveTab } = useApp();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'value-high' | 'value-low'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Selected Detail Modal State
  const [selectedExchange, setSelectedExchange] = useState<TradeInExchange | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

  // Filtered and Sorted Exchanges List
  const filteredExchanges = useMemo(() => {
    return exchanges.filter((ex) => {
      // Search Matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ex.customerName.toLowerCase().includes(q) ||
        ex.customerPhone.toLowerCase().includes(q) ||
        ex.deviceModel.toLowerCase().includes(q) ||
        ex.deviceBrand.toLowerCase().includes(q) ||
        ex.imeiNumber.toLowerCase().includes(q) ||
        ex.exchangeCode.toLowerCase().includes(q) ||
        (ex.voucherCode && ex.voucherCode.toLowerCase().includes(q));

      // Status Matching
      const matchesStatus =
        selectedStatus === 'ALL' || ex.status.toLowerCase() === selectedStatus.toLowerCase();

      // Brand Matching
      const matchesBrand =
        selectedBrand === 'ALL' || ex.deviceBrand.toLowerCase() === selectedBrand.toLowerCase();

      // Action Matching
      const matchesAction =
        selectedAction === 'ALL' || ex.actionTaken.toLowerCase() === selectedAction.toLowerCase();

      return matchesSearch && matchesStatus && matchesBrand && matchesAction;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === 'oldest') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (sortBy === 'value-high') return b.agreedValue - a.agreedValue;
      if (sortBy === 'value-low') return a.agreedValue - b.agreedValue;
      return 0;
    });
  }, [exchanges, searchQuery, selectedStatus, selectedBrand, selectedAction, sortBy]);

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedBrand, selectedAction, itemsPerPage]);

  // Pagination Calculations
  const totalItems = filteredExchanges.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredExchanges.slice(startIndex, endIndex);

  // KPI Dashboard Summaries
  const totalValuationSum = exchanges.reduce((acc, curr) => acc + curr.agreedValue, 0);
  const totalCompletedCount = exchanges.filter((e) => e.status === 'Completed').length;
  const inRefurbishCount = exchanges.filter((e) => e.status === 'In Refurbish').length;
  const avgValuation = exchanges.length > 0 ? Math.round(totalValuationSum / exchanges.length) : 0;

  // Copy Voucher Code Handler
  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2500);
  };

  // Print Certificate Handler
  const handlePrintCertificate = (exchange: TradeInExchange) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Buyback & Trade-In Certificate - ${exchange.exchangeCode}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { margin: 0; color: #0284c7; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
            .section { margin-bottom: 20px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .section-title { font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
            .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
            .price { font-size: 20px; font-weight: 900; color: #059669; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 20px; }
            .signature-box { text-align: center; border-top: 1px dashed #94a3b8; width: 200px; padding-top: 5px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${settings.shopName || 'Mobile Shop POS'}</h1>
            <p>${settings.address || 'Authorized Device Buyback & Refurbish Center'}</p>
            <p>Phone: ${settings.phone || 'N/A'} | Trade-In Code: <strong>${exchange.exchangeCode}</strong></p>
          </div>

          <div style="text-align: right; font-size: 12px; color: #64748b; margin-bottom: 15px;">
            Date & Time: ${exchange.timestamp}
          </div>

          <div class="section">
            <div class="section-title">Customer & Identification</div>
            <div class="grid">
              <div><strong>Customer Name:</strong> ${exchange.customerName}</div>
              <div><strong>Phone Number:</strong> ${exchange.customerPhone}</div>
              <div><strong>Govt ID Proof:</strong> ${exchange.customerGovtId || 'Verified'}</div>
              <div><strong>Inspector Staff:</strong> ${exchange.inspectorStaff}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Trade-In Device Details</div>
            <div class="grid">
              <div><strong>Brand & Model:</strong> ${exchange.deviceBrand} ${exchange.deviceModel}</div>
              <div><strong>Storage & Variant:</strong> ${exchange.storageColor}</div>
              <div><strong>IMEI / Serial Number:</strong> <span style="font-family: monospace; font-weight: bold;">${exchange.imeiNumber}</span></div>
              <div><strong>Quality Grade:</strong> <span class="badge">${exchange.grade}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Valuation & Settlement Summary</div>
            <div class="grid">
              <div><strong>Market Benchmark Value:</strong> ${settings.currencySymbol}${exchange.calculatedValue.toLocaleString()}</div>
              <div><strong>Final Agreed Valuation:</strong> <span class="price">${settings.currencySymbol}${exchange.agreedValue.toLocaleString()}</span></div>
              <div><strong>Settlement Action:</strong> ${exchange.actionTaken}</div>
              <div><strong>Voucher Code Issued:</strong> ${exchange.voucherCode || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Inspection Summary & Notes</div>
            <div style="font-size: 12px;">
              Screen: ${exchange.condition.screenCondition} | Body: ${exchange.condition.bodyCondition} | Battery Health: ${exchange.condition.batteryHealth}%<br/>
              Box: ${exchange.condition.boxAvailable ? 'Yes' : 'No'} | Bill: ${exchange.condition.billAvailable ? 'Yes' : 'No'} | Charger: ${exchange.condition.originalChargerAvailable ? 'Yes' : 'No'}<br/>
              <em>Notes: ${exchange.notes || 'No defects noted.'}</em>
            </div>
          </div>

          <div style="font-size: 10px; color: #64748b; margin-top: 20px;">
            <strong>Declaration:</strong> The customer confirms they are the legal owner of the registered device and transfer legal ownership to ${settings.shopName}. No legal liability rests on the shop for previous data stored.
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 50px;">
            <div class="signature-box">Customer Signature</div>
            <div class="signature-box">Store Manager Signature</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-black text-white tracking-tight">
                Customer Mobile Buyback & Trade-In Directory
              </h1>
            </div>
            <p className="text-xs text-slate-400 pl-1">
              Manage all customer devices planned to sell, exchange records, refurbish inventory pipeline & voucher certificates.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('valuation')}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-cyan-900/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Valuation & Buyback</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Buybacks */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Buybacks</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{exchanges.length} Deals</div>
            <div className="text-xs font-extrabold text-indigo-400 mt-0.5">
              {settings.currencySymbol}{totalValuationSum.toLocaleString()} Total Value
            </div>
          </div>
        </div>

        {/* Completed & Vouchers */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Deals</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalCompletedCount} Verified</div>
            <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
              Store Credits & Sales Settled
            </div>
          </div>
        </div>

        {/* In Refurbish Stock Pipeline */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refurbish Pipeline</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{inRefurbishCount} Mobiles</div>
            <div className="text-xs font-extrabold text-amber-400 mt-0.5">
              Stock Inward for Resale
            </div>
          </div>
        </div>

        {/* Average Buyback Payout */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Buyback Payout</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{settings.currencySymbol}{avgValuation.toLocaleString()}</div>
            <div className="text-xs font-extrabold text-cyan-400 mt-0.5">
              Average Valuation Per Mobile
            </div>
          </div>
        </div>
      </div>

      {/* Main Listing Section with Search & Pagination */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Filters and Controls Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone, device model, IMEI, or voucher code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 text-xs placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px] font-semibold">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
                <option value="In Refurbish" className="bg-slate-900">In Refurbish</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="Cancelled" className="bg-slate-900">Cancelled</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px] font-semibold">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Brands</option>
                <option value="Apple" className="bg-slate-900">Apple</option>
                <option value="Samsung" className="bg-slate-900">Samsung</option>
                <option value="OnePlus" className="bg-slate-900">OnePlus</option>
                <option value="Xiaomi" className="bg-slate-900">Xiaomi</option>
                <option value="Google Pixel" className="bg-slate-900">Google Pixel</option>
                <option value="Vivo" className="bg-slate-900">Vivo</option>
                <option value="Oppo" className="bg-slate-900">Oppo</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] font-semibold">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value={5} className="bg-slate-900">5 per page</option>
                <option value={10} className="bg-slate-900">10 per page</option>
                <option value={20} className="bg-slate-900">20 per page</option>
                <option value={50} className="bg-slate-900">50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Trade-In Mobile Listing Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Code & Timestamp</th>
                <th className="p-3.5">Customer & ID</th>
                <th className="p-3.5">Device & Grade</th>
                <th className="p-3.5">IMEI Number</th>
                <th className="p-3.5 text-right">Agreed Valuation</th>
                <th className="p-3.5">Action / Voucher</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold">No customer trade-in records match your filters.</p>
                    <p className="text-xs text-slate-600">Try clearing your search query or changing status filters.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-900/60 transition group">
                    {/* Code & Timestamp */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-100">{ex.exchangeCode}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{ex.timestamp}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{ex.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{ex.customerPhone}</span>
                      </div>
                    </td>

                    {/* Device & Grade */}
                    <td className="p-3.5">
                      <div className="font-extrabold text-white">{ex.deviceBrand} {ex.deviceModel}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {ex.storageColor}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          ex.grade.includes('Grade A')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : ex.grade.includes('Grade B')
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {ex.grade}
                        </span>
                      </div>
                    </td>

                    {/* IMEI */}
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                        {ex.imeiNumber}
                      </span>
                    </td>

                    {/* Agreed Valuation */}
                    <td className="p-3.5 text-right font-black text-emerald-400 text-sm">
                      {settings.currencySymbol}{ex.agreedValue.toLocaleString()}
                    </td>

                    {/* Action Taken & Voucher */}
                    <td className="p-3.5">
                      <div className="text-xs font-semibold text-slate-300">{ex.actionTaken}</div>
                      {ex.voucherCode && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                            {ex.voucherCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyVoucher(ex.voucherCode!)}
                            className="text-slate-500 hover:text-purple-300 transition"
                            title="Copy Voucher Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedVoucher === ex.voucherCode && (
                            <span className="text-[9px] text-emerald-400 font-bold">Copied!</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Toggle Dropdown */}
                    <td className="p-3.5 text-center">
                      <select
                        value={ex.status}
                        onChange={(e) => updateExchangeStatus(ex.id, e.target.value as any)}
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer transition ${
                          ex.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : ex.status === 'In Refurbish'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : ex.status === 'Pending'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Completed" className="bg-slate-900 text-emerald-400">Completed</option>
                        <option value="In Refurbish" className="bg-slate-900 text-amber-400">In Refurbish</option>
                        <option value="Pending" className="bg-slate-900 text-blue-400">Pending</option>
                        <option value="Cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                      </select>
                    </td>

                    {/* View Certificate Modal Button */}
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedExchange(ex)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-800 transition text-xs font-bold flex items-center gap-1.5 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Proper Pagination Controls Footer */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800">
            {/* Range Text */}
            <div>
              Showing <strong className="text-slate-200">{startIndex + 1}</strong> to{' '}
              <strong className="text-slate-200">{endIndex}</strong> of{' '}
              <strong className="text-slate-200">{totalItems}</strong> customer trade-in records
            </div>

            {/* Pagination Button Group */}
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-300"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-bold transition flex items-center justify-center ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-300"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-300"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Trade-In Detail & Certificate Modal */}
      {selectedExchange && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Customer Buyback Certificate</h3>
                  <p className="text-xs text-slate-400">Trade-In Code: <span className="font-mono text-indigo-300 font-bold">{selectedExchange.exchangeCode}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExchange(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs">
              {/* Customer Info Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer & Inspector Info</div>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div>Customer Name: <strong className="text-white">{selectedExchange.customerName}</strong></div>
                  <div>Phone: <strong className="text-white">{selectedExchange.customerPhone}</strong></div>
                  <div>Govt ID Proof: <strong className="text-white">{selectedExchange.customerGovtId || 'N/A'}</strong></div>
                  <div>Inspector Staff: <strong className="text-white">{selectedExchange.inspectorStaff}</strong></div>
                </div>
              </div>

              {/* Device & Valuation Summary Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Device & Valuation Details</div>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <div>Brand & Model: <strong className="text-white">{selectedExchange.deviceBrand} {selectedExchange.deviceModel}</strong></div>
                  <div>Variant/Color: <strong className="text-white">{selectedExchange.storageColor}</strong></div>
                  <div>IMEI Number: <strong className="font-mono text-cyan-300">{selectedExchange.imeiNumber}</strong></div>
                  <div>Quality Grade: <strong className="text-emerald-400">{selectedExchange.grade}</strong></div>
                  <div>Market Benchmark: <strong className="text-slate-300">{settings.currencySymbol}{selectedExchange.calculatedValue.toLocaleString()}</strong></div>
                  <div>Agreed Buyback Price: <strong className="text-emerald-400 font-black text-sm">{settings.currencySymbol}{selectedExchange.agreedValue.toLocaleString()}</strong></div>
                </div>
              </div>

              {/* Condition Checklist */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Physical Condition Inspection</div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Screen Condition: <strong>{selectedExchange.condition.screenCondition}</strong></div>
                  <div>Body Condition: <strong>{selectedExchange.condition.bodyCondition}</strong></div>
                  <div>Battery Health: <strong>{selectedExchange.condition.batteryHealth}%</strong></div>
                  <div>Box / Bill: <strong>{selectedExchange.condition.boxAvailable ? 'Box ✅' : 'No Box'} | {selectedExchange.condition.billAvailable ? 'Bill ✅' : 'No Bill'}</strong></div>
                </div>
              </div>

              {/* Notes */}
              {selectedExchange.notes && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-slate-300">
                  <span className="font-bold text-slate-400">Notes: </span>
                  <span>{selectedExchange.notes}</span>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedExchange(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handlePrintCertificate(selectedExchange)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-900/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Buyback Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
