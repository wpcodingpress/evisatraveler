'use client';

import { EnhancedSearchForm } from '@/components/home/enhanced-search-form';
import Link from 'next/link';

const MOCK_COUNTRIES = [
  { id: '1', name: 'United States', code: 'US', flag: '🇺🇸' },
  { id: '2', name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  { id: '3', name: 'Canada', code: 'CA', flag: '🇨🇦' },
  { id: '4', name: 'Australia', code: 'AU', flag: '🇦🇺' },
  { id: '5', name: 'Germany', code: 'DE', flag: '🇩🇪' },
  { id: '6', name: 'France', code: 'FR', flag: '🇫🇷' },
  { id: '7', name: 'Japan', code: 'JP', flag: '🇯🇵' },
  { id: '8', name: 'South Korea', code: 'KR', flag: '🇰🇷' },
  { id: '9', name: 'UAE', code: 'AE', flag: '🇦🇪' },
  { id: '10', name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { id: '11', name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  { id: '12', name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
  { id: '13', name: 'India', code: 'IN', flag: '🇮🇳' },
  { id: '14', name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  { id: '15', name: 'Sri Lanka', code: 'LK', flag: '🇱🇰' },
  { id: '16', name: 'Malaysia', code: 'MY', flag: '🇲🇾' },
  { id: '17', name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  { id: '18', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  { id: '19', name: 'China', code: 'CN', flag: '🇨🇳' },
  { id: '20', name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
];

const POPULAR_DESTINATIONS = [
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', price: 49, time: '24-72 hours' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', price: 59, time: '3-5 days' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', price: 39, time: '24-48 hours' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', price: 0, time: 'Visa Free' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', price: 115, time: '3-5 days' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', price: 60, time: '24-48 hours' },
  { code: 'IN', name: 'India', flag: '🇮🇳', price: 50, time: '2-4 days' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', price: 35, time: '24 hours' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭', price: 30, time: '24 hours' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', price: 50, time: '2-3 days' },
];

function FloatingElement({ delay, className, children }: { delay: string; className: string; children: React.ReactNode }) {
  return (
    <div 
      className={`absolute ${className}`}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

function HeroFloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large decorative orbs */}
      <div className="absolute top-[10%] left-[5%] w-48 h-48 bg-violet-600/20 rounded-full blur-[80px] animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[10%] w-56 h-56 bg-purple-600/15 rounded-full blur-[90px] animate-pulse-glow delay-300" />
      <div className="absolute top-[40%] right-[30%] w-36 h-36 bg-fuchsia-600/12 rounded-full blur-[60px] animate-pulse-glow delay-500" />
      
      {/* Floating elements */}
      <FloatingElement delay="0s" className="top-[8%] left-[3%] animate-float-1">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
          🌍
        </div>
      </FloatingElement>

      <FloatingElement delay="1s" className="top-[15%] right-[5%] animate-float-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
          ✈️
        </div>
      </FloatingElement>

      <FloatingElement delay="2s" className="top-[55%] left-[2%] animate-float-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
          📄
        </div>
      </FloatingElement>

      <FloatingElement delay="0.5s" className="top-[35%] right-[2%] animate-float-slow">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg">
          🛂
        </div>
      </FloatingElement>

      <FloatingElement delay="1.5s" className="bottom-[15%] left-[5%] animate-float-fast">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
          🏨
        </div>
      </FloatingElement>

      <FloatingElement delay="2.5s" className="bottom-[25%] right-[3%] animate-float-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg">
          📱
        </div>
      </FloatingElement>

      <FloatingElement delay="3s" className="top-[65%] right-[10%] animate-float-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-lg shadow-md">
          ⭐
        </div>
      </FloatingElement>

      <FloatingElement delay="1.2s" className="top-[12%] left-[15%] animate-float-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-sm shadow-md">
          💫
        </div>
      </FloatingElement>

      <FloatingElement delay="2.2s" className="bottom-[10%] left-[20%] animate-float-slow">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-md">
          💼
        </div>
      </FloatingElement>

      <FloatingElement delay="0.8s" className="top-[75%] left-[8%] animate-float-fast">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-sm shadow-md">
          ✓
        </div>
      </FloatingElement>

      {/* Twinkling stars */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white rounded-full animate-twinkle"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${5 + Math.random() * 90}%`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.3 + Math.random() * 0.3,
          }}
        />
      ))}

      {/* Decorative circles */}
      <FloatingElement delay="0s" className="top-[25%] left-[8%] animate-morph">
        <div className="w-24 h-24 border border-violet-500/20" />
      </FloatingElement>

      <FloatingElement delay="1s" className="bottom-[20%] right-[15%] animate-morph">
        <div className="w-20 h-20 border border-purple-500/20" />
      </FloatingElement>
    </div>
  );
}

function StatsBar() {
  return (
    <section className="py-10 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full animate-float-slow" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full animate-float-fast" />
      </div>
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: '100K+', label: 'Happy Customers' },
            { number: '99.9%', label: 'Approval Rate' },
            { number: '180+', label: 'Countries' },
            { number: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <div key={i} className="text-white">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 tracking-tight">{stat.number}</div>
              <div className="text-white/85 font-medium text-sm sm:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
        <HeroFloatingElements />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-glow delay-300" />
          <div className="absolute top-[40%] right-[30%] w-[250px] h-[250px] bg-fuchsia-600/15 rounded-full blur-[80px] animate-pulse-glow delay-500" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative z-10 container-custom py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-white/90 text-sm font-medium mb-6 sm:mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Trusted by 50,000+ travelers worldwide
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              Get Your Visa Approved in{' '}
              <span className="inline-block px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl animate-pulse">
                24-72 Hours
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-10 sm:mb-12 leading-relaxed px-4">
              Apply for your tourist, business, or transit visa online. Fast approval in 24-72 hours with 99.9% success rate.
            </p>

            <div className="max-w-6xl mx-auto px-4">
              <EnhancedSearchForm countries={MOCK_COUNTRIES} />
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mt-10 sm:mt-12 px-4">
              {[
                { label: '99.9% Approval Rate', icon: '✓' },
                { label: 'Secure & Encrypted', icon: '🔒' },
                { label: '24/7 Support', icon: '💬' },
                { label: 'Fast Processing', icon: '⚡' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-slate-300 text-xs sm:text-sm font-medium">
                  <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/5 text-sm">{item.icon}</span>
                  <span className="hidden xs:inline">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 sm:w-8 sm:h-12 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5 sm:p-2">
            <div className="w-1.5 h-2 sm:h-2.5 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      <StatsBar />

      {/* Popular Destinations - New Design */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035c-.734.56-1.658.568-2.402 0l-1.89-1.878a1 1 0 00-1.618 1.523L8.82 12.94c.277.714.102 1.564-.392 1.899L5.86 16.22c-.494.334-.73.942-.528 1.36a1 1 0 001.196 1.196c.418-.202 1.026-.034 1.36.528l2.035 2.802c.57.783 1.165 1.06 1.899.392l2.777-2.432a1 1 0 011.523-1.618l1.89 1.89c.56.734.568 1.658 0 2.402L15.14 19.54c-.56.494-1.026.392-1.36-.392l-2.035-2.802a1 1 0 00-1.899.392L7.6 13.88c-.56-.494-.392-1.026.098-1.36l2.432-2.777a1 1 0 011.618 0l1.89 1.89c.56.733.568 1.658 0 2.401l-2.802 2.036c-.734.559-.95.69-1.618.098.277-.714.102-1.564-.392-1.899l-2.035-2.802c-.494-.559-.392-1.026.098-1.36" />
              </svg>
              Trusted by 50,000+ Travelers
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Destinations</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our most popular visa destinations. Fast processing, best prices, and hassle-free applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Thailand', flag: '🇹🇭', code: 'TH', price: 49, time: '24-72 hours', days: 30, gradient: 'from-green-500 to-emerald-600' },
              { name: 'Vietnam', flag: '🇻🇳', code: 'VN', price: 59, time: '3-5 days', days: 90, gradient: 'from-red-500 to-rose-600' },
              { name: 'UAE', flag: '🇦🇪', code: 'AE', price: 115, time: '3-5 days', days: 30, gradient: 'from-amber-500 to-orange-600' },
              { name: 'Turkey', flag: '🇹🇷', code: 'TR', price: 60, time: '24-48 hours', days: 30, gradient: 'from-red-600 to-pink-600' },
              { name: 'Singapore', flag: '🇸🇬', code: 'SG', price: 29, time: '1-2 days', days: 30, gradient: 'from-cyan-500 to-blue-600' },
              { name: 'Malaysia', flag: '🇲🇾', code: 'MY', price: 39, time: '24-48 hours', days: 30, gradient: 'from-indigo-500 to-purple-600' },
            ].map((dest) => (
              <Link 
                key={dest.code} 
                href={`/visa/US-to-${dest.code}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dest.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative p-6 min-h-[240px] flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-slate-100 group-hover:bg-white/30 transition-all`}>
                      {dest.flag}
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {dest.time}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-1">{dest.name}</h3>
                    <p className="text-sm text-slate-500 group-hover:text-white/80 mb-4">
                      Tourist Visa • {dest.days} Days Stay • Single Entry
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div>
                        <span className="text-3xl font-bold text-slate-900 group-hover:text-white">${dest.price}</span>
                        <span className="text-sm ml-1 text-slate-500 group-hover:text-white/70">/ person</span>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-violet-600 text-white hover:bg-violet-700 transition-all">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${dest.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/visa" className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-violet-200 text-violet-600 rounded-xl font-semibold hover:bg-violet-50 hover:border-violet-300 transition-all">
              View All Destinations
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-14 lg:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-5">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Get Your Visa in 3 Easy Steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
            {[
              { step: '01', title: 'Search & Select', desc: 'Choose your destination country and visa type', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', icon: '🔍' },
              { step: '02', title: 'Complete Form', desc: 'Fill out our simple online form with your details', color: 'from-purple-500 to-fuchsia-500', bg: 'bg-purple-50', icon: '📝' },
              { step: '03', title: 'Get Approved', desc: 'Receive your e-visa via email within days', color: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50', icon: '✅' },
            ].map((step, i) => (
              <div key={i} className={`${step.bg} rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">{step.icon}</div>
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${step.color} text-white mb-5 sm:mb-6 shadow-lg`}>
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-5xl sm:text-6xl font-bold text-slate-100 mb-3 sm:mb-4">{step.step}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">{step.title}</h3>
                <p className="text-slate-600 text-sm sm:text-base">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-5">Our Services</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight">Types of Visas We Offer</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-7xl mx-auto px-4">
            {[
              { title: 'Tourist Visa', desc: 'For leisure travel and vacation', price: 'From $49', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', icon: '🏖️' },
              { title: 'Business Visa', desc: 'For business meetings and work', price: 'From $99', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', icon: '💼' },
              { title: 'Transit Visa', desc: 'For passing through a country', price: 'From $29', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', icon: '✈️' },
              { title: 'Student Visa', desc: 'For academic studies', price: 'From $79', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', icon: '🎓' },
            ].map((visa, i) => (
              <div key={i} className="card p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1">
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-5">{visa.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{visa.title}</h3>
                <p className="text-slate-600 mb-4 sm:mb-5 text-sm sm:text-base">{visa.desc}</p>
                <div className="pt-4 sm:pt-5 border-t border-slate-100">
                  <span className="text-violet-600 font-bold text-base sm:text-lg">{visa.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-5">Why Choose Us</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 sm:mb-6 tracking-tight">The Smart Choice for Your Visa</h2>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { title: 'Bank-Level Security', desc: '256-bit SSL encryption', icon: '🔐' },
                  { title: 'Lightning Fast', desc: '24-72 hours processing', icon: '⚡' },
                  { title: '99.9% Approval Rate', desc: 'Expert team ensures success', icon: '🏆' },
                  { title: 'Global Coverage', desc: '180+ countries worldwide', icon: '🌍' },
                ].map((f, i) => (
                  <div key={i} className="flex gap-4 sm:gap-5">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">{f.title}</h3>
                      <p className="text-slate-600 text-sm sm:text-base">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-6 sm:-inset-8 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl blur-xl" />
              <div className="relative bg-gradient-to-br from-violet-600 via-purple-700 to-fuchsia-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl">
                <div className="bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-7 lg:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-6 sm:w-7 h-6 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-base sm:text-lg">Secure Payment</p>
                      <p className="text-violet-200 text-xs sm:text-sm">256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {['Accepted worldwide', 'Instant confirmation', 'Money-back guarantee'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-sm sm:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-5">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-5 tracking-tight">What Our Customers Say</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto px-4">
            {[
              { name: 'Sarah Johnson', location: 'New York, USA', text: 'Applied for Thailand visa and got approved in just 2 days!', rating: 5 },
              { name: 'Michael Chen', location: 'London, UK', text: 'The process was so smooth. Customer support was helpful throughout.', rating: 5 },
              { name: 'Emma Wilson', location: 'Sydney, Australia', text: 'Best visa service I have ever used. Highly recommended!', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="card p-6 sm:p-8">
                <div className="flex gap-1 mb-4 sm:mb-5">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-5 sm:mb-6 text-sm sm:text-base">"{t.text}"</p>
                <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-slate-100">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {t.name[0]}{t.name.split(' ')[1]?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm sm:text-base">{t.name}</p>
                    <p className="text-slate-500 text-xs sm:text-sm">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-violet-600/20 rounded-full blur-[100px] sm:blur-[150px] animate-pulse-glow" />
          <div className="absolute bottom-1/3 right-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-glow delay-300" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 sm:mb-6 tracking-tight px-4">Ready to Get Your Visa?</h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-10 sm:mb-12 px-4">Start your visa application today and get approved in as little as 24 hours</p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
            <Link href="/register" className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
              Apply Now - It&apos;s Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/track" className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg text-white border-2 border-white/30 hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Track Application
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
