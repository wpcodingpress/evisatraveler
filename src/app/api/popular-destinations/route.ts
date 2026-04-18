import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const popularDestinations = ['TH', 'VN', 'MY', 'SG', 'AE', 'TR', 'IN', 'LK', 'KH', 'ID'];
    
    const pkCountry = await prisma.country.findUnique({
      where: { code: 'PK' }
    });

    if (!pkCountry) {
      return NextResponse.json({ destinations: [] });
    }

    const visaRules = await prisma.visaRule.findMany({
      where: {
        fromCountryId: pkCountry.id,
        toCountry: { code: { in: popularDestinations } },
        isActive: true,
      },
      include: {
        fromCountry: true,
        toCountry: true,
      },
      orderBy: { price: 'asc' },
    });

    const grouped = popularDestinations.map(code => {
      const rule = visaRules.find(r => r.toCountry?.code === code);
      return rule || null;
    }).filter(Boolean);

    return NextResponse.json({ destinations: grouped.slice(0, 10) });
  } catch (error) {
    console.error('Popular destinations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}