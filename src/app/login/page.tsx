'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callback') || '/dashboard';
  const from = searchParams.get('from');
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if already logged in
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          // Already logged in - redirect
          if (callbackUrl && callbackUrl !== '/dashboard') {
            router.push(callbackUrl);
          } else {
            router.push('/dashboard');
          }
        }
      }
    } catch {
      // Not logged in
    }
  };

  // Build display message based on where user came from
  useEffect(() => {
    if (from) {
      const fromLabels: Record<string, string> = {
        'apply': 'Complete your visa application',
        'visa': 'Continue to visa details',
        'track': 'Track your application',
      };
      if (fromLabels[from]) {
        setError(fromLabels[from]);
      }
    }
  }, [from]);

  // Handle successful registration message
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setError('Account created! Please log in to continue.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        // Force page reload to update header instantly
        if (callbackUrl && callbackUrl !== '/dashboard' && callbackUrl !== '/login') {
          window.location.href = callbackUrl;
        } else {
          window.location.href = data.user.role === 'admin' ? '/pro-console' : '/dashboard';
        }
      }
    } catch {
      setError('An error occurred');
    }
    setLoading(false);
  };

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Welcome Back</h1>
            <p className="text-slate-600">Sign in to manage your visa applications</p>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-violet-100">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500" />
                    Remember me
                  </label>
                  <a href="/forgot-password" className="text-violet-600 font-medium hover:text-violet-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group py-3.5 rounded-xl text-white font-semibold overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 group-hover:from-violet-500 group-hover:to-purple-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                  <span className="relative">{loading ? 'Signing in...' : 'Sign In'}</span>
                </button>
                
                <p className="text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                    Sign up free
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
