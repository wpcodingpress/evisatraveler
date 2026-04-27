'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

interface Destination {
  id: string;
  name: string;
  code: string;
  visaType: string;
  visaCount: number;
  price: number;
  currency: string;
  processingTime: string;
  processingDays: number;
  maxStayDays: number;
  validityDays: number;
  entryType: string;
}

function shimmerCards() {
  return [...Array(8)].map((_, i) => (
    <div key={i} className="relative overflow-hidden rounded-2xl h-72 bg-white border border-slate-200 shadow-md animate-pulse">
      <div className="h-full p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-8 bg-slate-200 rounded"></div>
          <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
        </div>
        <div className="flex-1">
          <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="mt-auto">
          <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
          <div className="h-10 w-full bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  ));
}

export default function VisaPage() {
  const searchParams = useSearchParams();
  const { formatPrice, selectedCurrency } = useCurrency();
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const currentPage = page;
  const itemsPerPage = 24;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchDestinations();
  }, [search, page]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      
      const res = await fetch(`/api/visa/destinations?${params}`);
      const data = await res.json();
      
      let processedDestinations: Destination[] = [];
      
      if (Array.isArray(data)) {
        processedDestinations = data
          .map((country: any) => ({
            id: country.id,
            name: country.name,
            code: country.code,
            visaType: country.visaType || 'Tourist',
            visaCount: country.visaCount || 1,
            price: country.price || 49,
            currency: country.currency || 'USD',
            processingTime: country.processingTime || '24-72 Hours',
            processingDays: country.processingDays || 3,
            maxStayDays: country.maxStayDays || 30,
            validityDays: country.validityDays || 90,
            entryType: country.entryType || 'Single Entry'
          }))
          .sort((a: Destination, b: Destination) => a.price - b.price);
      }
      
      setTotalItems(processedDestinations.length);
      const startIndex = (currentPage - 1) * itemsPerPage;
      setDestinations(processedDestinations.slice(startIndex, startIndex + itemsPerPage));
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    window.location.href = `/visa${params.toString() ? '?' + params.toString() : ''}`;
  };

  const buildQuery = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', String(pageNum));
    if (search) params.set('search', search);
    return `?${params.toString()}`;
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-violet-50/30 via-white to-purple-50/30">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">Destinations</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose your next travel destination. Fast, reliable visa applications.
          </p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Link href="/visa-search" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/40 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Visas
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-10">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search destinations by name..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value.length >= 2) {
                  handleSearch();
                } else if (e.target.value.length === 0) {
                  handleSearch();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-md"
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shimmerCards()}
          </div>
        ) : destinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {destinations.map((destination, index) => (
                <Link
                  key={destination.id}
                  href={`/visa-search?to=${destination.code}`}
                  className="group relative overflow-hidden rounded-2xl h-72 bg-white border border-slate-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30"></div>
                  
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
                        {destination.visaType}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                        {destination.name}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">Visa Required</p>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {destination.processingTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {destination.maxStayDays}d
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-slate-500 text-xs">Starting from</p>
                          <p className="text-2xl font-bold text-slate-900">{formatPrice(destination.price)}</p>
                        </div>
                        <span className="px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-lg flex items-center gap-2 group-hover:bg-violet-700 transition-all duration-300">
                          Apply
                          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link href={buildQuery(currentPage - 1)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 text-sm font-medium transition-all">
                    ← Previous
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <Link key={pageNum} href={buildQuery(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                          pageNum === currentPage 
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30' 
                            : 'border border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={buildQuery(currentPage + 1)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 text-sm font-medium transition-all">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No destinations found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search criteria</p>
            <Link href="/visa" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Clear search
            </Link>
          </div>
        )}
      </div>

{/* PromoBranding Section */}
      <section className="py-20 lg:py-32 pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400">
                eVisa Traveler
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Experience the future of visa applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { num: '01', title: 'Apply in Minutes', desc: 'Complete your entire visa application in just 5 minutes from anywhere' },
              { num: '02', title: 'Zero Errors', desc: 'Our smart validation ensures your application is error-free' },
              { num: '03', title: 'Instant Updates', desc: 'Get real-time notifications on your visa status via SMS & email' },
              { num: '04', title: 'PDF Delivered', desc: 'Your approved visa PDF sent directly to your inbox' },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-500">
                <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent opacity-50 mb-4">
                  {feature.num}
                </div>
                <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                    {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17l5 5-5 5m0-5l-5 5-5-5m5 0V7" />}
                    {i === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white font-medium">98% Success Rate</span>
              </div>
              <div className="w-px h-5 bg-white/20" />
              <div className="text-slate-300">Trusted by 50,000+ Travelers</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl mx-auto">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {[
                { q: 'How long does visa processing take?', a: 'Processing times vary by destination. Most tourist visas are processed within 3-5 business days.' },
                { q: 'What documents do I need?', a: 'Typically, you\'ll need a valid passport, recent passport-sized photo, and travel itinerary.' },
                { q: 'Is my information secure?', a: 'Yes! We use 256-bit SSL encryption to protect your personal data.' },
                { q: 'Can I get a refund if my visa is denied?', a: 'Our refund policy varies. Contact our support team for specific situations.' },
                { q: 'How will I receive my visa?', a: 'Approved visas are sent to your email as a PDF document.' },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <button
                    className="w-full flex items-center justify-between p-5 lg:p-6 text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                    <svg className="w-5 h-5 text-violet-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/faq" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105">
                View All FAQs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}