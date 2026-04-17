import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationForm } from './application-form';

interface Props {
  params: Promise<{ visaId: string }>;
  searchParams: Promise<{ travelers?: string; processing?: string }>;
}

const MOCK_VISA_RULES: Record<string, any> = {
  '1': {
    id: '1',
    visaType: 'Tourist Visa',
    processingTime: '24-72 hours',
    processingDays: 3,
    price: 49,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 90,
    entryType: 'Single Entry',
    requirements: ['Valid passport (6+ months)', 'Passport-size photos'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Leisure'],
    additionalInfo: 'Thailand tourist visa for US citizens.',
    fromCountry: { id: 'us', name: 'United States', code: 'US', flag: '🇺🇸' },
    toCountry: { id: 'th', name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  },
  'cmo1epqba000mw9xrycm85ga9': {
    id: 'cmo1epqba000mw9xrycm85ga9',
    visaType: 'Tourist Visa',
    processingTime: '24-72 Hours',
    processingDays: 3,
    price: 49,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 90,
    entryType: 'Single',
    requirements: ['Valid passport with at least 6 months validity', 'Recent passport-sized photo', 'Proof of accommodation'],
    documents: [],
    allowedActivities: null,
    additionalInfo: 'Tourist visa allows single entry into Thailand for stays up to 30 days.',
    isActive: true,
    sortOrder: 0,
    fromCountry: { id: 'cmo1eplga0001w9xrlgaco2ga', name: 'United States', code: 'US', flag: '🇺🇸', region: 'North America', continent: 'Americas' },
    toCountry: { id: 'cmo1epnfc000aw9xrie2njvds', name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia', continent: 'Asia' },
  },
};

async function getVisaRule(visaId: string) {
  try {
    const rule = await prisma.visaRule.findUnique({
      where: { id: visaId },
      include: {
        fromCountry: true,
        toCountry: true,
      },
    });
    if (rule) return rule;
  } catch (error) {
    console.log('Database not available, using mock data for apply page');
  }
  
  return MOCK_VISA_RULES[visaId] || null;
}

export async function generateMetadata({ params }: Props) {
  const { visaId } = await params;
  const rule = await getVisaRule(visaId);
  if (!rule) return { title: 'Visa Not Found' };
  return {
    title: `Apply for ${rule.visaType} Visa | ${rule.toCountry.name}`,
    description: `Complete your ${rule.toCountry.name} ${rule.visaType} visa application. ${rule.processingTime} processing.`,
  };
}

export default async function ApplyPage({ params, searchParams }: Props) {
  const { visaId } = await params;
  const { travelers, processing } = await searchParams;
  const visaRule = await getVisaRule(visaId);

  if (!visaRule) {
    notFound();
  }

  return <ApplicationForm 
    visaRule={visaRule} 
    travelers={travelers ? parseInt(travelers) : 1}
    processing={processing || 'standard'}
  />;
}