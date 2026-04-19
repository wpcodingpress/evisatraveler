'use client';

import { useState, useEffect } from 'react';
import { EnhancedSearchForm } from '@/components/home/enhanced-search-form';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

function HeroSection({ countries }: { countries: Country[] }) {
  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-violet-950">
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[80px] animate-pulse delay-500" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 container-custom py-12 lg:py-16">
        <div className="text-center max-w-4xl mx-auto mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Trusted by 100,000+ Travelers Worldwide
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-6 leading-tight">
            Get Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400">
              Visa Approved
            </span>{' '}
            in Record Time
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed px-4">
            Apply for tourist, business, or transit visa online. 
            <span className="text-violet-400 font-semibold"> Fast approval in 24-72 hours</span> with 99.9% success rate.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-bold text-lg shadow-lg shadow-orange-500/25 mb-8">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            24-72 Hours Processing
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <EnhancedSearchForm countries={countries} />
        </div>

        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mt-8 lg:mt-10">
          {[
            { label: '99.9% Approval', icon: '✓' },
            { label: 'Secure & Encrypted', icon: '🔒' },
            { label: '24/7 Support', icon: '💬' },
            { label: 'Fast Processing', icon: '⚡' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-slate-300 text-sm font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-sm">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="py-8 lg:py-10 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
          {[
            { number: '100K+', label: 'Happy Customers' },
            { number: '99.9%', label: 'Approval Rate' },
            { number: '180+', label: 'Countries' },
            { number: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <div key={i} className="text-white">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1 lg:mb-2">{stat.number}</div>
              <div className="text-white/80 text-sm lg:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const POPULAR_DESTINATIONS = [
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', price: 49, time: '24-72 hours', days: '30' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', price: 59, time: '3-5 days', days: '30' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇲', price: 39, time: '24-48 hours', days: '30' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', price: 0, time: 'Visa Free', days: '30' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', price: 115, time: '3-5 days', days: '30' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', price: 60, time: '24-48 hours', days: '30' },
  { code: 'IN', name: 'India', flag: '🇮🇳', price: 50, time: '2-4 days', days: '30' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', price: 35, time: '24 hours', days: '30' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', price: 30, time: '24 hours', days: '30' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', price: 50, time: '2-3 days', days: '30' },
];

function PopularDestinations({ destinations }: { destinations: any[] }) {
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `From $${price}`;
  };

  const formatTime = (time: string) => {
    if (!time) return '3-5 Days';
    return time;
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035c-.734.56-1.658.568-2.402 0l-1.89-1.878a1 1 0 00-1.618 1.523L8.82 12.94c.277.714.102 1.564-.392 1.899L5.86 16.22c-.494.334-.73.942-.528 1.36a1 1 0 001.196 1.196c.418-.202 1.026-.034 1.36.528l2.035 2.802c.57.783 1.165 1.06 1.899.392l2.777-2.432a1 1 0 011.523-1.618l1.89 1.89c.56.734.568 1.658 0 2.401l-2.802 2.036c-.734.559-.95.69-1.618.098.277-.714.102-1.564-.392-1.899l-2.035-2.802c-.494-.559-.392-1.026.098-1.36" />
              </svg>
              Most Popular
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Popular{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                Destinations
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-slate-200 animate-pulse">
                <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
                <div className="h-6 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-slate-50">
      <div className="container-custom">
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035c-.734.56-1.658.568-2.402 0l-1.89-1.878a1 1 0 00-1.618 1.523L8.82 12.94c.277.714.102 1.564-.392 1.899L5.86 16.22c-.494.334-.73.942-.528 1.36a1 1 0 001.196 1.196c.418-.202 1.026-.034 1.36.528l2.035 2.802c.57.783 1.165 1.06 1.899.392l2.777-2.432a1 1 0 011.523-1.618l1.89 1.89c.56.734.568 1.658 0 2.401l-2.802 2.036c-.734.559-.95.69-1.618.098.277-.714.102-1.564-.392-1.899l-2.035-2.802c-.494-.559-.392-1.026.098-1.36" />
            </svg>
            Most Popular
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Popular{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              Destinations
            </span>
          </h2>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto">
            Discover our most sought-after visa destinations with fastest processing times
          </p>
        </div>

        {destinations.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
              {destinations.map((dest: any) => (
                <Link
                  key={dest.id}
                  href={`/visa/PK-to-${dest.toCountry?.code}`}
                  className="group bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-slate-200 hover:shadow-xl hover:border-violet-300 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl lg:text-4xl">{dest.toCountry?.flag}</span>
                    <span className="text-emerald-600 font-bold text-sm">
                      {formatPrice(Number(dest.price))}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {dest.toCountry?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {dest.visaType || 'Tourist Visa'} • {dest.maxStayDays || 30} Days • {formatTime(dest.processingTime)}
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8 lg:mt-10">
              <Link
                href="/visa"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg"
              >
                View All Destinations
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {POPULAR_DESTINATIONS.map((dest) => (
              <Link
                key={dest.code}
                href={`/visa/PK-to-${dest.code}`}
                className="group bg-white rounded-2xl p-4 lg:p-5 shadow-sm border border-slate-200 hover:shadow-xl hover:border-violet-300 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl lg:text-4xl">{dest.flag}</span>
                  <span className="text-emerald-600 font-bold text-sm">
                    {dest.price === 0 ? 'Free' : `From $${dest.price}`}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Tourist Visa • {dest.days} Days • {dest.time}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VisaTypes() {
  const visaTypes = [
    { title: 'Tourist Visa', desc: 'For leisure travel and vacation', price: 'From $49', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', icon: '🏖️' },
    { title: 'Business Visa', desc: 'For business meetings and work', price: 'From $99', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', icon: '💼' },
    { title: 'Transit Visa', desc: 'For connecting flights', price: 'From $29', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', icon: '✈️' },
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Choose Your Visa Type
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            What Type of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              Visa Do You Need?
            </span>
          </h2>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto">
            Select the visa category that best fits your travel purpose
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {visaTypes.map((visa) => (
            <Link
              key={visa.title}
              href="/visa"
              className="group bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-slate-200 hover:shadow-2xl hover:border-violet-300 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${visa.color} flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform`}>
                {visa.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                {visa.title}
              </h3>
              <p className="text-slate-600 text-sm mb-4">{visa.desc}</p>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${visa.color}`}>
                  {visa.price}
                </span>
                <span className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Choose Destination', desc: 'Select your destination country and visa type', icon: '🔍' },
    { num: '02', title: 'Fill Application', desc: 'Complete the online form with required details', icon: '📝' },
    { num: '03', title: 'Upload Documents', desc: 'Upload your passport and supporting documents', icon: '📤' },
    { num: '04', title: 'Get Approved', desc: 'Receive your e-visa via email in 24-72 hours', icon: '✅' },
  ];

  return (
    <section className="py-16 lg:py-20 bg-slate-50">
      <div className="container-custom">
        <div className="text-center mb-10 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l3-3a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Simple Process
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            How It{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              Works
            </span>
          </h2>
          <p className="text-slate-600 mt-2 max-w-xl mx-auto">
            Get your visa in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-slate-200">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-violet-300 to-purple-300 -translate-y-1/2" />
              )}
              <div className="text-4xl lg:text-5xl font-bold text-violet-200 mb-3">{step.num}</div>
              <div className="text-3xl mb-3">{step.icon}</div>
              <h3 className="font-bold text-slate-900 mb-1">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
      <div className="container-custom text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
          Ready to Get Your Visa?
        </h2>
        <p className="text-white/80 max-w-xl mx-auto mb-6">
          Apply now and get approved in 24-72 hours. Fast, simple, and secure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/visa"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg"
          >
            Apply Now
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/track"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/30"
          >
            Track Application
          </Link>
        </div>
      </div>
    </section>
  );
}

// Static fallback data
const FALLBACK_COUNTRIES: Country[] = [
  { id: '1', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  { id: '2', name: 'United States', code: 'US', flag: '🇺🇸' },
  { id: '3', name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { id: '4', name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { id: '5', name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { id: '6', name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { id: '7', name: 'France', code: 'FR', flag: '🇫🇷' },
  { id: '8', name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { id: '9', name: 'China', code: 'CN', flag: '🇨🇳' },
  { id: '10', name: 'India', code: 'IN', flag: '🇮🇳' },
];

const FALLBACK_DESTINATIONS = [
  { id: '1', toCountry: { code: 'TH', name: 'Thailand', flag: '🇹🇭' }, price: 49, processingTime: '24-72 hours', maxStayDays: 30 },
  { id: '2', toCountry: { code: 'VN', name: 'Vietnam', flag: '🇻🇳' }, price: 59, processingTime: '3-5 days', maxStayDays: 30 },
  { id: '3', toCountry: { code: 'MY', name: 'Malaysia', flag: '🇲🇾' }, price: 39, processingTime: '24-48 hours', maxStayDays: 30 },
  { id: '4', toCountry: { code: 'AE', name: 'UAE', flag: '🇦🇪' }, price: 115, processingTime: '3-5 days', maxStayDays: 30 },
  { id: '5', toCountry: { code: 'TR', name: 'Turkey', flag: '🇹🇷' }, price: 60, processingTime: '24-48 hours', maxStayDays: 30 },
];

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [destinations, setDestinations] = useState<any[]>(FALLBACK_DESTINATIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to load dynamic data, but fall back to static data if it fails
    setLoading(true);
    Promise.all([
      fetch('/api/countries').then(r => r.json()).catch(() => ({ countries: FALLBACK_COUNTRIES })),
      fetch('/api/popular-destinations').then(r => r.json()).catch(() => ({ destinations: FALLBACK_DESTINATIONS }))
    ]).then(([countriesData, destinationsData]) => {
      if (countriesData.countries && countriesData.countries.length > 0) {
        setCountries(countriesData.countries);
      }
      if (destinationsData.destinations && destinationsData.destinations.length > 0) {
        setDestinations(destinationsData.destinations);
      }
      setLoading(false);
    }).catch(() => {
      // Already have fallback data, just set loading to false
      setLoading(false);
    });
  }, []);

  return (
    <main>
      <HeroSection countries={countries} />
      <StatsBar />
      <PopularDestinations destinations={destinations} />
      <VisaTypes />
      <HowItWorks />
      <CTASection />
    </main>
  );
}