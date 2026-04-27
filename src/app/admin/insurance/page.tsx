'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface Insurance {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  coverage: string;
  duration: string;
  benefits: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminInsurancePage() {
  const { formatPrice } = useCurrency();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Insurance | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    coverage: '',
    duration: '',
    benefits: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchInsurances();
  }, []);

  const fetchInsurances = async () => {
    try {
      const res = await fetch('/api/admin/insurance');
      const data = await res.json();
      setInsurances(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch('/api/admin/insurance', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editing.id }),
        });
      } else {
        await fetch('/api/admin/insurance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: formData,
        });
      }
      setShowModal(false);
      fetchInsurances();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this insurance?')) return;
    try {
      await fetch(`/api/admin/insurance?id=${id}`, { method: 'DELETE' });
      fetchInsurances();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openEdit = (insurance: Insurance) => {
    setEditing(insurance);
    setFormData({
      name: insurance.name,
      description: insurance.description,
      price: String(insurance.price),
      coverage: insurance.coverage,
      duration: insurance.duration,
      benefits: insurance.benefits,
      isActive: insurance.isActive,
      sortOrder: insurance.sortOrder,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      coverage: '',
      duration: '',
      benefits: '',
      isActive: true,
      sortOrder: insurances.length + 1,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Insurance Packages</h1>
          <p className="text-slate-600">Manage travel insurance plans</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          Add Insurance
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Coverage</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Price</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Order</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insurances.map((insurance) => (
                <tr key={insurance.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900">{insurance.name}</p>
                    <p className="text-sm text-slate-500">{insurance.description}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{insurance.coverage}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{formatPrice(insurance.price)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${insurance.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {insurance.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{insurance.sortOrder}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(insurance)} className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(insurance.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H6a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editing ? 'Edit Insurance' : 'Add Insurance'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Coverage</label>
                  <input type="text" required value={formData.coverage} onChange={(e) => setFormData({ ...formData, coverage: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="$25,000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input type="text" required value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="Per Trip" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                  <input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-4 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Benefits (one per line)</label>
                <textarea required value={formData.benefits} onChange={(e) => setFormData({ ...formData, benefits: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-2" rows={3} placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm text-slate-700">Active</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}