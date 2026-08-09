import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TradeInExchange, ConditionChecklist, ExchangeGrade } from '../../types';
import {
  RefreshCw,
  Smartphone,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Award,
  DollarSign,
  Tag,
  User,
  Phone,
  FileCheck,
  Zap,
  Sparkles,
  Plus
} from 'lucide-react';

export const ExchangeModule: React.FC = () => {
  const { createExchange, exchanges, updateExchangeStatus, settings } = useApp();

  // Form State for new trade-in valuation
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [govtId, setGovtId] = useState('');

  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 13');
  const [storageColor, setStorageColor] = useState('128GB Midnight');
  const [imei, setImei] = useState('');

  // Checklist
  const [condition, setCondition] = useState<ConditionChecklist>({
    screenOk: true,
    screenCondition: 'No Scratch',
    bodyCondition: 'Flawless',
    batteryHealth: 88,
    cameraOk: true,
    biometricsOk: true,
    callingOk: true,
    wifiOk: true,
    boxAvailable: true,
    originalChargerAvailable: true,
    billAvailable: true
  });

  const [baseMarketValue, setBaseMarketValue] = useState<number>(32000);
  const [customValueOverride, setCustomValueOverride] = useState<string>('');
  const [actionChoice, setActionChoice] = useState<TradeInExchange['actionTaken']>('Store Credit Voucher');
  const [notes, setNotes] = useState('');

  // Calculate Valuation & Grade
  const calculateValuation = () => {
    let penalty = 0;

    // Screen
    if (condition.screenCondition === 'Minor Scratch') penalty += 2000;
    if (condition.screenCondition === 'Cracked') penalty += 7000;
    if (condition.screenCondition === 'Display Bleed') penalty += 10000;

    // Body
    if (condition.bodyCondition === 'Light Scratches') penalty += 1500;
    if (condition.bodyCondition === 'Dented / Bent') penalty += 4000;
    if (condition.bodyCondition === 'Broken Back') penalty += 6000;

    // Battery
    if (condition.batteryHealth < 80) penalty += 3000;

    // Functions
    if (!condition.cameraOk) penalty += 3000;
    if (!condition.biometricsOk) penalty += 2500;
    if (!condition.callingOk) penalty += 4000;
    if (!condition.wifiOk) penalty += 2000;

    // Box/Accessories bonus
    let bonus = 0;
    if (condition.boxAvailable) bonus += 500;
    if (condition.originalChargerAvailable) bonus += 500;
    if (condition.billAvailable) bonus += 1000;

    const netVal = Math.max(1000, baseMarketValue - penalty + bonus);
    return Math.round(netVal / 100) * 100; // round to hundreds
  };

  const calculatedVal = calculateValuation();
  const finalAgreedVal = customValueOverride !== '' ? parseFloat(customValueOverride) : calculatedVal;

  const determineGrade = (): ExchangeGrade => {
    if (condition.screenCondition === 'No Scratch' && condition.bodyCondition === 'Flawless' && condition.batteryHealth >= 85) {
      return 'Grade A (Flawless)';
    } else if (condition.screenCondition === 'Minor Scratch' || condition.bodyCondition === 'Light Scratches') {
      return 'Grade B (Minor Wear)';
    } else if (condition.screenCondition === 'Cracked' || condition.bodyCondition === 'Dented / Bent') {
      return 'Grade C (Scratched/Dent)';
    } else {
      return 'Grade D (Damaged)';
    }
  };

  const grade = determineGrade();

  // Submit Trade-In
  const handleValuationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei) {
      alert('Please enter IMEI number for tracking!');
      return;
    }

    const voucher = actionChoice === 'Store Credit Voucher' ? `VOUCHER-EX${Math.floor(10 + Math.random() * 90)}K` : undefined;

    const record = createExchange({
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || 'N/A',
      customerGovtId: govtId || 'N/A',
      deviceBrand: brand,
      deviceModel: model,
      storageColor,
      imeiNumber: imei,
      condition,
      calculatedValue: calculatedVal,
      agreedValue: finalAgreedVal,
      grade,
      actionTaken: actionChoice,
      voucherCode: voucher,
      isVoucherUsed: false,
      status: actionChoice === 'Added to Refurbish Stock' ? 'In Refurbish' : 'Completed',
      inspectorStaff: 'On Duty Manager',
      notes
    });

    alert(`Trade-In Created! Voucher Code: ${voucher || 'N/A'}. Final Value: ${settings.currencySymbol}${finalAgreedVal.toLocaleString()}`);

    // Reset Form
    setImei('');
    setCustomValueOverride('');
    setNotes('');
  };

  return (
    <div id="exchange-module-container" className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <span>Used Device Trade-In & Buyback Inspection</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated market valuation, physical & electronic inspection checklist, store voucher creation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg font-medium">
            Grading Engine Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Device Valuation & Inspection Checklist Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <form onSubmit={handleValuationSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span>Trade-In Device Details & Inspection</span>
              </h3>
              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-lg">
                Step 1 of 2
              </span>
            </div>

            {/* Customer & Govt ID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amit Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Govt ID Proof (Aadhar/PAN)</label>
                <input
                  type="text"
                  placeholder="ID Number for record"
                  value={govtId}
                  onChange={(e) => setGovtId(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Device Info */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-800">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Realme">Realme</option>
                  <option value="Google Pixel">Google Pixel</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro / S22 Ultra"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Storage & Color</label>
                <input
                  type="text"
                  placeholder="e.g. 128GB Blue"
                  value={storageColor}
                  onChange={(e) => setStorageColor(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Device IMEI Number *</label>
                <input
                  type="text"
                  placeholder="15-digit IMEI"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full bg-slate-800 text-cyan-300 font-mono font-semibold px-3 py-2 rounded-xl border border-slate-700"
                  required
                />
              </div>
            </div>

            {/* Multi-Point Condition Inspection */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="font-semibold text-slate-200 text-xs flex items-center justify-between">
                <span>Multi-Point Condition Checklist</span>
                <span className="text-[10px] text-cyan-400">Affects Valuation Calculation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Screen condition */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <label className="text-slate-300 font-medium block">Display & Screen Condition</label>
                  <select
                    value={condition.screenCondition}
                    onChange={(e) => setCondition({ ...condition, screenCondition: e.target.value as any })}
                    className="w-full bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700"
                  >
                    <option value="No Scratch">No Scratch (Flawless Display)</option>
                    <option value="Minor Scratch">Minor Scratch (-{settings.currencySymbol}2,000)</option>
                    <option value="Cracked">Cracked Glass (-{settings.currencySymbol}7,000)</option>
                    <option value="Display Bleed">Display Lines / Bleed (-{settings.currencySymbol}10,000)</option>
                  </select>
                </div>

                {/* Body condition */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                  <label className="text-slate-300 font-medium block">Body & Frame Condition</label>
                  <select
                    value={condition.bodyCondition}
                    onChange={(e) => setCondition({ ...condition, bodyCondition: e.target.value as any })}
                    className="w-full bg-slate-900 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700"
                  >
                    <option value="Flawless">Flawless (No Dents)</option>
                    <option value="Light Scratches">Light Scratches (-{settings.currencySymbol}1,500)</option>
                    <option value="Dented / Bent">Dented Corners / Bent (-{settings.currencySymbol}4,000)</option>
                    <option value="Broken Back">Broken Back Glass (-{settings.currencySymbol}6,000)</option>
                  </select>
                </div>
              </div>

              {/* Battery Health & Functional Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">
                    Battery Health: <strong>{condition.batteryHealth}%</strong>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={condition.batteryHealth}
                    onChange={(e) => setCondition({ ...condition, batteryHealth: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition.cameraOk}
                      onChange={(e) => setCondition({ ...condition, cameraOk: e.target.checked })}
                      className="accent-cyan-500"
                    />
                    <span>Camera Working</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition.biometricsOk}
                      onChange={(e) => setCondition({ ...condition, biometricsOk: e.target.checked })}
                      className="accent-cyan-500"
                    />
                    <span>Face ID / Touch ID</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition.callingOk}
                      onChange={(e) => setCondition({ ...condition, callingOk: e.target.checked })}
                      className="accent-cyan-500"
                    />
                    <span>SIM & Network Calls</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={condition.wifiOk}
                      onChange={(e) => setCondition({ ...condition, wifiOk: e.target.checked })}
                      className="accent-cyan-500"
                    />
                    <span>Wi-Fi & Bluetooth</span>
                  </label>
                </div>
              </div>

              {/* Box & Original Accessories */}
              <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <span className="font-medium text-slate-300">Box & Bill Availability:</span>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={condition.boxAvailable}
                    onChange={(e) => setCondition({ ...condition, boxAvailable: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>Original Box</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={condition.originalChargerAvailable}
                    onChange={(e) => setCondition({ ...condition, originalChargerAvailable: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>Original Charger</span>
                </label>
                <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={condition.billAvailable}
                    onChange={(e) => setCondition({ ...condition, billAvailable: e.target.checked })}
                    className="accent-cyan-500"
                  />
                  <span>Original Tax Invoice</span>
                </label>
              </div>

            </div>

            {/* Base Market Benchmark Adjustment */}
            <div className="pt-3 border-t border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Base Market Valuation Benchmark:</span>
                <input
                  type="number"
                  value={baseMarketValue}
                  onChange={(e) => setBaseMarketValue(parseFloat(e.target.value) || 0)}
                  className="w-32 bg-slate-800 text-right text-slate-100 font-bold px-2 py-1 rounded-lg border border-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/20 transition active:scale-95"
            >
              Confirm Valuation & Issue Trade-In Record
            </button>

          </form>
        </div>

        {/* Right Column: Calculated Valuation Card & Action Choice */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          
          {/* Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="text-center space-y-1 pb-3 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Automated Assessment Result</span>
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {settings.currencySymbol}{finalAgreedVal.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  grade.startsWith('Grade A') ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  grade.startsWith('Grade B') ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                  'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {grade}
                </span>
              </div>
            </div>

            {/* Custom Override input */}
            <div className="text-xs space-y-1">
              <label className="text-slate-300 block font-semibold">Custom Valuation Override ({settings.currencySymbol})</label>
              <input
                type="number"
                placeholder={`Calculated: ${calculatedVal}`}
                value={customValueOverride}
                onChange={(e) => setCustomValueOverride(e.target.value)}
                className="w-full bg-slate-800 text-cyan-300 font-bold px-3 py-2 rounded-xl border border-slate-700"
              />
            </div>

            {/* Action Choice Selector */}
            <div className="text-xs space-y-2 pt-2 border-t border-slate-800">
              <label className="text-slate-300 block font-semibold">Trade-In Payout Method</label>
              
              <div className="space-y-2">
                {[
                  { id: 'Store Credit Voucher', label: 'Store Credit Voucher (For POS)', desc: 'Generates redeemable coupon code' },
                  { id: 'Cash Paid', label: 'Cash / UPI Direct Payout', desc: 'Direct cash given to customer' },
                  { id: 'Added to Refurbish Stock', label: 'Add to Refurbished Inventory', desc: 'Auto-creates resale product (+25% margin)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActionChoice(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl border text-left transition ${
                      actionChoice === opt.id
                        ? 'bg-cyan-600/20 text-cyan-200 border-cyan-500'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Trade-In History Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <span>Exchange & Buyback History</span>
            </h3>
            <p className="text-xs text-slate-400">All evaluated devices with voucher codes & refurbish tracking.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Code / Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Device & IMEI</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Agreed Value</th>
                <th className="p-3">Action / Voucher</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {exchanges.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3">
                    <div className="font-mono font-bold text-cyan-300">{ex.exchangeCode}</div>
                    <div className="text-[10px] text-slate-400">{ex.timestamp}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{ex.customerName}</div>
                    <div className="text-[10px] text-slate-400">{ex.customerPhone}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-200">{ex.deviceBrand} {ex.deviceModel}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">IMEI: {ex.imeiNumber}</div>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {ex.grade}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-400">
                    {settings.currencySymbol}{ex.agreedValue.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-200">{ex.actionTaken}</div>
                    {ex.voucherCode && (
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60 inline-block mt-0.5">
                        {ex.voucherCode}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ex.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {ex.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
