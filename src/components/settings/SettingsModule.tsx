import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopSettings } from '../../types';
import { ImportSettingsTab } from './ImportSettingsTab';
import { BackupRestoreSettingsTab } from './BackupRestoreSettingsTab';
import { DatabaseSchemaTab } from './DatabaseSchemaTab';
import {
  Settings,
  Store,
  Receipt,
  CreditCard,
  MessageSquare,
  Mail,
  FileText,
  Code,
  Database,
  CheckCircle2,
  Download,
  RefreshCw,
  Globe,
  Key,
  ShieldCheck,
  Send,
  Zap,
  HelpCircle,
  Smartphone,
  Check,
  Upload,
  HardDrive,
  Sun,
  Moon
} from 'lucide-react';

type SettingsTab = 'site_info' | 'mysql_database' | 'import_data' | 'backup_restore' | 'payment_gateway' | 'whatsapp_api' | 'email_api' | 'invoice_headers' | 'api_dev';

export const SettingsModule: React.FC = () => {
  const { settings, updateSettings, resetAllData, users, products, sales, exchanges, customers, theme, setTheme } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('site_info');
  const [saveToast, setSaveToast] = useState(false);

  // 1. Site Information State
  const [shopName, setShopName] = useState(settings.shopName || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [address, setAddress] = useState(settings.address || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || '');
  const [websiteUrl, setWebsiteUrl] = useState(settings.websiteUrl || 'https://mobileworldcare.com');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || '');
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone || '');

  // Tax & Currency
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '₹');
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent?.toString() || '18');
  const [taxInclusive, setTaxInclusive] = useState(settings.taxInclusive ?? false);

  // 2. Payment Gateway State
  const [paymentGatewayProvider, setPaymentGatewayProvider] = useState<any>(settings.paymentGatewayProvider || 'Razorpay');
  const [paymentGatewayMode, setPaymentGatewayMode] = useState<any>(settings.paymentGatewayMode || 'Test Sandbox');
  const [paymentGatewayKeyId, setPaymentGatewayKeyId] = useState(settings.paymentGatewayKeyId || '');
  const [paymentGatewaySecretKey, setPaymentGatewaySecretKey] = useState(settings.paymentGatewaySecretKey || '');
  const [paymentGatewayMerchantId, setPaymentGatewayMerchantId] = useState(settings.paymentGatewayMerchantId || '');
  const [autoVerifyUpiStatus, setAutoVerifyUpiStatus] = useState(settings.autoVerifyUpiStatus ?? true);

  // 3. WhatsApp API State
  const [whatsappApiProvider, setWhatsappApiProvider] = useState<any>(settings.whatsappApiProvider || 'Meta Cloud API');
  const [whatsappApiToken, setWhatsappApiToken] = useState(settings.whatsappApiToken || '');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState(settings.whatsappPhoneNumberId || '');
  const [whatsappBusinessNumber, setWhatsappBusinessNumber] = useState(settings.whatsappBusinessNumber || '');
  const [autoSendInvoiceWhatsApp, setAutoSendInvoiceWhatsApp] = useState(settings.autoSendInvoiceWhatsApp ?? true);
  const [autoSendJobCardUpdatesWhatsApp, setAutoSendJobCardUpdatesWhatsApp] = useState(settings.autoSendJobCardUpdatesWhatsApp ?? true);

  // 4. Email API State
  const [emailApiProvider, setEmailApiProvider] = useState<any>(settings.emailApiProvider || 'SMTP');
  const [emailSmtpHost, setEmailSmtpHost] = useState(settings.emailSmtpHost || '');
  const [emailSmtpPort, setEmailSmtpPort] = useState(settings.emailSmtpPort?.toString() || '587');
  const [emailSmtpUser, setEmailSmtpUser] = useState(settings.emailSmtpUser || '');
  const [emailSmtpPassword, setEmailSmtpPassword] = useState(settings.emailSmtpPassword || '');
  const [emailFromAddress, setEmailFromAddress] = useState(settings.emailFromAddress || '');
  const [autoEmailInvoiceReceipts, setAutoEmailInvoiceReceipts] = useState(settings.autoEmailInvoiceReceipts ?? true);

  // 5. Invoice Headers & Legal State
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || 'INV-MWC-');
  const [repairJobCardPrefix, setRepairJobCardPrefix] = useState(settings.repairJobCardPrefix || 'JC-MWC-');
  const [invoiceHeaderTitle, setInvoiceHeaderTitle] = useState(settings.invoiceHeaderTitle || 'RETAIL TAX INVOICE & DIGITAL RECEIPT');
  const [invoiceHeaderNote, setInvoiceHeaderNote] = useState(settings.invoiceHeaderNote || '');
  const [customInvoiceFooterNote, setCustomInvoiceFooterNote] = useState(settings.customInvoiceFooterNote || '');
  const [termsAndConditions, setTermsAndConditions] = useState(settings.termsAndConditions || '');
  const [returnPolicyText, setReturnPolicyText] = useState(settings.returnPolicyText || '');
  const [receiptFooterMessage, setReceiptFooterMessage] = useState(settings.receiptFooterMessage || '');
  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState(settings.authorizedSignatoryName || '');
  const [showShopLogoOnInvoice, setShowShopLogoOnInvoice] = useState(settings.showShopLogoOnInvoice ?? true);
  const [showQrCodeOnInvoice, setShowQrCodeOnInvoice] = useState(settings.showQrCodeOnInvoice ?? true);
  const [invoiceThemeColor, setInvoiceThemeColor] = useState(settings.invoiceThemeColor || '#4f46e5');

  // Logo file upload handler
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // 6. Developer API State
  const [demoApiMode, setDemoApiMode] = useState(settings.demoApiMode ?? true);
  const [apiBaseUrl, setApiBaseUrl] = useState(settings.apiBaseUrl || '');
  const [apiKey, setApiKey] = useState(settings.apiKey || '');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings({
      shopName,
      tagline,
      address,
      phone,
      email,
      gstNumber,
      currencySymbol,
      taxRatePercent: parseFloat(taxRatePercent) || 18,
      taxInclusive,
      receiptFooterMessage,

      websiteUrl,
      logoUrl,
      supportEmail,
      supportPhone,

      paymentGatewayProvider,
      paymentGatewayMode,
      paymentGatewayKeyId,
      paymentGatewaySecretKey,
      paymentGatewayMerchantId,
      autoVerifyUpiStatus,

      whatsappApiProvider,
      whatsappApiToken,
      whatsappPhoneNumberId,
      whatsappBusinessNumber,
      autoSendInvoiceWhatsApp,
      autoSendJobCardUpdatesWhatsApp,

      emailApiProvider,
      emailSmtpHost,
      emailSmtpPort: parseInt(emailSmtpPort) || 587,
      emailSmtpUser,
      emailSmtpPassword,
      emailFromAddress,
      autoEmailInvoiceReceipts,

      invoicePrefix,
      repairJobCardPrefix,
      invoiceHeaderTitle,
      invoiceHeaderNote,
      customInvoiceFooterNote,
      termsAndConditions,
      returnPolicyText,
      authorizedSignatoryName,
      showShopLogoOnInvoice,
      showQrCodeOnInvoice,
      invoiceThemeColor,

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
    a.download = `mobile_world_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
  };

  return (
    <div id="settings-module-container" className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Store Configuration & Integration Settings</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure site branding, payment gateways, WhatsApp business messaging, email server, and invoice headers.
          </p>
        </div>

        {saveToast && (
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All Settings Saved Successfully!
          </div>
        )}
      </div>

      {/* Sub-Tabs Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'site_info', label: 'Site Information', icon: Store },
          { id: 'import_data', label: 'Import Data', icon: Upload },
          { id: 'backup_restore', label: 'Backup & Restore', icon: HardDrive },
          { id: 'payment_gateway', label: 'Payment Gateway', icon: CreditCard },
          { id: 'whatsapp_api', label: 'WhatsApp API', icon: MessageSquare },
          { id: 'email_api', label: 'Email API', icon: Mail },
          { id: 'invoice_headers', label: 'Invoice Headers', icon: FileText },
          { id: 'api_dev', label: 'API & Dev Keys', icon: Code },
          { id: 'mysql_database', label: 'MySQL Database (.SQL)', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* TAB 1: SITE INFORMATION */}
        {activeTab === 'site_info' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-400" />
                <span>Site Information & Business Profile</span>
              </h3>
              <span className="text-xs text-slate-400">Used for bills, storefront & SMS headers</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Mobile Store Name *</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Store Tagline / Subtitle</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Website Domain URL</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://mobileworldcare.com"
                />
              </div>

              {/* Theme Preference Option */}
              <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                    {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span>UI Theme Preference (Light / Dark Mode)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Applies light theme or dark theme across all modules, tables, cards, popups, and dialogs.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold text-xs">Branding Logo Selection & Image URL</label>
                  <label className="flex items-center gap-2 text-[11px] text-indigo-400 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showShopLogoOnInvoice}
                      onChange={(e) => setShowShopLogoOnInvoice(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4 rounded"
                    />
                    <span>Print Logo on PDF Invoices & Receipts</span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 relative group">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store Logo" className="w-full h-full object-contain p-1" />
                    ) : (
                      <Smartphone className="w-8 h-8 text-indigo-400" />
                    )}
                  </div>

                  {/* Input & Upload button */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="flex-1 bg-slate-900 text-slate-100 px-3.5 py-2 rounded-lg border border-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
                        placeholder="https://domain.com/logo.png or Upload File"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo File</span>
                      </button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 overflow-x-auto text-[10px]">
                      <span className="text-slate-400 font-semibold shrink-0">Sample Presets:</span>
                      {[
                        { name: 'Tech Shield', url: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Repair Emblem', url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Smart Mobile', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80' },
                        { name: 'Gadget Seal', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=300&q=80' }
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setLogoUrl(preset.url)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md font-medium transition shrink-0 cursor-pointer"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1.5 font-semibold">Full Physical Store Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Official Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Official Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Support Helpline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Support Helpdesk Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">GSTIN / Business Tax Registration No.</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Currency Symbol & Tax Rate (%)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-20 bg-slate-950 text-slate-100 px-3 py-2.5 rounded-xl border border-slate-800 font-bold text-center"
                  />
                  <input
                    type="number"
                    value={taxRatePercent}
                    onChange={(e) => setTaxRatePercent(e.target.value)}
                    className="flex-1 bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                    placeholder="18"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer font-semibold text-xs">
                <input
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={(e) => setTaxInclusive(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 rounded"
                />
                <span>Default Item Display Prices are GST-Inclusive (Calculated automatically at checkout)</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT GATEWAY */}
        {activeTab === 'payment_gateway' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span>Online Payment Gateway Credentials</span>
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                paymentGatewayMode === 'Live Production' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {paymentGatewayMode}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Enable instant online checkout for e-commerce orders, customer UPI QR dynamic code generation, and debit card swipe terminals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Payment Gateway Provider</label>
                <select
                  value={paymentGatewayProvider}
                  onChange={(e) => setPaymentGatewayProvider(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Razorpay">Razorpay (UPI / Cards / NetBanking / EMI)</option>
                  <option value="PhonePe">PhonePe Business Payment Gateway</option>
                  <option value="Paytm">Paytm Merchant PG & QR</option>
                  <option value="Stripe">Stripe International Payments</option>
                  <option value="Offline Cash/UPI">Offline Counter Cash & Manual UPI Only</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Environment Mode</label>
                <select
                  value={paymentGatewayMode}
                  onChange={(e) => setPaymentGatewayMode(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Test Sandbox">Test Sandbox / Demo API</option>
                  <option value="Live Production">Live Production (Real Transactions)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Key ID / Public API Client Key</label>
                <input
                  type="text"
                  value={paymentGatewayKeyId}
                  onChange={(e) => setPaymentGatewayKeyId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="rzp_test_xxxxxx"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Key Secret / Webhook Signing Secret</label>
                <input
                  type="password"
                  value={paymentGatewaySecretKey}
                  onChange={(e) => setPaymentGatewaySecretKey(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="••••••••••••••••••••"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Merchant ID / Account ID</label>
                <input
                  type="text"
                  value={paymentGatewayMerchantId}
                  onChange={(e) => setPaymentGatewayMerchantId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="MERCHANT_MWC_001"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={autoVerifyUpiStatus}
                    onChange={(e) => setAutoVerifyUpiStatus(e.target.checked)}
                    className="accent-indigo-500 w-4 h-4 rounded"
                  />
                  <span>Auto-Verify UPI Payment Status via Webhook Instant Polling</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP API */}
        {activeTab === 'whatsapp_api' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>WhatsApp Business Messaging API Integration</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Active
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Automatically send GST digital invoices, IMEI warranty bills, and job card status alerts to customer WhatsApp numbers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">WhatsApp API Provider Service</label>
                <select
                  value={whatsappApiProvider}
                  onChange={(e) => setWhatsappApiProvider(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Meta Cloud API">Meta WhatsApp Cloud API (Official)</option>
                  <option value="Twilio WhatsApp">Twilio Programmable WhatsApp API</option>
                  <option value="WATI Gateway">WATI WhatsApp Business Gateway</option>
                  <option value="Custom Webhook">Custom Local Node.js WhatsApp Bot Webhook</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Store Official WhatsApp Business Number</label>
                <input
                  type="text"
                  value={whatsappBusinessNumber}
                  onChange={(e) => setWhatsappBusinessNumber(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="+919876543210"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Phone Number ID (Meta Graph API)</label>
                <input
                  type="text"
                  value={whatsappPhoneNumberId}
                  onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="109283719283712"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Permanent Access Token / Bearer Token</label>
                <input
                  type="password"
                  value={whatsappApiToken}
                  onChange={(e) => setWhatsappApiToken(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="EAAGxxxxxxxxxxxxxxx"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={autoSendInvoiceWhatsApp}
                  onChange={(e) => setAutoSendInvoiceWhatsApp(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <span>Auto-Send WhatsApp Invoice Link & PDF upon POS counter billing completion</span>
              </label>

              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={autoSendJobCardUpdatesWhatsApp}
                  onChange={(e) => setAutoSendJobCardUpdatesWhatsApp(e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 rounded"
                />
                <span>Auto-Send WhatsApp alerts when Repair Job Card status changes to "Ready for Pickup"</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: EMAIL API */}
        {activeTab === 'email_api' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>Email API & SMTP Server Setup</span>
              </h3>
              <span className="text-xs text-slate-400">Transactional Billing & Password Reset Emails</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Email Delivery Service Provider</label>
                <select
                  value={emailApiProvider}
                  onChange={(e) => setEmailApiProvider(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="SMTP">Standard Custom SMTP Server</option>
                  <option value="SendGrid">Twilio SendGrid API</option>
                  <option value="Resend">Resend Email API</option>
                  <option value="Mailgun">Mailgun Transactional Service</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Sender From Email Address</label>
                <input
                  type="email"
                  value={emailFromAddress}
                  onChange={(e) => setEmailFromAddress(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                  placeholder="billing@mobileworldcare.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">SMTP Host Server</label>
                <input
                  type="text"
                  value={emailSmtpHost}
                  onChange={(e) => setEmailSmtpHost(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="smtp.sendgrid.net"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">SMTP Port</label>
                <input
                  type="number"
                  value={emailSmtpPort}
                  onChange={(e) => setEmailSmtpPort(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="587"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">SMTP Username / API Key</label>
                <input
                  type="text"
                  value={emailSmtpUser}
                  onChange={(e) => setEmailSmtpUser(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="apikey"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">SMTP Secret Password</label>
                <input
                  type="password"
                  value={emailSmtpPassword}
                  onChange={(e) => setEmailSmtpPassword(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  placeholder="••••••••••••••••••••"
                />
              </div>
            </div>

            <div className="pt-2 text-xs">
              <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={autoEmailInvoiceReceipts}
                  onChange={(e) => setAutoEmailInvoiceReceipts(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 rounded"
                />
                <span>Automatically Email PDF Tax Invoice Receipts to Customer Email Addresses</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: INVOICE HEADERS & PRINT PDF CONFIGURATION */}
        {activeTab === 'invoice_headers' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Custom PDF Invoice Header, Footer & Branding Customization</span>
              </h3>
              <span className="text-xs text-slate-400">Controls layout & text on PDF bills and thermal receipts</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Document Header Title */}
              <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span>Custom Invoice Header Title & Accent Branding</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Document Title Header</label>
                    <input
                      type="text"
                      value={invoiceHeaderTitle}
                      onChange={(e) => setInvoiceHeaderTitle(e.target.value)}
                      className="w-full bg-slate-900 text-slate-100 px-3.5 py-2 rounded-lg border border-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                      placeholder="RETAIL TAX INVOICE & DIGITAL RECEIPT"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Invoice Theme Accent Color</label>
                    <div className="flex items-center gap-2 pt-0.5">
                      {[
                        { name: 'Indigo', color: '#4f46e5' },
                        { name: 'Emerald', color: '#059669' },
                        { name: 'Deep Slate', color: '#0f172a' },
                        { name: 'Crimson', color: '#e11d48' },
                        { name: 'Royal Blue', color: '#1d4ed8' },
                        { name: 'Amber', color: '#d97706' }
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setInvoiceThemeColor(c.color)}
                          className={`w-7 h-7 rounded-full border-2 transition cursor-pointer flex items-center justify-center ${
                            invoiceThemeColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        >
                          {invoiceThemeColor === c.color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-900">
                  <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showShopLogoOnInvoice}
                      onChange={(e) => setShowShopLogoOnInvoice(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4 rounded"
                    />
                    <span>Show Store Logo Image in PDF Header</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showQrCodeOnInvoice}
                      onChange={(e) => setShowQrCodeOnInvoice(e.target.checked)}
                      className="accent-indigo-500 w-4 h-4 rounded"
                    />
                    <span>Show Verification QR Code in PDF Footer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Tax Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono font-bold"
                  placeholder="INV-MWC-"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Repair Job Card Prefix</label>
                <input
                  type="text"
                  value={repairJobCardPrefix}
                  onChange={(e) => setRepairJobCardPrefix(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono font-bold"
                  placeholder="JC-MWC-"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1.5 font-semibold">Top Banner Header Subtitle / Slogan</label>
                <input
                  type="text"
                  value={invoiceHeaderNote}
                  onChange={(e) => setInvoiceHeaderNote(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                  placeholder="Authorized Sales, Express Mobile Service & Multi-Brand Accessories"
                />
              </div>

              {/* Custom Footer Section */}
              <div className="md:col-span-2 space-y-4 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Custom Footer & Legal Configuration</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1.5 font-semibold">Custom Footer Note / Support Line (PDF)</label>
                    <input
                      type="text"
                      value={customInvoiceFooterNote}
                      onChange={(e) => setCustomInvoiceFooterNote(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                      placeholder="Thank you for choosing Mobile World Care! Visit www.mobileworldcare.com for warranty tracking."
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5 font-semibold">Thermal Receipt Footer Thank You Message</label>
                    <input
                      type="text"
                      value={receiptFooterMessage}
                      onChange={(e) => setReceiptFooterMessage(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                      placeholder="Thank you for shopping with us! Standard warranty terms apply."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1.5 font-semibold">Terms & Conditions (Printed at Bottom)</label>
                    <textarea
                      rows={3}
                      value={termsAndConditions}
                      onChange={(e) => setTermsAndConditions(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1.5 font-semibold">Return & Replacement Guarantee Policy</label>
                    <textarea
                      rows={3}
                      value={returnPolicyText}
                      onChange={(e) => setReturnPolicyText(e.target.value)}
                      className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-semibold">Authorized Signatory Title</label>
                  <input
                    type="text"
                    value={authorizedSignatoryName}
                    onChange={(e) => setAuthorizedSignatoryName(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                    placeholder="Mobile World Store Manager"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Live Header & Footer Print Preview</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Sample PDF Render</span>
                </div>

                {/* Simulated Invoice Document Paper */}
                <div className="bg-white text-slate-900 p-4 rounded-lg shadow-md border border-slate-200 text-[11px] font-sans space-y-3">
                  {/* Header Box */}
                  <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: invoiceThemeColor }}>
                    <div className="flex items-start gap-3">
                      {showShopLogoOnInvoice && logoUrl && (
                        <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded border p-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="font-black text-sm flex items-center gap-1.5" style={{ color: invoiceThemeColor }}>
                          <span>{shopName || 'Mobile World Store'}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium">{tagline}</p>
                        <p className="text-[10px] text-slate-500">{address}</p>
                        {invoiceHeaderNote && (
                          <p className="text-[9px] font-semibold pt-1 italic" style={{ color: invoiceThemeColor }}>{invoiceHeaderNote}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right bg-slate-50 p-2 rounded border border-slate-200 min-w-[140px]">
                      <span className="font-black text-[9px] block uppercase" style={{ color: invoiceThemeColor }}>
                        {invoiceHeaderTitle}
                      </span>
                      <span className="font-mono font-bold text-xs">{invoicePrefix}2026-0042</span>
                      <div className="text-[9px] text-slate-500">Date: {new Date().toISOString().split('T')[0]}</div>
                    </div>
                  </div>

                  {/* Sample Item Table snippet */}
                  <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] flex justify-between font-mono">
                    <span>1x iPhone 15 Pro Max 256GB Titanium</span>
                    <span className="font-bold">₹1,34,900.00</span>
                  </div>

                  {/* Footer Box */}
                  <div className="border-t pt-2 space-y-1 text-[9px] text-slate-600 border-slate-200">
                    {customInvoiceFooterNote && (
                      <p className="font-semibold text-center italic" style={{ color: invoiceThemeColor }}>{customInvoiceFooterNote}</p>
                    )}
                    <div className="flex items-center justify-between text-[8px] text-slate-500 pt-1">
                      <div>
                        <p><strong>Terms:</strong> {termsAndConditions ? termsAndConditions.substring(0, 60) + '...' : 'Standard terms apply.'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{authorizedSignatoryName}</p>
                        <p className="text-[7px]">Authorized Signatory</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: API & DEVELOPER KEYS */}
        {activeTab === 'api_dev' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <span>REST API Endpoint & Developer Backend Setup</span>
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                demoApiMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {demoApiMode ? 'Mock Local State Active' : 'Production REST Mode'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              When ready to sync with an Express/Node backend service, switch to Production mode and set your base API credentials.
            </p>

            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-2.5 text-slate-200 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={demoApiMode}
                  onChange={(e) => setDemoApiMode(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <span>Enable Simulated Mock State (No external backend server required for demo)</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-semibold">REST API Base Endpoint URL</label>
                  <input
                    type="text"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 font-semibold">API Secret Bearer Token</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-400">
                <div className="text-amber-400 font-bold font-sans">Active REST Endpoint Endpoints:</div>
                <div>POST /api/v1/sales - Sync Counter POS Sales & IMEI Inventory</div>
                <div>POST /api/v1/tradein - Submit Device Evaluation & Credit Voucher</div>
                <div>GET /api/v1/catalog - Sync E-commerce & Storefront Inventory</div>
                <div>POST /api/v1/whatsapp/send - Trigger Customer WhatsApp Message</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: MYSQL DATABASE SCHEMA & EXPORT */}
        {activeTab === 'mysql_database' && (
          <DatabaseSchemaTab />
        )}

        {/* TAB 8: IMPORT DATA */}
        {activeTab === 'import_data' && (
          <ImportSettingsTab />
        )}

        {/* TAB 9: BACKUP & RESTORE */}
        {activeTab === 'backup_restore' && (
          <BackupRestoreSettingsTab />
        )}

        {/* Global Save Button */}
        {activeTab !== 'import_data' && activeTab !== 'backup_restore' && activeTab !== 'mysql_database' && (
          <button
            type="submit"
            id="save-settings-btn"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save All Settings & Configuration Changes</span>
          </button>
        )}

      </form>

    </div>
  );
};

