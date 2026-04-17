export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface VisaRule {
  id: string;
  visaType: string;
  processingTime: string;
  processingDays: number;
  price: number;
  currency: string;
  maxStayDays: number;
  validityDays: number;
  entryType: string;
  fromCountry: { name: string; code: string; flag: string };
  toCountry: { name: string; code: string; flag: string };
}

export default function VisaPage() {
  const [visaRules, setVisaRules] = useState<VisaRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVisaRules();
  }, []);

  const fetchVisaRules = async () => {
    try {
      const res = await fetch('/api/visa');
      const data = await res.json();
      setVisaRules(data.rules || []);
    } catch (err) {
      console.error('Failed to fetch visa rules', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = visaRules.filter(rule => 
    rule.toCountry?.name?.toLowerCase().includes(search.toLowerCase()) ||
    rule.fromCountry?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            All <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">Destinations</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Browse all available visa destinations. Choose your destination and apply online.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRules.length > 0 ? filteredRules.map((rule) => (
              <Link 
                key={rule.id} 
                href={`/visa/${rule.fromCountry?.code}-to-${rule.toCountry?.code}`}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-violet-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{rule.toCountry?.flag}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-700">{rule.toCountry?.name}</h3>
                    <p className="text-sm text-slate-500">{rule.fromCountry?.name} → {rule.toCountry?.name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>Visa Type:</span>
                    <span className="font-medium">{rule.visaType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing:</span>
                    <span className="font-medium">{rule.processingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Stay:</span>
                    <span className="font-medium">{rule.maxStayDays} days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-2xl font-bold text-violet-600">{formatCurrency(rule.price)}</span>
                  <span className="px-4 py-2 bg-violet-600 text-white rounded-lg font-medium text-sm group-hover:bg-violet-700">
                    View Details
                  </span>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500 text-lg">No destinations found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}