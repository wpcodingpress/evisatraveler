import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'E-Visa Traveler | Fast & Easy Visa Applications',
  description: 'Apply for visas online with fast processing. Secure, certified, and 99.9% approval rate. Get your travel visa in as little as 24 hours.',
  keywords: ['visa', 'e-visa', 'travel visa', 'tourist visa', 'visa application', 'online visa'],
  openGraph: {
    title: 'E-Visa Traveler | Fast & Easy Visa Applications',
    description: 'Apply for visas online with fast processing. Secure, certified, and 99.9% approval rate.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-white`}>{children}</body>
    </html>
  );
}