'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Country } from '@/types';

interface CountrySelectorProps {
  countries: Country[];
}

export function CountrySelector({ countries }: CountrySelectorProps) {
  const router = useRouter();
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSearch = () => {
    if (!fromCountry || !toCountry) return;
    setIsLoading(true);
    router.push(`/visa/${fromCountry}-to-${toCountry}`);
  };

  const handleSwap = () => {
    const temp = fromCountry;
    setFromCountry(toCountry);
    setToCountry(temp);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
          {/* From Country */}
          <div className={cn(
            "flex-1 w-full relative transition-all duration-300",
            focused === 'from' && "transform scale-[1.02]"
          )}>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">I am from</label>
            <div className="relative">
              <select
                value={fromCountry}
                onChange={(e) => setFromCountry(e.target.value)}
                onFocus={() => setFocused('from')}
                onBlur={() => setFocused(null)}
                className={cn(
                  "w-full h-16 md:h-20 rounded-2xl appearance-none bg-slate-800/50 border-2 px-5 text-lg font-medium transition-all duration-300 cursor-pointer",
                  "focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                  fromCountry ? "border-blue-500 text-white" : "border-slate-600/50 text-slate-400",
                  focused === 'from' && "border-blue-500 ring-4 ring-blue-500/30"
                )}
              >
                <option value="" className="bg-slate-800">Select country...</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.code} className="bg-slate-800">
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl z-10"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* To Country */}
          <div className={cn(
            "flex-1 w-full relative transition-all duration-300",
            focused === 'to' && "transform scale-[1.02]"
          )}>
            <label className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">Traveling to</label>
            <div className="relative">
              <select
                value={toCountry}
                onChange={(e) => setToCountry(e.target.value)}
                onFocus={() => setFocused('to')}
                onBlur={() => setFocused(null)}
                className={cn(
                  "w-full h-16 md:h-20 rounded-2xl appearance-none bg-slate-800/50 border-2 px-5 text-lg font-medium transition-all duration-300 cursor-pointer",
                  "focus:outline-none focus:ring-4 focus:ring-blue-500/30",
                  toCountry ? "border-purple-500 text-white" : "border-slate-600/50 text-slate-400",
                  focused === 'to' && "border-purple-500 ring-4 ring-purple-500/30"
                )}
              >
                <option value="" className="bg-slate-800">Select destination...</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.code} className="bg-slate-800">
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={!fromCountry || !toCountry || isLoading}
            className={cn(
              "w-full md:w-auto h-16 md:h-20 px-8 md:px-12 rounded-2xl font-bold text-lg transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              "text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
              isLoading && "animate-pulse"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden md:inline">Searching...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden md:inline">Search Visa</span>
                <span className="md:hidden">Search</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}