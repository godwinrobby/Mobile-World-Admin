import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Search,
  ShoppingCart,
  Globe,
  UserCheck,
  LogOut,
  Database,
  Tag,
  Store,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    token,
    logout,
    setActiveTab,
    settings,
    setShowStorefrontPreview,
    searchQuery,
    setSearchQuery,
    orders,
    products
  } = useApp();

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const lowStockCount = products.filter(p => p.stock <= settings.lowStockThreshold).length;

  return (
    <header id="admin-navbar" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Shop Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div id="shop-logo-container" className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 id="shop-header-title" className="font-bold text-slate-100 text-base sm:text-lg truncate tracking-tight">
                {settings.shopName}
              </h1>
              <span id="api-status-badge" className={`hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                settings.demoApiMode
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                <Database className="w-3 h-3" />
                {settings.demoApiMode ? 'Mock API Active' : 'Live API Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate hidden sm:block">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-admin-search"
              type="text"
              placeholder="Search phones, accessories, IMEI, customer, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 text-sm text-slate-100 pl-9 pr-4 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 transition"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Fast POS Button */}
          <button
            id="quick-pos-btn"
            onClick={() => setActiveTab('sell')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">New POS Sale</span>
          </button>

          {/* View Live Storefront */}
          <button
            id="view-storefront-btn"
            onClick={() => setShowStorefrontPreview(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm px-3 py-2 rounded-lg transition relative"
            title="Preview customer-facing online shop"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Ecom Storefront</span>
            {pendingOrdersCount > 0 && (
              <span id="pending-orders-badge" className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* User Role Badge / Logout */}
          {currentUser ? (
            <div id="user-profile-menu" className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1 pr-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-md object-cover border border-slate-600"
              />
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-semibold text-slate-200 truncate max-w-[110px]">{currentUser.name}</div>
                <div className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                  <span>{currentUser.role}</span>
                  {token && <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-mono">JWT</span>}
                </div>
              </div>
              <button
                id="demo-logout-btn"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition ml-1 bg-slate-900 rounded-md border border-slate-700"
                title="Logout & Clear JWT Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="login-trigger-btn"
              onClick={logout}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition shadow-md shadow-indigo-600/30"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In (JWT)</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
