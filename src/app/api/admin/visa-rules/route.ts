import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const visaRules = await prisma.visaRule.findMany({
      include: {
        fromCountry: true,
        toCountry: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for admin panel
    });

    return NextResponse.json({
      visaRules: visaRules.map(rule => ({
        id: rule.id,
        fromCountry: rule.fromCountry.name,
        fromCode: rule.fromCountry.code,
        toCountry: rule.toCountry.name,
        toCode: rule.toCountry.code,
        visaType: rule.visaType,
        price: Number(rule.price),
        processingDays: rule.processingDays,
        maxStayDays: rule.maxStayDays,
        isActive: rule.isActive,
      }))
    });
  } catch (error) {
    console.error('Visa rules fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch visa rules' }, { status: 500 });
  }
}