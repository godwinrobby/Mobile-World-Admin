-- ================================================================================
-- MOBILE POS, CRM, E-COMMERCE & REPAIR MANAGEMENT SYSTEM
-- FULL MYSQL DATABASE SCHEMA & INITIAL DATA DUMP
-- Database Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Generated for MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- ================================================================================

CREATE DATABASE IF NOT EXISTS `mobile_pos_crm` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `mobile_pos_crm`;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET TIME_ZONE = "+00:00";

-- --------------------------------------------------------------------------------
-- 1. SHOP & STORE CONFIGURATION TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `shop_settings`;
CREATE TABLE `shop_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `shop_name` VARCHAR(150) NOT NULL DEFAULT 'Mobile World & Care',
  `tagline` VARCHAR(255) DEFAULT 'Smartphones, Accessories & Multi-Brand Service Center',
  `address` TEXT NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `gst_number` VARCHAR(30) DEFAULT NULL,
  `currency_symbol` VARCHAR(10) NOT NULL DEFAULT '₹',
  `tax_rate_percent` DECIMAL(5,2) NOT NULL DEFAULT 18.00,
  `tax_inclusive` TINYINT(1) NOT NULL DEFAULT 0,
  `enable_stock_alerts` TINYINT(1) NOT NULL DEFAULT 1,
  `low_stock_threshold` INT NOT NULL DEFAULT 5,
  `default_warranty_months` INT NOT NULL DEFAULT 12,
  `receipt_footer_message` TEXT DEFAULT NULL,
  `website_url` VARCHAR(255) DEFAULT 'https://mobileworldcare.com',
  `logo_url` TEXT DEFAULT NULL,
  `support_email` VARCHAR(100) DEFAULT NULL,
  `support_phone` VARCHAR(30) DEFAULT NULL,
  
  -- Payment Gateway Config
  `payment_gateway_provider` ENUM('Razorpay', 'PhonePe', 'Paytm', 'Stripe', 'Offline Cash/UPI') DEFAULT 'Razorpay',
  `payment_gateway_mode` ENUM('Test Sandbox', 'Live Production') DEFAULT 'Test Sandbox',
  `payment_gateway_key_id` VARCHAR(255) DEFAULT NULL,
  `payment_gateway_secret_key` VARCHAR(255) DEFAULT NULL,
  `payment_gateway_merchant_id` VARCHAR(255) DEFAULT NULL,
  `auto_verify_upi_status` TINYINT(1) DEFAULT 1,

  -- WhatsApp API Config
  `whatsapp_api_provider` ENUM('Meta Cloud API', 'Twilio WhatsApp', 'WATI Gateway', 'Custom Webhook') DEFAULT 'Meta Cloud API',
  `whatsapp_api_token` TEXT DEFAULT NULL,
  `whatsapp_phone_number_id` VARCHAR(100) DEFAULT NULL,
  `whatsapp_business_number` VARCHAR(30) DEFAULT NULL,
  `auto_send_invoice_whatsapp` TINYINT(1) DEFAULT 1,
  `auto_send_job_card_updates_whatsapp` TINYINT(1) DEFAULT 1,

  -- Email API Config
  `email_api_provider` ENUM('SMTP', 'SendGrid', 'Resend', 'Mailgun') DEFAULT 'SMTP',
  `email_smtp_host` VARCHAR(255) DEFAULT NULL,
  `email_smtp_port` INT DEFAULT 587,
  `email_smtp_user` VARCHAR(255) DEFAULT NULL,
  `email_smtp_password` VARCHAR(255) DEFAULT NULL,
  `email_from_address` VARCHAR(255) DEFAULT NULL,
  `auto_email_invoice_receipts` TINYINT(1) DEFAULT 1,

  -- Invoice Formatting & Legal Config
  `invoice_prefix` VARCHAR(30) DEFAULT 'INV-MWC-',
  `repair_job_card_prefix` VARCHAR(30) DEFAULT 'JC-MWC-',
  `invoice_header_title` VARCHAR(255) DEFAULT 'RETAIL TAX INVOICE & DIGITAL RECEIPT',
  `invoice_header_note` TEXT DEFAULT NULL,
  `custom_invoice_footer_note` TEXT DEFAULT NULL,
  `terms_and_conditions` TEXT DEFAULT NULL,
  `return_policy_text` TEXT DEFAULT NULL,
  `authorized_signatory_name` VARCHAR(150) DEFAULT 'Authorized Store Manager',
  `show_shop_logo_on_invoice` TINYINT(1) DEFAULT 1,
  `show_qr_code_on_invoice` TINYINT(1) DEFAULT 1,
  `invoice_theme_color` VARCHAR(20) DEFAULT '#4f46e5',

  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 2. USERS & STAFF TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) UNIQUE DEFAULT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) DEFAULT NULL,
  `pin_code` VARCHAR(10) DEFAULT '1234',
  `role` ENUM('Admin', 'Manager', 'Sales Executive', 'Cashier', 'Repair Technician') NOT NULL DEFAULT 'Sales Executive',
  `phone` VARCHAR(30) NOT NULL,
  `avatar` TEXT DEFAULT NULL,
  `status` ENUM('Active', 'Suspended', 'Inactive') NOT NULL DEFAULT 'Active',
  `permissions_json` JSON DEFAULT NULL,
  `last_active` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 3. PRODUCT CATEGORIES & BRANDS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `slug` VARCHAR(100) UNIQUE NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) UNIQUE NOT NULL,
  `logo_url` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 4. PRODUCTS CATALOG TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `sku` VARCHAR(100) UNIQUE DEFAULT NULL,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `pos_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `online_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `spl_price` DECIMAL(12,2) DEFAULT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `image` TEXT DEFAULT NULL,
  `images_json` JSON DEFAULT NULL,
  `has_imei_tracking` TINYINT(1) NOT NULL DEFAULT 0,
  `featured_in_ecommerce` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('Active', 'Out of Stock', 'Draft') NOT NULL DEFAULT 'Active',
  `specifications_json` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product_category` (`category`),
  INDEX `idx_product_brand` (`brand`),
  INDEX `idx_product_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 5. PRODUCT VARIANTS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `ram_storage` VARCHAR(50) DEFAULT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `sku` VARCHAR(100) DEFAULT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 6. PRODUCT IMEI TRACKING TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `product_imeis`;
CREATE TABLE `product_imeis` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL,
  `imei_number` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('Available', 'Sold', 'Reserved', 'Defective') DEFAULT 'Available',
  `purchase_invoice_no` VARCHAR(100) DEFAULT NULL,
  `sold_invoice_no` VARCHAR(100) DEFAULT NULL,
  `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  INDEX `idx_imei_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 7. CUSTOMERS & CREDIT ACCOUNTS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL UNIQUE,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `customer_type` ENUM('Retail', 'Wholesale', 'VIP', 'Corporate', 'Walk-in') DEFAULT 'Retail',
  `credit_limit` DECIMAL(12,2) DEFAULT 25000.00,
  `current_balance` DECIMAL(12,2) DEFAULT 0.00, -- Positive = owes shop money (Udhar)
  `gstin` VARCHAR(30) DEFAULT NULL,
  `status` ENUM('Active', 'Blocked', 'Overdue Alert') DEFAULT 'Active',
  `notes` TEXT DEFAULT NULL,
  `last_payment_date` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_phone` (`phone`),
  INDEX `idx_customer_type` (`customer_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 8. CUSTOMER LEDGER ENTRIES (UDHAR / PAYMENTS)
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `customer_ledger_entries`;
CREATE TABLE `customer_ledger_entries` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customer_id` VARCHAR(50) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` ENUM('Debit (Udhar Given)', 'Credit (Payment Received)') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_mode` ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque') DEFAULT NULL,
  `reference_invoice` VARCHAR(100) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `recorded_by` VARCHAR(150) NOT NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 9. SALES TRANSACTIONS (POS BILLS)
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sales_transactions`;
CREATE TABLE `sales_transactions` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `invoice_number` VARCHAR(100) NOT NULL UNIQUE,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_id` VARCHAR(50) DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `trade_in_credit_applied` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `balance_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00, -- >0 means added to customer Udhar
  `payment_method` ENUM('Cash', 'Card', 'UPI / QR', 'Store Credit / Udhar', 'Split Payment') NOT NULL,
  `sales_by_staff` VARCHAR(150) NOT NULL,
  `status` ENUM('Completed', 'Refunded', 'Partially Paid') DEFAULT 'Completed',
  `warranty_period_months` INT DEFAULT 12,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sales_invoice` (`invoice_number`),
  INDEX `idx_sales_customer_phone` (`customer_phone`),
  INDEX `idx_sales_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 10. SALE LINE ITEMS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sale_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `imei` VARCHAR(50) DEFAULT NULL,
  `ram_storage` VARCHAR(50) DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  FOREIGN KEY (`sale_id`) REFERENCES `sales_transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 11. DEVICE BUYBACKS & TRADE-IN EXCHANGES
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `trade_in_exchanges`;
CREATE TABLE `trade_in_exchanges` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `exchange_code` VARCHAR(100) NOT NULL UNIQUE,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `customer_govt_id` VARCHAR(100) DEFAULT NULL,
  `device_brand` VARCHAR(100) NOT NULL,
  `device_model` VARCHAR(150) NOT NULL,
  `storage_color` VARCHAR(100) DEFAULT NULL,
  `imei_number` VARCHAR(50) NOT NULL,
  `condition_json` JSON NOT NULL,
  `calculated_value` DECIMAL(12,2) NOT NULL,
  `agreed_value` DECIMAL(12,2) NOT NULL,
  `grade` VARCHAR(50) NOT NULL,
  `action_taken` ENUM('Store Credit Voucher', 'Cash Paid', 'Added to Refurbish Stock', 'Direct Sale Adjustment') NOT NULL,
  `voucher_code` VARCHAR(100) DEFAULT NULL,
  `is_voucher_used` TINYINT(1) DEFAULT 0,
  `status` ENUM('Completed', 'Pending Inspection', 'In Refurbish', 'Resold') DEFAULT 'Completed',
  `inspector_staff` VARCHAR(150) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 12. ECOMMERCE ORDERS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `ecommerce_orders`;
CREATE TABLE `ecommerce_orders` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `order_number` VARCHAR(100) NOT NULL UNIQUE,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `customer_email` VARCHAR(150) DEFAULT NULL,
  `shipping_address` TEXT NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('COD', 'Prepaid Online') NOT NULL DEFAULT 'COD',
  `payment_status` ENUM('Paid', 'Pending') DEFAULT 'Pending',
  `order_status` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
  `tracking_number` VARCHAR(100) DEFAULT NULL,
  `courier_name` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ecommerce_order_items`;
CREATE TABLE `ecommerce_order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `image` TEXT DEFAULT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `ecommerce_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 13. REPAIR SERVICE JOB CARDS
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `repair_job_cards`;
CREATE TABLE `repair_job_cards` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `job_card_number` VARCHAR(100) NOT NULL UNIQUE,
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `promised_date` DATETIME DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `customer_email` VARCHAR(150) DEFAULT NULL,
  `device_brand` VARCHAR(100) NOT NULL,
  `device_model` VARCHAR(150) NOT NULL,
  `imei_or_serial` VARCHAR(50) NOT NULL,
  `passcode` VARCHAR(50) DEFAULT NULL,
  `physical_condition` TEXT DEFAULT NULL,
  `reported_fault` TEXT NOT NULL,
  `diagnosis` TEXT DEFAULT NULL,
  `assigned_technician` VARCHAR(150) NOT NULL,
  `estimated_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `final_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `advance_paid` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `balance_due` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Received / Diagnostic', 'In Progress', 'Awaiting Spare Part', 'Ready for Pickup', 'Completed & Delivered', 'Cancelled') DEFAULT 'Received / Diagnostic',
  `payment_status` ENUM('Pending', 'Advance Received', 'Paid in Full') DEFAULT 'Pending',
  `warranty_days` INT DEFAULT 30,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `repair_spare_parts_used`;
CREATE TABLE `repair_spare_parts_used` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_card_id` VARCHAR(50) NOT NULL,
  `part_name` VARCHAR(255) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (`job_card_id`) REFERENCES `repair_job_cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 14. SUPPLIERS & WHOLESALERS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `category` ENUM('Smartphones Wholesaler', 'Accessories Distributor', 'Spare Parts Supplier') NOT NULL,
  `current_payable` DECIMAL(12,2) DEFAULT 0.00, -- Positive = shop owes wholesaler
  `last_transaction_date` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `supplier_ledger_entries`;
CREATE TABLE `supplier_ledger_entries` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `supplier_id` VARCHAR(50) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` ENUM('Purchase Debt', 'Supplier Paid') NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_mode` ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque') DEFAULT NULL,
  `reference_invoice` VARCHAR(100) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `recorded_by` VARCHAR(150) NOT NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 15. PURCHASE ORDERS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `po_number` VARCHAR(100) NOT NULL UNIQUE,
  `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expected_delivery_date` DATETIME DEFAULT NULL,
  `party_type` ENUM('Supplier', 'Customer', 'Wholesaler') NOT NULL DEFAULT 'Supplier',
  `party_id` VARCHAR(50) DEFAULT NULL,
  `party_name` VARCHAR(150) NOT NULL,
  `party_phone` VARCHAR(30) NOT NULL,
  `party_email` VARCHAR(150) DEFAULT NULL,
  `party_address` TEXT DEFAULT NULL,
  `party_gstin` VARCHAR(30) DEFAULT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `balance_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('Paid in Full', 'Partially Paid', 'Khata Debt Owed', 'Pending') DEFAULT 'Pending',
  `order_status` ENUM('Draft', 'Issued / Sent', 'Received & Inwarded', 'Cancelled') DEFAULT 'Draft',
  `notes` TEXT DEFAULT NULL,
  `created_by` VARCHAR(150) NOT NULL,
  `reference_invoice_no` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) DEFAULT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_cost_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `spl_price` DECIMAL(12,2) DEFAULT NULL,
  `expected_selling_price` DECIMAL(12,2) DEFAULT NULL,
  `tax_percent` DECIMAL(5,2) DEFAULT 18.00,
  `total_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `imei_numbers_json` JSON DEFAULT NULL,
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- --------------------------------------------------------------------------------
-- 16. SHOP EXPENSE LOGS TABLE
-- --------------------------------------------------------------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `expense_number` VARCHAR(100) NOT NULL UNIQUE,
  `date` DATE NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('Cash', 'UPI', 'Card', 'Bank Transfer', 'Other') NOT NULL DEFAULT 'Cash',
  `paid_to` VARCHAR(150) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_by` VARCHAR(150) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_expense_date` (`date`),
  INDEX `idx_expense_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================================
-- SEED DATA INSERTS
-- ================================================================================

-- 1. Shop Settings Seed
INSERT INTO `shop_settings` (
  `id`, `shop_name`, `tagline`, `address`, `phone`, `email`, `gst_number`, `currency_symbol`, `tax_rate_percent`
) VALUES (
  1, 'Mobile World & Care', 'Smartphones, Accessories & Multi-Brand Service Center',
  'Shop 14, Main Electronics Market, Karol Bagh, New Delhi, India 110005',
  '+91 98765 43210', 'sales@mobileworldcare.com', '07AAAAA0000A1Z5', '₹', 18.00
);

-- 2. Staff Users Seed
INSERT INTO `users` (`id`, `name`, `username`, `email`, `password_hash`, `pin_code`, `role`, `phone`, `status`) VALUES
('usr-1', 'Rajesh Kumar', 'admin', 'admin@mobileworld.com', '$2a$10$e8R5.wO7lXG6.0u...adminhash', '1234', 'Admin', '+91 98765 43210', 'Active'),
('usr-2', 'Priya Sharma', 'priya', 'priya@mobileworld.com', '$2a$10$e8R5.wO7lXG6.0u...saleshash', '1111', 'Sales Executive', '+91 98111 22233', 'Active'),
('usr-3', 'Amit Verma', 'amit', 'tech.amit@mobileworld.com', '$2a$10$e8R5.wO7lXG6.0u...techhash', '2222', 'Repair Technician', '+91 98222 33344', 'Active');

-- 3. Categories Seed
INSERT INTO `categories` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Smartphones', 'smartphones', 'Flagship & budget mobile phones'),
(2, 'Accessories', 'accessories', 'Chargers, cases, screen guards, audio'),
(3, 'Spare Parts', 'spare-parts', 'Screens, batteries, charging ports'),
(4, 'Services & Repairs', 'services-repairs', 'Hardware & software repair services');

-- 4. Sample Products Seed
INSERT INTO `products` (
  `id`, `name`, `brand`, `category`, `description`, `sku`, `pos_price`, `online_price`, `cost_price`, `stock`, `image`, `has_imei_tracking`, `featured_in_ecommerce`, `status`
) VALUES
('prod-1', 'Apple iPhone 15 (128GB - Blue)', 'Apple', 'Smartphones', 'Latest iPhone with Dynamic Island and 48MP main camera', 'IPH15-128-BLU', 72990.00, 74990.00, 65000.00, 8, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', 1, 1, 'Active'),
('prod-2', 'Samsung Galaxy S24 Ultra (256GB - Titanium Gray)', 'Samsung', 'Smartphones', 'Galaxy AI powered flagship with built-in S Pen', 'S24U-256-GRY', 129999.00, 131999.00, 115000.00, 5, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80', 1, 1, 'Active'),
('prod-3', 'OnePlus 12 (256GB - Silky Black)', 'OnePlus', 'Smartphones', 'Snapdragon 8 Gen 3 with 100W SuperVOOC Fast Charging', 'OP12-256-BLK', 64999.00, 66999.00, 57000.00, 3, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80', 1, 1, 'Active'),
('prod-4', 'Anker 20W USB-C Fast Charger', 'Anker', 'Accessories', 'Ultra compact PowerPort PD Charger for iPhone & Android', 'ANK-20W-WHT', 1499.00, 1699.00, 850.00, 25, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80', 0, 1, 'Active');

-- 5. Product IMEIs Seed
INSERT INTO `product_imeis` (`product_id`, `imei_number`, `status`) VALUES
('prod-1', '356789101112131', 'Available'),
('prod-1', '356789101112132', 'Available'),
('prod-2', '358912345678901', 'Available'),
('prod-3', '864201234567890', 'Available');

-- 6. Customers Seed
INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `address`, `city`, `customer_type`, `credit_limit`, `current_balance`, `status`) VALUES
('cust-1', 'Rahul Sharma', '+91 98765 00001', 'rahul.s@gmail.com', 'A-42 Vikas Puri', 'New Delhi', 'Retail', 25000.00, 1500.00, 'Active'),
('cust-2', 'Suresh Gupta', '+91 98765 00002', 'suresh.gupta@wholesalemobile.in', 'Shop 11, Gaffar Market', 'New Delhi', 'Wholesale', 100000.00, 18500.00, 'Active'),
('cust-3', 'Neha Patel', '+91 98765 00003', 'neha.p@yahoo.com', 'Flat 302, Green Park', 'New Delhi', 'VIP', 50000.00, 0.00, 'Active');

-- 7. Sales Seed
INSERT INTO `sales_transactions` (
  `id`, `invoice_number`, `timestamp`, `customer_name`, `customer_phone`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `paid_amount`, `balance_amount`, `payment_method`, `sales_by_staff`, `status`
) VALUES (
  'sale-1001', 'INV-MWC-2026-1001', NOW(), 'Rahul Sharma', '+91 98765 00001', 72990.00, 13138.20, 2000.00, 84128.20, 82628.20, 1500.00, 'UPI / QR', 'Priya Sharma', 'Completed'
);

INSERT INTO `sale_items` (`sale_id`, `product_id`, `product_name`, `brand`, `quantity`, `unit_price`, `discount`, `imei`) VALUES
('sale-1001', 'prod-1', 'Apple iPhone 15 (128GB - Blue)', 'Apple', 1, 72990.00, 2000.00, '356789101112130');

-- 8. Repair Job Cards Seed
INSERT INTO `repair_job_cards` (
  `id`, `job_card_number`, `created_date`, `promised_date`, `customer_name`, `customer_phone`, `device_brand`, `device_model`, `imei_or_serial`, `reported_fault`, `assigned_technician`, `estimated_cost`, `final_cost`, `advance_paid`, `balance_due`, `status`, `payment_status`
) VALUES (
  'jc-1001', 'JC-MWC-2026-1001', NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY), 'Neha Patel', '+91 98765 00003', 'Apple', 'iPhone 13 Pro', '359123847281920', 'Cracked Display Glass & Touch unresponsive', 'Amit Verma', 12500.00, 12500.00, 3000.00, 9500.00, 'In Progress', 'Advance Received'
);

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================================
-- END OF DATABASE DUMP
-- ================================================================================
