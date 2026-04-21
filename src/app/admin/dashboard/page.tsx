'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-violet-100 text-violet-700',
  completed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

interface DashboardStats {
  completedApplications: number;
  totalApplications: number;
  pendingApplications: number;
  processingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers: number;
  totalCountries: number;
  visaRulesCount: number;
  totalRevenue: number;
  paidRevenue: number;
  approvalRate: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface RecentApp {
  id: string;
  applicationNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  visaRule: { toCountry: { name: string; code: string } };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats(data.stats);
      setRecentApps(data.recentApplications || []);
      setNotifications(data.notifications || []);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !stats) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 lg:h-40 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Failed to load data'}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
          Retry
        </button>
      </div>
    );
  }

const approvedPercent = stats.totalApplications > 0 ? Math.round((stats.approvedApplications / stats.totalApplications) * 100) : 0;
  const pendingPercent = stats.totalApplications > 0 ? Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0;
  const rejectedPercent = stats.totalApplications > 0 ? Math.round((stats.rejectedApplications / stats.totalApplications) * 100) : 0;

  const statCards = [
    { label: 'Total Applications', value: stats.totalApplications, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', gradient: 'from-violet-500 to-purple-600', href: '/admin/applications' },
    { label: 'Pending Review', value: stats.pendingApplications, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-amber-500 to-orange-600', href: '/admin/applications?status=pending' },
    { label: 'Processing', value: stats.processingApplications, icon: 'M4 4v5h.582m15.582 0a2.996 2.996 0 001.393-5.131L18.43 2.318a2.996 2.996 0 00-1.931-2.75L12 2.5l-4.5 1.818a2.996 2.996 0 00-1.931 2.75L2.43 7.318A2.996 2.996 0 002.818 9.45L4.582 12', gradient: 'from-violet-500 to-indigo-600', href: '/admin/applications?status=processing' },
    { label: 'Approved', value: stats.approvedApplications, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-emerald-500 to-teal-600', href: '/admin/applications?status=approved' },
    { label: 'Rejected', value: stats.rejectedApplications, icon: 'M10 14l2 2 4-4m-5-5l4-4M3 3l18 0', gradient: 'from-red-500 to-rose-600', href: '/admin/applications?status=rejected' },
    { label: 'Revenue', value: `$${stats.paidRevenue?.toLocaleString() || 0}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', gradient: 'from-green-500 to-teal-600', href: '/admin/invoices' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
          {lastUpdate && (
            <p className="text-xs text-slate-400 mt-1">Last updated: {lastUpdate.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.582 0a2.996 2.996 0 001.393-5.131L18.43 2.318a2.996 2.996 0 00-1.931-2.75L12 2.5l-4.5 1.818a2.996 2.996 0 00-1.931 2.75L2.43 7.318A2.996 2.996 0 002.818 9.45L4.582 12" />
            </svg>
            Refresh
          </button>
          <Link href="/admin/applications" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30 text-sm lg:text-base">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            View Applications
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.href} className="block bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-violet-300 transition-all group cursor-pointer">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-xs lg:text-sm text-slate-500">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Application Status</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Approved</span>
                <span className="font-semibold text-slate-900">{approvedPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all" style={{ width: `${approvedPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Pending</span>
                <span className="font-semibold text-slate-900">{pendingPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all" style={{ width: `${pendingPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Processing</span>
                <span className="font-semibold text-slate-900">{pendingPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pendingPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Rejected</span>
                <span className="font-semibold text-slate-900">{rejectedPercent}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all" style={{ width: `${rejectedPercent}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Link href="/admin/invoices" className="hover:opacity-80 transition-opacity">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
              </Link>
              <Link href="/admin/countries" className="text-right hover:opacity-80 transition-opacity">
                <p className="text-sm text-slate-500">Countries</p>
                <p className="text-lg font-bold text-slate-900">{stats.totalCountries}</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/users" className="p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors">
              <p className="text-2xl font-bold text-violet-700">{stats.totalUsers}</p>
              <p className="text-sm text-violet-600">Total Users</p>
            </Link>
            <Link href="/admin/visa-rules" className="p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors">
              <p className="text-2xl font-bold text-violet-700">{stats.visaRulesCount}</p>
              <p className="text-sm text-violet-600">Visa Rules</p>
            </Link>
            <Link href="/admin/countries" className="p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors">
              <p className="text-2xl font-bold text-violet-700">{stats.totalCountries}</p>
              <p className="text-sm text-violet-600">Countries</p>
            </Link>
            <Link href="/admin/applications" className="p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors">
              <p className="text-2xl font-bold text-violet-700">{stats.totalApplications}</p>
              <p className="text-sm text-violet-600">Applications</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Notifications</h2>
          <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
            {notifications.filter(n => !n.isRead).length} unread
          </span>
        </div>
        {notifications.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {notifications.slice(0, 8).map((notif) => (
              <div key={notif.id} className={`px-4 lg:px-6 py-4 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-violet-50/50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full ${notif.isRead ? 'bg-slate-300' : 'bg-violet-500'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{notif.title}</p>
                    <p className="text-slate-600 text-sm truncate">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(notif.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications yet</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
          <Link href="/admin/applications" className="text-sm font-medium text-violet-600 hover:text-violet-700">View all →</Link>
        </div>
        {recentApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Visa</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs lg:text-sm">
                          {app.user.firstName?.[0]}{app.user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm lg:text-base">{app.user.firstName} {app.user.lastName}</p>
                          <p className="text-xs text-slate-500">{app.applicationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-slate-600 text-sm hidden sm:table-cell">{app.visaRule?.toCountry?.name}</td>
                    <td className="px-4 lg:px-6 py-4 text-slate-600 text-sm">{formatDate(app.createdAt)}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right font-semibold text-slate-900">${Number(app.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <p>No applications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}