import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationForm } from './application-form';

interface Props {
  params: Promise<{ visaId: string }>;
  searchParams: Promise<{ travelers?: string; processing?: string }>;
}

const MOCK_VISA_RULES: Record<string, any> = {
  // Pakistan routes
  'pk-th-1': {
    id: 'pk-th-1',
    visaType: 'Tourist Visa',
    processingTime: '24-72 hours',
    processingDays: 3,
    price: 49,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 90,
    entryType: 'Single Entry',
    requirements: ['Valid passport (6+ months)', 'Passport-size photos', 'Proof of accommodation'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Leisure'],
    additionalInfo: 'Thailand tourist visa for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'th', name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  },
  'pk-sg-1': {
    id: 'pk-sg-1',
    visaType: 'Tourist Visa',
    processingTime: 'Visa Free',
    processingDays: 0,
    price: 0,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 30,
    entryType: 'Visa Free',
    requirements: ['Valid passport'],
    documents: ['Passport'],
    allowedActivities: ['Tourism', 'Business'],
    additionalInfo: 'Singapore visa-free for Pakistanis.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'sg', name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  },
  'pk-vn-1': {
    id: 'pk-vn-1',
    visaType: 'Tourist Visa',
    processingTime: '3-5 days',
    processingDays: 5,
    price: 59,
    currency: 'USD',
    maxStayDays: 90,
    validityDays: 90,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Business'],
    additionalInfo: 'Vietnam e-visa for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'vn', name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
  },
  'pk-my-1': {
    id: 'pk-my-1',
    visaType: 'Tourist Visa',
    processingTime: '24-48 hours',
    processingDays: 2,
    price: 39,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 90,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Business'],
    additionalInfo: 'Malaysia e-visa for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'my', name: 'Malaysia', code: 'MY', flag: '🇲🇲' },
  },
  'pk-ae-1': {
    id: 'pk-ae-1',
    visaType: 'Tourist Visa',
    processingTime: '3-5 days',
    processingDays: 5,
    price: 115,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 60,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Business'],
    additionalInfo: 'UAE visa for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'ae', name: 'UAE', code: 'AE', flag: '🇦🇪' },
  },
  'pk-tr-1': {
    id: 'pk-tr-1',
    visaType: 'Tourist Visa',
    processingTime: '24-48 hours',
    processingDays: 2,
    price: 60,
    currency: 'USD',
    maxStayDays: 90,
    validityDays: 180,
    entryType: 'Multiple Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Business'],
    additionalInfo: 'Turkey e-visa for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'tr', name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  },
  'pk-in-1': {
    id: 'pk-in-1',
    visaType: 'Tourist Visa',
    processingTime: '2-4 days',
    processingDays: 4,
    price: 50,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 60,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism', 'Business'],
    additionalInfo: 'India e-visa for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'in', name: 'India', code: 'IN', flag: '🇮🇳' },
  },
  'pk-lk-1': {
    id: 'pk-lk-1',
    visaType: 'Tourist Visa',
    processingTime: '24 hours',
    processingDays: 1,
    price: 35,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 60,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism'],
    additionalInfo: 'Sri Lanka ETA for Pakistani citizens.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'lk', name: 'Sri Lanka', code: 'LK', flag: '🇱🇰' },
  },
  'pk-id-1': {
    id: 'pk-id-1',
    visaType: 'Tourist Visa',
    processingTime: '2-3 days',
    processingDays: 3,
    price: 50,
    currency: 'USD',
    maxStayDays: 30,
    validityDays: 60,
    entryType: 'Single Entry',
    requirements: ['Valid passport', 'Photo', 'Hotel booking'],
    documents: ['Passport copy', 'Photo'],
    allowedActivities: ['Tourism'],
    additionalInfo: 'Indonesia e-visa available.',
    fromCountry: { id: 'pk', name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
    toCountry: { id: 'id', name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  },
  // Legacy IDs
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

function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token');
  const userId = cookieStore.get('user_id');
  
  if (!token || !userId) {
    return null;
  }
  return { token: token.value, userId: userId.value };
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

  // Check authentication - redirect to login if not authenticated
  const user = checkAuth();
  if (!user) {
    redirect('/login?from=apply&callback=/apply/' + visaId + '?travelers=' + (travelers || '1') + '&processing=' + (processing || 'standard'));
  }

  return <ApplicationForm 
    visaRule={visaRule} 
    travelers={travelers ? parseInt(travelers) : 1}
    processing={processing || 'standard'}
  />;
}