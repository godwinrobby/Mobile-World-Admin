import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  ShoppingCart,
  Truck,
  Wrench,
  CreditCard,
  Building2,
  Wallet,
  Scale,
  UserCheck,
  Globe,
  BarChart3,
  Users,
  Settings,
  AlertTriangle,
  Menu,
  X,
  Bot
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    orders,
    customers,
    products,
    settings,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Active path determined from location or activeTab fallback
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const overdueCustomers = customers.filter(c => c.currentBalance > 0).length;
  const lowStockCount = products.filter(p => p.stock <= settings.lowStockThreshold).length;

  const menuItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string; description?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview, Sales Stats & KPI'
    },
    {
      id: 'catalog',
      label: 'Catalog',
      icon: Package,
      description: 'Products, IMEIs & Inventory'
    },
    {
      id: 'buy',
      label: 'Buy',
      icon: ShoppingBag,
      description: 'Device Trade-In & Buyback'
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: Receipt,
      description: 'Wholesaler Stock-In Invoices'
    },
    {
      id: 'sell',
      label: 'Sell',
      icon: ShoppingCart,
      description: 'POS Counter Sale & Bills'
    },
    {
      id: 'logistics',
      label: 'Logistics',
      icon: Truck,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
      badgeColor: 'bg-indigo-600 text-white',
      description: 'Shipping & Courier Tracking'
    },
    {
      id: 'repairs',
      label: 'Repairs',
      icon: Wrench,
      description: 'Service & Device Repairs'
    },
    {
      id: 'credits',
      label: 'Credits',
      icon: CreditCard,
      badge: overdueCustomers > 0 ? overdueCustomers : undefined,
      badgeColor: 'bg-amber-600 text-white',
      description: 'Customer Udhar & Khata'
    },
    {
      id: 'stores',
      label: 'Stores / Partners',
      icon: Building2,
      description: 'Branches & Wholesaler Network'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: Wallet,
      description: 'UPI, Cash & Card Collections'
    },
    {
      id: 'valuation',
      label: 'Valuation',
      icon: Scale,
      description: 'Trade-In Pricing Calculator'
    },
    {
      id: 'customer',
      label: 'Customer',
      icon: UserCheck,
      description: 'CRM & Contact Directory'
    },
    {
      id: 'cms',
      label: 'CMS',
      icon: Globe,
      description: 'Storefront Banners & Catalog'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      description: 'Sales, GST & Profit Analytics'
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'Staff & Role Permissions'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Shop Config, Tax & API Setup'
    }
  ];

  const handleNavigate = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
    setIsMobileMenuOpen(false);
  };

  const navContent = (
    <div className="space-y-1">
      <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>Main Navigation</span>
        {lowStockCount > 0 && (
          <span id="low-stock-alert-badge" className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> {lowStockCount} Low
          </span>
        )}
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.id || activeTab === item.id;

        return (
          <button
            key={item.id}
            id={`nav-item-${item.id}`}
            onClick={() => handleNavigate(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition duration-150 group cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} />
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800 group-hover:text-slate-950'}`}>
                  {item.label}
                </div>
                {item.description && (
                  <div className={`text-xs truncate ${isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-600 font-normal'}`}>
                    {item.description}
                  </div>
                )}
              </div>
            </div>

            {item.badge !== undefined && (
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside id="admin-sidebar" className="hidden md:flex w-72 bg-white border-r border-slate-200 shrink-0 flex-col justify-between py-4 max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar sticky top-16 shadow-xs">
        <div className="px-3">
          {navContent}
        </div>

        {/* Footer Info Box */}
        <div className="px-3 pt-4 border-t border-slate-200 mt-4">
          <div id="sidebar-shop-quick-info" className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>Currency:</span>
              <span className="font-bold text-slate-900">{settings.currencySymbol} (INR)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>GST Rate:</span>
              <span className="font-bold text-slate-900">{settings.taxRatePercent}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>System Status:</span>
              <span className="font-bold text-emerald-700">Live POS/REST</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Menu Content */}
          <div className="relative w-4/5 max-w-xs bg-white border-r border-slate-200 h-full flex flex-col justify-between p-4 overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    MW
                  </div>
                  <span className="font-bold text-slate-900 text-base">{settings.shopName}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navContent}
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium">
              <p className="text-center">Mobile World Care ERP v2.5</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-2 px-1 shadow-2xl">
        <button
          onClick={() => handleNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => handleNavigate('sell')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'sell' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">POS Sale</span>
        </button>

        <button
          onClick={() => handleNavigate('catalog')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'catalog' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px]">Catalog</span>
        </button>

        <button
          onClick={() => handleNavigate('repairs')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'repairs' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px]">Repairs</span>
        </button>

        <button
          onClick={() => handleNavigate('credits')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === 'credits' ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">Udhar</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            isMobileMenuOpen ? 'text-indigo-600 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </>
  );
};

