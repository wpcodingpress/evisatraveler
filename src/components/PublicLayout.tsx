'use client';

import { usePathname } from 'next/navigation';
import { Header, Footer } from '@/components/home/header-footer';
import { useEffect, useState } from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = pathname?.startsWith('/admin');
  const isDashboard = pathname?.startsWith('/dashboard') && !pathname?.startsWith('/dashboard/admin'); // Exclude nested admin paths if any

  if (!mounted) {
    return <>{children}</>;
  }

  if (isAdmin || isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
