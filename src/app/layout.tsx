import type { Metadata } from 'next';
import './globals.css';
import PublicLayout from '@/components/PublicLayout';
import { ScrollToTop } from '@/components/home/scroll-to-top';
import { CurrencyProvider } from '@/context/CurrencyContext';

export const metadata: Metadata = {
  title: 'eVisaTraveler | Visa Approved in 24-72 Hours | Apply Online',
  description: 'Apply for visa online and get approved in 24-72 hours. Tourist, business & transit e-visa with 99.9% approval rate. 180+ countries supported.',
  keywords: ['visa', 'e-visa', 'online visa', 'fast visa', 'visa in 24 hours', 'tourist visa', 'business visa', 'evisa', 'visa application'],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white font-sans antialiased isolate">
        <CurrencyProvider>
          <PublicLayout>
            {children}
          </PublicLayout>
          <ScrollToTop />
        </CurrencyProvider>
      </body>
    </html>
  );
}
