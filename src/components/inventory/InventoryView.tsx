import React, { useState, useEffect } from 'react';
import {
  Layers, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw,
  PlusCircle, FileText, CheckCircle2, History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { InventoryItem, InventoryMovement, Product } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';

export const InventoryView: React.FC = () => {
  const { activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  useEffect(() => {
    loadInventoryData();
  }, [activeTenantId]);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      const [invRes, mvtRes, prodRes] = await Promise.all([
        fetch('/api/v1/inventory', { headers: { 'x-tenant-id': activeTenantId } }),
        fetch('/api/v1/inventory/movements', { headers: { 'x-tenant-id': activeTenantId } }),
        fetch('/api/v1/products', { headers: { 'x-tenant-id': activeTenantId } })
      ]);

      const invData = await invRes.json();
      const mvtData = await mvtRes.json();
      const prodData = await prodRes.json();

      if (invData.success) setItems(invData.data);
      if (mvtData.success) setMovements(mvtData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch (e) {
      console.error('Error loading inventory:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdjust = (prodId?: string) => {
    if (prodId) {
      setSelectedProductId(prodId);
      const target = products.find(p => p.id === prodId);
      setNewQuantity(target?.stockQuantity || 0);
    } else if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setNewQuantity(products[0].stockQuantity);
    }
    setAdjustReason('Physical Stock Count Reconciliation');
    setShowAdjustModal(true);
  };

  const handleConfirmAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !adjustReason) {
      addToast('error', 'Validation Error', 'Product and Reason are required for inventory audit.');
      return;
    }

    try {
      const res = await fetch('/api/v1/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({
          productId: selectedProductId,
          newQuantity,
          reason: adjustReason
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Stock Adjusted', `Inventory updated to ${newQuantity} units with audit log.`);
        setShowAdjustModal(false);
        loadInventoryData();
      } else {
        addToast('error', 'Adjustment Failed', data.error?.message);
      }
    } catch (e) {
      addToast('error', 'Error', 'Server request failed.');
    }
  };

  // Summary Metrics
  const totalStockValue = items.reduce((sum, item) => sum + (item.costPrice * item.onHandQuantity), 0);
  const totalStockUnits = items.reduce((sum, item) => sum + item.onHandQuantity, 0);
  const lowStockItems = items.filter(i => i.onHandQuantity <= i.lowStockThreshold);

  if (isLoading) {
    return <LoadingState message="Fetching transactional stock ledger & warehouse balances..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers size={22} className="text-emerald-400" />
            Inventory Control & Stock Ledger
          </h2>
          <p className="text-xs text-slate-400">Transactional ledger tracking all stock movements, sales deductions, and PO receipts.</p>
        </div>

        <button
          onClick={() => handleOpenAdjust()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
        >
          <PlusCircle size={16} />
          <span>Adjust Stock Level</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Inventory Valuation (At Cost)</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatMoney(totalStockValue)}</h3>
          <p className="text-xs text-slate-400 mt-1">{totalStockUnits} total items on hand</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Unique SKUs</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{items.length} SKUs</h3>
          <p className="text-xs text-slate-400 mt-1">Across main store location</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Low Stock Reorder Alerts</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{lowStockItems.length} SKUs</h3>
          <p className="text-xs text-slate-400 mt-1">Items at or below reorder limit</p>
        </div>
      </div>

      {/* Low Stock Alerts Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle size={16} />
            <span>Attention Required: Low Stock Detected</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map(item => (
              <div key={item.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{item.productName}</p>
                  <p className="text-[10px] text-amber-400 font-mono">
                    Stock: {item.onHandQuantity} (Limit: {item.lowStockThreshold})
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdjust(item.productId)}
                  className="px-2.5 py-1 bg-amber-900 hover:bg-amber-800 text-amber-200 text-[10px] font-bold rounded-lg border border-amber-700"
                >
                  Adjust
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movement Audit Trail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">Stock Movement Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">{movements.length} logged transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Change</th>
                <th className="py-3 px-4">Prev → New</th>
                <th className="py-3 px-4">Reason / Ref</th>
                <th className="py-3 px-4">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.map(mvt => {
                const isPositive = mvt.quantityChange > 0;
                return (
                  <tr key={mvt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(mvt.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">{mvt.productName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={mvt.type === 'SALE' ? 'purple' : mvt.type === 'PURCHASE' ? 'success' : 'warning'} size="sm">
                        {mvt.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-extrabold font-mono">
                      <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {isPositive ? `+${mvt.quantityChange}` : mvt.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {mvt.previousQuantity} → <span className="font-bold text-slate-200">{mvt.newQuantity}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{mvt.reason || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-400">{mvt.actorName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Stock Adjustment & Reconciliation"
        subtitle="Record inventory changes with mandatory audit trail reason"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmAdjust} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Product *</label>
            <select
              value={selectedProductId}
              onChange={e => {
                setSelectedProductId(e.target.value);
                const target = products.find(p => p.id === e.target.value);
                if (target) setNewQuantity(target.stockQuantity);
              }}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">New Audited Stock Quantity *</label>
            <input
              type="number"
              min="0"
              required
              value={newQuantity}
              onChange={e => setNewQuantity(Number(e.target.value) || 0)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-bold text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Audit Adjustment Reason *</label>
            <textarea
              required
              rows={3}
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="e.g. Physical inventory count correction, Damaged stock write-off..."
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdjustModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
