'use client';

import { useState, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

interface InsuranceOrder {
  id: string;
  orderNumber: string;
  insuranceId: string;
  userId: string | null;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  insurance: {
    name: string;
    coverage: string;
    price: number;
    currency: string;
    benefits: string;
  };
  formData: any;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  processedAt: string | null;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
}

export default function AdminInsuranceOrdersPage() {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<InsuranceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, paidOrders: 0, pendingOrders: 0 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<InsuranceOrder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [filter, currentPage]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/insurance-orders?limit=1000');
      const data = await res.json();
      const allOrders = data.orders || [];
      
      const paidOrders = allOrders.filter((o: InsuranceOrder) => o.paymentStatus === 'paid');
      const totalRevenue = paidOrders.reduce((sum: number, o: InsuranceOrder) => sum + Number(o.totalAmount), 0);
      
      setStats({
        totalOrders: allOrders.length,
        totalRevenue,
        paidOrders: paidOrders.length,
        pendingOrders: allOrders.filter((o: InsuranceOrder) => o.paymentStatus === 'pending').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/insurance-orders?status=${filter}&page=${currentPage}&limit=20`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string, newPaymentStatus?: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/insurance-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          paymentStatus: newPaymentStatus,
        }),
      });

      if (res.ok) {
        fetchOrders();
        fetchStats();
        setShowModal(false);
        setSelectedOrder(null);
      } else {
        alert('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this insurance order? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/insurance-orders?id=${orderId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchOrders();
        fetchStats();
      } else {
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const openStatusModal = (order: InsuranceOrder) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const openDetailsModal = (order: InsuranceOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.insurance?.name.toLowerCase().includes(searchLower) ||
      order.user?.firstName?.toLowerCase().includes(searchLower) ||
      order.user?.lastName?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid' || status === 'approved') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>;
    }
    if (paymentStatus === 'failed' || status === 'failed') {
      return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Failed</span>;
    }
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
  };

  if (loading) {
    return (
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-200 rounded"></div>)}
          </div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Insurance Orders</h1>
        <p className="text-slate-600">Manage customer insurance purchases and track revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Policies</p>
              <p className="text-2xl font-bold text-slate-900">{stats.paidOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order#, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-xl border border-slate-200 px-4 py-2.5"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Order #</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Package</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-sm text-slate-500">{order.user?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900">{order.insurance?.name}</p>
                      <p className="text-sm text-slate-500">{order.insurance?.coverage}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{formatPrice(order.totalAmount, order.currency)}</td>
                    <td className="py-4 px-6">{getStatusBadge(order.status, order.paymentStatus)}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openDetailsModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button onClick={() => openStatusModal(order)} className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg" title="Change Status">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H6a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Update Order Status</h2>
            <p className="text-slate-600 mb-6">Order: <span className="font-semibold">{selectedOrder.orderNumber}</span></p>
            
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange(selectedOrder.id, 'approved', 'paid')}
                disabled={updating}
                className="w-full p-4 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors"
              >
                <p className="font-semibold text-green-700">Approve / Mark as Paid</p>
                <p className="text-sm text-green-600">Confirm payment and activate insurance</p>
              </button>
              
              <button
                onClick={() => handleStatusChange(selectedOrder.id, 'pending', 'pending')}
                disabled={updating}
                className="w-full p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-xl border border-yellow-200 transition-colors"
              >
                <p className="font-semibold text-yellow-700">Mark as Pending</p>
                <p className="text-sm text-yellow-600">Awaiting payment verification</p>
              </button>
              
              <button
                onClick={() => handleStatusChange(selectedOrder.id, 'failed', 'failed')}
                disabled={updating}
                className="w-full p-4 text-left bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
              >
                <p className="font-semibold text-red-700">Reject / Failed</p>
                <p className="text-sm text-red-600">Reject or mark payment as failed</p>
              </button>
            </div>
            
            <button
              onClick={() => { setShowModal(false); setSelectedOrder(null); }}
              className="w-full mt-4 px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
              <button onClick={() => { setShowDetailsModal(false); setSelectedOrder(null); }} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.orderNumber}</p>
                </div>
                {getStatusBadge(selectedOrder.status, selectedOrder.paymentStatus)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Package</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.insurance?.name}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-semibold text-slate-900">{formatPrice(selectedOrder.totalAmount, selectedOrder.currency)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Processed</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.processedAt ? formatDate(selectedOrder.processedAt) : 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.formData && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Traveler Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Full Name</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.firstName} {selectedOrder.formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Passport</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.passportNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Travel Date</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.travelDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Return Date</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.returnDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Beneficiary</p>
                      <p className="font-medium text-slate-900">{selectedOrder.formData.beneficiaryName} ({selectedOrder.formData.beneficiaryRelation})</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.insurance?.benefits && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Benefits</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedOrder.insurance.benefits.split('|').map((benefit: string, idx: number) => (
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
            </div>
          </div>
        </div>
      )}
    </main>
  );
}