import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Shield, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { User, RoleType } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { LoadingState } from '../common/LoadingState';

export const StaffView: React.FC = () => {
  const { activeTenantId } = useAuth();
  const { addToast } = useToast();

  const [staffList, setStaffList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<RoleType>('CASHIER');

  useEffect(() => {
    loadStaff();
  }, [activeTenantId]);

  const loadStaff = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/users', { headers: { 'x-tenant-id': activeTenantId } });
      const data = await res.json();
      if (data.success) setStaffList(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId
        },
        body: JSON.stringify({ fullName, email, role })
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Staff Member Added', `Created user account for ${fullName} (${role})`);
        setShowAddModal(false);
        setFullName(''); setEmail('');
        loadStaff();
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to add staff account');
    }
  };

  if (isLoading) return <LoadingState message="Loading tenant staff accounts..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck size={22} className="text-emerald-400" />
            Staff Accounts & Role Permissions
          </h2>
          <p className="text-xs text-slate-400">Manage cashier credentials, store manager permissions, and access controls.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Add Staff Account</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role Permission</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map(u => (
                <tr key={u.id}>
                  <td className="py-3 px-4 font-bold text-slate-100">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'TENANT_OWNER' ? 'purple' : u.role === 'CASHIER' ? 'info' : 'warning'} size="sm">
                      {u.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                      <CheckCircle size={12} /> Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Staff Account"
        subtitle="Provide credentials for employee access"
        maxWidth="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Samuel Adebayo"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="samuel@store.com"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Role Permission *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as RoleType)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-semibold"
            >
              <option value="CASHIER">CASHIER (POS Only Access)</option>
              <option value="STORE_MANAGER">STORE MANAGER (Full Catalog & POS)</option>
              <option value="INVENTORY_OFFICER">INVENTORY OFFICER (Stock Audit Only)</option>
              <option value="TENANT_OWNER">TENANT OWNER (Full Admin Privileges)</option>
            </select>
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
              Create Staff User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
