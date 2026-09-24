import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { StorefrontCartProvider } from './context/StorefrontCartContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { ProductsView } from './components/products/ProductsView';
import { InventoryView } from './components/inventory/InventoryView';
import { OrdersView } from './components/orders/OrdersView';
import { CustomersView } from './components/customers/CustomersView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { PromotionsView } from './components/promotions/PromotionsView';
import { StoreBuilderView } from './components/store_builder/StoreBuilderView';
import { PublicStoreView } from './components/storefront/PublicStoreView';
import { ReportsView } from './components/reports/ReportsView';
import { StaffView } from './components/staff/StaffView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { PlatformAdminView } from './components/admin/PlatformAdminView';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isPublicStoreMode, setIsPublicStoreMode] = useState<boolean>(false);

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'POS':
        return <PosView />;
      case 'PRODUCTS':
        return <ProductsView />;
      case 'INVENTORY':
        return <InventoryView />;
      case 'ORDERS':
        return <OrdersView />;
      case 'CUSTOMERS':
        return <CustomersView />;
      case 'SUPPLIERS':
        return <SuppliersView />;
      case 'EXPENSES':
        return <ExpensesView />;
      case 'PROMOTIONS':
        return <PromotionsView />;
      case 'STORE_BUILDER':
        return <StoreBuilderView onPreviewStore={() => setIsPublicStoreMode(true)} />;
      case 'REPORTS':
        return <ReportsView />;
      case 'STAFF':
        return <StaffView />;
      case 'SUBSCRIPTION':
        return <SubscriptionView />;
      case 'PLATFORM_ADMIN':
        return <PlatformAdminView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  // If testing the public customer-facing storefront view
  if (isPublicStoreMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Admin Bar to switch back */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-100">Live Public Storefront Simulator</span>
            <span className="text-slate-500 font-mono">| Customers see this view when shopping online</span>
          </div>
          <button
            onClick={() => setIsPublicStoreMode(false)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Merchant Dashboard
          </button>
        </div>

        <PublicStoreView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header with Multi-Tenant & Persona Selector */}
      <Header onOpenPublicStore={() => setIsPublicStoreMode(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* View Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F1F5F9]">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StorefrontCartProvider>
          <MainLayout />
        </StorefrontCartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
