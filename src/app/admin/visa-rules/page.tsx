'use client';

import { useState, useEffect } from 'react';

interface VisaRule {
  id: string;
  fromCountryId: string;
  toCountryId: string;
  fromCountry: { name: string; code: string; flag: string };
  toCountry: { name: string; code: string; flag: string };
  visaType: string;
  price: number;
  currency: string;
  processingTime: string;
  processingDays: number;
  maxStayDays: number;
  validityDays: number;
  entryType: string;
  requirements: string[];
  documents: string[];
  allowedActivities: string[];
  additionalInfo: string;
  isActive: boolean;
  createdAt: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export default function VisaRulesPage() {
  const [visaRules, setVisaRules] = useState<VisaRule[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<VisaRule> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, avgPrice: 0 });

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch visa rules
      const [rulesRes, countriesRes] = await Promise.all([
        fetch('/api/admin/visa-rules'),
        fetch('/api/countries')
      ]);
      
      const rulesData = await rulesRes.json();
      const countriesData = await countriesRes.json();
      
      let rules = rulesData.visaRules || [];
      
      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        rules = rules.filter((r: VisaRule) => 
          r.fromCountry.name.toLowerCase().includes(searchLower) ||
          r.toCountry.name.toLowerCase().includes(searchLower) ||
          r.visaType.toLowerCase().includes(searchLower)
        );
      }
      
      // Calculate stats
      const active = rules.filter((r: VisaRule) => r.isActive).length;
      const totalPrice = rules.reduce((sum: number, r: VisaRule) => sum + r.price, 0);
      
      setStats({
        total: rules.length,
        active,
        inactive: rules.length - active,
        avgPrice: rules.length > 0 ? Math.round(totalPrice / rules.length) : 0
      });
      
      setVisaRules(rules);
      setCountries(countriesData.countries || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const ruleData = {
      id: editingRule?.id || undefined,
      fromCountryId: formData.get('fromCountryId') as string,
      toCountryId: formData.get('toCountryId') as string,
      visaType: formData.get('visaType') as string,
      price: parseFloat(formData.get('price') as string),
      currency: formData.get('currency') as string,
      processingTime: formData.get('processingTime') as string,
      processingDays: parseInt(formData.get('processingDays') as string),
      maxStayDays: parseInt(formData.get('maxStayDays') as string),
      validityDays: parseInt(formData.get('validityDays') as string),
      entryType: formData.get('entryType') as string,
      requirements: (formData.get('requirements') as string).split(',').map(r => r.trim()).filter(Boolean),
      documents: (formData.get('documents') as string).split(',').map(d => d.trim()).filter(Boolean),
      allowedActivities: (formData.get('allowedActivities') as string).split(',').map(a => a.trim()).filter(Boolean),
      additionalInfo: formData.get('additionalInfo') as string,
      isActive: true,
    };

    try {
      const method = editingRule?.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/visa-rules', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }
      
      setSuccess(editingRule?.id ? 'Visa rule updated!' : 'Visa rule created!');
      setShowModal(false);
      setEditingRule(null);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save visa rule');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rule: VisaRule) => {
    setEditingRule(rule);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visa rule?')) return;
    
    try {
      const res = await fetch(`/api/admin/visa-rules?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSuccess('Visa rule deleted!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleToggle = async (id: string) => {
    const rule = visaRules.find(r => r.id === id);
    if (!rule) return;
    
    try {
      await fetch('/api/admin/visa-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !rule.isActive })
      });
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  // Pagination
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(visaRules.length / itemsPerPage);
  const paginatedRules = visaRules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {success && <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl">{success}</div>}
      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">{error}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Visa Rules</h1>
          <p className="text-slate-600 mt-1">Manage visa requirements, pricing, and processing times</p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Visa Rule
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Routes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Avg Price</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">${stats.avgPrice}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Search by country or visa type..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Route</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Visa Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Processing</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Stay</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Validity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{rule.fromCountry.flag}</span>
                      <span>→</span>
                      <span>{rule.toCountry.flag}</span>
                      <span className="text-sm text-slate-600 hidden lg:inline">({rule.fromCountry.code} → {rule.toCountry.code})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{rule.visaType}</td>
                  <td className="px-4 py-3 text-sm">{rule.processingTime}</td>
                  <td className="px-4 py-3 text-sm">{rule.maxStayDays}d</td>
                  <td className="px-4 py-3 text-sm">{rule.validityDays}d</td>
                  <td className="px-4 py-3 font-medium">${rule.price}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(rule.id)} className={`w-10 h-5 rounded-full transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${rule.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(rule)} className="text-violet-600 hover:text-violet-800 text-sm mr-3">Edit</button>
                    <button onClick={() => handleDelete(rule.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">Showing {((currentPage-1)*itemsPerPage)+1}-{Math.min(currentPage*itemsPerPage, stats.total)} of {stats.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage===1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingRule?.id ? 'Edit Visa Rule' : 'Add Visa Rule'}</h2>
              <button onClick={() => { setShowModal(false); setEditingRule(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From Country</label>
                  <select name="fromCountryId" defaultValue={editingRule?.fromCountryId || ''} required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Select...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To Country</label>
                  <select name="toCountryId" defaultValue={editingRule?.toCountryId || ''} required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Select...</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Visa Type</label>
                  <select name="visaType" defaultValue={editingRule?.visaType || 'Tourist Visa'} className="w-full px-3 py-2 border rounded-lg">
                    <option>Tourist Visa</option><option>Business Visa</option><option>Transit Visa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input name="price" type="number" defaultValue={editingRule?.price || 49} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Processing Time</label>
                  <select name="processingTime" defaultValue={editingRule?.processingTime || '24-72 Hours'} className="w-full px-3 py-2 border rounded-lg">
                    <option>24 Hours</option><option>24-72 Hours</option><option>3-5 Days</option><option>5-7 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Processing Days</label>
                  <input name="processingDays" type="number" defaultValue={editingRule?.processingDays || 3} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Stay (Days)</label>
                  <input name="maxStayDays" type="number" defaultValue={editingRule?.maxStayDays || 30} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Validity (Days)</label>
                  <input name="validityDays" type="number" defaultValue={editingRule?.validityDays || 90} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Entry Type</label>
                  <select name="entryType" defaultValue={editingRule?.entryType || 'Single Entry'} className="w-full px-3 py-2 border rounded-lg">
                    <option>Single Entry</option><option>Multiple Entry</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Requirements (comma-separated)</label>
                <input name="requirements" defaultValue={editingRule?.requirements?.join(', ') || 'Valid passport, Photo'} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingRule(null); }} className="flex-1 px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-xl disabled:opacity-50">
                  {saving ? 'Saving...' : (editingRule?.id ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}