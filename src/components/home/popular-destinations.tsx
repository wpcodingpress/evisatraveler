'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

interface PopularDestinationsProps {
  visaRules: any[];
}

const destinations = [
  { name: 'Thailand', flag: '🇹🇭', code: 'TH', image: 'from-green-500 to-emerald-600' },
  { name: 'Vietnam', flag: '🇻🇳', code: 'VN', image: 'from-red-500 to-rose-600' },
  { name: 'UAE', flag: '🇦🇪', code: 'AE', image: 'from-amber-500 to-orange-600' },
  { name: 'Turkey', flag: '🇹🇷', code: 'TR', image: 'from-red-600 to-pink-600' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG', image: 'from-cyan-500 to-blue-600' },
  { name: 'Malaysia', flag: '🇲🇾', code: 'MY', image: 'from-indigo-500 to-purple-600' },
];

export function PopularDestinations({ visaRules }: PopularDestinationsProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleExplore = (code: string) => {
    router.push(`/visa/US-to-${code}`);
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035c-.734.56-1.658.568-2.402 0l-1.89-1.878a1 1 0 00-1.618 1.523L8.82 12.94c.277.714.102 1.564-.392 1.899L5.86 16.22c-.494.334-.73.942-.528 1.36a1 1 0 001.196 1.196c.418-.202 1.026-.034 1.36.528l2.035 2.802c.57.783 1.165 1.06 1.899.392l2.777-2.432a1 1 0 011.523-1.618l1.878 1.89c.56.734.568 1.658 0 2.402L15.14 19.54c-.56.494-1.026.392-1.36-.392l-2.035-2.802a1 1 0 00-1.899.392L7.6 13.88c-.56-.494-.392-1.026.098-1.36l2.432-2.777a1 1 0 011.618 0l1.89 1.89c.56.733.568 1.658 0 2.401l-2.802 2.036c-.734.559-.95.69-1.618.098.277-.714.102-1.564-.392-1.899l-2.035-2.802c-.494-.559-.392-1.026.098-1.36" />
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
          {destinations.map((dest, idx) => {
            const rule = visaRules.find(r => r.toCountry?.code === dest.code);
            const isHovered = hovered === dest.code;
            
            return (
              <div
                key={dest.code}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onMouseEnter={() => setHovered(dest.code)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleExplore(dest.code)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${dest.image} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative p-6 min-h-[280px] flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-white/20 backdrop-blur-sm ${isHovered ? 'bg-white/30' : ''} transition-all`}>
                      {dest.flag}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${isHovered ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'} transition-all`}>
                      {rule?.processingTime || '3-5 Days'}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className={`text-2xl font-bold mb-1 ${isHovered ? 'text-white' : 'text-slate-900'}`}>
                      {dest.name}
                    </h3>
                    <p className={`text-sm mb-4 ${isHovered ? 'text-white/80' : 'text-slate-500'}`}>
                      Tourist Visa • {rule?.maxStayDays || 30} Days Stay • {rule?.entryType || 'Single'} Entry
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                      <div>
                        <span className={`text-3xl font-bold ${isHovered ? 'text-white' : 'text-slate-900'}`}>
                          {rule ? formatCurrency(rule.price) : '$49'}
                        </span>
                        <span className={`text-sm ml-1 ${isHovered ? 'text-white/70' : 'text-slate-500'}`}>
                          / person
                        </span>
                      </div>
                      <button className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        isHovered 
                          ? 'bg-white text-violet-600 hover:bg-white/90' 
                          : 'bg-violet-600 text-white hover:bg-violet-700'
                      }`}>
                        Apply Now
                      </button>
                    </div>
                  </div>

                  {isHovered && (
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center animate-pulse">
                      <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${dest.image} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <button 
            onClick={() => router.push('/visa')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-violet-200 text-violet-600 rounded-xl font-semibold hover:bg-violet-50 hover:border-violet-300 transition-all"
          >
            View All Destinations
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}