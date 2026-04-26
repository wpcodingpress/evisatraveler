'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

function NavLink({ href, children, isActive, icon }: { href: string; children: React.ReactNode; isActive: boolean; icon?: string }) {
  return (
    <Link href={href} className={`px-4 py-2.5 text-sm font-semibold rounded-xl ${isActive ? 'text-white bg-gradient-to-r from-violet-600 to-purple-600' : 'text-slate-700 hover:text-violet-600 hover:bg-violet-50'} flex items-center gap-2`}>
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </Link>
  );
}

function UserMenu({ user, onLogout, pendingApps = 0 }: { user: { firstName: string; email: string }; onLogout: () => void; pendingApps?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
      router.push('/');
      router.refresh();
    } catch (e) { console.error(e); }
  };
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-violet-50">
        <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user.firstName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden xl:block">{user.firstName}</span>
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
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-50 text-amber-700">
                <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                Finish {pendingApps} App
              </Link>
            )}
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50">Dashboard</Link>
            <Link href="/dashboard/applications" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-violet-50">My Applications</Link>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
          </div>
        </>
      )}
    </div>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {[{ href: '/', label: 'Home', icon: '🏠' }, { href: '/visa', label: 'Destinations', icon: '🌍' }, { href: '/track', label: 'Track', icon: '📋' }, { href: '/support', label: 'Help', icon: '💬' }].map(i => (
        <NavLink key={i.href} href={i.href} isActive={pathname === i.href} icon={i.icon}>{i.label}</NavLink>
      ))}
    </>
  );
}

function MobileMenuButton({ user, onLogout }: { user: { firstName: string; email: string } | null; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);
  useEffect(() => { setIsOpen(false) }, [pathname]);
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onLogout();
      router.push('/');
    } catch (e) { }
  };
  return (
    <div className="lg:hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 text-slate-600 hover:bg-violet-50 rounded-lg">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[300px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-lg">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              {user && (
                <div className="mb-4 p-4 bg-violet-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.firstName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <nav className="space-y-1">
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
                  { href: '/dashboard/applications', label: 'Apps', icon: '📄' }
                ].concat([
                  { href: '/', label: 'Home', icon: '🏠' },
                  { href: '/visa', label: 'Destinations', icon: '🌍' },
                  { href: '/track', label: 'Track', icon: '📋' },
                  { href: '/support', label: 'Help', icon: '💬' }
                ]).map(i => (
                  <Link key={i.href} href={i.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === i.href ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-violet-50'}`}>
                    <span className="text-lg">{i.icon}</span>
                    {i.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-5 border-t border-slate-100">
              {user ? (
                <button onClick={() => { setIsOpen(false); handleLogout() }} className="flex items-center justify-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm">
                  Sign Out
                </button>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium text-sm">
                    Log In
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium text-sm">
                    Sign Up Free
                  </Link>
                </div>
              )}
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
  useEffect(() => { checkAuth(); }, []);
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) { }
    finally { setLoading(false); }
  };
  const checkPendingApps = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/applications/start');
      if (res.ok) {
        const data = await res.json();
        setPendingApps(data.count || 0);
      }
    } catch { }
  };
  useEffect(() => {
    if (user) {
      checkPendingApps();
      const i = setInterval(checkPendingApps, 30000);
      return () => clearInterval(i);
    }
  }, [user]);
  const handleLogout = () => { setUser(null); setPendingApps(0); };
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="url(#logoGrad)" />
              <path d="M16 30V18L24 14L32 18V30L24 34L16 30Z" fill="white" />
              <circle cx="24" cy="24" r="3" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-lg font-bold text-slate-900">eVisaTraveler</span>
          </Link>
          <nav className="hidden lg:flex"><NavLinks /></nav>
          <div className="hidden lg:flex items-center gap-4">
            {loading ? (
              <div className="w-20 h-10 bg-slate-100 rounded-xl" />
            ) : user ? (
              <UserMenu user={user} onLogout={handleLogout} pendingApps={pendingApps} />
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 text-sm text-slate-700">Log In</Link>
                <Link href="/register" className="px-6 py-2.5 text-sm text-white bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl">Sign Up</Link>
              </>
            )}
          </div>
          <MobileMenuButton user={user} onLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}

const PaymentIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    visa: (
      <svg viewBox="0 0 48 32" className="h-8 w-auto" fill="none">
        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
        <path d="M19.5 21H17L18.75 11H21.25L19.5 21Z" fill="white"/>
        <path d="M28 11.5C27.5 11.3 26.75 11.1 25.75 11.1C23.25 11.1 21.5 12.4 21.5 14.2C21.5 15.6 22.75 16.3 23.75 16.8C24.75 17.3 25.25 17.6 25.25 18C25.25 18.7 24.5 19 23.75 19C22.75 19 22.25 18.9 21.25 18.4L21 18.2L20.75 20.3C21.5 20.6 22.75 20.9 24 20.9C26.75 20.9 28.5 19.5 28.5 17.5C28.5 16.3 27.75 15.4 26.25 14.7C25.25 14.2 24.5 13.9 24.5 13.3C24.5 12.8 25 12.4 25.75 12.4C26.5 12.4 27 12.5 27.5 12.7L27.75 12.85L28 11.5Z" fill="white"/>
        <path d="M32.5 11H30.75C30.25 11 29.75 11.2 29.5 11.7L26 21H28.75L29.25 19.5H32.25L32.5 21H34.75L32.5 11ZM30 17.5L31 14L31.5 17.5H30Z" fill="white"/>
        <path d="M15.5 11L13 18L12.75 16.8C12.25 15.5 10.75 13.6 9 12.6L11 21H13.75L18.25 11H15.5Z" fill="white"/>
        <path d="M12 11H8L7.75 12.2C10.5 13.2 12.25 15.3 12.75 17.5L11.75 11H12Z" fill="white"/>
      </svg>
    ),
    mastercard: (
      <svg viewBox="0 0 48 32" className="h-8 w-auto" fill="none">
        <rect width="48" height="32" rx="4" fill="#000"/>
        <circle cx="19" cy="16" r="7" fill="#EB001B"/>
        <circle cx="29" cy="16" r="7" fill="#F79E1B"/>
        <path d="M24 10.5C25.85 12 27 14.3 27 17C27 19.7 25.85 22 24 23.5C22.15 22 21 19.7 21 17C21 14.3 22.15 12 24 10.5Z" fill="#FF5F00"/>
      </svg>
    ),
    paypal: (
      <svg viewBox="0 0 48 32" className="h-8 w-auto" fill="none">
        <rect width="48" height="32" rx="4" fill="#003087"/>
        <path d="M17.5 22.5H15C13.5 22.5 12.5 21.8 12 20.5L9 12H11.5L12.75 16.5C13 17.5 13.5 18 14.25 18C14.75 18 15 17.8 15.5 17.3L16.5 16H20.5L21.5 18.5C21.75 19 22.25 19.5 23 19.5H23.5L22.25 22.5H20L17.5 22.5ZM27 22.5H30L29 18H27.5L26.75 20.5C26.5 21.2 26.25 21.5 25.75 21.5C25.25 21.5 25 21.2 24.75 20.5L24 18H22.5L23.5 22.5H25.5L25.75 21.8C26 21 26.5 20.3 27.25 20.3C27.75 20.3 28 20.7 28 21.3C28 21.8 27.5 22.5 27 22.5ZM35.5 22.5L34.25 18.5C34 17.8 33.5 17.3 32.75 17.3C32 17.3 31.5 17.8 31.25 18.5L30 22.5H32L32.25 21.8C32.5 21 33 20.3 33.75 20.3C34.5 20.3 35 20.8 35 21.5C35 22 34.5 22.5 34 22.5H33.5L34 24H36L35.5 22.5ZM39 22.5H41L40.5 20H39C38.5 20 38.25 19.7 38.25 19.2C38.25 18.7 38.5 18.3 39 18.3C39.5 18.3 40 18.6 40.25 19L41.5 17H39.5L38.5 18.5C38.25 18.8 38 19 37.5 19C37 19 36.75 18.7 36.75 18.2C36.75 17.7 37 17.3 37.5 17.3C38 17.3 38.5 17.6 38.75 18L40 16H42L40.5 22.5H39Z" fill="white"/>
      </svg>
    ),
    payoneer: (
      <svg viewBox="0 0 48 32" className="h-8 w-auto" fill="none">
        <rect width="48" height="32" rx="4" fill="#FF4800"/>
        <path d="M18 11H15L14 14H17L18 11Z" fill="white"/>
        <path d="M24.5 11H21.5L22.5 14H25.5L24.5 11Z" fill="white"/>
        <path d="M31 11H28L29 14H32L31 11Z" fill="white"/>
        <path d="M14 16H24V19H14V16Z" fill="white"/>
        <path d="M27 16H37V19H27V16Z" fill="white"/>
      </svg>
    ),
    stripe: (
      <svg viewBox="0 0 48 32" className="h-8 w-auto" fill="none">
        <rect width="48" height="32" rx="4" fill="#635BFF"/>
        <path d="M26 21.5C26 22.3 25.8 23 25.5 23.5C25.2 24 24.7 24.2 24 24.2C23.3 24.2 22.8 24 22.5 23.5C22.2 23 22 22.3 22 21.5V20.5C22 19.7 22.2 19 22.5 18.5C22.8 18 23.3 17.8 24 17.8C24.7 17.8 25.2 18 25.5 18.5C25.8 19 26 19.7 26 20.5V21.5ZM27.5 23C27.5 23.5 27.3 24 27 24.3C26.7 24.7 26.2 24.8 25.7 24.8C25.2 24.8 24.8 24.7 24.5 24.5L24.2 25.3C24.7 25.7 25.5 26 26.3 26C27.3 26 28 25.5 28.3 24.8C28.5 24.2 28.5 23.5 28.3 22.8C28 22 27.5 21.5 27 21.2C26.5 20.8 26 20.7 25.5 20.7C25 20.7 24.5 20.8 24.2 21C23.8 21.2 23.7 21.5 23.7 21.8H22C22 21 22.2 20.3 22.5 19.8C22.8 19.3 23.3 19 24 19C24.5 19 24.8 19.2 25 19.5C25.2 19.8 25.3 20.2 25.3 20.7C25.3 21.2 25.2 21.5 25 21.8C24.8 22.2 24.5 22.3 24.2 22.3C24 22.3 23.8 22.2 23.7 22L22.2 23.3C22.5 24 23.2 24.5 24 24.5C24.7 24.5 25.2 24.2 25.5 23.8C25.8 23.3 26 22.7 26 22V21.5H27.5V23Z" fill="white"/>
        <path d="M34 24.5H31V19.5H29.5V18H34V24.5Z" fill="white"/>
        <path d="M17 24.5H14V19.5H15.5V24.5Z" fill="white"/>
        <path d="M18.5 21.5C18.5 22.3 18.3 23 18 23.5C17.7 24 17.2 24.2 16.5 24.2C15.8 24.2 15.3 24 15 23.5C14.7 23 14.5 22.3 14.5 21.5V20.5C14.5 19.7 14.7 19 15 18.5C15.3 18 15.8 17.8 16.5 17.8C17.2 17.8 17.7 18 18 18.5C18.3 19 18.5 19.7 18.5 20.5V21.5ZM20 23C20 23.5 19.8 24 19.5 24.3C19.2 24.7 18.7 24.8 18.2 24.8C17.7 24.8 17.3 24.7 17 24.5L16.7 25.3C17.2 25.7 18 26 18.8 26C19.8 26 20.5 25.5 20.8 24.8C21 24.2 21 23.5 20.8 22.8C20.5 22 20 21.5 19.5 21.2C19 20.8 18.5 20.7 18 20.7C17.5 20.7 17 20.8 16.7 21C16.3 21.2 16.2 21.5 16.2 21.8H14.5C14.5 21 14.7 20.3 15 19.8C15.3 19.3 15.8 19 16.5 19C17 19 17.3 19.2 17.5 19.5C17.7 19.8 17.8 20.2 17.8 20.7C17.8 21.2 17.7 21.5 17.5 21.8C17.3 22.2 17 22.3 16.7 22.3C16.5 22.3 16.3 22.2 16.2 22L14.7 23.3C15 24 15.7 24.5 16.5 24.5C17.2 24.5 17.7 24.2 18 23.8C18.3 23.3 18.5 22.7 18.5 22V21.5H20V23Z" fill="white"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="10" fill="url(#footerLogoGrad)" />
                <path d="M16 30V18L24 14L32 18V30L24 34L16 30Z" fill="white" />
                <circle cx="24" cy="24" r="3" fill="white" />
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-bold">eVisaTraveler</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Your trusted partner for fast and secure visa applications worldwide. Get your visa approved in 24-72 hours.
            </p>
            <div className="space-y-3">
              <a href="mailto:sheikhshoaibahmed81@gmail.com" className="flex items-center gap-3 text-sm text-slate-300 hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                sheikhshoaibahmed81@gmail.com
              </a>
              <a href="tel:+923346881820" className="flex items-center gap-3 text-sm text-slate-300 hover:text-violet-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +92 334 688 1820
              </a>
              <div className="flex items-start gap-3 text-sm text-slate-300">
                <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Office 26, 2nd floor, Mall-9, G-9 Markaz, Islamabad</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Quick Links</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/visa" className="hover:text-white transition-colors">All Destinations</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Application</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Visa Services</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/visa?type=tourist" className="hover:text-white transition-colors">Tourist Visa</Link></li>
              <li><Link href="/visa?type=business" className="hover:text-white transition-colors">Business Visa</Link></li>
              <li><Link href="/visa?type=transit" className="hover:text-white transition-colors">Transit Visa</Link></li>
              <li><Link href="/visa?type=work" className="hover:text-white transition-colors">Work Visa</Link></li>
              <li><Link href="/visa?type=student" className="hover:text-white transition-colors">Student Visa</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-5 text-violet-400">Secure Payments</h4>
            <p className="text-sm text-slate-400 mb-4">
              We accept all major payment methods for your convenience.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <PaymentIcon type="visa" />
              <PaymentIcon type="mastercard" />
              <PaymentIcon type="paypal" />
              <PaymentIcon type="payoneer" />
              <PaymentIcon type="stripe" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>SSL Secured Payments</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; 2026 eVisaTraveler. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookie-policy" className="text-slate-500 hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500">
              Designed &amp; Developed by{' '}
              <a 
                href="https://wpcodingpress.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                WPCodingPress
              </a>
              {' '}&mdash; AI-Powered Web Development Agency
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}