'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface InsuranceOrder {
  id: string;
  orderNumber: string;
  insuranceId: string;
  insurance: {
    name: string;
    description: string;
    coverage: string;
    price: string;
    currency: string;
    benefits: string;
  };
  formData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    passportNumber?: string;
    travelDate?: string;
    returnDate?: string;
    beneficiaryName?: string;
    beneficiaryRelation?: string;
  };
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  processedAt: string | null;
}

export default function UserInsurancesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<InsuranceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ firstName: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<InsuranceOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login?callback=/dashboard/insurances');
        return;
      }
      setUser(data.user);
      fetchOrders();
    } catch {
      router.push('/login?callback=/dashboard/insurances');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/user/insurance');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching insurance orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this insurance order?')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/insurance/${orderId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        setShowModal(false);
        setSelectedOrder(null);
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid' || status === 'approved') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Active
        </span>
      );
    }
    if (paymentStatus === 'failed' || status === 'failed') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Pending
      </span>
    );
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Insurances</h1>
          <p className="text-slate-600 mt-1">View and manage your travel insurance policies</p>
        </div>
        <Link
          href="/insurance"
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buy New Insurance
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Insurance Yet</h3>
          <p className="text-slate-600 mb-6">You haven't purchased any travel insurance yet.</p>
          <Link
            href="/insurance"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all"
          >
            Browse Insurance Plans
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{order.insurance?.name || 'Travel Insurance'}</h3>
                        {getStatusBadge(order.status, order.paymentStatus)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">Order #{order.orderNumber}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatPrice(order.totalAmount, order.currency)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Coverage: {order.insurance?.coverage || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                    >
                      View Details
                    </button>
                    {order.paymentStatus === 'paid' && (
                      <Link
                        href={`/dashboard/invoices?type=insurance&order=${order.orderNumber}`}
                        className="px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        View Invoice
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Insurance Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedOrder.insurance?.name}</h3>
                  <p className="text-sm text-slate-500">Order #{selectedOrder.orderNumber}</p>
                </div>
                {getStatusBadge(selectedOrder.status, selectedOrder.paymentStatus)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Coverage</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.insurance?.coverage}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
                  <p className="font-semibold text-slate-900">{formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Purchase Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Valid From</p>
                  <p className="font-semibold text-slate-900">
                    {selectedOrder.formData?.travelDate ? formatDate(selectedOrder.formData.travelDate) : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedOrder.insurance?.benefits && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Benefits Included</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedOrder.insurance.benefits.split('|').map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Traveler Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">
                      {selectedOrder.formData?.firstName} {selectedOrder.formData?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{selectedOrder.formData?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{selectedOrder.formData?.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Passport Number</p>
                    <p className="font-medium text-slate-900">{selectedOrder.formData?.passportNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Travel Date</p>
                    <p className="font-medium text-slate-900">
                      {selectedOrder.formData?.travelDate ? formatDate(selectedOrder.formData.travelDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Return Date</p>
                    <p className="font-medium text-slate-900">
                      {selectedOrder.formData?.returnDate ? formatDate(selectedOrder.formData.returnDate) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Beneficiary</p>
                    <p className="font-medium text-slate-900">
                      {selectedOrder.formData?.beneficiaryName} ({selectedOrder.formData?.beneficiaryRelation})
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              {selectedOrder.paymentStatus === 'paid' ? (
                <button
                  onClick={() => handleDelete(selectedOrder.id)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Cancel Insurance'}
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}