import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const region = searchParams.get('region');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '300');

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (region) {
      where.region = region;
    }

    const countries = await prisma.country.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: {
            visaRules: true,
            visaRulesTo: true,
          },
        },
      },
    });

    // Format response with visa counts
    const formattedCountries = countries.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      flag: c.flag,
      region: c.region,
      continent: c.continent,
      visaRulesTo: c._count.visaRulesTo,
      visaRulesFrom: c._count.visaRules,
    }));

    return NextResponse.json({
      countries: formattedCountries,
      pagination: {
        page,
        limit,
        total: formattedCountries.length,
      },
    });
  } catch (error) {
    console.error('Countries fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, code, flag, region, continent } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const existing = await prisma.country.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Country code already exists' }, { status: 400 });
    }

    const country = await prisma.country.create({
      data: {
        code: code.toUpperCase(),
        name,
        flag: flag || '',
        region: region || '',
        continent: continent || '',
      },
    });

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('Country create error:', error);
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, flag, region, continent } = body;

    if (!id) {
      return NextResponse.json({ error: 'Country ID is required' }, { status: 400 });
    }

    const country = await prisma.country.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(flag !== undefined && { flag }),
        ...(region !== undefined && { region }),
        ...(continent !== undefined && { continent }),
      },
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error('Country update error:', error);
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 });
  }
}