'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VisaRule } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface VisaDetailsClientProps {
  visaRules: VisaRule[];
  slug: string;
}

export function VisaDetailsClient({ visaRules, slug }: VisaDetailsClientProps) {
  const router = useRouter();
  const [selectedVisa, setSelectedVisa] = useState<VisaRule | null>(visaRules[0] || null);

  if (!selectedVisa) return null;

  const handleApply = () => {
    router.push(`/apply/${selectedVisa.id}`);
  };

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
              <div className="relative">
                <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-green-50/50">
                  <div className="flex items-center gap-4">
                    <img 
                      src={`https://flagcdn.com/w80/${selectedVisa.toCountry.code.toLowerCase()}.png`}
                      alt={selectedVisa.toCountry.name}
                      className="w-16 h-12 object-cover rounded-lg shadow"
                    />
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {selectedVisa.visaType} Visa - {selectedVisa.toCountry.name}
                      </h1>
                      <p className="text-slate-600">
                        Traveling from <img src={`https://flagcdn.com/w20/${selectedVisa.fromCountry.code.toLowerCase()}.png`} alt="" className="inline w-4 h-3" /> {selectedVisa.fromCountry.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50/50 to-green-50/50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-slate-500 mb-1">Processing Time</p>
                      <p className="text-lg font-bold text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">{selectedVisa.processingTime}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50/50 to-green-50/50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-slate-500 mb-1">Maximum Stay</p>
                      <p className="text-lg font-bold text-slate-900">{selectedVisa.maxStayDays} days</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50/50 to-green-50/50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-slate-500 mb-1">Visa Validity</p>
                      <p className="text-lg font-bold text-slate-900">{selectedVisa.validityDays} days</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50/50 to-green-50/50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-slate-500 mb-1">Entry Type</p>
                      <p className="text-lg font-bold text-slate-900">{selectedVisa.entryType}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Visa Requirements</h3>
                    <ul className="space-y-3">
                      {(Array.isArray(selectedVisa.requirements) 
                        ? selectedVisa.requirements.map((req: any, i: number) => 
                            typeof req === 'string' 
                              ? { id: String(i), text: req, required: true }
                              : req
                          )
                        : []
                      ).map((req: any) => (
                        <li key={req.id} className="flex items-start gap-3">
                          {req.required ? (
                            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </div>
                          )}
                          <span className={req.required ? 'text-slate-700' : 'text-slate-400'}>
                            {typeof req === 'string' ? req : (req.text || req.name || '')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Documents Required</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(selectedVisa.documents as { id: string; name: string; description?: string; required: boolean }[]).map((doc) => (
                        <div key={doc.id} className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50/30 to-green-50/30 rounded-xl border border-purple-100">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">
                              {doc.name}
                              {doc.required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                            {doc.description && <p className="text-sm text-slate-500">{doc.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedVisa.additionalInfo && (
                    <div className="bg-gradient-to-br from-purple-100/50 to-green-100/50 rounded-xl p-4 border border-purple-200">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Additional Information
                      </h4>
                      <p className="text-slate-700">{selectedVisa.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden sticky top-24">
              <div className="absolute -top-3 -right-3 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
              <div className="relative">
                <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-green-50/50">
                  <h2 className="text-xl font-bold text-slate-900">Apply Now</h2>
                  <p className="text-slate-600">Complete your application in minutes</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">{formatCurrency(selectedVisa.price)}</span>
                    <span className="text-slate-500">per person</span>
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Fast {selectedVisa.processingDays}-day processing</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">100% online application</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Secure payment</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">Digital visa delivery</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 border-t border-purple-100 space-y-3">
                  <button onClick={handleApply} className="w-full relative group py-4 rounded-xl text-white font-bold text-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 group-hover:from-purple-500 group-hover:to-green-400 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                    <span className="relative flex items-center justify-center gap-2">
                      Apply Now
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                  <p className="text-xs text-center text-slate-500">
                    By applying, you agree to our <a href="/terms" className="text-purple-600 hover:underline">Terms</a> and <a href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
