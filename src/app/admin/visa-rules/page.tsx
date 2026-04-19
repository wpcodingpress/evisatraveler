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

const defaultRule: Partial<VisaRule> = {
  visaType: 'Tourist Visa',
  price: 49,
  currency: 'USD',
  processingTime: '24-72 Hours',
  processingDays: 3,
  maxStayDays: 30,
  validityDays: 90,
  entryType: 'Single Entry',
  requirements: ['Valid passport (6+ months)', 'Passport-size photo'],
  documents: ['Passport copy', 'Recent photo'],
  allowedActivities: ['Tourism', 'Visiting friends/family'],
  additionalInfo: '',
  isActive: true,
};

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, countriesRes] = await Promise.all([
        fetch('/api/admin/visa-rules'),
        fetch('/api/countries')
      ]);
      const rulesData = await rulesRes.json();
      const countriesData = await countriesRes.json();
      setVisaRules(rulesData.visaRules || []);
      setCountries(countriesData.countries || []);
    } catch (err) {
      setError('Failed to load data');
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

  const handleEdit = (rule: VisaRule) => {
    setEditingRule({
      id: rule.id,
      fromCountryId: rule.fromCountryId,
      toCountryId: rule.toCountryId,
      visaType: rule.visaType,
      price: rule.price,
      currency: rule.currency,
      processingTime: rule.processingTime,
      processingDays: rule.processingDays,
      maxStayDays: rule.maxStayDays,
      validityDays: rule.validityDays,
      entryType: rule.entryType,
      requirements: rule.requirements,
      documents: rule.documents,
      allowedActivities: rule.allowedActivities,
      additionalInfo: rule.additionalInfo,
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visa rule?')) return;
    
    try {
      const res = await fetch(`/api/admin/visa-rules?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setVisaRules(visaRules.filter(r => r.id !== id));
      setSuccess('Visa rule deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete visa rule');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggle = async (id: string) => {
    const rule = visaRules.find(r => r.id === id);
    if (!rule) return;
    
    try {
      const res = await fetch('/api/admin/visa-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, isActive: !rule.isActive })
      });
      if (!res.ok) throw new Error('Failed to update');
      setVisaRules(visaRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
      setSuccess(`Visa rule ${!rule.isActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update visa rule');
      setTimeout(() => setError(''), 3000);
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
      
      const savedRule = await res.json();
      
      if (editingRule?.id) {
        setVisaRules(visaRules.map(r => r.id === savedRule.id ? savedRule : r));
        setSuccess('Visa rule updated successfully');
      } else {
        setVisaRules([savedRule, ...visaRules]);
        setSuccess('Visa rule created successfully');
      }
      
      setShowModal(false);
      setEditingRule(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save visa rule');
    } finally {
      setSaving(false);
    }
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
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Visa Rules</h1>
          <p className="text-slate-600 mt-1">Manage visa requirements, pricing, and processing times</p>
        </div>
        <button
          onClick={() => { setEditingRule(null); setShowModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Visa Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Routes</p>
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
          <p className="text-2xl font-bold text-violet-600 mt-1">
            ${visaRules.length > 0 ? Math.round(visaRules.reduce((a, r) => a + r.price, 0) / visaRules.length) : 0}
          </p>
        </div>
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

      {/* Rules Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visa Type</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Processing</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stay</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Validity</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-lg">
                        <span>{rule.fromCountry.flag}</span>
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span>{rule.toCountry.flag}</span>
                      </div>
                      <div className="hidden sm:block">
                        <p className="font-medium text-slate-900 text-sm">{rule.fromCountry.name}</p>
                        <p className="text-xs text-slate-500">to {rule.toCountry.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                      {rule.visaType}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    <div>{rule.processingTime}</div>
                    <div className="text-xs text-slate-400">{rule.processingDays} days</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{rule.maxStayDays} days</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{rule.validityDays} days</td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900">${rule.price}</span>
                    <span className="text-xs text-slate-500 ml-1">{rule.currency}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${rule.isActive ? 'left-7' : 'left-1'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
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
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingRule?.id ? 'Edit Visa Rule' : 'Add New Visa Rule'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingRule(null); }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Country Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Country (Origin)</label>
                  <select 
                    name="fromCountryId" 
                    defaultValue={editingRule?.fromCountryId || ''}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select origin...</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.flag} {c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Country (Destination)</label>
                  <select 
                    name="toCountryId" 
                    defaultValue={editingRule?.toCountryId || ''}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select destination...</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.flag} {c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visa Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visa Type</label>
                <select 
                  name="visaType" 
                  defaultValue={editingRule?.visaType || 'Tourist Visa'}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option>Tourist Visa</option>
                  <option>Business Visa</option>
                  <option>Transit Visa</option>
                  <option>Student Visa</option>
                  <option>Work Visa</option>
                </select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                  <input 
                    name="price" 
                    type="number" 
                    min="1"
                    defaultValue={editingRule?.price || 49} 
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select 
                    name="currency" 
                    defaultValue={editingRule?.currency || 'USD'}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>AUD</option>
                  </select>
                </div>
              </div>

              {/* Processing Times */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Processing Time</label>
                  <select 
                    name="processingTime" 
                    defaultValue={editingRule?.processingTime || '24-72 Hours'}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option>24 Hours</option>
                    <option>24-48 Hours</option>
                    <option>24-72 Hours</option>
                    <option>2-3 Days</option>
                    <option>3-5 Days</option>
                    <option>5-7 Days</option>
                    <option>7-14 Days</option>
                    <option>14+ Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Processing Days</label>
                  <input 
                    name="processingDays" 
                    type="number" 
                    min="1"
                    defaultValue={editingRule?.processingDays || 3} 
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Stay (Days)</label>
                  <input 
                    name="maxStayDays" 
                    type="number" 
                    min="1"
                    defaultValue={editingRule?.maxStayDays || 30} 
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Validity & Entry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Validity (Days)</label>
                  <input 
                    name="validityDays" 
                    type="number" 
                    min="1"
                    defaultValue={editingRule?.validityDays || 90} 
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entry Type</label>
                  <select 
                    name="entryType" 
                    defaultValue={editingRule?.entryType || 'Single Entry'}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option>Single Entry</option>
                    <option>Multiple Entry</option>
                    <option>Double Entry</option>
                  </select>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (comma separated)</label>
                <input 
                  name="requirements" 
                  type="text"
                  defaultValue={editingRule?.requirements?.join(', ') || 'Valid passport (6+ months), Passport-size photo'} 
                  placeholder="Enter requirements separated by commas"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Documents Needed (comma separated)</label>
                <input 
                  name="documents" 
                  type="text"
                  defaultValue={editingRule?.documents?.join(', ') || 'Passport copy, Recent photo'} 
                  placeholder="Enter documents separated by commas"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Information</label>
                <textarea 
                  name="additionalInfo" 
                  rows={3}
                  defaultValue={editingRule?.additionalInfo || ''}
                  placeholder="Any additional information..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingRule(null); }} 
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingRule?.id ? 'Update Rule' : 'Create Rule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}