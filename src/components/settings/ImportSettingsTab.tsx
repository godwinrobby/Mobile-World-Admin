import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Category } from '../../types';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Smartphone,
  Tag,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

export const ImportSettingsTab: React.FC = () => {
  const { brands, addBrand, categories, addCategory, addProduct, products } = useApp();

  const [activeImportMode, setActiveImportMode] = useState<'brands' | 'mobiles'>('brands');

  // --- BRAND IMPORT STATE ---
  const [brandInputText, setBrandInputText] = useState('');
  const [importedBrandsPreview, setImportedBrandsPreview] = useState<string[]>([]);
  const [brandSuccessMsg, setBrandSuccessMsg] = useState<string | null>(null);

  // --- MOBILE IMPORT STATE ---
  const [mobileCsvText, setMobileCsvText] = useState('');
  const [mobileParsedItems, setMobileParsedItems] = useState<Array<{
    name: string;
    brand: string;
    category: Category;
    posPrice: number;
    costPrice: number;
    stock: number;
    description: string;
    imeiList: string[];
    status: 'valid' | 'invalid';
    error?: string;
  }>>([]);
  const [autoCreateMissingMeta, setAutoCreateMissingMeta] = useState(true);
  const [mobileSuccessMsg, setMobileSuccessMsg] = useState<string | null>(null);

  // Handle Brand Text / File Processing
  const handleParseBrandsText = (text: string) => {
    setBrandInputText(text);
    if (!text.trim()) {
      setImportedBrandsPreview([]);
      return;
    }
    // Split by newline, comma, or semicolon
    const items = text
      .split(/[\n,;]+/)
      .map(b => b.trim())
      .filter(b => b.length > 0);

    // Deduplicate within the input
    const unique = Array.from(new Set(items));
    setImportedBrandsPreview(unique);
  };

  const handleBrandFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleParseBrandsText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBrandImport = () => {
    if (importedBrandsPreview.length === 0) return;

    let addedCount = 0;
    importedBrandsPreview.forEach((bName) => {
      if (!brands.some(existing => existing.toLowerCase() === bName.toLowerCase())) {
        addBrand(bName);
        addedCount++;
      }
    });

    setBrandSuccessMsg(`Successfully imported ${addedCount} new brand(s) into system!`);
    setBrandInputText('');
    setImportedBrandsPreview([]);
    setTimeout(() => setBrandSuccessMsg(null), 4000);
  };

  const handleDownloadSampleBrandsCsv = () => {
    const csvContent = "brand_name\nGoogle Pixel\nIQOO\nInfinix\nTecno\nLava\nHonor\nAsus ROG\nNothing\nNokia";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_brands_import.csv';
    a.click();
  };

  // Handle Mobile CSV Processing
  const parseMobileCsv = (rawText: string) => {
    setMobileCsvText(rawText);
    if (!rawText.trim()) {
      setMobileParsedItems([]);
      return;
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) {
      setMobileParsedItems([]);
      return;
    }

    // Check if line 0 is a header
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('name') || firstLine.includes('brand') || firstLine.includes('price');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const parsed = dataLines.map((line, idx) => {
      // Split by comma ignoring commas inside quotes if possible
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      
      const name = cols[0] || `Imported Mobile #${idx + 1}`;
      const brand = cols[1] || 'Apple';
      const category = (cols[2] as Category) || 'Smartphones';
      const posPrice = parseFloat(cols[3]) || 15000;
      const costPrice = parseFloat(cols[4]) || 12000;
      const stock = parseInt(cols[5]) || 1;
      const description = cols[6] || `${brand} ${name} device in stock`;
      const imeiString = cols[7] || '';
      const imeiList = imeiString ? imeiString.split(/[\s/|]+/).map(i => i.trim()).filter(i => i.length > 3) : [];

      const isValid = name.length > 0 && posPrice > 0;

      return {
        name,
        brand,
        category,
        posPrice,
        costPrice,
        stock,
        description,
        imeiList,
        status: isValid ? ('valid' as const) : ('invalid' as const),
        error: !isValid ? 'Name and valid price are required' : undefined
      };
    });

    setMobileParsedItems(parsed);
  };

  const handleMobileFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseMobileCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleMobileData = () => {
    const sampleCsv = `name,brand,category,posPrice,costPrice,stock,description,imeiList
Apple iPhone 15 Pro Max (256GB - Natural Titanium),Apple,Smartphones,134900,118000,4,A17 Pro Titanium flagship phone,359281029384712 / 359281029384713
Samsung Galaxy S24 Ultra 5G (512GB - Titanium Black),Samsung,Smartphones,139999,122000,3,Snapdragon 8 Gen 3 AI smartphone,358172938475610
OnePlus 12 5G (16GB RAM / 512GB Silky Black),OnePlus,Smartphones,69999,60000,6,Hasselblad 50MP camera phone,357281920394817
Xiaomi Redmi Note 13 Pro+ 5G (256GB Fusion Purple),Xiaomi / Poco,Smartphones,31999,27500,10,200MP OIS camera with 120W HyperCharge,356192837465019
Vivo V30 Pro 5G (512GB Andaman Blue),Vivo,Smartphones,46999,40500,5,ZEISS Smart Aura Light camera,354019283746510
Google Pixel 8 Pro (128GB Bay Blue),Google Pixel,Smartphones,89999,78000,2,Google Tensor G3 pure Android device,353091827364519`;

    parseMobileCsv(sampleCsv);
  };

  const handleDownloadSampleMobileCsv = () => {
    const sampleCsv = `name,brand,category,posPrice,costPrice,stock,description,imeiList
Apple iPhone 15 Pro Max (256GB - Natural Titanium),Apple,Smartphones,134900,118000,4,A17 Pro Titanium flagship phone,359281029384712 / 359281029384713
Samsung Galaxy S24 Ultra 5G (512GB - Titanium Black),Samsung,Smartphones,139999,122000,3,Snapdragon 8 Gen 3 AI smartphone,358172938475610
OnePlus 12 5G (16GB RAM / 512GB Silky Black),OnePlus,Smartphones,69999,60000,6,Hasselblad 50MP camera phone,357281920394817`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_mobile_catalog_import.csv';
    a.click();
  };

  const handleExecuteMobileImport = () => {
    const validItems = mobileParsedItems.filter(i => i.status === 'valid');
    if (validItems.length === 0) return;

    let importedCount = 0;
    let totalStockAdded = 0;
    let totalValueAdded = 0;

    validItems.forEach(item => {
      // 1. Auto create brand if missing
      if (autoCreateMissingMeta && item.brand) {
        if (!brands.some(b => b.toLowerCase() === item.brand.toLowerCase())) {
          addBrand(item.brand);
        }
      }

      // 2. Auto create category if missing
      if (autoCreateMissingMeta && item.category) {
        if (!categories.some(c => c.toLowerCase() === item.category.toLowerCase())) {
          addCategory(item.category);
        }
      }

      // 3. Add Product
      const imageMap: Record<string, string> = {
        'Apple': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
        'Samsung': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60',
        'OnePlus': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60',
        'Google Pixel': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60',
        'Xiaomi / Poco': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
        'Vivo': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=60'
      };

      const defaultImg = imageMap[item.brand] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60';

      addProduct({
        name: item.name,
        brand: item.brand,
        category: item.category,
        description: item.description,
        posPrice: item.posPrice,
        onlinePrice: Math.round(item.posPrice * 1.05),
        costPrice: item.costPrice,
        stock: item.stock,
        image: defaultImg,
        hasImeiTracking: item.imeiList.length > 0,
        imeiList: item.imeiList,
        status: item.stock > 0 ? 'Active' : 'Out of Stock',
        featuredInEcommerce: true
      });

      importedCount++;
      totalStockAdded += item.stock;
      totalValueAdded += item.posPrice * item.stock;
    });

    setMobileSuccessMsg(`Successfully imported ${importedCount} mobile models (${totalStockAdded} total stock units valued at ₹${totalValueAdded.toLocaleString()}) into catalog!`);
    setMobileCsvText('');
    setMobileParsedItems([]);
    setTimeout(() => setMobileSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Selector Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <span>Data & Catalog Bulk Import Center</span>
          </h3>
          <p className="text-xs text-slate-400">
            Easily import mobile phone brands, smart devices, and stock inventory using CSV files or direct text paste.
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveImportMode('brands')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeImportMode === 'brands'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Brand Import</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveImportMode('mobiles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeImportMode === 'mobiles'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile & Product Catalog Import</span>
          </button>
        </div>
      </div>

      {/* ==================== 1. BRAND IMPORT SECTION ==================== */}
      {activeImportMode === 'brands' && (
        <div className="space-y-6">
          
          {brandSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{brandSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Input & Upload Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-400" />
                  <span>Import Brand Names</span>
                </h4>
                <button
                  type="button"
                  onClick={handleDownloadSampleBrandsCsv}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Sample CSV</span>
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Upload CSV or Text File</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-4 rounded-xl text-center space-y-2 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv,.txt,.json"
                    onChange={handleBrandFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileSpreadsheet className="w-8 h-8 text-indigo-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">Click or drag `.csv` / `.txt` file here</div>
                  <p className="text-[10px] text-slate-500">Supports comma-separated or line-separated brand lists</p>
                </div>
              </div>

              {/* Text Paste Input */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1.5">Or Paste Brand List Directly</label>
                <textarea
                  value={brandInputText}
                  onChange={(e) => handleParseBrandsText(e.target.value)}
                  placeholder="Paste brands here... (e.g. Google Pixel, IQOO, Infinix, Tecno, Lava, Honor, Asus)"
                  rows={5}
                  className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="text-[11px] text-slate-700 dark:text-slate-400 bg-amber-500/10 dark:bg-slate-950/60 p-3 rounded-xl border border-amber-500/30 dark:border-slate-800 flex items-start gap-2 font-medium">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Brands already existing in Mobile World Store will be automatically detected and safely skipped during import.
                </span>
              </div>
            </div>

            {/* Right: Parsed Preview & Action */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Parsed Brands Preview</span>
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Total: <strong className="text-white">{importedBrandsPreview.length}</strong>
                  </span>
                </div>

                {importedBrandsPreview.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                    <Tag className="w-10 h-10 mx-auto text-slate-700" />
                    <p>No brands parsed yet. Paste or upload a CSV file on the left to preview.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                      {importedBrandsPreview.map((bName, i) => {
                        const exists = brands.some(ex => ex.toLowerCase() === bName.toLowerCase());
                        return (
                          <span
                            key={i}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                              exists
                                ? 'bg-slate-800 text-slate-400 border border-slate-700 line-through opacity-70'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            <span>{bName}</span>
                            {exists ? (
                              <span className="text-[9px] uppercase text-slate-500 font-mono">(Exists)</span>
                            ) : (
                              <Check className="w-3 h-3 text-emerald-400" />
                            )}
                          </span>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>New Brands to add: <strong className="text-emerald-400">{importedBrandsPreview.filter(bName => !brands.some(ex => ex.toLowerCase() === bName.toLowerCase())).length}</strong></span>
                      <span>Existing skipped: <strong className="text-slate-400">{importedBrandsPreview.filter(bName => brands.some(ex => ex.toLowerCase() === bName.toLowerCase())).length}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Import Action Trigger */}
              <button
                type="button"
                onClick={handleExecuteBrandImport}
                disabled={importedBrandsPreview.length === 0}
                className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                  importedBrandsPreview.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Execute Brand Import into System</span>
              </button>
            </div>

          </div>

          {/* Current System Brands Overview */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Currently Active Brands ({brands.length})</span>
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {brands.map((brand, idx) => (
                <span
                  key={idx}
                  className="bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================== 2. MOBILE / PRODUCT IMPORT SECTION ==================== */}
      {activeImportMode === 'mobiles' && (
        <div className="space-y-6">

          {mobileSuccessMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{mobileSuccessMsg}</span>
            </div>
          )}

          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Mobile Phone & Inventory Catalog CSV Import</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Upload CSV or paste device catalog data with pricing, stock levels, and IMEI serials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleMobileData}
                  className="px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Load Sample Mobile Phones</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSampleMobileCsv}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Sample Template</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload Zone */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">1. Upload CSV File</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 p-4 rounded-xl text-center space-y-2 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleMobileFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileSpreadsheet className="w-7 h-7 text-indigo-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">Select `.csv` catalog file</div>
                  <p className="text-[10px] text-slate-500">Header: name, brand, category, posPrice, costPrice, stock, description, imeiList</p>
                </div>
              </div>

              {/* Raw CSV Text Paste */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">2. Or Paste CSV Text Directly</label>
                <textarea
                  value={mobileCsvText}
                  onChange={(e) => parseMobileCsv(e.target.value)}
                  placeholder="Paste CSV lines... e.g. iPhone 15 Pro Max, Apple, Smartphones, 134900, 118000, 5, A17 Pro Titanium phone, 359281029384712"
                  rows={4}
                  className="w-full bg-slate-950 text-slate-100 p-3 rounded-xl border border-slate-800 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Auto Meta Creation Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={autoCreateMissingMeta}
                  onChange={(e) => setAutoCreateMissingMeta(e.target.checked)}
                  className="accent-indigo-500 w-4 h-4 rounded"
                />
                <span>Automatically add new Brands & Categories to system if they do not exist yet</span>
              </label>

              {mobileParsedItems.length > 0 && (
                <div className="text-xs text-slate-400 flex items-center gap-3 font-mono">
                  <span>Parsed: <strong className="text-white">{mobileParsedItems.length}</strong> devices</span>
                  <span>Valid: <strong className="text-emerald-400">{mobileParsedItems.filter(i => i.status === 'valid').length}</strong></span>
                  <span>Total Stock: <strong className="text-cyan-400">{mobileParsedItems.reduce((acc, i) => acc + i.stock, 0)} units</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Parsed Items Interactive Table Preview */}
          {mobileParsedItems.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Product Catalog Import Preview Table</span>
                </h4>

                <button
                  type="button"
                  onClick={handleExecuteMobileImport}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Import {mobileParsedItems.filter(i => i.status === 'valid').length} Mobile Phones into Catalog</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Mobile Device / Model Name</th>
                      <th className="py-2.5 px-3">Brand</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">POS Price</th>
                      <th className="py-2.5 px-3 text-right">Cost Price</th>
                      <th className="py-2.5 px-3 text-center">Stock</th>
                      <th className="py-2.5 px-3">IMEIs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {mobileParsedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-950/50">
                        <td className="py-3 px-3 font-mono text-slate-500">{index + 1}</td>
                        <td className="py-3 px-3">
                          {item.status === 'valid' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3 text-emerald-400" /> Ready
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3 text-rose-400" /> Invalid
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-100">{item.name}</td>
                        <td className="py-3 px-3 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                            {item.brand}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{item.category}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">₹{item.posPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-400">₹{item.costPrice.toLocaleString()}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-200">{item.stock}</td>
                        <td className="py-3 px-3">
                          {item.imeiList.length > 0 ? (
                            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                              {item.imeiList.length} IMEI(s)
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
