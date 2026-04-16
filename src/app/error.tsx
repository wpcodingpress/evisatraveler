'use client';

import { useEffect, useState } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h1>
          <p className="text-slate-600 mb-6">
            We&apos;re sorry, but something unexpected happened. Please try again.
          </p>

          {error?.message && showDetails && (
            <div className="mb-6 p-4 bg-slate-100 rounded-xl text-left">
              <p className="text-sm text-slate-600 font-mono break-all">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30"
            >
              Try again
            </button>
            
            <a
              href="/"
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all"
            >
              Go to Homepage
            </a>

            {error?.message && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                {showDetails ? 'Hide' : 'Show'} error details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
