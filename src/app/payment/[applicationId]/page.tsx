'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Application {
  id: string;
  applicationNumber: string;
  totalAmount: string;
  currency: string;
  visaRule: {
    visaType: string;
    toCountry: {
      name: string;
      flag: string;
    };
  };
}

export default function PaymentPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const amount = searchParams.get('amount');
  const amountInPKR = amount ? Math.round(parseFloat(amount) * 280) : 0;
  const amountDisplay = searchParams.get('amount');

  useEffect(() => {
    async function initPayment() {
      try {
        setProcessingPayment(true);
        
        const response = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            applicationId,
            amount: amountDisplay || '50'
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to initiate payment');
        }

        const html = await response.text();
        
        document.getElementById('payment-form-container')!.innerHTML = html;
        
        const form = document.getElementById('handshakeForm') as HTMLFormElement;
        if (form) {
          form.addEventListener('submit', (e) => {
            setProcessingPayment(true);
          });
          form.submit();
        }
      } catch (err: any) {
        setError(err.message);
        setProcessingPayment(false);
      }
    }

    if (applicationId) {
      initPayment();
    }
    
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          setApp(data);
        }
      } catch (err) {
        console.error('Failed to fetch application', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [applicationId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            href={`/apply/${applicationId}`}
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-full blur-2xl" />
          
          <div className="relative p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-1 3h1m4 0h1M5 21a5.5 5.5 0 110-10 5.5 5.5 0 010 10z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Complete Payment</h1>
              <p className="text-slate-500">Visa Application Fee</p>
            </div>

            {app && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{app.visaRule?.toCountry?.flag}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{app.visaRule?.toCountry?.name}</p>
                    <p className="text-sm text-slate-500">{app.visaRule?.visaType}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-slate-600">Application Number</span>
                  <span className="font-semibold text-slate-800">{app.applicationNumber}</span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-600 to-green-500 rounded-xl p-4 mb-6 text-white text-center">
              <p className="text-sm opacity-90 mb-1">Amount to Pay</p>
              <p className="text-3xl font-bold">PKR {amountInPKR.toLocaleString()}</p>
              <p className="text-sm opacity-75 mt-1">(${amountDisplay} USD)</p>
            </div>

            <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.388-5.168 9-9.998 9-1.133 0-2.145-.255-2.965-.81a11.955 11.955 0 01-1.635-.81V4.999z" clipRule="evenodd" />
              </svg>
              <span>Secured by Bank Alfalah</span>
            </div>

            {processingPayment ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-600">Connecting to payment gateway...</p>
              </div>
            ) : null}

            <div id="payment-form-container" className="hidden" />

            <Link
              href="/support"
              className="block text-center text-sm text-slate-500 mt-4 hover:text-purple-600"
            >
              Need help? Contact support
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Powered by Bank Alfalah Payment Gateway
        </p>
      </div>
    </div>
  );
}