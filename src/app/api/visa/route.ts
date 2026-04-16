import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCountry = searchParams.get('from');
    const toCountry = searchParams.get('to');
    const activeOnly = searchParams.get('active') !== 'false';

    const where: Record<string, unknown> = {};
    
    if (fromCountry) {
      where.fromCountry = { code: fromCountry.toUpperCase() };
    }
    if (toCountry) {
      where.toCountry = { code: toCountry.toUpperCase() };
    }
    if (activeOnly) {
      where.isActive = true;
    }

    const visaRules = await prisma.visaRule.findMany({
      where,
      include: {
        fromCountry: true,
        toCountry: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(visaRules);
  } catch (error) {
    console.error('Visa rules fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}