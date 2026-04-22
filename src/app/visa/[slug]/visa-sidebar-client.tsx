'use client';

import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

interface VisaData {
  id: string;
  visaType: string;
  price: number;
  toCountry: { name: string; flag?: string };
  fromCountry: { name: string; flag?: string };
}

interface VisaSidebarProps {
  visaData: VisaData;
}

export function VisaSidebar({ visaData }: VisaSidebarProps) {
  const { formatPrice } = useCurrency();
  
  return (
    <div className="sticky top-24 space-y-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <h3 className="text-xl font-bold mb-1">{visaData.visaType}</h3>
          <p className="text-violet-100 text-sm">{visaData.toCountry.name} • {visaData.fromCountry.name}</p>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Visa Type</label>
            <div className="space-y-2">
              <button type="button" className="w-full p-3 rounded-xl border-2 font-semibold text-sm transition-all text-left border-violet-500 bg-violet-50 text-violet-700">
                <span className="block">{visaData.visaType}</span>
                <span className="text-xs opacity-75">From {formatPrice(visaData.price)}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Visa Fee × 1</span>
              <span className="font-semibold text-slate-900">{formatPrice(visaData.price)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-600">Service Fee</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-violet-600">{formatPrice(visaData.price)}</span>
            </div>
          </div>

          <Link href={`/apply/${visaData.id}`} className="block w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl text-center">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}