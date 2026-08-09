import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer';
import {
  Smartphone,
  Search,
  ShoppingCart,
  Globe,
  ExternalLink,
  UserCheck,
  LogOut,
  Database,
  User,
  Mail,
  Shield,
  Key,
  ChevronDown,
  CheckCircle2,
  Bot,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
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

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          
          {/* AI Store Assistant Button */}
          <button
            id="ai-assistant-btn"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-md shadow-indigo-500/20 transition active:scale-95 cursor-pointer relative border border-indigo-400/30"
            title="Chat with AI Assistant for Store Reports, Income, and Analytics"
          >
            <Bot className="w-4 h-4 text-purple-200 animate-pulse" />
            <span className="hidden sm:inline">AI Assistant</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          {/* Fast POS Button */}
          <button
            id="quick-pos-btn"
            onClick={() => {
              setActiveTab('sell');
              navigate('/sell');
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-sm transition active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">New POS Sale</span>
          </button>

          {/* View Live Storefront */}
          <a
            id="view-storefront-btn"
            href="https://mobileworldrehub.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm px-3 py-2 rounded-lg transition relative"
            title="Open Ecom Storefront in new tab (https://mobileworldrehub.in)"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">Ecom Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
            {pendingOrdersCount > 0 && (
              <span id="pending-orders-badge" className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </a>

          {/* Profile Component with Submenu as per image */}
          {currentUser ? (
            <div ref={menuRef} className="relative">
              {/* Profile Card Container */}
              <div
                id="user-profile-menu"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-1.5 pr-2 transition cursor-pointer shadow-md select-none"
              >
                {/* Avatar */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700/80 shrink-0"
                />

                {/* Name & Role + JWT Badge */}
                <div className="hidden sm:block text-left text-xs leading-tight min-w-0">
                  <div className="font-extrabold text-slate-100 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5 mt-0.5">
                    <span>{currentUser.role}</span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider border border-cyan-500/30">
                      JWT
                    </span>
                  </div>
                </div>

                {/* Direct Logout Button Icon */}
                <button
                  type="button"
                  id="demo-logout-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 text-slate-300 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800/90 transition ml-1 shrink-0"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Submenu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Submenu Profile Information Header */}
                  <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-white text-sm truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{currentUser.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>JWT Active</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submenu Links & Information */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Account & Session
                    </div>
                    
                    <div className="px-2 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Auth Token:</span>
                        </span>
                        <span className="font-mono text-cyan-300 font-bold text-[10px]">JWT Verified</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {token ? `${token.substring(0, 24)}...` : 'Session Active'}
                      </div>
                    </div>
                  </div>

                  {/* Submenu Logout Button */}
                  <div className="border-t border-slate-800 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-between group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        <span>Logout Account</span>
                      </span>
                      <span className="text-[10px] text-rose-400/80 font-mono">Clear Session</span>
                    </button>
                  </div>

                </div>
              )}
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

      {/* AI Assistant Side Popup Drawer */}
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </header>
  );
};

