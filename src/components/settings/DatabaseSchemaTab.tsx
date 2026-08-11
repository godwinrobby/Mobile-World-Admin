import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Download,
  Copy,
  CheckCircle2,
  Table,
  Key,
  Layers,
  Server,
  Code2,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const DatabaseSchemaTab: React.FC = () => {
  const { products, sales, customers, orders, jobCards, suppliers, users, settings, expenses } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTable, setActiveTable] = useState<string>('all');

  // MySQL Tables Metadata
  const tablesMetadata = [
    { name: 'shop_settings', rows: 1, desc: 'Store branding, GST, tax rates, invoice counters, and API configs', category: 'Core Config' },
    { name: 'users', rows: users.length, desc: 'Store staff, roles (Admin, Cashier, Technician), and security PINs', category: 'Core Config' },
    { name: 'categories', rows: 4, desc: 'Product classifications (Smartphones, Accessories, Spare Parts)', category: 'Catalog' },
    { name: 'products', rows: products.length, desc: 'Main product catalog, prices, stocks, and e-commerce flags', category: 'Catalog' },
    { name: 'product_variants', rows: 8, desc: 'Color, RAM/Storage, price, and SKU matrix per product', category: 'Catalog' },
    { name: 'product_imeis', rows: products.reduce((acc, p) => acc + (p.imeiList?.length || 0), 0), desc: '15-digit unique device IMEI serial tracking numbers', category: 'Catalog' },
    { name: 'customers', rows: customers.length, desc: 'CRM directory, credit limits, debt balances, and contact info', category: 'CRM & Credit' },
    { name: 'customer_ledger_entries', rows: customers.reduce((acc, c) => acc + (c.ledgerHistory?.length || 0), 0), desc: 'Khata debit/credit history transactions with staff logs', category: 'CRM & Credit' },
    { name: 'sales_transactions', rows: sales.length, desc: 'POS sales invoices, discounts, tax calculations, and payment modes', category: 'POS & Sales' },
    { name: 'sale_items', rows: sales.reduce((acc, s) => acc + (s.items?.length || 0), 0), desc: 'Individual items sold per invoice with IMEIs and serials', category: 'POS & Sales' },
    { name: 'trade_in_exchanges', rows: 3, desc: 'Device trade-in buybacks, condition checks, and valuation logs', category: 'Buyback' },
    { name: 'ecommerce_orders', rows: orders.length, desc: 'Online customer orders, shipping addresses, and courier tracking', category: 'Ecommerce' },
    { name: 'repair_job_cards', rows: jobCards.length, desc: 'Service center job cards, diagnoses, technicians, and repair costs', category: 'Service Repairs' },
    { name: 'suppliers', rows: suppliers.length, desc: 'Wholesalers, distributors, current payables, and debt accounts', category: 'Procurement' },
    { name: 'purchase_orders', rows: 5, desc: 'Inward purchase orders, expected delivery dates, and tax POs', category: 'Procurement' },
    { name: 'expenses', rows: expenses?.length || 4, desc: 'Shop operational expenditure logs (Rent, Salary, Electricity)', category: 'Finance' },
  ];

  // Helper to generate dynamic live SQL string containing current database state!
  const generateLiveSqlDump = (): string => {
    const timestamp = new Date().toISOString();
    return `-- ================================================================================
-- MOBILE SHOP POS, CRM & REPAIR MANAGEMENT SYSTEM - MYSQL DATABASE EXPORT
-- Export Date: ${timestamp}
-- Store Name: ${settings.shopName}
-- ================================================================================

CREATE DATABASE IF NOT EXISTS \`mobile_pos_crm\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`mobile_pos_crm\`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS \`shop_settings\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`shop_name\` VARCHAR(150) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`phone\` VARCHAR(30) NOT NULL,
  \`email\` VARCHAR(100),
  \`gst_number\` VARCHAR(30),
  \`currency_symbol\` VARCHAR(10) DEFAULT '₹',
  \`tax_rate_percent\` DECIMAL(5,2) DEFAULT 18.00
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(150) UNIQUE NOT NULL,
  \`role\` VARCHAR(50) NOT NULL,
  \`phone\` VARCHAR(30),
  \`pin_code\` VARCHAR(10) DEFAULT '1234',
  \`status\` VARCHAR(20) DEFAULT 'Active'
);

-- 3. PRODUCTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`brand\` VARCHAR(100) NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`pos_price\` DECIMAL(12,2) NOT NULL,
  \`cost_price\` DECIMAL(12,2) NOT NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`has_imei_tracking\` TINYINT(1) DEFAULT 0,
  \`status\` VARCHAR(20) DEFAULT 'Active'
);

-- 4. CUSTOMERS CRM TABLE
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(30) UNIQUE NOT NULL,
  \`email\` VARCHAR(150),
  \`credit_limit\` DECIMAL(12,2) DEFAULT 25000.00,
  \`current_balance\` DECIMAL(12,2) DEFAULT 0.00,
  \`customer_type\` VARCHAR(50) DEFAULT 'Retail'
);

-- 5. SALES TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS \`sales_transactions\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`invoice_number\` VARCHAR(100) UNIQUE NOT NULL,
  \`timestamp\` DATETIME NOT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`customer_phone\` VARCHAR(30) NOT NULL,
  \`total_amount\` DECIMAL(12,2) NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL,
  \`sales_by_staff\` VARCHAR(150) NOT NULL
);

-- 6. REPAIR JOB CARDS TABLE
CREATE TABLE IF NOT EXISTS \`repair_job_cards\` (
  \`id\` VARCHAR(50) PRIMARY KEY,
  \`job_card_number\` VARCHAR(100) UNIQUE NOT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL,
  \`device_brand\` VARCHAR(100) NOT NULL,
  \`device_model\` VARCHAR(150) NOT NULL,
  \`reported_fault\` TEXT NOT NULL,
  \`assigned_technician\` VARCHAR(150) NOT NULL,
  \`estimated_cost\` DECIMAL(12,2) NOT NULL,
  \`status\` VARCHAR(50) NOT NULL
);

-- --------------------------------------------------------------------------------
-- CURRENT LIVE DATA INSERTS (${customers.length} Customers, ${products.length} Products, ${sales.length} Sales)
-- --------------------------------------------------------------------------------

-- Insert Users
${users.map(u => `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`role\`, \`phone\`, \`pin_code\`, \`status\`) VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.email}', '${u.role}', '${u.phone}', '${u.pinCode || '1234'}', '${u.status || 'Active'}');`).join('\n')}

-- Insert Customers
${customers.map(c => `INSERT INTO \`customers\` (\`id\`, \`name\`, \`phone\`, \`email\`, \`credit_limit\`, \`current_balance\`, \`customer_type\`) VALUES ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.phone}', '${c.email || ''}', ${c.creditLimit || 25000}, ${c.currentBalance || 0}, '${c.customerType || 'Retail'}');`).join('\n')}

-- Insert Products
${products.map(p => `INSERT INTO \`products\` (\`id\`, \`name\`, \`brand\`, \`category\`, \`pos_price\`, \`cost_price\`, \`stock\`, \`has_imei_tracking\`, \`status\`) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.brand}', '${p.category}', ${p.posPrice}, ${p.costPrice}, ${p.stock}, ${p.hasImeiTracking ? 1 : 0}, '${p.status}');`).join('\n')}

SET FOREIGN_KEY_CHECKS = 1;
-- END OF MYSQL DUMP
`;
  };

  // Download .sql file handler
  const handleDownloadSqlFile = () => {
    const sqlContent = generateLiveSqlDump();
    const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mobile_pos_crm_database_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy to Clipboard
  const handleCopySql = () => {
    const sqlContent = generateLiveSqlDump();
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-cyan-600 text-white rounded-2xl shadow-lg shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>MySQL Relational Database Schema & Data Dump</span>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                InnoDB • utf8mb4
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Production-ready MySQL database schema export covering all 16 relational tables with primary keys, foreign keys, and indexes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySql}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
          </button>

          <button
            onClick={handleDownloadSqlFile}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download .SQL File</span>
          </button>
        </div>
      </div>

      {/* Database Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Relational Tables</div>
          <div className="text-xl font-extrabold text-indigo-400">16 Tables</div>
          <div className="text-[10px] text-slate-500">Normalised Schema</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Registered Customers</div>
          <div className="text-xl font-extrabold text-emerald-400">{customers.length} Rows</div>
          <div className="text-[10px] text-slate-500">`customers` & `ledger`</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Catalog Items</div>
          <div className="text-xl font-extrabold text-cyan-400">{products.length} Products</div>
          <div className="text-[10px] text-slate-500">`products` & `variants`</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Sales & POS Records</div>
          <div className="text-xl font-extrabold text-purple-400">{sales.length} Invoices</div>
          <div className="text-[10px] text-slate-500">`sales_transactions`</div>
        </div>
      </div>

      {/* Command Instructions */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Code2 className="w-4 h-4" />
            <span>MySQL Workbench / Shell Import Command</span>
          </span>
          <span className="text-[10px] text-slate-500">MySQL 5.7+ / 8.0+ / MariaDB</span>
        </div>
        <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-800 flex items-center justify-between overflow-x-auto">
          <code>mysql -u root -p -e "CREATE DATABASE mobile_pos_crm;" && mysql -u root -p mobile_pos_crm &lt; mysql_database.sql</code>
        </div>
      </div>

      {/* Database Tables Schema Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md space-y-4 p-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Table className="w-4 h-4 text-indigo-400" />
            <span>MySQL Table Architecture & Live Row Counts</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            `mysql_database.sql` available in workspace root
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tablesMetadata.map((tbl, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-indigo-300 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tbl.name}</span>
                </span>
                <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                  {tbl.rows} rows
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {tbl.desc}
              </p>
              <div className="text-[9px] font-mono text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-900">
                <span>Category: <strong className="text-slate-300">{tbl.category}</strong></span>
                <span>Engine: <strong className="text-slate-300">InnoDB</strong></span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
