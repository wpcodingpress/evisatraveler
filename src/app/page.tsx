'use client';

import { useState, useEffect, useRef } from 'react';
import { EnhancedSearchForm } from '@/components/home/enhanced-search-form';
import Link from 'next/link';
import { getCountryFlagEmoji } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

const floatingElements = [
  { icon: 'plane', name: 'plane1', position: 'top-[8%] left-[3%] sm:left-[5%]', size: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14', delay: '0s', duration: '6s' },
  { icon: 'globe', name: 'globe1', position: 'top-[15%] right-[20%] sm:right-[25%]', size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', delay: '1s', duration: '7s' },
  { icon: 'passport', name: 'passport1', position: 'top-[30%] left-[5%] sm:left-[8%]', size: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12', delay: '2s', duration: '8s' },
  { icon: 'check', name: 'check1', position: 'top-[25%] right-[10%] sm:right-[15%]', size: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12', delay: '1.5s', duration: '6s' },
  { icon: 'clock', name: 'clock1', position: 'bottom-[15%] left-[8%] sm:left-[12%]', size: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12', delay: '0.5s', duration: '7s' },
  { icon: 'shield', name: 'shield1', position: 'top-[20%] right-[8%]', size: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12', delay: '2.5s', duration: '8s' },
  { icon: 'map', name: 'map1', position: 'bottom-[25%] right-[15%] sm:right-[20%]', size: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14', delay: '3s', duration: '7.5s' },
  { icon: 'ticket', name: 'ticket1', position: 'bottom-[10%] left-[3%] sm:left-[5%]', size: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12', delay: '4s', duration: '9s' },
];

function SVGIcon({ type, className }: { type: string; className: string }) {
  const iconClasses = `${className} text-violet-600`;
  
  switch(type) {
    case 'plane':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      );
    case 'globe':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      );
    case 'passport':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v20c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V2zm6 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-6c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
        </svg>
      );
    case 'check':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
      );
    case 'clock':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
        </svg>
      );
    case 'shield':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      );
    case 'map':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
        </svg>
      );
    case 'ticket':
      return (
        <svg className={iconClasses} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.11 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54z"/>
        </svg>
      );
    default:
      return null;
  }
}

function FloatingElement({ icon, position, size, delay, duration }: { icon: string; position: string; size: string; delay: string; duration: string }) {
  return (
    <div 
      className={`absolute ${position} ${size} z-[2] hidden sm:block`}
      style={{ 
        animation: `float ${duration} ease-in-out infinite`,
        animationDelay: delay,
        filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))'
      }}
    >
      <SVGIcon type={icon} className="w-full h-full" />
    </div>
  );
}

function HeroSection({ countries }: { countries: Country[] }) {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom >= 0) {
          setScrollY(window.scrollY);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <section ref={heroRef} className="relative min-h-[90vh] lg:min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-white">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute right-0 bottom-0 w-[30%] h-[65%] z-[1] md:w-[25%] md:h-[65%] hidden md:block"
          style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
        >
          <img 
            src="/illustration.png" 
            alt="Travel illustration" 
            className="w-full h-full object-contain"
            style={{ opacity: 0.85 }}
          />
        </div>
        
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[80%] h-auto z-[1] md:hidden">
          <img 
            src="/illustration.png" 
            alt="Travel illustration" 
            className="w-full h-full object-contain"
            style={{ opacity: 0.25 }}
          />
        </div>
        
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-300/40 rounded-full blur-[120px] z-[0]" />
        <div className="absolute bottom-[-10%] right-[50%] w-[400px] h-[400px] bg-purple-300/40 rounded-full blur-[100px] z-[0]" />
      </div>

      {floatingElements.map((elem) => (
        <FloatingElement 
          key={elem.name}
          icon={elem.icon}
          position={elem.position}
          size={elem.size}
          delay={elem.delay}
          duration={elem.duration}
        />
      ))}

      <div className="relative z-10 container-custom py-8 lg:py-12">
        <div className="text-center max-w-4xl mx-auto mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 backdrop-blur-sm border border-violet-200 text-violet-700 text-sm font-medium mb-4 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600" />
            </span>
            Trusted by 100,000+ Travelers Worldwide
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-2 lg:mb-3 leading-tight">
            Get Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
              Visa Approved
            </span>{' '}
            in Record Time
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-4 leading-relaxed px-4">
            Apply for tourist, business, or transit visa online. 
            <span className="text-violet-600 font-semibold"> Fast approval in 24-72 hours</span> with 99.9% success rate.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-violet-500/25 mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            24-72 Hours Processing
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <EnhancedSearchForm countries={countries} />
        </div>

        <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mt-4 lg:mt-6">
          {[
            { label: '99.9% Approval', icon: '✓' },
            { label: 'Secure & Encrypted', icon: '🔒' },
            { label: '24/7 Support', icon: '💬' },
            { label: 'Fast Processing', icon: '⚡' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-slate-700 text-sm font-medium">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-sm">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 rounded-full border-2 border-violet-300 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-violet-400 rounded-full animate-pulse" />
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


function PopularDestinations({ destinations }: { destinations: any[] }) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `From $${price}`;
  };

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

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.length > 0 ? destinations.slice(0, 10).map((dest: any, index: number) => (
            <Link
              key={dest.id}
              href={`/visa-search?to=${dest.toCountry?.code}`}
              className="group relative overflow-hidden rounded-2xl h-72 bg-white border border-slate-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30"></div>
              
              <div className="relative h-full p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <img 
                    src={`https://flagcdn.com/w80/${dest.toCountry?.code?.toLowerCase()}.png`}
                    alt={dest.toCountry?.name}
                    className="w-12 h-8 object-cover rounded shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="px-3 py-1.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                    {dest.visaType || 'Tourist Visa'}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                    {dest.toCountry?.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Visa Required</p>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {dest.processingTime || '24-72h'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {dest.maxStayDays || 30}d
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-slate-400 text-xs">From</p>
                      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
                        {formatPrice(Number(dest.price))}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )) : (
            <p className="text-center text-slate-500 col-span-full py-8">No popular destinations available at the moment.</p>
          )}
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


export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/countries')
        .then(r => r.json())
        .then(data => data.countries || []),
      fetch('/api/visa/destinations')
        .then(r => r.json())
        .then(data => Array.isArray(data) ? data : (data.destinations || []))
    ]).then(([countriesData, destinationsData]) => {
      setCountries(countriesData);
      setDestinations(destinationsData);
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