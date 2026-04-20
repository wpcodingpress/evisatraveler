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
            flag: country.flag || getCountryFlagEmoji(country.code),
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
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Destinations</span>
          </h1>
          <p className="text-lg text-slate-600">
            Choose your next travel destination. Quick and easy visa applications.
          </p>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <Link href="/visa-search" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              🔍 Search Visas →
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8">
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600">Loading destinations...</p>
          </div>
        ) : destinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
              {destinations.map((destination) => (
                <Link
                  key={destination.id}
                  href={`/visa-search?to=${destination.code}`}
                  className="group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-violet-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl leading-none">{destination.flag || getCountryFlagEmoji(destination.code)}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-violet-700">
                        {destination.name}
                      </h3>
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

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link href={buildQuery(currentPage - 1)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm">
                    ← Previous
                  </Link>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <Link key={pageNum} href={buildQuery(pageNum)}
                        className={`px-4 py-2 border rounded-lg text-sm ${
                          pageNum === currentPage ? 'bg-violet-600 text-white border-violet-600' : 'border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>
                {currentPage < totalPages && (
                  <Link href={buildQuery(currentPage + 1)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm">
                    Next →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No destinations found</h3>
            <Link href="/visa" className="text-violet-600 hover:text-violet-700 font-medium">
              Clear search →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
