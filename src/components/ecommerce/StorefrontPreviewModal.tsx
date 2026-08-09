import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  X,
  Smartphone,
  ShoppingCart,
  Search,
  CheckCircle2,
  Shield,
  Truck,
  Star,
  Globe,
  ArrowRight
} from 'lucide-react';

interface StorefrontPreviewModalProps {
  onClose: () => void;
}

export const StorefrontPreviewModal: React.FC<StorefrontPreviewModalProps> = ({ onClose }) => {
  const { products, settings, orders } = useApp();

  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(false);

  const featured = products.filter(p => p.featuredInEcommerce && p.status === 'Active');
  const displayProducts = activeCategory === 'All' ? featured : featured.filter(p => p.category === activeCategory);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === p.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.onlinePrice * item.quantity), 0);

  const handlePlaceOnlineOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !checkoutName || !checkoutPhone) return;

    // Direct simulation of online web order
    const orderNum = `ECOMM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: checkoutName,
      customerPhone: checkoutPhone,
      customerEmail: `${checkoutName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      shippingAddress: checkoutAddress || 'Online Customer Address, City Center',
      items: cart.map(c => ({
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.onlinePrice,
        quantity: c.quantity,
        image: c.product.image
      })),
      totalAmount,
      paymentMethod: 'Prepaid Online' as const,
      paymentStatus: 'Paid' as const,
      orderStatus: 'Pending' as const
    };

    // Save to context
    orders.unshift(newOrder);

    setOrderSuccessMsg(true);
    setCart([]);
  };

  return (
    <div id="storefront-preview-overlay" className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div id="storefront-preview-card" className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full text-slate-100 my-4 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Preview Frame Top Bar */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400 ml-2 font-mono text-[11px] truncate">https://{settings.shopName.toLowerCase().replace(/\s+/g, '')}.com/store</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-semibold">
              Live Storefront Simulator
            </span>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Storefront Navigation Bar */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{settings.shopName}</div>
              <div className="text-[10px] text-slate-400">Official Web Store • Express Shipping</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs text-slate-200">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
                <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Storefront Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 border border-indigo-700/50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Festive Mega Deals
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Latest Smartphones & Original Accessories
              </h2>
              <p className="text-xs text-slate-300">
                Shop 100% Genuine Mobile Devices with Official Brand Warranty, No Cost EMI & 2-Hour Hyperlocal Delivery.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=400"
              alt="Flagship Phone"
              className="w-48 h-32 object-cover rounded-xl shadow-2xl border border-indigo-500/40 shrink-0"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {['All', 'Smartphones', 'Accessories', 'Spare Parts'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                  activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* E-Commerce Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayProducts.map(prod => (
              <div key={prod.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between space-y-3">
                <div>
                  <img src={prod.image} alt={prod.name} className="w-full h-36 object-cover rounded-xl bg-slate-900 mb-2" />
                  <div className="text-[10px] font-semibold text-indigo-400 uppercase">{prod.brand}</div>
                  <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{prod.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      {settings.currencySymbol}{prod.onlinePrice.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">In Stock • Fast Delivery</div>
                  </div>

                  <button
                    onClick={() => addToCart(prod)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart & Online Order Submission Drawer */}
          {cart.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-base">Your Online Shopping Cart</h3>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-slate-200 bg-slate-900/60 p-2 rounded-lg">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span className="font-bold">{settings.currencySymbol}{(item.product.onlinePrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {orderSuccessMsg ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <div className="font-bold text-emerald-300 text-sm">Order Placed Successfully!</div>
                  <div className="text-xs text-slate-300">
                    Your order has been routed to the Web Admin Online Orders Queue! Close this modal to process & fulfill it in the admin console.
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePlaceOnlineOrder} className="space-y-3 pt-2 border-t border-slate-700 text-xs">
                  <div className="font-semibold text-slate-300">Customer Shipping Details</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="bg-slate-900 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="bg-slate-900 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Delivery Address"
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    className="w-full bg-slate-900 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg"
                  >
                    Place Web Order ({settings.currencySymbol}{totalAmount.toLocaleString()})
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
