import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShopSettings } from '../../types';
import {
  Settings,
  Store,
  Receipt,
  CreditCard,
  MessageSquare,
  Mail,
  FileText,
  Code,
  Users,
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
  Check
} from 'lucide-react';

type SettingsTab = 'site_info' | 'payment_gateway' | 'whatsapp_api' | 'email_api' | 'invoice_headers' | 'api_dev' | 'staff_data';

export const SettingsModule: React.FC = () => {
  const { settings, updateSettings, resetAllData, users, products, sales, exchanges, customers } = useApp();

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
  const [invoiceHeaderNote, setInvoiceHeaderNote] = useState(settings.invoiceHeaderNote || '');
  const [termsAndConditions, setTermsAndConditions] = useState(settings.termsAndConditions || '');
  const [returnPolicyText, setReturnPolicyText] = useState(settings.returnPolicyText || '');
  const [receiptFooterMessage, setReceiptFooterMessage] = useState(settings.receiptFooterMessage || '');
  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState(settings.authorizedSignatoryName || '');

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
      invoiceHeaderNote,
      termsAndConditions,
      returnPolicyText,
      authorizedSignatoryName,

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
          { id: 'payment_gateway', label: 'Payment Gateway', icon: CreditCard },
          { id: 'whatsapp_api', label: 'WhatsApp API', icon: MessageSquare },
          { id: 'email_api', label: 'Email API', icon: Mail },
          { id: 'invoice_headers', label: 'Invoice Headers', icon: FileText },
          { id: 'api_dev', label: 'API & Dev Keys', icon: Code },
          { id: 'staff_data', label: 'Staff & Data Tools', icon: Users }
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

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Store Logo Image URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="https://domain.com/logo.png"
                />
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

        {/* TAB 5: INVOICE HEADERS & LEGAL */}
        {activeTab === 'invoice_headers' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Invoice Headers, Warranty Terms & Signatures</span>
              </h3>
              <span className="text-xs text-slate-400">Printed on thermal receipts and PDF invoices</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                <label className="block text-slate-300 mb-1.5 font-semibold">Top Banner Header Note</label>
                <input
                  type="text"
                  value={invoiceHeaderNote}
                  onChange={(e) => setInvoiceHeaderNote(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                  placeholder="Authorized Multi-Brand Smartphone Sales & Express Service Center"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1.5 font-semibold">Terms & Conditions (Printed at Bottom of Bill)</label>
                <textarea
                  rows={3}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1.5 font-semibold">Return & Exchange Guarantee Policy</label>
                <textarea
                  rows={2}
                  value={returnPolicyText}
                  onChange={(e) => setReturnPolicyText(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Thermal Receipt Footer Message</label>
                <input
                  type="text"
                  value={receiptFooterMessage}
                  onChange={(e) => setReceiptFooterMessage(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-semibold">Authorized Signatory Title</label>
                <input
                  type="text"
                  value={authorizedSignatoryName}
                  onChange={(e) => setAuthorizedSignatoryName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
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

        {/* TAB 7: STAFF & DATA TOOLS */}
        {activeTab === 'staff_data' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff Accounts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Active Staff & Access Roles</span>
              </h3>

              <div className="space-y-3 text-xs">
                {users.map((u) => (
                  <div key={u.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-100">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                    </div>

                    <span className={`font-bold px-2.5 py-1 rounded-lg text-[10px] ${
                      u.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Tools */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>Database Backup & Demo Reset</span>
              </h3>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Download Full JSON Database Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to restore pristine sample smartphones, sales, and ledger data?')) {
                      resetAllData();
                      alert('Demo data restored successfully!');
                    }
                  }}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-rose-400" />
                  <span>Reset Demo Sample Data</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <button
          type="submit"
          id="save-settings-btn"
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Save All Settings & Configuration Changes</span>
        </button>

      </form>

    </div>
  );
};

