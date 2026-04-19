import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Visa | Find Your Perfect Travel Visa - eVisaTraveler',
  description: 'Search and compare visa options from 200+ countries. Fast processing, 99.9% approval rate, and competitive prices. Find your perfect visa today.',
  keywords: ['visa search', 'find visa', 'travel visa', 'e-visa', 'tourist visa', 'business visa', 'visa comparison'],
};

export default function VisaSearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}