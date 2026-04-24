'use client';

import { useEffect, useState } from 'react';

interface PaymentParams {
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
  channelIdApi: string;
}

/**
 * Bank Alfalah Payment Page
 * 
 * Implementation per official documentation:
 * 1. POST to /HS/HS/HS (handshake) - get AuthToken
 * 2. POST to /SSO/SSO/SSO (SSO) - get payment page
 * 3. Redirect to payment page
 */

async function encryptHash(data: string, key1: string, key2: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = encoder.encode(key1.slice(0, 16));
  const iv = encoder.encode(key2.slice(0, 16));
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'AES-CBC' }, false, ['encrypt']
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv }, cryptoKey, encoder.encode(data)
  );
  
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

function PaymentPage({ params: pageParams }: { params: { applicationId: string } }) {
  const appId = pageParams?.applicationId;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PaymentParams | null>(null);
  const [stage, setStage] = useState<'init' | 'handshake' | 'sso' | 'done'>('init');
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Step 1: Load payment params from API
  useEffect(() => {
    if (!appId) {
      setError('Missing application ID');
      setLoading(false);
      return;
    }
    
    fetch(`/api/payment/params?applicationId=${appId}`)
      .then(res => res.json())
       .then(data => {
           if (data.error) {
             setError(data.error);
           } else {
             setParams(data);
             setStage('handshake');
           }
           setLoading(false);
         })
      .catch(err => {
        console.error('Load error:', err);
        setError('Failed to load payment');
        setLoading(false);
      });
  }, [appId]);

  // Step 2: Handshake - POST to /HS/HS/HS to get AuthToken
  useEffect(() => {
    if (!params || stage !== 'handshake' || !params.handshakeUrl) return;
    
    (async () => {
      try {
        const p = params;
        
        // Build map string with ALL parameters, sorted alphabetically
        // Use ChannelId for Page Redirection (Alfa Wallet, Card, Account)
        const mapString = [
          `HS_ChannelId=${p.channelId}`,
          `HS_IsRedirectionRequest=1`,
          `HS_MerchantHash=${p.merchantHash}`,
          `HS_MerchantId=${p.merchantId}`,
          `HS_MerchantPassword=${p.merchantPassword}`,
          `HS_MerchantUsername=${p.merchantUsername}`,
          `HS_ReturnURL=${p.returnUrl}`,
          `HS_StoreId=${p.storeId}`,
          `HS_TransactionReferenceNumber=${p.transactionReferenceNumber}`,
        ].sort().join('&');
        
        console.log('Map string:', mapString);
        
        // Encrypt to create RequestHash
        const requestHash = await encryptHash(mapString, p.key1, p.key2);
        console.log('Request hash:', requestHash);
        
        // Create form data with ChannelId=1001 (Page Redirection)
        const formData = new URLSearchParams();
        formData.append('HS_ChannelId', '1001');
        formData.append('HS_MerchantId', p.merchantId);
        formData.append('HS_StoreId', p.storeId);
        formData.append('HS_ReturnURL', p.returnUrl);
        formData.append('HS_MerchantHash', p.merchantHash);
        formData.append('HS_MerchantUsername', p.merchantUsername);
        formData.append('HS_MerchantPassword', p.merchantPassword);
        formData.append('HS_TransactionReferenceNumber', p.transactionReferenceNumber);
        formData.append('HS_RequestHash', requestHash);
        formData.append('HS_IsRedirectionRequest', '1');
        
        // POST to handshake URL (official: payments.bankalfalah.com/HS/HS/HS)
        const response = await fetch(p.handshakeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
        
        const responseText = await response.text();
        console.log('Handshake response:', responseText);
        
        // Parse AuthToken from JSON response
        try {
          const json = JSON.parse(responseText);
          if (json.success === 'true' || json.success === true) {
            setAuthToken(json.AuthToken || json.authToken);
            setStage('sso');
          } else {
            throw new Error(json.ErrorMessage || json.errorMessage || 'Handshake failed');
          }
        } catch (e) {
          // Try regex for token
          const match = responseText.match(/AuthToken["\s]*[:=]["\s]*(["'])([\w+/=-]+)\1/);
          if (match) {
            setAuthToken(match[2]);
            setStage('sso');
          } else {
            throw new Error(responseText.substring(0, 100));
          }
        }
      } catch (err: any) {
        console.error('Handshake error:', err);
        setError(err.message || 'Failed to connect to payment gateway');
      }
    })();
  }, [params, stage]);

  // Step 3: SSO - POST to /SSO/SSO/SSO with AuthToken
  useEffect(() => {
    if (stage !== 'sso' || !authToken || !params) return;
    
    (async () => {
      try {
        const p = params;
        
        // Build SSO map string with HS_ prefix, sorted alphabetically
        const ssoMapString = [
          `HS_AuthToken=${authToken}`,
          `HS_ChannelId=${p.channelId}`,
          `HS_Currency=PKR`,
          `HS_MerchantHash=${p.merchantHash}`,
          `HS_MerchantId=${p.merchantId}`,
          `HS_MerchantPassword=${p.merchantPassword}`,
          `HS_MerchantUsername=${p.merchantUsername}`,
          `HS_ReturnURL=${p.returnUrl}`,
          `HS_StoreId=${p.storeId}`,
          `HS_TransactionAmount=${p.amount}`,
          `HS_TransactionReferenceNumber=${p.transactionReferenceNumber}`,
          `HS_TransactionTypeId=3`,
        ].sort().join('&');
        
        console.log('SSO Map string:', ssoMapString);
        
        // Encrypt SSO request hash
        const ssoRequestHash = await encryptHash(ssoMapString, p.key1, p.key2);
        
        // Create SSO form data with HS_ prefix
        const ssoFormData = new URLSearchParams();
        ssoFormData.append('HS_AuthToken', authToken);
        ssoFormData.append('HS_ChannelId', p.channelId);
        ssoFormData.append('HS_Currency', 'PKR');
        ssoFormData.append('HS_ReturnURL', p.returnUrl);
        ssoFormData.append('HS_MerchantId', p.merchantId);
        ssoFormData.append('HS_StoreId', p.storeId);
        ssoFormData.append('HS_MerchantHash', p.merchantHash);
        ssoFormData.append('HS_MerchantUsername', p.merchantUsername);
        ssoFormData.append('HS_MerchantPassword', p.merchantPassword);
        ssoFormData.append('HS_TransactionTypeId', '3');
        ssoFormData.append('HS_TransactionReferenceNumber', p.transactionReferenceNumber);
        ssoFormData.append('HS_TransactionAmount', p.amount);
        ssoFormData.append('HS_RequestHash', ssoRequestHash);
        
        // POST to SSO URL (official: payments.bankalfalah.com/SSO/SSO/SSO)
        // According to docs, this returns the payment page HTML
        const ssoResponse = await fetch(p.ssoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: ssoFormData.toString(),
        });
        
        const ssoText = await ssoResponse.text();
        console.log('SSO response length:', ssoText.length);
        
        // SSO response is HTML - replace current page with it
        // This will show Bank Alfalah payment page
        document.open();
        document.write(ssoText);
        document.close();
        
        setStage('done');
      } catch (err: any) {
        console.error('SSO error:', err);
        setError(err.message || 'Failed to redirect to payment');
      }
    })();
  }, [stage, authToken, params]);

  // Loading state
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading payment...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.error}>
        <h2>Payment Error</h2>
        <p>{error}</p>
        <a href="/" style={styles.btn}>Go Home</a>
      </div>
    );
  }

  // Main payment UI
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Complete Payment</h1>
        <p style={styles.subtitle}>Visa Application Fee</p>
        
        {params && (
          <>
            <div style={styles.infoRow}>
              <span>Application</span>
              <b>{params.applicationNumber}</b>
            </div>
            
            <div style={styles.amountBox}>
              <small>Amount to Pay</small>
              <b>PKR {parseInt(params.amount || '0').toLocaleString()}</b>
              <span>(${params.amountUSD} USD)</span>
            </div>
          </>
        )}
        
        <div style={styles.status}>
          <div style={styles.spinner}></div>
          <p>
            {stage === 'init' && 'Loading...'}
            {stage === 'handshake' && 'Connecting to Bank Alfalah...'}
            {stage === 'sso' && 'Redirecting to payment...'}
            {stage === 'done' && 'Opening payment page...'}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  loading: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
  },
  error: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
  },
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '2rem',
    maxWidth: '450px',
    width: '100%',
    color: '#333',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    marginBottom: '24px',
  },
  infoRow: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  amountBox: {
    background: 'linear-gradient(to right, #9333ea, #22c55e)',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'center',
    color: 'white',
    marginBottom: '16px',
  },
  status: {
    textAlign: 'center',
    padding: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    margin: '0 auto 16px',
    border: '4px solid #9333ea',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  btn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#9333ea',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    marginTop: '16px',
  },
};

export default PaymentPage;