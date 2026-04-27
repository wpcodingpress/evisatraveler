'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

interface Insurance {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  coverage: string;
  duration: string;
  benefits: string;
}

export default function InsurancePage() {
  const { formatPrice } = useCurrency();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsurances();
  }, []);

  const fetchInsurances = async () => {
    try {
      const res = await fetch('/api/insurance');
      const data = await res.json();
      setInsurances(data);
    } catch (error) {
      console.error('Error fetching insurances:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-violet-50/30 via-white to-purple-50/30">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
            Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">Insurance</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Protect your trip with comprehensive travel insurance. Fast, reliable coverage.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 animate-pulse">
                <div className="h-8 w-32 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 rounded mb-6 w-3/4"></div>
                <div className="h-12 w-24 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {insurances.map((insurance, index) => (
              <div
                key={insurance.id}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/20 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-purple-50/30"></div>
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      index === 2 ? 'bg-amber-100 text-amber-700' : 
                      index === 1 ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {index === 0 ? 'Basic' : index === 1 ? 'Standard' : 'Premium'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{insurance.name}</h3>
                  <p className="text-slate-600 mb-4">{insurance.description}</p>
                  
                  <div className="text-sm text-slate-500 mb-4">
                    <p>Coverage: {insurance.coverage}</p>
                    <p>Duration: {insurance.duration}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-2">Benefits:</h4>
                    <ul className="space-y-1">
                      {(() => {
                        try {
                          return JSON.parse(insurance.benefits).map((benefit: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {benefit}
                            </li>
                          ));
                        } catch {
                          return null;
                        }
                      })()}
                    </ul>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-slate-500 text-xs">Starting from</p>
                      <p className="text-3xl font-bold text-slate-900">{formatPrice(insurance.price)}</p>
                    </div>
                    <Link
                      href={`/insurance/${insurance.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Get Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PromoBranding Section */}
      <section className="mt-16 md:mt-20 lg:mt-24 py-16 lg:py-24 pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400">
                eVisa Traveler
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Experience the future of visa applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { num: '01', title: 'Apply in Minutes', desc: 'Complete your entire visa application in just 5 minutes from anywhere' },
              { num: '02', title: 'Zero Errors', desc: 'Our smart validation ensures your application is error-free' },
              { num: '03', title: 'Instant Updates', desc: 'Get real-time notifications on your visa status via SMS & email' },
              { num: '04', title: 'PDF Delivered', desc: 'Your approved visa PDF sent directly to your inbox' },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-500">
                <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent opacity-50 mb-4">
                  {feature.num}
                </div>
                <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {i === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                    {i === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {i === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17l5 5-5 5m0-5l-5 5-5-5m5 0V7" />}
                    {i === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-white font-medium">98% Success Rate</span>
              </div>
              <div className="w-px h-5 bg-white/20" />
              <div className="text-slate-300">Trusted by 50,000+ Travelers</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}