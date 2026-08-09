/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SellModule } from './components/pos/SellModule';
import { ExchangeModule } from './components/exchange/ExchangeModule';
import { BuyModule } from './components/exchange/BuyModule';
import { EcommerceModule } from './components/ecommerce/EcommerceModule';
import { CreditModule } from './components/credit/CreditModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { CatalogModule } from './components/catalog/CatalogModule';
import { GenericModuleView } from './components/common/GenericModuleView';
import { StorefrontPreviewModal } from './components/ecommerce/StorefrontPreviewModal';
import { RepairsModule } from './components/repairs/RepairsModule';

function MainLayout() {
  const { currentUser, activeTab, showStorefrontPreview, setShowStorefrontPreview } = useApp();
  const mainContentRef = useRef<HTMLElement>(null);

  // Scroll to top whenever the active tab changes or on initial load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab, currentUser]);

  // If user is not logged in, render ONLY the Login Page and block dashboard access
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <div className="flex-1 w-full flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Tab Content Area */}
        <main ref={mainContentRef} className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'catalog' && <CatalogModule />}
          {activeTab === 'sell' && <SellModule />}
          {activeTab === 'buy' && <BuyModule />}
          {activeTab === 'valuation' && <ExchangeModule />}
          {activeTab === 'credits' && <CreditModule />}
          {(activeTab === 'repairs' || activeTab === 'jobcard') && <RepairsModule />}
          {activeTab === 'settings' && <SettingsModule />}

          {/* Generic & Detailed Module Router for remaining sidebar items */}
          {['purchases', 'logistics', 'stores', 'payments', 'customer', 'cms', 'reports', 'users'].includes(activeTab) && (
            <GenericModuleView tab={activeTab} />
          )}
        </main>

      </div>

      {/* Live Storefront Simulator Modal */}
      {showStorefrontPreview && (
        <StorefrontPreviewModal onClose={() => setShowStorefrontPreview(false)} />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
