'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: any;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
  visaRule?: {
    toCountry?: { name: string; flag: string };
    fromCountry?: { name: string; flag: string };
    visaType?: string;
    processingTime?: string;
  };
}

interface IncompleteApp {
  visaRuleId: string;
  startedAt: string;
  step: number;
  callbackUrl?: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const [incompleteApps, setIncompleteApps] = useState<IncompleteApp[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'pending' | 'processing' | 'approved'>('all');
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; isRead: boolean; createdAt: string }>>([]);

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
      const incompleteRes = await fetch('/api/applications/start');
      const incompleteData = await incompleteRes.json();
      setIncompleteApps(incompleteData.incomplete || []);
    } catch {
      setIncompleteApps([]);
    }

    try {
      const appsRes = await fetch('/api/applications');
      const appsData = await appsRes.json();
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch {
      setApplications([]);
    }

    try {
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      setNotifications(notifData.notifications || []);
    } catch {
      setNotifications([]);
    }

    setLoading(false);
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

  const downloadInvoice = async (appNumber: string) => {
    try {
      const res = await fetch(`/api/applications/${appNumber}/invoice`, { credentials: 'include' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${appNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download invoice');
      }
    } catch (error) {
      console.error('Invoice download failed:', error);
      alert('Failed to download invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'processing': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'incomplete') return incompleteApps.some(ia => ia.visaRuleId === app.id);
    return app.status === filter;
  });

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
        <div className="mb-8">
          <Link href="/dashboard" className="text-violet-600 hover:text-violet-700 text-sm mb-2 inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Applications
          </h1>
          <p className="text-slate-600">View and manage all your visa applications</p>
        </div>

        {/* Incomplete Banner */}
        {incompleteApps.length > 0 && (
          <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h2 className="font-bold text-amber-800">Incomplete Applications</h2>
              </div>
              <span className="px-3 py-1 bg-amber-500 text-white font-bold rounded-full">{incompleteApps.length}</span>
            </div>
            <div className="space-y-2">
              {incompleteApps.map((app, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">Step {app.step} of 4</p>
                      <p className="text-sm text-slate-500">Started: {new Date(app.startedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={app.callbackUrl || '/visa'} 
                      className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600"
                    >
                      Continue →
                    </Link>
                    <button 
                      onClick={() => clearIncomplete(app.visaRuleId)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Banner */}
        {notifications.filter(n => !n.isRead).length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-violet-600 rounded-full animate-pulse"></span>
              <h3 className="font-bold text-violet-900">Recent Updates</h3>
              <span className="ml-auto px-2 py-0.5 bg-violet-600 text-white text-xs rounded-full">
                {notifications.filter(n => !n.isRead).length} new
              </span>
            </div>
            <div className="space-y-2">
              {notifications.filter(n => !n.isRead).slice(0, 3).map(notif => (
                <div key={notif.id} className="bg-white rounded-lg p-3 text-sm">
                  <p className="font-medium text-slate-900">{notif.title}</p>
                  <p className="text-slate-600">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'incomplete', 'pending', 'processing', 'approved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === f 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-violet-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-4">No applications found</p>
              <Link href="/visa" className="text-violet-600 font-semibold hover:text-violet-700">
                Apply for a new visa →
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Application ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Payment</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app, index) => (
                  <tr key={index} className="border-b border-slate-50 hover:bg-violet-50/30">
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900">{app.applicationNumber}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {app.visaRule?.visaType || 'Visa Application'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(app.paymentStatus)}`}>
                        {app.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => downloadInvoice(app.applicationNumber)}
                          className="text-emerald-600 font-medium hover:text-emerald-700 text-sm whitespace-nowrap flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Invoice
                        </button>
                        <Link href={`/confirmation/${app.applicationNumber}`} className="text-violet-600 font-medium hover:text-violet-700 text-sm whitespace-nowrap">
                          View Details →
                        </Link>
                        {app.status === 'pending' && (
                          <button 
                            onClick={() => deleteApplication(app.id)}
                            className="text-red-600 font-medium hover:text-red-700 text-sm whitespace-nowrap"
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
          )}
        </div>
      </div>
    </main>
  );
}