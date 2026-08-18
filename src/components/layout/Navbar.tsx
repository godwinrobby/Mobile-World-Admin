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
  Sparkles,
  Menu,
  X,
  Sun,
  Moon
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
    products,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    theme,
    toggleTheme
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
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
    <header id="admin-navbar" className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white sticky top-0 z-30 shadow-sm">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Side: Mobile Menu Button & Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Toggle Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition shrink-0 cursor-pointer"
            aria-label="Toggle Mobile Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-rose-500" /> : <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />}
          </button>

          <div id="shop-logo-container" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 id="shop-header-title" className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-lg truncate tracking-tight">
                {settings.shopName}
              </h1>
              <span id="api-status-badge" className={`hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                settings.demoApiMode
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
              }`}>
                <Database className="w-3 h-3" />
                {settings.demoApiMode ? 'Mock API' : 'Live API'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-admin-search"
              type="text"
              placeholder="Search phones, accessories, IMEI, customer, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-slate-100 pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:bg-white placeholder-slate-400 transition shadow-xs"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Mobile Search Icon Toggle */}
          <button
            id="mobile-search-toggle"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Search Store"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* AI Store Assistant Button */}
          <button
            id="ai-assistant-btn"
            onClick={() => setIsAIOpen(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-md shadow-indigo-500/20 transition active:scale-95 cursor-pointer relative border border-indigo-400/30"
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
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-sm transition active:scale-95"
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
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm px-3 py-2 rounded-xl transition relative cursor-pointer shadow-xs"
            title="Open Ecom Storefront in new tab (https://mobileworldrehub.in)"
          >
            <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden lg:inline">Ecom Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
            {pendingOrdersCount > 0 && (
              <span id="pending-orders-badge" className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </a>

          {/* Light / Dark Theme Mode Toggle Switch */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-xl transition active:scale-95 cursor-pointer shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline text-xs font-bold text-slate-800">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline text-xs font-bold text-amber-600 dark:text-amber-300">Light Mode</span>
              </>
            )}
          </button>

          {/* Profile Component with Submenu as per image */}
          {currentUser ? (
            <div ref={menuRef} className="relative">
              {/* Profile Card Container */}
              <div
                id="user-profile-menu"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-2xl p-1.5 pr-2 transition cursor-pointer shadow-xs select-none"
              >
                {/* Avatar */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shrink-0"
                />

                {/* Name & Role + JWT Badge */}
                <div className="hidden sm:block text-left text-xs leading-tight min-w-0">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mt-0.5">
                    <span>{currentUser.role}</span>
                    <span className="text-[9px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider border border-emerald-300 dark:border-emerald-500/30">
                      Active
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
                  className="p-2 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 bg-white hover:bg-rose-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition ml-1 shrink-0 cursor-pointer shadow-xs"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Submenu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
                  
                  {/* Submenu Profile Information Header */}
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{currentUser.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">
                          {currentUser.role}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Session Active</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submenu Links & Information */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Account & Session
                    </div>
                    
                    <div className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>Auth Status:</span>
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-300 font-bold text-[10px]">Verified</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {token ? `${token.substring(0, 24)}...` : 'Session Active'}
                      </div>
                    </div>
                  </div>

                  {/* Submenu Logout Button */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-bold text-xs rounded-xl transition flex items-center justify-between group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                        <span>Logout Account</span>
                      </span>
                      <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-mono">Clear Session</span>
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
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-2.5 bg-slate-950 border-b border-slate-800 animate-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              id="mobile-global-admin-search"
              type="text"
              autoFocus
              placeholder="Search phones, IMEI, customer, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-sm text-slate-100 pl-9 pr-8 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Side Popup Drawer */}
      <AIAssistantDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
    </header>
  );
};

