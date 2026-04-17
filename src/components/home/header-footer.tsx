'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
        isActive
          ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
          : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'
      }`}
    >
      {children}
    </Link>
  );
}

// User Menu for logged in users
function UserMenu({ user, onLogout, pendingApps = 0 }: { user: { firstName: string; email: string }; onLogout: () => void; pendingApps?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-violet-50 transition-colors"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          {pendingApps > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">{pendingApps}</span>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden xl:block">{user.firstName}</span>
        <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="font-semibold text-slate-900">{user.firstName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            {pendingApps > 0 && (
              <Link href="/dashboard/applications" className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-50 text-amber-700" onClick={() => setIsOpen(false)}>
                <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                {pendingApps} Incomplete Application{pendingApps > 1 ? 's' : ''}
              </Link>
            )}
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50" onClick={() => setIsOpen(false)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-2 2l-2-2m2 2l2 2" /></svg>
              My Dashboard
            </Link>
            <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50" onClick={() => setIsOpen(false)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              My Applications
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50" onClick={() => setIsOpen(false)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              My Profile
            </Link>
            <div className="border-t border-slate-100 mt-2 pt-2">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NavLinks() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/visa', label: 'Visa Types' },
    { href: '/track', label: 'Track' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <>
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href} isActive={pathname === item.href}>
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/visa', label: 'Visa Types' },
    { href: '/track', label: 'Track' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors z-50"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 relative">
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : '-translate-y-2'}`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'translate-y-2'}`}
          />
        </div>
      </button>

      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-40 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-slate-900">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3.5 text-base font-medium rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
                      : 'text-slate-600 hover:text-violet-600 hover:bg-violet-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
            <Link
              href="/login"
              className="block w-full px-5 py-3.5 text-center text-sm font-semibold text-slate-700 hover:text-violet-600 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="block w-full px-5 py-3.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingApps, setPendingApps] = useState(0);

  useEffect(() => {
    checkAuth();
    
    // Check pending applications every 30 seconds
    const interval = setInterval(checkPendingApps, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        checkPendingApps();
      }
    } catch (error) {
      console.log('Auth check failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPendingApps = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/applications?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingApps(data.length || 0);
      }
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPendingApps(0);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              >
                <defs>
                  <linearGradient id="logoGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <filter id="glowHeader">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="10"
                  fill="url(#logoGradientHeader)"
                  filter="url(#glowHeader)"
                  className="transition-all duration-300"
                />
                
                <path
                  d="M16 30V18L24 14L32 18V30L24 34L16 30Z"
                  fill="white"
                  opacity="0.9"
                />
                
                <path
                  d="M24 14V34"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.7"
                />
                
                <path
                  d="M16 18L32 30"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.5"
                />
                
                <circle
                  cx="24"
                  cy="24"
                  r="3"
                  fill="white"
                />
              </svg>
              
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
            </div>
            
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                e<span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Visa</span>Traveler
              </span>
              <span className="text-[10px] lg:text-xs text-slate-500 hidden sm:block tracking-wide group-hover:text-violet-600 transition-colors duration-300">
                Global Visa Solutions
              </span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLinks />
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <UserMenu user={user} onLogout={handleLogout} pendingApps={pendingApps} />
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-violet-600 transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl hover:from-violet-500 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton />
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="container-custom py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="group flex items-center gap-3 mb-6">
              <div className="relative">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                >
                  <defs>
                    <linearGradient id="logoGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                  
                  <rect
                    x="4"
                    y="4"
                    width="40"
                    height="40"
                    rx="10"
                    fill="url(#logoGradientFooter)"
                  />
                  
                  <path
                    d="M16 30V18L24 14L32 18V30L24 34L16 30Z"
                    fill="white"
                    opacity="0.9"
                  />
                  
                  <path
                    d="M24 14V34"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                  
                  <circle cx="24" cy="24" r="3" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-bold">eVisaTraveler</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
              Your trusted partner for fast and secure visa applications worldwide. Serving travelers since 2020.
            </p>
            <div className="flex gap-4">
              {[
                { name: 'facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                { name: 'twitter', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                { name: 'instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
              ].map((social) => (
                <a key={social.name} href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Services</h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li><a href="/visa/tourist" className="hover:text-white transition-colors">Tourist Visa</a></li>
              <li><a href="/visa/business" className="hover:text-white transition-colors">Business Visa</a></li>
              <li><a href="/visa/transit" className="hover:text-white transition-colors">Transit Visa</a></li>
              <li><a href="/visa/student" className="hover:text-white transition-colors">Student Visa</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Company</h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/press" className="hover:text-white transition-colors">Press</a></li>
              <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Support</h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li><a href="/support" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-14 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">&copy; 2026 eVisaTraveler. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
