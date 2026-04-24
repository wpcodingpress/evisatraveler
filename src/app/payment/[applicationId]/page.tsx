'use client';

import { useEffect, useState } from 'react';

interface PaymentParams {
  applicationNumber: string;
  amount: string;
  amountUSD: string;
  transactionReferenceNumber: string;
}

function PaymentPage({ params: pageParams }: { params: { applicationId: string } }) {
  const appId = pageParams?.applicationId;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PaymentParams | null>(null);

  // Step 1: Load payment params from API
  useEffect(() => {
    if (!appId) {
      setError('Missing application ID');
      setLoading(false);
      return;
    }
    
    fetch(`/api/payment/params?applicationId=${appId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error('API error response:', text.substring(0, 200));
          throw new Error(`API returned ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error('API returned non-JSON response');
        }
        return res.json();
      })
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setParams(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load error:', err);
        setError('Failed to load payment: ' + err.message);
        setLoading(false);
      });
  }, [appId]);

  // Step 2: Call /api/payment/initiate to get Bank Alfalah payment page HTML
  useEffect(() => {
    if (!params || !appId) return;
    
    (async () => {
      try {
        const amount = parseInt(params.amount || '0') / 280; // Convert PKR to USD
        
        console.log('Calling /api/payment/initiate...');
        
        const response = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: appId,
            amount: amount,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Initiate API error:', text);
          throw new Error(`Initiate failed: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        
        // If JSON response (error or redirect)
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          if (data.url) {
            // Redirect to return URL
            window.location.href = data.url;
            return;
          }
          throw new Error(data.error || 'Initiate failed');
        }

        // HTML response - payment page HTML from Bank Alfalah
        const html = await response.text();
        console.log('Received payment page HTML, length:', html.length);
        
        if (html.length < 100) {
          throw new Error('Received empty or invalid HTML response');
        }

        // Write HTML to document to show Bank Alfalah payment page
        document.open();
        document.write(html);
        document.close();
      } catch (err: any) {
        console.error('Payment initiate error:', err);
        setError(err.message || 'Failed to connect to payment gateway');
      }
    })();
  }, [params, appId]);

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

  // Main payment UI (shown briefly before redirect)
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
          <p>Connecting to Bank Alfalah...</p>
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
