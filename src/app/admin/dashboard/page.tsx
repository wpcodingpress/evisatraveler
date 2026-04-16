'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-violet-100 text-violet-700',
  rejected: 'bg-red-100 text-red-700',
};

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers: number;
  totalCountries: number;
  visaRulesCount: number;
  totalRevenue: number;
  approvalRate: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setStats(data.stats);
        setRecentApps(data.recentApplications || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
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
        <button onClick={() => window.location.reload()} className="mt-4 text-violet-600 hover:text-violet-700">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Applications', value: stats.totalApplications, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending Review', value: stats.pendingApplications, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Approved', value: stats.approvedApplications, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-emerald-500 to-teal-600' },
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-blue-500 to-indigo-600' },
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
        </div>
        <Link href="/admin/applications" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30 text-sm lg:text-base">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          View Applications
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mb-4`}>
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-xs lg:text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Application Status</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Approved</span>
                <span className="font-semibold text-slate-900">{stats.approvalRate}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${stats.approvalRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Pending</span>
                <span className="font-semibold text-slate-900">{stats.totalApplications > 0 ? Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${stats.totalApplications > 0 ? (stats.pendingApplications / stats.totalApplications) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Rejected</span>
                <span className="font-semibold text-slate-900">{stats.totalApplications > 0 ? Math.round((stats.rejectedApplications / stats.totalApplications) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${stats.totalApplications > 0 ? (stats.rejectedApplications / stats.totalApplications) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Countries</p>
                <p className="text-lg font-bold text-slate-900">{stats.totalCountries}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-2xl font-bold text-violet-700">{stats.totalUsers}</p>
              <p className="text-sm text-violet-600">Total Users</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-2xl font-bold text-violet-700">{stats.visaRulesCount}</p>
              <p className="text-sm text-violet-600">Visa Rules</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-2xl font-bold text-violet-700">{stats.totalCountries}</p>
              <p className="text-sm text-violet-600">Countries</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-xl">
              <p className="text-2xl font-bold text-violet-700">{stats.totalApplications}</p>
              <p className="text-sm text-violet-600">Applications</p>
            </div>
          </div>
        </div>
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
                  <th className="px-4 lg:px-6 py-3-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs lg:text-sm">
                          {app.user.firstName[0]}{app.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm lg:text-base">{app.user.firstName} {app.user.lastName}</p>
                          <p className="text-xs text-slate-500">{app.applicationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-slate-600 text-sm hidden sm:table-cell">{app.visaRule.toCountry.name}</td>
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