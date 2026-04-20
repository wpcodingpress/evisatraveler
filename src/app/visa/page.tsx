'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCountryFlagEmoji, formatCurrency } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  code: string;
  flag: string;
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

function getProcessingTimeLabel(days: number): string {
  if (days <= 1) return '24 Hours';
  if (days <= 3) return '1-3 Days';
  if (days <= 7) return '5-7 Days';
  return `${days}+ Days`;
}

const countryImages: Record<string, string> = {
  TH: 'from-yellow-400 via-orange-400 to-red-500',
  JP: 'from-red-400 via-rose-500 to-pink-600',
  AE: 'from-blue-400 via-cyan-400 to-teal-500',
  US: 'from-blue-500 via-indigo-500 to-violet-600',
  GB: 'from-red-500 via-blue-600 to-indigo-700',
  IN: 'from-orange-400 via-yellow-400 to-amber-500',
  CN: 'from-red-600 via-yellow-500 to-orange-400',
  AU: 'from-yellow-500 via-green-400 to-emerald-500',
  SG: 'from-red-500 via-yellow-400 to-green-500',
  MY: 'from-blue-500 via-sky-400 to-cyan-400',
  ID: 'from-red-500 via-orange-400 to-yellow-400',
  PH: 'from-blue-400 via-sky-300 to-emerald-400',
  VN: 'from-red-600 via-yellow-500 to-amber-400',
  KR: 'from-blue-500 via-red-400 to-pink-500',
  TR: 'from-red-500 via-white to-red-500',
  EG: 'from-yellow-500 via-amber-400 to-orange-500',
  ZA: 'from-green-500 via-yellow-500 to-emerald-500',
  RU: 'from-blue-500 via-red-500 to-pink-500',
  BR: 'from-green-500 via-yellow-400 to-blue-500',
  MX: 'from-green-500 via-emerald-400 to-teal-500',
  CA: 'from-red-500 via-white to-red-500',
  IT: 'from-green-500 via-emerald-400 to-teal-500',
  ES: 'from-yellow-500 via-orange-500 to-red-500',
  FR: 'from-blue-500 via-white to-red-500',
  DE: 'from-yellow-500 via-black to-yellow-500',
  NL: 'from-orange-400 via-red-500 to-red-600',
  SE: 'from-blue-500 via-yellow-400 to-blue-600',
  NO: 'from-red-500 via-blue-500 to-red-600',
  DK: 'from-red-500 via-white to-red-500',
  FI: 'from-blue-400 via-white to-blue-500',
  CH: 'from-red-600 via-white to-red-600',
  PT: 'from-green-600 via-red-500 to-green-600',
  GR: 'from-blue-500 via-white to-blue-500',
  PL: 'from-white via-red-500 to-red-600',
  AT: 'from-red-500 via-white to-red-500',
  IE: 'from-green-600 via-orange-400 to-yellow-500',
  NZ: 'from-blue-500 via-white to-blue-700',
  default: 'from-violet-500 via-purple-500 to-fuchsia-500'
};

function getCountryGradient(code: string): string {
  return countryImages[code] || countryImages.default;
}

function shimmerCards() {
  return [...Array(8)].map((_, i) => (
    <div key={i} className="relative overflow-hidden rounded-2xl h-80 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="h-8 w-32 bg-slate-200 rounded mb-3"></div>
        <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
        <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  ));
}

export default function VisaPage() {
  const searchParams = useSearchParams();
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
            flag: country.flag || getCountryFlagEmoji(country.code),
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
    <main className="flex-1 py-12 md:py-16 bg-slate-900">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">Destinations</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
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
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-blur-sm"
            />
          </div>
        </form>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {shimmerCards()}
          </div>
        ) : destinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
              {destinations.map((destination, index) => (
                <Link
                  key={destination.id}
                  href={`/visa-search?to=${destination.code}`}
                  className="group relative overflow-hidden rounded-2xl h-80 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-500 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCountryGradient(destination.code)}`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      {destination.visaType}
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{destination.flag}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white truncate group-hover:text-violet-300 transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-slate-400 text-sm">{destination.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-300 text-sm mb-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {destination.processingTime}
                      </div>
                      <span className="text-slate-600">|</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {destination.maxStayDays}d stay
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-slate-400 text-xs">Starting from</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(destination.price)}</p>
                      </div>
                      <div className="px-4 py-2.5 bg-white text-slate-900 font-semibold rounded-xl flex items-center gap-2 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300">
                        Apply Now
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link href={buildQuery(currentPage - 1)} className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 hover:border-violet-500 hover:text-violet-400 text-sm font-medium transition-all">
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
                            : 'border border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-violet-500 hover:text-violet-400'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={buildQuery(currentPage + 1)} className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 hover:border-violet-500 hover:text-violet-400 text-sm font-medium transition-all">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No destinations found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search criteria</p>
            <Link href="/visa" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Clear search
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}