'use client';

import { useState, useEffect } from 'react';

interface VisaRule {
  id: string;
  fromCountry: { name: string; code: string; flag: string };
  toCountry: { name: string; code: string; flag: string };
  visaType: string;
  price: number;
  processingDays: number;
  maxStayDays: number;
  isActive: boolean;
}

export default function VisaRulesPage() {
  const [visaRules, setVisaRules] = useState<VisaRule[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<VisaRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVisaRules();
  }, []);

  const fetchVisaRules = async () => {
    try {
      const response = await fetch('/api/admin/visa-rules');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setVisaRules(data.visaRules || []);
    } catch (err) {
      setError('Failed to load visa rules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = visaRules.filter(r =>
    r.fromCountry.name.toLowerCase().includes(search.toLowerCase()) ||
    r.toCountry.name.toLowerCase().includes(search.toLowerCase()) ||
    r.visaType.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this visa rule?')) {
      setVisaRules(visaRules.filter(r => r.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setVisaRules(visaRules.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const handleSave = (rule: VisaRule) => {
    if (editingRule) {
      setVisaRules(visaRules.map(r => r.id === rule.id ? rule : r));
    } else {
      setVisaRules([...visaRules, { ...rule, id: String(Date.now()) }]);
    }
    setShowModal(false);
    setEditingRule(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-14 bg-slate-200 rounded-xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Visa Rules</h1>
          <p className="text-slate-600 mt-1">Manage visa requirements and pricing</p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Visa Rule
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by country or visa type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Rules</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{visaRules.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{visaRules.filter(r => r.isActive).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{visaRules.filter(r => !r.isActive).length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Avg Price</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">${Math.round(visaRules.reduce((a, r) => a + r.price, 0) / visaRules.length)}</p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visa Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Processing</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Stay</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{rule.fromCountry.code}</span>
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="text-2xl">{rule.toCountry.code}</span>
                      <div className="hidden sm:block ml-2">
                        <p className="font-medium text-slate-900">{rule.fromCountry}</p>
                        <p className="text-sm text-slate-500">to {rule.toCountry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                      {rule.visaType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{rule.processingDays} days</td>
                  <td className="px-6 py-4 text-slate-600">{rule.maxStayDays} days</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">${rule.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${rule.isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingRule(rule); setShowModal(true); }}
                        className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRules.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500">No visa rules found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingRule ? 'Edit Visa Rule' : 'Add Visa Rule'}</h2>
              <button onClick={() => { setShowModal(false); setEditingRule(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              handleSave({
                id: editingRule?.id || String(Date.now()),
                fromCountry: {
                  name: (form.elements.namedItem('fromCountry') as HTMLInputElement).value,
                  code: (form.elements.namedItem('fromCode') as HTMLInputElement).value.toUpperCase(),
                  flag: '🌍'
                },
                toCountry: {
                  name: (form.elements.namedItem('toCountry') as HTMLInputElement).value,
                  code: (form.elements.namedItem('toCode') as HTMLInputElement).value.toUpperCase(),
                  flag: '🌍'
                },
                visaType: (form.elements.namedItem('visaType') as HTMLInputElement).value,
                price: parseInt((form.elements.namedItem('price') as HTMLInputElement).value),
                processingDays: parseInt((form.elements.namedItem('processingDays') as HTMLInputElement).value),
                maxStayDays: parseInt((form.elements.namedItem('maxStayDays') as HTMLInputElement).value),
                isActive: true,
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Country</label>
                  <input name="fromCountry" defaultValue={editingRule?.fromCountry || ''} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Code</label>
                  <input name="fromCode" defaultValue={editingRule?.fromCode || ''} maxLength={2} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Country</label>
                  <input name="toCountry" defaultValue={editingRule?.toCountry || ''} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Code</label>
                  <input name="toCode" defaultValue={editingRule?.toCode || ''} maxLength={2} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visa Type</label>
                <select name="visaType" defaultValue={editingRule?.visaType || 'Tourist Visa'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option>Tourist Visa</option>
                  <option>Business Visa</option>
                  <option>Transit Visa</option>
                  <option>Student Visa</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input name="price" type="number" defaultValue={editingRule?.price || 49} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Processing Days</label>
                  <input name="processingDays" type="number" defaultValue={editingRule?.processingDays || 3} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Stay</label>
                  <input name="maxStayDays" type="number" defaultValue={editingRule?.maxStayDays || 30} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingRule(null); }} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all">
                  {editingRule ? 'Update' : 'Add'} Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
