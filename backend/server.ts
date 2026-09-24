import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { db } from './db';
import { OrderStatus, PaymentStatus } from '../src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Multi-tenant Middleware: Extract Tenant ID from header or query or default
interface AuthenticatedRequest extends Request {
  tenantId?: string;
  userName?: string;
  userRole?: string;
  userId?: string;
}

const resolveTenantContext = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const headerTenant = req.headers['x-tenant-id'] as string;
  if (headerTenant) {
    req.tenantId = headerTenant;
  } else {
    // Default to first tenant if not explicitly provided
    req.tenantId = 'tenant_lagos_tech';
  }
  req.userName = (req.headers['x-user-name'] as string) || 'Adebayo Ogunlesi';
  req.userRole = (req.headers['x-user-role'] as string) || 'OWNER';
  next();
};

app.use('/api/v1', resolveTenantContext);

// --- Auth Routes ---
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: { message: 'Email is required' } });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found with this email' } });
  }

  const tenantUsers = db.getTenantUsersForUser(user.id);
  const tenants = tenantUsers.map(tu => {
    const t = db.getTenantById(tu.tenantId);
    return { ...t, role: tu.role };
  }).filter(Boolean);

  res.json({
    success: true,
    data: {
      user,
      tenants,
      activeTenantId: tenants[0]?.id || 'tenant_lagos_tech'
    }
  });
});

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { name, slug, industry, ownerName, ownerEmail, ownerPhone } = req.body;

  if (!name || !slug || !ownerEmail) {
    return res.status(400).json({ success: false, error: { message: 'Missing required business details' } });
  }

  const existingTenant = db.getTenantBySlug(slug);
  if (existingTenant) {
    return res.status(409).json({ success: false, error: { message: 'Store URL slug is already taken. Please pick another one.' } });
  }

  const result = db.createTenant({
    name,
    slug,
    industry: industry || 'General Retail',
    ownerName: ownerName || 'Business Owner',
    ownerEmail,
    ownerPhone: ownerPhone || '+234 800 000 0000'
  });

  res.status(201).json({
    success: true,
    data: {
      tenant: result.tenant,
      user: result.user
    }
  });
});

app.get('/api/v1/auth/me', (req: AuthenticatedRequest, res: Response) => {
  const tenant = db.getTenantById(req.tenantId || 'tenant_lagos_tech');
  res.json({
    success: true,
    data: {
      tenant,
      userRole: req.userRole,
      userName: req.userName
    }
  });
});

// --- Tenant Routes ---
app.get('/api/v1/tenants/current', (req: AuthenticatedRequest, res: Response) => {
  const tenant = db.getTenantById(req.tenantId!);
  const settings = db.getStoreSettings(req.tenantId!);
  const domain = db.getStoreDomain(req.tenantId!);

  res.json({
    success: true,
    data: {
      ...tenant,
      settings,
      domain
    }
  });
});

// --- Product & Catalog Routes ---
app.get('/api/v1/products', (req: AuthenticatedRequest, res: Response) => {
  const { categoryId, search, storefrontOnly } = req.query;
  const products = db.getProducts(req.tenantId!, {
    categoryId: categoryId as string,
    search: search as string,
    storefrontOnly: storefrontOnly === 'true'
  });

  res.json({ success: true, data: products });
});

app.get('/api/v1/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const product = db.getProductById(req.tenantId!, req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: { message: 'Product not found' } });
  }
  res.json({ success: true, data: product });
});

app.post('/api/v1/products', (req: AuthenticatedRequest, res: Response) => {
  const product = db.createProduct(req.tenantId!, req.body, req.userName || 'Admin');
  res.status(201).json({ success: true, data: product });
});

app.put('/api/v1/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateProduct(req.tenantId!, req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Product not found' } });
  }
  res.json({ success: true, data: updated });
});

app.get('/api/v1/categories', (req: AuthenticatedRequest, res: Response) => {
  const categories = db.getCategories(req.tenantId!);
  res.json({ success: true, data: categories });
});

app.post('/api/v1/categories', (req: AuthenticatedRequest, res: Response) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: { message: 'Category name is required' } });
  }
  const category = db.createCategory(req.tenantId!, name, description);
  res.status(201).json({ success: true, data: category });
});

// --- Inventory Ledger Routes ---
app.get('/api/v1/inventory', (req: AuthenticatedRequest, res: Response) => {
  const items = db.getInventoryItems(req.tenantId!);
  res.json({ success: true, data: items });
});

app.get('/api/v1/inventory/movements', (req: AuthenticatedRequest, res: Response) => {
  const movements = db.getInventoryMovements(req.tenantId!);
  res.json({ success: true, data: movements });
});

app.post('/api/v1/inventory/adjust', (req: AuthenticatedRequest, res: Response) => {
  const { productId, newQuantity, reason } = req.body;
  if (!productId || newQuantity === undefined || !reason) {
    return res.status(400).json({ success: false, error: { message: 'productId, newQuantity, and reason are required' } });
  }

  const result = db.adjustInventory(req.tenantId!, productId, Number(newQuantity), reason, req.userName || 'Inventory Staff');
  if (!result) {
    return res.status(404).json({ success: false, error: { message: 'Product not found' } });
  }

  res.json({ success: true, data: result });
});

// --- Orders & POS Checkout ---
app.get('/api/v1/orders', (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders(req.tenantId!);
  res.json({ success: true, data: orders });
});

app.get('/api/v1/orders/:id', (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.tenantId!, req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }
  res.json({ success: true, data: order });
});

app.post('/api/v1/pos/checkout', (req: AuthenticatedRequest, res: Response) => {
  const { items, customerName, customerPhone, paymentMethod, discount, tax, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: { message: 'Cart items are required for checkout' } });
  }

  const order = db.createOrder(req.tenantId!, {
    source: 'POS',
    customerName: customerName || 'Walk-in Customer',
    customerPhone,
    items,
    discount,
    tax,
    paymentMethod,
    cashierName: req.userName || 'Cashier',
    notes
  });

  res.status(201).json({ success: true, data: order });
});

app.put('/api/v1/orders/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status, paymentStatus } = req.body;
  const updated = db.updateOrderStatus(req.tenantId!, req.params.id, status as OrderStatus, paymentStatus as PaymentStatus);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Order not found' } });
  }
  res.json({ success: true, data: updated });
});

// --- Customers & Suppliers ---
app.get('/api/v1/customers', (req: AuthenticatedRequest, res: Response) => {
  const customers = db.getCustomers(req.tenantId!);
  res.json({ success: true, data: customers });
});

app.post('/api/v1/customers', (req: AuthenticatedRequest, res: Response) => {
  const customer = db.createCustomer(req.tenantId!, req.body);
  res.status(201).json({ success: true, data: customer });
});

app.get('/api/v1/suppliers', (req: AuthenticatedRequest, res: Response) => {
  const suppliers = db.getSuppliers(req.tenantId!);
  res.json({ success: true, data: suppliers });
});

app.post('/api/v1/suppliers', (req: AuthenticatedRequest, res: Response) => {
  const supplier = db.createSupplier(req.tenantId!, req.body);
  res.status(201).json({ success: true, data: supplier });
});

app.get('/api/v1/purchase-orders', (req: AuthenticatedRequest, res: Response) => {
  const pos = db.getPurchaseOrders(req.tenantId!);
  res.json({ success: true, data: pos });
});

app.post('/api/v1/purchase-orders', (req: AuthenticatedRequest, res: Response) => {
  const po = db.createPurchaseOrder(req.tenantId!, req.body);
  res.status(201).json({ success: true, data: po });
});

app.post('/api/v1/purchase-orders/:id/receive', (req: AuthenticatedRequest, res: Response) => {
  const received = db.receivePurchaseOrder(req.tenantId!, req.params.id, req.userName || 'Manager');
  if (!received) {
    return res.status(404).json({ success: false, error: { message: 'Purchase Order not found' } });
  }
  res.json({ success: true, data: received });
});

// --- Expenses ---
app.get('/api/v1/expenses', (req: AuthenticatedRequest, res: Response) => {
  const expenses = db.getExpenses(req.tenantId!);
  res.json({ success: true, data: expenses });
});

app.post('/api/v1/expenses', (req: AuthenticatedRequest, res: Response) => {
  const expense = db.createExpense(req.tenantId!, req.body, req.userName || 'Owner');
  res.status(201).json({ success: true, data: expense });
});

// --- Dashboard & Reports ---
app.get('/api/v1/reports/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const metrics = db.getDashboardMetrics(req.tenantId!);
  res.json({ success: true, data: metrics });
});

// --- Store Customization & Domain ---
app.get('/api/v1/store/settings', (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getStoreSettings(req.tenantId!);
  res.json({ success: true, data: settings });
});

app.put('/api/v1/store/settings', (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateStoreSettings(req.tenantId!, req.body);
  res.json({ success: true, data: updated });
});

// --- Public Storefront APIs (Unauthenticated / Public) ---
app.get('/api/v1/storefront/:slug/info', (req: Request, res: Response) => {
  const tenant = db.getTenantBySlug(req.params.slug);
  if (!tenant) {
    return res.status(404).json({ success: false, error: { message: 'Storefront not found' } });
  }

  const settings = db.getStoreSettings(tenant.id);
  const categories = db.getCategories(tenant.id);

  res.json({
    success: true,
    data: {
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug, logoUrl: tenant.logoUrl, currency: tenant.currency },
      settings,
      categories
    }
  });
});

app.get('/api/v1/storefront/:slug/products', (req: Request, res: Response) => {
  const tenant = db.getTenantBySlug(req.params.slug);
  if (!tenant) {
    return res.status(404).json({ success: false, error: { message: 'Storefront not found' } });
  }

  const { categoryId, search } = req.query;
  const products = db.getProducts(tenant.id, {
    storefrontOnly: true,
    categoryId: categoryId as string,
    search: search as string
  });

  res.json({ success: true, data: products });
});

app.post('/api/v1/storefront/:slug/checkout', (req: Request, res: Response) => {
  const tenant = db.getTenantBySlug(req.params.slug);
  if (!tenant) {
    return res.status(404).json({ success: false, error: { message: 'Storefront not found' } });
  }

  const { customerName, customerEmail, customerPhone, shippingAddress, items, notes } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: { message: 'Cart items are required' } });
  }

  const order = db.createOrder(tenant.id, {
    source: 'STOREFRONT',
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
    paymentMethod: 'CARD',
    notes
  });

  res.status(201).json({ success: true, data: order });
});

// --- Platform Admin APIs ---
app.get('/api/v1/admin/metrics', (req: Request, res: Response) => {
  const metrics = db.getPlatformMetrics();
  const plans = db.getPlans();
  res.json({ success: true, data: { metrics, plans } });
});

app.get('/api/v1/admin/tenants', (req: Request, res: Response) => {
  const tenants = db.getAllTenants();
  res.json({ success: true, data: tenants });
});

// --- Project Bundle Download Endpoints ---
const serveProjectZip = (_req: Request, res: Response) => {
  const zipPath = path.join(process.cwd(), 'stockoja-commerce-platform.zip');
  try {
    if (!fs.existsSync(zipPath)) {
      execSync('python3 bundle.py', { cwd: process.cwd() });
    }
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="stockoja-commerce-platform.zip"');
    const fileStream = fs.createReadStream(zipPath);
    fileStream.pipe(res);
  } catch (err: any) {
    console.error('Error serving project zip:', err);
    res.status(500).json({ success: false, error: { message: 'Failed to create or download project zip bundle' } });
  }
};

app.get('/api/v1/download-project-zip', serveProjectZip);
app.get('/stockoja-commerce-platform.zip', serveProjectZip);

// --- Vite & Production Server Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 StockỌja Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
