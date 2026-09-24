import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, AlertTriangle, DollarSign,
  Package, ArrowRight, Clock, PlusCircle, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { DashboardMetrics, Order } from '../../types';
import { LoadingState } from '../common/LoadingState';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenPOS: () => void;
  onAddProduct: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenPOS,
  onAddProduct
}) => {
  const { activeTenantId, formatMoney } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/v1/reports/dashboard', {
          headers: { 'x-tenant-id': activeTenantId }
        });
        const data = await res.json();
        if (data.success) {
          setMetrics(data.data);
        }

        const ordRes = await fetch('/api/v1/orders', {
          headers: { 'x-tenant-id': activeTenantId }
        });
        const ordData = await ordRes.json();
        if (ordData.success) {
          setRecentOrders(ordData.data.slice(0, 5));
        }
      } catch (e) {
        console.error('Error loading dashboard:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [activeTenantId]);

  if (isLoading || !metrics) {
    return <LoadingState message="Calculating real-time business performance & stock metrics..." />;
  }

  return (
    <div className="space-y-4 text-slate-900">
      {/* Bento Grid Top Metrics & CTA Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Daily Revenue Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Revenue</p>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{formatMoney(metrics.totalRevenue)}</h3>
            <span className="text-emerald-500 text-xs font-medium">↑ 12%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.totalSalesCount} transactions today</p>
        </div>

        {/* Sales Orders Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sales Orders</p>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalSalesCount}</h3>
            <span className="text-slate-400 text-xs font-medium">Avg 24/hr</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Net Profit: {formatMoney(metrics.estimatedProfit)}</p>
        </div>

        {/* Active Stock Items Card */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Stock Items</p>
          <div className="flex items-baseline gap-2 mt-3">
            <h3 className="text-2xl font-bold text-slate-900">12,804</h3>
            <span className="text-emerald-500 text-xs font-medium">{metrics.lowStockCount} low stock</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.totalCustomers} registered customers</p>
        </div>

        {/* Launch POS Action Card */}
        <div className="lg:col-span-3 bg-slate-900 p-5 rounded-xl shadow-lg flex flex-col justify-center items-center text-white">
          <button
            onClick={onOpenPOS}
            className="bg-emerald-500 hover:bg-emerald-600 text-white w-full py-2.5 rounded-lg font-bold text-sm mb-1.5 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingCart size={16} /> Launch POS
          </button>
          <p className="text-[10px] text-slate-400">Shift: Active • Cashier: Adebayo</p>
        </div>
      </div>

      {/* Bento Middle Row: Analytics Chart & Stock Alerts/Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Performance Analytics Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-bold text-lg text-slate-900">Performance Analytics</h4>
              <p className="text-xs text-slate-500">7-day revenue trend across channels</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-600">Last 7 Days</span>
            </div>
          </div>

          <div className="flex-1 border-l-2 border-b-2 border-slate-100 flex items-end gap-2 px-4 pt-8 pb-1 h-44">
            {metrics.salesByDay.map((day, idx) => {
              const maxRev = Math.max(...metrics.salesByDay.map(d => d.revenue), 1);
              const heightPercent = Math.max(20, Math.round((day.revenue / maxRev) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                  <div className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMoney(day.revenue)}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-emerald-100 group-hover:bg-emerald-500 transition-colors rounded-t-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{day.date.slice(8)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-bold uppercase">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Critical Stock Alerts & Top Products */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-slate-900">Critical Stock Alerts</h4>
              <button onClick={() => onNavigate('inventory')} className="text-xs text-emerald-600 font-bold hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Pampers Baby-Dry L</p>
                  <p className="text-[10px] text-red-500 font-semibold">Only 4 units left</p>
                </div>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-[10px] font-bold border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Restock
                </button>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Indomie Onions (70g)</p>
                  <p className="text-[10px] text-orange-500 font-semibold">12 units left (Below threshold)</p>
                </div>
                <button
                  onClick={() => onNavigate('inventory')}
                  className="text-[10px] font-bold border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Restock
                </button>
              </div>
              <div className="flex items-center justify-between pb-1">
                <div>
                  <p className="text-sm font-bold text-slate-900">Golden Morn (1kg)</p>
                  <p className="text-[10px] text-red-500 font-semibold">Out of stock</p>
                </div>
                <button
                  onClick={onAddProduct}
                  className="text-[10px] font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md hover:bg-slate-800"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Bottom Row: Recent Store Activity Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg text-slate-900">Recent Store Activity</h4>
          <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-emerald-600 hover:underline">
            View All Sales
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 font-medium border-b border-slate-100">
              <tr>
                <th className="pb-3 text-xs uppercase tracking-wider">Transaction ID</th>
                <th className="pb-3 text-xs uppercase tracking-wider">Status</th>
                <th className="pb-3 text-xs uppercase tracking-wider">Customer</th>
                <th className="pb-3 text-xs uppercase tracking-wider">Channel</th>
                <th className="pb-3 text-xs uppercase tracking-wider text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono text-xs font-bold text-slate-900">{order.orderNumber}</td>
                  <td>
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="font-semibold text-slate-800">{order.customerName}</td>
                  <td className="text-xs font-mono text-slate-500">{order.source}</td>
                  <td className="text-right font-bold text-slate-900">{formatMoney(order.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
