'use client';

import Link from 'next/link';

const REGIONS = ['Asia', 'Europe', 'Americas', 'Africa', 'Oceania', 'Middle East'];
const PROCESSING_OPTIONS = [
  { value: '1', label: '24 Hours' },
  { value: '3', label: '1-3 Days' },
  { value: '7', label: '5-7 Days' },
  { value: '14', label: '14+ Days' },
];
const PRICE_RANGES = [
  { value: '50', label: 'Under $50' },
  { value: '100', label: 'Under $100' },
  { value: '150', label: 'Under $150' },
  { value: '200', label: 'Under $200' },
];

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface VisaFilterFormProps {
  allCountries: Country[];
  from: string;
  search: string;
  region: string;
  processing: string;
  price: string;
}

export default function VisaFilterForm({ 
  allCountries, 
  from, 
  search, 
  region, 
  processing, 
  price 
}: VisaFilterFormProps) {
  return (
    <form className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Traveling From (Select your country)</label>
          <select 
            id="originSelect"
            name="from" 
            defaultValue={from}
            onChange={(e) => {
              const form = e.target.closest('form');
              if (form) {
                form.submit();
              }
            }}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          >
            <option value="">Select your country...</option>
            {allCountries.map(c => (
              <option key={c.id} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">Search Destination</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="search"
              placeholder="Search country..."
              defaultValue={search}
              className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Region</label>
          <select 
            name="region" 
            defaultValue={region}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Processing Time</label>
          <select 
            name="processing" 
            defaultValue={processing}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          >
            <option value="">Any Time</option>
            {PROCESSING_OPTIONS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Max Price</label>
          <select 
            name="price" 
            defaultValue={price}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          >
            <option value="">Any Price</option>
            {PRICE_RANGES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button 
            type="submit"
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all text-sm"
          >
            Apply Filters
          </button>
          <Link 
            href="/visa"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}