'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f3ff 0%, #fff 100%)',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '450px',
            width: '100%',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{width: '40px', height: '40px', color: '#ef4444'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px'}}>
              Something went wrong!
            </h1>
            <p style={{color: '#64748b', marginBottom: '24px'}}>
              We&apos;re sorry, but something unexpected happened.
            </p>

            <button
              onClick={() => reset()}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Try again
            </button>
            
            <a
              href="/"
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 24px',
                background: '#f1f5f9',
                color: '#475569',
                fontWeight: '500',
                borderRadius: '12px',
                textDecoration: 'none'
              }}
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
