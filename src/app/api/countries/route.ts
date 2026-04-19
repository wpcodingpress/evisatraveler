import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all countries ordered by name
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        flag: true,
      },
    });

    // Get counts of active visa rules per fromCountry
    const counts = await prisma.visaRule.groupBy({
      by: ['fromCountryId'],
      where: { isActive: true },
      _count: { fromCountryId: true },
    });

    const countMap = new Map<string, number>();
    counts.forEach(c => {
      countMap.set(c.fromCountryId, c._count.fromCountryId);
    });

    const countriesWithCounts = countries.map(c => ({
      ...c,
      visaRuleCount: countMap.get(c.id) || 0,
    }));

    return NextResponse.json({ countries: countriesWithCounts });
  } catch (error) {
    console.error('Countries fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}