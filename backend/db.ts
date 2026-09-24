import fs from 'fs';
import path from 'path';
import {
  Tenant, User, TenantUser, Product, Category, Brand, InventoryItem,
  InventoryMovement, Customer, Supplier, PurchaseOrder, Order, Expense,
  Coupon, StoreSettings, StoreDomain, Subscription, AuditLog, DashboardMetrics,
  PlatformMetrics, OrderItem, OrderStatus, PaymentStatus, MovementType, Plan
} from '../src/types';

const DATA_FILE = path.join(process.cwd(), 'stockoja_db.json');

export interface DatabaseSchema {
  tenants: Tenant[];
  users: User[];
  tenantUsers: TenantUser[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  inventoryItems: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  orders: Order[];
  expenses: Expense[];
  coupons: Coupon[];
  storeSettings: StoreSettings[];
  storeDomains: StoreDomain[];
  subscriptions: Subscription[];
  auditLogs: AuditLog[];
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'NGN',
    maxProducts: 25,
    maxUsers: 1,
    maxOrdersPerMonth: 100,
    features: ['Basic POS', '25 Products', '1 User', 'Standard Receipts', 'Online Storefront']
  },
  {
    id: 'BASIC',
    name: 'Growth SME',
    priceMonthly: 15000,
    priceYearly: 150000,
    currency: 'NGN',
    maxProducts: 250,
    maxUsers: 3,
    maxOrdersPerMonth: 1000,
    features: ['Full POS & Barcode', '250 Products', '3 Team Accounts', 'Custom Receipts', 'Supplier & PO Tracking', 'Expense Logging']
  },
  {
    id: 'PRO',
    name: 'Pro Commerce',
    priceMonthly: 35000,
    priceYearly: 350000,
    currency: 'NGN',
    maxProducts: 2500,
    maxUsers: 10,
    maxOrdersPerMonth: 10000,
    features: ['Unlimited Products', '10 Team Accounts', 'Multi-Warehouse', 'Store Customization & Domain', 'Automated Low-Stock Alerts', 'Export Reports & CSV']
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Scale',
    priceMonthly: 85000,
    priceYearly: 850000,
    currency: 'NGN',
    maxProducts: 100000,
    maxUsers: 50,
    maxOrdersPerMonth: 500000,
    features: ['Unlimited Everything', 'Dedicated Account Manager', 'Custom Domain SSL', 'Priority API Webhooks', 'Audit Logs & SLA']
  }
];

function getInitialData(): DatabaseSchema {
  const t1Id = 'tenant_lagos_tech';
  const t2Id = 'tenant_kano_fabrics';
  const uOwner1Id = 'usr_owner_1';
  const uStaff1Id = 'usr_cashier_1';
  const uOwner2Id = 'usr_owner_2';
  const uAdminId = 'usr_super_admin';

  return {
    tenants: [
      {
        id: t1Id,
        name: 'Lagos Tech Gadgets Ltd',
        slug: 'lagos-tech',
        industry: 'Electronics & Gadgets',
        logoUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
        address: '14 Ikeja Computer Village, Lagos, Nigeria',
        phone: '+234 803 123 4567',
        email: 'sales@lagostech.com',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        status: 'ACTIVE',
        planId: 'PRO',
        createdAt: '2026-01-10T08:00:00.000Z'
      },
      {
        id: t2Id,
        name: 'Kano Textile & Fabrics',
        slug: 'kano-fabrics',
        industry: 'Apparel & Fashion',
        logoUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
        address: '45 Kwari Market, Kano, Nigeria',
        phone: '+234 806 987 6543',
        email: 'info@kanofabrics.com',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        status: 'ACTIVE',
        planId: 'BASIC',
        createdAt: '2026-02-01T10:00:00.000Z'
      }
    ],
    users: [
      {
        id: uAdminId,
        email: 'admin@stockoja.com',
        name: 'Platform Super Admin',
        phone: '+234 800 000 0000',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: uOwner1Id,
        email: 'adebayo@lagostech.com',
        name: 'Adebayo Ogunlesi',
        phone: '+234 803 123 4567',
        status: 'ACTIVE',
        createdAt: '2026-01-10T08:00:00.000Z'
      },
      {
        id: uStaff1Id,
        email: 'chioma@lagostech.com',
        name: 'Chioma Okeke (Cashier)',
        phone: '+234 802 444 5555',
        status: 'ACTIVE',
        createdAt: '2026-01-15T09:00:00.000Z'
      },
      {
        id: uOwner2Id,
        email: 'aminu@kanofabrics.com',
        name: 'Aminu Kano',
        phone: '+234 806 987 6543',
        status: 'ACTIVE',
        createdAt: '2026-02-01T10:00:00.000Z'
      }
    ],
    tenantUsers: [
      {
        id: 'tu_1',
        tenantId: t1Id,
        userId: uOwner1Id,
        role: 'OWNER',
        user: {
          id: uOwner1Id,
          email: 'adebayo@lagostech.com',
          name: 'Adebayo Ogunlesi',
          phone: '+234 803 123 4567',
          status: 'ACTIVE',
          createdAt: '2026-01-10T08:00:00.000Z'
        },
        joinedAt: '2026-01-10T08:00:00.000Z'
      },
      {
        id: 'tu_2',
        tenantId: t1Id,
        userId: uStaff1Id,
        role: 'CASHIER',
        user: {
          id: uStaff1Id,
          email: 'chioma@lagostech.com',
          name: 'Chioma Okeke (Cashier)',
          phone: '+234 802 444 5555',
          status: 'ACTIVE',
          createdAt: '2026-01-15T09:00:00.000Z'
        },
        joinedAt: '2026-01-15T09:00:00.000Z'
      },
      {
        id: 'tu_3',
        tenantId: t2Id,
        userId: uOwner2Id,
        role: 'OWNER',
        user: {
          id: uOwner2Id,
          email: 'aminu@kanofabrics.com',
          name: 'Aminu Kano',
          phone: '+234 806 987 6543',
          status: 'ACTIVE',
          createdAt: '2026-02-01T10:00:00.000Z'
        },
        joinedAt: '2026-02-01T10:00:00.000Z'
      }
    ],
    categories: [
      { id: 'cat_phones', tenantId: t1Id, name: 'Smart Phones', slug: 'smart-phones', description: 'iOS and Android flagship smartphones' },
      { id: 'cat_laptops', tenantId: t1Id, name: 'Laptops & Computers', slug: 'laptops-computing', description: 'MacBooks, Windows UltraBooks & PC Accessories' },
      { id: 'cat_audio', tenantId: t1Id, name: 'Audio & Sound', slug: 'audio-sound', description: 'Headphones, earbuds and Bluetooth speakers' },
      { id: 'cat_watches', tenantId: t1Id, name: 'Smart Watches', slug: 'smart-watches', description: 'Apple Watch, Samsung Galaxy Gear & Fitness bands' },
      { id: 'cat_acc', tenantId: t1Id, name: 'Accessories & Power', slug: 'accessories-power', description: 'Fast chargers, GaN adapters, cables & power banks' },
      { id: 'cat_bazin', tenantId: t2Id, name: 'Bazin Riche', slug: 'bazin-riche', description: 'High-grade damask & Bazin fabric' },
      { id: 'cat_ankara', tenantId: t2Id, name: 'Ankara Prints', slug: 'ankara-prints', description: 'African wax prints & Hollandis' }
    ],
    brands: [
      { id: 'br_apple', tenantId: t1Id, name: 'Apple' },
      { id: 'br_samsung', tenantId: t1Id, name: 'Samsung' },
      { id: 'br_anker', tenantId: t1Id, name: 'Anker' },
      { id: 'br_jbl', tenantId: t1Id, name: 'JBL' },
      { id: 'br_getzner', tenantId: t2Id, name: 'Getzner' }
    ],
    products: [
      {
        id: 'prod_ip15pro',
        tenantId: t1Id,
        name: 'iPhone 15 Pro Max 256GB Natural Titanium',
        slug: 'iphone-15-pro-max-256gb',
        sku: 'APL-IP15PM-256',
        barcode: '194253109282',
        description: 'Apple A17 Pro chip, Titanium design, Action button, 48MP camera system.',
        categoryId: 'cat_phones',
        categoryName: 'Smart Phones',
        brandId: 'br_apple',
        brandName: 'Apple',
        price: 1850000,
        costPrice: 1650000,
        stockQuantity: 12,
        lowStockThreshold: 3,
        imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop',
        status: 'ACTIVE',
        isStorefrontVisible: true,
        variants: [
          { id: 'v_ip15_nat', sku: 'APL-IP15PM-256-NAT', name: 'Natural Titanium', attributes: { color: 'Natural Titanium' }, price: 1850000, costPrice: 1650000, stockQuantity: 8 },
          { id: 'v_ip15_blk', sku: 'APL-IP15PM-256-BLK', name: 'Black Titanium', attributes: { color: 'Black Titanium' }, price: 1850000, costPrice: 1650000, stockQuantity: 4 }
        ],
        createdAt: '2026-01-11T10:00:00.000Z',
        updatedAt: '2026-08-10T12:00:00.000Z'
      },
      {
        id: 'prod_s24u',
        tenantId: t1Id,
        name: 'Samsung Galaxy S24 Ultra 512GB Titanium Grey',
        slug: 'samsung-galaxy-s24-ultra-512gb',
        sku: 'SAM-S24U-512',
        barcode: '880609520194',
        description: 'Galaxy AI, Snapdragon 8 Gen 3, S-Pen included, 200MP Quad Telephoto Camera.',
        categoryId: 'cat_phones',
        categoryName: 'Smart Phones',
        brandId: 'br_samsung',
        brandName: 'Samsung',
        price: 1720000,
        costPrice: 1520000,
        stockQuantity: 2, // LOW STOCK TRIGGER
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop',
        status: 'ACTIVE',
        isStorefrontVisible: true,
        variants: [],
        createdAt: '2026-01-12T11:00:00.000Z',
        updatedAt: '2026-08-12T09:00:00.000Z'
      },
      {
        id: 'prod_macm3',
        tenantId: t1Id,
        name: 'MacBook Air 15-inch M3 16GB / 512GB Midnight',
        slug: 'macbook-air-15-m3-16gb-512gb',
        sku: 'APL-MBA15-M3',
        barcode: '194253819201',
        description: 'Supercharged by M3 chip, Liquid Retina Display, 18 hours battery life.',
        categoryId: 'cat_laptops',
        categoryName: 'Laptops & Computers',
        brandId: 'br_apple',
        brandName: 'Apple',
        price: 2150000,
        costPrice: 1900000,
        stockQuantity: 6,
        lowStockThreshold: 2,
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
        status: 'ACTIVE',
        isStorefrontVisible: true,
        variants: [],
        createdAt: '2026-01-15T14:00:00.000Z',
        updatedAt: '2026-08-01T10:00:00.000Z'
      },
      {
        id: 'prod_anker_q45',
        tenantId: t1Id,
        name: 'Anker Soundcore Space Q45 ANC Headphones',
        slug: 'anker-soundcore-space-q45',
        sku: 'ANK-Q45-ANC',
        barcode: '848061001920',
        description: 'Adaptive Noise Cancelling, LDAC Hi-Res Wireless, 50-Hour Playtime.',
        categoryId: 'cat_audio',
        categoryName: 'Audio & Sound',
        brandId: 'br_anker',
        brandName: 'Anker',
        price: 145000,
        costPrice: 110000,
        stockQuantity: 18,
        lowStockThreshold: 5,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        status: 'ACTIVE',
        isStorefrontVisible: true,
        variants: [],
        createdAt: '2026-01-20T09:00:00.000Z',
        updatedAt: '2026-08-05T15:00:00.000Z'
      },
      {
        id: 'prod_anker_65w',
        tenantId: t1Id,
        name: 'Anker 735 GaNPrime 65W 3-Port Fast Charger',
        slug: 'anker-735-ganprime-65w',
        sku: 'ANK-65W-GAN',
        barcode: '848061009181',
        description: 'Simultaneously charge 3 devices, PowerIQ 4.0, ultra compact size.',
        categoryId: 'cat_acc',
        categoryName: 'Accessories & Power',
        brandId: 'br_anker',
        brandName: 'Anker',
        price: 48000,
        costPrice: 35000,
        stockQuantity: 35,
        lowStockThreshold: 8,
        imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&h=500&fit=crop',
        status: 'ACTIVE',
        isStorefrontVisible: true,
        variants: [],
        createdAt: '2026-02-01T10:00:00.000Z',
        updatedAt: '2026-08-11T16:00:00.000Z'
      },
      {
        id: 'prod_bazin_royal',
        tenantId: t2Id,
        name: 'Getzner Magnum Bazin Riche Royal Gold (10 Yards)',
        slug: 'getzner-magnum-bazin-riche',
        sku: 'GTZ-BZN-10Y',
        barcode: '912001920192',
        description: 'Authentic Austrian Getzner Bazin Riche damask fabric with metallic sheen.',
        categoryId: 'cat_bazin',
        categoryName: 'Bazin Riche',
        brandId: 'br_getzner',
        brandName: 'Getzner',
        price: 280000,
        costPrice: 220000,
        stockQuantity: 15,
        lowStockThreshold: 4,
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&h=500&fit=crop',
        status: 'ACTIVE',
        isStorefrontVisible: true,
        variants: [],
        createdAt: '2026-02-02T11:00:00.000Z',
        updatedAt: '2026-08-09T14:00:00.000Z'
      }
    ],
    inventoryItems: [
      {
        id: 'inv_1',
        tenantId: t1Id,
        productId: 'prod_ip15pro',
        productName: 'iPhone 15 Pro Max 256GB Natural Titanium',
        sku: 'APL-IP15PM-256',
        locationId: 'loc_main_lagos',
        locationName: 'Main Store - Ikeja',
        onHandQuantity: 12,
        reservedQuantity: 0,
        availableQuantity: 12,
        lowStockThreshold: 3,
        costPrice: 1650000,
        sellingPrice: 1850000,
        updatedAt: '2026-08-10T12:00:00.000Z'
      },
      {
        id: 'inv_2',
        tenantId: t1Id,
        productId: 'prod_s24u',
        productName: 'Samsung Galaxy S24 Ultra 512GB Titanium Grey',
        sku: 'SAM-S24U-512',
        locationId: 'loc_main_lagos',
        locationName: 'Main Store - Ikeja',
        onHandQuantity: 2,
        reservedQuantity: 0,
        availableQuantity: 2,
        lowStockThreshold: 5,
        costPrice: 1520000,
        sellingPrice: 1720000,
        updatedAt: '2026-08-12T09:00:00.000Z'
      },
      {
        id: 'inv_3',
        tenantId: t1Id,
        productId: 'prod_macm3',
        productName: 'MacBook Air 15-inch M3 16GB / 512GB Midnight',
        sku: 'APL-MBA15-M3',
        locationId: 'loc_main_lagos',
        locationName: 'Main Store - Ikeja',
        onHandQuantity: 6,
        reservedQuantity: 0,
        availableQuantity: 6,
        lowStockThreshold: 2,
        costPrice: 1900000,
        sellingPrice: 2150000,
        updatedAt: '2026-08-01T10:00:00.000Z'
      },
      {
        id: 'inv_4',
        tenantId: t1Id,
        productId: 'prod_anker_q45',
        productName: 'Anker Soundcore Space Q45 ANC Headphones',
        sku: 'ANK-Q45-ANC',
        locationId: 'loc_main_lagos',
        locationName: 'Main Store - Ikeja',
        onHandQuantity: 18,
        reservedQuantity: 0,
        availableQuantity: 18,
        lowStockThreshold: 5,
        costPrice: 110000,
        sellingPrice: 145000,
        updatedAt: '2026-08-05T15:00:00.000Z'
      },
      {
        id: 'inv_5',
        tenantId: t1Id,
        productId: 'prod_anker_65w',
        productName: 'Anker 735 GaNPrime 65W 3-Port Fast Charger',
        sku: 'ANK-65W-GAN',
        locationId: 'loc_main_lagos',
        locationName: 'Main Store - Ikeja',
        onHandQuantity: 35,
        reservedQuantity: 0,
        availableQuantity: 35,
        lowStockThreshold: 8,
        costPrice: 35000,
        sellingPrice: 48000,
        updatedAt: '2026-08-11T16:00:00.000Z'
      }
    ],
    inventoryMovements: [
      {
        id: 'mvt_1',
        tenantId: t1Id,
        productId: 'prod_ip15pro',
        productName: 'iPhone 15 Pro Max 256GB Natural Titanium',
        sku: 'APL-IP15PM-256',
        type: 'PURCHASE',
        quantityChange: 15,
        previousQuantity: 0,
        newQuantity: 15,
        reason: 'Received PO-2026-001 from Hong Kong Wholesalers',
        referenceId: 'po_1',
        actorName: 'Adebayo Ogunlesi',
        createdAt: '2026-01-11T10:00:00.000Z'
      },
      {
        id: 'mvt_2',
        tenantId: t1Id,
        productId: 'prod_ip15pro',
        productName: 'iPhone 15 Pro Max 256GB Natural Titanium',
        sku: 'APL-IP15PM-256',
        type: 'SALE',
        quantityChange: -1,
        previousQuantity: 15,
        newQuantity: 14,
        reason: 'POS Sale ORD-1002',
        referenceId: 'ord_1002',
        actorName: 'Chioma Okeke (Cashier)',
        createdAt: '2026-08-10T12:00:00.000Z'
      },
      {
        id: 'mvt_3',
        tenantId: t1Id,
        productId: 'prod_s24u',
        productName: 'Samsung Galaxy S24 Ultra 512GB Titanium Grey',
        sku: 'SAM-S24U-512',
        type: 'SALE',
        quantityChange: -2,
        previousQuantity: 4,
        newQuantity: 2,
        reason: 'Storefront Online Order ORD-1003',
        referenceId: 'ord_1003',
        actorName: 'System Checkout',
        createdAt: '2026-08-12T09:00:00.000Z'
      }
    ],
    customers: [
      {
        id: 'cust_1',
        tenantId: t1Id,
        name: 'Chief Oladipo Johnson',
        email: 'dipo.johnson@gmail.com',
        phone: '+234 802 333 4444',
        address: '12 Victoria Island Expressway, Lagos',
        totalOrders: 4,
        totalSpent: 4250000,
        notes: 'VIP Client - Always prefers Natural Titanium devices',
        createdAt: '2026-01-15T11:00:00.000Z'
      },
      {
        id: 'cust_2',
        tenantId: t1Id,
        name: 'Dr. Fatima Bello',
        email: 'fatima.bello@abu.edu.ng',
        phone: '+234 805 111 2222',
        address: '8 Maitama District, Abuja',
        totalOrders: 2,
        totalSpent: 1890000,
        createdAt: '2026-02-10T14:00:00.000Z'
      }
    ],
    suppliers: [
      {
        id: 'sup_1',
        tenantId: t1Id,
        name: 'Hong Kong Global Electronics Ltd',
        contactName: 'Kevin Zhang',
        email: 'orders@hk-globalelec.com',
        phone: '+852 9876 5432',
        address: 'Kwun Tong Industrial Park, Hong Kong',
        category: 'Smartphones & Apple Gear',
        totalPurchases: 45000000,
        createdAt: '2026-01-05T08:00:00.000Z'
      },
      {
        id: 'sup_2',
        tenantId: t1Id,
        name: 'Anker West Africa Distro',
        contactName: 'Emeka Nwosu',
        email: 'sales@anker-wa.com',
        phone: '+234 818 999 8888',
        address: 'Lekki Phase 1, Lagos, Nigeria',
        category: 'Accessories & Chargers',
        totalPurchases: 8500000,
        createdAt: '2026-01-20T10:00:00.000Z'
      }
    ],
    purchaseOrders: [
      {
        id: 'po_1',
        tenantId: t1Id,
        poNumber: 'PO-2026-001',
        supplierId: 'sup_1',
        supplierName: 'Hong Kong Global Electronics Ltd',
        status: 'RECEIVED',
        items: [
          { id: 'poi_1', productId: 'prod_ip15pro', productName: 'iPhone 15 Pro Max 256GB Natural Titanium', sku: 'APL-IP15PM-256', orderedQuantity: 15, receivedQuantity: 15, unitCost: 1650000, totalAmount: 24750000 }
        ],
        subtotal: 24750000,
        tax: 0,
        totalAmount: 24750000,
        notes: 'Full shipment received via DHL Cargo',
        orderedAt: '2026-01-05T10:00:00.000Z',
        receivedAt: '2026-01-11T10:00:00.000Z',
        createdAt: '2026-01-05T10:00:00.000Z'
      }
    ],
    orders: [
      {
        id: 'ord_1001',
        tenantId: t1Id,
        orderNumber: 'ORD-1001',
        source: 'POS',
        customerId: 'cust_1',
        customerName: 'Chief Oladipo Johnson',
        customerPhone: '+234 802 333 4444',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        paymentReference: 'PAY-CARD-992019',
        items: [
          { id: 'oi_1', productId: 'prod_macm3', productName: 'MacBook Air 15-inch M3 16GB / 512GB Midnight', sku: 'APL-MBA15-M3', unitPrice: 2150000, costPrice: 1900000, quantity: 1, discount: 0, totalPrice: 2150000 }
        ],
        subtotal: 2150000,
        discount: 0,
        tax: 0,
        shippingFee: 0,
        totalAmount: 2150000,
        cashierName: 'Chioma Okeke (Cashier)',
        createdAt: '2026-08-01T14:20:00.000Z',
        updatedAt: '2026-08-01T14:20:00.000Z'
      },
      {
        id: 'ord_1002',
        tenantId: t1Id,
        orderNumber: 'ORD-1002',
        source: 'POS',
        customerId: 'cust_1',
        customerName: 'Chief Oladipo Johnson',
        customerPhone: '+234 802 333 4444',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'GTB-TRF-881029',
        items: [
          { id: 'oi_2', productId: 'prod_ip15pro', productName: 'iPhone 15 Pro Max 256GB Natural Titanium', sku: 'APL-IP15PM-256', unitPrice: 1850000, costPrice: 1650000, quantity: 1, discount: 50000, totalPrice: 1800000 },
          { id: 'oi_3', productId: 'prod_anker_65w', productName: 'Anker 735 GaNPrime 65W 3-Port Fast Charger', sku: 'ANK-65W-GAN', unitPrice: 48000, costPrice: 35000, quantity: 1, discount: 0, totalPrice: 48000 }
        ],
        subtotal: 1898000,
        discount: 50000,
        tax: 0,
        shippingFee: 0,
        totalAmount: 1848000,
        cashierName: 'Chioma Okeke (Cashier)',
        createdAt: '2026-08-10T12:00:00.000Z',
        updatedAt: '2026-08-10T12:00:00.000Z'
      },
      {
        id: 'ord_1003',
        tenantId: t1Id,
        orderNumber: 'ORD-1003',
        source: 'STOREFRONT',
        customerId: 'cust_2',
        customerName: 'Dr. Fatima Bello',
        customerEmail: 'fatima.bello@abu.edu.ng',
        customerPhone: '+234 805 111 2222',
        shippingAddress: '8 Maitama District, Abuja, Nigeria',
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        paymentReference: 'FLW-TXN-7739102',
        items: [
          { id: 'oi_4', productId: 'prod_s24u', productName: 'Samsung Galaxy S24 Ultra 512GB Titanium Grey', sku: 'SAM-S24U-512', unitPrice: 1720000, costPrice: 1520000, quantity: 2, discount: 0, totalPrice: 3440000 }
        ],
        subtotal: 3440000,
        discount: 0,
        tax: 0,
        shippingFee: 15000,
        totalAmount: 3455000,
        notes: 'Express courier delivery to Abuja',
        createdAt: '2026-08-12T09:00:00.000Z',
        updatedAt: '2026-08-12T09:00:00.000Z'
      }
    ],
    expenses: [
      {
        id: 'exp_1',
        tenantId: t1Id,
        title: 'Monthly Storefront Rent - Ikeja Computer Village',
        category: 'RENT',
        amount: 350000,
        date: '2026-08-01',
        description: 'Monthly store lease payment for August 2026',
        createdByName: 'Adebayo Ogunlesi',
        createdAt: '2026-08-01T09:00:00.000Z'
      },
      {
        id: 'exp_2',
        tenantId: t1Id,
        title: 'Generator Diesel & Power Utilities',
        category: 'UTILITIES',
        amount: 85000,
        date: '2026-08-08',
        description: '200 Litres Diesel for store backup generator',
        createdByName: 'Chioma Okeke (Cashier)',
        createdAt: '2026-08-08T11:30:00.000Z'
      }
    ],
    coupons: [
      {
        id: 'cp_welcome10',
        tenantId: t1Id,
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 100000,
        usedCount: 5,
        isActive: true,
        createdAt: '2026-01-20T00:00:00.000Z'
      },
      {
        id: 'cp_save5k',
        tenantId: t1Id,
        code: 'SAVE5000',
        discountType: 'FIXED',
        discountValue: 5000,
        minOrderAmount: 50000,
        usedCount: 12,
        isActive: true,
        createdAt: '2026-02-01T00:00:00.000Z'
      }
    ],
    storeSettings: [
      {
        tenantId: t1Id,
        storeName: 'Lagos Tech Store',
        tagline: 'Your #1 Trusted Plug for Genuine Apple, Samsung & Anker Gear',
        primaryColor: '#059669', // Emerald 600
        accentColor: '#0284c7', // Sky 600
        bannerText: '🔥 FREE Nationwide Delivery on Orders above ₦500,000! Same-Day Lagos Dispatch.',
        bannerImageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=400&fit=crop',
        aboutText: 'Lagos Tech Gadgets Ltd is an authorized distributor of original gadgets and computing gear in Nigeria. Every device comes with a 12-month manufacturer warranty.',
        contactEmail: 'sales@lagostech.com',
        contactPhone: '+234 803 123 4567',
        whatsappNumber: '2348031234567',
        instagramUrl: 'https://instagram.com/lagostech',
        allowGuestCheckout: true,
        enablePickup: true,
        flatShippingRate: 5000,
        updatedAt: '2026-08-10T10:00:00.000Z'
      },
      {
        tenantId: t2Id,
        storeName: 'Kano Royal Fabrics',
        tagline: 'Authentic Getzner Bazin & Swiss Voile Lace',
        primaryColor: '#7c3aed',
        accentColor: '#d97706',
        bannerText: '✨ Authentic Austrian Getzner Bazin Damask Now In Stock!',
        contactEmail: 'info@kanofabrics.com',
        contactPhone: '+234 806 987 6543',
        allowGuestCheckout: true,
        enablePickup: true,
        flatShippingRate: 4000,
        updatedAt: '2026-08-01T10:00:00.000Z'
      }
    ],
    storeDomains: [
      { id: 'dom_1', tenantId: t1Id, subdomain: 'lagos-tech', customDomain: 'lagostech.com', isVerified: true, status: 'ACTIVE' },
      { id: 'dom_2', tenantId: t2Id, subdomain: 'kano-fabrics', isVerified: true, status: 'ACTIVE' }
    ],
    subscriptions: [
      { id: 'sub_1', tenantId: t1Id, planId: 'PRO', status: 'ACTIVE', currentPeriodStart: '2026-08-01T00:00:00.000Z', currentPeriodEnd: '2027-08-01T00:00:00.000Z', autoRenew: true },
      { id: 'sub_2', tenantId: t2Id, planId: 'BASIC', status: 'ACTIVE', currentPeriodStart: '2026-08-01T00:00:00.000Z', currentPeriodEnd: '2026-09-01T00:00:00.000Z', autoRenew: true }
    ],
    auditLogs: [
      {
        id: 'log_1',
        tenantId: t1Id,
        actorId: uOwner1Id,
        actorName: 'Adebayo Ogunlesi',
        action: 'TENANT_SETTINGS_UPDATED',
        entityType: 'StoreSettings',
        entityId: t1Id,
        details: 'Updated store tagline and promotional banner',
        createdAt: '2026-08-10T10:00:00.000Z'
      }
    ]
  };
}

class JsonDatabaseService {
  private data: DatabaseSchema;

  constructor() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading db file, re-initializing...', err);
        this.data = getInitialData();
        this.persist();
      }
    } else {
      this.data = getInitialData();
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error persisting db:', e);
    }
  }

  // --- Auth & Tenant Context Methods ---
  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getTenantUsersForUser(userId: string): TenantUser[] {
    return this.data.tenantUsers.filter(tu => tu.userId === userId);
  }

  public getTenantById(tenantId: string): Tenant | undefined {
    return this.data.tenants.find(t => t.id === tenantId);
  }

  public getTenantBySlug(slug: string): Tenant | undefined {
    return this.data.tenants.find(t => t.slug.toLowerCase() === slug.toLowerCase());
  }

  public getAllTenants(): Tenant[] {
    return this.data.tenants;
  }

  public createTenant(input: { name: string; slug: string; industry: string; ownerName: string; ownerEmail: string; ownerPhone: string; currency?: 'NGN'|'USD'|'GBP'|'EUR' }): { tenant: Tenant; user: User } {
    const tenantId = `tenant_${Date.now()}`;
    const userId = `usr_${Date.now()}`;

    const newTenant: Tenant = {
      id: tenantId,
      name: input.name,
      slug: input.slug,
      industry: input.industry,
      address: 'Lagos, Nigeria',
      phone: input.ownerPhone,
      email: input.ownerEmail,
      currency: input.currency || 'NGN',
      timezone: 'Africa/Lagos',
      status: 'ACTIVE',
      planId: 'FREE',
      createdAt: new Date().toISOString()
    };

    let user = this.getUserByEmail(input.ownerEmail);
    if (!user) {
      user = {
        id: userId,
        email: input.ownerEmail,
        name: input.ownerName,
        phone: input.ownerPhone,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      this.data.users.push(user);
    }

    const tenantUser: TenantUser = {
      id: `tu_${Date.now()}`,
      tenantId,
      userId: user.id,
      role: 'OWNER',
      user,
      joinedAt: new Date().toISOString()
    };

    this.data.tenants.push(newTenant);
    this.data.tenantUsers.push(tenantUser);

    // Initial store settings
    const storeSettings: StoreSettings = {
      tenantId,
      storeName: input.name,
      tagline: `Welcome to ${input.name}`,
      primaryColor: '#059669',
      accentColor: '#0284c7',
      contactEmail: input.ownerEmail,
      contactPhone: input.ownerPhone,
      allowGuestCheckout: true,
      enablePickup: true,
      flatShippingRate: 2000,
      updatedAt: new Date().toISOString()
    };
    this.data.storeSettings.push(storeSettings);

    // Initial subscription
    this.data.subscriptions.push({
      id: `sub_${Date.now()}`,
      tenantId,
      planId: 'FREE',
      status: 'ACTIVE',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      autoRenew: true
    });

    this.persist();
    return { tenant: newTenant, user };
  }

  // --- Products & Categories ---
  public getProducts(tenantId: string, options?: { categoryId?: string; search?: string; storefrontOnly?: boolean }): Product[] {
    let list = this.data.products.filter(p => p.tenantId === tenantId);
    if (options?.storefrontOnly) {
      list = list.filter(p => p.status === 'ACTIVE' && p.isStorefrontVisible);
    }
    if (options?.categoryId) {
      list = list.filter(p => p.categoryId === options.categoryId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
      );
    }
    return list;
  }

  public getProductById(tenantId: string, id: string): Product | undefined {
    return this.data.products.find(p => p.tenantId === tenantId && p.id === id);
  }

  public createProduct(tenantId: string, input: Partial<Product>, actorName: string): Product {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      id,
      tenantId,
      name: input.name || 'Untitled Product',
      slug: (input.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: input.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: input.barcode || '',
      description: input.description || '',
      categoryId: input.categoryId || '',
      categoryName: input.categoryName || '',
      brandId: input.brandId || '',
      brandName: input.brandName || '',
      price: Number(input.price) || 0,
      costPrice: Number(input.costPrice) || 0,
      stockQuantity: Number(input.stockQuantity) || 0,
      lowStockThreshold: Number(input.lowStockThreshold) || 5,
      imageUrl: input.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      status: input.status || 'ACTIVE',
      isStorefrontVisible: input.isStorefrontVisible !== false,
      variants: input.variants || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.products.push(newProduct);

    // Initial Inventory Item
    const invItem: InventoryItem = {
      id: `inv_${Date.now()}`,
      tenantId,
      productId: id,
      productName: newProduct.name,
      sku: newProduct.sku,
      locationId: 'loc_main',
      locationName: 'Main Store',
      onHandQuantity: newProduct.stockQuantity,
      reservedQuantity: 0,
      availableQuantity: newProduct.stockQuantity,
      lowStockThreshold: newProduct.lowStockThreshold,
      costPrice: newProduct.costPrice,
      sellingPrice: newProduct.price,
      updatedAt: new Date().toISOString()
    };
    this.data.inventoryItems.push(invItem);

    // Stock Movement entry if stock > 0
    if (newProduct.stockQuantity > 0) {
      this.data.inventoryMovements.push({
        id: `mvt_${Date.now()}`,
        tenantId,
        productId: id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: 'PURCHASE',
        quantityChange: newProduct.stockQuantity,
        previousQuantity: 0,
        newQuantity: newProduct.stockQuantity,
        reason: 'Initial Product Stock Setup',
        actorName,
        createdAt: new Date().toISOString()
      });
    }

    this.persist();
    return newProduct;
  }

  public updateProduct(tenantId: string, productId: string, updates: Partial<Product>): Product | undefined {
    const prod = this.getProductById(tenantId, productId);
    if (!prod) return undefined;

    Object.assign(prod, updates, { updatedAt: new Date().toISOString() });
    
    // Also update associated inventory item summary
    const inv = this.data.inventoryItems.find(i => i.tenantId === tenantId && i.productId === productId);
    if (inv) {
      inv.productName = prod.name;
      inv.sku = prod.sku;
      inv.sellingPrice = prod.price;
      inv.costPrice = prod.costPrice;
      inv.onHandQuantity = prod.stockQuantity;
      inv.availableQuantity = prod.stockQuantity;
      inv.updatedAt = new Date().toISOString();
    }

    this.persist();
    return prod;
  }

  public getCategories(tenantId: string): Category[] {
    return this.data.categories.filter(c => c.tenantId === tenantId);
  }

  public createCategory(tenantId: string, name: string, description?: string): Category {
    const cat: Category = {
      id: `cat_${Date.now()}`,
      tenantId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description
    };
    this.data.categories.push(cat);
    this.persist();
    return cat;
  }

  // --- Inventory Ledger & Adjustments ---
  public getInventoryItems(tenantId: string): InventoryItem[] {
    return this.data.inventoryItems.filter(i => i.tenantId === tenantId);
  }

  public getInventoryMovements(tenantId: string): InventoryMovement[] {
    return this.data.inventoryMovements
      .filter(m => m.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public adjustInventory(tenantId: string, productId: string, newQuantity: number, reason: string, actorName: string): { product: Product; movement: InventoryMovement } | undefined {
    const prod = this.getProductById(tenantId, productId);
    if (!prod) return undefined;

    const previousQuantity = prod.stockQuantity;
    const quantityChange = newQuantity - previousQuantity;
    prod.stockQuantity = newQuantity;
    prod.updatedAt = new Date().toISOString();

    const inv = this.data.inventoryItems.find(i => i.tenantId === tenantId && i.productId === productId);
    if (inv) {
      inv.onHandQuantity = newQuantity;
      inv.availableQuantity = newQuantity;
      inv.updatedAt = new Date().toISOString();
    }

    const movement: InventoryMovement = {
      id: `mvt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tenantId,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      type: 'ADJUSTMENT',
      quantityChange,
      previousQuantity,
      newQuantity,
      reason,
      actorName,
      createdAt: new Date().toISOString()
    };

    this.data.inventoryMovements.push(movement);
    this.persist();
    return { product: prod, movement };
  }

  // --- Orders & POS Checkout ---
  public getOrders(tenantId: string): Order[] {
    return this.data.orders
      .filter(o => o.tenantId === tenantId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(tenantId: string, id: string): Order | undefined {
    return this.data.orders.find(o => o.tenantId === tenantId && (o.id === id || o.orderNumber === id));
  }

  public createOrder(tenantId: string, input: {
    source: 'POS' | 'STOREFRONT' | 'MANUAL';
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    shippingAddress?: string;
    items: { productId: string; quantity: number; unitPrice?: number; discount?: number }[];
    discount?: number;
    tax?: number;
    shippingFee?: number;
    paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
    paymentReference?: string;
    cashierName?: string;
    notes?: string;
  }): Order {
    const count = this.data.orders.filter(o => o.tenantId === tenantId).length + 1001;
    const orderNumber = `ORD-${count}`;
    const id = `ord_${Date.now()}`;

    let subtotal = 0;
    const resolvedItems: OrderItem[] = [];

    for (const item of input.items) {
      const prod = this.getProductById(tenantId, item.productId);
      if (!prod) continue;

      const unitPrice = item.unitPrice ?? prod.price;
      const discount = item.discount ?? 0;
      const totalPrice = (unitPrice * item.quantity) - discount;
      subtotal += totalPrice;

      resolvedItems.push({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unitPrice,
        costPrice: prod.costPrice,
        quantity: item.quantity,
        discount,
        totalPrice
      });

      // Deduct stock atomically
      const prevQty = prod.stockQuantity;
      const newQty = Math.max(0, prevQty - item.quantity);
      prod.stockQuantity = newQty;
      prod.updatedAt = new Date().toISOString();

      const inv = this.data.inventoryItems.find(i => i.tenantId === tenantId && i.productId === prod.id);
      if (inv) {
        inv.onHandQuantity = newQty;
        inv.availableQuantity = newQty;
      }

      this.data.inventoryMovements.push({
        id: `mvt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        tenantId,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        type: 'SALE',
        quantityChange: -item.quantity,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason: `${input.source} Sale Order ${orderNumber}`,
        referenceId: id,
        actorName: input.cashierName || (input.source === 'STOREFRONT' ? 'Online Customer' : 'Staff'),
        createdAt: new Date().toISOString()
      });
    }

    const discountVal = input.discount || 0;
    const taxVal = input.tax || 0;
    const shippingVal = input.shippingFee || 0;
    const totalAmount = Math.max(0, subtotal - discountVal + taxVal + shippingVal);

    const order: Order = {
      id,
      tenantId,
      orderNumber,
      source: input.source,
      customerId: input.customerId,
      customerName: input.customerName || 'Walk-in Customer',
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress,
      status: input.source === 'POS' ? 'DELIVERED' : 'PENDING',
      paymentStatus: 'PAID',
      paymentMethod: input.paymentMethod || 'CASH',
      paymentReference: input.paymentReference || `REF-${Date.now().toString().slice(-8)}`,
      items: resolvedItems,
      subtotal,
      discount: discountVal,
      tax: taxVal,
      shippingFee: shippingVal,
      totalAmount,
      cashierName: input.cashierName,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.push(order);

    // Update customer spend stats if customer exists
    if (input.customerId) {
      const cust = this.data.customers.find(c => c.tenantId === tenantId && c.id === input.customerId);
      if (cust) {
        cust.totalOrders += 1;
        cust.totalSpent += totalAmount;
      }
    } else if (input.customerName && input.customerName !== 'Walk-in Customer') {
      // Auto-create customer record
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        tenantId,
        name: input.customerName,
        email: input.customerEmail || '',
        phone: input.customerPhone || '',
        address: input.shippingAddress || '',
        totalOrders: 1,
        totalSpent: totalAmount,
        createdAt: new Date().toISOString()
      };
      this.data.customers.push(newCust);
      order.customerId = newCust.id;
    }

    this.persist();
    return order;
  }

  public updateOrderStatus(tenantId: string, orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus): Order | undefined {
    const order = this.getOrderById(tenantId, orderId);
    if (!order) return undefined;

    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    this.persist();
    return order;
  }

  // --- Customers & Suppliers ---
  public getCustomers(tenantId: string): Customer[] {
    return this.data.customers.filter(c => c.tenantId === tenantId);
  }

  public createCustomer(tenantId: string, input: Partial<Customer>): Customer {
    const cust: Customer = {
      id: `cust_${Date.now()}`,
      tenantId,
      name: input.name || 'New Customer',
      email: input.email || '',
      phone: input.phone || '',
      address: input.address || '',
      totalOrders: 0,
      totalSpent: 0,
      notes: input.notes,
      createdAt: new Date().toISOString()
    };
    this.data.customers.push(cust);
    this.persist();
    return cust;
  }

  public getSuppliers(tenantId: string): Supplier[] {
    return this.data.suppliers.filter(s => s.tenantId === tenantId);
  }

  public createSupplier(tenantId: string, input: Partial<Supplier>): Supplier {
    const sup: Supplier = {
      id: `sup_${Date.now()}`,
      tenantId,
      name: input.name || 'New Supplier',
      contactName: input.contactName || '',
      email: input.email || '',
      phone: input.phone || '',
      address: input.address || '',
      category: input.category || 'General',
      totalPurchases: 0,
      createdAt: new Date().toISOString()
    };
    this.data.suppliers.push(sup);
    this.persist();
    return sup;
  }

  public getPurchaseOrders(tenantId: string): PurchaseOrder[] {
    return this.data.purchaseOrders.filter(po => po.tenantId === tenantId);
  }

  public createPurchaseOrder(tenantId: string, input: Partial<PurchaseOrder>): PurchaseOrder {
    const count = this.getPurchaseOrders(tenantId).length + 1;
    const poNumber = `PO-${new Date().getFullYear()}-${count.toString().padStart(3, '0')}`;
    const po: PurchaseOrder = {
      id: `po_${Date.now()}`,
      tenantId,
      poNumber,
      supplierId: input.supplierId || '',
      supplierName: input.supplierName || '',
      status: 'DRAFT',
      items: input.items || [],
      subtotal: input.subtotal || 0,
      tax: input.tax || 0,
      totalAmount: input.totalAmount || 0,
      notes: input.notes,
      createdAt: new Date().toISOString()
    };
    this.data.purchaseOrders.push(po);
    this.persist();
    return po;
  }

  public receivePurchaseOrder(tenantId: string, poId: string, actorName: string): PurchaseOrder | undefined {
    const po = this.data.purchaseOrders.find(p => p.tenantId === tenantId && p.id === poId);
    if (!po || po.status === 'RECEIVED') return po;

    po.status = 'RECEIVED';
    po.receivedAt = new Date().toISOString();

    for (const item of po.items) {
      item.receivedQuantity = item.orderedQuantity;
      const prod = this.getProductById(tenantId, item.productId);
      if (prod) {
        const prevQty = prod.stockQuantity;
        const newQty = prevQty + item.orderedQuantity;
        prod.stockQuantity = newQty;

        const inv = this.data.inventoryItems.find(i => i.tenantId === tenantId && i.productId === prod.id);
        if (inv) {
          inv.onHandQuantity = newQty;
          inv.availableQuantity = newQty;
        }

        this.data.inventoryMovements.push({
          id: `mvt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          tenantId,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'PURCHASE',
          quantityChange: item.orderedQuantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          reason: `Received Purchase Order ${po.poNumber}`,
          referenceId: po.id,
          actorName,
          createdAt: new Date().toISOString()
        });
      }
    }

    this.persist();
    return po;
  }

  // --- Expenses ---
  public getExpenses(tenantId: string): Expense[] {
    return this.data.expenses
      .filter(e => e.tenantId === tenantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public createExpense(tenantId: string, input: Partial<Expense>, createdByName: string): Expense {
    const exp: Expense = {
      id: `exp_${Date.now()}`,
      tenantId,
      title: input.title || 'General Expense',
      category: input.category || 'OTHER',
      amount: Number(input.amount) || 0,
      date: input.date || new Date().toISOString().slice(0, 10),
      description: input.description,
      createdByName,
      createdAt: new Date().toISOString()
    };
    this.data.expenses.push(exp);
    this.persist();
    return exp;
  }

  // --- Store Settings & Domains ---
  public getStoreSettings(tenantId: string): StoreSettings {
    let settings = this.data.storeSettings.find(s => s.tenantId === tenantId);
    if (!settings) {
      const tenant = this.getTenantById(tenantId);
      settings = {
        tenantId,
        storeName: tenant?.name || 'StockỌja Store',
        tagline: 'Quality Products Delivered Fast',
        primaryColor: '#059669',
        accentColor: '#0284c7',
        contactEmail: tenant?.email || '',
        contactPhone: tenant?.phone || '',
        allowGuestCheckout: true,
        enablePickup: true,
        flatShippingRate: 2000,
        updatedAt: new Date().toISOString()
      };
      this.data.storeSettings.push(settings);
      this.persist();
    }
    return settings;
  }

  public updateStoreSettings(tenantId: string, updates: Partial<StoreSettings>): StoreSettings {
    const settings = this.getStoreSettings(tenantId);
    Object.assign(settings, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return settings;
  }

  public getStoreDomain(tenantId: string): StoreDomain {
    let dom = this.data.storeDomains.find(d => d.tenantId === tenantId);
    if (!dom) {
      const tenant = this.getTenantById(tenantId);
      dom = {
        id: `dom_${Date.now()}`,
        tenantId,
        subdomain: tenant?.slug || `store-${tenantId.slice(-4)}`,
        isVerified: true,
        status: 'ACTIVE'
      };
      this.data.storeDomains.push(dom);
      this.persist();
    }
    return dom;
  }

  // --- Dashboard Metrics & Analytics ---
  public getDashboardMetrics(tenantId: string): DashboardMetrics {
    const orders = this.getOrders(tenantId).filter(o => o.paymentStatus === 'PAID');
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSalesCount = orders.length;
    const totalCustomers = this.getCustomers(tenantId).length;
    const lowStockCount = this.getProducts(tenantId).filter(p => p.stockQuantity <= p.lowStockThreshold).length;

    // Calculate Estimated Profit = Total Revenue - Total Cost of Goods Sold - Total Expenses
    let totalCogs = 0;
    for (const order of orders) {
      for (const item of order.items) {
        totalCogs += (item.costPrice || 0) * item.quantity;
      }
    }
    const totalExpenses = this.getExpenses(tenantId).reduce((sum, e) => sum + e.amount, 0);
    const estimatedProfit = totalRevenue - totalCogs - totalExpenses;

    // Generate last 7 days sales breakdown
    const salesByDayMap = new Map<string, { revenue: number; sales: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      salesByDayMap.set(dateStr, { revenue: 0, sales: 0 });
    }

    for (const order of orders) {
      const dateStr = order.createdAt.slice(0, 10);
      if (salesByDayMap.has(dateStr)) {
        const curr = salesByDayMap.get(dateStr)!;
        curr.revenue += order.totalAmount;
        curr.sales += 1;
      }
    }

    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, val]) => ({
      date,
      revenue: val.revenue,
      sales: val.sales
    }));

    // Calculate top products
    const productSalesMap = new Map<string, { id: string; name: string; quantitySold: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const curr = productSalesMap.get(item.productId) || { id: item.productId, name: item.productName, quantitySold: 0, revenue: 0 };
        curr.quantitySold += item.quantity;
        curr.revenue += item.totalPrice;
        productSalesMap.set(item.productId, curr);
      }
    }

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalSalesCount,
      totalOrders: this.getOrders(tenantId).length,
      totalCustomers,
      lowStockCount,
      estimatedProfit,
      revenueChangePercent: 14.8,
      salesByDay,
      topProducts
    };
  }

  // --- Platform Admin Metrics ---
  public getPlatformMetrics(): PlatformMetrics {
    const totalTenants = this.data.tenants.length;
    const activeTenants = this.data.tenants.filter(t => t.status === 'ACTIVE').length;
    
    let mrr = 0;
    const plansBreakdown: Record<string, number> = { FREE: 0, BASIC: 0, PRO: 0, ENTERPRISE: 0 };

    for (const t of this.data.tenants) {
      plansBreakdown[t.planId] = (plansBreakdown[t.planId] || 0) + 1;
      const plan = DEFAULT_PLANS.find(p => p.id === t.planId);
      if (plan) {
        mrr += plan.priceMonthly;
      }
    }

    const totalOrdersProcessed = this.data.orders.length;
    const totalVolume = this.data.orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalTenants,
      activeTenants,
      mrr,
      totalVolume,
      totalOrdersProcessed,
      plansBreakdown
    };
  }

  public getPlans(): Plan[] {
    return DEFAULT_PLANS;
  }
}

export const db = new JsonDatabaseService();
