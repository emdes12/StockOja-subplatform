import React, { useState } from 'react';
import { Menu, Plus, UserCheck, ChevronDown, ShoppingBag, ShieldCheck, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleType } from '../../types';
import { DownloadProjectModal } from '../common/DownloadProjectModal';

interface HeaderProps {
  onToggleMobileNav: () => void;
  onQuickSale: () => void;
  onAddProduct: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileNav,
  onQuickSale,
  onAddProduct
}) => {
  const { activeTenant, userRole, userName, switchRole, currencySymbol, isPlatformAdmin } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const roles: RoleType[] = ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF'];

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 shadow-xs text-slate-900">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar from Bento Spec */}
        <div className="hidden md:flex bg-slate-100 rounded-lg px-3 py-1.5 gap-2.5 w-72 lg:w-80 border border-slate-200/80 items-center">
          <span className="text-slate-400 text-xs">🔍</span>
          <input
            type="text"
            placeholder="Search products or orders..."
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            {isPlatformAdmin ? (
              <span className="text-purple-600 flex items-center gap-1">
                <ShieldCheck size={16} /> Platform Admin Control Center
              </span>
            ) : (
              <>
                <span>{activeTenant?.name || 'StockỌja Store'}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-mono font-bold">
                  {currencySymbol} {activeTenant?.currency || 'NGN'}
                </span>
              </>
            )}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {isPlatformAdmin ? 'Managing StockỌja SaaS platform & subscriptions' : activeTenant?.address}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        {!isPlatformAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickSale}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">Launch POS</span>
            </button>
            <button
              onClick={onAddProduct}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors hidden md:flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        )}

        {/* Download Project Code Bundle */}
        <button
          onClick={() => setShowDownloadModal(true)}
          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Download complete project source code ZIP for local development or AI agent"
        >
          <Download size={14} className="text-indigo-600" />
          <span className="hidden sm:inline">Export Code</span>
          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono font-bold leading-none">.ZIP</span>
        </button>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 transition-colors"
          >
            <UserCheck size={14} className="text-emerald-600" />
            <div className="text-left hidden sm:block">
              <p className="text-[10px] text-slate-500 leading-tight">Role</p>
              <p className="font-bold text-xs leading-tight">{userRole}</p>
            </div>
            <ChevronDown size={12} className="text-slate-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                Switch Persona
              </div>
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                    userRole === r ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {userRole === r && <span className="text-emerald-600">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="hidden xl:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-900">{userName || 'Adebayo Smith'}</span>
            <span className="text-[10px] text-slate-500">{userRole}</span>
          </div>
          <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs shadow-xs border border-emerald-200">
            AS
          </div>
        </div>
      </div>

      <DownloadProjectModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </header>
  );
};
