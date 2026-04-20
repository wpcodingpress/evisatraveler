export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DestinationsGrid from './destinations-grid';
import { getCountryFlagEmoji } from '@/lib/utils';

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

interface VisaPageProps {
  searchParams: Promise<{ 
    page?: string; 
    search?: string;
  }>;
}

function getProcessingTimeLabel(days: number): string {
  if (days <= 1) return '24 Hours';
  if (days <= 3) return '1-3 Days';
  if (days <= 7) return '5-7 Days';
  return `${days}+ Days`;
}

export default async function VisaPage({ searchParams }: VisaPageProps) {
  const { page = '1', search = '' } = await searchParams;
  const currentPage = parseInt(page);
  const itemsPerPage = 24;

  try {
    const destinationQuery = await prisma.country.findMany({
      include: {
        visaRulesTo: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      }
    });

    let processedDestinations: Destination[] = destinationQuery
      .map(country => {
        const activeVisas = country.visaRulesTo.filter(v => v.isActive);
        const prices = activeVisas.map(v => Number(v.price)).filter(p => p > 0);
        const processingDays = activeVisas.map(v => v.processingDays);
        
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
      })
      .filter(d => d.hasActiveVisas);

    if (search) {
      processedDestinations = processedDestinations.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    processedDestinations.sort((a, b) => {
      if (a.minPrice !== b.minPrice) {
        return a.minPrice - b.minPrice;
      }
      return a.name.localeCompare(b.name);
    });

    const totalItems = processedDestinations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDestinations = processedDestinations.slice(startIndex, endIndex);

    const buildQuery = (pageNum: number) => {
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      if (search) params.set('search', search);
      return `?${params.toString()}`;
    };

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

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8">
            <input
              type="text"
              placeholder="Search destinations..."
              defaultValue={search}
              onChange={(e) => {
                const params = new URLSearchParams();
                if (e.target.value) params.set('search', e.target.value);
                window.location.href = `/visa${params.toString() ? '?' + params.toString() : ''}`;
              }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <DestinationsGrid 
            destinations={paginatedDestinations}
            from=""
          />

          {paginatedDestinations.length === 0 && (
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
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error loading visa page:', error);
    return (
      <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Error Loading Destinations</h1>
            <p className="text-slate-600">Please try again later.</p>
          </div>
        </div>
      </main>
    );
  }
}
