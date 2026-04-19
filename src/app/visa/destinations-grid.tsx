'use client';

import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: string;
  continent: string;
  visaCount: number;
  minPrice: number;
  maxPrice: number;
  processingDays: number;
  processingTime: string;
  hasActiveVisas: boolean;
}

interface DestinationsGridProps {
  destinations: Destination[];
  from: string;
}

export default function DestinationsGrid({ destinations, from }: DestinationsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
      {destinations.map((destination) => (
        <Link
          key={destination.id}
          href={destination.hasActiveVisas && from ? `/visa/${from.toUpperCase()}-to-${destination.code}` : destination.hasActiveVisas ? `#` : '#'}
          className={`group bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border ${
            destination.hasActiveVisas 
              ? 'border-slate-200 hover:border-violet-300 hover:-translate-y-1' 
              : 'border-slate-100 opacity-75 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{destination.flag}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-violet-700">
                {destination.name}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {destination.region}, {destination.continent}
              </p>
            </div>
          </div>

          {destination.hasActiveVisas ? (
            <>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Processing:</span>
                  <span className="font-medium text-slate-700">{destination.processingTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Visa types:</span>
                  <span className="font-medium text-violet-600">{destination.visaCount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-500">From:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(destination.minPrice)}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="block w-full py-2 bg-violet-600 text-white rounded-lg font-medium text-sm text-center group-hover:bg-violet-700 transition-colors">
                  View Visa
                </span>
              </div>
            </>
          ) : (
            <div className="mt-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Coming Soon</span>
              </div>
              <Link 
                href="/contact"
                className="mt-3 block w-full py-2 border border-violet-200 text-violet-600 rounded-lg font-medium text-sm text-center hover:bg-violet-50 transition-colors"
              >
                Request Info
              </Link>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}