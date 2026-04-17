'use client';

import { useState, Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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
        fromCountry: { name: rule.fromCountry.name, code: rule.fromCountry.code, flag: rule.fromCountry.flag || '🌍' },
        toCountry: { name: rule.toCountry.name, code: rule.toCountry.code, flag: rule.toCountry.flag || '🌍' },
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

function VisaApplySidebar({ visaRule }: { visaRule: MockVisaRule }) {
  const [travelers, setTravelers] = useState(1);
  const [processingOption, setProcessingOption] = useState<'standard' | 'urgent'>('standard');

  const basePrice = visaRule.price;
  const urgentPrice = Math.round(basePrice * 1.5);
  const totalStandard = basePrice * travelers;
  const totalUrgent = urgentPrice * travelers;

  return (
    <div className="lg:col-span-1">
      {/* Main Sticky Container - ALL sidebar content scrolls together */}
      <div className="sticky top-24 space-y-4">
        {/* Main Apply Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
            <h3 className="text-xl font-bold mb-1">{visaRule.visaType}</h3>
            <p className="text-violet-100 text-sm">{visaRule.toCountry.name}, {visaRule.fromCountry.name}</p>
          </div>

          <div className="p-6">
            {/* Processing Time Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Processing Time</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProcessingOption('standard')}
                  className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    processingOption === 'standard'
                      ? 'border-violet-500 bg-violet-50 text-violet-700'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  <span className="block">{visaRule.processingTime}</span>
                  <span className="text-xs opacity-75">Standard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProcessingOption('urgent')}
                  className={`p-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    processingOption === 'urgent'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-slate-200 text-slate-600 hover:border-violet-300'
                  }`}
                >
                  <span className="block">Express</span>
                  <span className="text-xs text-slate-400">+${urgentPrice - basePrice}</span>
                </button>
              </div>
            </div>

            {/* Traveler Count */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Travelers</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-violet-500 hover:text-violet-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-2xl font-bold text-slate-900 w-12 text-center">{travelers}</span>
              <button
                type="button"
                onClick={() => setTravelers(Math.min(10, travelers + 1))}
                className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-violet-500 hover:text-violet-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Visa Fee × {travelers}</span>
              <span className="font-semibold text-slate-900">
                ${processingOption === 'urgent' ? urgentPrice * travelers : basePrice * travelers}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Service Fee</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-violet-600">
                ${processingOption === 'urgent' ? totalUrgent : totalStandard}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">All fees included. No hidden charges.</p>
          </div>

          {/* CTA Button */}
          <Link
            href={`/apply/${visaRule.id}?travelers=${travelers}&processing=${processingOption}`}
            className="block w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg rounded-xl text-center hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply Now
            <span className="block text-sm font-normal opacity-80">
              {processingOption === 'urgent' ? 'Express' : 'Standard'} processing
            </span>
          </Link>

          {/* Quick Info */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant Confirmation
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              E-Visa to Email
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
            <div className="text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-xs text-slate-500">99.9%<br/>Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <div className="text-xs text-slate-500">Secure<br/>Payment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💬</div>
              <div className="text-xs text-slate-500">24/7<br/>Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Card */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Need Help?
        </h4>
        <p className="text-sm text-slate-600 mb-3">Our visa experts are available 24/7 to assist you with any questions.</p>
        <Link href="/contact" className="block w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl text-center hover:from-violet-500 hover:to-purple-500 transition-all shadow-md text-sm">
          Contact Support
        </Link>
      </div>

      {/* Visa Info Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Visa Details
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">Max Stay</span>
            <span className="font-bold text-slate-900">{visaRule.maxStayDays} Days</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">Validity</span>
            <span className="font-bold text-slate-900">{visaRule.validityDays} Days</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">Entry Type</span>
            <span className="font-bold text-slate-900">{visaRule.entryType}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500">Processing</span>
            <span className="font-bold text-violet-600">{visaRule.processingTime}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
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
          <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </Link>
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
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
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
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
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
                {visaRule.requirements.map((req: any, i: number) => {
                  const reqText = typeof req === 'string' ? req : (req.text || req.name || String(req));
                  return (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-slate-700 text-lg">{reqText}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Required Documents</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {visaRule.documents.map((doc: any, i: number) => {
                  const docText = typeof doc === 'string' ? doc : (doc.name || doc.text || String(doc));
                  return (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <span className="text-slate-700 font-medium">{docText}</span>
                    </div>
                  );
                })}
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

          {/* Sidebar - Client Component */}
          <VisaApplySidebar visaRule={visaRule} />
        </div>
      </div>
    </div>
  );
}
VisaApplySidebar.displayName = 'VisaApplySidebar';