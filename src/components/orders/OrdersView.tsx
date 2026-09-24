import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Printer, CheckCircle, Truck, XCircle,
  Eye, ShoppingBag, Clock, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Order, OrderStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';

export const OrdersView: React.FC = () => {
  const { activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  // Selected Order for Details & Invoice
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  useEffect(() => {
    loadOrders();
  }, [activeTenantId]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/orders', { headers: { 'x-tenant-id': activeTenantId } });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (e) {
      console.error('Error loading orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Order Updated', `Order status changed to ${newStatus}`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.data);
        }
        loadOrders();
      }
    } catch (e) {
      addToast('error', 'Update Failed', 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesSource = !sourceFilter || o.source === sourceFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerPhone && o.customerPhone.includes(q));
    return matchesStatus && matchesSource && matchesSearch;
  });

  if (isLoading) {
    return <LoadingState message="Loading merchant orders and fulfillment records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText size={22} className="text-emerald-400" />
            Orders & Fulfillment Workspace
          </h2>
          <p className="text-xs text-slate-400">Track and fulfill sales from both Point of Sale and Online Storefront.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer name, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 text-xs font-medium pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none flex-1 md:w-36"
          >
            <option value="">All Sources</option>
            <option value="POS">POS Terminal</option>
            <option value="STOREFRONT">Online Store</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none flex-1 md:w-40"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">{order.orderNumber}</td>
                  <td className="py-3 px-4">
                    <Badge variant={order.source === 'POS' ? 'purple' : 'info'} size="sm">
                      {order.source}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-200">{order.customerName}</p>
                    {order.customerPhone && <p className="text-[10px] text-slate-400">{order.customerPhone}</p>}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-100">{formatMoney(order.totalAmount)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                      {order.paymentStatus} ({order.paymentMethod})
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        order.status === 'DELIVERED'
                          ? 'success'
                          : order.status === 'PROCESSING'
                          ? 'info'
                          : order.status === 'CANCELLED'
                          ? 'danger'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailModal(true);
                      }}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details & Fulfillment Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedOrder ? `Order Details - ${selectedOrder.orderNumber}` : 'Order Details'}
        subtitle="Manage order fulfillment and customer information"
        maxWidth="2xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Header Status & Quick Transition */}
            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-slate-400">Fulfillment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedOrder.status === 'DELIVERED' ? 'success' : 'info'}>
                    {selectedOrder.status}
                  </Badge>
                  <span className="text-slate-400">• Source: {selectedOrder.source}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl"
                  >
                    Start Processing
                  </button>
                )}
                {selectedOrder.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                  >
                    Mark Delivered
                  </button>
                )}
                {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    className="px-3 py-1.5 bg-rose-950 text-rose-300 hover:bg-rose-900 font-bold rounded-xl border border-rose-800"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800">
              <div>
                <p className="font-bold text-slate-300 mb-1">Customer Info</p>
                <p className="font-semibold text-slate-100">{selectedOrder.customerName}</p>
                {selectedOrder.customerEmail && <p className="text-slate-400">{selectedOrder.customerEmail}</p>}
                {selectedOrder.customerPhone && <p className="text-slate-400">{selectedOrder.customerPhone}</p>}
              </div>

              <div>
                <p className="font-bold text-slate-300 mb-1">Delivery / Address</p>
                <p className="text-slate-300">{selectedOrder.shippingAddress || 'In-Store Pickup / Walk-in'}</p>
                {selectedOrder.cashierName && <p className="text-slate-400 mt-1">Cashier: {selectedOrder.cashierName}</p>}
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <p className="font-bold text-slate-200 mb-2">Order Items ({selectedOrder.items.length})</p>
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedOrder.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-200">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{formatMoney(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">{formatMoney(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatMoney(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount</span>
                  <span>-{formatMoney(selectedOrder.discount)}</span>
                </div>
              )}
              {selectedOrder.shippingFee > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Shipping Fee</span>
                  <span>{formatMoney(selectedOrder.shippingFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-emerald-400 pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span>{formatMoney(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center gap-2"
              >
                <Printer size={16} /> Print Invoice
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
