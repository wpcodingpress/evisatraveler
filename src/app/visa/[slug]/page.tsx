import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountryFlagEmoji } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
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
  allowedActivities: string[];
  additionalInfo: string;
  fromCountry: { name: string; code: string; flag: string };
  toCountry: { name: string; code: string; flag: string };
}

export default async function VisaPage({ params }: Props) {
  const { slug } = await params;

  // Parse the slug (e.g., "US-to-TH" -> from: "US", to: "TH")
  const parts = slug.split('-to-');
  if (parts.length !== 2) {
    notFound();
  }

  const [fromCode, toCode] = parts;

  try {
    // Find the visa rule in the database
    const visaRule = await prisma.visaRule.findFirst({
      where: {
        fromCountry: { code: fromCode.toUpperCase() },
        toCountry: { code: toCode.toUpperCase() },
        isActive: true,
      },
      include: {
        fromCountry: true,
        toCountry: true,
      },
      orderBy: { price: 'asc' },
    });

    if (!visaRule) {
      // Try to find any visa rule between these countries
      const alternativeRule = await prisma.visaRule.findFirst({
        where: {
          OR: [
            {
              fromCountry: { code: fromCode.toUpperCase() },
              toCountry: { code: toCode.toUpperCase() },
            },
            {
              fromCountry: { code: toCode.toUpperCase() },
              toCountry: { code: fromCode.toUpperCase() },
            }
          ],
          isActive: true,
        },
        include: {
          fromCountry: true,
          toCountry: true,
        },
        orderBy: { price: 'asc' },
      });

      if (alternativeRule) {
        // Redirect to correct route
        const correctSlug = `${alternativeRule.fromCountry.code}-to-${alternativeRule.toCountry.code}`.toLowerCase();
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-violet-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-violet-600 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Redirecting...</h2>
              <p className="text-slate-500">Taking you to the correct visa page.</p>
              <script dangerouslySetInnerHTML={{
                __html: `window.location.href = '/visa/${correctSlug}';`
              }} />
            </div>
          </div>
        );
      }

      // No visa rule found
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">🔍 Visa Information Not Found</h2>
            <p className="text-slate-500 mb-6">
              We don't have visa information for this route yet. Our team is working on adding more destinations.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    // Convert database record to display format
    const visaData: VisaRule = {
      id: visaRule.id,
      visaType: visaRule.visaType,
      processingTime: visaRule.processingTime,
      processingDays: visaRule.processingDays,
      price: Number(visaRule.price),
      currency: visaRule.currency,
      maxStayDays: visaRule.maxStayDays,
      validityDays: visaRule.validityDays,
      entryType: visaRule.entryType || 'Single Entry',
      requirements: ['Valid passport (6+ months validity)', 'Recent passport-size photos'],
      documents: ['Passport copy', 'Recent photo'],
      allowedActivities: ['Tourism', 'Business meetings', 'Visiting friends/family'],
      additionalInfo: `${visaRule.toCountry.name} ${visaRule.visaType.toLowerCase()} for ${visaRule.fromCountry.name} citizens.`,
       fromCountry: {
         name: visaRule.fromCountry.name,
         code: visaRule.fromCountry.code,
         flag: visaRule.fromCountry.flag || getCountryFlagEmoji(visaRule.fromCountry.code)
       },
       toCountry: {
         name: visaRule.toCountry.name,
         code: visaRule.toCountry.code,
         flag: visaRule.toCountry.flag || getCountryFlagEmoji(visaRule.toCountry.code)
       }
    };

    // Render the visa page
    return <VisaDetailsClient visaData={visaData} />;
  } catch (error) {
    console.error('Error loading visa data:', error);
    notFound();
  }
}

function VisaDetailsClient({ visaData }: { visaData: VisaRule }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-16 md:py-24">
        <div className="container-custom">
          <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/visa" className="hover:text-white">Visa</Link>
            <span>/</span>
            <span className="text-white">{visaData.toCountry.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-7xl md:text-8xl">{visaData.toCountry.flag}</span>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">{visaData.visaType}</h1>
              <p className="text-xl md:text-2xl text-white/80">{visaData.fromCountry.name} → {visaData.toCountry.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Visa Overview</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Processing Time</p>
                    <p className="font-bold text-slate-900">{visaData.processingTime}</p>
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
                    <p className="font-bold text-slate-900">{visaData.maxStayDays} days</p>
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
                    <p className="font-bold text-slate-900">{visaData.validityDays} days</p>
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
                    <p className="font-bold text-slate-900">{visaData.entryType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Requirements</h2>
              <ul className="space-y-4">
                {visaData.requirements.map((req, index) => (
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

            {/* Documents */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Required Documents</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {visaData.documents.map((doc, index) => (
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{visaData.visaType}</h3>
                  <p className="text-violet-100 text-sm">{visaData.toCountry.name} • {visaData.fromCountry.name}</p>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Visa Type</label>
                    <div className="space-y-2">
                      <button type="button" className="w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all text-left border-violet-500 bg-violet-50 text-violet-700">
                        <span className="block">{visaData.visaType}</span>
                        <span className="text-xs opacity-75">From ${visaData.price}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Visa Fee × 1</span>
                      <span className="font-semibold text-slate-900">${visaData.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Service Fee</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-violet-600">${visaData.price}</span>
                    </div>
                  </div>

                  <Link href={`/apply/${visaData.id}`} className="block w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl text-center">
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}