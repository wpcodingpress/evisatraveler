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

    // Get all destinations available from this origin country
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

    // Group by destination and get min price
    const destinationMap = new Map();

    visaRules.forEach(rule => {
      const destCode = rule.toCountry?.code;
      if (destCode && rule.toCountry) {
        if (!destinationMap.has(destCode)) {
          destinationMap.set(destCode, {
            id: rule.toCountry.id,
            name: rule.toCountry.name,
            code: destCode,
            flag: rule.toCountry.flag || '🌍',
            minPrice: Number(rule.price),
            visaTypes: [rule.visaType],
            visaCount: 1
          });
        } else {
          const dest = destinationMap.get(destCode);
          if (Number(rule.price) < dest.minPrice) {
            dest.minPrice = Number(rule.price);
          }
          if (!dest.visaTypes.includes(rule.visaType)) {
            dest.visaTypes.push(rule.visaType);
          }
          dest.visaCount += 1;
        }
      }
    });

    const destinations = Array.from(destinationMap.values());

    // Sort by price and popularity
    destinations.sort((a, b) => a.minPrice - b.minPrice);

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error('Destinations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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