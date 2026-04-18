import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCountry = searchParams.get('from');
    const toCountry = searchParams.get('to');
    const activeOnly = searchParams.get('active') !== 'false';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam) || 100, 100) : 100;

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
      orderBy: { price: 'asc' },
      take: limit,
    });

    const response = NextResponse.json({ rules: visaRules });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('Visa rules fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}