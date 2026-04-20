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
          take: 1
        }
      }
    });

    const processedCountries = countries.map(country => ({
      ...country,
      flag: country.flag || getCountryFlagEmoji(country.code)
    }));

    return NextResponse.json(processedCountries);
  } catch (error) {
    console.error('Visa destinations fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}