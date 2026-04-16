import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string; to?: string; date?: string; travelers?: string }>;
}

interface MockVisaRule {
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

const MOCK_VISA_RULES: Record<string, MockVisaRule> = {
  'US-to-TH': {
    id: '1',
    visaType: 'Tourist Visa',
    processingTime: '24-72 hours',
    processingDays: 3,
    price: 49,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 90,
    entryType: 'Single Entry',
    requirements: ['Valid passport (6+ months)', 'Passport-size photos', 'Proof of accommodation', 'Return flight ticket', 'Bank statement (last 3 months)'],
    documents: ['Passport copy', 'Photo (3.5x4.5cm)', 'Flight itinerary', 'Hotel booking', 'Proof of funds'],
    allowedActivities: ['Tourism', 'Leisure', 'Visiting friends/family'],
    additionalInfo: 'Thailand offers visa-on-arrival for many nationalities. This visa is recommended for longer stays or specific requirements.',
    fromCountry: { name: 'United States', code: 'US', flag: '🇺🇸' },
    toCountry: { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  },
  'US-to-JP': {
    id: '2',
    visaType: 'Tourist Visa',
    processingTime: '5-7 business days',
    processingDays: 7,
    price: 89,
    currency: 'USD',
    maxStayDays: 90,
    validityDays: 90,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Visa application form', 'Photo (4.5x4.5cm)', 'Itinerary', 'Bank statements', 'Employment verification'],
    documents: ['Passport', 'Application form', 'Photo', 'Flight booking', 'Hotel reservation', 'Bank statement'],
    allowedActivities: ['Tourism', 'Business meetings', 'Visiting relatives'],
    additionalInfo: 'Japan tourist visa is required for US citizens staying longer than 90 days or for specific purposes.',
    fromCountry: { name: 'United States', code: 'US', flag: '🇺🇸' },
    toCountry: { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  },
  'US-to-AE': {
    id: '3',
    visaType: 'Tourist Visa',
    processingTime: '3-5 business days',
    processingDays: 5,
    price: 115,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 60,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking', 'Return ticket', 'Bank statement'],
    documents: ['Passport copy', 'Photo', 'Flight ticket', 'Hotel booking', 'Bank statement'],
    allowedActivities: ['Tourism', 'Business', 'Transit'],
    additionalInfo: 'UAE offers visa-on-arrival for US citizens. This visa is for longer stays or specific requirements.',
    fromCountry: { name: 'United States', code: 'US', flag: '🇺🇸' },
    toCountry: { name: 'UAE', code: 'AE', flag: '🇦🇪' },
  },
  'GB-to-TR': {
    id: '4',
    visaType: 'Tourist Visa',
    processingTime: '24-48 hours',
    processingDays: 2,
    price: 60,
    currency: 'USD',
    maxStayDays: 90,
    validityDays: 180,
    entryType: 'Multiple Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking', 'Bank statement'],
    documents: ['Passport', 'Photo', 'Hotel confirmation', 'Bank statement'],
    allowedActivities: ['Tourism', 'Business', 'Cultural visits'],
    additionalInfo: 'Turkey offers e-Visa for many nationalities. Apply online before your trip.',
    fromCountry: { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
    toCountry: { name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  },
  'CA-to-AE': {
    id: '5',
    visaType: 'Tourist Visa',
    processingTime: '3-5 business days',
    processingDays: 5,
    price: 110,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 60,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking', 'Return ticket'],
    documents: ['Passport', 'Photo', 'Hotel booking', 'Flight itinerary'],
    allowedActivities: ['Tourism', 'Business meetings', 'Transit'],
    additionalInfo: 'UAE offers visa-on-arrival for Canadian citizens. This visa is for extended stays.',
    fromCountry: { name: 'Canada', code: 'CA', flag: '🇨🇦' },
    toCountry: { name: 'UAE', code: 'AE', flag: '🇦🇪' },
  },
};

async function getVisaRules(slug: string): Promise<MockVisaRule | null> {
  const parts = slug.split('-to-');
  if (parts.length !== 2) return null;
  
  const fromCode = parts[0].toUpperCase();
  const toCode = parts[1].toUpperCase();
  
  try {
    const rules = await prisma.visaRule.findMany({
      where: {
        fromCountry: { code: fromCode },
        toCountry: { code: toCode },
        isActive: true,
      },
      include: {
        fromCountry: true,
        toCountry: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (rules.length > 0) {
      const rule = rules[0];
      return {
        id: rule.id,
        visaType: rule.visaType,
        processingTime: rule.processingTime,
        processingDays: rule.processingDays,
        price: Number(rule.price),
        currency: rule.currency,
        maxStayDays: rule.maxStayDays,
        validityDays: rule.validityDays,
        entryType: rule.entryType,
        requirements: rule.requirements as string[],
        documents: rule.documents as string[],
        allowedActivities: rule.allowedActivities as string[],
        additionalInfo: rule.additionalInfo || '',
        fromCountry: { name: rule.fromCountry.name, code: rule.fromCountry.code, flag: '🌍' },
        toCountry: { name: rule.toCountry.name, code: rule.toCountry.code, flag: '🌍' },
      };
    }
  } catch (error) {
    console.log('Database not available, using mock data');
  }

  const mockKey = `${fromCode}-to-${toCode}`;
  return MOCK_VISA_RULES[mockKey] || null;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default async function VisaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from, to, date, travelers } = await searchParams;
  const visaRule = await getVisaRules(slug);

  if (!visaRule) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="text-8xl mb-8">🔍</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Visa Information Not Found</h1>
          <p className="text-xl text-slate-400 mb-8">
            We don&apos;t have visa information for this route yet. Our team is working on adding more destinations.
          </p>
          <a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 py-16 md:py-24">
        <div className="container-custom">
          <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span>Visa</span>
            <span>/</span>
            <span className="text-white">{visaRule.toCountry.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-7xl md:text-8xl">{visaRule.toCountry.flag}</span>
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {visaRule.visaType}
              </h1>
              <p className="text-xl md:text-2xl text-white/80">
                {visaRule.fromCountry.name} to {visaRule.toCountry.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Visa Overview</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Processing Time</p>
                    <p className="font-bold text-slate-900">{visaRule.processingTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Max Stay</p>
                    <p className="font-bold text-slate-900">{visaRule.maxStayDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Validity</p>
                    <p className="font-bold text-slate-900">{visaRule.validityDays} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Entry Type</p>
                    <p className="font-bold text-slate-900">{visaRule.entryType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Requirements</h2>
              <ul className="space-y-4">
                {visaRule.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
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
                {visaRule.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-slate-700 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            {visaRule.additionalInfo && (
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Additional Information</h2>
                <p className="text-slate-700 text-lg leading-relaxed">{visaRule.additionalInfo}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-8 text-white sticky top-24 shadow-2xl">
              <h3 className="text-2xl font-bold mb-2">Apply for Visa</h3>
              <p className="text-violet-200 mb-6">Start your application process</p>
              
              <div className="mb-6">
                <div className="text-sm text-violet-200 mb-1">Processing Time</div>
                <div className="text-3xl font-bold">{visaRule.processingTime}</div>
              </div>

              <div className="mb-8">
                <div className="text-sm text-violet-200 mb-1">Total Price</div>
                <div className="text-5xl font-bold">{formatCurrency(visaRule.price, visaRule.currency)}</div>
                <div className="text-sm text-violet-200 mt-1">per person</div>
              </div>

              <a href={`/apply?from=${visaRule.fromCountry.code}&to=${visaRule.toCountry.code}&type=${encodeURIComponent(visaRule.visaType)}`} className="block w-full py-4 bg-white text-violet-700 font-bold text-lg rounded-xl text-center hover:bg-violet-50 transition-colors shadow-lg">
                Apply Now
              </a>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 text-sm text-violet-200">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  99.9% Approval Rate
                </div>
                <div className="flex items-center gap-3 text-sm text-violet-200 mt-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Secure & Encrypted
                </div>
                <div className="flex items-center gap-3 text-sm text-violet-200 mt-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
