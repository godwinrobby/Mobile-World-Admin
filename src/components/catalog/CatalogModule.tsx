import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Category } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Tag,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Layers,
  Sparkles,
  DollarSign,
  Smartphone,
  Cpu,
  HardDrive,
  Grid,
  List,
  FolderPlus,
  Building,
  Hash,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Star,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  Camera
} from 'lucide-react';

export const CatalogModule: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    brands,
    addBrand,
    settings
  } = useApp();

  // Filters & Views
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [viewImeiProduct, setViewImeiProduct] = useState<Product | null>(null);

  // New Category & Brand Form State
  const [newCatName, setNewCatName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // Product Form State
  const initialFormState = {
    name: '',
    brand: brands[0] || 'Apple',
    category: (categories[0] as Category) || 'Smartphones',
    modelNumber: '',
    description: '',
    posPrice: 0,
    onlinePrice: 0,
    splPrice: 0,
    costPrice: 0,
    stock: 1,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
    imagesList: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600'] as string[],
    newImageUrlInput: '',
    hasImeiTracking: true,
    imeiInput: '',
    imeiList: [] as string[],
    status: 'Active' as 'Active' | 'Out of Stock' | 'Draft',
    featuredInEcommerce: false,
    ram: '8 GB',
    storage: '128 GB',
    color: 'Black',
    display: '6.5 inch AMOLED 120Hz',
    processor: 'Octa-core Processor',
    camera: '50 MP + 12 MP',
    battery: '5000 mAh',
    warrantyMonths: '12'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Preset Image Thumbnails for quick selection
  const presetImages = [
    { label: 'iPhone / Flagship', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600' },
    { label: 'Android Phone', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600' },
    { label: 'Earbuds / AirPods', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=600' },
    { label: 'Charger & Cable', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600' },
    { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' },
    { label: 'Tablet / iPad', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600' }
  ];

  // Open Edit Modal
  const handleEditInit = (product: Product) => {
    setEditingProduct(product);
    const existingImgs = product.images && product.images.length > 0 ? product.images : [product.image];
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      modelNumber: product.specifications?.['Model / Series'] || '',
      description: product.description,
      posPrice: product.posPrice,
      onlinePrice: product.onlinePrice,
      splPrice: product.splPrice || 0,
      costPrice: product.costPrice,
      stock: product.stock,
      image: product.image,
      imagesList: existingImgs,
      newImageUrlInput: '',
      hasImeiTracking: product.hasImeiTracking,
      imeiInput: '',
      imeiList: product.imeiList || [],
      status: product.status,
      featuredInEcommerce: product.featuredInEcommerce,
      ram: product.specifications?.['RAM'] || '8 GB',
      storage: product.specifications?.['Storage'] || '128 GB',
      color: product.specifications?.['Color'] || 'Black',
      display: product.specifications?.['Display'] || '',
      processor: product.specifications?.['Processor'] || '',
      camera: product.specifications?.['Camera'] || '',
      battery: product.specifications?.['Battery'] || '',
      warrantyMonths: product.specifications?.['Warranty'] || '12'
    });
    setIsAddProductOpen(true);
  };

  // Image Upload & Gallery Helpers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const newUrls: string[] = [];
    let processed = 0;

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newUrls.push(event.target.result as string);
        }
        processed++;
        if (processed === fileList.length) {
          setFormData((prev) => {
            const updatedList = [...prev.imagesList, ...newUrls];
            return {
              ...prev,
              imagesList: updatedList,
              image: updatedList[0] || prev.image
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlImage = () => {
    const url = formData.newImageUrlInput.trim();
    if (!url) return;
    setFormData((prev) => {
      const updatedList = [...prev.imagesList, url];
      return {
        ...prev,
        imagesList: updatedList,
        image: updatedList[0] || prev.image,
        newImageUrlInput: ''
      };
    });
  };

  const handleSelectPresetImage = (presetUrl: string) => {
    setFormData((prev) => {
      if (prev.imagesList.includes(presetUrl)) return prev;
      const updatedList = [...prev.imagesList, presetUrl];
      return {
        ...prev,
        imagesList: updatedList,
        image: updatedList[0] || prev.image
      };
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updatedList = prev.imagesList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        imagesList: updatedList,
        image: updatedList[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600'
      };
    });
  };

  const handleSetPrimaryCover = (indexToMakePrimary: number) => {
    setFormData((prev) => {
      if (indexToMakePrimary === 0) return prev;
      const target = prev.imagesList[indexToMakePrimary];
      const remaining = prev.imagesList.filter((_, idx) => idx !== indexToMakePrimary);
      const updatedList = [target, ...remaining];
      return {
        ...prev,
        imagesList: updatedList,
        image: updatedList[0]
      };
    });
  };

  const handleResetForm = () => {
    setEditingProduct(null);
    setFormData({
      ...initialFormState,
      brand: brands[0] || 'Apple',
      category: (categories[0] as Category) || 'Smartphones'
    });
  };

  // Add IMEI to list
  const handleAddImei = () => {
    const trimmed = formData.imeiInput.trim();
    if (!trimmed) return;
    if (formData.imeiList.includes(trimmed)) {
      alert('This IMEI / Serial Number is already added to the list!');
      return;
    }
    const updated = [...formData.imeiList, trimmed];
    setFormData({
      ...formData,
      imeiList: updated,
      imeiInput: '',
      stock: formData.hasImeiTracking ? updated.length : formData.stock
    });
  };

  const handleRemoveImei = (imeiToRemove: string) => {
    const updated = formData.imeiList.filter(i => i !== imeiToRemove);
    setFormData({
      ...formData,
      imeiList: updated,
      stock: formData.hasImeiTracking ? updated.length : formData.stock
    });
  };

  // Save Product (Create or Update)
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return;
    }

    const specifications: Record<string, string> = {
      'RAM': formData.ram,
      'Storage': formData.storage,
      'Color': formData.color,
      'Warranty': `${formData.warrantyMonths} Months`
    };
    if (formData.modelNumber) specifications['Model / Series'] = formData.modelNumber;
    if (formData.display) specifications['Display'] = formData.display;
    if (formData.processor) specifications['Processor'] = formData.processor;
    if (formData.camera) specifications['Camera'] = formData.camera;
    if (formData.battery) specifications['Battery'] = formData.battery;

    const primaryCoverImage = formData.imagesList[0] || formData.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600';

    const productPayload = {
      name: formData.name.trim(),
      brand: formData.brand,
      category: formData.category as Category,
      description: formData.description || `${formData.brand} ${formData.name} - Official India Warranty Model`,
      posPrice: Number(formData.posPrice),
      onlinePrice: Number(formData.onlinePrice) || Number(formData.posPrice),
      splPrice: Number(formData.splPrice) > 0 ? Number(formData.splPrice) : undefined,
      costPrice: Number(formData.costPrice),
      stock: formData.hasImeiTracking ? formData.imeiList.length : Number(formData.stock),
      image: primaryCoverImage,
      images: formData.imagesList.length > 0 ? formData.imagesList : [primaryCoverImage],
      hasImeiTracking: formData.hasImeiTracking,
      imeiList: formData.hasImeiTracking ? formData.imeiList : [],
      status: formData.status,
      featuredInEcommerce: formData.featuredInEcommerce,
      specifications
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsAddProductOpen(false);
    handleResetForm();
  };

  // Create Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim());
    setNewCatName('');
    setIsAddCategoryOpen(false);
  };

  // Create Brand
  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    addBrand(newBrandName.trim());
    setNewBrandName('');
    setIsAddBrandOpen(false);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.imeiList && p.imeiList.some(i => i.includes(search)));

    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;

    let matchesStock = true;
    if (stockFilter === 'IN_STOCK') matchesStock = p.stock > settings.lowStockThreshold;
    if (stockFilter === 'LOW_STOCK') matchesStock = p.stock > 0 && p.stock <= settings.lowStockThreshold;
    if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.stock === 0;

    return matchesSearch && matchesCat && matchesBrand && matchesStock;
  });

  // Calculate stats
  const totalValuationCost = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const totalValuationPos = products.reduce((acc, p) => acc + (p.posPrice * p.stock), 0);
  const totalImeiCount = products.reduce((acc, p) => acc + (p.imeiList?.length || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= settings.lowStockThreshold).length;

  return (
    <div id="catalog-module" className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-400" />
              <span>Mobile World Care & Digital Store Catalog</span>
            </h2>
            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              {products.length} Products Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage smartphones, models, categories, IMEI serials, specs, and POS pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              handleResetForm();
              setIsAddCategoryOpen(true);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <span>+ Add Category</span>
          </button>

          <button
            onClick={() => {
              handleResetForm();
              setIsAddBrandOpen(true);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Building className="w-4 h-4 text-purple-400" />
            <span>+ Add Brand</span>
          </button>

          <button
            onClick={() => {
              handleResetForm();
              setIsAddProductOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Inventory Cost Asset</span>
          <div className="text-lg font-extrabold text-white mt-0.5">
            {settings.currencySymbol}{totalValuationCost.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400">Total purchase value in stock</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">POS Sales Potential</span>
          <div className="text-lg font-extrabold text-indigo-400 mt-0.5">
            {settings.currencySymbol}{totalValuationPos.toLocaleString()}
          </div>
          <p className="text-[10px] text-emerald-400">+{(totalValuationPos - totalValuationCost).toLocaleString()} profit margin</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">IMEI Serial Numbers</span>
          <div className="text-lg font-extrabold text-cyan-400 mt-0.5">
            {totalImeiCount} Serials Tracked
          </div>
          <p className="text-[10px] text-slate-400">Barcode / Warranty ready</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Low Stock Alerts</span>
          <div className={`text-lg font-extrabold ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'} mt-0.5`}>
            {lowStockCount} Products
          </div>
          <p className="text-[10px] text-slate-400">Threshold ≤ {settings.lowStockThreshold} units</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Live Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, brand, IMEI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs">
              ×
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Brands ({brands.length})</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock (&gt; {settings.lowStockThreshold})</option>
            <option value="LOW_STOCK">Low Stock (≤ {settings.lowStockThreshold})</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>

          {/* View Toggle */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-0.5 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Catalog Display Section */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No Products Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, category filters, or add a new product.
          </p>
          <button
            onClick={() => {
              handleResetForm();
              setIsAddProductOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Product Now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => {
            const isLow = product.stock <= settings.lowStockThreshold && product.stock > 0;
            const isOut = product.stock === 0;

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md relative group transition"
              >
                {/* Product Image & Badges */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-xl bg-slate-950 border border-slate-800/80"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="text-[10px] font-extrabold bg-indigo-600/90 text-white px-2 py-0.5 rounded-md shadow backdrop-blur-sm">
                      {product.brand}
                    </span>
                    <span className="text-[9px] font-bold bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-700/80 backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>

                  {product.featuredInEcommerce && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-slate-950" /> Featured
                    </span>
                  )}

                  {product.images && product.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 text-[9px] font-black bg-slate-950/80 text-pink-300 px-2 py-0.5 rounded-md border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
                      <Camera className="w-3 h-3 text-pink-400" />
                      {product.images.length} Photos
                    </span>
                  )}
                </div>

                {/* Info Block */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-sm text-slate-100 line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{product.description}</p>

                  {/* Specs Pill List */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.specifications?.['RAM'] && (
                      <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60 flex items-center gap-1">
                        <Cpu className="w-2.5 h-2.5 text-indigo-400" /> {product.specifications['RAM']}
                      </span>
                    )}
                    {product.specifications?.['Storage'] && (
                      <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60 flex items-center gap-1">
                        <HardDrive className="w-2.5 h-2.5 text-cyan-400" /> {product.specifications['Storage']}
                      </span>
                    )}
                    {product.hasImeiTracking && (
                      <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" /> IMEI ({product.imeiList?.length || 0})
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Stock Row */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">POS Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-extrabold text-indigo-400 text-sm">
                        {settings.currencySymbol}{product.posPrice.toLocaleString()}
                      </span>
                      {product.splPrice && product.splPrice > 0 ? (
                        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title="Special Offer Price">
                          SPL: {settings.currencySymbol}{product.splPrice.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Stock Level</span>
                    <span
                      className={`font-extrabold ${
                        isOut ? 'text-rose-500' : isLow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {product.stock} Units {isOut ? '(Out)' : isLow ? '(Low)' : ''}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => handleEditInit(product)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 rounded-xl border border-slate-700/80 flex items-center justify-center gap-1 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                  </button>

                  {product.hasImeiTracking && (
                    <button
                      onClick={() => setViewImeiProduct(product)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1"
                      title="View IMEIs"
                    >
                      <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete "${product.name}" from catalog?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-xl border border-rose-500/20 transition"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Product Info</th>
                  <th className="p-3">Brand & Category</th>
                  <th className="p-3">Cost Price</th>
                  <th className="p-3">POS Price</th>
                  <th className="p-3">Stock & IMEI</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800" />
                        <div>
                          <div className="font-bold text-slate-100">{product.name}</div>
                          <div className="text-[10px] text-slate-400">{product.specifications?.['RAM']} • {product.specifications?.['Storage']}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-indigo-400">{product.brand}</div>
                      <div className="text-[10px] text-slate-400">{product.category}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-300">
                      {settings.currencySymbol}{product.costPrice.toLocaleString()}
                    </td>
                    <td className="p-3 font-extrabold text-emerald-400">
                      {settings.currencySymbol}{product.posPrice.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className={`font-bold ${product.stock === 0 ? 'text-rose-400' : product.stock <= settings.lowStockThreshold ? 'text-amber-400' : 'text-slate-200'}`}>
                        {product.stock} Units
                      </div>
                      {product.hasImeiTracking && (
                        <button
                          onClick={() => setViewImeiProduct(product)}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <Hash className="w-2.5 h-2.5" /> {product.imeiList?.length || 0} IMEIs
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditInit(product)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg border border-slate-700"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${product.name}"?`)) deleteProduct(product.id);
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg border border-rose-500/20"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL DETAILED PRODUCT ADD / EDIT SIDE POPUP DRAWER */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Side Drawer Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {editingProduct ? 'Edit Mobile Product Catalog Item' : 'Add New Detailed Product'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Side Popup Panel • Product & Specifications Entry</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddProductOpen(false);
                  handleResetForm();
                }}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
                title="Close Side Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side Drawer Form Body */}
            <form onSubmit={handleSubmitProduct} className="p-6 overflow-y-auto no-scrollbar space-y-6 flex-1 text-xs">
              
              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>1. Basic Product & Model Information</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Title / Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 15 Pro Max"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Model / Series Number</label>
                    <input
                      type="text"
                      placeholder="e.g. A3106 / MU773HN/A"
                      value={formData.modelNumber}
                      onChange={e => setFormData({ ...formData, modelNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Brand Selector + Quick Add Trigger */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">Brand *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddBrandOpen(true)}
                        className="text-[10px] text-indigo-400 hover:underline font-bold"
                      >
                        + Add Brand
                      </button>
                    </div>
                    <select
                      value={formData.brand}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      {brands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Selector + Quick Add Trigger */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold">Category *</label>
                      <button
                        type="button"
                        onClick={() => setIsAddCategoryOpen(true)}
                        className="text-[10px] text-cyan-400 hover:underline font-bold"
                      >
                        + Add Category
                      </button>
                    </div>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide highlights, key selling points, box contents..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Section 2: Pricing & Valuation */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>2. Pricing & Cost Accounting</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Includes SPL Offer Pricing
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Cost Purchase Price ({settings.currencySymbol}) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.costPrice}
                      onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Counter POS Selling Price ({settings.currencySymbol}) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.posPrice}
                      onChange={e => setFormData({ ...formData, posPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-semibold mb-1 flex items-center justify-between">
                      <span>SPL Price ({settings.currencySymbol})</span>
                      <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.2 rounded">Deal / VIP</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. Special Offer Price"
                      value={formData.splPrice || ''}
                      onChange={e => setFormData({ ...formData, splPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-amber-950/20 border border-amber-500/40 rounded-xl text-amber-200 font-mono font-extrabold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Online / Ecommerce Price ({settings.currencySymbol})</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.onlinePrice}
                      onChange={e => setFormData({ ...formData, onlinePrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Specifications */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>3. Hardware & Specs</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">RAM</label>
                    <input
                      type="text"
                      placeholder="e.g. 8 GB"
                      value={formData.ram}
                      onChange={e => setFormData({ ...formData, ram: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Storage / ROM</label>
                    <input
                      type="text"
                      placeholder="e.g. 256 GB"
                      value={formData.storage}
                      onChange={e => setFormData({ ...formData, storage: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Color Variant</label>
                    <input
                      type="text"
                      placeholder="e.g. Titanium Blue"
                      value={formData.color}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Warranty (Months)</label>
                    <input
                      type="number"
                      placeholder="12"
                      value={formData.warrantyMonths}
                      onChange={e => setFormData({ ...formData, warrantyMonths: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: IMEI Serial Tracking & Stock */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-purple-400" />
                    <span>4. Inventory Stock & Serial IMEI Tracking</span>
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasImeiTracking}
                      onChange={e => setFormData({ ...formData, hasImeiTracking: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-xs text-indigo-300 font-bold">Enable IMEI Serial Tracking</span>
                  </label>
                </h4>

                {formData.hasImeiTracking ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Scan or type 15-digit IMEI Serial #..."
                        value={formData.imeiInput}
                        onChange={e => setFormData({ ...formData, imeiInput: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImei();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddImei}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl"
                      >
                        + Add IMEI
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Total Registered IMEIs: <strong className="text-white">{formData.imeiList.length}</strong></span>
                      <span className="text-amber-400 font-semibold">Stock quantity automatically updates to IMEI count</span>
                    </div>

                    {formData.imeiList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                        {formData.imeiList.map(imei => (
                          <span
                            key={imei}
                            className="bg-slate-800 text-indigo-300 border border-slate-700/80 px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5"
                          >
                            <span>{imei}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImei(imei)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Standard Stock Quantity Units</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Section 5: Image Gallery & Multi-Image Uploads */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span>5. Product Gallery & Multiple Image Uploads</span>
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {formData.imagesList.length} {formData.imagesList.length === 1 ? 'Image' : 'Images'} Attached
                  </span>
                </div>

                {/* File Upload Dropzone */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border-2 border-dashed border-slate-800 hover:border-pink-500/50 transition flex flex-col items-center justify-center text-center space-y-2 group">
                  <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-200">Upload Product Images (Multiple)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Drag & drop files or choose multiple images from device</p>
                  </div>

                  <input
                    type="file"
                    id="multi-product-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="multi-product-image-upload"
                    className="cursor-pointer bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-pink-600/20 flex items-center gap-2 transition"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Select Device Photos</span>
                  </label>
                </div>

                {/* Add via Web URL */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold text-[11px]">Or Add Image via Web URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://example.com/mobile-phone-photo.jpg"
                        value={formData.newImageUrlInput}
                        onChange={e => setFormData({ ...formData, newImageUrlInput: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUrlImage}
                      disabled={!formData.newImageUrlInput.trim()}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                {/* Quick Sample Presets */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Add Sample Device Presets</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {presetImages.map((preset, idx) => {
                      const isAdded = formData.imagesList.includes(preset.url);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPresetImage(preset.url)}
                          className={`p-1.5 rounded-xl border text-center transition group relative ${
                            isAdded
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                          <span className="text-[9px] font-semibold text-slate-300 block truncate">{preset.label}</span>
                          {isAdded && (
                            <span className="absolute top-1 right-1 bg-pink-500 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Attached Images Gallery Grid */}
                {formData.imagesList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-bold text-slate-200 block">Product Images Gallery</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {formData.imagesList.map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`relative group bg-slate-950 rounded-2xl border p-1.5 overflow-hidden flex flex-col justify-between transition ${
                              isPrimary ? 'border-pink-500/80 shadow-lg shadow-pink-500/10 ring-1 ring-pink-500/50' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 mb-1.5">
                              <img src={imgUrl} alt={`Product Thumbnail ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              
                              {/* Primary Badge */}
                              {isPrimary ? (
                                <div className="absolute top-1 left-1 bg-gradient-to-r from-pink-600 to-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-white text-white" />
                                  <span>Cover Photo</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryCover(idx)}
                                  className="absolute top-1 left-1 bg-slate-900/90 hover:bg-pink-600 text-slate-300 hover:text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-slate-700 backdrop-blur-sm transition flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                                  title="Set as Main Product Image"
                                >
                                  <Star className="w-2.5 h-2.5" />
                                  <span>Set Cover</span>
                                </button>
                              )}

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-1 right-1 bg-slate-950/80 hover:bg-rose-600 text-slate-300 hover:text-white p-1 rounded-md transition backdrop-blur-sm"
                                title="Remove Image"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                              <span className="font-mono text-[9px]">Img #{idx + 1}</span>
                              {isPrimary ? (
                                <span className="text-pink-400 font-bold text-[9px]">Main Display</span>
                              ) : (
                                <span className="text-slate-500 text-[9px]">Gallery</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Sticky Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductOpen(false);
                    handleResetForm();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product Catalog Item'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD CATEGORY SIDE POPUP DRAWER */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Add Product Category</h3>
                  <p className="text-[11px] text-slate-400">Side Popup Panel • Quick Category Creator</p>
                </div>
              </div>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleCreateCategory} className="p-6 overflow-y-auto no-scrollbar space-y-5 flex-1 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">New Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tablets, Wearables, Accessories, Spares"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-bold block mb-2 uppercase tracking-wider">Existing Product Categories ({categories.length})</span>
                <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto no-scrollbar p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  {categories.map(c => (
                    <span key={c} className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs border border-slate-700/80 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD BRAND SIDE POPUP DRAWER */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Add Product Brand</h3>
                  <p className="text-[11px] text-slate-400">Side Popup Panel • Quick Brand Creator</p>
                </div>
              </div>
              <button onClick={() => setIsAddBrandOpen(false)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleCreateBrand} className="p-6 overflow-y-auto no-scrollbar space-y-5 flex-1 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">New Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Motorola, Nothing, JBL, Spigen, Boat"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-bold block mb-2 uppercase tracking-wider">Existing Brands ({brands.length})</span>
                <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto no-scrollbar p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  {brands.map(b => (
                    <span key={b} className="bg-slate-800 text-purple-300 px-2.5 py-1 rounded-lg text-xs border border-slate-700/80 font-semibold">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW IMEIs SIDE POPUP DRAWER */}
      {viewImeiProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">IMEI Serial Registry</h3>
                  <p className="text-[11px] text-slate-400">{viewImeiProduct.name} ({viewImeiProduct.brand})</p>
                </div>
              </div>
              <button onClick={() => setViewImeiProduct(null)} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-4 flex-1 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
                  <span>Available IMEIs in Stock:</span>
                  <span className="text-indigo-400 font-extrabold text-sm">{viewImeiProduct.imeiList?.length || 0} Units</span>
                </div>

                {viewImeiProduct.imeiList && viewImeiProduct.imeiList.length > 0 ? (
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                    {viewImeiProduct.imeiList.map((imei, idx) => (
                      <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800/90 flex items-center justify-between font-mono text-xs text-slate-200">
                        <span className="tracking-wide font-semibold text-indigo-300">{imei}</span>
                        <span className="text-[10px] text-emerald-400 font-sans font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          In Stock
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs py-8 text-center font-medium">No IMEIs currently registered for this product</div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setViewImeiProduct(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl text-xs font-extrabold transition"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
