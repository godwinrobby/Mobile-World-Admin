import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Product,
  SaleTransaction,
  TradeInExchange,
  EcommerceOrder,
  CustomerCreditAccount,
  SupplierDebitAccount,
  ShopSettings,
  CartItem,
  PaymentMethod,
  PurchaseOrder,
  RepairJobCard,
  ExpenseItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_SALES,
  INITIAL_EXCHANGES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_JOB_CARDS,
  INITIAL_EXPENSES,
  DEFAULT_SETTINGS
} from '../data/initialData';

export type ActiveTab = 
  | 'dashboard' 
  | 'catalog' 
  | 'buy' 
  | 'purchases' 
  | 'sell' 
  | 'logistics' 
  | 'repairs' 
  | 'jobcard' 
  | 'accounts' 
  | 'credits' 
  | 'stores' 
  | 'payments' 
  | 'valuation' 
  | 'customer' 
  | 'cms' 
  | 'reports' 
  | 'users' 
  | 'settings';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  users: User[];
  addUser: (userData: Omit<User, 'id'>) => User;
  updateUser: (id: string, updated: Partial<User>) => void;
  deleteUser: (id: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  categories: string[];
  addCategory: (category: string) => void;
  brands: string[];
  addBrand: (brand: string) => void;

  sales: SaleTransaction[];
  createSale: (saleData: {
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    paidAmount: number;
    tradeInCreditApplied: number;
    notes?: string;
  }) => SaleTransaction;

  exchanges: TradeInExchange[];
  createExchange: (exchange: Omit<TradeInExchange, 'id' | 'exchangeCode' | 'timestamp'>) => TradeInExchange;
  updateExchangeStatus: (id: string, status: TradeInExchange['status']) => void;

  orders: EcommerceOrder[];
  updateOrderStatus: (id: string, status: EcommerceOrder['orderStatus'], trackingNumber?: string) => void;

  customers: CustomerCreditAccount[];
  addCustomer: (cust: Omit<CustomerCreditAccount, 'id' | 'currentBalance' | 'ledgerHistory'>) => CustomerCreditAccount;
  updateCustomer: (id: string, updated: Partial<CustomerCreditAccount>) => void;
  deleteCustomer: (id: string) => void;
  recordCustomerPayment: (customerId: string, amount: number, paymentMode: string, note: string) => void;
  recordCustomerUdhar: (customerId: string, amount: number, referenceInvoice: string, note: string) => void;

  suppliers: SupplierDebitAccount[];
  addSupplier: (sup: Omit<SupplierDebitAccount, 'id' | 'currentPayable' | 'ledgerHistory'>) => SupplierDebitAccount;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMode: string, note: string) => void;
  recordSupplierPurchaseDebt: (supplierId: string, amount: number, invoiceRef: string, note: string) => void;

  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => PurchaseOrder;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrder['orderStatus']) => void;
  deletePurchaseOrder: (id: string) => void;

  jobCards: RepairJobCard[];
  createJobCard: (jc: Omit<RepairJobCard, 'id' | 'jobCardNumber'>) => RepairJobCard;
  updateJobCardStatus: (id: string, status: RepairJobCard['status'], paymentStatus?: RepairJobCard['paymentStatus']) => void;
  updateJobCard: (id: string, updated: Partial<RepairJobCard>) => void;
  deleteJobCard: (id: string) => void;

  expenses: ExpenseItem[];
  addExpense: (expData: Omit<ExpenseItem, 'id' | 'expenseNumber'>) => ExpenseItem;
  updateExpense: (id: string, updated: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  settings: ShopSettings;
  updateSettings: (newSettings: Partial<ShopSettings>) => void;
  resetAllData: () => void;
  exportBackupData: () => any;
  restoreBackupData: (data: any) => boolean;

  activeReceipt: SaleTransaction | null;
  setActiveReceipt: (sale: SaleTransaction | null) => void;

  showStorefrontPreview: boolean;
  setShowStorefrontPreview: (show: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token') || localStorage.getItem('mshop_jwt_token') || null;
  });

  // Load from localStorage if present; default to null so login is required
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mshop_user');
    return saved ? JSON.parse(saved) : null;
  });

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('mshop_jwt_token');
    localStorage.removeItem('mshop_user');
    setToken(null);
    setCurrentUser(null);
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mshop_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mshop_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mshop_categories');
    return saved ? JSON.parse(saved) : ['Smartphones', 'Accessories', 'Spare Parts', 'Services & Repairs', 'Tablets', 'Wearables'];
  });

  const [brands, setBrands] = useState<string[]>(() => {
    const saved = localStorage.getItem('mshop_brands');
    return saved ? JSON.parse(saved) : ['Apple', 'Samsung', 'OnePlus', 'Xiaomi / Poco', 'Realme', 'Vivo', 'Oppo', 'Google Pixel', 'Motorola', 'Nothing', 'Boat', 'Noise'];
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem('mshop_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [exchanges, setExchanges] = useState<TradeInExchange[]>(() => {
    const saved = localStorage.getItem('mshop_exchanges');
    return saved ? JSON.parse(saved) : INITIAL_EXCHANGES;
  });

  const [orders, setOrders] = useState<EcommerceOrder[]>(() => {
    const saved = localStorage.getItem('mshop_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<CustomerCreditAccount[]>(() => {
    const saved = localStorage.getItem('mshop_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<SupplierDebitAccount[]>(() => {
    const saved = localStorage.getItem('mshop_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('mshop_purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [jobCards, setJobCards] = useState<RepairJobCard[]>(() => {
    const saved = localStorage.getItem('mshop_jobcards');
    return saved ? JSON.parse(saved) : INITIAL_JOB_CARDS;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem('mshop_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('mshop_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [activeReceipt, setActiveReceipt] = useState<SaleTransaction | null>(null);
  const [showStorefrontPreview, setShowStorefrontPreview] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Save changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mshop_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mshop_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mshop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mshop_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('mshop_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('mshop_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('mshop_exchanges', JSON.stringify(exchanges));
  }, [exchanges]);

  useEffect(() => {
    localStorage.setItem('mshop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mshop_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('mshop_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('mshop_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('mshop_jobcards', JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem('mshop_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mshop_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('mshop_users', JSON.stringify(users));
  }, [users]);

  // Handler functions
  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      status: userData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just Now'
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `p-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (catName: string) => {
    const trimmed = catName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
    }
  };

  const addBrand = (brandName: string) => {
    const trimmed = brandName.trim();
    if (trimmed && !brands.includes(trimmed)) {
      setBrands(prev => [...prev, trimmed]);
    }
  };

  const createSale = ({
    customerName,
    customerPhone,
    items,
    paymentMethod,
    paidAmount,
    tradeInCreditApplied,
    notes
  }: {
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    paidAmount: number;
    tradeInCreditApplied: number;
    notes?: string;
  }): SaleTransaction => {
    let subtotal = 0;
    let totalDiscount = 0;

    const formattedItems = items.map(cart => {
      const lineSub = cart.unitPrice * cart.quantity;
      subtotal += lineSub;
      totalDiscount += cart.discount;

      // Deduct product stock & remove sold IMEI if applicable
      setProducts(prev => prev.map(p => {
        if (p.id === cart.product.id) {
          const newStock = Math.max(0, p.stock - cart.quantity);
          let newImeiList = p.imeiList;
          if (p.hasImeiTracking && cart.selectedImei && p.imeiList) {
            newImeiList = p.imeiList.filter(im => im !== cart.selectedImei);
          }
          return {
            ...p,
            stock: newStock,
            imeiList: newImeiList,
            status: newStock === 0 ? 'Out of Stock' : p.status
          };
        }
        return p;
      }));

      return {
        productId: cart.product.id,
        productName: cart.product.name,
        brand: cart.product.brand,
        quantity: cart.quantity,
        unitPrice: cart.unitPrice,
        discount: cart.discount,
        imei: cart.selectedImei,
        ramStorage: cart.selectedVariant?.ramStorage,
        color: cart.selectedVariant?.color
      };
    });

    const taxAmount = settings.taxInclusive
      ? Math.round((subtotal * settings.taxRatePercent) / (100 + settings.taxRatePercent))
      : Math.round((subtotal * settings.taxRatePercent) / 100);

    const netBeforeCredit = settings.taxInclusive ? subtotal - totalDiscount : subtotal + taxAmount - totalDiscount;
    const totalAmount = Math.max(0, netBeforeCredit - tradeInCreditApplied);
    const balanceAmount = Math.max(0, totalAmount - paidAmount);

    const invoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSale: SaleTransaction = {
      id: `s-${Date.now()}`,
      invoiceNumber: invoiceNum,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || 'N/A',
      items: formattedItems,
      subtotal,
      taxAmount,
      discountAmount: totalDiscount,
      tradeInCreditApplied,
      totalAmount,
      paidAmount,
      balanceAmount,
      paymentMethod,
      salesByStaff: currentUser?.name || 'Store Staff',
      status: balanceAmount > 0 ? 'Partially Paid' : 'Completed',
      warrantyPeriodMonths: settings.defaultWarrantyMonths,
      notes
    };

    setSales(prev => [newSale, ...prev]);

    // If balanceAmount > 0 (Udhar/Credit), update or create customer credit ledger entry
    if (balanceAmount > 0 && customerPhone) {
      setCustomers(prev => {
        const existing = prev.find(c => c.phone === customerPhone || c.name.toLowerCase() === customerName.toLowerCase());
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newLedgerEntry = {
          id: `led-${Date.now()}`,
          timestamp,
          type: 'Debit (Udhar Given)' as const,
          amount: balanceAmount,
          referenceInvoice: invoiceNum,
          note: `Credit sale of ${formattedItems.map(i => i.productName).join(', ')}`,
          recordedBy: currentUser?.name || 'Staff'
        };

        if (existing) {
          return prev.map(c => c.id === existing.id ? {
            ...c,
            currentBalance: c.currentBalance + balanceAmount,
            ledgerHistory: [newLedgerEntry, ...c.ledgerHistory]
          } : c);
        } else {
          const newCust: CustomerCreditAccount = {
            id: `cust-${Date.now()}`,
            name: customerName,
            phone: customerPhone,
            creditLimit: 50000,
            currentBalance: balanceAmount,
            status: 'Active',
            ledgerHistory: [newLedgerEntry]
          };
          return [newCust, ...prev];
        }
      });
    }

    return newSale;
  };

  const createExchange = (data: Omit<TradeInExchange, 'id' | 'exchangeCode' | 'timestamp'>): TradeInExchange => {
    const code = `EXCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const newExch: TradeInExchange = {
      ...data,
      id: `ex-${Date.now()}`,
      exchangeCode: code,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setExchanges(prev => [newExch, ...prev]);

    // If actionTaken === 'Added to Refurbish Stock', auto-create a refurbished product entry!
    if (data.actionTaken === 'Added to Refurbish Stock') {
      const refProd: Product = {
        id: `p-ref-${Date.now()}`,
        name: `[Refurbished] ${data.deviceBrand} ${data.deviceModel} (${data.storageColor})`,
        brand: data.deviceBrand,
        category: 'Smartphones',
        description: `Refurbished trade-in device. Grade: ${data.grade}. Checked IMEI: ${data.imeiNumber}`,
        posPrice: Math.round(data.agreedValue * 1.25), // 25% markup on trade-in cost
        onlinePrice: Math.round(data.agreedValue * 1.30),
        costPrice: data.agreedValue,
        stock: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
        hasImeiTracking: true,
        imeiList: [data.imeiNumber],
        status: 'Active',
        featuredInEcommerce: false,
        specifications: {
          'Grade': data.grade,
          'Condition': data.condition.screenCondition,
          'Battery Health': `${data.condition.batteryHealth}%`,
          'IMEI': data.imeiNumber
        }
      };
      setProducts(prev => [refProd, ...prev]);
    }

    return newExch;
  };

  const updateExchangeStatus = (id: string, status: TradeInExchange['status']) => {
    setExchanges(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const updateOrderStatus = (id: string, status: EcommerceOrder['orderStatus'], trackingNumber?: string) => {
    setOrders(prev => prev.map(o => o.id === id ? {
      ...o,
      orderStatus: status,
      trackingNumber: trackingNumber || o.trackingNumber,
      paymentStatus: status === 'Delivered' ? 'Paid' : o.paymentStatus
    } : o));
  };

  const addCustomer = (data: Omit<CustomerCreditAccount, 'id' | 'currentBalance' | 'ledgerHistory'>): CustomerCreditAccount => {
    const newC: CustomerCreditAccount = {
      ...data,
      id: `cust-${Date.now()}`,
      currentBalance: 0,
      ledgerHistory: []
    };
    setCustomers(prev => [newC, ...prev]);
    return newC;
  };

  const updateCustomer = (id: string, updated: Partial<CustomerCreditAccount>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const recordCustomerPayment = (customerId: string, amount: number, paymentMode: string, note: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newEntry = {
          id: `led-${Date.now()}`,
          timestamp,
          type: 'Credit (Payment Received)' as const,
          amount,
          paymentMode: paymentMode as any,
          note,
          recordedBy: currentUser?.name || 'Staff'
        };
        return {
          ...c,
          currentBalance: Math.max(0, c.currentBalance - amount),
          lastPaymentDate: timestamp.substring(0, 10),
          ledgerHistory: [newEntry, ...c.ledgerHistory]
        };
      }
      return c;
    }));
  };

  const recordCustomerUdhar = (customerId: string, amount: number, referenceInvoice: string, note: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newEntry = {
          id: `led-${Date.now()}`,
          timestamp,
          type: 'Debit (Udhar Given)' as const,
          amount,
          referenceInvoice,
          note,
          recordedBy: currentUser?.name || 'Staff'
        };
        return {
          ...c,
          currentBalance: c.currentBalance + amount,
          ledgerHistory: [newEntry, ...c.ledgerHistory]
        };
      }
      return c;
    }));
  };

  const addSupplier = (data: Omit<SupplierDebitAccount, 'id' | 'currentPayable' | 'ledgerHistory'>): SupplierDebitAccount => {
    const newS: SupplierDebitAccount = {
      ...data,
      id: `sup-${Date.now()}`,
      currentPayable: 0,
      lastTransactionDate: new Date().toISOString().substring(0, 10),
      ledgerHistory: []
    };
    setSuppliers(prev => [newS, ...prev]);
    return newS;
  };

  const recordSupplierPayment = (supplierId: string, amount: number, paymentMode: string, note: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newEntry = {
          id: `sled-${Date.now()}`,
          timestamp,
          type: 'Supplier Paid' as const,
          amount,
          paymentMode: paymentMode as any,
          note,
          recordedBy: currentUser?.name || 'Staff'
        };
        return {
          ...s,
          currentPayable: Math.max(0, s.currentPayable - amount),
          lastTransactionDate: timestamp.substring(0, 10),
          ledgerHistory: [newEntry, ...s.ledgerHistory]
        };
      }
      return s;
    }));
  };

  const recordSupplierPurchaseDebt = (supplierId: string, amount: number, invoiceRef: string, note: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newEntry = {
          id: `sled-${Date.now()}`,
          timestamp,
          type: 'Purchase Debt' as const,
          amount,
          referenceInvoice: invoiceRef,
          note,
          recordedBy: currentUser?.name || 'Staff'
        };
        return {
          ...s,
          currentPayable: s.currentPayable + amount,
          lastTransactionDate: timestamp.substring(0, 10),
          ledgerHistory: [newEntry, ...s.ledgerHistory]
        };
      }
      return s;
    }));
  };

  const inwardPurchaseItems = (items: PurchaseOrder['items']) => {
    setProducts(prevProducts => {
      let updatedProducts = [...prevProducts];

      items.forEach(item => {
        if (item.productId) {
          updatedProducts = updatedProducts.map(p => {
            if (p.id === item.productId) {
              const newStock = p.stock + item.quantity;
              const existingImeis = p.imeiList || [];
              const newImeis = item.imeiNumbers && item.imeiNumbers.length > 0
                ? Array.from(new Set([...existingImeis, ...item.imeiNumbers]))
                : existingImeis;

              return {
                ...p,
                stock: newStock,
                costPrice: item.unitCostPrice || p.costPrice,
                splPrice: item.splPrice || p.splPrice,
                posPrice: item.expectedSellingPrice || p.posPrice,
                imeiList: newImeis,
                hasImeiTracking: p.hasImeiTracking || (newImeis.length > 0),
                status: newStock > 0 ? 'Active' : p.status
              };
            }
            return p;
          });
        } else if (item.productName) {
          const existingByName = updatedProducts.find(
            p => p.name.toLowerCase().trim() === item.productName.toLowerCase().trim()
          );

          if (existingByName) {
            updatedProducts = updatedProducts.map(p => {
              if (p.id === existingByName.id) {
                const newStock = p.stock + item.quantity;
                const existingImeis = p.imeiList || [];
                const newImeis = item.imeiNumbers && item.imeiNumbers.length > 0
                  ? Array.from(new Set([...existingImeis, ...item.imeiNumbers]))
                  : existingImeis;

                return {
                  ...p,
                  stock: newStock,
                  costPrice: item.unitCostPrice || p.costPrice,
                  splPrice: item.splPrice || p.splPrice,
                  posPrice: item.expectedSellingPrice || p.posPrice,
                  imeiList: newImeis,
                  hasImeiTracking: p.hasImeiTracking || (newImeis.length > 0),
                  status: 'Active'
                };
              }
              return p;
            });
          } else {
            const category = (item.category as any) || 'Smartphones';
            const brand = item.brand || 'Generic';
            const newImeis = item.imeiNumbers || [];
            const newProduct: Product = {
              id: `p-po-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: item.productName,
              brand,
              category,
              description: `Auto-inwarded from Purchase Order. Inward Date: ${new Date().toISOString().substring(0, 10)}`,
              posPrice: item.expectedSellingPrice || Math.round(item.unitCostPrice * 1.15),
              onlinePrice: item.expectedSellingPrice || Math.round(item.unitCostPrice * 1.18),
              splPrice: item.splPrice,
              costPrice: item.unitCostPrice,
              stock: item.quantity,
              image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
              hasImeiTracking: newImeis.length > 0,
              imeiList: newImeis,
              status: 'Active',
              featuredInEcommerce: false
            };
            updatedProducts = [newProduct, ...updatedProducts];
          }
        }
      });

      return updatedProducts;
    });
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>): PurchaseOrder => {
    const poNum = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPo: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber: poNum
    };

    setPurchaseOrders(prev => [newPo, ...prev]);

    if (newPo.orderStatus === 'Received & Inwarded') {
      inwardPurchaseItems(newPo.items);
    }

    if (newPo.balanceAmount > 0 && newPo.partyId) {
      if (newPo.partyType === 'Supplier' || newPo.partyType === 'Wholesaler') {
        recordSupplierPurchaseDebt(
          newPo.partyId,
          newPo.balanceAmount,
          poNum,
          `PO ${poNum} balance owed for items: ${newPo.items.map(i => i.productName).join(', ')}`
        );
      } else if (newPo.partyType === 'Customer') {
        recordCustomerUdhar(
          newPo.partyId,
          newPo.balanceAmount,
          poNum,
          `PO ${poNum} customer buyback balance owed: ${newPo.items.map(i => i.productName).join(', ')}`
        );
      }
    }

    return newPo;
  };

  const updatePurchaseOrderStatus = (id: string, status: PurchaseOrder['orderStatus']) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === id) {
        if (status === 'Received & Inwarded' && po.orderStatus !== 'Received & Inwarded') {
          inwardPurchaseItems(po.items);
        }
        return { ...po, orderStatus: status };
      }
      return po;
    }));
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders(prev => prev.filter(p => p.id !== id));
  };

  const createJobCard = (jcData: Omit<RepairJobCard, 'id' | 'jobCardNumber'>): RepairJobCard => {
    const nextNum = 1000 + jobCards.length + 1;
    const newJc: RepairJobCard = {
      ...jcData,
      id: `jc-${Date.now()}`,
      jobCardNumber: `JC-2026-${nextNum}`
    };
    setJobCards(prev => [newJc, ...prev]);
    return newJc;
  };

  const updateJobCardStatus = (
    id: string,
    status: RepairJobCard['status'],
    paymentStatus?: RepairJobCard['paymentStatus']
  ) => {
    setJobCards(prev => prev.map(jc => {
      if (jc.id === id) {
        const updated = { ...jc, status };
        if (paymentStatus) {
          updated.paymentStatus = paymentStatus;
          if (paymentStatus === 'Paid in Full') {
            updated.balanceDue = 0;
            updated.advancePaid = jc.finalCost || jc.estimatedCost;
          }
        }
        return updated;
      }
      return jc;
    }));
  };

  const updateJobCard = (id: string, updated: Partial<RepairJobCard>) => {
    setJobCards(prev => prev.map(jc => jc.id === id ? { ...jc, ...updated } : jc));
  };

  const deleteJobCard = (id: string) => {
    setJobCards(prev => prev.filter(jc => jc.id !== id));
  };

  const addExpense = (expData: Omit<ExpenseItem, 'id' | 'expenseNumber'>): ExpenseItem => {
    const nextNum = 100 + expenses.length + 1;
    const newExp: ExpenseItem = {
      ...expData,
      id: `exp-${Date.now()}`,
      expenseNumber: `EXP-2026-${nextNum}`,
      createdBy: currentUser?.name || 'Staff'
    };
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  };

  const updateExpense = (id: string, updated: Partial<ExpenseItem>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateSettings = (newSettings: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setExchanges(INITIAL_EXCHANGES);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setJobCards(INITIAL_JOB_CARDS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(DEFAULT_SETTINGS);
    setUsers(INITIAL_USERS);
    localStorage.removeItem('mshop_products');
    localStorage.removeItem('mshop_sales');
    localStorage.removeItem('mshop_exchanges');
    localStorage.removeItem('mshop_orders');
    localStorage.removeItem('mshop_customers');
    localStorage.removeItem('mshop_suppliers');
    localStorage.removeItem('mshop_purchase_orders');
    localStorage.removeItem('mshop_jobcards');
    localStorage.removeItem('mshop_expenses');
    localStorage.removeItem('mshop_settings');
    localStorage.removeItem('mshop_users');
  };

  const exportBackupData = () => {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: settings.shopName || 'Metro Mobile Care POS',
      data: {
        products,
        categories,
        brands,
        sales,
        exchanges,
        orders,
        customers,
        suppliers,
        purchaseOrders,
        jobCards,
        expenses,
        settings,
        users
      }
    };
  };

  const restoreBackupData = (backupData: any): boolean => {
    try {
      if (!backupData || typeof backupData !== 'object') return false;
      const payload = backupData.data || backupData;

      if (Array.isArray(payload.products)) setProducts(payload.products);
      if (Array.isArray(payload.categories)) setCategories(payload.categories);
      if (Array.isArray(payload.brands)) setBrands(payload.brands);
      if (Array.isArray(payload.sales)) setSales(payload.sales);
      if (Array.isArray(payload.exchanges)) setExchanges(payload.exchanges);
      if (Array.isArray(payload.orders)) setOrders(payload.orders);
      if (Array.isArray(payload.customers)) setCustomers(payload.customers);
      if (Array.isArray(payload.suppliers)) setSuppliers(payload.suppliers);
      if (Array.isArray(payload.purchaseOrders)) setPurchaseOrders(payload.purchaseOrders);
      if (Array.isArray(payload.jobCards)) setJobCards(payload.jobCards);
      if (Array.isArray(payload.expenses)) setExpenses(payload.expenses);
      if (payload.settings && typeof payload.settings === 'object') setSettings(payload.settings);
      if (Array.isArray(payload.users)) setUsers(payload.users);

      return true;
    } catch (err) {
      console.error('Failed to restore backup snapshot:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      token,
      setToken,
      logout,
      users,
      addUser,
      updateUser,
      deleteUser,
      activeTab,
      setActiveTab,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      categories,
      addCategory,
      brands,
      addBrand,
      sales,
      createSale,
      exchanges,
      createExchange,
      updateExchangeStatus,
      orders,
      updateOrderStatus,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      recordCustomerPayment,
      recordCustomerUdhar,
      suppliers,
      addSupplier,
      recordSupplierPayment,
      recordSupplierPurchaseDebt,
      purchaseOrders,
      createPurchaseOrder,
      updatePurchaseOrderStatus,
      deletePurchaseOrder,
      jobCards,
      createJobCard,
      updateJobCardStatus,
      updateJobCard,
      deleteJobCard,
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      settings,
      updateSettings,
      resetAllData,
      exportBackupData,
      restoreBackupData,
      activeReceipt,
      setActiveReceipt,
      showStorefrontPreview,
      setShowStorefrontPreview,
      searchQuery,
      setSearchQuery,
      isMobileMenuOpen,
      setIsMobileMenuOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
