'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InsuranceSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orderNum = searchParams.get('order');
    if (orderNum) {
      fetch(`/api/user/insurance?orderNumber=${orderNum}`)
        .then(res => res.json())
        .then(setOrder);
    }
  }, [searchParams]);

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Insurance Purchased Successfully!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Thank you for your purchase. Your insurance has been confirmed.
          </p>

          {order && (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-left mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-semibold text-green-600 capitalize">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Insurance</p>
                  <p className="font-semibold text-slate-900">{order.insurance?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-semibold text-slate-900">${order.totalAmount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              View Dashboard
            </Link>
            <Link href="/insurance" className="px-6 py-3 border border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all">
              Buy More Insurance
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}