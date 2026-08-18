import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TradeInExchange, ConditionChecklist, ExchangeGrade, DamageItem } from '../../types';
import {
  RefreshCw,
  Smartphone,
  CheckCircle2,
  XCircle,
  Tag,
  FileCheck,
  Plus,
  Trash2,
  Wrench,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Layers,
  DollarSign,
  Info,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import { BRAND_CATALOG } from './BrandLogos';

// Step 1: Brands Catalog
const BRANDS = BRAND_CATALOG;

// Step 2: Brand -> Model Database with Default Market Benchmark Values
const BRANDS_AND_MODELS: Record<string, { name: string; baseValue: number }[]> = {
  'Apple': [
    { name: 'iPhone 15 Pro Max', baseValue: 88000 },
    { name: 'iPhone 15 Pro', baseValue: 76000 },
    { name: 'iPhone 15 Plus', baseValue: 58000 },
    { name: 'iPhone 15', baseValue: 52000 },
    { name: 'iPhone 14 Pro Max', baseValue: 68000 },
    { name: 'iPhone 14 Pro', baseValue: 59000 },
    { name: 'iPhone 14 Plus', baseValue: 46000 },
    { name: 'iPhone 14', baseValue: 42000 },
    { name: 'iPhone 13 Pro Max', baseValue: 52000 },
    { name: 'iPhone 13 Pro', baseValue: 45000 },
    { name: 'iPhone 13', baseValue: 34000 },
    { name: 'iPhone 13 mini', baseValue: 28000 },
    { name: 'iPhone 12 Pro Max', baseValue: 38000 },
    { name: 'iPhone 12', baseValue: 26000 },
    { name: 'iPhone 11', baseValue: 18000 },
    { name: 'iPhone SE (3rd Gen)', baseValue: 16000 }
  ],
  'Samsung': [
    { name: 'Galaxy S24 Ultra', baseValue: 82000 },
    { name: 'Galaxy S24+', baseValue: 62000 },
    { name: 'Galaxy S24', baseValue: 48000 },
    { name: 'Galaxy S23 Ultra', baseValue: 58000 },
    { name: 'Galaxy S23', baseValue: 38000 },
    { name: 'Galaxy S22 Ultra', baseValue: 42000 },
    { name: 'Galaxy Z Fold5', baseValue: 72000 },
    { name: 'Galaxy Z Flip5', baseValue: 42000 },
    { name: 'Galaxy A55 5G', baseValue: 22000 },
    { name: 'Galaxy A35 5G', baseValue: 17000 },
    { name: 'Galaxy M34 5G', baseValue: 11000 }
  ],
  'OnePlus': [
    { name: 'OnePlus 12', baseValue: 48000 },
    { name: 'OnePlus 12R', baseValue: 32000 },
    { name: 'OnePlus 11 5G', baseValue: 34000 },
    { name: 'OnePlus 11R 5G', baseValue: 24000 },
    { name: 'OnePlus 10 Pro', baseValue: 26000 },
    { name: 'OnePlus 10', baseValue: 22000 },
    { name: 'OnePlus Nord 3 5G', baseValue: 18000 },
    { name: 'OnePlus Nord CE 3', baseValue: 14000 }
  ],
  'Xiaomi': [
    { name: 'Xiaomi 14 Ultra', baseValue: 72000 },
    { name: 'Xiaomi 14', baseValue: 48000 },
    { name: 'Xiaomi 13 Pro', baseValue: 38000 },
    { name: 'Redmi Note 13 Pro+ 5G', baseValue: 19000 },
    { name: 'Redmi Note 13 Pro', baseValue: 15000 },
    { name: 'Redmi Note 12 5G', baseValue: 10000 },
    { name: 'POCO X6 Pro 5G', baseValue: 18000 },
    { name: 'POCO F5 5G', baseValue: 16000 }
  ],
  'Vivo': [
    { name: 'Vivo X100 Pro', baseValue: 62000 },
    { name: 'Vivo X90 Pro', baseValue: 42000 },
    { name: 'Vivo V30 Pro', baseValue: 28000 },
    { name: 'Vivo V29 5G', baseValue: 20000 },
    { name: 'Vivo T2 Pro 5G', baseValue: 15000 },
    { name: 'Vivo Y200 5G', baseValue: 12000 }
  ],
  'Oppo': [
    { name: 'Oppo Find N3 Flip', baseValue: 54000 },
    { name: 'Oppo Reno 11 Pro 5G', baseValue: 27000 },
    { name: 'Oppo Reno 10 Pro+ 5G', baseValue: 29000 },
    { name: 'Oppo F25 Pro 5G', baseValue: 17000 },
    { name: 'Oppo A79 5G', baseValue: 11000 }
  ],
  'Realme': [
    { name: 'Realme 12 Pro+ 5G', baseValue: 22000 },
    { name: 'Realme 12+ 5G', baseValue: 15000 },
    { name: 'Realme GT 2 Pro', baseValue: 21000 },
    { name: 'Realme 11 Pro+ 5G', baseValue: 16000 },
    { name: 'Realme Narzo 60 Pro', baseValue: 13000 }
  ],
  'Google Pixel': [
    { name: 'Google Pixel 8 Pro', baseValue: 58000 },
    { name: 'Google Pixel 8', baseValue: 42000 },
    { name: 'Google Pixel 7a', baseValue: 22000 },
    { name: 'Google Pixel 7 Pro', baseValue: 34000 },
    { name: 'Google Pixel 6a', baseValue: 15000 }
  ],
  'Motorola': [
    { name: 'Motorola Razr 40 Ultra', baseValue: 46000 },
    { name: 'Motorola Edge 50 Pro', baseValue: 26000 },
    { name: 'Motorola Edge 40 Neo', baseValue: 16000 },
    { name: 'Motorola Moto G84 5G', baseValue: 11000 }
  ],
  'Nothing': [
    { name: 'Nothing Phone (2)', baseValue: 28000 },
    { name: 'Nothing Phone (2a)', baseValue: 18000 },
    { name: 'Nothing Phone (1)', baseValue: 16000 }
  ],
  'Other': [
    { name: 'Generic Smartphone Model', baseValue: 15000 }
  ]
};

// Step 3: All 18 Exact Predefined Damage Types & Deductions
export interface DamageCatalogItem {
  id: string;
  category: 'Display & Screen' | 'Body & Frame' | 'Battery & Charging' | 'Camera & Biometrics' | 'Audio & Network' | 'Hardware & Liquid';
  type: string;
  defaultDeduction: number;
}

const PRESET_DAMAGE_CATALOG: DamageCatalogItem[] = [
  // Display & Screen
  { id: 'screen_cracked', category: 'Display & Screen', type: 'Screen Outer Glass Cracked / Shattered', defaultDeduction: 4500 },
  { id: 'screen_touch', category: 'Display & Screen', type: 'Touch Screen Unresponsive / Ghost Touch', defaultDeduction: 6000 },
  { id: 'screen_bleed', category: 'Display & Screen', type: 'Display Lines / Black Spots / Bleed / OLED Burn', defaultDeduction: 8500 },

  // Body & Frame
  { id: 'back_glass', category: 'Body & Frame', type: 'Back Glass / Rear Housing Broken', defaultDeduction: 3500 },
  { id: 'frame_dented', category: 'Body & Frame', type: 'Metal Frame Dented / Bent Corners', defaultDeduction: 2500 },
  { id: 'heavy_scratches', category: 'Body & Frame', type: 'Heavy Scratches / Paint Peeling', defaultDeduction: 1500 },

  // Battery & Charging
  { id: 'battery_degraded', category: 'Battery & Charging', type: 'Battery Health Degraded (<80%) / Rapid Drain', defaultDeduction: 2500 },
  { id: 'battery_swollen', category: 'Battery & Charging', type: 'Battery Swollen / Bulging Back Panel', defaultDeduction: 3500 },
  { id: 'charging_port', category: 'Battery & Charging', type: 'Charging Port Loose / Defective / No Power', defaultDeduction: 1800 },

  // Camera & Biometrics
  { id: 'camera_blur', category: 'Camera & Biometrics', type: 'Rear Camera Blur / OIS Shaking / Dust Inside Lens', defaultDeduction: 3500 },
  { id: 'camera_lens', category: 'Camera & Biometrics', type: 'Camera Outer Glass Lens Cracked', defaultDeduction: 1200 },
  { id: 'front_cam_faceid', category: 'Camera & Biometrics', type: 'Front Camera / Face ID / Touch ID Defect', defaultDeduction: 3000 },

  // Audio & Network
  { id: 'speaker_mic', category: 'Audio & Network', type: 'Speaker Crackling / Mic Distorted / Ear Piece Low', defaultDeduction: 1500 },
  { id: 'sim_network', category: 'Audio & Network', type: 'SIM Reader / No Network Signal / Baseband Defect', defaultDeduction: 4000 },
  { id: 'wifi_bt', category: 'Audio & Network', type: 'Wi-Fi / Bluetooth / GPS Hardware Fault', defaultDeduction: 2200 },

  // Hardware & Liquid
  { id: 'liquid_damage', category: 'Hardware & Liquid', type: 'Water / Moisture Contact Exposure', defaultDeduction: 6500 },
  { id: 'power_volume_keys', category: 'Hardware & Liquid', type: 'Power Button / Volume Keys Sticking or Faulty', defaultDeduction: 1200 },
  { id: 'motherboard_ic', category: 'Hardware & Liquid', type: 'Motherboard IC Fault / Random Restarts', defaultDeduction: 9000 }
];

export const ExchangeModule: React.FC = () => {
  const { createExchange, exchanges, settings } = useApp();

  // Workflow State: Step 1 -> Step 2 -> Step 3 -> Step 4
  const [activeStep, setActiveStep] = useState<number>(1);

  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [govtId, setGovtId] = useState('');

  // Step 1: Selected Brand
  const [brand, setBrand] = useState<string>('Apple');

  // Step 2: Selected Model & Config
  const [model, setModel] = useState<string>('iPhone 13 Pro');
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);
  const [storageColor, setStorageColor] = useState<string>('128GB Sierra Blue');
  const [imei, setImei] = useState<string>('358921048291048');
  const [baseMarketValue, setBaseMarketValue] = useState<number>(45000);

  // Accessories Checklist Bonuses
  const [boxAvailable, setBoxAvailable] = useState<boolean>(true);
  const [chargerAvailable, setChargerAvailable] = useState<boolean>(true);
  const [billAvailable, setBillAvailable] = useState<boolean>(true);

  // Step 3: Selected Damages List (starts with 1 item for immediate calculation preview)
  const [selectedDamages, setSelectedDamages] = useState<DamageItem[]>([
    {
      id: 'damage-screen_cracked',
      category: 'Display & Screen',
      damageType: 'Screen Outer Glass Cracked / Shattered',
      deductionValue: 4500
    }
  ]);

  // Custom Damage Form State
  const [customDamageName, setCustomDamageName] = useState<string>('');
  const [customDamageValue, setCustomDamageValue] = useState<string>('');
  const [customDamageCategory, setCustomDamageCategory] = useState<DamageItem['category']>('Display & Screen');

  // Step 4: Final Payout Options & Override
  const [customValueOverride, setCustomValueOverride] = useState<string>('');
  const [actionChoice, setActionChoice] = useState<TradeInExchange['actionTaken']>('Store Credit Voucher');
  const [notes, setNotes] = useState<string>('');

  // Handle Step 1 Brand Selection
  const handleSelectBrand = (selectedBrand: string) => {
    setBrand(selectedBrand);
    const brandModels = BRANDS_AND_MODELS[selectedBrand] || BRANDS_AND_MODELS['Other'];
    if (brandModels && brandModels.length > 0) {
      setModel(brandModels[0].name);
      setBaseMarketValue(brandModels[0].baseValue);
      setIsCustomModel(false);
    } else {
      setModel('Custom Model');
      setIsCustomModel(true);
      setBaseMarketValue(15000);
    }
  };

  // Handle Step 2 Model Selection
  const handleSelectModel = (selectedModelName: string, value?: number) => {
    if (selectedModelName === 'CUSTOM') {
      setIsCustomModel(true);
      setModel(customModelInput || 'Custom Model');
    } else {
      setIsCustomModel(false);
      setModel(selectedModelName);
      if (value !== undefined) {
        setBaseMarketValue(value);
      }
    }
  };

  // Toggle Damage Type in Step 3
  const handleToggleDamage = (preset: DamageCatalogItem) => {
    const exists = selectedDamages.some(d => d.damageType === preset.type);
    if (exists) {
      setSelectedDamages(prev => prev.filter(d => d.damageType !== preset.type));
    } else {
      setSelectedDamages(prev => [
        ...prev,
        {
          id: `damage-${preset.id}`,
          category: preset.category,
          damageType: preset.type,
          deductionValue: preset.defaultDeduction
        }
      ]);
    }
  };

  // Add Custom Damage Type
  const handleAddCustomDamage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDamageName.trim()) return;

    const val = parseFloat(customDamageValue) || 0;
    const newItem: DamageItem = {
      id: `custom-damage-${Date.now()}`,
      category: customDamageCategory,
      damageType: customDamageName.trim(),
      deductionValue: val
    };

    setSelectedDamages([...selectedDamages, newItem]);
    setCustomDamageName('');
    setCustomDamageValue('');
  };

  // Update Deduction Value for an item
  const handleUpdateDeduction = (id: string, newDeduction: number) => {
    setSelectedDamages(prev =>
      prev.map(d => (d.id === id ? { ...d, deductionValue: Math.max(0, newDeduction) } : d))
    );
  };

  // Remove damage item
  const handleRemoveDamage = (id: string) => {
    setSelectedDamages(prev => prev.filter(d => d.id !== id));
  };

  // Calculations
  const totalDamageDeductions = selectedDamages.reduce((sum, d) => sum + d.deductionValue, 0);

  let accessoriesBonus = 0;
  if (boxAvailable) accessoriesBonus += 500;
  if (chargerAvailable) accessoriesBonus += 500;
  if (billAvailable) accessoriesBonus += 1000;

  const calculatedVal = Math.max(1000, Math.round((baseMarketValue + accessoriesBonus - totalDamageDeductions) / 100) * 100);
  const finalAgreedVal = customValueOverride !== '' ? Math.max(0, parseFloat(customValueOverride) || 0) : calculatedVal;

  // Grade Determination
  const determineGrade = (): ExchangeGrade => {
    if (selectedDamages.length === 0 && totalDamageDeductions === 0) {
      return 'Grade A (Flawless)';
    } else if (totalDamageDeductions <= 4000 && !selectedDamages.some(d => d.category === 'Hardware & Liquid')) {
      return 'Grade B (Minor Wear)';
    } else if (totalDamageDeductions <= 12000) {
      return 'Grade C (Scratched/Dent)';
    } else {
      return 'Grade D (Damaged)';
    }
  };

  const grade = determineGrade();

  // Effective Model Name
  const effectiveModelName = isCustomModel ? (customModelInput.trim() || 'Custom Model') : model;

  // Submit Trade-In Record
  const handleValuationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activeImei = imei.trim() || `SN-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const voucher = actionChoice === 'Store Credit Voucher' ? `VOUCHER-EX${Math.floor(10 + Math.random() * 90)}K` : undefined;

    const conditionData: ConditionChecklist = {
      screenOk: !selectedDamages.some(d => d.damageType.includes('Screen') || d.damageType.includes('Touch')),
      screenCondition: selectedDamages.some(d => d.damageType.includes('Bleed')) ? 'Display Bleed' :
                        selectedDamages.some(d => d.damageType.includes('Cracked')) ? 'Cracked' :
                        selectedDamages.some(d => d.damageType.includes('Scratches')) ? 'Minor Scratch' : 'No Scratch',
      bodyCondition: selectedDamages.some(d => d.damageType.includes('Back Glass')) ? 'Broken Back' :
                      selectedDamages.some(d => d.damageType.includes('Dented')) ? 'Dented / Bent' :
                      selectedDamages.some(d => d.damageType.includes('Scratches')) ? 'Light Scratches' : 'Flawless',
      batteryHealth: selectedDamages.some(d => d.damageType.includes('Battery')) ? 75 : 90,
      cameraOk: !selectedDamages.some(d => d.category === 'Camera & Biometrics'),
      biometricsOk: !selectedDamages.some(d => d.damageType.includes('Face ID') || d.damageType.includes('Touch ID')),
      callingOk: !selectedDamages.some(d => d.damageType.includes('SIM')),
      wifiOk: !selectedDamages.some(d => d.damageType.includes('Wi-Fi')),
      boxAvailable,
      originalChargerAvailable: chargerAvailable,
      billAvailable,
      damageItems: selectedDamages
    };

    createExchange({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || 'N/A',
      customerGovtId: govtId.trim() || 'N/A',
      deviceBrand: brand,
      deviceModel: effectiveModelName,
      storageColor,
      imeiNumber: activeImei,
      condition: conditionData,
      calculatedValue: calculatedVal,
      agreedValue: finalAgreedVal,
      grade,
      actionTaken: actionChoice,
      voucherCode: voucher,
      isVoucherUsed: false,
      status: actionChoice === 'Added to Refurbish Stock' ? 'In Refurbish' : 'Completed',
      inspectorStaff: 'Valuation Inspector',
      notes: notes.trim() || undefined
    });

    alert(`Trade-In Certificate Issued!\nDevice: ${brand} ${effectiveModelName}\nFinal Trade-In Valuation: ${settings.currencySymbol}${finalAgreedVal.toLocaleString()}\nVoucher: ${voucher || 'Direct Cash/UPI'}`);

    // Reset Form
    setCustomValueOverride('');
    setNotes('');
  };

  return (
    <div id="valuation-page-container" className="space-y-6 pb-12">
      
      {/* Top Banner & Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Smart Buyback & Trade-In Valuation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Device Damage Assessment & Buyback Calculator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            4-Step Assessment Workflow: Brand → Model → Damage Selection → Auto-Calculated Valuation
          </p>
        </div>

        {/* Live Final Assessment Badge Example */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 shrink-0 shadow-sm relative z-10">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-extrabold text-lg">
            {settings.currencySymbol}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Live Assessment Result</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {settings.currencySymbol}{finalAgreedVal.toLocaleString()}
            </div>
            <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-semibold">
              {brand} {effectiveModelName} ({selectedDamages.length} Damage Faults)
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Interactive Navigation Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white dark:bg-slate-900/80 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {[
          { step: 1, label: 'Step 1: Select Brand', sub: brand },
          { step: 2, label: 'Step 2: Select Model', sub: effectiveModelName },
          { step: 3, label: 'Step 3: Damage Types', sub: `${selectedDamages.length} Faults Selected` }
        ].map((s) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActiveStep(s.step)}
            className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
              activeStep === s.step
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div>
              <div className="text-xs font-black">{s.label}</div>
              <div className="text-[10px] opacity-80 font-medium truncate max-w-[140px]">{s.sub}</div>
            </div>
            <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeStep === s.step ? 'translate-x-1' : 'opacity-40'}`} />
          </button>
        ))}
      </div>

      {/* Final Prompt Workflow Example Indicator Pill */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-sm">
        <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>Active Assessment Prompt:</span>
        </span>
        <div className="font-mono text-cyan-800 dark:text-cyan-300 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl text-[11px] break-all shadow-sm">
          "Brand: <span className="text-slate-900 dark:text-white">{brand}</span> → Model: <span className="text-slate-900 dark:text-white">{effectiveModelName}</span> → Damage: <span className="text-rose-600 dark:text-rose-300">{selectedDamages.length > 0 ? selectedDamages.map(d => d.damageType).join(', ') : 'None (Flawless)'}</span> → Net Deduction: <span className="text-rose-600 dark:text-rose-400">-{settings.currencySymbol}{totalDamageDeductions.toLocaleString()}</span>"
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Column: Steps 1 to 4 Forms */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleValuationSubmit} className="space-y-6">

            {/* STEP 1: SELECT BRAND */}
            <div className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all space-y-4 ${
              activeStep === 1 ? 'border-cyan-500 shadow-md shadow-cyan-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30">
                    1
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Step 1: Select Brand</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Choose manufacturer to load model catalog</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-200 dark:border-cyan-500/20">
                  Selected: {brand}
                </span>
              </div>

              {/* Brand Grid Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {BRANDS.map((b) => {
                  const LogoComp = b.logo;
                  const isSelected = brand === b.name;

                  return (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => {
                        handleSelectBrand(b.name);
                        setActiveStep(2);
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center gap-3 text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-cyan-50 dark:bg-cyan-600/20 text-cyan-900 dark:text-white border-cyan-500 shadow-sm ring-1 ring-cyan-400 dark:ring-cyan-500/50'
                          : 'bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs'
                      }`}>
                        <LogoComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`font-bold text-xs block truncate ${isSelected ? 'text-cyan-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                          {b.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {b.tagline}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: SELECT MODEL */}
            <div className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all space-y-4 ${
              activeStep === 2 ? 'border-cyan-500 shadow-md shadow-cyan-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-200 dark:border-cyan-500/30">
                    2
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Step 2: Select Model ({brand})</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Pick device model or enter custom details</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  Base Market Benchmark: {settings.currencySymbol}{baseMarketValue.toLocaleString()}
                </span>
              </div>

              {/* Models Selector List/Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {(BRANDS_AND_MODELS[brand] || BRANDS_AND_MODELS['Other']).map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => handleSelectModel(m.name, m.baseValue)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-start cursor-pointer ${
                      model === m.name && !isCustomModel
                        ? 'bg-cyan-50 dark:bg-cyan-600/20 text-cyan-900 dark:text-cyan-200 border-cyan-500 font-bold ring-1 ring-cyan-300 dark:ring-cyan-500/40 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{m.name}</div>
                  </button>
                ))}
              </div>

              {/* Custom Model Toggle */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-1">
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Custom Model Name</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 13 Pro"
                    value={isCustomModel ? customModelInput : model}
                    onChange={(e) => {
                      setIsCustomModel(true);
                      setCustomModelInput(e.target.value);
                      setModel(e.target.value || 'Custom Model');
                    }}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Variant / Storage / Color</label>
                  <input
                    type="text"
                    placeholder="e.g. 128GB Sierra Blue"
                    value={storageColor}
                    onChange={(e) => setStorageColor(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Total Price ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    placeholder={`e.g. 45000`}
                    value={baseMarketValue || ''}
                    onChange={(e) => setBaseMarketValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-300 font-extrabold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                    required
                  />
                </div>
              </div>

              {/* Accessories Bonus Selection */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Accessories Bonus:</span>
                </span>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={boxAvailable}
                      onChange={(e) => setBoxAvailable(e.target.checked)}
                      className="accent-cyan-600 w-4 h-4 rounded"
                    />
                    <span>Original Box (+{settings.currencySymbol}500)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={chargerAvailable}
                      onChange={(e) => setChargerAvailable(e.target.checked)}
                      className="accent-cyan-600 w-4 h-4 rounded"
                    />
                    <span>Original Charger (+{settings.currencySymbol}500)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={billAvailable}
                      onChange={(e) => setBillAvailable(e.target.checked)}
                      className="accent-cyan-600 w-4 h-4 rounded"
                    />
                    <span>Tax Invoice (+{settings.currencySymbol}1,000)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* STEP 3: SELECT DAMAGE TYPE(S) */}
            <div className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 transition-all space-y-5 ${
              activeStep === 3 ? 'border-rose-500 shadow-md shadow-rose-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-black text-xs flex items-center justify-center border border-rose-200 dark:border-rose-500/30">
                    3
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Step 3: Select Damage Type(s)</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Click any damage type card to select or deselect defect faults.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-500/20">
                  {selectedDamages.length} Damage Fault(s) Selected
                </span>
              </div>

              {/* All 18 Predefined Damage Types Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_DAMAGE_CATALOG.map((dmg) => {
                  const selectedItem = selectedDamages.find(d => d.damageType === dmg.type);
                  const isSelected = !!selectedItem;
                  return (
                    <button
                      key={dmg.id}
                      type="button"
                      onClick={() => handleToggleDamage(dmg)}
                      className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-400 dark:border-rose-500 text-rose-950 dark:text-white shadow-sm ring-1 ring-rose-300 dark:ring-rose-500/40'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            isSelected ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                          }`}>
                            {dmg.category}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{dmg.type}</div>
                      </div>

                      {/* Toggle Checkbox Icon */}
                      <div className={`w-7 h-7 rounded-xl border flex items-center justify-center transition shrink-0 ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500'
                      }`}>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Damage List Table inside Step 3 */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Selected Damage Faults ({selectedDamages.length})</span>
                  </span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                    Total Deduction: -{settings.currencySymbol}{totalDamageDeductions.toLocaleString()}
                  </span>
                </div>

                {selectedDamages.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No damage faults selected yet. Click any card above or add custom defect below.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-900/90 text-slate-700 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Category</th>
                          <th className="p-3">Damage Fault</th>
                          <th className="p-3 text-right">Custom Deduction Price</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {selectedDamages.map((dmg) => (
                          <tr key={dmg.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                                {dmg.category}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{dmg.damageType}</td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <span className="text-rose-600 dark:text-rose-400 font-extrabold">- {settings.currencySymbol}</span>
                                <input
                                  type="number"
                                  value={dmg.deductionValue}
                                  onChange={(e) => handleUpdateDeduction(dmg.id, parseFloat(e.target.value) || 0)}
                                  className="w-24 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-black text-right px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-rose-500 shadow-xs"
                                />
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveDamage(dmg.id)}
                                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                                title="Remove damage fault"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add Custom Damage Option */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Add Additional / Custom Defect & Price</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-3">
                    <select
                      value={customDamageCategory}
                      onChange={(e) => setCustomDamageCategory(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      <option value="Display & Screen">Display & Screen</option>
                      <option value="Body & Frame">Body & Frame</option>
                      <option value="Battery & Charging">Battery & Charging</option>
                      <option value="Camera & Biometrics">Camera & Biometrics</option>
                      <option value="Audio & Network">Audio & Network</option>
                      <option value="Hardware & Liquid">Hardware & Liquid</option>
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="e.g. Broken Volume Key, SIM Tray Missing..."
                      value={customDamageName}
                      onChange={(e) => setCustomDamageName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-purple-500 shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder={`Amount (${settings.currencySymbol})`}
                      value={customDamageValue}
                      onChange={(e) => setCustomDamageValue(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-300 font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-purple-500 shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddCustomDamage}
                      disabled={!customDamageName.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold py-2 rounded-xl transition cursor-pointer shadow-xs"
                    >
                      + Add Fault
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Customer Details Form Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30">
                  4
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Customer & Identification Details</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Record customer proof and serial / IMEI</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Customer Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Customer Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Govt ID / Aadhaar / DL</label>
                  <input
                    type="text"
                    placeholder="e.g. XXXX-XXXX-4920"
                    value={govtId}
                    onChange={(e) => setGovtId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">IMEI / Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 358921048291048"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    className="w-full font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Inspection Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Slight discoloration on bottom speaker mesh"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Confirm Valuation Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-base rounded-2xl shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-100" />
                <span>Confirm Valuation & Issue Certificate</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Assessment Card, Math Breakdown & Payout Method */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 shadow-sm sticky top-6">
            
            <div className="text-center space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-black text-cyan-700 dark:text-cyan-400 tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Auto-Calculated Assessment
              </span>
              
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {settings.currencySymbol}{finalAgreedVal.toLocaleString()}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <span className={`text-xs font-black px-3.5 py-1 rounded-full border ${
                  grade.startsWith('Grade A') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40' :
                  grade.startsWith('Grade B') ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40' :
                  grade.startsWith('Grade C') ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40' :
                  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                }`}>
                  {grade}
                </span>
              </div>
            </div>

            {/* Itemized Deduction Math Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider pb-1.5 border-b border-slate-200 dark:border-slate-800 flex justify-between">
                <span>Deduction Itemized Math</span>
                <span className="text-cyan-700 dark:text-cyan-400 font-extrabold">{brand}</span>
              </div>
              
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Base Market Benchmark:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+{settings.currencySymbol}{baseMarketValue.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Accessories Bonus:</span>
                <span className="font-extrabold text-cyan-600 dark:text-cyan-400">+{settings.currencySymbol}{accessoriesBonus.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span>Damage Deductions ({selectedDamages.length}):</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400">-{settings.currencySymbol}{totalDamageDeductions.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-black text-slate-900 dark:text-white text-sm">
                <span>Auto-Calculated Payout:</span>
                <span className="text-cyan-700 dark:text-cyan-300">{settings.currencySymbol}{calculatedVal.toLocaleString()}</span>
              </div>
            </div>

            {/* Custom Override Option */}
            <div className="text-xs space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 block font-semibold">Custom Valuation Override ({settings.currencySymbol})</label>
              <input
                type="number"
                placeholder={`Calculated: ${calculatedVal}`}
                value={customValueOverride}
                onChange={(e) => setCustomValueOverride(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 font-black text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 shadow-xs"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Leave empty to use auto-calculated amount</p>
            </div>

            {/* Payout Method */}
            <div className="text-xs space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-slate-700 dark:text-slate-300 block font-semibold">Trade-In Payout Method</label>
              
              <div className="space-y-2">
                {[
                  { id: 'Store Credit Voucher', label: 'Store Credit Voucher (POS)', desc: 'Generates redeemable coupon code' },
                  { id: 'Cash Paid', label: 'Cash / UPI Direct Payout', desc: 'Instant cash payout to seller' },
                  { id: 'Added to Refurbish Stock', label: 'Add to Refurbished Stock', desc: 'Adds device to resale inventory' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setActionChoice(opt.id as any)}
                    className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      actionChoice === opt.id
                        ? 'bg-cyan-50 dark:bg-cyan-600/20 text-cyan-900 dark:text-cyan-200 border-cyan-500 font-bold ring-1 ring-cyan-300 dark:ring-cyan-500/40 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{opt.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* History Log of Saved Buyback Assessments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Valuation & Buyback History Log</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">All issued trade-in vouchers, damage reports & refurbish stock records</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Exchange Code / Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Device & IMEI</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Agreed Value</th>
                <th className="p-3">Action / Voucher</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-950/30">
              {exchanges.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-3">
                    <div className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{ex.exchangeCode}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{ex.timestamp}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-200">{ex.customerName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{ex.customerPhone}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-slate-200">{ex.deviceBrand} {ex.deviceModel}</div>
                    <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono">IMEI: {ex.imeiNumber}</div>
                  </td>
                  <td className="p-3">
                    <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {ex.grade}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {settings.currencySymbol}{ex.agreedValue.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{ex.actionTaken}</div>
                    {ex.voucherCode && (
                      <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-indigo-300 bg-purple-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-purple-200 dark:border-indigo-800/60 inline-block mt-0.5">
                        {ex.voucherCode}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ex.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300'
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
