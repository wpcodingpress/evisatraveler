'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CurrencySelector } from '@/components/CurrencySelector';

function NavLink({ href, children, isActive, icon }: { href: string; children: React.ReactNode; isActive: boolean; icon?: string }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
        isActive
          ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
          : 'text-slate-700 hover:text-violet-600 hover:bg-violet-50 border border-transparent hover:border-violet-200'
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </Link>
  );
}

// User Menu for logged in users
function UserMenu({ user, onLogout, pendingApps = 0,  }: { 
  user: { firstName: string; email: string }; 
  onLogout: () => void; 
  pendingApps?: number;
  }) {
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
          <div className="fixed inset-0 z-[35]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[40]">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="font-semibold text-slate-900">{user.firstName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            {pendingApps > 0 && (
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-50 text-amber-700" onClick={() => setIsOpen(false)}>
                <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                Finish {pendingApps} Application{pendingApps > 1 ? 's' : ''}
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

            <Link href="/support" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50" onClick={() => setIsOpen(false)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Get Support
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50" onClick={() => setIsOpen(false)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Profile Settings
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
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/visa', label: 'All Destinations', icon: '🌍' },
    { href: '/track', label: 'Track Visa', icon: '📋' },
    { href: '/support', label: 'Help Center', icon: '💬' },
  ];

  return (
    <>
      {navItems.map((item) => (
        <NavLink key={item.href} href={item.href} isActive={pathname === item.href} icon={item.icon}>
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

function MobileMenuButton({ user, onLogout }: { user: { firstName: string; email: string } | null; onLogout?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) onLogout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/visa', label: 'All Destinations', icon: '🌍' },
    { href: '/track', label: 'Track Visa', icon: '📋' },
    { href: '/support', label: 'Help Center', icon: '💬' },
  ];

  const userMenuItems = [
    { href: '/dashboard', label: 'My Dashboard', icon: '📊' },
    { href: '/dashboard/applications', label: 'My Applications', icon: '📄' },
    { href: '/support', label: 'Get Support', icon: '💬' },
    { href: '/dashboard/profile', label: 'Profile Settings', icon: '⚙️' },
  ];

  return (
    <div className="lg:hidden isolate">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[99999] p-3 bg-white rounded-xl shadow-lg text-slate-700 hover:text-violet-600 hover:shadow-xl transition-all"
        style={{ willChange: 'transform' }}
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 relative">
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[99998]"
            style={{ willChange: 'opacity' }}
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white z-[99999] shadow-2xl overflow-y-auto" style={{ willChange: 'transform' }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                {user ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-900 text-sm">{user.firstName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <span className="font-bold text-slate-900">Menu</span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {user && showUserMenu && (
                <div className="mb-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <nav className="space-y-1">
                    {userMenuItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                            isActive
                              ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
                              : 'text-slate-700 hover:text-violet-600 hover:bg-violet-100'
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 mt-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3.5 text-base font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                        isActive
                          ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25'
                          : 'text-slate-700 hover:text-violet-600 hover:bg-violet-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                {user ? (
                  <button
                    onClick={() => { setShowUserMenu(!showUserMenu); }}
                    className="block w-full px-5 py-3.5 text-center text-sm font-semibold text-slate-700 hover:text-violet-600 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Account
                    <svg className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-5 py-3.5 text-center text-sm font-semibold text-slate-700 hover:text-violet-600 border border-slate-200 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-5 py-3.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function Header() {
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingApps, setPendingApps] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
 
   const [showUserMenu, setShowUserMenu] = useState(false);

   useEffect(() => {
    checkAuth();
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
      const res = await fetch('/api/applications/start');
      if (res.ok) {
        const data = await res.json();
        setPendingApps(data.count || 0);
      }
    } catch {
      setPendingApps(0);
    }
  };

  // Poll for pending apps every 30 seconds when logged in
  useEffect(() => {
    if (user) {
      checkPendingApps();
      fetchNotifications();
      const appInterval = setInterval(checkPendingApps, 30000);
      const notifInterval = setInterval(fetchNotifications, 10000);
      return () => {
        clearInterval(appInterval);
        clearInterval(notifInterval);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?unread=true');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
   };

   const handleLogout = () => {
    setUser(null);
    setPendingApps(0);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-[30] backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-sm isolate">
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
            <CurrencySelector />
            {loading ? (
              <div className="w-20 h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <>
                <UserMenu 
                  user={user} 
                  onLogout={handleLogout} 
                  pendingApps={pendingApps > 0 ? pendingApps : 0}
                />
              </>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-violet-600 transition-colors hidden sm:block">
                  Log In
                </Link>
                <Link href="/register" className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 rounded-xl hover:from-violet-500 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] hidden sm:block">
                  Sign Up Free
                </Link>
                {/* Mobile Auth Buttons */}
                <div className="flex sm:hidden items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-xs font-semibold text-slate-700">
                    Log In
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="container-custom py-12 lg:py-16">
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
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:sheikhshoaibahmed81@gmail.com" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                sheikhshoaibahmed81@gmail.com
              </a>
              <a href="tel:+923009685072" className="flex items-center gap-3 text-sm text-slate-300 hover:text-white transition-colors">
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 016.112 6.112l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                </svg>
                +92 300 968 5072
              </a>
            </div>
          </div>

          {/* Visa Services */}
          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Visa Services</h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li><a href="/visa" className="hover:text-white transition-colors">Tourist Visa</a></li>
              <li><a href="/visa" className="hover:text-white transition-colors">Business Visa</a></li>
              <li><a href="/visa" className="hover:text-white transition-colors">Transit Visa</a></li>
              <li><a href="/visa" className="hover:text-white transition-colors">Student Visa</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Quick Links</h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Support</h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li><a href="/support" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="/track" className="hover:text-white transition-colors">Track Application</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
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
