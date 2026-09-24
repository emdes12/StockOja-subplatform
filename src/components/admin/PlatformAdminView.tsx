import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Building2, Activity, Globe, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Tenant } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';

export const PlatformAdminView: React.FC = () => {
  const { formatMoney } = useAuth();
  const { addToast } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showProvisionModal, setShowProvisionModal] = useState<boolean>(false);

  const [tenantName, setTenantName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState<'FREE_TRIAL' | 'BASIC' | 'PRO'>('BASIC');
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/admin/tenants');
      const data = await res.json();
      if (data.success) setTenants(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !slug) return;

    try {
      const res = await fetch('/api/v1/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tenantName, slug, plan, ownerEmail })
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Tenant Provisioned', `Created new tenant ${tenantName} (${data.data.id})`);
        setShowProvisionModal(false);
        setTenantName(''); setSlug(''); setOwnerEmail('');
        loadTenants();
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to provision tenant');
    }
  };

  if (isLoading) return <LoadingState message="Loading platform operator analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert size={22} className="text-emerald-400" />
            StockỌja Platform Super-Admin Workspace
          </h2>
          <p className="text-xs text-slate-400">Multi-tenant isolation management, tenant provisioning, and platform GMV.</p>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Provision New Merchant Tenant</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Active Provisioned Tenants</p>
          <h3 className="text-2xl font-bold text-slate-100 mt-1">{tenants.length} Merchants</h3>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">Platform Global GMV</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatMoney(45200000)}</h3>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-slate-400">System Health & Isolation</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">100% Operational</h3>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Multi-Tenant Registry</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Tenant ID</th>
                <th className="py-3 px-4">Merchant Name</th>
                <th className="py-3 px-4">Subdomain Slug</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Provisioned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tenants.map(t => (
                <tr key={t.id}>
                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{t.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{t.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{t.slug}.stockoja.com</td>
                  <td className="py-3 px-4">
                    <Badge variant="purple" size="sm">{t.plan}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle size={12} /> ACTIVE
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showProvisionModal}
        onClose={() => setShowProvisionModal(false)}
        title="Provision New Merchant Tenant"
        subtitle="Creates isolated tenant database context & default owner user"
        maxWidth="md"
      >
        <form onSubmit={handleProvisionTenant} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Business / Tenant Name *</label>
            <input
              type="text"
              required
              value={tenantName}
              onChange={e => {
                setTenantName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
              }}
              placeholder="e.g. Lekki Supermarket"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subdomain Slug *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="lekkisupermarket"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Owner Email *</label>
            <input
              type="email"
              required
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
              placeholder="owner@lekki.com"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">SaaS Tier Plan</label>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value as any)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-semibold"
            >
              <option value="FREE_TRIAL">FREE TRIAL</option>
              <option value="BASIC">BASIC (₦15,000/mo)</option>
              <option value="PRO">PRO (₦35,000/mo)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowProvisionModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Provision Tenant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
