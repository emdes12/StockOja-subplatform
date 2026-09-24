import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Expense } from '../../types';
import { Modal } from '../common/Modal';
import { LoadingState } from '../common/LoadingState';

export const ExpensesView: React.FC = () => {
  const { activeTenantId, formatMoney, userName } = useAuth();
  const { addToast } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'RENT' | 'UTILITIES' | 'SALARIES' | 'MARKETING' | 'SUPPLIES' | 'MAINTENANCE' | 'OTHER'>('RENT');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadExpenses();
  }, [activeTenantId]);

  const loadExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/expenses', { headers: { 'x-tenant-id': activeTenantId } });
      const data = await res.json();
      if (data.success) setExpenses(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      const res = await fetch('/api/v1/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenantId,
          'x-user-name': userName
        },
        body: JSON.stringify({
          title,
          category,
          amount: Number(amount),
          date,
          description
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Expense Logged', `Recorded ${title} for ${formatMoney(Number(amount))}`);
        setShowAddModal(false);
        setTitle(''); setAmount(''); setDescription('');
        loadExpenses();
      }
    } catch (e) {
      addToast('error', 'Error', 'Failed to log expense');
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) return <LoadingState message="Loading expense records..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet size={22} className="text-emerald-400" />
            Operating Expense Ledger
          </h2>
          <p className="text-xs text-slate-400">Log store overheads, rent, utilities, and marketing expenses.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Log Expense</span>
        </button>
      </div>

      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Recorded Overheads</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">{formatMoney(totalExpenseAmount)}</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">{expenses.length} entries</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-100">{exp.title}</p>
                    {exp.description && <p className="text-[10px] text-slate-400">{exp.description}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-400">{formatMoney(exp.amount)}</td>
                  <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-300">{exp.createdByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Log Store Expense"
        subtitle="Include in financial profit & loss statements"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Generator Diesel, Store Rent, Staff Lunch"
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
              >
                <option value="RENT">RENT</option>
                <option value="UTILITIES">UTILITIES</option>
                <option value="SALARIES">SALARIES</option>
                <option value="MARKETING">MARKETING</option>
                <option value="SUPPLIES">SUPPLIES</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount (₦) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700"
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
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
