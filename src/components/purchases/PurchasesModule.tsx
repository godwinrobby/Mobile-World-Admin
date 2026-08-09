import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder, PurchaseOrderItem, CustomerCreditAccount, SupplierDebitAccount } from '../../types';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Trash2,
  Printer,
  X,
  UserPlus,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  PackageCheck,
  DollarSign,
  Layers,
  ChevronDown,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const PurchasesModule: React.FC = () => {
  const {
    purchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    deletePurchaseOrder,
    suppliers,
    customers,
    addSupplier,
    addCustomer,
    products,
    settings,
    currentUser
  } = useApp();

  // Filters & State
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [activePartyFilter, setActivePartyFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Drawers
  const [isPoDrawerOpen, setIsPoDrawerOpen] = useState<boolean>(false);
  const [selectedPoForReceipt, setSelectedPoForReceipt] = useState<PurchaseOrder | null>(null);
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState<boolean>(false);
  const [addPartyType, setAddPartyType] = useState<'Customer' | 'Supplier'>('Supplier');

  // Party search state inside PO form
  const [partySearchQuery, setPartySearchQuery] = useState<string>('');
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState<boolean>(false);

  // Form State for New Purchase Order
  const [poForm, setPoForm] = useState({
    orderDate: new Date().toISOString().substring(0, 10),
    expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
    partyType: 'Supplier' as 'Supplier' | 'Customer' | 'Wholesaler',
    partyId: '',
    partyName: '',
    partyPhone: '',
    partyEmail: '',
    partyAddress: '',
    partyGstin: '',
    referenceInvoiceNo: '',
    notes: '',
    paidAmount: 0,
    orderStatus: 'Issued / Sent' as PurchaseOrder['orderStatus'],
    discountAmount: 0,
    taxAmount: 0
  });

  // Items list inside New PO
  const [poItems, setPoItems] = useState<Omit<PurchaseOrderItem, 'id'>[]>([
    {
      productName: '',
      category: 'Smartphones',
      brand: 'Apple',
      quantity: 1,
      unitCostPrice: 0,
      splPrice: 0,
      expectedSellingPrice: 0,
      totalCost: 0,
      imeiNumbers: []
    }
  ]);

  // Form state for inline Add Party modal
  const [newSupplierForm, setNewSupplierForm] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: 'Smartphones Wholesaler' as SupplierDebitAccount['category']
  });

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    creditLimit: 25000
  });

  // Filtered Purchase Orders
  const filteredOrders = purchaseOrders.filter(po => {
    const matchesStatus = activeStatusFilter === 'All' || po.orderStatus === activeStatusFilter;
    const matchesPartyType = activePartyFilter === 'All' || po.partyType === activePartyFilter;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      po.poNumber.toLowerCase().includes(query) ||
      po.partyName.toLowerCase().includes(query) ||
      po.partyPhone.includes(query) ||
      (po.referenceInvoiceNo && po.referenceInvoiceNo.toLowerCase().includes(query)) ||
      po.items.some(i => i.productName.toLowerCase().includes(query));

    return matchesStatus && matchesPartyType && matchesSearch;
  });

  // Calculate stats
  const totalSpend = purchaseOrders
    .filter(p => p.orderStatus !== 'Cancelled')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const totalKhataDebt = purchaseOrders
    .filter(p => p.orderStatus !== 'Cancelled')
    .reduce((sum, p) => sum + p.balanceAmount, 0);

  const pendingDeliveries = purchaseOrders.filter(p => p.orderStatus === 'Issued / Sent').length;

  // Search existing customers and suppliers based on mobile or name
  const filteredExistingParties = () => {
    const q = partySearchQuery.toLowerCase().trim();
    if (!q) return [];

    const matchedSuppliers = suppliers
      .filter(s => s.companyName.toLowerCase().includes(q) || s.phone.includes(q) || s.contactPerson.toLowerCase().includes(q))
      .map(s => ({
        type: 'Supplier' as const,
        id: s.id,
        name: s.companyName,
        subName: `Contact: ${s.contactPerson}`,
        phone: s.phone,
        email: s.email || '',
        address: s.address || '',
        balance: s.currentPayable
      }));

    const matchedCustomers = customers
      .filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .map(c => ({
        type: 'Customer' as const,
        id: c.id,
        name: c.name,
        subName: `Cust Balance: ${settings.currencySymbol}${c.currentBalance.toLocaleString()}`,
        phone: c.phone,
        email: c.email || '',
        address: c.address || '',
        balance: c.currentBalance
      }));

    return [...matchedSuppliers, ...matchedCustomers];
  };

  // Select a party from auto-complete
  const handleSelectParty = (party: ReturnType<typeof filteredExistingParties>[0]) => {
    setPoForm(prev => ({
      ...prev,
      partyType: party.type === 'Supplier' ? 'Supplier' : 'Customer',
      partyId: party.id,
      partyName: party.name,
      partyPhone: party.phone,
      partyEmail: party.email,
      partyAddress: party.address
    }));
    setPartySearchQuery(`${party.name} (${party.phone})`);
    setIsPartyDropdownOpen(false);
  };

  // Handle adding new supplier inline
  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierForm.companyName || !newSupplierForm.phone) {
      alert('Please fill in Company Name and Phone Number');
      return;
    }

    const created = addSupplier({
      companyName: newSupplierForm.companyName,
      contactPerson: newSupplierForm.contactPerson || newSupplierForm.companyName,
      phone: newSupplierForm.phone,
      email: newSupplierForm.email,
      address: newSupplierForm.address,
      category: newSupplierForm.category
    });

    setPoForm(prev => ({
      ...prev,
      partyType: 'Supplier',
      partyId: created.id,
      partyName: created.companyName,
      partyPhone: created.phone,
      partyEmail: created.email || '',
      partyAddress: created.address || ''
    }));
    setPartySearchQuery(`${created.companyName} (${created.phone})`);
    setIsAddPartyModalOpen(false);
    setNewSupplierForm({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      category: 'Smartphones Wholesaler'
    });
  };

  // Handle adding new customer inline
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      alert('Please fill in Customer Name and Phone Number');
      return;
    }

    const created = addCustomer({
      name: newCustomerForm.name,
      phone: newCustomerForm.phone,
      email: newCustomerForm.email,
      address: newCustomerForm.address,
      creditLimit: Number(newCustomerForm.creditLimit),
      status: 'Active'
    });

    setPoForm(prev => ({
      ...prev,
      partyType: 'Customer',
      partyId: created.id,
      partyName: created.name,
      partyPhone: created.phone,
      partyEmail: created.email || '',
      partyAddress: created.address || ''
    }));
    setPartySearchQuery(`${created.name} (${created.phone})`);
    setIsAddPartyModalOpen(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      creditLimit: 25000
    });
  };

  // Items table handlers inside PO form
  const handleItemChange = (index: number, field: keyof Omit<PurchaseOrderItem, 'id'>, value: any) => {
    setPoItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitCostPrice') {
        const qty = Number(field === 'quantity' ? value : item.quantity) || 0;
        const cost = Number(field === 'unitCostPrice' ? value : item.unitCostPrice) || 0;
        item.totalCost = qty * cost;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleSelectExistingProductForItem = (index: number, productId: string) => {
    const selected = products.find(p => p.id === productId);
    if (!selected) return;

    setPoItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: selected.id,
        productName: selected.name,
        brand: selected.brand,
        category: selected.category,
        unitCostPrice: selected.costPrice,
        splPrice: selected.splPrice || 0,
        expectedSellingPrice: selected.posPrice,
        totalCost: updated[index].quantity * selected.costPrice
      };
      return updated;
    });
  };

  const handleImeiInput = (index: number, rawText: string) => {
    const list = rawText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(Boolean);

    setPoItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        imeiNumbers: list
      };
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setPoItems(prev => [
      ...prev,
      {
        productName: '',
        category: 'Smartphones',
        brand: 'Apple',
        quantity: 1,
        unitCostPrice: 0,
        splPrice: 0,
        expectedSellingPrice: 0,
        totalCost: 0,
        imeiNumbers: []
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (poItems.length === 1) return;
    setPoItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate PO summary
  const subtotalCost = poItems.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  const netTotalCost = Math.max(0, subtotalCost + Number(poForm.taxAmount) - Number(poForm.discountAmount));
  const balanceDebtOwed = Math.max(0, netTotalCost - Number(poForm.paidAmount));

  // Submit PO
  const handleSubmitPo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!poForm.partyName || !poForm.partyPhone) {
      alert('Please select or add a Customer or Supplier party');
      return;
    }

    if (poItems.some(item => !item.productName || item.quantity <= 0 || item.unitCostPrice < 0)) {
      alert('Please provide a valid product name, quantity (>0), and unit cost price for all items.');
      return;
    }

    const formattedItems: PurchaseOrderItem[] = poItems.map((item, idx) => ({
      ...item,
      id: `poi-${Date.now()}-${idx}`
    }));

    let autoPaymentStatus: PurchaseOrder['paymentStatus'] = 'Paid in Full';
    if (balanceDebtOwed > 0 && Number(poForm.paidAmount) > 0) {
      autoPaymentStatus = 'Partially Paid';
    } else if (balanceDebtOwed > 0 && Number(poForm.paidAmount) === 0) {
      autoPaymentStatus = 'Khata Debt Owed';
    }

    createPurchaseOrder({
      orderDate: poForm.orderDate,
      expectedDeliveryDate: poForm.expectedDeliveryDate,
      partyType: poForm.partyType,
      partyId: poForm.partyId,
      partyName: poForm.partyName,
      partyPhone: poForm.partyPhone,
      partyEmail: poForm.partyEmail,
      partyAddress: poForm.partyAddress,
      partyGstin: poForm.partyGstin,
      referenceInvoiceNo: poForm.referenceInvoiceNo,
      notes: poForm.notes,
      items: formattedItems,
      subtotal: subtotalCost,
      taxAmount: Number(poForm.taxAmount),
      discountAmount: Number(poForm.discountAmount),
      totalAmount: netTotalCost,
      paidAmount: Number(poForm.paidAmount),
      balanceAmount: balanceDebtOwed,
      paymentStatus: autoPaymentStatus,
      orderStatus: poForm.orderStatus,
      createdBy: currentUser?.name || 'Store Staff'
    });

    alert('Purchase Order Created Successfully!');
    setIsPoDrawerOpen(false);

    // Reset Form
    setPoForm({
      orderDate: new Date().toISOString().substring(0, 10),
      expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().substring(0, 10),
      partyType: 'Supplier',
      partyId: '',
      partyName: '',
      partyPhone: '',
      partyEmail: '',
      partyAddress: '',
      partyGstin: '',
      referenceInvoiceNo: '',
      notes: '',
      paidAmount: 0,
      orderStatus: 'Issued / Sent',
      discountAmount: 0,
      taxAmount: 0
    });
    setPartySearchQuery('');
    setPoItems([
      {
        productName: '',
        category: 'Smartphones',
        brand: 'Apple',
        quantity: 1,
        unitCostPrice: 0,
        splPrice: 0,
        expectedSellingPrice: 0,
        totalCost: 0,
        imeiNumbers: []
      }
    ]);
  };

  return (
    <div id="purchases-module-container" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-extrabold text-white">Purchase Orders & Inward Management</h2>
            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {purchaseOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage bulk stock purchases from Wholesalers/Suppliers or Direct Customer Trade-in Buybacks with IMEI tracking & Khata accounting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPoDrawerOpen(true)}
            id="create-po-btn"
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Inward Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {settings.currencySymbol}{totalSpend.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Total stock purchase investment</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Outstanding Khata Debt</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">
            {settings.currencySymbol}{totalKhataDebt.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500">Payable balance owed to suppliers/customers</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Awaiting Inward Delivery</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {pendingDeliveries} Orders
          </div>
          <p className="text-[10px] text-slate-500">Issued POs awaiting warehouse stock receipt</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Inwarded & Verified</span>
            <PackageCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400">
            {purchaseOrders.filter(p => p.orderStatus === 'Received & Inwarded').length} Orders
          </div>
          <p className="text-[10px] text-slate-500">Stock & IMEIs auto-loaded into catalog</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by PO #, Supplier / Customer Name, Phone, Ref Invoice or Product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
              {['All', 'Issued / Sent', 'Received & Inwarded', 'Draft', 'Cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setActiveStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[11px] whitespace-nowrap ${
                    activeStatusFilter === status
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Party Type Filter */}
            <select
              value={activePartyFilter}
              onChange={e => setActivePartyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="All">All Party Types</option>
              <option value="Supplier">Wholesaler / Supplier</option>
              <option value="Customer">Customer Buyback</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Purchase Orders Register ({filteredOrders.length})</span>
          </h3>
          <span className="text-slate-400 text-xs font-medium">Sorted by latest order date</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">No Purchase Orders Found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No orders matched your active search or filter criteria. Try creating a new Purchase Order or clear filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">PO Ref # & Date</th>
                  <th className="p-3.5">Party (Supplier / Customer)</th>
                  <th className="p-3.5">Purchased Items</th>
                  <th className="p-3.5 text-right">Total PO Value</th>
                  <th className="p-3.5">Payment / Debt</th>
                  <th className="p-3.5">Inward Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map(po => {
                  const isSupplier = po.partyType === 'Supplier' || po.partyType === 'Wholesaler';

                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* PO Ref & Date */}
                      <td className="p-3.5 font-mono">
                        <div className="font-extrabold text-indigo-400 text-sm">{po.poNumber}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{po.orderDate}</span>
                          {po.referenceInvoiceNo && (
                            <span className="text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded text-[9px] border border-slate-700">
                              Ref: {po.referenceInvoiceNo}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Party Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 ${
                              isSupplier
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {isSupplier ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {po.partyType}
                          </span>
                          <span className="font-bold text-slate-100 text-xs">{po.partyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" /> {po.partyPhone}
                          </span>
                          {po.partyGstin && <span className="text-[10px] text-slate-500 font-mono">GST: {po.partyGstin}</span>}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          {po.items.map((item, i) => (
                            <div key={i} className="text-xs text-slate-200 font-medium flex items-center justify-between gap-2">
                              <span className="truncate">{item.quantity}x {item.productName}</span>
                              <span className="font-mono text-slate-400 text-[11px] shrink-0">
                                @ {settings.currencySymbol}{item.unitCostPrice.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="font-extrabold text-slate-100 text-sm">
                          {settings.currencySymbol}{po.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Tax: {settings.currencySymbol}{po.taxAmount.toLocaleString()}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              po.paymentStatus === 'Paid in Full'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : po.paymentStatus === 'Partially Paid'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {po.paymentStatus}
                          </span>
                          {po.balanceAmount > 0 && (
                            <div className="text-[11px] font-mono text-rose-400 font-bold">
                              Owed: {settings.currencySymbol}{po.balanceAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Inward Order Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                            po.orderStatus === 'Received & Inwarded'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : po.orderStatus === 'Issued / Sent'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : po.orderStatus === 'Draft'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {po.orderStatus === 'Received & Inwarded' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {po.orderStatus === 'Issued / Sent' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                          <span>{po.orderStatus}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {po.orderStatus === 'Issued / Sent' && (
                            <button
                              onClick={() => {
                                updatePurchaseOrderStatus(po.id, 'Received & Inwarded');
                                alert(`Purchase Order ${po.poNumber} marked as Received & Inwarded! Stock updated in catalog.`);
                              }}
                              title="Inward Stock into Catalog"
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Inward Stock</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedPoForReceipt(po)}
                            title="View / Print Purchase Order Voucher"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete Purchase Order ${po.poNumber}?`)) {
                                deletePurchaseOrder(po.id);
                              }
                            }}
                            title="Delete PO"
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
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
        )}
      </div>

      {/* NEW PURCHASE ORDER SIDE DRAWER */}
      {isPoDrawerOpen && (
        <div id="po-drawer-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div id="po-drawer" className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-base">New Purchase Order</h3>
              </div>
              <button
                onClick={() => setIsPoDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleSubmitPo} className="p-6 overflow-y-auto no-scrollbar space-y-6 flex-1 text-xs">
              
              {/* Section 1: Order Metadata */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>1. PO Header & Dates</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Order Date *</label>
                    <input
                      type="date"
                      value={poForm.orderDate}
                      onChange={e => setPoForm({ ...poForm, orderDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Expected Delivery Date</label>
                    <input
                      type="date"
                      value={poForm.expectedDeliveryDate}
                      onChange={e => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Ref Invoice / Bill #</label>
                    <input
                      type="text"
                      placeholder="e.g. SUP-INV-9921"
                      value={poForm.referenceInvoiceNo}
                      onChange={e => setPoForm({ ...poForm, referenceInvoiceNo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Party Details (Customer or Supplier Search & Add) */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>2. Select Party (Supplier or Customer)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => setIsAddPartyModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Party</span>
                  </button>
                </div>

                {/* Party Type Toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-slate-400 font-semibold text-xs">Party Type:</label>
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setPoForm({ ...poForm, partyType: 'Supplier', partyId: '', partyName: '', partyPhone: '' });
                        setPartySearchQuery('');
                      }}
                      className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        poForm.partyType === 'Supplier' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Supplier / Wholesaler</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPoForm({ ...poForm, partyType: 'Customer', partyId: '', partyName: '', partyPhone: '' });
                        setPartySearchQuery('');
                      }}
                      className={`px-3 py-1 rounded-lg font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        poForm.partyType === 'Customer' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Customer (Buyback)</span>
                    </button>
                  </div>
                </div>

                {/* Party Search Auto-complete Input */}
                <div className="relative">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Search Existing Party by Mobile Number or Name *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Type Mobile Number or Name to search existing ${poForm.partyType}s...`}
                      value={partySearchQuery}
                      onChange={e => {
                        setPartySearchQuery(e.target.value);
                        setIsPartyDropdownOpen(true);
                      }}
                      onFocus={() => setIsPartyDropdownOpen(true)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Dropdown Suggestions */}
                  {isPartyDropdownOpen && partySearchQuery.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto no-scrollbar divide-y divide-slate-800">
                      {filteredExistingParties().length === 0 ? (
                        <div className="p-3 text-slate-400 text-center">
                          <p className="font-semibold text-slate-300">No matching parties found</p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPartyDropdownOpen(false);
                              setIsAddPartyModalOpen(true);
                            }}
                            className="text-xs text-indigo-400 underline font-bold mt-1 inline-block"
                          >
                            + Click to create new party
                          </button>
                        </div>
                      ) : (
                        filteredExistingParties().map(p => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectParty(p)}
                            className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{p.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${p.type === 'Supplier' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                  {p.type}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                Phone: {p.phone} • {p.subName}
                              </div>
                            </div>
                            <button type="button" className="text-indigo-400 text-xs font-bold">
                              Select
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Party Summary Block */}
                {poForm.partyName && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-indigo-500/30 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">Party Name:</span>
                      <div className="font-bold text-white">{poForm.partyName}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Mobile Phone:</span>
                      <div className="font-bold text-indigo-300 font-mono">{poForm.partyPhone}</div>
                    </div>
                    {poForm.partyEmail && (
                      <div>
                        <span className="text-slate-400 text-[10px]">Email:</span>
                        <div className="text-slate-300">{poForm.partyEmail}</div>
                      </div>
                    )}
                    {poForm.partyAddress && (
                      <div>
                        <span className="text-slate-400 text-[10px]">Address:</span>
                        <div className="text-slate-300 truncate">{poForm.partyAddress}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Purchase Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                    <span>3. Purchase Line Items & Serial IMEIs</span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-indigo-400 hover:text-indigo-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 relative group">
                      
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-800 text-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                          Item #{idx + 1}
                        </span>

                        {poItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Select Existing Product or Enter Custom Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                            Link Existing Catalog Product (Optional)
                          </label>
                          <select
                            value={item.productId || ''}
                            onChange={e => handleSelectExistingProductForItem(idx, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">-- Custom / Unlisted Item --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.brand} {p.name} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">
                            Product Name / Model *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. iPhone 15 Pro Max 256GB"
                            value={item.productName}
                            onChange={e => handleItemChange(idx, 'productName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      {/* Pricing & Quantities */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Quantity *</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono font-bold focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Unit Cost Price ({settings.currencySymbol}) *</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitCostPrice}
                            onChange={e => handleItemChange(idx, 'unitCostPrice', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-amber-300 font-semibold mb-1">SPL Price ({settings.currencySymbol})</label>
                          <input
                            type="number"
                            min={0}
                            placeholder="Special Deal Price"
                            value={item.splPrice || ''}
                            onChange={e => handleItemChange(idx, 'splPrice', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-amber-950/20 border border-amber-500/40 rounded-xl text-amber-200 font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Expected Retail Price ({settings.currencySymbol})</label>
                          <input
                            type="number"
                            min={0}
                            value={item.expectedSellingPrice || ''}
                            onChange={e => handleItemChange(idx, 'expectedSellingPrice', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-400 font-semibold">Line Item Total Cost:</span>
                        <span className="font-extrabold text-emerald-400 font-mono text-sm">
                          {settings.currencySymbol}{item.totalCost.toLocaleString()}
                        </span>
                      </div>

                      {/* Serial / IMEIs Entry Input */}
                      <div>
                        <label className="block text-slate-400 text-[11px] font-semibold mb-1 flex items-center justify-between">
                          <span>IMEI / Serial Numbers for Inwarding ({item.imeiNumbers?.length || 0} entered)</span>
                          <span className="text-[10px] text-slate-500">Separate multiple IMEIs by comma or new line</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. 352981029381921, 352981029381922"
                          value={item.imeiNumbers?.join(', ') || ''}
                          onChange={e => handleImeiInput(idx, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Order Status & Accounting */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>4. Payment & Inward Action</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Inward Status *</label>
                    <select
                      value={poForm.orderStatus}
                      onChange={e => setPoForm({ ...poForm, orderStatus: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Issued / Sent">Issued / Sent</option>
                      <option value="Received & Inwarded">Received & Inwarded Immediately</option>
                      <option value="Draft">Save as Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tax Amount ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={poForm.taxAmount || ''}
                      onChange={e => setPoForm({ ...poForm, taxAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Discount ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={poForm.discountAmount || ''}
                      onChange={e => setPoForm({ ...poForm, discountAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Amount Paid Now ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={poForm.paidAmount || ''}
                      onChange={e => setPoForm({ ...poForm, paidAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Financial Summary Box */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-400">Items Subtotal:</span>
                    <span className="text-slate-200 font-bold ml-2">{settings.currencySymbol}{subtotalCost.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-slate-400">Net Total PO Amount:</span>
                    <span className="text-indigo-400 font-extrabold text-sm ml-2">{settings.currencySymbol}{netTotalCost.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-slate-400">Khata Debt Owed:</span>
                    <span className={`font-extrabold text-sm ml-2 ${balanceDebtOwed > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {settings.currencySymbol}{balanceDebtOwed.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PO Notes / Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 days payment warranty cycle. Batch inspect before payment."
                    value={poForm.notes}
                    onChange={e => setPoForm({ ...poForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPoDrawerOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-extrabold shadow-lg cursor-pointer transition-all flex items-center gap-2 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save & Generate Purchase Order</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* INLINE ADD PARTY MODAL (+ Add New Customer or Supplier) */}
      {isAddPartyModalOpen && (
        <div id="add-party-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div id="add-party-modal" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full text-slate-100 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-sm">
                  Add New {addPartyType === 'Supplier' ? 'Wholesaler / Supplier' : 'Customer'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Party Type Switch */}
                <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setAddPartyType('Supplier')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${addPartyType === 'Supplier' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                  >
                    Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddPartyType('Customer')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${addPartyType === 'Customer' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
                  >
                    Customer
                  </button>
                </div>

                <button
                  onClick={() => setIsAddPartyModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {addPartyType === 'Supplier' ? (
              <form onSubmit={handleCreateSupplier} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company / Wholesaler Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Mobile Wholesalers Pvt Ltd"
                    value={newSupplierForm.companyName}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Manish Sharma"
                      value={newSupplierForm.contactPerson}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98111 00099"
                      value={newSupplierForm.phone}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. orders@supplier.com"
                      value={newSupplierForm.email}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Supplier Category</label>
                    <select
                      value={newSupplierForm.category}
                      onChange={e => setNewSupplierForm({ ...newSupplierForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Smartphones Wholesaler">Smartphones Wholesaler</option>
                      <option value="Accessories Distributor">Accessories Distributor</option>
                      <option value="Spare Parts Supplier">Spare Parts Supplier</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Office / Warehouse Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Nehru Place Market, Delhi"
                    value={newSupplierForm.address}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPartyModalOpen(false)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg cursor-pointer"
                  >
                    Save & Select Supplier
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Aman Verma"
                    value={newCustomerForm.name}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 12345"
                      value={newCustomerForm.phone}
                      onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. customer@gmail.com"
                      value={newCustomerForm.email}
                      onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Home / Office Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Green Park, City"
                    value={newCustomerForm.address}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPartyModalOpen(false)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg cursor-pointer"
                  >
                    Save & Select Customer
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* PRINTABLE PO VOUCHER / RECEIPT MODAL */}
      {selectedPoForReceipt && (
        <div id="po-receipt-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div id="po-receipt-modal" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full text-slate-100 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-white text-sm">Purchase Order Voucher: {selectedPoForReceipt.poNumber}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PO Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedPoForReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-6 text-slate-900 bg-white m-4 rounded-xl shadow-inner font-sans text-xs">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-300 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{settings.shopName}</h1>
                  <p className="text-[11px] text-slate-600 mt-0.5">{settings.address}</p>
                  <p className="text-[11px] text-slate-600 font-mono">Phone: {settings.phone} • GSTIN: {settings.gstNumber}</p>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-indigo-900 uppercase tracking-widest">PURCHASE ORDER</div>
                  <div className="text-sm font-extrabold text-slate-800 font-mono mt-0.5">{selectedPoForReceipt.poNumber}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Date: {selectedPoForReceipt.orderDate}</div>
                </div>
              </div>

              {/* Party & Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    PO Issued To ({selectedPoForReceipt.partyType}):
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedPoForReceipt.partyName}</div>
                  <div className="text-[11px] text-slate-700 font-mono mt-0.5">Phone: {selectedPoForReceipt.partyPhone}</div>
                  {selectedPoForReceipt.partyGstin && <div className="text-[10px] text-slate-600 font-mono">GSTIN: {selectedPoForReceipt.partyGstin}</div>}
                  {selectedPoForReceipt.partyAddress && <div className="text-[10px] text-slate-600 mt-0.5">{selectedPoForReceipt.partyAddress}</div>}
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Order Summary:</div>
                  <div className="text-[11px] text-slate-700">Created By: <strong>{selectedPoForReceipt.createdBy}</strong></div>
                  {selectedPoForReceipt.referenceInvoiceNo && <div className="text-[11px] text-slate-700 font-mono">Ref Bill #: <strong>{selectedPoForReceipt.referenceInvoiceNo}</strong></div>}
                  <div className="text-[11px] text-slate-700">Inward Status: <strong>{selectedPoForReceipt.orderStatus}</strong></div>
                  <div className="text-[11px] text-slate-700">Payment Status: <strong>{selectedPoForReceipt.paymentStatus}</strong></div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 text-[10px] font-bold uppercase border-b border-slate-300">
                      <th className="p-2">#</th>
                      <th className="p-2">Product Description / IMEIs</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Cost</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedPoForReceipt.items.map((item, idx) => (
                      <tr key={idx} className="text-slate-800">
                        <td className="p-2 font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-2">
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          {item.splPrice && item.splPrice > 0 ? (
                            <div className="text-[10px] text-amber-700 font-extrabold">SPL Offer Price: {settings.currencySymbol}{item.splPrice.toLocaleString()}</div>
                          ) : null}
                          {item.imeiNumbers && item.imeiNumbers.length > 0 && (
                            <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                              IMEIs: {item.imeiNumbers.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="p-2 text-center font-bold font-mono">{item.quantity}</td>
                        <td className="p-2 text-right font-mono">{settings.currencySymbol}{item.unitCostPrice.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold font-mono">{settings.currencySymbol}{item.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex items-start justify-between border-t border-slate-300 pt-3">
                <div className="max-w-xs text-[10px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Terms & Notes:</div>
                  <div>{selectedPoForReceipt.notes || 'Standard purchase inward terms apply. Inwarded stock verified.'}</div>
                </div>

                <div className="w-56 space-y-1 text-right text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{settings.currencySymbol}{selectedPoForReceipt.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedPoForReceipt.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax / GST:</span>
                      <span>+{settings.currencySymbol}{selectedPoForReceipt.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedPoForReceipt.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount:</span>
                      <span>-{settings.currencySymbol}{selectedPoForReceipt.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-slate-300 pt-1">
                    <span>Net Total:</span>
                    <span>{settings.currencySymbol}{selectedPoForReceipt.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Amount Paid:</span>
                    <span>{settings.currencySymbol}{selectedPoForReceipt.paidAmount.toLocaleString()}</span>
                  </div>
                  {selectedPoForReceipt.balanceAmount > 0 && (
                    <div className="flex justify-between text-rose-700 font-extrabold">
                      <span>Balance Owed:</span>
                      <span>{settings.currencySymbol}{selectedPoForReceipt.balanceAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-8 flex items-center justify-between text-[11px] text-slate-600">
                <div>
                  <div className="border-t border-slate-400 w-36 pt-1 text-center font-semibold">Store Manager Signature</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-36 pt-1 text-center font-semibold">Authorized Party Seal</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
