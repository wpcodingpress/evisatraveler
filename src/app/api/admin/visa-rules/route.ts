import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const visaRuleSchema = z.object({
  fromCountryId: z.string(),
  toCountryId: z.string(),
  visaType: z.string().min(1, 'Visa type is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  processingTime: z.string().min(1, 'Processing time is required'),
  processingDays: z.number().optional().default(3),
  requirements: z.any().optional(),
  validityDays: z.number().optional().default(90),
  maxStayDays: z.number().optional().default(30),
  entryType: z.string().optional().default("single"),
  documents: z.any().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const fromCountry = searchParams.get('fromCountry');
    const toCountry = searchParams.get('toCountry');

    const where: any = {};
    if (search) {
      where.OR = [
        { visaType: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (fromCountry) where.fromCountryId = fromCountry;
    if (toCountry) where.toCountryId = toCountry;

    const [rules, total] = await Promise.all([
      prisma.visaRule.findMany({
        where,
        include: {
          fromCountry: { select: { code: true, name: true, flag: true } },
          toCountry: { select: { code: true, name: true, flag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visaRule.count({ where }),
    ]);

    return NextResponse.json({
      visaRules: rules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Visa rules fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch visa rules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = visaRuleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.visaRule.findFirst({
      where: {
        fromCountryId: validation.data.fromCountryId,
        toCountryId: validation.data.toCountryId,
        visaType: validation.data.visaType,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Visa rule already exists for this route' }, { status: 400 });
    }

    const rule = await prisma.visaRule.create({
      data: {
        ...validation.data,
        price: new globalThis.Number(validation.data.price),
        processingDays: validation.data.processingDays || 3,
        validityDays: validation.data.validityDays || 90,
        maxStayDays: validation.data.maxStayDays || 30,
        entryType: validation.data.entryType || 'single',
        requirements: validation.data.requirements ? JSON.parse(validation.data.requirements) : {},
        documents: validation.data.documents || [],
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Visa rule create error:', error);
    return NextResponse.json({ error: 'Failed to create visa rule' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Visa rule ID is required' }, { status: 400 });
    }

    const rule = await prisma.visaRule.update({
      where: { id },
      data,
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Visa rule update error:', error);
    return NextResponse.json({ error: 'Failed to update visa rule' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Visa rule ID is required' }, { status: 400 });
    }

    await prisma.visaRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visa rule delete error:', error);
    return NextResponse.json({ error: 'Failed to delete visa rule' }, { status: 500 });
  }
}