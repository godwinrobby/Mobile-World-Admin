import {
  Product,
  SaleTransaction,
  TradeInExchange,
  EcommerceOrder,
  CustomerCreditAccount,
  SupplierDebitAccount,
  ShopSettings,
  PurchaseOrder,
  RepairJobCard,
  ExpenseItem,
  User
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Rajesh Sharma',
    email: 'admin@mobileshop.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98765 43210',
  },
  {
    id: 'u-2',
    name: 'Anish Verma',
    email: 'manager@mobileshop.com',
    role: 'Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98765 11223',
  },
  {
    id: 'u-3',
    name: 'Priya Patel',
    email: 'sales@mobileshop.com',
    role: 'Sales Executive',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    phone: '+91 98765 99887',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'Smartphones',
    description: 'A17 Pro chip, Titanium design, 48MP main camera with 5x optical zoom.',
    posPrice: 134900,
    onlinePrice: 139900,
    costPrice: 122000,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: true,
    imeiList: [
      '352019482019281',
      '352019482019282',
      '352019482019283',
      '352019482019284',
      '352019482019285',
      '352019482019286',
      '352019482019287',
      '352019482019288'
    ],
    status: 'Active',
    featuredInEcommerce: true,
    specifications: {
      'Storage': '256GB',
      'Color': 'Natural Titanium',
      'Display': '6.7 inch Super Retina XDR OLED',
      'Processor': 'A17 Pro 3nm',
      'Camera': '48MP + 12MP + 12MP'
    },
    variants: [
      { id: 'v-1a', color: 'Natural Titanium', ramStorage: '8GB / 256GB', price: 134900, costPrice: 122000, stock: 5, sku: 'IP15PM-256-NT' },
      { id: 'v-1b', color: 'Blue Titanium', ramStorage: '8GB / 512GB', price: 154900, costPrice: 140000, stock: 3, sku: 'IP15PM-512-BT' }
    ]
  },
  {
    id: 'p-2',
    name: 'Samsung Galaxy S24 Ultra 5G',
    brand: 'Samsung',
    category: 'Smartphones',
    description: 'Galaxy AI is here. 200MP camera, Snapdragon 8 Gen 3 for Galaxy, S Pen integrated.',
    posPrice: 129999,
    onlinePrice: 132999,
    costPrice: 115000,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: true,
    imeiList: [
      '358201928371920',
      '358201928371921',
      '358201928371922',
      '358201928371923',
      '358201928371924'
    ],
    status: 'Active',
    featuredInEcommerce: true,
    specifications: {
      'Storage': '512GB',
      'Color': 'Titanium Gray',
      'RAM': '12GB',
      'Battery': '5000 mAh'
    }
  },
  {
    id: 'p-3',
    name: 'OnePlus 12 5G',
    brand: 'OnePlus',
    category: 'Smartphones',
    description: 'Smooth Beyond Belief. Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera for Mobile.',
    posPrice: 64999,
    onlinePrice: 69999,
    costPrice: 57000,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: true,
    imeiList: [
      '864920192837481',
      '864920192837482',
      '864920192837483'
    ],
    status: 'Active',
    featuredInEcommerce: true,
    specifications: {
      'Storage': '256GB',
      'RAM': '12GB',
      'Color': 'Flowy Emerald',
      'Fast Charge': '100W SUPERVOOC'
    }
  },
  {
    id: 'p-4',
    name: 'Apple AirPods Pro (2nd Gen, USB-C)',
    brand: 'Apple',
    category: 'Accessories',
    description: 'Active Noise Cancellation up to 2x more effective. Transparency mode and Adaptive Audio.',
    posPrice: 22900,
    onlinePrice: 24900,
    costPrice: 19500,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: false,
    status: 'Active',
    featuredInEcommerce: true,
    specifications: {
      'Connectivity': 'Bluetooth 5.3',
      'Case': 'MagSafe USB-C',
      'Battery': '6 hrs music / 30 hrs total'
    }
  },
  {
    id: 'p-5',
    name: 'Anker 65W GaN Fast Wall Charger 3-Port',
    brand: 'Anker',
    category: 'Accessories',
    description: 'High-speed fast charging for laptops, iPhones, and Android phones simultaneously.',
    posPrice: 3499,
    onlinePrice: 3799,
    costPrice: 2200,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: false,
    status: 'Active',
    featuredInEcommerce: false
  },
  {
    id: 'p-6',
    name: 'Spigen Tough Armor Case - iPhone 15 Pro',
    brand: 'Spigen',
    category: 'Accessories',
    description: 'Extreme dual-layer protection with kickstand and air cushion technology.',
    posPrice: 1899,
    onlinePrice: 2199,
    costPrice: 950,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1541877944-ac82a091518a?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: false,
    status: 'Active',
    featuredInEcommerce: true
  },
  {
    id: 'p-7',
    name: 'Samsung 25W USB-C Super Fast Adapter',
    brand: 'Samsung',
    category: 'Accessories',
    description: 'Original Samsung Power Adapter with Power Delivery (PD) 3.0.',
    posPrice: 1299,
    onlinePrice: 1499,
    costPrice: 750,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: false,
    status: 'Active',
    featuredInEcommerce: true
  },
  {
    id: 'p-8',
    name: 'Original AMOLED Display Panel - Galaxy S22',
    brand: 'Samsung Parts',
    category: 'Spare Parts',
    description: 'Original Service Pack AMOLED Screen with Digitizer for Repair.',
    posPrice: 11500,
    onlinePrice: 12500,
    costPrice: 8500,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=600',
    hasImeiTracking: false,
    status: 'Active',
    featuredInEcommerce: false
  }
];

export const INITIAL_SALES: SaleTransaction[] = [
  {
    id: 's-1001',
    invoiceNumber: 'INV-2026-0801',
    timestamp: '2026-08-08 14:32',
    customerName: 'Amit Kumar',
    customerPhone: '+91 98112 33445',
    items: [
      {
        productId: 'p-1',
        productName: 'iPhone 15 Pro Max',
        brand: 'Apple',
        quantity: 1,
        unitPrice: 134900,
        discount: 2000,
        imei: '352019482019280',
        color: 'Natural Titanium',
        ramStorage: '256GB'
      },
      {
        productId: 'p-4',
        productName: 'Apple AirPods Pro (2nd Gen)',
        brand: 'Apple',
        quantity: 1,
        unitPrice: 22900,
        discount: 900
      }
    ],
    subtotal: 157800,
    taxAmount: 28062,
    discountAmount: 2900,
    tradeInCreditApplied: 18000,
    totalAmount: 136900,
    paidAmount: 136900,
    balanceAmount: 0,
    paymentMethod: 'Card',
    salesByStaff: 'Priya Patel',
    status: 'Completed',
    warrantyPeriodMonths: 12,
    notes: 'Traded in old iPhone 12 64GB (Voucher EX-8801)'
  },
  {
    id: 's-1002',
    invoiceNumber: 'INV-2026-0802',
    timestamp: '2026-08-08 16:15',
    customerName: 'Suresh Patel (Khata User)',
    customerPhone: '+91 97234 55667',
    items: [
      {
        productId: 'p-3',
        productName: 'OnePlus 12 5G',
        brand: 'OnePlus',
        quantity: 1,
        unitPrice: 64999,
        discount: 1000,
        imei: '864920192837480',
        color: 'Flowy Emerald',
        ramStorage: '256GB'
      }
    ],
    subtotal: 64999,
    taxAmount: 11519,
    discountAmount: 1000,
    tradeInCreditApplied: 0,
    totalAmount: 63999,
    paidAmount: 20000,
    balanceAmount: 43999, // Added to customer Udhar
    paymentMethod: 'Store Credit / Udhar',
    salesByStaff: 'Anish Verma',
    status: 'Partially Paid',
    warrantyPeriodMonths: 12,
    notes: 'Partial Cash Rs. 20,000 paid. Remaining Rs. 43,999 added to customer Udhar ledger.'
  }
];

export const INITIAL_EXCHANGES: TradeInExchange[] = [
  {
    id: 'ex-8801',
    exchangeCode: 'EXCH-2026-001',
    timestamp: '2026-08-08 14:10',
    customerName: 'Amit Kumar',
    customerPhone: '+91 98112 33445',
    customerGovtId: 'Aadhar **** 4920',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 12',
    storageColor: '128GB Blue',
    imeiNumber: '353920182739102',
    condition: {
      screenOk: true,
      screenCondition: 'Minor Scratch',
      bodyCondition: 'Light Scratches',
      batteryHealth: 84,
      cameraOk: true,
      biometricsOk: true,
      callingOk: true,
      wifiOk: true,
      boxAvailable: true,
      originalChargerAvailable: false,
      billAvailable: true
    },
    calculatedValue: 18500,
    agreedValue: 18000,
    grade: 'Grade B (Minor Wear)',
    actionTaken: 'Direct Sale Adjustment',
    voucherCode: 'VOUCHER-EX18K',
    isVoucherUsed: true,
    status: 'Completed',
    inspectorStaff: 'Anish Verma',
    notes: 'Adjusted against INV-2026-0801 iPhone 15 Pro Max purchase.'
  },
  {
    id: 'ex-8802',
    exchangeCode: 'EXCH-2026-002',
    timestamp: '2026-08-07 11:45',
    customerName: 'Vikram Singh',
    customerPhone: '+91 99887 66554',
    customerGovtId: 'PAN ABCPS1234F',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S21 Ultra 5G',
    storageColor: '256GB Phantom Black',
    imeiNumber: '359102938475610',
    condition: {
      screenOk: true,
      screenCondition: 'No Scratch',
      bodyCondition: 'Flawless',
      batteryHealth: 91,
      cameraOk: true,
      biometricsOk: true,
      callingOk: true,
      wifiOk: true,
      boxAvailable: true,
      originalChargerAvailable: true,
      billAvailable: true
    },
    calculatedValue: 27500,
    agreedValue: 28000,
    grade: 'Grade A (Flawless)',
    actionTaken: 'Added to Refurbish Stock',
    status: 'In Refurbish',
    inspectorStaff: 'Rajesh Sharma',
    notes: 'Pristine condition. Sent for display cleaning and battery testing for resale.'
  }
];

export const INITIAL_ORDERS: EcommerceOrder[] = [
  {
    id: 'ord-5001',
    orderNumber: 'ECOMM-9901',
    date: '2026-08-08 09:12',
    customerName: 'Rohan Malhotra',
    customerPhone: '+91 98711 22334',
    customerEmail: 'rohan.m@gmail.com',
    shippingAddress: 'Flat 402, Green Valley Apartments, Sector 62, Noida, UP - 201301',
    items: [
      {
        productId: 'p-4',
        productName: 'Apple AirPods Pro (2nd Gen, USB-C)',
        price: 24900,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=600'
      },
      {
        productId: 'p-6',
        productName: 'Spigen Tough Armor Case - iPhone 15 Pro',
        price: 2199,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1541877944-ac82a091518a?auto=format&fit=crop&q=80&w=600'
      }
    ],
    totalAmount: 27099,
    paymentMethod: 'Prepaid Online',
    paymentStatus: 'Paid',
    orderStatus: 'Confirmed',
    trackingNumber: 'TRK-98127391',
    courierName: 'Bluedart Express'
  },
  {
    id: 'ord-5002',
    orderNumber: 'ECOMM-9902',
    date: '2026-08-07 18:40',
    customerName: 'Megha Gupta',
    customerPhone: '+91 97188 33445',
    customerEmail: 'megha.gupta@yahoo.com',
    shippingAddress: 'House 14, Ring Road, Lajpat Nagar 3, New Delhi - 110024',
    items: [
      {
        productId: 'p-5',
        productName: 'Anker 65W GaN Fast Wall Charger 3-Port',
        price: 3799,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600'
      }
    ],
    totalAmount: 7598,
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
    orderStatus: 'Pending'
  }
];

export const INITIAL_CUSTOMERS: CustomerCreditAccount[] = [
  {
    id: 'cust-101',
    name: 'Suresh Patel',
    phone: '+91 97234 55667',
    email: 'suresh.patel@gmail.com',
    address: 'Shop 12, Main Market, City Center',
    creditLimit: 100000,
    currentBalance: 43999, // Customer owes shop
    lastPaymentDate: '2026-08-01',
    status: 'Active',
    ledgerHistory: [
      {
        id: 'led-1',
        timestamp: '2026-08-08 16:15',
        type: 'Debit (Udhar Given)',
        amount: 43999,
        referenceInvoice: 'INV-2026-0802',
        note: 'Purchase of OnePlus 12 5G - Partial Credit',
        recordedBy: 'Anish Verma'
      }
    ]
  },
  {
    id: 'cust-102',
    name: 'Karan Sharma (Tech Repair Hub)',
    phone: '+91 98991 12233',
    email: 'karan.tech@repair.in',
    address: 'G-45, Electronics Complex',
    creditLimit: 50000,
    currentBalance: 14500,
    lastPaymentDate: '2026-07-25',
    status: 'Overdue Alert',
    ledgerHistory: [
      {
        id: 'led-2',
        timestamp: '2026-07-15 11:20',
        type: 'Debit (Udhar Given)',
        amount: 24500,
        referenceInvoice: 'INV-2026-0711',
        note: 'Bulk Spare Parts Display Screens purchase',
        recordedBy: 'Rajesh Sharma'
      },
      {
        id: 'led-3',
        timestamp: '2026-07-25 15:30',
        type: 'Credit (Payment Received)',
        amount: 10000,
        paymentMode: 'UPI',
        note: 'Part payment via GPay',
        recordedBy: 'Priya Patel'
      }
    ]
  },
  {
    id: 'cust-103',
    name: 'Sunil Rao',
    phone: '+91 98100 44556',
    creditLimit: 30000,
    currentBalance: 0,
    lastPaymentDate: '2026-08-05',
    status: 'Active',
    ledgerHistory: []
  }
];

export const INITIAL_SUPPLIERS: SupplierDebitAccount[] = [
  {
    id: 'sup-201',
    companyName: 'Apex Mobile Wholesalers Pvt Ltd',
    contactPerson: 'Manish Jain',
    phone: '+91 98111 00099',
    email: 'orders@apexmobiles.com',
    address: 'Nehru Place Wholesale Market, Delhi',
    category: 'Smartphones Wholesaler',
    currentPayable: 240000, // Shop owes supplier
    lastTransactionDate: '2026-08-04',
    ledgerHistory: [
      {
        id: 'sled-1',
        timestamp: '2026-08-04 10:00',
        type: 'Purchase Debt',
        amount: 340000,
        referenceInvoice: 'SUP-INV-8891',
        note: '5x iPhone 15 Pro Max & 3x S24 Ultra batch delivery',
        recordedBy: 'Rajesh Sharma'
      },
      {
        id: 'sled-2',
        timestamp: '2026-08-05 17:00',
        type: 'Supplier Paid',
        amount: 100000,
        paymentMode: 'Bank Transfer',
        note: 'RTGS Advance payment',
        recordedBy: 'Rajesh Sharma'
      }
    ]
  },
  {
    id: 'sup-202',
    companyName: 'Spark Accessories Ltd',
    contactPerson: 'Dinesh Mehta',
    phone: '+91 98222 33445',
    email: 'info@sparkaccessories.in',
    category: 'Accessories Distributor',
    currentPayable: 18500,
    lastTransactionDate: '2026-08-02',
    ledgerHistory: [
      {
        id: 'sled-3',
        timestamp: '2026-08-02 14:00',
        type: 'Purchase Debt',
        amount: 18500,
        note: 'Spigen Cases & Anker Chargers restock',
        recordedBy: 'Anish Verma'
      }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-8812',
    orderDate: '2026-08-01',
    expectedDeliveryDate: '2026-08-04',
    partyType: 'Supplier',
    partyId: 'sup-201',
    partyName: 'Apex Mobile Wholesalers Pvt Ltd',
    partyPhone: '+91 98111 00099',
    partyEmail: 'orders@apexmobiles.com',
    partyAddress: 'Nehru Place Wholesale Market, Delhi',
    partyGstin: '07AAAAA1234B1Z9',
    items: [
      {
        id: 'poi-1',
        productId: 'p-1',
        productName: 'iPhone 15 Pro Max',
        brand: 'Apple',
        category: 'Smartphones',
        quantity: 5,
        unitCostPrice: 118000,
        splPrice: 139900,
        expectedSellingPrice: 144900,
        totalCost: 590000,
        imeiNumbers: ['352981029381921', '352981029381922', '352981029381923', '352981029381924', '352981029381925']
      },
      {
        id: 'poi-2',
        productId: 'p-2',
        productName: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        category: 'Smartphones',
        quantity: 5,
        unitCostPrice: 98000,
        splPrice: 119900,
        expectedSellingPrice: 124999,
        totalCost: 490000,
        imeiNumbers: ['358910293847581', '358910293847582', '358910293847583', '358910293847584', '358910293847585']
      }
    ],
    subtotal: 1080000,
    taxAmount: 170000,
    discountAmount: 0,
    totalAmount: 1250000,
    paidAmount: 1250000,
    balanceAmount: 0,
    paymentStatus: 'Paid in Full',
    orderStatus: 'Received & Inwarded',
    referenceInvoiceNo: 'SUP-INV-8812',
    createdBy: 'Rajesh Sharma',
    notes: 'Inward verified and all 10 IMEIs loaded into inventory.'
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-8813',
    orderDate: '2026-08-05',
    expectedDeliveryDate: '2026-08-10',
    partyType: 'Supplier',
    partyId: 'sup-202',
    partyName: 'Spark Accessories Ltd',
    partyPhone: '+91 98222 33445',
    partyEmail: 'info@sparkaccessories.in',
    partyAddress: 'Gaffar Market, Karol Bagh, New Delhi',
    partyGstin: '07BBBBB5678C1Z3',
    items: [
      {
        id: 'poi-3',
        productId: 'p-3',
        productName: 'Apple AirPods Pro (2nd Gen)',
        brand: 'Apple',
        category: 'Accessories',
        quantity: 10,
        unitCostPrice: 18500,
        splPrice: 22900,
        expectedSellingPrice: 23900,
        totalCost: 185000
      }
    ],
    subtotal: 185000,
    taxAmount: 0,
    discountAmount: 5000,
    totalAmount: 180000,
    paidAmount: 50000,
    balanceAmount: 130000,
    paymentStatus: 'Khata Debt Owed',
    orderStatus: 'Issued / Sent',
    referenceInvoiceNo: 'SPK-PO-4091',
    createdBy: 'Priya Patel',
    notes: 'Advance paid ₹50,000. Balance due upon delivery.'
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-8814',
    orderDate: '2026-08-07',
    expectedDeliveryDate: '2026-08-09',
    partyType: 'Customer',
    partyId: 'cust-101',
    partyName: 'Aman Verma',
    partyPhone: '+91 98765 12345',
    partyEmail: 'aman.v@gmail.com',
    partyAddress: 'Flat 402, Green Park Apartments, Sector 15',
    items: [
      {
        id: 'poi-4',
        productName: 'Used OnePlus 11 5G (16GB/256GB)',
        brand: 'OnePlus',
        category: 'Smartphones',
        quantity: 1,
        unitCostPrice: 28000,
        splPrice: 33500,
        expectedSellingPrice: 35000,
        totalCost: 28000,
        imeiNumbers: ['862309102839101']
      }
    ],
    subtotal: 28000,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 28000,
    paidAmount: 28000,
    balanceAmount: 0,
    paymentStatus: 'Paid in Full',
    orderStatus: 'Received & Inwarded',
    referenceInvoiceNo: 'CUST-BUY-902',
    createdBy: 'Rajesh Sharma',
    notes: 'Direct buyback purchase order from customer Aman Verma.'
  }
];

export const INITIAL_JOB_CARDS: any[] = [
  {
    id: 'jc-101',
    jobCardNumber: 'JC-2026-1001',
    createdDate: '2026-08-08',
    promisedDate: '2026-08-10',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 88221',
    customerEmail: 'rahul.s@gmail.com',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 14 Pro',
    imeiOrSerial: '359812039182301',
    passcode: '123456',
    physicalCondition: 'Minor scratches on back glass, no water damage indicator.',
    reportedFault: 'OLED screen cracked after drop. Touch screen unresponsive.',
    diagnosis: 'Original OLED panel damaged. Needs full screen assembly replacement.',
    assignedTechnician: 'Suresh Kumar (Senior Hardware Specialist)',
    estimatedCost: 14500,
    finalCost: 14500,
    advancePaid: 3000,
    balanceDue: 11500,
    status: 'In Progress',
    paymentStatus: 'Advance Received',
    warrantyDays: 90,
    sparePartsUsed: [
      { partName: 'iPhone 14 Pro Original OLED Assembly', costPrice: 9200, sellingPrice: 12500 },
      { partName: 'Waterproof Seal & Adhesive Gasket', costPrice: 300, sellingPrice: 500 }
    ],
    notes: 'Customer requested original Apple display replacement. Advance paid via UPI.'
  },
  {
    id: 'jc-102',
    jobCardNumber: 'JC-2026-1002',
    createdDate: '2026-08-07',
    promisedDate: '2026-08-08',
    customerName: 'Neha Gupta',
    customerPhone: '+91 98111 22334',
    customerEmail: 'neha.g@yahoo.com',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S22 Ultra',
    imeiOrSerial: '351283910283741',
    passcode: '9876',
    physicalCondition: 'Good condition, light pocket scratches.',
    reportedFault: 'Battery drains rapidly within 2 hours. Overheating during charging.',
    diagnosis: 'Battery degradation at 71% capacity. Swollen cell needs immediate replacement.',
    assignedTechnician: 'Amit Verma (Battery & IC Specialist)',
    estimatedCost: 3800,
    finalCost: 3800,
    advancePaid: 3800,
    balanceDue: 0,
    status: 'Ready for Pickup',
    paymentStatus: 'Paid in Full',
    warrantyDays: 180,
    sparePartsUsed: [
      { partName: 'Samsung S22 Ultra 5000mAh Battery', costPrice: 2100, sellingPrice: 3200 }
    ],
    notes: 'Battery replaced, thermal test passed 100%. Customer notified for pickup.'
  },
  {
    id: 'jc-103',
    jobCardNumber: 'JC-2026-1003',
    createdDate: '2026-08-09',
    promisedDate: '2026-08-11',
    customerName: 'Vikram Singh',
    customerPhone: '+91 99887 66554',
    deviceBrand: 'OnePlus',
    deviceModel: 'OnePlus 11 5G',
    imeiOrSerial: '862309102839188',
    physicalCondition: 'Charging port loose, body intact.',
    reportedFault: 'Phone not charging. Type-C cable slips out easily.',
    diagnosis: 'Type-C charging sub-board pin damaged and clogged.',
    assignedTechnician: 'Suresh Kumar (Senior Hardware Specialist)',
    estimatedCost: 1800,
    finalCost: 1800,
    advancePaid: 500,
    balanceDue: 1300,
    status: 'Awaiting Spare Part',
    paymentStatus: 'Advance Received',
    warrantyDays: 30,
    sparePartsUsed: [],
    notes: 'Original OnePlus Type-C board ordered from distributor. Arriving tomorrow morning.'
  },
  {
    id: 'jc-104',
    jobCardNumber: 'JC-2026-1004',
    createdDate: '2026-08-05',
    promisedDate: '2026-08-06',
    customerName: 'Pooja Reddy',
    customerPhone: '+91 97654 32109',
    deviceBrand: 'Xiaomi',
    deviceModel: 'Redmi Note 12 Pro',
    imeiOrSerial: '869281029384712',
    physicalCondition: 'Water exposure in rain.',
    reportedFault: 'No speaker audio sound during calls and media playback.',
    diagnosis: 'Earpiece speaker coil shorted due to moisture.',
    assignedTechnician: 'Vikash Tech',
    estimatedCost: 1200,
    finalCost: 1200,
    advancePaid: 1200,
    balanceDue: 0,
    status: 'Completed & Delivered',
    paymentStatus: 'Paid in Full',
    warrantyDays: 30,
    sparePartsUsed: [
      { partName: 'Redmi Note 12 Pro Speaker Module', costPrice: 400, sellingPrice: 900 }
    ],
    notes: 'Speaker replaced and mother board cleaned with isopropyl alcohol. Device delivered.'
  }
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-101',
    expenseNumber: 'EXP-2026-101',
    date: '2026-08-01',
    category: 'Rent',
    amount: 35000,
    paymentMethod: 'Bank Transfer',
    paidTo: 'Metro Plaza Landlord (Mr. Sharma)',
    notes: 'Monthly shop premises rent for August 2026'
  },
  {
    id: 'exp-102',
    expenseNumber: 'EXP-2026-102',
    date: '2026-08-03',
    category: 'Electricity & Utilities',
    amount: 6850,
    paymentMethod: 'UPI',
    paidTo: 'BSES Electricity Board',
    notes: 'Commercial AC & lighting power bill for July'
  },
  {
    id: 'exp-103',
    expenseNumber: 'EXP-2026-103',
    date: '2026-08-05',
    category: 'Internet & Wifi',
    amount: 1499,
    paymentMethod: 'UPI',
    paidTo: 'Airtel Xstream Fiber Broadband',
    notes: '300 Mbps unlimited store Wi-Fi plan'
  },
  {
    id: 'exp-104',
    expenseNumber: 'EXP-2026-104',
    date: '2026-08-08',
    category: 'Tea & Snacks',
    amount: 450,
    paymentMethod: 'Cash',
    paidTo: 'Raju Tea Stall',
    notes: 'Daily staff tea and customer hospitality refreshments'
  },
  {
    id: 'exp-105',
    expenseNumber: 'EXP-2026-105',
    date: '2026-08-09',
    category: 'Food & Refreshments',
    amount: 850,
    paymentMethod: 'UPI',
    paidTo: 'Swiggy / Haldirams',
    notes: 'Lunch treat for store sales and technician team'
  },
  {
    id: 'exp-106',
    expenseNumber: 'EXP-2026-106',
    date: '2026-08-09',
    category: 'Mobile / DTH Recharge',
    amount: 799,
    paymentMethod: 'UPI',
    paidTo: 'Jio Store Hotline',
    notes: 'Store official WhatsApp hotline phone recharge'
  }
];

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: 'Mobile World Care & Digital Store',
  tagline: 'Sales • Exchange • Accessories • Repairs • Easy EMI',
  address: 'Shop No. 14-15, Main Metro Plaza, MG Road, City Center',
  phone: '+91 98765 43210',
  email: 'contact@mobileworldcare.com',
  gstNumber: '07AAAAA0000A1Z5',
  currencySymbol: '₹',
  taxRatePercent: 18,
  taxInclusive: false,
  enableStockAlerts: true,
  lowStockThreshold: 5,
  defaultWarrantyMonths: 12,
  receiptFooterMessage: 'Thank you for shopping with us! Standard IMEI Warranty terms apply. Exchange or refund valid within 7 days with original invoice.',
  demoApiMode: true,
  apiBaseUrl: 'https://api.mobileshopadmin.com/v1',
  apiKey: 'demo_live_sk_892173918273123'
};
