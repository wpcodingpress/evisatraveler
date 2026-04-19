'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, getCountryFlagEmoji } from '@/lib/utils';

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
  flag: string | null;
  visaRuleCount?: number; // Added for popular origins
}

interface Destination {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  continent: string;
  visaCount: number;
  minPrice: number;
  maxPrice: number;
  processingDays: number;
  processingTime: string;
  hasActiveVisas: boolean;
}

export default function VisaSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [processing, setProcessing] = useState('');
  const [price, setPrice] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialFrom && !!initialTo);

  // Load stored origin preference if no 'from' in URL
  useEffect(() => {
    if (!initialFrom) {
      const stored = localStorage.getItem('selected_origin');
      if (stored) {
        setFrom(stored);
      }
    }
  }, [initialFrom]);

  // Auto set hasSearched when both from and to are available
  useEffect(() => {
    if (from && to) {
      setHasSearched(true);
    }
  }, [from, to]);

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        if (data.countries && Array.isArray(data.countries)) {
          setCountries(data.countries);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (hasSearched && from && to) {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('from', from);
      params.set('to', to);
      if (region) params.set('region', region);
      if (processing) params.set('processing', processing);
      if (price) params.set('price', price);
      
      fetch(`/api/destinations?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDestinations(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [from, to, region, processing, price, hasSearched]);

  const handleOriginSelect = (code: string) => {
    setFrom(code);
    localStorage.setItem('selected_origin', code);
    if (to) {
      router.push(`/visa-search?from=${code}&to=${to}`);
    }
    setHasSearched(true);
  };

  const handleDestinationSelect = (code: string) => {
    setTo(code);
    if (from) {
      router.push(`/visa-search?from=${from}&to=${code}`);
      setHasSearched(true);
    }
  };

  const handleApplySearch = () => {
    if (from && to) {
      setHasSearched(true);
      router.push(`/visa-search?from=${from}&to=${to}`);
    }
  };

  const selectedDest = countries.find(c => c.code === to);
  const selectedOrig = countries.find(c => c.code === from);

  // Compute popular origins based on visa rule count
  const popularOrigins = countries
    .filter(c => c.visaRuleCount && c.visaRuleCount > 0)
    .sort((a, b) => (b.visaRuleCount || 0) - (a.visaRuleCount || 0))
    .slice(0, 8);

  return (
    <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Perfect Visa</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compare visa options from {countries.length}+ countries. Fast, reliable, and secure visa applications.
          </p>
        </div>

        {/* Search Panel */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Traveling From</label>
              <select 
                value={from}
                onChange={(e) => handleOriginSelect(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Select origin...</option>
                {countries.map(c => (
                  <option key={c.id} value={c.code}>{c.flag || getCountryFlagEmoji(c.code)} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Traveling To</label>
              <select 
                value={to}
                onChange={(e) => handleDestinationSelect(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Select destination...</option>
                {countries.filter(c => c.code !== from).map(c => (
                  <option key={c.id} value={c.code}>{c.flag || getCountryFlagEmoji(c.code)} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Region</label>
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">All Regions</option>
                {REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Processing Time</label>
              <select 
                value={processing}
                onChange={(e) => setProcessing(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Any Time</option>
                {PROCESSING_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Max Price</label>
              <select 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Any Price</option>
                {PRICE_RANGES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <button 
                onClick={handleApplySearch}
                disabled={!from || !to}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search Visas
              </button>
              <Link 
                href="/visa-search"
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Clear
              </Link>
            </div>
          </div>
        </div>

        {/* Popular Visa Origins */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">Popular Visa Origins</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {popularOrigins.map((origin) => (
              <button
                key={origin.code}
                onClick={() => handleOriginSelect(origin.code)}
                className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                  from === origin.code
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-slate-200 hover:border-violet-300 text-slate-700'
                }`}
              >
                <span className="mr-2">{origin.flag || getCountryFlagEmoji(origin.code)}</span>
                {origin.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && from && to && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600">Searching visas...</p>
              </div>
            ) : destinations.length > 0 ? (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <span className="text-4xl">{selectedOrig?.flag || getCountryFlagEmoji(selectedOrig?.code)}</span>
                      <p className="mt-2 font-semibold text-slate-900">{selectedOrig?.name || from}</p>
                      <p className="text-sm text-slate-500">Traveling From</p>
                    </div>
                    <div className="text-violet-600 font-bold text-2xl">→</div>
                    <div className="text-center">
                      <span className="text-4xl">{selectedDest?.flag || getCountryFlagEmoji(selectedDest?.code)}</span>
                      <p className="mt-2 font-semibold text-slate-900">{selectedDest?.name || to}</p>
                      <p className="text-sm text-slate-500">Traveling To</p>
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-slate-600">
                  Found <span className="font-semibold">{destinations.length}</span> visa options for {selectedOrig?.name} to {selectedDest?.name}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
                  {destinations.map((destination) => (
                    <Link
                      key={destination.id}
                      href={`/visa/${from.toUpperCase()}-to-${destination.code}`}
                      className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-violet-300 hover:-translate-y-1"
                    >
                       <div className="flex items-center gap-3 mb-3">
                         <span className="text-3xl leading-none">{destination.flag || getCountryFlagEmoji(destination.code)}</span>
                         <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-violet-700">
                            {destination.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">
                            {destination.region}, {destination.continent}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Processing:</span>
                          <span className="font-medium text-slate-700">{destination.processingTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Visa types:</span>
                          <span className="font-medium text-violet-600">{destination.visaCount}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-slate-500">From:</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {formatCurrency(destination.minPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <span className="block w-full py-2 bg-violet-600 text-white rounded-lg font-medium text-sm text-center group-hover:bg-violet-700 transition-colors">
                          View Visa
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No visas found</h3>
                <p className="text-slate-600 mb-4">No visa options available for this route.</p>
              </div>
            )}
          </>
        )}

        {/* SEO Content */}
        <div className="mt-16">
          {/* Why Choose Us */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fast Processing</h3>
              <p className="text-slate-600 text-sm">Get your visa approved in 24-72 hours.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">99.9% Approval Rate</h3>
              <p className="text-slate-600 text-sm">Expert team ensures your approval.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Best Prices</h3>
              <p className="text-slate-600 text-sm">Competitive pricing, no hidden fees.</p>
            </div>
          </div>

            {/* Popular Destinations */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Popular Visa Destinations</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Thailand', flag: '🇹🇭', desc: 'Beautiful beaches and rich culture' },
                  { name: 'Vietnam', flag: '🇻🇳', desc: 'Stunning landscapes and history' },
                  { name: 'UAE', flag: '🇦🇪', desc: 'Modern cities and luxury shopping' },
                  { name: 'Turkey', flag: '🇹🇷', desc: 'East meets West unique experience' },
                  { name: 'Saudi Arabia', flag: '🇸🇦', desc: 'Sacred sites and desert adventures' },
                  { name: 'China', flag: '🇨🇳', desc: 'Ancient civilization and modern marvels' },
                ].map((dest) => (
                  <div key={dest.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
                    <span className="text-4xl">{dest.flag}</span>
                    <div>
                      <h3 className="font-bold text-slate-900">{dest.name}</h3>
                      <p className="text-sm text-slate-500">{dest.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: 'How long does visa processing take?', a: 'Most visas are processed within 24-72 hours.' },
                  { q: 'What documents do I need?', a: 'Valid passport (6+ months), photos, and supporting documents.' },
                  { q: 'Is my information secure?', a: 'Yes! Bank-level encryption protects your data.' },
                  { q: 'Can I track my application?', a: 'Yes, use our tracking tool on the website.' },
                ].map((faq, i) => (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                    <p className="text-slate-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}