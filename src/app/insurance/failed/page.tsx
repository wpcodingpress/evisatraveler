'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function InsuranceFailedPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Payment Failed
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            {message || 'There was an issue processing your payment. Please try again.'}
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/insurance" className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Try Again
            </Link>
            <Link href="/" className="px-6 py-3 border border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}