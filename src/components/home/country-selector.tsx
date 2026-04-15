'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Country } from '@/types';

interface CountrySelectorProps {
  countries: Country[];
}

export function CountrySelector({ countries }: CountrySelectorProps) {
  const router = useRouter();
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!fromCountry || !toCountry) return;
    setIsLoading(true);
    router.push(`/visa/${fromCountry}-to-${toCountry}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">I am from</label>
            <select
              value={fromCountry}
              onChange={(e) => setFromCountry(e.target.value)}
              className={cn(
                'w-full h-14 md:h-16 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-lg',
                'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200',
                !fromCountry && 'text-slate-400'
              )}
            >
              <option value="">Select country...</option>
              {countries.map((country) => (
                <option key={country.id} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <div className="hidden md:block w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="md:hidden flex justify-center py-4">
              <svg className="w-8 h-8 text-blue-600 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Traveling to</label>
            <select
              value={toCountry}
              onChange={(e) => setToCountry(e.target.value)}
              className={cn(
                'w-full h-14 md:h-16 rounded-xl border-2 border-slate-200 bg-slate-50 px-4 text-lg',
                'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200',
                !toCountry && 'text-slate-400'
              )}
            >
              <option value="">Select destination...</option>
              {countries.map((country) => (
                <option key={country.id} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={!fromCountry || !toCountry || isLoading}
          className="w-full h-14 md:h-16 text-lg font-semibold mt-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching...
            </span>
          ) : (
            'Search Visa'
          )}
        </Button>
      </div>
    </div>
  );
}