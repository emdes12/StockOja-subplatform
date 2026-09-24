export type RoleType = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_STAFF';
export type UserRole = RoleType;

export interface Permission {
  code: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
}

export interface TenantUser {
  id: string;
  tenantId: string;
  userId: string;
  role: RoleType;
  user: User;
  joinedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logoUrl?: string;
  address: string;
  phone: string;
  email: string;
  currency: 'NGN' | 'USD' | 'GBP' | 'EUR';
  timezone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  planId: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  name: string; // e.g. "Size XL / Red"
  attributes: Record<string, string>; // e.g. { size: "XL", color: "Red" }
  price: number;
  costPrice: number;
  stockQuantity: number;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  tenantId: string;
  name: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl?: string;
  status: 'ACTIVE' | 'DRAFT' | 'HIDDEN';
  isStorefrontVisible: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  isMain: boolean;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  sku: string;
  locationId: string;
  locationName: string;
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  updatedAt: string;
}

export type MovementType = 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';

export interface InventoryMovement {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  sku: string;
  type: MovementType;
  quantityChange: number; // positive for addition, negative for deduction
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  referenceId?: string; // orderId, purchaseOrderId, etc.
  actorName: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  category?: string;
  totalPurchases: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalAmount: number;
}

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes?: string;
  orderedAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  variantName?: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discount: number;
  totalPrice: number;
}

export type OrderSource = 'POS' | 'STOREFRONT' | 'MANUAL';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_MONEY';

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  source: OrderSource;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
  cashierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  tenantId: string;
  title: string;
  category: 'RENT' | 'UTILITIES' | 'SALARIES' | 'MARKETING' | 'SUPPLIES' | 'MAINTENANCE' | 'OTHER';
  amount: number;
  date: string;
  description?: string;
  createdByName: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface StoreSettings {
  tenantId: string;
  storeName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  bannerText?: string;
  bannerImageUrl?: string;
  aboutText?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  allowGuestCheckout: boolean;
  enablePickup: boolean;
  flatShippingRate: number;
  updatedAt: string;
}

export interface StoreDomain {
  id: string;
  tenantId: string;
  subdomain: string; // e.g. "lagostech" -> lagostech.stockoja.com
  customDomain?: string; // e.g. "lagostech.com"
  isVerified: boolean;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

export interface Plan {
  id: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxProducts: number;
  maxUsers: number;
  maxOrdersPerMonth: number;
  features: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalSalesCount: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
  estimatedProfit: number;
  revenueChangePercent: number;
  salesByDay: { date: string; revenue: number; sales: number }[];
  topProducts: { id: string; name: string; quantitySold: number; revenue: number }[];
}

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  mrr: number;
  totalVolume: number;
  totalOrdersProcessed: number;
  plansBreakdown: Record<string, number>;
}
