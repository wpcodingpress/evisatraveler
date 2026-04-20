import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCountryFlagEmoji } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const countries = await prisma.country.findMany({
      include: {
        visaRulesTo: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          include: {
            fromCountry: {
              select: { name: true, code: true, flag: true }
            }
          },
          take: 3
        }
      }
    });

    const processedCountries = countries.map(country => {
      const firstVisa = country.visaRulesTo[0];
      return {
        id: country.id,
        name: country.name,
        code: country.code,
        flag: country.flag || getCountryFlagEmoji(country.code),
        visaType: firstVisa?.visaType || 'Tourist',
        visaCount: country.visaRulesTo.length,
        price: firstVisa?.price ? Number(firstVisa.price) : 49,
        currency: firstVisa?.currency || 'USD',
        processingTime: firstVisa?.processingTime || '24-72 Hours',
        processingDays: firstVisa?.processingDays || 3,
        maxStayDays: firstVisa?.maxStayDays || 30,
        validityDays: firstVisa?.validityDays || 90,
        entryType: firstVisa?.entryType || 'Single Entry',
        requiredVisaTypes: country.visaRulesTo.map(v => v.visaType)
      };
    });

    return NextResponse.json(processedCountries);
  } catch (error) {
    console.error('Visa destinations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}