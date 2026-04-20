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

  if (!mounted) {
    return <>{children}</>;
  }

  if (isAdmin) {
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
