/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SellModule } from './components/pos/SellModule';
import { ExchangeModule } from './components/exchange/ExchangeModule';
import { EcommerceModule } from './components/ecommerce/EcommerceModule';
import { CreditModule } from './components/credit/CreditModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { CatalogModule } from './components/catalog/CatalogModule';
import { GenericModuleView } from './components/common/GenericModuleView';
import { StorefrontPreviewModal } from './components/ecommerce/StorefrontPreviewModal';
import { RepairsModule } from './components/repairs/RepairsModule';

function MainLayout() {
  const { currentUser, activeTab, showStorefrontPreview, setShowStorefrontPreview } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body */}
      <div className="flex-1 w-full flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'catalog' && <CatalogModule />}
          {activeTab === 'sell' && <SellModule />}
          {activeTab === 'buy' && <ExchangeModule />}
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

      {/* Demo Login Modal (if logged out or switching user) */}
      {!currentUser && <LoginModal />}

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
