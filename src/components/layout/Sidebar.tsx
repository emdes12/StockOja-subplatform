import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Layers, FileText,
  Users, Truck, Wallet, Tag, Store, BarChart3, UserCheck,
  CreditCard, ShieldCheck, ExternalLink, ChevronDown, Sparkles, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DownloadProjectModal } from '../common/DownloadProjectModal';

export type ActiveTab =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'promotions'
  | 'store_builder'
  | 'reports'
  | 'staff'
  | 'subscription'
  | 'storefront'
  | 'platform_admin';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile
}) => {
  const { activeTenant, availableTenants, switchTenant, userRole, isPlatformAdmin, setIsPlatformAdmin } = useAuth();
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'pos', label: 'POS Terminal', icon: <ShoppingCart size={18} />, badge: 'Fast' },
    { id: 'products', label: 'Products & Catalog', icon: <Package size={18} /> },
    { id: 'inventory', label: 'Inventory Ledger', icon: <Layers size={18} /> },
    { id: 'orders', label: 'Orders & Sales', icon: <FileText size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'suppliers', label: 'Suppliers & POs', icon: <Truck size={18} /> },
    { id: 'expenses', label: 'Expenses', icon: <Wallet size={18} /> },
    { id: 'promotions', label: 'Promotions & Coupons', icon: <Tag size={18} /> },
    { id: 'store_builder', label: 'Storefront Builder', icon: <Store size={18} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={18} /> },
    { id: 'staff', label: 'Team & Staff', icon: <UserCheck size={18} /> },
    { id: 'subscription', label: 'Subscription & Billing', icon: <CreditCard size={18} /> }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-base shadow">
            Ọ
          </div>
          <span className="text-xl font-bold tracking-tight text-white">StockỌja</span>
        </div>

        {/* Multi-Tenant Switcher */}
        <div className="px-4 pb-3">
          <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
              Active Tenant Hub
            </label>
            <div className="relative">
              <select
                value={activeTenant?.id || ''}
                onChange={e => {
                  switchTenant(e.target.value);
                  setIsOpenMobile(false);
                }}
                className="w-full bg-slate-900 text-slate-200 text-xs font-medium rounded-md px-2.5 py-1.5 border border-slate-700 appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer pr-6"
              >
                {availableTenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
          {navItems.map(item => {
            const isActive = !isPlatformAdmin && activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsPlatformAdmin(false);
                  setActiveTab(item.id as ActiveTab);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="text-slate-400">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80 my-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-1">
              Storefront & System
            </div>
            
            {/* View Online Storefront button */}
            <button
              onClick={() => {
                setIsPlatformAdmin(false);
                setActiveTab('storefront');
                setIsOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'storefront' && !isPlatformAdmin
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-sky-400 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink size={18} />
                <span>Live Public Store</span>
              </div>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.5 rounded font-mono">
                Storefront
              </span>
            </button>

            {/* Platform Super Admin Mode */}
            <button
              onClick={() => {
                setIsPlatformAdmin(true);
                setActiveTab('platform_admin');
                setIsOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium mt-1 transition-all ${
                isPlatformAdmin
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-400 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} />
                <span>Platform Admin</span>
              </div>
              <Sparkles size={14} className="text-purple-300 animate-pulse" />
            </button>

            {/* Download Project Source Code */}
            <button
              onClick={() => {
                setShowDownloadModal(true);
                setIsOpenMobile(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium mt-1 text-indigo-400 hover:bg-slate-800/60 transition-all border border-indigo-900/40 hover:border-indigo-700/60"
            >
              <div className="flex items-center gap-2.5">
                <Download size={18} />
                <span>Download Bundle</span>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                .ZIP
              </span>
            </button>
          </div>
        </nav>

        {/* User Role Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold text-slate-300">Role: {userRole}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{activeTenant?.name}</p>
        </div>
      </aside>

      <DownloadProjectModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </>
  );
};
