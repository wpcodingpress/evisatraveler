'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface IncompleteApp {
  visaRuleId: string;
  startedAt: string;
  step: number;
  callbackUrl?: string;
  travelers?: number;
  processing?: string;
  applicationNumber?: string;
  status?: string;
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: any;
  createdAt: string;
  visaRuleId?: string;
  formData?: any;
  currentStep?: number;
  visaRule?: {
    id?: string;
    toCountry?: { name: string; flag: string };
    visaType?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [incompleteApps, setIncompleteApps] = useState<IncompleteApp[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications'>('overview');

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
      const appsRes = await fetch('/api/applications');
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);
      
      // Only show pending/processing applications in incomplete panel
      // Once completed/approved/rejected, they disappear from incomplete list
      if (Array.isArray(appsData)) {
        const incompleteFromDB = appsData
          .filter((app: Application) => app.status === 'pending' || app.status === 'processing')
          .map((app: Application) => ({
            visaRuleId: app.visaRuleId || app.id,
            startedAt: app.createdAt,
            step: 4, // In DB means submitted
            callbackUrl: '/dashboard/applications',
            applicationNumber: app.applicationNumber,
            status: app.status,
            id: app.id,
          }));
        
        setIncompleteApps(incompleteFromDB);
      }
    } catch {
      setApplications([]);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'processing': return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const clearIncomplete = async (appId: string) => {
    try {
      await fetch('/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId }),
      });
      setIncompleteApps(prev => prev.filter(app => (app.id || app.visaRuleId) !== appId));
      setApplications(prev => prev.filter(app => app.id !== appId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete application');
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
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

  const totalIncomplete = incompleteApps.length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const processingApps = applications.filter(a => a.status === 'processing').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const total = applications.length;

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
        {/* Header */}
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

        {/* Quick Actions */}
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
                <p className="text-2xl font-bold text-slate-900">{total}</p>
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

        {/* INCOMPLETE Applications Alert */}
        {totalIncomplete > 0 && (
          <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Pending Applications</h2>
                    <p className="text-amber-100">Complete your pending applications to process them faster</p>
                  </div>
                </div>
                <span className="px-5 py-2 bg-white text-amber-600 font-bold rounded-full">
                  {totalIncomplete} Pending
                </span>
              </div>

              <div className="space-y-3">
                {incompleteApps.map((app, index) => (
                  <div key={app.id || index} className="flex items-center justify-between p-4 bg-white/95 backdrop-blur rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{app.applicationNumber || 'Application'}</p>
                        <p className="text-sm text-slate-500">
                          Status: <span className="font-semibold capitalize">{app.status}</span>
                          &nbsp;•&nbsp;
                          {new Date(app.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link 
                        href={app.callbackUrl || '/dashboard/applications'} 
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => clearIncomplete(app.id || app.visaRuleId)}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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

        {/* Stats Cards */}
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
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-sm text-slate-500">Total</p>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
              <p className="text-sm text-slate-500">Your latest visa applications</p>
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
                  {applications.slice(0, 5).map(app => (
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