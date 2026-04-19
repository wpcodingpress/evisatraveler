'use client';

import { useState, useEffect } from 'react';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  continent: string;
  visaRulesTo: number;
  visaRulesFrom: number;
}

const REGIONS = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania', 'Middle East'];
const CONTINENTS = ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'];

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Partial<Country> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, [search, regionFilter]);

  const fetchCountries = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (regionFilter) params.set('region', regionFilter);
      params.set('limit', '300');
      
      const res = await fetch(`/api/admin/countries?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCountries(data.countries || []);
    } catch (err) {
      setError('Failed to load countries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const form = e.currentTarget;
    const countryData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      code: (form.elements.namedItem('code') as HTMLInputElement).value.toUpperCase(),
      flag: (form.elements.namedItem('flag') as HTMLInputElement).value,
      region: (form.elements.namedItem('region') as HTMLSelectElement).value,
      continent: (form.elements.namedItem('continent') as HTMLSelectElement).value,
    };

    try {
      const res = await fetch('/api/admin/countries', {
        method: editingCountry ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCountry ? { ...countryData, id: editingCountry.id } : countryData),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      
      setShowModal(false);
      setEditingCountry(null);
      fetchCountries();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry({
      id: country.id,
      name: country.name,
      code: country.code,
      flag: country.flag,
      region: country.region,
      continent: country.continent,
    });
    setShowModal(true);
  };

  const filteredCountries = countries;

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Countries</h1>
          <p className="text-slate-600 mt-1">Manage destination countries and visa routes</p>
        </div>
        <button
          onClick={() => { setEditingCountry(null); setShowModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Country
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Countries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{countries.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Asia</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">{countries.filter(c => c.region === 'Asia').length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Europe</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{countries.filter(c => c.region === 'Europe').length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Americas</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{countries.filter(c => c.region === 'Americas').length}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Countries Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Continent</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visa Routes (To)</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Visa Routes (From)</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCountries.map((country) => (
                <tr key={country.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag || '🌍'}</span>
                      <span className="font-medium text-slate-900">{country.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                      {country.code}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      country.region === 'Asia' ? 'bg-violet-100 text-violet-700' :
                      country.region === 'Europe' ? 'bg-emerald-100 text-emerald-700' :
                      country.region === 'Americas' ? 'bg-amber-100 text-amber-700' :
                      country.region === 'Africa' ? 'bg-orange-100 text-orange-700' :
                      country.region === 'Oceania' ? 'bg-blue-100 text-blue-700' :
                      country.region === 'Middle East' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {country.region || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{country.continent || 'Unknown'}</td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-violet-600">{country.visaRulesTo || 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-medium text-emerald-600">{country.visaRulesFrom || 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(country)}
                        className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCountries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No countries found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCountry?.id ? 'Edit Country' : 'Add New Country'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingCountry(null); }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country Name</label>
                <input 
                  name="name" 
                  defaultValue={editingCountry?.name || ''}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country Code (2 letters)</label>
                  <input 
                    name="code" 
                    defaultValue={editingCountry?.code || ''}
                    maxLength={2}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Flag Emoji</label>
                  <input 
                    name="flag" 
                    defaultValue={editingCountry?.flag || ''}
                    placeholder="🇵🇰"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                  <select 
                    name="region" 
                    defaultValue={editingCountry?.region || ''}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select region...</option>
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Continent</label>
                  <select 
                    name="continent" 
                    defaultValue={editingCountry?.continent || ''}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Select continent...</option>
                    {CONTINENTS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingCountry(null); }} 
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (editingCountry?.id ? 'Update' : 'Add')} Country
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}