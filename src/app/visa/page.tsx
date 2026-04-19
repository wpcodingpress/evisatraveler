import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  continent: string;
  visaCount: number;
  minPrice: number;
  popularVisas: string[];
}

interface VisaPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function VisaPage({ searchParams }: VisaPageProps) {
  const { page = '1', search = '' } = await searchParams;
  const currentPage = parseInt(page);
  const itemsPerPage = 24;

  try {
    // Get all destination countries that have visa rules from ANY origin
    const destinationsQuery = await prisma.country.findMany({
      where: {
        visaRulesTo: {
          some: { isActive: true }
        },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search.toUpperCase() } }
          ]
        })
      },
      include: {
        visaRulesTo: {
          where: { isActive: true },
          include: {
            fromCountry: true
          },
          orderBy: { price: 'asc' },
          take: 10 // Get more visa rules for better pricing info
        }
      }
    });

    // Process destinations data
    const processedDestinations: Destination[] = destinationsQuery.map(country => {
      const visas = country.visaRulesTo;
      const prices = visas.map(v => Number(v.price)).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const visaTypes = [...new Set(visas.map(v => v.visaType))];

      return {
        id: country.id,
        name: country.name,
        code: country.code,
        flag: country.flag || '🌍',
        region: country.region || 'Unknown',
        continent: country.continent || 'Unknown',
        visaCount: visas.length,
        minPrice,
        popularVisas: visaTypes.slice(0, 3)
      };
    });

    // Sort by visa count and name
    processedDestinations.sort((a, b) => {
      if (b.visaCount !== a.visaCount) return b.visaCount - a.visaCount;
      return a.name.localeCompare(b.name);
    });

    // Pagination
    const totalItems = processedDestinations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDestinations = processedDestinations.slice(startIndex, endIndex);

    return (
      <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Destinations</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Browse {totalItems}+ destinations worldwide. Find your perfect visa solution.
            </p>
          </div>

          {/* Search */}
          <form className="max-w-xl mx-auto mb-10" method="GET">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                placeholder="Search destinations..."
                defaultValue={search}
                className="w-full pl-12 pr-4 py-4 border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
              />
            </div>
          </form>

          {/* Results */}
          <div className="mb-8">
            <p className="text-slate-600 text-center">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} destinations
              {search && ` for "${search}"`}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedDestinations.map((destination) => (
              <Link
                key={destination.id}
                href={`/visa?from=any&to=${destination.code}`}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-violet-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{destination.flag}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 truncate">
                      {destination.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {destination.region}, {destination.continent}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>Available visas:</span>
                    <span className="font-medium text-violet-600">{destination.visaCount}</span>
                  </div>
                  {destination.minPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Starting from:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(destination.minPrice)}</span>
                    </div>
                  )}
                </div>

                {destination.popularVisas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Popular visas:</p>
                    <div className="flex flex-wrap gap-1">
                      {destination.popularVisas.map((visaType) => (
                        <span
                          key={visaType}
                          className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full"
                        >
                          {visaType}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <span className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium text-sm group-hover:bg-violet-700 transition-colors inline-block w-full text-center">
                    View Visas
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              {/* Previous */}
              {currentPage > 1 && (
                <Link
                  href={`/visa?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Previous
                </Link>
              )}

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <Link
                    key={pageNum}
                    href={`/visa?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {/* Next */}
              {currentPage < totalPages && (
                <Link
                  href={`/visa?page=${currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Next
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