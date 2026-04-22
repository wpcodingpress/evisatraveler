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
    </main>
  );
}