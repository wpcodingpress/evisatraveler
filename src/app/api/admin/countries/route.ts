import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const countrySchema = z.object({
  code: z.string().length(2, 'Country code must be 2 characters'),
  name: z.string().min(2, 'Country name is required'),
  flag: z.string().url().optional().or(z.literal('')),
  region: z.string().optional(),
  continent: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [countries, total] = await Promise.all([
      prisma.country.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.country.count({ where }),
    ]);

    return NextResponse.json({
      countries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
    const validation = countrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { code, name, flag, region, continent } = validation.data;

    const existing = await prisma.country.findUnique({
      where: { code_upper: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Country already exists' }, { status: 400 });
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