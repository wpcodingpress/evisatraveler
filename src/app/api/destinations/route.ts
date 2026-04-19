import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCountry = searchParams.get('from');

    if (!fromCountry) {
      return NextResponse.json({ destinations: [] });
    }

    const fromCountryRecord = await prisma.country.findUnique({
      where: { code: fromCountry.toUpperCase() }
    });

    if (!fromCountryRecord) {
      return NextResponse.json({ destinations: [] });
    }

    const visaRules = await prisma.visaRule.findMany({
      where: {
        fromCountryId: fromCountryRecord.id,
        isActive: true,
      },
      include: {
        toCountry: true,
      },
      orderBy: { price: 'asc' },
    });

    // Get unique destination countries
    const destinationMap = new Map();
    visaRules.forEach(rule => {
      if (rule.toCountry && !destinationMap.has(rule.toCountry.code)) {
        destinationMap.set(rule.toCountry.code, {
          id: rule.toCountry.id,
          name: rule.toCountry.name,
          code: rule.toCountry.code,
          flag: rule.toCountry.flag || '🌍',
          minPrice: rule.price,
          visaTypes: [rule.visaType]
        });
      } else if (rule.toCountry) {
        const dest = destinationMap.get(rule.toCountry.code);
        if (dest.minPrice > rule.price) {
          dest.minPrice = rule.price;
        }
        if (!dest.visaTypes.includes(rule.visaType)) {
          dest.visaTypes.push(rule.visaType);
        }
      }
    });

    const destinations = Array.from(destinationMap.values());

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error('Destinations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}