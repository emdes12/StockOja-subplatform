import React, { useState } from 'react';
import { Tag, Plus, Check, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';

export const PromotionsView: React.FC = () => {
  const { formatMoney } = useAuth();
  const { addToast } = useToast();

  const [coupons, setCoupons] = useState([
    { id: '1', code: 'WELCOME10', discountType: 'PERCENTAGE', discountValue: 10, minOrderAmount: 100000, usedCount: 14, isActive: true },
    { id: '2', code: 'SAVE5000', discountType: 'FIXED', discountValue: 5000, minOrderAmount: 50000, usedCount: 8, isActive: true },
    { id: '3', code: 'BLACKFRIDAY', discountType: 'PERCENTAGE', discountValue: 20, minOrderAmount: 200000, usedCount: 45, isActive: false }
  ]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast('success', 'Copied!', `Coupon code ${code} copied to clipboard.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Tag size={22} className="text-emerald-400" />
            Promotions & Coupon Discounts
          </h2>
          <p className="text-xs text-slate-400">Create tenant-scoped coupon codes for POS sales and online storefront checkout.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="font-mono font-extrabold text-base text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800">
                {c.code}
              </span>
              <Badge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                {c.isActive ? 'ACTIVE' : 'EXPIRED'}
              </Badge>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <p className="text-lg font-bold text-slate-100">
                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatMoney(c.discountValue)} OFF`}
              </p>
              <p className="text-slate-400">Min. Order: {formatMoney(c.minOrderAmount)}</p>
              <p className="text-slate-400">{c.usedCount} total customer uses</p>
            </div>

            <button
              onClick={() => copyCode(c.code)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2"
            >
              <Copy size={14} /> Copy Coupon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
