'use client';

import { useState } from 'react';

interface ApplicationStatus {
  applicationNumber?: string;
  status?: string;
  paymentStatus?: string;
  error?: string;
}

export default function TrackPage() {
  const [appId, setAppId] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-violet-600 bg-violet-50 border-violet-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-12 h-12 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
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
                        {getStatusIcon(status.status || '')}
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
    </main>
  );
}
