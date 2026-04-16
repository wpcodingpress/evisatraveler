'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: any;
  createdAt: string;
  visaRule: {
    toCountry: { name: string; flag: string };
    visaType: string;
  };
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'processing': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Welcome back! <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text">Dashboard</span>
          </h1>
          <p className="text-slate-600">Manage your visa applications from one place</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/apply/cl7s9k3i20001" className="group">
            <div className="relative bg-white rounded-2xl p-6 border border-violet-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">New Application</h3>
                  <p className="text-sm text-slate-600">Start your visa journey</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/track" className="group">
            <div className="relative bg-white rounded-2xl p-6 border border-violet-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Track Application</h3>
                  <p className="text-sm text-slate-600">Check your status</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/support" className="group">
            <div className="relative bg-white rounded-2xl p-6 border border-violet-100 hover:shadow-xl hover:border-violet-200 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Get Support</h3>
                  <p className="text-sm text-slate-600">Contact our team</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="relative bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
          <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl" />
          <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
          
          <div className="relative">
            <div className="p-6 border-b border-violet-100">
              <h2 className="text-xl font-bold text-slate-900">Your Applications</h2>
            </div>
            
            <div className="p-6">
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
                  <Link href="/apply/cl7s9k3i20001" className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700 transition-colors">
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
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Application</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Destination</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Payment</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id} className="border-b border-violet-50 hover:bg-violet-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-medium text-slate-900">{app.applicationNumber}</p>
                            <p className="text-sm text-slate-500">{app.visaRule?.visaType}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span>{app.visaRule?.toCountry?.flag} {app.visaRule?.toCountry?.name}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(app.paymentStatus)}`}>
                              {app.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {new Date(app.createdAt).toLocaleDateString()}
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
      </div>
    </main>
  );
}
