'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown';
  const reason = searchParams.get('reason');
  const appNumber = searchParams.get('app');

  const errorMessages: Record<string, { title: string; message: string }> = {
    no_order: {
      title: 'Order Not Found',
      message: 'We could not locate your payment order. Please try again or contact support.',
    },
    app_not_found: {
      title: 'Application Not Found',
      message: 'The visa application associated with this payment could not be found.',
    },
    server_error: {
      title: 'Server Error',
      message: 'An unexpected error occurred. Please try again later.',
    },
    payment_cancelled: {
      title: 'Payment Cancelled',
      message: 'The payment was cancelled. You can retry the payment below.',
    },
    gateway_timeout: {
      title: 'Gateway Timeout',
      message: 'The payment gateway did not respond in time. Please try again.',
    },
    insufficient_funds: {
      title: 'Insufficient Funds',
      message: 'Your account does not have sufficient funds. Please use another payment method.',
    },
    card_declined: {
      title: 'Card Declined',
      message: 'Your payment card was declined. Please try a different card.',
    },
    unknown: {
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again or contact support.',
    },
  };

  const errorInfo = errorMessages[error] || errorMessages.unknown;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-2xl" />
          
          <div className="relative p-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-xl shadow-red-500/30">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">{errorInfo.title}</h1>
            <p className="text-slate-600 mb-6">{errorInfo.message}</p>

            {reason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Reason:</span> {decodeURIComponent(reason)}
                </p>
              </div>
            )}

            {appNumber && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-500 mb-1">Application Number</p>
                <p className="text-lg font-semibold text-slate-800">{appNumber}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {appNumber && (
                <Link
                  href={`/apply/${appNumber}`}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-green-600 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Payment
                </Link>
              )}
              
              <Link
                href="/support"
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Get Help
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Need assistance?{' '}
                <a href="mailto:support@evisatraveler.com" className="text-purple-600 hover:underline">
                  support@evisatraveler.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Secure payment powered by Bank Alfalah
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}