/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AppProvider, useApp, ActiveTab } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SellModule } from './components/pos/SellModule';
import { ExchangeModule } from './components/exchange/ExchangeModule';
import { BuyModule } from './components/exchange/BuyModule';
import { CreditModule } from './components/credit/CreditModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { CatalogModule } from './components/catalog/CatalogModule';
import { GenericModuleView } from './components/common/GenericModuleView';
import { StorefrontPreviewModal } from './components/ecommerce/StorefrontPreviewModal';
import { RepairsModule } from './components/repairs/RepairsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { UsersModule } from './components/users/UsersModule';

// Protected Application Layout & Router Guard
function ProtectedLayout() {
  const { currentUser, setActiveTab, showStorefrontPreview, setShowStorefrontPreview } = useApp();
  const location = useLocation();
  const mainContentRef = useRef<HTMLElement>(null);

  // Sync route path to activeTab state & scroll to top on path change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    const currentTab = location.pathname.replace('/', '') as ActiveTab;
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [location.pathname, setActiveTab]);

  // If user is not logged in, block access and redirect to /login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 w-full flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Page Route Content */}
        <main ref={mainContentRef} className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

      {/* Live Storefront Preview Modal */}
      {showStorefrontPreview && (
        <StorefrontPreviewModal onClose={() => setShowStorefrontPreview(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* Login Page Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Page Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/catalog" element={<CatalogModule />} />
            <Route path="/sell" element={<SellModule />} />
            <Route path="/buy" element={<BuyModule />} />
            <Route path="/valuation" element={<ExchangeModule />} />
            <Route path="/credits" element={<CreditModule />} />
            <Route path="/repairs" element={<RepairsModule />} />
            <Route path="/jobcard" element={<RepairsModule />} />
            <Route path="/settings" element={<SettingsModule />} />

            {/* Generic Page Views */}
            <Route path="/purchases" element={<GenericModuleView tab="purchases" />} />
            <Route path="/logistics" element={<GenericModuleView tab="logistics" />} />
            <Route path="/stores" element={<GenericModuleView tab="stores" />} />
            <Route path="/payments" element={<GenericModuleView tab="payments" />} />
            <Route path="/customer" element={<GenericModuleView tab="customer" />} />
            <Route path="/cms" element={<GenericModuleView tab="cms" />} />
            <Route path="/reports" element={<ReportsModule />} />
            <Route path="/users" element={<UsersModule />} />
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
