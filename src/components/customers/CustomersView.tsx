import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Customer } from '../../types';
import { Modal } from '../common/Modal';
import { LoadingState } from '../common/LoadingState';

export const CustomersView: React.FC = () => {
  const { activeTenantId, formatMoney } = useAuth();
  const { addToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [activeTenantId]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/customers', { headers: { 'x-tenant-id': activeTenantId } });
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (e) {
      console.error('Error loading customers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({ name, email, phone, address, notes })
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Customer Profile Created', `Added ${name}`);
        setShowAddModal(false);
        setName(''); setEmail(''); setPhone(''); setAddress(''); setNotes('');
        loadCustomers();
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to create customer');
    }
  };

  const filtered = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
  });

  if (isLoading) return <LoadingState message="Loading merchant customer profiles..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users size={22} className="text-emerald-400" />
            Customer Relationship Directory
          </h2>
          <p className="text-xs text-slate-400">Track purchase history, total customer spend, and contact details.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 text-xs font-medium pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cust => (
          <div key={cust.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{cust.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{cust.address || 'Lagos, Nigeria'}</p>
              </div>
              <span className="p-2 rounded-xl bg-emerald-950 text-emerald-400 font-mono text-xs font-bold border border-emerald-800">
                {cust.totalOrders} Orders
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              {cust.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-500" /> {cust.phone}
                </p>
              )}
              {cust.email && (
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-500" /> {cust.email}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Lifetime Spend</span>
              <span className="font-extrabold text-emerald-400">{formatMoney(cust.totalSpent)}</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Customer Profile"
        subtitle="Record customer contacts for targeted sales & tracking"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Delivery Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
