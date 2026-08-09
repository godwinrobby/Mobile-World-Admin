import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { PurchasesModule } from '../purchases/PurchasesModule';
import { RepairsModule } from '../repairs/RepairsModule';
import { PaymentsModule } from '../payments/PaymentsModule';
import {
  Package,
  ShoppingBag,
  Receipt,
  ShoppingCart,
  Truck,
  Wrench,
  ClipboardList,
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
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Filter
} from 'lucide-react';

interface Props {
  tab: ActiveTab;
}

export const GenericModuleView: React.FC<Props> = ({ tab }) => {
  const { settings, sales, products, customers, suppliers } = useApp();

  const renderModuleContent = () => {
    switch (tab) {
      case 'catalog':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  <span>Product Catalog & IMEI Inventory</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage smartphones, accessories, serial IMEIs, warranty specs, and stock levels.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                  {products.length} Products Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-800" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{p.brand}</span>
                      <h4 className="font-bold text-sm text-slate-100 truncate mt-1">{p.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">POS Price</span>
                      <div className="font-extrabold text-indigo-400">{settings.currencySymbol}{p.posPrice.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px]">Stock</span>
                      <div className={`font-extrabold ${p.stock > 3 ? 'text-emerald-400' : 'text-rose-400'}`}>{p.stock} Units</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'purchases':
        return <PurchasesModule />;

      case 'logistics':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-400" />
                  <span>Courier & Dispatch Logistics Center</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage online ecommerce orders, print shipping labels, and track BlueDart / Delhivery waybills.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Pending Pickups</span>
                <div className="text-2xl font-extrabold text-amber-400">3 Orders</div>
                <p className="text-[11px] text-slate-400">Awaiting courier handover</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">In Transit</span>
                <div className="text-2xl font-extrabold text-cyan-400">12 Waybills</div>
                <p className="text-[11px] text-slate-400">On the way to customers</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-semibold">Delivered Today</span>
                <div className="text-2xl font-extrabold text-emerald-400">8 Packages</div>
                <p className="text-[11px] text-slate-400">Proof of Delivery uploaded</p>
              </div>
            </div>
          </div>
        );

      case 'repairs':
      case 'jobcard':
        return <RepairsModule />;

      case 'payments':
        return <PaymentsModule />;

      case 'stores':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <span>Store Branches & Wholesaler Network</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage main showroom, branch outlets, and primary B2B phone distributors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map(s => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{s.companyName}</h4>
                    <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">{s.category}</span>
                  </div>
                  <p className="text-xs text-slate-400">Contact: {s.contactPerson} • {s.phone}</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Outstanding Wholesaler Khata:</span>
                    <span className="font-extrabold text-rose-400">{settings.currencySymbol}{s.currentPayable.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <span>Customer Directory & CRM</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Customer contact directory, credit limits, purchase histories, and WhatsApp reminders.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Registered Customer Accounts ({customers.length})</h3>
              <div className="space-y-2">
                {customers.map(c => (
                  <div key={c.id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-100">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${c.currentBalance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {settings.currencySymbol}{c.currentBalance.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.currentBalance > 0 ? 'Udhar Balance' : 'Clean Account'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cms':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span>Ecommerce Storefront Content Manager (CMS)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Update promotional hero banners, festival discount tags, and featured smartphone carousels.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Active Online Store Banners</h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-indigo-400">Festive Season Mobile Mela Banner</div>
                  <div className="text-slate-400 text-[11px]">Up to ₹10,000 Exchange Bonus on iPhone 15 & S24 Series</div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold text-[10px]">Live on Storefront</span>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>Sales, GST & Profit Reports</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Export GST B2C summary, product-wise profit margins, and monthly counter sales statements.
                </p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow">
                <Download className="w-4 h-4" /> Download GST Return (.CSV)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400">Total GST Output Collected</span>
                <div className="text-xl font-extrabold text-indigo-400">{settings.currencySymbol}24,642</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400">Net Counter Gross Margin</span>
                <div className="text-xl font-extrabold text-emerald-400">14.8% Average</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400">Total Invoices Generated</span>
                <div className="text-xl font-extrabold text-slate-100">{sales.length} Tax Invoices</div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span>Staff & Cashier Role Permissions</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage staff log-in PINs, cashier access, technician roles, and store admin rights.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <div className="font-bold text-slate-100">Store Manager (Admin)</div>
                  <div className="text-[10px] text-slate-400">Full access to settings, sales, and khata ledgers</div>
                </div>
                <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded text-[10px]">Admin Access</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <div className="font-bold text-slate-100">Counter Cashier</div>
                  <div className="text-[10px] text-slate-400">POS billing, cash collection, and customer search</div>
                </div>
                <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded text-[10px]">Cashier Access</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id={`module-view-${tab}`}>
      {renderModuleContent()}
    </div>
  );
};
