import { Metadata } from 'next';
import VisaSearchContent from './visa-search-content';

export const metadata: Metadata = {
  title: 'Search Visa | Find Your Perfect Travel Visa - eVisaTraveler',
  description: 'Search and compare visa options from 200+ countries. Fast processing, 99.9% approval rate, and competitive prices. Find your perfect visa today.',
  keywords: ['visa search', 'find visa', 'travel visa', 'e-visa', 'tourist visa', 'business visa', 'visa comparison'],
  openGraph: {
    title: 'Search Visa | Find Your Perfect Travel Visa',
    description: 'Search and compare visa options from 200+ countries. Fast processing, 99.9% approval rate.',
  },
};

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

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

function VisaSearchContent() {
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
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(!!initialFrom || !!initialTo);

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCountries(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (showResults) {
      setLoading(true);
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (search) params.set('search', search);
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
  }, [from, to, search, region, processing, price, showResults]);

  const handleApply = () => {
    setShowResults(true);
  };

  const handleOriginChange = (newFrom: string) => {
    setFrom(newFrom);
    if (newFrom && to) {
      router.push(`/visa-search?from=${newFrom}&to=${to}`);
    } else if (newFrom) {
      router.push(`/visa-search?from=${newFrom}`);
    }
  };

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
            {/* Origin Country */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Traveling From</label>
              <select 
                value={from}
                onChange={(e) => handleOriginChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Select origin...</option>
                {countries.map(c => (
                  <option key={c.id} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Destination Country */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Traveling To</label>
              <select 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              >
                <option value="">Select destination...</option>
                {countries.filter(c => c.code !== from).map(c => (
                  <option key={c.id} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
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

            {/* Processing Time */}
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
            {/* Price Range */}
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

            {/* Search */}
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

            {/* Buttons */}
            <div className="flex items-end gap-2">
              <button 
                onClick={handleApply}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all text-sm"
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

        {/* Results or Empty State */}
        {showResults && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-600">Searching visas...</p>
              </div>
            ) : destinations.length > 0 ? (
              <>
                <p className="mb-4 text-slate-600">
                  Found <span className="font-semibold">{destinations.length}</span> visa options
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
                  {destinations.map((destination) => (
                    <Link
                      key={destination.id}
                      href={from && destination.hasActiveVisas ? `/visa/${from.toUpperCase()}-to-${destination.code}` : '#'}
                      className={`group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border ${
                        destination.hasActiveVisas && from
                          ? 'border-slate-200 hover:border-violet-300 hover:-translate-y-1' 
                          : 'border-slate-100 opacity-75 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl leading-none">{destination.flag}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-violet-700">
                            {destination.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">
                            {destination.region}, {destination.continent}
                          </p>
                        </div>
                      </div>

                      {destination.hasActiveVisas ? (
                        <>
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
                        </>
                      ) : (
                        <div className="mt-2 pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                            <span>Coming Soon</span>
                          </div>
                        </div>
                      )}
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
                <p className="text-slate-600 mb-4">Try selecting different filters.</p>
              </div>
            )}
          </>
        )}

        {/* SEO Content Section - Only show when no results */}
        {!showResults && (
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
                <p className="text-slate-600 text-sm">Get your visa approved in 24-72 hours with our expedited service.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">99.9% Approval Rate</h3>
                <p className="text-slate-600 text-sm">Our expert team ensures your application is approved.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Best Prices</h3>
                <p className="text-slate-600 text-sm">Competitive pricing with no hidden fees.</p>
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
                  { q: 'How long does visa processing take?', a: 'Most visas are processed within 24-72 hours. Processing time may vary based on the destination country and type of visa.' },
                  { q: 'What documents do I need?', a: 'Typically, you need a valid passport (6+ months validity), recent passport-size photos, and supporting documents based on the visa type.' },
                  { q: 'Is my information secure?', a: 'Yes! We use bank-level encryption to protect your personal information and never share your data with third parties.' },
                  { q: 'Can I track my application?', a: 'Yes, you can track your visa application status using our tracking tool on the website.' },
                ].map((faq, i) => (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                    <p className="text-slate-600 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VisaSearchPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 py-12 bg-gradient-to-b from-violet-50/30 to-white">
        <div className="container-custom text-center">
          <div className="inline-block w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </main>
    }>
      <VisaSearchContent />
    </Suspense>
  );
}