import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, CartItem, PaymentMethod, Category, ProductVariant, SaleRecord, SaleTransaction } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { PdfInvoiceModal } from '../common/PdfInvoiceModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Smartphone,
  Tag,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  FileText,
  Sparkles,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  PackageCheck,
  Layers,
  Filter,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Grid,
  Download,
  Printer,
  Camera,
  Scan,
  Zap,
  Volume2
} from 'lucide-react';

export const SellModule: React.FC = () => {
  const {
    products,
    createSale,
    sales,
    settings,
    activeReceipt,
    setActiveReceipt,
    customers,
    exchanges
  } = useApp();

  // Navigation Tab inside Sell Module
  const [activeSellTab, setActiveSellTab] = useState<'counter' | 'sold_items' | 'invoices'>('counter');

  // Category & Product Filters in POS
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Barcode & IMEI Scanning state
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState<boolean>(false);
  const [quickScanInput, setQuickScanInput] = useState<string>('');
  const [scanToast, setScanToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [usbScannerActive, setUsbScannerActive] = useState<boolean>(true);

  // Sold Items Datatable filters
  const [soldSearchTerm, setSoldSearchTerm] = useState<string>('');
  const [soldCategoryFilter, setSoldCategoryFilter] = useState<string>('All');
  const [soldPaymentFilter, setSoldPaymentFilter] = useState<string>('All');

  // Customer & Payment state
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [tradeInCredit, setTradeInCredit] = useState<number>(0);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string>('');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // IMEI selection modal state
  const [selectedProductForImei, setSelectedProductForImei] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [chosenImei, setChosenImei] = useState<string>('');

  // PDF Invoice Modal state
  const [selectedSaleForPdf, setSelectedSaleForPdf] = useState<SaleTransaction | null>(null);

  // Filter products for POS
  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.imeiList && p.imeiList.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Extract all individual sold product items across all sales
  const allSoldItemsList = sales.flatMap(s =>
    (s.items || []).map((item: any, idx) => {
      const prodInCatalog = products.find(p => p.id === (item.productId || item.product?.id));
      const productName = item.productName || item.product?.name || prodInCatalog?.name || 'Unknown Item';
      const brand = item.brand || item.product?.brand || prodInCatalog?.brand || 'Generic';
      const category = item.category || item.product?.category || prodInCatalog?.category || 'General';
      const unitCostPrice = item.costPrice ?? item.product?.costPrice ?? prodInCatalog?.costPrice ?? 0;
      const imei = item.imei || item.selectedImei || item.product?.imeiList?.[0] || prodInCatalog?.imeiList?.[0] || null;

      const netItemTotal = (item.unitPrice * item.quantity) - (item.discount || 0);
      const totalCost = unitCostPrice * item.quantity;
      const profit = netItemTotal - totalCost;

      return {
        uniqueKey: `${s.id}-${idx}`,
        saleRecord: s,
        invoiceNumber: s.invoiceNumber,
        date: s.date || (s.timestamp ? s.timestamp.split(' ')[0] : ''),
        time: s.time || (s.timestamp ? s.timestamp.split(' ')[1] : ''),
        customerName: s.customerName || 'Walk-in Customer',
        customerPhone: s.customerPhone || 'N/A',
        paymentMethod: s.paymentMethod,
        productName,
        brand,
        category,
        imei,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        netTotal: netItemTotal,
        unitCostPrice,
        totalCost,
        profit
      };
    })
  );

  // Filtered Sold Items Datatable
  const filteredSoldItems = allSoldItemsList.filter(item => {
    const matchesCategory = soldCategoryFilter === 'All' || item.category === soldCategoryFilter;
    const matchesPayment = soldPaymentFilter === 'All' || item.paymentMethod === soldPaymentFilter;
    const q = soldSearchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.productName.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.invoiceNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.customerPhone.includes(q) ||
      (item.imei && item.imei.toLowerCase().includes(q));

    return matchesCategory && matchesPayment && matchesSearch;
  });

  // Calculate Dashboard KPIs
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalItemsSold = allSoldItemsList.reduce((sum, i) => sum + i.quantity, 0);
  const avgOrderValue = sales.length > 0 ? Math.round(totalSalesRevenue / sales.length) : 0;
  const totalUdharDebtCreated = sales.reduce((sum, s) => sum + (s.balanceAmount || 0), 0);
  const totalProfitGross = allSoldItemsList.reduce((sum, i) => sum + i.profit, 0);

  // Add to cart logic
  const handleAddToCartClick = (product: Product) => {
    if (product.stock <= 0) return;

    if (product.hasImeiTracking && product.imeiList && product.imeiList.length > 0) {
      setSelectedProductForImei(product);
      setSelectedVariant(product.variants?.[0]);
      setChosenImei(product.imeiList[0]);
    } else {
      addToCartDirect(product);
    }
  };

  const addToCartDirect = (product: Product, variant?: ProductVariant, imei?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item =>
        item.product.id === product.id &&
        item.selectedImei === imei &&
        item.selectedVariant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        const unitPrice = variant ? variant.price : product.posPrice;
        return [...prev, {
          product,
          quantity: 1,
          selectedVariant: variant,
          selectedImei: imei,
          unitPrice,
          discount: 0
        }];
      }
    });
  };

  const confirmImeiSelection = () => {
    if (selectedProductForImei) {
      addToCartDirect(selectedProductForImei, selectedVariant, chosenImei);
      setSelectedProductForImei(null);
      setChosenImei('');
    }
  };

  // Scanner Audio Beep Synthesizer
  const playScanBeep = (isSuccess = true) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isSuccess ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(isSuccess ? 1200 : 300, ctx.currentTime);
      if (isSuccess) {
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
      }

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isSuccess ? 0.12 : 0.2));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isSuccess ? 0.12 : 0.2));
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  // Barcode / IMEI Lookup Handler
  const handleBarCodeLookup = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const normalized = cleanCode.toLowerCase();

    let matchedProduct: Product | undefined;
    let matchedVariant: ProductVariant | undefined;
    let matchedImei: string | undefined;

    for (const p of products) {
      // 1. Check IMEI list
      if (p.imeiList && p.imeiList.length > 0) {
        const foundImei = p.imeiList.find(i => i.toLowerCase().trim() === normalized);
        if (foundImei) {
          matchedProduct = p;
          matchedImei = foundImei;
          break;
        }
      }

      // 2. Check barcode
      if ((p as any).barcode && (p as any).barcode.toLowerCase().trim() === normalized) {
        matchedProduct = p;
        break;
      }

      // 3. Check SKU
      if ((p as any).sku && (p as any).sku.toLowerCase().trim() === normalized) {
        matchedProduct = p;
        break;
      }

      // 4. Check Product ID
      if (p.id.toLowerCase().trim() === normalized) {
        matchedProduct = p;
        break;
      }

      // 5. Check Product Variants SKU
      if (p.variants && p.variants.length > 0) {
        const v = p.variants.find(v => v.sku.toLowerCase().trim() === normalized);
        if (v) {
          matchedProduct = p;
          matchedVariant = v;
          break;
        }
      }

      // 6. Exact name match
      if (p.name.toLowerCase().trim() === normalized) {
        matchedProduct = p;
        break;
      }
    }

    if (matchedProduct) {
      if (matchedProduct.stock <= 0) {
        playScanBeep(false);
        setScanToast({ message: `"${matchedProduct.name}" is currently Out of Stock!`, type: 'error' });
      } else {
        addToCartDirect(matchedProduct, matchedVariant, matchedImei);
        playScanBeep(true);
        const imeiText = matchedImei ? ` (IMEI: ${matchedImei})` : '';
        setScanToast({ message: `✓ Scanned: Added "${matchedProduct.name}"${imeiText} to cart!`, type: 'success' });
      }
    } else {
      playScanBeep(false);
      setScanToast({ message: `❌ No item found matching barcode/IMEI: "${cleanCode}"`, type: 'error' });
    }

    setTimeout(() => {
      setScanToast(null);
    }, 4000);
  };

  // Hardware USB Barcode Scanner Listener
  useEffect(() => {
    if (activeSellTab !== 'counter' || !usbScannerActive) return;

    let keyBuffer = '';
    let lastTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement;
      if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA' || targetEl.tagName === 'SELECT')) {
        if (targetEl.id !== 'pos-quick-barcode-input') {
          return;
        }
      }

      const now = Date.now();
      const diff = now - lastTime;
      lastTime = now;

      // Reset buffer if delay > 120ms (manual typing vs hardware scanner pulse)
      if (diff > 120) {
        keyBuffer = '';
      }

      if (e.key === 'Enter') {
        if (keyBuffer.trim().length >= 3) {
          e.preventDefault();
          handleBarCodeLookup(keyBuffer);
          keyBuffer = '';
        }
      } else if (e.key.length === 1) {
        keyBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeSellTab, usbScannerActive, products]);

  const updateCartQty = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const updateCartDiscount = (index: number, discount: number) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index].discount = Math.max(0, discount);
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalItemDiscount = cart.reduce((sum, item) => sum + item.discount, 0);

  const taxAmount = settings.taxInclusive
    ? Math.round((subtotal * settings.taxRatePercent) / (100 + settings.taxRatePercent))
    : Math.round((subtotal * settings.taxRatePercent) / 100);

  const netBeforeCredit = settings.taxInclusive ? subtotal - totalItemDiscount : subtotal + taxAmount - totalItemDiscount;
  const finalTotalAmount = Math.max(0, netBeforeCredit - tradeInCredit);

  // Apply Trade-In Voucher code logic
  const handleApplyVoucher = () => {
    const match = exchanges.find(e => e.voucherCode?.toUpperCase() === appliedVoucherCode.trim().toUpperCase());
    if (match) {
      setTradeInCredit(match.agreedValue);
      setCustomerName(match.customerName);
      setCustomerPhone(match.customerPhone);
    } else {
      alert('Voucher code not found or already redeemed!');
    }
  };

  // Checkout Handler
  const handleCheckout = () => {
    if (cart.length === 0) return;

    const paidVal = paidAmountInput !== '' ? parseFloat(paidAmountInput) : finalTotalAmount;

    const saleRecord = createSale({
      customerName,
      customerPhone,
      items: cart,
      paymentMethod,
      paidAmount: paidVal,
      tradeInCreditApplied: tradeInCredit,
      notes
    });

    // Reset Cart & inputs
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setTradeInCredit(0);
    setAppliedVoucherCode('');
    setPaidAmountInput('');
    setNotes('');

    // Open receipt modal automatically
    setActiveReceipt(saleRecord);
  };

  return (
    <div id="sell-module-container" className="space-y-6">
      
      {/* Sales Top Dashboard Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white">Retail Counter & Sales Dashboard</h2>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Live Billing Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instant billing, IMEI barcode serial tracking, sold products datatables, and printable customer GST receipts.
          </p>
        </div>

        {/* View Switching Navigation Tabs */}
        <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto">
          <button
            onClick={() => setActiveSellTab('counter')}
            id="tab-btn-counter"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSellTab === 'counter'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>POS Billing Counter</span>
          </button>

          <button
            onClick={() => setActiveSellTab('sold_items')}
            id="tab-btn-sold-items"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSellTab === 'sold_items'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sold Products Datatable</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {allSoldItemsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSellTab('invoices')}
            id="tab-btn-invoices"
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSellTab === 'invoices'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoice History ({sales.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Sales Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Sales Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {settings.currencySymbol}{totalSalesRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Gross total billing revenue</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Sold Units</span>
            <PackageCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {totalItemsSold} Units
          </div>
          <p className="text-[10px] text-slate-500">Total phones & accessories sold</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">
            {settings.currencySymbol}{avgOrderValue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Average billing size per receipt</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Estimated Profit</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {settings.currencySymbol}{totalProfitGross.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Cost vs Sales gross margin</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Customer Udhar Owed</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">
            {settings.currencySymbol}{totalUdharDebtCreated.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Credit extended to customers</p>
        </div>
      </div>

      {/* TAB 1: POS BILLING COUNTER */}
      {activeSellTab === 'counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Product Selection Catalog */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            
            {/* Scan Toast Alert Banner */}
            {scanToast && (
              <div className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between shadow-lg transition-all animate-in fade-in duration-200 ${
                scanToast.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center gap-2">
                  {scanToast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{scanToast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScanToast(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Barcode & IMEI Scanner Toolbar */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                
                {/* Quick USB Scan Input Field */}
                <div className="relative flex-1 w-full">
                  <Scan className="w-4 h-4 text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="pos-quick-barcode-input"
                    type="text"
                    placeholder="Scan barcode with USB reader or type IMEI + Enter..."
                    value={quickScanInput}
                    onChange={(e) => setQuickScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBarCodeLookup(quickScanInput);
                        setQuickScanInput('');
                      }
                    }}
                    className="w-full bg-slate-950 text-xs font-mono text-indigo-200 pl-9 pr-20 py-2.5 rounded-xl border border-indigo-500/30 focus:outline-none focus:border-indigo-400 placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleBarCodeLookup(quickScanInput);
                      setQuickScanInput('');
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition cursor-pointer shadow-sm"
                  >
                    Scan Add
                  </button>
                </div>

                {/* Camera Barcode Scanner Trigger Button */}
                <button
                  type="button"
                  id="btn-open-camera-scanner"
                  onClick={() => setIsBarcodeScannerOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Camera Scan</span>
                </button>

                {/* Hardware USB Scanner Mode Switch */}
                <button
                  type="button"
                  onClick={() => setUsbScannerActive(!usbScannerActive)}
                  className={`w-full sm:w-auto px-3 py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 ${
                    usbScannerActive
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title={usbScannerActive ? 'USB Hardware Scanner Listening' : 'USB Hardware Scanner Muted'}
                >
                  <Zap className={`w-3.5 h-3.5 ${usbScannerActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                  <span>{usbScannerActive ? 'USB Scanner ON' : 'USB Scanner OFF'}</span>
                </button>

              </div>

              {/* Category Tabs & Product Search Bar */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {['All', 'Smartphones', 'Accessories', 'Spare Parts'].map(cat => (
                    <button
                      key={cat}
                      id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setCategoryFilter(cat)}
                      className={`text-xs font-bold px-4 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="pos-product-search"
                    type="text"
                    placeholder="Search catalog by model name, brand, or accessory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-slate-100 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    className={`bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition group relative overflow-hidden ${
                      isOutOfStock ? 'opacity-60' : ''
                    }`}
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative w-full h-32 rounded-xl bg-slate-800 overflow-hidden mb-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/90 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur border border-slate-700">
                          {product.brand}
                        </span>
                        {product.hasImeiTracking && (
                          <span className="absolute top-2 right-2 bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur flex items-center gap-1">
                            <Smartphone className="w-3 h-3" /> IMEI
                          </span>
                        )}
                      </div>

                      {/* Title & Category */}
                      <h3 className="font-semibold text-slate-100 text-sm line-clamp-1 group-hover:text-indigo-300 transition">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mb-2 truncate">
                        {product.category}
                      </p>
                    </div>

                    {/* Stock & Price */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 font-mono">
                          {settings.currencySymbol}{product.posPrice.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isOutOfStock ? (
                            <span className="text-rose-400 font-semibold">Out of Stock</span>
                          ) : (
                            <span>Stock: <strong>{product.stock}</strong> units</span>
                          )}
                        </div>
                      </div>

                      <button
                        id={`add-to-cart-btn-${product.id}`}
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCartClick(product)}
                        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 active:scale-95'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Billing Cart & Checkout Panel */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 sticky top-20 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-400" />
                  <span>Sales Cart</span>
                </h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Items
                </span>
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-400">Your sales cart is empty.</p>
                  <p className="text-[11px] text-slate-500">Select products or scan IMEI to begin billing.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-200">{item.product.name}</div>
                          {item.selectedImei && (
                            <div className="text-[10px] text-indigo-300 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50 mt-0.5 inline-block">
                              IMEI: {item.selectedImei}
                            </div>
                          )}
                          {item.selectedVariant && (
                            <div className="text-[10px] text-slate-400">
                              {item.selectedVariant.color} • {item.selectedVariant.ramStorage}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-slate-400 hover:text-rose-400 p-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        {/* Qty Controls */}
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1">
                          <button onClick={() => updateCartQty(idx, -1)} className="text-slate-400 hover:text-white cursor-pointer">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-200">{item.quantity}</span>
                          <button onClick={() => updateCartQty(idx, 1)} className="text-slate-400 hover:text-white cursor-pointer">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price & Discount Input */}
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 font-mono">
                            {settings.currencySymbol}{((item.unitPrice * item.quantity) - item.discount).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-slate-400">Disc:</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={item.discount || ''}
                              onChange={(e) => updateCartDiscount(idx, parseFloat(e.target.value) || 0)}
                              className="w-14 bg-slate-900 text-[10px] text-right text-slate-200 px-1 py-0.5 rounded border border-slate-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Details Form */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 flex items-center justify-between">
                  <span>Customer Info</span>
                  <span className="text-[10px] text-indigo-400 font-normal">Optional / Udhar Ledger</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-slate-950 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-slate-950 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Trade-In Voucher Code Entry */}
                <div className="pt-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Apply Exchange / Trade-In Credit</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Voucher Code or Custom Amt"
                      value={appliedVoucherCode}
                      onChange={(e) => setAppliedVoucherCode(e.target.value)}
                      className="flex-1 bg-slate-950 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800 uppercase"
                    />
                    <button
                      onClick={handleApplyVoucher}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold px-3 py-1 rounded-lg transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <label className="font-semibold text-slate-300 block">Payment Mode</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Cash', 'Card', 'UPI / QR', 'Store Credit / Udhar'] as PaymentMethod[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`p-2 rounded-xl border text-center font-medium transition cursor-pointer ${
                        paymentMethod === mode
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Paid Amount vs Balance Input */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Amount Paid Now:</span>
                  <input
                    type="number"
                    placeholder={`${finalTotalAmount}`}
                    value={paidAmountInput}
                    onChange={(e) => setPaidAmountInput(e.target.value)}
                    className="w-28 bg-slate-950 text-right text-emerald-400 font-bold px-2 py-1 rounded-lg border border-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Total Summary Breakdown */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">{settings.currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                {totalItemDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono">- {settings.currencySymbol}{totalItemDiscount.toLocaleString()}</span>
                  </div>
                )}
                {tradeInCredit > 0 && (
                  <div className="flex justify-between text-cyan-400">
                    <span>Exchange Credit:</span>
                    <span className="font-mono">- {settings.currencySymbol}{tradeInCredit.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({settings.taxRatePercent}%):</span>
                  <span className="font-mono">{settings.currencySymbol}{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                  <span>Net Payable:</span>
                  <span className="text-indigo-300 font-mono">{settings.currencySymbol}{finalTotalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                id="checkout-sale-btn"
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-95 ${
                  cart.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-600/20'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Sale & Print Receipt</span>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SOLD PRODUCTS DATATABLE LISTING */}
      {activeSellTab === 'sold_items' && (
        <div id="sold-products-datatable-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Sold Products Register & Data Table ({filteredSoldItems.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed item-by-item listing of all sold smartphones, accessories, serial IMEIs, cost prices, and profit margins.
              </p>
            </div>

            {/* Sold Products Search & Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sold item, IMEI, invoice #, customer..."
                  value={soldSearchTerm}
                  onChange={e => setSoldSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={soldCategoryFilter}
                onChange={e => setSoldCategoryFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Smartphones">Smartphones</option>
                <option value="Accessories">Accessories</option>
                <option value="Spare Parts">Spare Parts</option>
              </select>

              <select
                value={soldPaymentFilter}
                onChange={e => setSoldPaymentFilter(e.target.value)}
                className="bg-slate-950 text-slate-300 border border-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Payments</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Store Credit / Udhar">Store Credit / Udhar</option>
              </select>
            </div>
          </div>

          {/* Sold Products Table */}
          {filteredSoldItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-sm font-semibold text-slate-400">No sold items match your filters</p>
              <p className="text-xs text-slate-500">Try adjusting your search keyword or category filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Product Name & Category</th>
                    <th className="p-3">IMEI Serial #</th>
                    <th className="p-3">Invoice # & Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3 text-right">Sold Price</th>
                    <th className="p-3 text-right">Cost Price</th>
                    <th className="p-3 text-right">Gross Profit</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSoldItems.map(item => (
                    <tr key={item.uniqueKey} className="hover:bg-slate-800/50 transition-colors">
                      {/* Product Name */}
                      <td className="p-3">
                        <div className="font-bold text-slate-100 text-xs">{item.productName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className="bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 font-semibold">{item.brand}</span>
                          <span>• {item.category}</span>
                          {item.quantity > 1 && (
                            <span className="text-indigo-400 font-bold">({item.quantity}x)</span>
                          )}
                        </div>
                      </td>

                      {/* IMEI */}
                      <td className="p-3 font-mono">
                        {item.imei ? (
                          <span className="text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 px-2 py-0.5 rounded text-[11px]">
                            {item.imei}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Non-IMEI Item</span>
                        )}
                      </td>

                      {/* Invoice & Date */}
                      <td className="p-3 font-mono">
                        <div className="font-bold text-slate-200">{item.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.date} {item.time}</div>
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{item.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.customerPhone}</div>
                      </td>

                      {/* Sold Price */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-400 text-xs">
                        {settings.currencySymbol}{item.netTotal.toLocaleString()}
                      </td>

                      {/* Unit Cost Price */}
                      <td className="p-3 text-right font-mono text-slate-400 text-xs">
                        {settings.currencySymbol}{item.totalCost.toLocaleString()}
                      </td>

                      {/* Profit */}
                      <td className="p-3 text-right font-mono text-xs">
                        <span className={`font-bold ${item.profit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {settings.currencySymbol}{item.profit.toLocaleString()}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="p-3">
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300">
                          {item.paymentMethod}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedSaleForPdf(item.saleRecord)}
                            className="text-[11px] font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded-lg border border-emerald-500/30 transition cursor-pointer flex items-center gap-1"
                            title="Generate PDF Invoice"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                          <button
                            onClick={() => setActiveReceipt(item.saleRecord)}
                            className="text-[11px] font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded-lg border border-indigo-500/30 transition cursor-pointer"
                          >
                            Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVOICE HISTORY REGISTER */}
      {activeSellTab === 'invoices' && (
        <div id="invoice-history-register-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Today's Sales Register ({sales.length} Invoices)</span>
              </h3>
              <p className="text-xs text-slate-400">All recorded transactions with PDF invoice generation & printable receipt backup.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
              Total Today: {settings.currencySymbol}{sales.reduce((acc, s) => acc + s.totalAmount, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items Sold</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3 text-right">Total Invoice</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-bold text-indigo-300">{s.invoiceNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{s.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.customerPhone}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-300 font-medium">
                        {s.items.map(i => i.productName).join(', ')}
                      </div>
                      {s.items.some(i => i.selectedImei) && (
                        <div className="text-[10px] text-indigo-400 font-mono">
                          IMEI: {s.items.map(i => i.selectedImei).filter(Boolean).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400 font-mono text-sm">
                      {settings.currencySymbol}{s.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSaleForPdf(s)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg shadow-sm transition cursor-pointer font-bold flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button
                          onClick={() => setActiveReceipt(s)}
                          className="text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded-lg border border-indigo-500/30 transition cursor-pointer font-bold"
                        >
                          Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMEI Selection Modal */}
      {selectedProductForImei && (
        <div id="imei-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <span>Select IMEI Serial Number</span>
              </h3>
              <button onClick={() => setSelectedProductForImei(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Billing <strong>{selectedProductForImei.name}</strong>. Select available IMEI or scan serial number barcode:
            </p>

            {/* Available IMEIs dropdown */}
            {selectedProductForImei.imeiList && selectedProductForImei.imeiList.length > 0 ? (
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Available In-Stock IMEIs ({selectedProductForImei.imeiList.length})</label>
                <select
                  value={chosenImei}
                  onChange={(e) => setChosenImei(e.target.value)}
                  className="w-full bg-slate-950 text-sm font-mono text-indigo-300 px-3 py-2 rounded-xl border border-slate-800"
                >
                  {selectedProductForImei.imeiList.map(im => (
                    <option key={im} value={im}>
                      IMEI: {im}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Enter Custom IMEI Number</label>
                <input
                  type="text"
                  placeholder="352019482..."
                  value={chosenImei}
                  onChange={(e) => setChosenImei(e.target.value)}
                  className="w-full bg-slate-950 text-sm font-mono text-indigo-300 px-3 py-2 rounded-xl border border-slate-800"
                />
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProductForImei(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmImeiSelection}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-md cursor-pointer"
              >
                Confirm IMEI & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Receipt Modal Trigger */}
      {activeReceipt && (
        <ReceiptModal
          sale={activeReceipt}
          settings={settings}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* PDF Invoice Modal Trigger */}
      {selectedSaleForPdf && (
        <PdfInvoiceModal
          type="sale"
          data={selectedSaleForPdf}
          settings={settings}
          onClose={() => setSelectedSaleForPdf(null)}
        />
      )}

      {/* Camera Barcode & IMEI Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products}
        onProductScanned={(scannedProduct, matchedVariant, matchedImei) => {
          if (scannedProduct.hasImeiTracking && scannedProduct.imeiList && scannedProduct.imeiList.length > 0 && !matchedImei) {
            setSelectedProductForImei(scannedProduct);
            setSelectedVariant(matchedVariant || scannedProduct.variants?.[0]);
            setChosenImei(scannedProduct.imeiList[0]);
          } else {
            addToCartDirect(scannedProduct, matchedVariant, matchedImei);
            playScanBeep(true);
            const imeiText = matchedImei ? ` (IMEI: ${matchedImei})` : '';
            setScanToast({ message: `✓ Camera Scan: Added "${scannedProduct.name}"${imeiText} to cart!`, type: 'success' });
            setTimeout(() => setScanToast(null), 3500);
          }
        }}
      />

    </div>
  );
};
