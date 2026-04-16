'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CountrySearchFormProps {
  countries: { id: string; name: string; code: string; flag?: string }[];
}

export function CountrySearchForm({ countries }: CountrySearchFormProps) {
  const router = useRouter();
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);

  const handleSearch = () => {
    if (fromCountry && toCountry) {
      router.push(`/visa/${fromCountry}-to-${toCountry}`);
    }
  };

  const selectedFrom = countries.find(c => c.code === fromCountry);
  const selectedTo = countries.find(c => c.code === toCountry);

  return (
    <div className="relative">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* From Country */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">I am from</label>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'from' ? null : 'from')}
              className="w-full h-16 md:h-20 flex items-center gap-3 bg-slate-900/60 border-2 rounded-2xl px-5 text-left transition-all duration-300 hover:border-indigo-500 focus:outline-none"
              style={{ borderColor: activeDropdown === 'from' ? '#6366f1' : 'rgba(99, 102, 241, 0.3)' }}
            >
              {selectedFrom ? (
                <>
                  <span className="text-3xl">{selectedFrom.flag}</span>
                  <span className="text-white font-medium text-lg">{selectedFrom.name}</span>
                </>
              ) : (
                <span className="text-slate-400 text-lg">Select nationality...</span>
              )}
              <svg className="w-5 h-5 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeDropdown === 'from' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl max-h-72 overflow-y-auto z-50 shadow-2xl">
                {countries.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setFromCountry(c.code); setActiveDropdown(null); }}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-indigo-600/30 transition-colors text-left"
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-white text-lg">{c.name}</span>
                    <span className="text-slate-400 ml-auto text-sm">{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={() => { const temp = fromCountry; setFromCountry(toCountry); setToCountry(temp); }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-indigo-600 to-pink-600 flex items-center justify-center transform hover:scale-110 hover:rotate-180 transition-all duration-300 shadow-lg hover:shadow-indigo-500/40 z-10"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* To Country */}
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Traveling to</label>
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'to' ? null : 'to')}
              className="w-full h-16 md:h-20 flex items-center gap-3 bg-slate-900/60 border-2 rounded-2xl px-5 text-left transition-all duration-300 hover:border-pink-500 focus:outline-none"
              style={{ borderColor: activeDropdown === 'to' ? '#ec4899' : 'rgba(236, 72, 153, 0.3)' }}
            >
              {selectedTo ? (
                <>
                  <span className="text-3xl">{selectedTo.flag}</span>
                  <span className="text-white font-medium text-lg">{selectedTo.name}</span>
                </>
              ) : (
                <span className="text-slate-400 text-lg">Select destination...</span>
              )}
              <svg className="w-5 h-5 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeDropdown === 'to' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-pink-500/30 rounded-2xl max-h-72 overflow-y-auto z-50 shadow-2xl">
                {countries.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setToCountry(c.code); setActiveDropdown(null); }}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-pink-600/30 transition-colors text-left"
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <span className="text-white text-lg">{c.name}</span>
                    <span className="text-slate-400 ml-auto text-sm">{c.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={!fromCountry || !toCountry}
            className="w-full md:w-auto h-16 md:h-20 px-8 md:px-12 rounded-2xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:inline">Check Visa Requirements</span>
            <span className="md:hidden">Check Visa</span>
          </button>
        </div>
      </div>
    </div>
  );
}