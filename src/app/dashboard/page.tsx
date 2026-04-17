'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface IncompleteApp {
  visaRuleId: string;
  startedAt: string;
  step: number;
  callbackUrl?: string;
  travelers?: number;
  processing?: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: any;
  createdAt: string;
  visaRule?: {
    toCountry?: { name: string; flag: string };
    visaType?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);
  const [incompleteApps, setIncompleteApps] = useState<IncompleteApp[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incomplete' | 'all'>('incomplete');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login?callback=/dashboard');
        return;
      }
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login?callback=/dashboard');
        return;
      }
      setUser(data.user);
      loadData();
    } catch {
      router.push('/login?callback=/dashboard');
    }
  };

  const loadData = async () => {
    try {
      // Load incomplete apps from cookie-based tracking
      const incompleteRes = await fetch('/api/applications/start');
      const incompleteData = await incompleteRes.json();
      setIncompleteApps(incompleteData.incomplete || []);
    } catch {
      setIncompleteApps([]);
    }

    try {
      // Load submitted applications
      const appsRes = await fetch('/api/applications');
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch {
      setApplications([]);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'processing': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const clearIncomplete = async (visaRuleId: string) => {
    try {
      await fetch('/api/applications/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visaRuleId }),
      });
      setIncompleteApps(prev => prev.filter(app => app.visaRuleId !== visaRuleId));
    } catch {
      // Ignore
    }
  };

  const totalIncomplete = incompleteApps.length;
  const totalApplications = applications.length;

  if (loading) {
    return (
      <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-violet-50/30 to-white">
        <div className="container-custom">
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Welcome back, <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text">{user?.firstName || 'User'}</span>! 👋
            </h1>
            <p className="text-slate-600">Manage your visa applications in one place</p>
          </div>
          <Link 
            href="/visa" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Application
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalIncomplete}</p>
                <p className="text-sm text-slate-500">Incomplete</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{applications.filter(a => a.status === 'approved').length}</p>
                <p className="text-sm text-slate-500">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{applications.filter(a => a.status === 'processing').length}</p>
                <p className="text-sm text-slate-500">Processing</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalApplications}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* INCOMPLETE Applications - Most Important */}
        {totalIncomplete > 0 && (
          <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center animate-pulse">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">⚠️ Incomplete Applications</h2>
                    <p className="text-sm text-amber-700">You have applications that need to be completed</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-amber-500 text-white font-bold rounded-full">
                  {totalIncomplete} Pending
                </span>
              </div>

              <div className="space-y-3">
                {incompleteApps.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Application Step {app.step} of 4</p>
                        <p className="text-sm text-slate-500">
                          Started: {new Date(app.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link 
                        href={app.callbackUrl || '/apply/' + app.visaRuleId} 
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        Continue →
                      </Link>
                      <button 
                        onClick={() => clearIncomplete(app.visaRuleId)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Remove from incomplete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Applications Tab */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
          <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl" />
          
          <div className="relative">
            <div className="p-6 border-b border-violet-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Your Applications</h2>
              <a href="/track" className="text-sm text-violet-600 font-medium hover:text-violet-700">
                Track by ID →
              </a>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-600 mb-4">No applications yet</p>
                <Link href="/visa" className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                  Start your first application
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-violet-100">
                      <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">Application</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">Destination</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">Payment</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">Date</th>
                      <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.id} className="border-b border-violet-50 hover:bg-violet-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-900">{app.applicationNumber}</p>
                          <p className="text-sm text-slate-500">{app.visaRule?.visaType}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span>{app.visaRule?.toCountry?.flag} {app.visaRule?.toCountry?.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(app.paymentStatus)}`}>
                            {app.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <Link href={`/confirmation/${app.applicationNumber}`} className="text-violet-600 font-medium hover:text-violet-700">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}