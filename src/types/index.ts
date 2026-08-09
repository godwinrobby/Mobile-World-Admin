export type Role = 'Admin' | 'Manager' | 'Sales Executive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone: string;
}

export type Category = 'Smartphones' | 'Accessories' | 'Spare Parts' | 'Services & Repairs';

export interface ProductVariant {
  id: string;
  color: string;
  ramStorage?: string; // e.g. "8GB / 128GB"
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  description: string;
  posPrice: number;
  onlinePrice: number;
  splPrice?: number;
  costPrice: number;
  stock: number;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  hasImeiTracking: boolean;
  imeiList?: string[]; // list of available IMEIs for this product
  status: 'Active' | 'Out of Stock' | 'Draft';
  featuredInEcommerce: boolean;
  specifications?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedImei?: string;
  unitPrice: number;
  discount: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'UPI / QR' | 'Store Credit / Udhar' | 'Split Payment';

export interface SaleTransaction {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    brand: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    imei?: string;
    ramStorage?: string;
    color?: string;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tradeInCreditApplied: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number; // >0 means added to Udhar/Credit
  paymentMethod: PaymentMethod;
  salesByStaff: string; // Staff name
  status: 'Completed' | 'Refunded' | 'Partially Paid';
  warrantyPeriodMonths: number;
  notes?: string;
}

export type SaleRecord = SaleTransaction;

export type ExchangeGrade = 'Grade A (Flawless)' | 'Grade B (Minor Wear)' | 'Grade C (Scratched/Dent)' | 'Grade D (Damaged)';

export interface DamageItem {
  id: string;
  category: string;
  damageType: string;
  deductionValue: number;
}

export interface ConditionChecklist {
  screenOk: boolean;
  screenCondition: 'No Scratch' | 'Minor Scratch' | 'Cracked' | 'Display Bleed';
  bodyCondition: 'Flawless' | 'Light Scratches' | 'Dented / Bent' | 'Broken Back';
  batteryHealth: number; // 0-100
  cameraOk: boolean;
  biometricsOk: boolean; // FaceID/Fingerprint
  callingOk: boolean;
  wifiOk: boolean;
  boxAvailable: boolean;
  originalChargerAvailable: boolean;
  billAvailable: boolean;
  damageItems?: DamageItem[];
}

export interface TradeInExchange {
  id: string;
  exchangeCode: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  customerGovtId?: string;
  deviceBrand: string;
  deviceModel: string;
  storageColor: string;
  imeiNumber: string;
  condition: ConditionChecklist;
  calculatedValue: number;
  agreedValue: number;
  grade: ExchangeGrade;
  actionTaken: 'Store Credit Voucher' | 'Cash Paid' | 'Added to Refurbish Stock' | 'Direct Sale Adjustment';
  voucherCode?: string;
  isVoucherUsed?: boolean;
  status: 'Completed' | 'Pending Inspection' | 'In Refurbish' | 'Resold';
  inspectorStaff: string;
  notes?: string;
}

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: 'COD' | 'Prepaid Online';
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  courierName?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: 'Debit (Udhar Given)' | 'Credit (Payment Received)' | 'Purchase Debt' | 'Supplier Paid';
  amount: number;
  paymentMode?: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceInvoice?: string;
  note: string;
  recordedBy: string;
}

export interface CustomerCreditAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  currentBalance: number; // positive = owes shop money (Udhar)
  ledgerHistory: LedgerEntry[];
  lastPaymentDate?: string;
  status: 'Active' | 'Blocked' | 'Overdue Alert';
}

export interface SupplierDebitAccount {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  category: 'Smartphones Wholesaler' | 'Accessories Distributor' | 'Spare Parts Supplier';
  currentPayable: number; // positive = shop owes wholesaler money
  ledgerHistory: LedgerEntry[];
  lastTransactionDate: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId?: string;
  productName: string;
  category?: string;
  brand?: string;
  quantity: number;
  unitCostPrice: number;
  splPrice?: number;
  expectedSellingPrice?: number;
  taxPercent?: number;
  totalCost: number;
  imeiNumbers?: string[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. "PO-2026-8812"
  orderDate: string;
  expectedDeliveryDate?: string;
  partyType: 'Supplier' | 'Customer' | 'Wholesaler';
  partyId?: string;
  partyName: string;
  partyPhone: string;
  partyEmail?: string;
  partyAddress?: string;
  partyGstin?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number; // Credit / Debt owed
  paymentStatus: 'Paid in Full' | 'Partially Paid' | 'Khata Debt Owed' | 'Pending';
  orderStatus: 'Draft' | 'Issued / Sent' | 'Received & Inwarded' | 'Cancelled';
  notes?: string;
  createdBy: string;
  referenceInvoiceNo?: string;
}

export interface RepairJobCard {
  id: string;
  jobCardNumber: string; // e.g. "JC-2026-1001"
  createdDate: string;
  promisedDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerial: string;
  passcode?: string;
  physicalCondition: string;
  reportedFault: string;
  diagnosis?: string;
  assignedTechnician: string;
  estimatedCost: number;
  finalCost: number;
  advancePaid: number;
  balanceDue: number;
  status: 'Received / Diagnostic' | 'In Progress' | 'Awaiting Spare Part' | 'Ready for Pickup' | 'Completed & Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Advance Received' | 'Paid in Full';
  warrantyDays: number;
  sparePartsUsed?: { partName: string; costPrice: number; sellingPrice: number }[];
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  expenseNumber: string; // e.g. "EXP-2026-001"
  date: string; // YYYY-MM-DD
  category: 
    | 'Rent'
    | 'Food & Refreshments'
    | 'Mobile / DTH Recharge'
    | 'Internet & Wifi'
    | 'Electricity & Utilities'
    | 'Salaries & Wages'
    | 'Maintenance & Repairs'
    | 'Printing & Stationery'
    | 'Tea & Snacks'
    | 'Marketing & Ads'
    | 'Transportation & Freight'
    | 'Shop Equipment'
    | 'Other Expense'
    | 'Custom Expense'
    | (string & {});
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
  paidTo?: string; // e.g. "Shop Landlord", "Airtel Broadband"
  notes?: string;
  createdBy?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  currencySymbol: string;
  taxRatePercent: number;
  taxInclusive: boolean;
  enableStockAlerts: boolean;
  lowStockThreshold: number;
  defaultWarrantyMonths: number;
  receiptFooterMessage: string;
  demoApiMode: boolean; // toggle between simulated local state & mock API endpoint config
  apiBaseUrl: string;
  apiKey: string;
}
