import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApplicationForm } from './application-form';

interface Props {
  params: Promise<{ visaId: string }>;
}

async function getVisaRule(visaId: string) {
  const rule = await prisma.visaRule.findUnique({
    where: { id: visaId },
    include: {
      fromCountry: true,
      toCountry: true,
    },
  });
  return rule;
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

export default async function ApplyPage({ params }: Props) {
  const { visaId } = await params;
  const visaRule = await getVisaRule(visaId);

  if (!visaRule) {
    notFound();
  }

  return <ApplicationForm visaRule={visaRule} />;
}