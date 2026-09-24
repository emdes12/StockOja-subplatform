# Instructions for AI Agent / Engineer

This document provides technical instructions for the developer or AI agent continuing the development, maintenance, or deployment of **StockỌja Commerce Platform**.

---

## 🎯 Project Overview
StockỌja is an all-in-one multi-tenant retail and SME commerce platform designed for emerging market SMEs (e.g., in Nigeria and West Africa). It provides in-store POS, inventory ledger, supplier purchasing, customer directory, online web storefront, and SaaS platform administration.

---

## 🛠️ Technology Stack & Environment
- **Runtime**: Node.js 18+ (tested on Node 20 / 22)
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`)
- **Icons**: `lucide-react`
- **Server**: Express 4 mounted with Vite middleware in development (`backend/server.ts`)
- **Port**: Always binds to port `3000` (e.g., `process.env.PORT || 3000`)
- **Persistence**: File-backed JSON database engine (`backend/db.ts` with `stockoja_db.json`)
- **Packaging**: Single command `npm run bundle` generates clean `.zip` archives.

---

## 🚀 Commands
| Task | Command |
|---|---|
| Install Dependencies | `npm install` |
| Start Dev Server | `npm run dev` |
| Check Type & Lint | `npm run lint` |
| Build for Production | `npm run build` |
| Start Production Server | `npm start` |
| Create ZIP Distribution | `npm run bundle` |

---

## 🏛️ Architecture Details

### 1. Multi-Tenant Isolation
- In `backend/server.ts`, requests under `/api/v1` pass through `resolveTenantContext` middleware.
- Client passes `x-tenant-id` header (e.g. `tenant_lagos_tech` or `tenant_kano_fabrics`).
- If omitted, it defaults to `tenant_lagos_tech`.
- In `backend/db.ts`, queries are tenant-scoped: `this.data.products.filter(p => p.tenantId === tenantId)`.

### 2. Frontend State Architecture
- `AuthContext`: Maintains `activeTenant`, `userRole`, `currencySymbol`, `availableTenants`. When tenant is switched, all child views automatically re-fetch tenant-specific data via standard REST endpoints.
- `StorefrontCartContext`: Manages public shopper cart state, item quantities, and checkout payload generation.
- `ToastContext`: Dispatches non-blocking notifications for sales, product saves, and errors.

### 3. Database Layer (`backend/db.ts`)
- Implements synchronous in-memory caching with atomic write-to-disk (`save()`).
- Seed records in `stockoja_db.json` contain rich sample data:
  - 2 Tenants (Lagos Tech Gadgets Ltd & Kano Textile & Fabrics)
  - Products with SKU, Barcode, Cost Price, Selling Price, Min Stock Level, and Categories.
  - Historical Inventory Movements (RESTOCK, SALE, DAMAGED, RETURN).
  - Completed and Pending Orders.
  - Suppliers, Purchase Orders, Expenses, Coupons, and Storefront settings.

---

## 📋 Recommended Roadmap for Agent / Developer

### Step 1: Real Database Integration (Optional)
If migrating from `stockoja_db.json` to PostgreSQL:
- Keep the interface methods in `backend/db.ts` (e.g. `getProducts(tenantId)`, `createOrder(tenantId, data)`).
- Replace the in-memory array operations with Drizzle ORM or Prisma queries.

### Step 2: Authentication & Multi-User Accounts
- Hook up JWT issuance on `POST /api/v1/auth/login`.
- Verify the bearer token in `backend/server.ts` to populate `req.tenantId` and `req.userRole`.

### Step 3: Payment Gateway Integration
- For Nigerian / African markets: Add **Paystack** or **Flutterwave** API calls in `/api/v1/storefront/:slug/checkout` or POS card tender.
- Return authorization URL or trigger inline modal.

### Step 4: Printing & Hardware
- For POS receipt printing: Web Bluetooth ESC/POS thermal printer support or direct `window.print()` (which is already configured via the receipt modal styling).

---

## 📦 How to Test & Verify
1. Run `npm run lint` (runs `tsc --noEmit` to ensure 0 TypeScript errors).
2. Run `npm run build` (ensures both Vite frontend build and ESBuild backend compilation succeed).
3. Access `http://localhost:3000` and test:
   - POS: add items, select cash/card, complete sale.
   - Products: add, edit, or adjust inventory.
   - Storefront: click "Live Public Store" in sidebar, test adding items to cart and checking out.
   - Platform Admin: switch to Platform Admin to inspect global MRR and tenant quotas.
