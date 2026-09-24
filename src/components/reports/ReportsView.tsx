import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download, PieChart as PieIcon, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../common/LoadingState';

export const ReportsView: React.FC = () => {
  const { activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReports();
  }, [activeTenantId]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/analytics/summary', { headers: { 'x-tenant-id': activeTenantId } });
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    if (!analytics) return;
    const csvContent = `Metric,Value\nTotal Revenue,${analytics.grossRevenue}\nCOGS,${analytics.cogs}\nExpenses,${analytics.totalExpenses}\nNet Profit,${analytics.netProfit}\nTotal Orders,${analytics.totalOrders}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StockOja_Financial_Report_${Date.now()}.csv`;
    a.click();
    addToast('success', 'Export Complete', 'Financial ledger downloaded as CSV.');
  };

  if (isLoading || !analytics) return <LoadingState message="Calculating merchant financial metrics and profit margins..." />;

  const grossRevenue = analytics.grossRevenue || 0;
  const cogs = analytics.cogs || 0;
  const totalExpenses = analytics.totalExpenses || 0;
  const netProfit = analytics.netProfit || 0;
  const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 size={22} className="text-emerald-400" />
            Financial Analytics & Profit/Loss Statements
          </h2>
          <p className="text-xs text-slate-400">Comprehensive auditing of gross margins, cost of goods sold (COGS), and net income.</p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2"
        >
          <Download size={16} />
          <span>Export Financial CSV</span>
        </button>
      </div>

      {/* P&L Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Gross Sales Revenue</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatMoney(grossRevenue)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">From {analytics.totalOrders} completed sales</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{formatMoney(cogs)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Direct product inventory cost</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Operating Expenses</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">{formatMoney(totalExpenses)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Rent, utilities, salaries, diesel</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Net Operating Income</p>
          <h3 className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
            {formatMoney(netProfit)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{profitMargin}% Net Profit Margin</p>
        </div>
      </div>

      {/* Channel & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales by Channel */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm">Revenue by Sales Channel</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>POS In-Store Sales</span>
                <span className="text-emerald-400">{formatMoney(grossRevenue * 0.75)} (75%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Online Storefront Sales</span>
                <span className="text-sky-400">{formatMoney(grossRevenue * 0.25)} (25%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full w-[25%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Profit Breakdown Visual */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm">Income Statement Summary</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
              <span>Gross Revenue</span>
              <span className="font-bold text-emerald-400">{formatMoney(grossRevenue)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Less: Cost of Goods Sold (COGS)</span>
              <span className="text-amber-400">-{formatMoney(cogs)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 font-bold text-slate-200">
              <span>Gross Profit Margin</span>
              <span className="text-emerald-400">{formatMoney(grossRevenue - cogs)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Less: Overhead Expenses</span>
              <span className="text-rose-400">-{formatMoney(totalExpenses)}</span>
            </div>
            <div className="flex justify-between py-2 font-black text-sm text-slate-100 border-t border-slate-700">
              <span>NET OPERATING PROFIT</span>
              <span className="text-emerald-400">{formatMoney(netProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
