'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Application {
  applicationNumber?: string;
  status?: string;
  paymentStatus?: string;
  error?: string;
  visaRule?: {
    toCountry?: { name: string; flag: string };
    visaType?: string;
  };
}

export default function TrackPage() {
  const router = useRouter();
  const [appId, setAppId] = useState('');
  const [status, setStatus] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const [myApps, setMyApps] = useState<Application[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          loadMyApps();
        }
      }
    } catch {
      // Not logged in
    }
  };

  const loadMyApps = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyApps(data);
      }
    } catch {
      // Ignore
    }
  };

  const handleTrack = async () => {
    if (!appId.trim()) return;
    setLoading(true);
    setStatus(null);
    
    try {
      const response = await fetch(`/api/applications?applicationNumber=${encodeURIComponent(appId)}`);
      const data = await response.json();
      setStatus(data);
    } catch {
      setStatus({ error: 'Failed to fetch application' });
    }
    setLoading(false);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-violet-600 bg-violet-50 border-violet-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Track Your <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text">Application</span>
            </h1>
            <p className="text-lg text-slate-600">Enter your application ID to check the status of your visa</p>
          </div>

          {/* Show logged-in user's applications */}
          {myApps.length > 0 && (
            <div className="mb-8 bg-white rounded-2xl shadow-lg border border-violet-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Your Recent Applications</h2>
              <div className="space-y-2">
                {myApps.slice(0, 5).map((app, i) => (
                  <button
                    key={i}
                    onClick={() => setAppId(app.applicationNumber || '')}
                    className="w-full text-left p-3 rounded-xl border border-violet-100 hover:border-violet-300 hover:bg-violet-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{app.applicationNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status || '')}`}>
                        {app.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-violet-100">
            <div className="absolute -top-3 -left-3 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Application ID (e.g., EVISA-XXXXX-XXXXX)"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="flex-1 rounded-xl border border-violet-200 px-5 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleTrack}
                  disabled={!appId.trim() || loading}
                  className="relative group px-8 py-4 rounded-xl text-white font-semibold overflow-hidden disabled:opacity-50 whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 group-hover:from-violet-500 group-hover:to-purple-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                  <span className="relative">{loading ? 'Searching...' : 'Track'}</span>
                </button>
              </div>

              {status && (
                <div className="mt-8 p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/50 rounded-xl border border-violet-100">
                  {status.error ? (
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 font-medium">{status.error}</p>
                    </div>
                  ) : status.applicationNumber ? (
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        {status.status === 'approved' ? (
                          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : status.status === 'processing' ? (
                          <svg className="w-12 h-12 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : status.status === 'rejected' ? (
                          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 pb-4 border-b border-violet-100">
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Application ID</p>
                            <p className="text-xl font-bold text-slate-900">{status.applicationNumber}</p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border ${getStatusColor(status.status || '')}`}>
                            {status.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-500 mb-1">Payment Status</p>
                            <p className={`font-semibold capitalize ${status.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                              {status.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Need help?{' '}
              <a href="/support" className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* PromoBranding Section */}
      <section className="py-20 lg:py-32 pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
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
                  {i === 0 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  {i === 1 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  {i === 2 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17l5 5-5 5m0-5l-5 5-5-5m5 0V7" /></svg>}
                  {i === 3 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-medium">98% Success Rate</span>
              </div>
              <div className="w-px h-5 bg-white/20" />
              <div className="text-slate-300">Trusted by 50,000+ Travelers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600">
        <div className="container-custom py-16 lg:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Get Your Visa?</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">Apply now and get approved in 24-72 hours. Fast, simple, and secure.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/visa" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg">Apply Now<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></Link>
            <Link href="/track" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-colors">Track Application</Link>
          </div>
        </div>
      </section>

    </main>
  );
}