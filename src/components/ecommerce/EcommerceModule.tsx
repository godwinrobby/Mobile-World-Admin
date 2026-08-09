import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, EcommerceOrder, Category } from '../../types';
import {
  Store,
  Plus,
  Search,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Globe,
  Tag,
  Edit2,
  Trash2,
  Eye,
  ShoppingBag,
  ExternalLink,
  Smartphone,
  Layers
} from 'lucide-react';

export const EcommerceModule: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    settings,
    setShowStorefrontPreview
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'orders'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('Apple');
  const [newProdCategory, setNewProdCategory] = useState<Category>('Smartphones');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPosPrice, setNewProdPosPrice] = useState('');
  const [newProdOnlinePrice, setNewProdOnlinePrice] = useState('');
  const [newProdCostPrice, setNewProdCostPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600');
  const [hasImeiTracking, setHasImeiTracking] = useState(true);
  const [imeiInputList, setImeiInputList] = useState('');

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPosPrice) return;

    const imeis = imeiInputList.split(',').map(s => s.trim()).filter(Boolean);

    addProduct({
      name: newProdName,
      brand: newProdBrand,
      category: newProdCategory,
      description: newProdDesc || 'High quality mobile product.',
      posPrice: parseFloat(newProdPosPrice),
      onlinePrice: parseFloat(newProdOnlinePrice || newProdPosPrice),
      costPrice: parseFloat(newProdCostPrice || '0'),
      stock: parseInt(newProdStock) || 0,
      image: newProdImage,
      hasImeiTracking,
      imeiList: imeis.length > 0 ? imeis : undefined,
      status: 'Active',
      featuredInEcommerce: true
    });

    setShowAddModal(false);
    // Reset
    setNewProdName('');
    setNewProdPosPrice('');
    setNewProdOnlinePrice('');
    setImeiInputList('');
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div id="ecommerce-module-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            <span>Ecommerce Catalog & Online Order Manager</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sync stock between physical POS counter and online website orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://mobileworldrehub.in"
            target="_blank"
            rel="noopener noreferrer"
            id="open-storefront-modal-btn"
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-md shadow-cyan-600/20"
          >
            <Globe className="w-4 h-4" />
            <span>Open Ecom Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          
          <button
            onClick={() => setShowAddModal(true)}
            id="open-add-product-btn"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Switcher: Catalog vs Online Orders */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('catalog')}
          id="subtab-catalog"
          className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
            activeSubTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          id="subtab-orders"
          className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeSubTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <span>Online Web Orders</span>
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {orders.length}
          </span>
        </button>
      </div>

      {/* Subtab 1: Product Catalog View */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['All', 'Smartphones', 'Accessories', 'Spare Parts'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                    categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-xs text-slate-100 pl-9 pr-3 py-1.5 rounded-xl border border-slate-700"
              />
            </div>
          </div>

          {/* Product Grid Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">POS Price</th>
                    <th className="p-3">Online Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Featured Web</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0" />
                          <div>
                            <div className="font-bold text-slate-100">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {settings.currencySymbol}{p.posPrice.toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-cyan-400">
                        {settings.currencySymbol}{p.onlinePrice.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${p.stock === 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => updateProduct(p.id, { featuredInEcommerce: !p.featuredInEcommerce })}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.featuredInEcommerce ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {p.featuredInEcommerce ? 'Featured' : 'Standard'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Subtab 2: Online Orders View */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base">Incoming Ecommerce Web Orders</h3>

            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                    <div>
                      <span className="font-mono font-bold text-indigo-300 text-sm">{order.orderNumber}</span>
                      <span className="text-slate-400 ml-2">• {order.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        order.orderStatus === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
                        order.orderStatus === 'Confirmed' ? 'bg-cyan-500/20 text-cyan-300' :
                        order.orderStatus === 'Shipped' ? 'bg-indigo-500/20 text-indigo-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {order.orderStatus}
                      </span>

                      <span className="bg-slate-900 text-slate-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <div className="font-bold text-slate-100">{order.customerName}</div>
                      <div>Ph: {order.customerPhone} • {order.customerEmail}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Shipping: {order.shippingAddress}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-slate-400">Total Amount:</div>
                      <div className="text-base font-extrabold text-emerald-400">
                        {settings.currencySymbol}{order.totalAmount.toLocaleString()}
                      </div>
                      {order.trackingNumber && (
                        <div className="text-[11px] text-cyan-300 font-mono mt-1">
                          Tracking: {order.courierName} ({order.trackingNumber})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-slate-900/60 p-2.5 rounded-lg space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-200">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="font-semibold">{settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Fulfillment Action Controls */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {order.orderStatus === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.orderStatus === 'Confirmed' && (
                      <button
                        onClick={() => {
                          const trk = prompt('Enter Courier Tracking Number (e.g. BLUEDART-998811):', 'BLUEDART-882173');
                          if (trk) updateOrderStatus(order.id, 'Shipped', trk);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Dispatch & Add Tracking
                      </button>
                    )}
                    {order.orderStatus === 'Shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Delivered')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Add New Product to Catalog</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pixel 8 Pro 256GB"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="Apple, Samsung, Google"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Spare Parts">Spare Parts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">POS Price ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={newProdPosPrice}
                    onChange={(e) => setNewProdPosPrice(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Online Price ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={newProdOnlinePrice}
                    onChange={(e) => setNewProdOnlinePrice(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={hasImeiTracking}
                    onChange={(e) => setHasImeiTracking(e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <span>Enable IMEI / Serial Number Tracking</span>
                </label>
              </div>

              {hasImeiTracking && (
                <div>
                  <label className="block text-slate-300 mb-1">Initial IMEIs (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="352019001, 352019002..."
                    value={imeiInputList}
                    onChange={(e) => setImeiInputList(e.target.value)}
                    className="w-full bg-slate-800 text-indigo-300 font-mono px-3 py-2 rounded-xl border border-slate-700"
                  />
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
