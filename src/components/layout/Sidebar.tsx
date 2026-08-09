import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Receipt,
  ShoppingCart,
  Truck,
  Wrench,
  IndianRupee,
  CreditCard,
  Building2,
  Wallet,
  Scale,
  UserCheck,
  Globe,
  BarChart3,
  Users,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders, customers, products, settings } = useApp();

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
      badgeColor: 'bg-indigo-500 text-white',
      description: 'Shipping & Courier Tracking'
    },
    {
      id: 'repairs',
      label: 'Repairs',
      icon: Wrench,
      description: 'Service & Device Repairs'
    },
    {
      id: 'accounts',
      label: '₹ Accounts',
      icon: IndianRupee,
      description: 'Cashbook & Expense Ledger'
    },
    {
      id: 'credits',
      label: 'Credits',
      icon: CreditCard,
      badge: overdueCustomers > 0 ? overdueCustomers : undefined,
      badgeColor: 'bg-amber-500 text-white',
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

  return (
    <aside id="admin-sidebar" className="w-full md:w-64 bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between py-4 max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar sticky top-16">
      <div className="px-3 space-y-1">
        
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Main Navigation</span>
          {lowStockCount > 0 && (
            <span id="low-stock-alert-badge" className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-normal flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {lowStockCount} Low
            </span>
          )}
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{item.label}</div>
                  {item.description && (
                    <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.description}
                    </div>
                  )}
                </div>
              </div>

              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-slate-700 text-slate-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="px-3 pt-4 border-t border-slate-800/80 mt-4">
        <div id="sidebar-shop-quick-info" className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Currency:</span>
            <span className="font-semibold text-slate-200">{settings.currencySymbol} (INR)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>GST Rate:</span>
            <span className="font-semibold text-slate-200">{settings.taxRatePercent}%</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>System Status:</span>
            <span className="font-semibold text-emerald-400">Live POS POS/REST</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
