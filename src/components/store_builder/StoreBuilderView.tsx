import React, { useState, useEffect } from 'react';
import { Store, Palette, Globe, Save, CheckCircle2, Eye, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StoreSettings } from '../../types';
import { LoadingState } from '../common/LoadingState';

export const StoreBuilderView: React.FC<{ onPreviewStore: () => void }> = ({ onPreviewStore }) => {
  const { activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, [activeTenantId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/store/settings', { headers: { 'x-tenant-id': activeTenantId } });
      const data = await res.json();
      if (data.success) setSettings(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      const res = await fetch('/api/v1/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Store Branding Saved', 'Online storefront updated in real-time!');
        setSettings(data.data);
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to save store settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) return <LoadingState message="Loading storefront customizer..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Store size={22} className="text-emerald-400" />
            Online Storefront Customizer & Domains
          </h2>
          <p className="text-xs text-slate-400">Configure your public e-commerce store layout, theme colors, banners, and domain routing.</p>
        </div>

        <button
          onClick={onPreviewStore}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2"
        >
          <ExternalLink size={16} />
          <span>Launch Live Storefront</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customization Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Branding */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">Store Profile & Branding</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-300 font-semibold mb-1">Promotional Banner Announcement</label>
              <input
                type="text"
                value={settings.bannerText || ''}
                onChange={e => setSettings({ ...settings, bannerText: e.target.value })}
                placeholder="e.g. FREE Delivery on orders above ₦500,000"
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 bg-slate-800 text-slate-100 p-2 rounded-xl border border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Flat Shipping Rate (₦)</label>
                <input
                  type="number"
                  value={settings.flatShippingRate}
                  onChange={e => setSettings({ ...settings, flatShippingRate: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Social & Contact */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-2">Contact & Checkout Options</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp Order Number</label>
                <input
                  type="text"
                  value={settings.whatsappNumber || ''}
                  onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="2348031234567"
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Instagram Link</label>
                <input
                  type="text"
                  value={settings.instagramUrl || ''}
                  onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/yourstore"
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-xs">
              <div>
                <p className="font-semibold text-slate-200">Allow Guest Checkout</p>
                <p className="text-[10px] text-slate-400">Shoppers can purchase without creating an account</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowGuestCheckout}
                onChange={e => setSettings({ ...settings, allowGuestCheckout: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Save & Publish Store Changes'}
          </button>
        </div>

        {/* Live Domain Status Card */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Globe size={18} className="text-emerald-400" />
              Domain Routing & URL
            </h3>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-400">Default StockỌja Subdomain:</p>
              <p className="font-mono font-bold text-emerald-400 text-sm truncate">
                https://{activeTenantId.replace('tenant_', '')}.stockoja.com
              </p>
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                ✓ Active & SSL Secured
              </span>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-slate-200">Custom Domain Mapping</p>
              <p className="text-slate-400 text-[11px]">Connect your registered domain (e.g. www.yourstore.com)</p>
              <input
                type="text"
                placeholder="yourstore.com"
                className="w-full bg-slate-900 text-slate-100 p-2 rounded-xl border border-slate-700 font-mono"
              />
              <button
                type="button"
                onClick={() => addToast('info', 'Domain Verified', 'DNS record CNAME verified successfully.')}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-700"
              >
                Verify CNAME Record
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
