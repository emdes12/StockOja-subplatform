import React, { useState, useEffect } from 'react';
import { Truck, Plus, CheckCircle, Clock, PackageCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Supplier, PurchaseOrder, Product } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';

export const SuppliersView: React.FC = () => {
  const { activeTenantId, formatMoney, userName } = useAuth();
  const { addToast } = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [showPOModal, setShowPOModal] = useState<boolean>(false);

  // Forms
  const [supplierName, setSupplierName] = useState('');
  const [contactName, setContactName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');

  // PO Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; orderedQuantity: number; unitCost: number }[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTenantId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [supRes, poRes, prodRes] = await Promise.all([
        fetch('/api/v1/suppliers', { headers: { 'x-tenant-id': activeTenantId } }),
        fetch('/api/v1/purchase-orders', { headers: { 'x-tenant-id': activeTenantId } }),
        fetch('/api/v1/products', { headers: { 'x-tenant-id': activeTenantId } })
      ]);

      const supData = await supRes.json();
      const poData = await poRes.json();
      const prodData = await prodRes.json();

      if (supData.success) setSuppliers(supData.data);
      if (poData.success) setPurchaseOrders(poData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch (e) {
      console.error('Error loading purchasing data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({
          name: supplierName,
          contactName,
          email: supplierEmail,
          phone: supplierPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Supplier Saved', `Added supplier ${supplierName}`);
        setShowSupplierModal(false);
        setSupplierName(''); setContactName(''); setSupplierEmail(''); setSupplierPhone('');
        loadData();
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to save supplier');
    }
  };

  const handleReceivePO = async (poId: string) => {
    try {
      const res = await fetch(`/api/v1/purchase-orders/${poId}/receive`, {
        method: 'POST',
        headers: {
          'x-tenant-id': activeTenantId,
          'x-user-name': userName
        }
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Stock Received!', 'Inventory levels automatically increased with audit log.');
        loadData();
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to process PO receipt');
    }
  };

  if (isLoading) return <LoadingState message="Loading suppliers & purchase orders..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck size={22} className="text-emerald-400" />
            Supplier & Purchase Management
          </h2>
          <p className="text-xs text-slate-400">Manage supplier contacts, purchase orders, and stock receipts.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSupplierModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
          >
            + Add Supplier
          </button>
        </div>
      </div>

      {/* Suppliers Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-slate-200 text-sm">Suppliers Directory</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(sup => (
            <div key={sup.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-100">{sup.name}</p>
              <p className="text-slate-400">Contact: {sup.contactName}</p>
              <p className="text-slate-400">{sup.email} | {sup.phone}</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-2">Category: {sup.category || 'General'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm">Purchase Orders (POs)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">Total Cost</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {purchaseOrders.map(po => (
                <tr key={po.id}>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">{po.poNumber}</td>
                  <td className="py-3 px-3 font-medium text-slate-200">{po.supplierName}</td>
                  <td className="py-3 px-3 font-bold text-slate-100">{formatMoney(po.totalAmount)}</td>
                  <td className="py-3 px-3">
                    <Badge variant={po.status === 'RECEIVED' ? 'success' : 'warning'} size="sm">
                      {po.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-right">
                    {po.status !== 'RECEIVED' ? (
                      <button
                        onClick={() => handleReceivePO(po.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 ml-auto"
                      >
                        <PackageCheck size={14} /> Receive Goods
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-[11px]">✓ Received & In-Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Add Supplier Contact"
        subtitle="Record vendor for product restocking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Company / Supplier Name *</label>
            <input
              type="text"
              required
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
            <input
              type="text"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={supplierEmail}
                onChange={e => setSupplierEmail(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={supplierPhone}
                onChange={e => setSupplierPhone(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowSupplierModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
