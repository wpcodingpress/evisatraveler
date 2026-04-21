'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InvoiceApp {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  formData: Record<string, any>;
  visaRule: { 
    visaType: string;
    toCountry: { name: string; flag: string };
  } | null;
}

export default function UserInvoicesPage() {
  const [applications, setApplications] = useState<InvoiceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
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
        alert('Failed to generate invoice');
      }
    } catch (err) {
      alert('Failed to generate invoice');
    }
  };

  const filteredApps = applications.filter(app => 
    app.applicationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filteredApps.reduce((sum, app) => sum + Number(app.totalAmount), 0);
  const completedAmount = filteredApps
    .filter(app => app.status === 'completed')
    .reduce((sum, app) => sum + Number(app.totalAmount), 0);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="mb-8">
          <Link href="/dashboard" className="text-violet-600 hover:text-violet-700 text-sm mb-2 inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Invoices
          </h1>
          <p className="text-slate-600">Download and manage all your invoices</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Applications</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{filteredApps.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">${completedAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
          <input
            type="text"
            placeholder="Search by application number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Application</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Destination</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-violet-50/30">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{app.applicationNumber}</p>
                    <p className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-slate-900">{app.visaRule?.toCountry?.flag} {app.visaRule?.toCountry?.name}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">${Number(app.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      app.status === 'processing' ? 'bg-violet-100 text-violet-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => downloadInvoice(app.applicationNumber)}
                      className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No applications found</p>
              <Link href="/visa" className="text-violet-600 font-semibold hover:text-violet-700">
                Apply for a new visa →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}