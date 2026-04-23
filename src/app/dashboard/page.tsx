'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/CurrencyContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ApplicationProgress {
  id: string;
  visaRuleId: string;
  currentStep: number;
  travelers: number;
  processing: string;
  lastActivity: string;
  visaRule?: {
    id: string;
    toCountry?: { name: string; flag: string };
    fromCountry?: { name: string; flag: string };
    visaType: string;
    price?: number;
  };
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  visaRuleId?: string;
  visaRule?: {
    id?: string;
    toCountry?: { name: string; flag: string };
    fromCountry?: { name: string; flag: string };
    visaType?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [user, setUser] = useState<User | null>(null);
  const [progressList, setProgressList] = useState<ApplicationProgress[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [progressRes, appsRes] = await Promise.all([
        fetch('/api/applications/progress'),
        fetch('/api/applications'),
      ]);

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgressList(Array.isArray(progressData) ? progressData : []);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(Array.isArray(appsData) ? appsData : []);
      }
    } catch (error) {
      console.error('Load data error:', error);
    }
    setLoading(false);
  };

  const removeProgress = async (progress: ApplicationProgress) => {
    if (!confirm(`Remove "${progress.visaRule?.visaType} Visa" from your saved applications?`)) {
      return;
    }
    try {
      await fetch(`/api/applications/progress?visaRuleId=${progress.visaRuleId}`, {
        method: 'DELETE',
      });
      setProgressList(prev => prev.filter(p => p.id !== progress.id));
    } catch (error) {
      console.error('Remove progress failed:', error);
      alert('Failed to remove');
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) {
      return;
    }
    try {
      await fetch('/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId }),
      });
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStepName = (step: number) => {
    const steps = ['', 'Personal Info', 'Trip Details', 'Documents', 'Review & Pay'];
    return steps[step] || `Step ${step}`;
  };

  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const processingApps = applications.filter(a => a.status === 'processing').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const totalApps = applications.length;

  if (loading) {
    return (
      <main className="flex-1 py-8 md:py-12 bg-slate-50">
        <div className="container-custom">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8 md:py-12 bg-slate-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              Welcome back, <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text">{user?.firstName || 'User'}</span>
            </h1>
            <p className="text-slate-500">Manage your visa applications and track progress</p>
          </div>
          <Link 
            href="/visa" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/25"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Application
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/visa" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-violet-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Apply</p>
                <p className="text-sm text-slate-500">New Visa</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/applications" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-violet-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalApps}</p>
                <p className="text-sm text-slate-500">Applications</p>
              </div>
            </div>
          </Link>
          
          <Link href="/track" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-violet-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Track</p>
                <p className="text-sm text-slate-500">Check Status</p>
              </div>
            </div>
          </Link>
          
          <Link href="/dashboard/profile" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg hover:border-violet-300 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Settings</p>
                <p className="text-sm text-slate-500">Profile</p>
              </div>
            </div>
          </Link>
        </div>

        {progressList.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Saved Applications</h2>
                    <p className="text-amber-100">Continue your in-progress visa applications</p>
                  </div>
                </div>
                <span className="px-5 py-2 bg-white text-amber-600 font-bold rounded-full">
                  {progressList.length} In Progress
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressList.map((progress) => (
                  <div key={progress.id} className="flex flex-col p-4 bg-white/95 backdrop-blur rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{progress.visaRule?.toCountry?.flag}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{progress.visaRule?.visaType} Visa</p>
                          <p className="text-xs text-slate-500">{progress.visaRule?.fromCountry?.flag} → {progress.visaRule?.toCountry?.flag}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProgress(progress)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Step</span>
                        <span className="font-medium text-violet-600">{getStepName(progress.currentStep)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Travelers</span>
                        <span className="font-medium text-slate-700">{progress.travelers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Processing</span>
                        <span className="font-medium text-slate-700 capitalize">{progress.processing}</span>
                      </div>
                      <Link
                        href={`/apply/${progress.visaRuleId}?travelers=${progress.travelers}&processing=${progress.processing}`}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all text-center"
                      >
                        Continue →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendingApps}</p>
            <p className="text-sm text-slate-500">Pending</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{processingApps}</p>
            <p className="text-sm text-slate-500">Processing</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{approvedApps}</p>
            <p className="text-sm text-slate-500">Approved</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalApps}</p>
            <p className="text-sm text-slate-500">Total</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
              <p className="text-sm text-slate-500">Your submitted visa applications</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/track" className="text-sm text-violet-600 font-medium hover:text-violet-700">
                Track by ID
              </Link>
              <Link href="/dashboard/applications" className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
                View All
              </Link>
            </div>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-4">No applications yet</p>
              <Link href="/visa" className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700">
                Start your first application
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Application</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Destination</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{app.applicationNumber}</p>
                        <p className="text-sm text-slate-500">{app.visaRule?.visaType}</p>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <span className="text-slate-600">{app.visaRule?.toCountry?.flag} {app.visaRule?.toCountry?.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/confirmation/${app.applicationNumber}`} className="text-violet-600 font-medium hover:text-violet-700">
                            View
                          </Link>
                          {app.status === 'pending' && (
                            <button
                              onClick={() => deleteApplication(app.id)}
                              className="text-red-600 font-medium hover:text-red-700 text-sm"
                              title="Delete application"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}