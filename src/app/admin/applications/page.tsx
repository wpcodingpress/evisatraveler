'use client';

import { useState, useEffect } from 'react';

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  notes: string | null;
  formData: Record<string, any>;
  user: { 
    firstName: string; 
    lastName: string; 
    email: string;
    phone?: string;
    role?: string;
    createdAt?: string;
  } | null;
  visaRule: { 
    visaType: string;
    processingTime: string;
    processingDays: number;
    maxStayDays: number;
    validityDays: number;
    entryType: string;
    price: number;
    currency: string;
    toCountry: { name: string; code: string; flag: string };
    fromCountry: { name: string; code: string; flag: string };
  } | null;
  documents: Array<{
    id: string;
    type: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }>;
}

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  approved: 'Approved',
  completed: 'Completed',
  rejected: 'Rejected',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      
      const res = await fetch(`/api/admin/applications?${params}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch');
      }
      const data = await res.json();
      setApplications(data.applications || []);
      setStats(data.stats || {});
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setChangingStatus(id);
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, processedAt: new Date().toISOString() }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setApplications(applications.map(app =>
          app.id === id ? { ...app, status: newStatus, updatedAt: updated.updatedAt, processedAt: updated.processedAt } : app
        ));
        if (selectedApp?.id === id) {
          setSelectedApp({ ...selectedApp, status: newStatus, updatedAt: updated.updatedAt, processedAt: updated.processedAt });
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setChangingStatus(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/applications?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setApplications(applications.filter(app => app.id !== id));
        if (selectedApp?.id === id) {
          setSelectedApp(null);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Failed to delete application', err);
      alert('Failed to delete application');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && applications.length === 0) {
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
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-xl border-2 transition-all ${statusFilter === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <p className="text-2xl font-bold">{stats.completed || 0}</p>
          <p className="text-sm font-medium">Completed</p>
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
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
                  {(app.user?.firstName?.[0] || '?')}{(app.user?.lastName?.[0] || '')}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">
                      {app.user?.firstName || 'Unknown'} {app.user?.lastName || 'User'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{app.applicationNumber || 'N/A'} • {app.user?.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <div className="text-right">
                  <p className="text-sm text-slate-500">{app.visaRule?.visaType || 'Visa'}</p>
                  <p className="font-semibold text-slate-900">{app.visaRule?.toCountry?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-bold text-lg text-slate-900">${Number(app.totalAmount || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium text-slate-900">{formatDate(app.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`appearance-none px-4 py-2 pr-8 text-sm font-semibold rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 ${statusColors[app.status] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value} className="bg-white text-slate-900">{label}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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

      {applications.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 text-lg">No applications found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* User Info Section */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {(selectedApp.user?.firstName?.[0] || '?')}{(selectedApp.user?.lastName?.[0] || '')}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {selectedApp.user?.firstName || 'Unknown'} {selectedApp.user?.lastName || 'User'}
                  </h3>
                  <p className="text-slate-500">{selectedApp.user?.email || 'No email'}</p>
                  {selectedApp.user?.phone && <p className="text-slate-500">{selectedApp.user.phone}</p>}
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Application No.</p>
                  <p className="font-semibold text-slate-900">{selectedApp.applicationNumber || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Submitted Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedApp.createdAt)}</p>
                </div>
                {selectedApp.processedAt && (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Processed Date</p>
                    <p className="font-semibold text-slate-900">{formatDate(selectedApp.processedAt)}</p>
                  </div>
                )}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Visa Type</p>
                  <p className="font-semibold text-slate-900">{selectedApp.visaRule?.visaType || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Destination</p>
                  <p className="font-semibold text-slate-900">{selectedApp.visaRule?.toCountry?.flag} {selectedApp.visaRule?.toCountry?.name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">From Country</p>
                  <p className="font-semibold text-slate-900">{selectedApp.visaRule?.fromCountry?.flag} {selectedApp.visaRule?.fromCountry?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Full Form Data Section */}
              {selectedApp.formData && Object.keys(selectedApp.formData).length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Applicant Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedApp.formData.firstName && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">First Name</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.firstName}</p>
                      </div>
                    )}
                    {selectedApp.formData.lastName && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Last Name</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.lastName}</p>
                      </div>
                    )}
                    {selectedApp.formData.email && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Email</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.email}</p>
                      </div>
                    )}
                    {selectedApp.formData.phone && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Phone</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.phone}</p>
                      </div>
                    )}
                    {selectedApp.formData.dateOfBirth && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Date of Birth</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.dateOfBirth}</p>
                      </div>
                    )}
                    {selectedApp.formData.gender && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Gender</p>
                        <p className="font-semibold text-slate-900 capitalize">{selectedApp.formData.gender}</p>
                      </div>
                    )}
                    {selectedApp.formData.nationality && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Nationality</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.nationality}</p>
                      </div>
                    )}
                    {selectedApp.formData.passportNumber && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Passport Number</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.passportNumber}</p>
                      </div>
                    )}
                    {selectedApp.formData.passportExpiry && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Passport Expiry</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.passportExpiry}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trip Details */}
              {(selectedApp.formData.arrivalDate || selectedApp.formData.departureDate || selectedApp.formData.portOfEntry || selectedApp.formData.accommodationType) && (
                <div className="border-t pt-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Trip Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedApp.formData.arrivalDate && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Arrival Date</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.arrivalDate}</p>
                      </div>
                    )}
                    {selectedApp.formData.departureDate && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Departure Date</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.departureDate}</p>
                      </div>
                    )}
                    {selectedApp.formData.portOfEntry && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Port of Entry</p>
                        <p className="font-semibold text-slate-900 capitalize">{selectedApp.formData.portOfEntry}</p>
                      </div>
                    )}
                    {selectedApp.formData.accommodationType && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Accommodation Type</p>
                        <p className="font-semibold text-slate-900 capitalize">{selectedApp.formData.accommodationType}</p>
                      </div>
                    )}
                    {selectedApp.formData.accommodationAddress && (
                      <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                        <p className="text-xs text-slate-500 uppercase">Accommodation Address</p>
                        <p className="font-semibold text-slate-900">{selectedApp.formData.accommodationAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visa Rule Details */}
              {selectedApp.visaRule && (
                <div className="border-t pt-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Visa Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Processing Time</p>
                      <p className="font-semibold text-slate-900">{selectedApp.visaRule.processingTime || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Max Stay Days</p>
                      <p className="font-semibold text-slate-900">{selectedApp.visaRule.maxStayDays || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Validity Days</p>
                      <p className="font-semibold text-slate-900">{selectedApp.visaRule.validityDays || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Entry Type</p>
                      <p className="font-semibold text-slate-900">{selectedApp.visaRule.entryType || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase">Base Price</p>
                      <p className="font-semibold text-slate-900">${selectedApp.visaRule.price || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {selectedApp.documents && selectedApp.documents.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Uploaded Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedApp.documents.map((doc) => (
                      <div key={doc.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                            {doc.mimeType?.includes('image') ? (
                              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 capitalize">{doc.type || 'Document'}</p>
                            <p className="text-xs text-slate-500">{doc.originalName || doc.fileName}</p>
                            <p className="text-xs text-slate-400">{doc.mimeType} • {Math.round(doc.fileSize / 1024)}KB</p>
                          </div>
                        </div>
                        <a 
                          href={(doc as any).filePath || `/uploads/${selectedApp.applicationNumber}/${doc.fileName}`}
                          download={doc.originalName || doc.fileName}
                          target="_blank"
                          className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment & Status Section */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Payment & Status</h3>
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">${Number(selectedApp.totalAmount || 0)} {selectedApp.currency || 'USD'}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${statusColors[selectedApp.status] || 'bg-slate-100 text-slate-700'}`}>
                        {selectedApp.status}
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                        selectedApp.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        selectedApp.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {selectedApp.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Admin Notes</h3>
                <textarea
                  id="adminNotes"
                  defaultValue={selectedApp.notes || ''}
                  placeholder="Add notes about this application..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button 
                onClick={() => handleDelete(selectedApp.id)}
                className="px-4 py-2.5 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/applications/${selectedApp.applicationNumber}/invoice?admin=true`, { credentials: 'include' });
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `invoice-${selectedApp.applicationNumber}.pdf`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } else {
                      alert('Failed to generate invoice');
                    }
                  } catch (err) {
                    alert('Failed to generate invoice');
                  }
                }}
                className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Download Invoice
              </button>
              <button onClick={() => setSelectedApp(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button 
                onClick={async () => {
                  const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement)?.value;
                  await fetch('/api/admin/applications', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedApp.id, notes }),
                  });
                  alert('Notes saved!');
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}