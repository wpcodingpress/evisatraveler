'use client';

import { usePathname } from 'next/navigation';
import { Header, Footer } from '@/components/home/header-footer';
import { useEffect, useState } from 'react';
import { MobileMenuRoot } from '@/components/home/mobile-menu-root';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.log('Auth check failed');
    }
  };

  const isAdmin = pathname?.startsWith('/admin');
  const isDashboard = pathname?.startsWith('/dashboard') && !pathname?.startsWith('/dashboard/admin');

  if (isAdmin || isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {mounted && <MobileMenuRoot user={user} />}
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}