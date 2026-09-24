import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';

export const SubscriptionView: React.FC = () => {
  const { activeTenant, activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const currentPlan = activeTenant?.plan || 'FREE_TRIAL';

  const handleUpgrade = async (plan: string) => {
    try {
      const res = await fetch('/api/v1/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Plan Upgraded!', `Tenant subscription set to ${plan}. Re-login or refresh to view new limits.`);
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to update subscription');
    }
  };

  const plans = [
    {
      id: 'FREE_TRIAL',
      name: 'Free Trial',
      price: 0,
      features: ['Up to 50 Products', 'Single POS Cashier', 'Basic Reports', 'StockỌja Subdomain']
    },
    {
      id: 'BASIC',
      name: 'Starter / Basic',
      price: 15000,
      features: ['Up to 500 Products', '3 Cashiers', 'Inventory Movement Ledger', 'Online Storefront']
    },
    {
      id: 'PRO',
      name: 'Professional / Growth',
      price: 35000,
      features: ['Unlimited SKUs', 'Unlimited POS Terminals', 'P&L Financial Reports', 'Custom Domain Mapping', 'Multi-Warehouse']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard size={22} className="text-emerald-400" />
            SaaS Subscription & Tenant Licensing
          </h2>
          <p className="text-xs text-slate-400">Manage tenant billing tier, POS cashier limits, and custom domain access.</p>
        </div>

        <Badge variant="success">Current Plan: {currentPlan}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => {
          const isCurrent = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`p-6 bg-slate-900 border rounded-2xl flex flex-col justify-between space-y-6 relative ${
                isCurrent ? 'border-emerald-500 shadow-xl shadow-emerald-950/40' : 'border-slate-800'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-extrabold text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Active Tier
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{p.name}</h3>
                  <div className="mt-2 text-2xl font-black text-emerald-400">
                    {p.price === 0 ? 'FREE' : `${formatMoney(p.price)} / mo`}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                  {p.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={isCurrent}
                onClick={() => handleUpgrade(p.id)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                }`}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
