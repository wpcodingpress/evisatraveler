'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface PaymentParams {
  applicationId: string;
  applicationNumber: string;
  amount: string;
  amountUSD: string;
  transactionReferenceNumber: string;
  merchantId: string;
  storeId: string;
  merchantUsername: string;
  merchantPassword: string;
  merchantHash: string;
  key1: string;
  key2: string;
  returnUrl: string;
  handshakeUrl: string;
  ssoUrl: string;
  channelId: string;
  isRedirectionRequest: string;
  transactionTypeId: string;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('applicationId') || searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentParams, setPaymentParams] = useState<PaymentParams | null>(null);

  useEffect(() => {
    async function initPayment() {
      if (!applicationId) {
        setError('Missing application ID');
        setLoading(false);
        return;
      }
      
      try {
        // Get params from API (no Bank Alfalah connection)
        const res = await fetch(`/api/payment/params?applicationId=${applicationId}`);
        const data = await res.json();
        
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to get payment parameters');
        }
        
        setPaymentParams(data);
        console.log('Got payment params:', data);
        setLoading(false);
        
        // Start client-side payment flow
        await startClientSidePayment(data);
        
      } catch (err: any) {
        console.error('Payment error:', err);
        setError(err.message || 'Failed to initialize payment');
        setLoading(false);
      }
    }
    
    initPayment();
  }, [applicationId]);

  async function startClientSidePayment(paymentParams: PaymentParams) {
    try {
      setProcessing(true);
      
      // Create encryption function
      const encryptData = async (data: string, key1: string, key2: string): Promise<string> => {
        const key = key1.slice(0, 16);
        const iv = key2.slice(0, 16);
        
        try {
          const keyBuffer = new TextEncoder().encode(key.slice(0, 16));
          const ivBuffer = new TextEncoder().encode(iv.slice(0, 16));
          
          const cryptoKey = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-CBC' }, false, ['encrypt']);
          const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: ivBuffer }, cryptoKey, new TextEncoder().encode(data));
          
          const binary = String.fromCharCode(...new Uint8Array(encrypted));
          return btoa(binary);
        } catch {
          return btoa(data);
        }
      };

      // Generate hash
      const generateHash = async (params: Record<string, string>, key1: string, key2: string): Promise<string> => {
        const sortedKeys = Object.keys(params).sort();
        const mapString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
        return encryptData(mapString, key1, key2);
      };

      // Step 1: Prepare handshake parameters
      const handshakeParams: Record<string, string> = {
        HS_ChannelId: paymentParams.channelId,
        HS_IsRedirectionRequest: paymentParams.isRedirectionRequest,
        HS_MerchantHash: paymentParams.merchantHash,
        HS_MerchantId: paymentParams.merchantId,
        HS_MerchantPassword: paymentParams.merchantPassword,
        HS_MerchantUsername: paymentParams.merchantUsername,
        HS_ReturnURL: paymentParams.returnUrl,
        HS_StoreId: paymentParams.storeId,
        HS_TransactionReferenceNumber: paymentParams.transactionReferenceNumber,
      };
      
      // Generate and add hash
      handshakeParams.HS_RequestHash = await generateHash(handshakeParams, paymentParams.key1, paymentParams.key2);
      
      console.log('Starting client-side handshake...');
      
      // Step 2: Post to Bank Alfalah from browser
      const formData = new URLSearchParams();
      Object.entries(handshakeParams).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const response = await fetch(paymentParams.handshakeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      
      const result = await response.json();
      console.log('Handshake result:', result);
      
      if (!result.success || !result.AuthToken) {
        throw new Error(result.ErrorMessage || 'Payment initialization failed');
      }
      
      const authToken = result.AuthToken;
      console.log('Got AuthToken, starting SSO...');
      
      // Step 3: Create and submit SSO form
      const ssoParams = new URLSearchParams();
      ssoParams.append('AuthToken', authToken);
      ssoParams.append('ChannelId', paymentParams.channelId);
      ssoParams.append('Currency', 'PKR');
      ssoParams.append('ReturnURL', paymentParams.returnUrl);
      ssoParams.append('MerchantId', paymentParams.merchantId);
      ssoParams.append('StoreId', paymentParams.storeId);
      ssoParams.append('MerchantHash', paymentParams.merchantHash);
      ssoParams.append('MerchantUsername', paymentParams.merchantUsername);
      ssoParams.append('MerchantPassword', paymentParams.merchantPassword);
      ssoParams.append('TransactionTypeId', paymentParams.transactionTypeId);
      ssoParams.append('TransactionReferenceNumber', paymentParams.transactionReferenceNumber);
      ssoParams.append('TransactionAmount', paymentParams.amount);
      
      // Create hidden form and submit
      const ssoForm = document.createElement('form');
      ssoForm.method = 'POST';
      ssoForm.action = paymentParams.ssoUrl;
      
      for (const [key, value] of ssoParams.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        ssoForm.appendChild(input);
      }
      
      document.body.appendChild(ssoForm);
      ssoForm.submit();
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white">Loading payment...</p>
        </div>
      </div>
    );
  }

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
          <Link href="/" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700">
            Go Home
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

            {paymentParams && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Application</span>
                  <span className="font-semibold text-slate-800">{paymentParams.applicationNumber}</span>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-600 to-green-500 rounded-xl p-4 mb-6 text-white text-center">
              <p className="text-sm opacity-90 mb-1">Amount to Pay</p>
              {paymentParams && (
                <>
                  <p className="text-3xl font-bold">PKR {parseInt(paymentParams.amount).toLocaleString()}</p>
                  <p className="text-sm opacity-75 mt-1">(${paymentParams.amountUSD} USD)</p>
                </>
              )}
            </div>

            {processing ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-600">Connecting to payment gateway...</p>
              </div>
            ) : null}

            <div className="flex items-center gap-3 mb-6 text-sm text-slate-500">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.388-5.168 9-9.998 9-1.133 0-2.145-.255-2.965-.81a11.955 11.955 0 01-1.635-.81V4.999z" clipRule="evenodd" />
              </svg>
              <span>Secured by Bank Alfalah</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}