# StockỌja — Multi-Tenant SME Commerce & POS Operating System

StockỌja is a full-featured, multi-tenant inventory management, Point of Sale (POS), customer tracking, supplier ledger, e-commerce storefront, and platform administration suite designed specifically for retail and wholesale SMEs in emerging markets (Nigeria & West Africa).

---

## ⚡ Quick Start for Developers & AI Agents

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm** (or **bun** / **yarn** / **pnpm**)
- **Python 3** (optional, used for the one-click `npm run bundle` packaging script)

### 1. Installation
Clone or extract the repository, then install project dependencies:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The full-stack application will boot at:
**`http://localhost:3000`**

- The backend Express API runs on port 3000.
- Vite middleware is attached directly to the Express server for hot-reloading frontend assets without needing a separate port or CORS proxies.

### 3. Production Build & Start
```bash
# Build frontend bundle with Vite and backend bundle with esbuild
npm run build

# Start the optimized production server
npm start
```

### 4. Re-bundle Source Code into a Downloadable ZIP
```bash
npm run bundle
```
This generates `stockoja-commerce-platform.zip` (and copies it into `public/` for instant browser download).

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Build & Tooling** | Vite 6, Tailwind CSS v4, ESBuild |
| **Icons & Animation** | Lucide React, Motion |
| **Backend API** | Node.js, Express 4.x, TypeScript (running via `tsx` in dev) |
| **Database / Persistence** | Embedded file-backed JSON store (`stockoja_db.json`) via `backend/db.ts` with atomic writes |
| **Multi-Tenancy** | Request header context (`x-tenant-id`) with data isolation |
| **Role-Based Access Control** | OWNER, ADMIN, MANAGER, CASHIER, INVENTORY_STAFF, PLATFORM_ADMIN |

---

## 📁 Repository Structure

```
├── backend/
│   ├── db.ts               # Core database engine, queries, mutations, seed data & atomic disk writes
│   └── server.ts           # Express REST API, multi-tenant middleware, Vite integration & download route
├── src/
│   ├── components/
│   │   ├── admin/          # Multi-tenant SaaS platform management & subscription oversight
│   │   ├── common/         # Modal, Badge, StatCard, EmptyState, LoadingState
│   │   ├── customers/      # Customer directory, debt tracking, purchase history, WhatsApp links
│   │   ├── dashboard/      # Executive KPIs, stock alerts, sales charts, revenue metrics
│   │   ├── expenses/       # Business expense logging, category breakdown, cashflow deductions
│   │   ├── inventory/      # Stock movement ledger (RESTOCK, SALE, DAMAGE, RETURN, AUDIT)
│   │   ├── layout/         # Responsive Sidebar, Header, Global Search & Quick Actions
│   │   ├── orders/         # Sales order log, receipt preview, payment status filters
│   │   ├── pos/            # Fast checkout terminal, barcode scanning, cart calculation, receipts
│   │   ├── products/       # Product catalog, multi-variant SKUs, stock thresholds, pricing
│   │   ├── promotions/     # Coupon codes, discount percentages, usage limits
│   │   ├── reports/        # Profit & Loss, margin analysis, fast-moving items, revenue trends
│   │   ├── staff/          # Staff accounts, PIN management, role assignment
│   │   ├── store_builder/  # Online storefront customizer (theme color, banner, policies, domains)
│   │   ├── storefront/     # Public customer-facing e-commerce storefront & checkout flow
│   │   └── subscription/   # Plan upgrade/downgrade, billing history, feature comparison
│   ├── context/
│   │   ├── AuthContext.tsx           # Multi-tenant switching, active user persona, role simulation
│   │   ├── ToastContext.tsx          # Real-time notifications and toast feedback
│   │   └── StorefrontCartContext.tsx # Customer-facing shopping cart state
│   ├── types.ts            # TypeScript data contracts & interfaces for the entire system
│   ├── App.tsx             # Root dashboard controller & view router
│   ├── main.tsx            # React application entry point
│   └── index.css           # Tailwind CSS v4 styling rules
├── public/                 # Static assets and downloadable project archives
├── stockoja_db.json        # Seed database containing tenants, products, orders, inventory logs
├── bundle.py               # Automated packaging script that zips source code (excluding node_modules/dist)
├── package.json            # Scripts and dependencies
├── tsconfig.json           # TypeScript configuration with `@/*` path mapping
└── vite.config.ts          # Vite plugin configuration
```

---

## 🔑 Key Features

1. **Multi-Tenant Hub**: Switch between multiple store businesses (e.g., *Lagos Tech Gadgets Ltd*, *Kano Textile & Fabrics*) with isolated catalogs, currencies (NGN, USD), and metrics.
2. **Point of Sale (POS)**: Rapid checkout with instant barcode lookup, cash/card/transfer tender, discount application, and print-ready receipts.
3. **Inventory & Movement Ledger**: Real-time tracking of stock levels with audit trails for RESTOCK, SALE, DAMAGED, and RETURN movements.
4. **Online Storefront**: Every tenant receives their own public-facing e-commerce web store (`/api/v1/storefront/:slug`) with cart checkout that synchronizes into store orders.
5. **Role-Based Access Control**: Switch between Owner, Manager, Cashier, and Platform Admin personas instantly from the header to test permission restrictions.
6. **Platform Super-Admin**: Manage subscription tiers (Free, Basic, Pro, Enterprise), platform MRR, and provision new tenant stores.

---

## 🛠️ Instructions for Next-Phase Production Upgrades

When your developer or agent takes over this codebase for cloud deployment:
1. **Database Migration**: The methods in `backend/db.ts` can be mapped directly to PostgreSQL using **Drizzle ORM** or **Prisma**.
2. **Authentication**: Replace the mock headers (`x-tenant-id`, `x-user-role`) with JWT authentication tokens or Firebase Authentication.
3. **Payments**: Hook Paystack, Flutterwave, or Stripe webhooks into `backend/server.ts` for checkout completion.
