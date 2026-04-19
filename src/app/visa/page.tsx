export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import VisaFilterForm from './visa-filter-form';
import DestinationsGrid from './destinations-grid';

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

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
}

interface VisaPageProps {
  searchParams: Promise<{ 
    page?: string; 
    search?: string;
    region?: string;
    processing?: string;
    price?: string;
    from?: string;
  }>;
}

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

function getProcessingTimeLabel(days: number): string {
  if (days <= 1) return '24 Hours';
  if (days <= 3) return '1-3 Days';
  if (days <= 7) return '5-7 Days';
  return `${days}+ Days`;
}

export default async function VisaPage({ searchParams }: VisaPageProps) {
  const { page = '1', search = '', region = '', processing = '', price = '', from = '' } = await searchParams;
  const currentPage = parseInt(page);
  const itemsPerPage = 24;

  try {
    const allCountries: Country[] = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, flag: true }
    });

    let destinationQuery;
    
    if (from) {
      const originCode = from.toUpperCase();
      const visaRulesWithDestinations = await prisma.visaRule.findMany({
        where: {
          isActive: true,
          fromCountry: { code: originCode }
        },
        include: {
          toCountry: true,
          fromCountry: true
        },
        take: 1000
      });
      
      const toCountryIds = [...new Set(visaRulesWithDestinations.map(v => v.toCountryId))];
      const destinationCountries = await prisma.country.findMany({
        where: { id: { in: toCountryIds } },
        include: {
          visaRulesTo: {
            where: { isActive: true, fromCountry: { code: originCode } },
            orderBy: { price: 'asc' },
            take: 5
          }
        }
      });
      destinationQuery = destinationCountries;
    } else {
      destinationQuery = await prisma.country.findMany({
        include: {
          visaRulesTo: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 1
          }
        }
      });
    }

    let processedDestinations: Destination[] = destinationQuery.map(country => {
      const activeVisas = country.visaRulesTo.filter(v => v.isActive);
      const prices = activeVisas.map(v => Number(v.price)).filter(p => p > 0);
      const processingDays = activeVisas.map(v => v.processingDays);
      
      return {
        id: country.id,
        name: country.name,
        code: country.code,
        flag: country.flag || '🌍',
        region: country.region || 'Unknown',
        continent: country.continent || 'Unknown',
        visaCount: activeVisas.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
        processingDays: processingDays.length > 0 ? Math.min(...processingDays) : 0,
        processingTime: processingDays.length > 0 ? getProcessingTimeLabel(Math.min(...processingDays)) : 'N/A',
        hasActiveVisas: activeVisas.length > 0
      };
    });

    if (search) {
      processedDestinations = processedDestinations.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (region) {
      processedDestinations = processedDestinations.filter(d => 
        d.region.toLowerCase() === region.toLowerCase() ||
        d.continent.toLowerCase() === region.toLowerCase()
      );
    }

    if (processing) {
      const maxDays = parseInt(processing);
      processedDestinations = processedDestinations.filter(d => 
        d.hasActiveVisas && d.processingDays <= maxDays
      );
    }

    if (price) {
      const maxPrice = parseInt(price);
      processedDestinations = processedDestinations.filter(d => 
        d.hasActiveVisas && d.minPrice <= maxPrice
      );
    }

    processedDestinations.sort((a, b) => {
      if (a.hasActiveVisas !== b.hasActiveVisas) {
        return a.hasActiveVisas ? -1 : 1;
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
      if (region) params.set('region', region);
      if (processing) params.set('processing', processing);
      if (price) params.set('price', price);
      if (from) params.set('from', from);
      return `?${params.toString()}`;
    };

    return (
      <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              async function detectCountry() {
                try {
                  const res = await fetch('https://ipapi.co/json/');
                  const data = await res.json();
                  if (data.country_code) {
                    const select = document.getElementById('originSelect');
                    if (select) {
                      const option = select.querySelector('option[value="' + data.country_code + '"]');
                      if (option) {
                        select.value = data.country_code;
                        select.dispatchEvent(new Event('change'));
                      }
                    }
                  }
                } catch (e) {
                  console.log('IP detection failed');
                }
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', detectCountry);
              } else {
                detectCountry();
              }
            `
          }}
        />

        <div className="container-custom">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Destinations</span>
            </h1>
            <p className="text-lg text-slate-600">
              Choose your next travel destination. Quick and easy visa applications.
            </p>
          </div>

          <VisaFilterForm 
            allCountries={allCountries}
            from={from}
            search={search}
            region={region}
            processing={processing}
            price={price}
          />

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-slate-600">
              Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> destinations
              {from && <span className="ml-2">from <span className="font-semibold">{allCountries.find(c => c.code === from.toUpperCase())?.name || from.toUpperCase()}</span></span>}
            </p>
            {!from && (
              <Link href="/visa?from=PK" className="text-sm text-violet-600 hover:text-violet-700">
                Try: View visas available from Pakistan →
              </Link>
            )}
          </div>

          <DestinationsGrid 
            destinations={paginatedDestinations}
            from={from}
          />

          {paginatedDestinations.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No destinations found</h3>
              <p className="text-slate-600 mb-4">Try selecting a different origin country or adjusting filters.</p>
              <Link href="/visa" className="text-violet-600 hover:text-violet-700 font-medium">
                Clear filters →
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildQuery(currentPage - 1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  ← Previous
                </Link>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <Link
                      key={pageNum}
                      href={buildQuery(pageNum)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                        pageNum === currentPage
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages && (
                <Link
                  href={buildQuery(currentPage + 1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
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
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Error Loading Destinations</h1>
            <p className="text-lg text-slate-600">Please try again later.</p>
          </div>
        </div>
      </main>
    );
  }
}