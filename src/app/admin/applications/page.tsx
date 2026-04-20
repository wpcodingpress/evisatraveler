'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  visaRule: { 
    visaType: string;
    toCountry: { name: string; code: string; flag: string };
    fromCountry: { name: string; code: string };
  };
}

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  processing: 'bg-violet-100 text-violet-700',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '50');
      
      const res = await fetch(`/api/admin/applications?${params}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch');
      }
      const data = await res.json();
      setApplications(data.applications || []);
      setStats(data.stats || {});
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, processedAt: new Date().toISOString() }),
      });
      
      if (res.ok) {
        setApplications(applications.map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-14 bg-slate-200 rounded-xl" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-200 rounded-xl flex-1" />)}
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const total = stats.pending + stats.processing + stats.approved + stats.rejected || applications.length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchApplications} className="text-sm font-medium underline">Try again</button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-600 mt-1">Manage visa applications</p>
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-bold text-slate-900">{total}</span> applications
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border-2 transition-all ${statusFilter === 'all' ? 'bg-slate-100 text-slate-700 border-slate-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-sm font-medium">All</p>
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border-2 transition-all ${statusFilter === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <p className="text-2xl font-bold">{stats.pending || 0}</p>
          <p className="text-sm font-medium">Pending</p>
        </button>
        <button
          onClick={() => setStatusFilter('processing')}
          className={`p-4 rounded-xl border-2 transition-all ${statusFilter === 'processing' ? 'bg-violet-50 text-violet-700 border-violet-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <p className="text-2xl font-bold">{stats.processing || 0}</p>
          <p className="text-sm font-medium">Processing</p>
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-xl border-2 transition-all ${statusFilter === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <p className="text-2xl font-bold">{stats.approved || 0}</p>
          <p className="text-sm font-medium">Approved</p>
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`p-4 rounded-xl border-2 transition-all ${statusFilter === 'rejected' ? 'bg-red-50 text-red-700 border-red-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <p className="text-2xl font-bold">{stats.rejected || 0}</p>
          <p className="text-sm font-medium">Rejected</p>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or application number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {app.user.firstName[0]}{app.user.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{app.user.firstName} {app.user.lastName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{app.applicationNumber} • {app.user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <div className="text-right">
                  <p className="text-sm text-slate-500">{app.visaRule?.visaType || 'Visa'}</p>
                  <p className="font-semibold text-slate-900">{app.visaRule?.toCountry?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-bold text-lg text-slate-900">${Number(app.totalAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium text-slate-900">{formatDate(app.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 text-lg">No applications found</p>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedApp.user.firstName[0]}{selectedApp.user.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedApp.user.firstName} {selectedApp.user.lastName}</h3>
                  <p className="text-slate-500">{selectedApp.user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Application No.</p>
                  <p className="font-semibold text-slate-900">{selectedApp.applicationNumber}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedApp.createdAt)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Visa Type</p>
                  <p className="font-semibold text-slate-900">{selectedApp.visaRule?.visaType || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Destination</p>
                  <p className="font-semibold text-slate-900">{selectedApp.visaRule?.toCountry?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Amount Paid</p>
                    <p className="text-2xl font-bold text-slate-900">${Number(selectedApp.totalAmount)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusColors[selectedApp.status] || 'bg-slate-100 text-slate-700'}`}>
                    {selectedApp.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelectedApp(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all">
                Process Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}