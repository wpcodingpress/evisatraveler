import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationForm } from './application-form';

interface Props {
  params: Promise<{ visaId: string }>;
  searchParams: Promise<{ travelers?: string; processing?: string }>;
}

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
  
  return null;
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

async function checkExistingApplication(userId: string, visaRuleId: string) {
  try {
    const existingApp = await prisma.application.findFirst({
      where: {
        userId,
        visaRuleId,
        status: {
          in: ['pending', 'processing', 'approved', 'completed'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return existingApp;
  } catch {
    return null;
  }
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

  // Check for existing application - block if pending/processing
  const existingApp = await checkExistingApplication(user.userId, visaId);
  
  if (existingApp && (existingApp.status === 'pending' || existingApp.status === 'processing')) {
    // Redirect to the user's dashboard with existing application info
    redirect('/dashboard?existing=' + existingApp.id);
  }

  return <ApplicationForm 
    visaRule={visaRule} 
    travelers={travelers ? parseInt(travelers) : 1}
    processing={processing || 'standard'}
    existingApplication={existingApp}
  />;
}