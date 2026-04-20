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
  visaCount: number;
  minPrice: number;
  maxPrice: number;
  processingDays: number;
  processingTime: string;
  hasActiveVisas: boolean;
}

function getProcessingTimeLabel(days: number): string {
  if (days <= 1) return '24 Hours';
  if (days <= 3) return '1-3 Days';
  if (days <= 7) return '5-7 Days';
  return `${days}+ Days`;
}

function getFlagEmoji(code: string, storedFlag?: string | null): string {
  if (storedFlag && storedFlag.trim()) {
    return storedFlag;
  }
  return getCountryFlagEmoji(code);
}

function shimmerCards() {
  return [...Array(8)].map((_, i) => (
    <div key={i} className="bg-white rounded-2xl p-5 shadow-md animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
        <div className="h-5 w-24 bg-slate-200 rounded"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-slate-200 rounded"></div>
        <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-lg"></div>
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
        processedDestinations = data.map((country: any) => {
          const activeVisas = (country.visaRulesTo || []).filter((v: any) => v.isActive);
          const prices = activeVisas.map((v: any) => Number(v.price)).filter((p: number) => p > 0);
          const processingDays = activeVisas.map((v: any) => v.processingDays);
          
          return {
            id: country.id,
            name: country.name,
            code: country.code,
            flag: getFlagEmoji(country.code, country.flag),
            visaCount: activeVisas.length,
            minPrice: prices.length > 0 ? Math.min(...prices) : 0,
            maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
            processingDays: processingDays.length > 0 ? Math.min(...processingDays) : 0,
            processingTime: processingDays.length > 0 ? getProcessingTimeLabel(Math.min(...processingDays)) : 'N/A',
            hasActiveVisas: activeVisas.length > 0
          };
        }).filter((d: Destination) => d.hasActiveVisas);
        
        processedDestinations.sort((a: Destination, b: Destination) => {
          if (a.minPrice !== b.minPrice) {
            return a.minPrice - b.minPrice;
          }
          return a.name.localeCompare(b.name);
        });
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
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 via-white to-purple-50/30">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">Destinations</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose your next travel destination. Quick and easy visa applications.
          </p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Link href="/visa-search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all">
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
              placeholder="Search destinations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-base"
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
                  className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 hover:border-violet-300 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl shadow-inner">
                        <span className="text-2xl">{destination.flag}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-xs text-slate-500">{destination.code}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">Processing</span>
                        </div>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                          {destination.processingTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm">Visa types</span>
                        </div>
                        <span className="font-semibold text-violet-600">{destination.visaCount}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">From</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            {formatCurrency(destination.minPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                      <button className="relative w-full py-3 bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 group-hover:text-white transition-all duration-300">
                        View Visa Details
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link href={buildQuery(currentPage - 1)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 text-sm font-medium transition-all">
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
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30' 
                            : 'border border-slate-200 hover:bg-violet-50 hover:border-violet-300'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={buildQuery(currentPage + 1)} className="px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 text-sm font-medium transition-all">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No destinations found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search criteria</p>
            <Link href="/visa" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Clear search
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}