'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, getCountryFlagEmoji } from '@/lib/utils';

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string | null;
}

interface VisaRule {
  id: string;
  visaType: string;
  processingTime: string;
  processingDays: number;
  price: number;
  currency: string;
  maxStayDays: number;
  validityDays: number;
  entryType: string;
  requirements: string[];
  documents: string[];
  fromCountry: { name: string; code: string; flag: string };
  toCountry: { name: string; code: string; flag: string };
}

export default function VisaSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [countries, setCountries] = useState<Country[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedVisa, setSelectedVisa] = useState<VisaRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVisa, setLoadingVisa] = useState(false);

  useEffect(() => {
    if (!initialFrom) {
      const stored = localStorage.getItem('selected_origin');
      if (stored) {
        setFrom(stored);
      }
    }
  }, [initialFrom]);

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
    if (from && !to) {
      setLoading(true);
      fetch(`/api/destinations?from=${from}`)
        .then(res => res.json())
        .then(data => {
          if (data.destinations && Array.isArray(data.destinations)) {
            setDestinations(data.destinations);
          } else if (Array.isArray(data)) {
            setDestinations(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setDestinations([]);
    }
  }, [from, to]);

  useEffect(() => {
    if (from && to) {
      setLoadingVisa(true);
      fetch(`/api/visa?from=${from}&to=${to}`)
        .then(res => res.json())
        .then(data => {
          const rules = data?.rules || [];
          if (rules.length > 0) {
            const visa = rules[0];
            setSelectedVisa({
              id: visa.id,
              visaType: visa.visaType,
              processingTime: visa.processingTime,
              processingDays: visa.processingDays,
              price: Number(visa.price),
              currency: visa.currency,
              maxStayDays: visa.maxStayDays,
              validityDays: visa.validityDays,
              entryType: visa.entryType || 'Single Entry',
              requirements: ['Valid passport (6+ months validity)', 'Recent passport-size photos'],
              documents: ['Passport copy', 'Recent photo'],
              fromCountry: {
                name: visa.fromCountry?.name,
                code: visa.fromCountry?.code,
                flag: visa.fromCountry?.flag
              },
              toCountry: {
                name: visa.toCountry?.name,
                code: visa.toCountry?.code,
                flag: visa.toCountry?.flag
              }
            });
          } else {
            setSelectedVisa(null);
          }
          setLoadingVisa(false);
        })
        .catch(() => {
          setSelectedVisa(null);
          setLoadingVisa(false);
        });
    } else {
      setSelectedVisa(null);
    }
  }, [from, to]);

  const handleOriginSelect = (code: string) => {
    setFrom(code);
    setTo('');
    setSelectedVisa(null);
    localStorage.setItem('selected_origin', code);
    router.push(`/visa-search?from=${code}`);
  };

  const handleDestinationSelect = (code: string) => {
    setTo(code);
    if (from) {
      router.push(`/visa-search?from=${from}&to=${code}`);
    }
  };

  const handleApplySearch = () => {
    if (from && to) {
      router.push(`/visa-search?from=${from}&to=${to}`);
    }
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setDestinations([]);
    setSelectedVisa(null);
    router.push('/visa-search');
  };

  const selectedOrig = countries.find(c => c.code === from);
  const selectedDest = countries.find(c => c.code === to);

  const showDestinationsList = from && !to && destinations.length > 0;
  const showVisaDetails = from && to;

  return (
    <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Perfect Visa</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Compare visa options from {countries.length}+ countries. Fast, reliable, and secure visa applications.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Traveling From</label>
              <div className="flex items-center gap-2">
                {from && (
                  <img 
                    src={`https://flagcdn.com/w24/${from.toLowerCase()}.png`}
                    alt=""
                    className="w-6 h-4 object-cover rounded"
                  />
                )}
                <select 
                  value={from}
                  onChange={(e) => handleOriginSelect(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="">Select origin...</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Traveling To</label>
              <div className="flex items-center gap-2">
                {to && (
                  <img 
                    src={`https://flagcdn.com/w24/${to.toLowerCase()}.png`}
                    alt=""
                    className="w-6 h-4 object-cover rounded"
                  />
                )}
                <select 
                  value={to}
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                >
                  <option value="">Select destination...</option>
                  {countries.filter(c => c.code !== from).map(c => (
                    <option key={c.id} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleApplySearch}
                disabled={!from || !to}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search Visas
              </button>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleClear}
                className="w-full px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 text-center">Popular Visa Origins</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {countries.slice(0, 12).map((origin) => (
              <button
                key={origin.id}
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

        {loading || loadingVisa ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        ) : showDestinationsList ? (
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
                  <span className="text-2xl">🌍</span>
                  <p className="mt-2 font-semibold text-slate-900">Any Destination</p>
                  <p className="text-sm text-slate-500">Traveling To</p>
                </div>
              </div>
            </div>

            <p className="mb-4 text-slate-600">
              Showing <span className="font-semibold">{destinations.length}</span> visa options from {selectedOrig?.name}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {destinations.map((destination) => (
                <Link
                  key={destination.id}
                  href={`/visa/${from.toUpperCase()}-to-${destination.code}`}
                  className="group relative overflow-hidden rounded-2xl h-72 bg-white border border-slate-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative h-full p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <img 
                        src={`https://flagcdn.com/w80/${destination.code.toLowerCase()}.png`}
                        alt={destination.name}
                        className="w-12 h-8 object-cover rounded shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                        Tourist
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-violet-700">
                        {destination.name}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">Visa Required</p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-xs">From</p>
                          <p className="text-2xl font-bold text-slate-900">{formatCurrency(destination.minPrice)}</p>
                        </div>
                        <span className="px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-lg flex items-center gap-2 group-hover:bg-violet-700 transition-all">
                          View
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : showVisaDetails ? (
          selectedVisa ? (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-violet-600">Home</Link>
                    <span>/</span>
                    <Link href="/visa-search" className="hover:text-violet-600">Visa Search</Link>
                    <span>/</span>
                    <span className="text-slate-900">{selectedVisa.toCountry?.name}</span>
                  </div>
                  <div className="flex items-center gap-6 mb-6">
                    <span className="text-7xl">{selectedVisa.toCountry?.flag || getCountryFlagEmoji(selectedVisa.toCountry?.code)}</span>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{selectedVisa.visaType}</h1>
                      <p className="text-xl text-slate-600">{selectedVisa.fromCountry?.name} → {selectedVisa.toCountry?.name}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Processing Time</p>
                        <p className="font-bold text-slate-900">{selectedVisa.processingTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Max Stay</p>
                        <p className="font-bold text-slate-900">{selectedVisa.maxStayDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Validity</p>
                        <p className="font-bold text-slate-900">{selectedVisa.validityDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-fuchsia-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Entry Type</p>
                        <p className="font-bold text-slate-900">{selectedVisa.entryType || 'Single Entry'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Requirements</h2>
                  <ul className="space-y-4">
                    {['Valid passport (6+ months validity)', 'Recent passport-size photos'].map((req, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-slate-700 text-lg">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Required Documents</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {['Passport copy', 'Recent photo'].map((doc, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-slate-700 font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
                      <h3 className="text-xl font-bold mb-1">{selectedVisa.visaType}</h3>
                      <p className="text-violet-100 text-sm">{selectedVisa.toCountry?.name} • {selectedVisa.fromCountry?.name}</p>
                    </div>
                    <div className="p-6">
                      <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">Visa Fee × 1</span>
                          <span className="font-semibold text-slate-900">${selectedVisa.price}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600">Service Fee</span>
                          <span className="font-semibold text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-900">Total</span>
                          <span className="text-2xl font-bold text-violet-600">${selectedVisa.price}</span>
                        </div>
                      </div>

                      <Link href={`/apply/${selectedVisa.id}`} className="block w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl text-center">
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No visa found</h3>
              <p className="text-slate-600 mb-4">No visa options available for {selectedOrig?.name} to {selectedDest?.name}.</p>
              <button 
                onClick={handleClear}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Try Another Route
              </button>
            </div>
          )
        ) : null}

        <div className="mt-16">
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
