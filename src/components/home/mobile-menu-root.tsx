'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CurrencySelector } from '@/components/CurrencySelector';

type User = { firstName: string; email: string } | null;

export function MobileMenuRoot({ user }: { user: User }) {
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
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-[999999] p-3 bg-white rounded-xl shadow-xl text-slate-700 hover:text-violet-600 transition-all md:hidden"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 relative">
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`} />
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[999998]" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[300px] max-w-[85vw] bg-white z-[999999] shadow-2xl overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                {user ? (
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-slate-900 text-sm">{user.firstName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </button>
                ) : (
                  <span className="font-bold text-slate-900">Menu</span>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {user && showUserMenu && (
                <div className="mb-6 p-4 bg-violet-50 rounded-xl">
                  <nav className="space-y-1">
                    {userMenuItems.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm text-slate-700 hover:bg-violet-100 rounded-xl">
                        {item.icon} {item.label}
                      </Link>
                    ))}
                  </nav>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full px-4 py-3 mt-2 text-sm text-red-600 hover:bg-red-50 rounded-xl">
                    Sign Out
                  </button>
                </div>
              )}

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="block px-4 py-3.5 text-base text-slate-700 hover:bg-violet-50 rounded-xl">
                    {item.icon} {item.label}
                  </Link>
                ))}
              </nav>

               {/* Currency Switcher - Mobile */}
               <div className="px-4 py-3 border-t border-slate-100">
                 <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Currency</p>
                 <CurrencySelector />
               </div>

               <div className="mt-6 pt-6 border-t border-slate-100">
                {user ? (
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-full px-5 py-3.5 text-center text-sm text-slate-700 border border-slate-200 rounded-xl">
                    My Account
                  </button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsOpen(false)} className="block w-full px-5 py-3.5 text-center text-sm text-slate-700 border border-slate-200 rounded-xl">
                      Log In
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full px-5 py-3.5 text-center text-sm text-white bg-violet-600 rounded-xl mt-3">
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}