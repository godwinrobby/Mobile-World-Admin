import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopSettings } from '../../types';
import {
  Settings,
  Store,
  Receipt,
  ShieldCheck,
  Database,
  RefreshCw,
  Download,
  Users,
  Code,
  CheckCircle2,
  AlertCircle,
  Globe,
  Key
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { settings, updateSettings, resetAllData, users, products, sales, exchanges, customers } = useApp();

  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent.toString());
  const [taxInclusive, setTaxInclusive] = useState(settings.taxInclusive);

  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooterMessage);

  // API Config State
  const [demoApiMode, setDemoApiMode] = useState(settings.demoApiMode);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);

  const [saveToast, setSaveToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName,
      tagline,
      address,
      phone,
      gstNumber,
      currencySymbol,
      taxRatePercent: parseFloat(taxRatePercent) || 18,
      taxInclusive,
      receiptFooterMessage: receiptFooter,
      demoApiMode,
      apiBaseUrl,
      apiKey
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleExportData = () => {
    const fullData = {
      settings,
      products,
      sales,
      exchanges,
      customers,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile_shop_admin_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
  };

  return (
    <div id="settings-module-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Shop Configuration, Staff Roles & API Setup</span>
          </h2>
          <p className="text-xs text-slate-400">
            Customize invoice details, tax rules, staff permissions, and API endpoints for backend migration.
          </p>
        </div>

        {saveToast && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Shop Profile & Tax Config */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Shop Branding & Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Store className="w-5 h-5 text-indigo-400" />
              <span>Shop Branding & Address Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Mobile Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tagline / Business Subtitle</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1 font-semibold">Store Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Store Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">GSTIN / Tax ID Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Tax & Currency Rules */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Receipt className="w-5 h-5 text-indigo-400" />
              <span>Tax Rate & Currency Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Standard Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={taxInclusive}
                    onChange={(e) => setTaxInclusive(e.target.checked)}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span>Prices Include GST/Tax</span>
                </label>
              </div>
            </div>

            <div className="text-xs pt-2">
              <label className="block text-slate-300 mb-1 font-semibold">Receipt Footer Warranty Terms</label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              />
            </div>
          </div>

          {/* API Backend Integration Settings (For Developer API later) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <span>API Endpoint Configuration (Future Integration)</span>
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                demoApiMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {demoApiMode ? 'Simulated Local Mock API' : 'Production API Active'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              When your backend developer provides custom REST APIs, toggle to Production API mode and enter base credentials.
            </p>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2 text-slate-200 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={demoApiMode}
                  onChange={(e) => setDemoApiMode(e.target.checked)}
                  className="accent-amber-500 w-4 h-4"
                />
                <span>Enable Simulated Mock State (No external backend required for demo)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">API Base Endpoint URL</label>
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">API Secret Key / Bearer Token</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Endpoint Preview Doc */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
                <div className="text-amber-400 font-bold font-sans">Ready Endpoint Schema Mapping:</div>
                <div>POST /api/v1/sales - Process Counter Sales & IMEI Deduction</div>
                <div>POST /api/v1/tradein - Device Exchange Valuation & Voucher</div>
                <div>GET /api/v1/catalog - Sync POS Inventory & Ecommerce</div>
                <div>GET /api/v1/ledger - Customer Udhar & Wholesaler Debt</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="save-settings-btn"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition"
          >
            Save Configuration Changes
          </button>

        </div>

        {/* Right Column: Staff Roles & Data Reset / Export */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Staff Roles List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Staff Accounts & Access Control</span>
            </h3>

            <div className="space-y-3 text-xs">
              {users.map(u => (
                <div key={u.id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </div>
                  </div>

                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    u.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Backup & Reset Data Tools */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Data Tools & Demo Reset</span>
            </h3>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export All Data as JSON</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to restore pristine sample smartphones, sales, and ledger data?')) {
                    resetAllData();
                    alert('Demo data restored successfully!');
                  }
                }}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4 text-rose-400" />
                <span>Reset Demo Sample Data</span>
              </button>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
};
