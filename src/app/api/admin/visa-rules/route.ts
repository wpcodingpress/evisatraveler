import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    
    const where: any = {};
    if (search) {
      where.OR = [
        { fromCountry: { name: { contains: search, mode: 'insensitive' } } },
        { toCountry: { name: { contains: search, mode: 'insensitive' } } },
        { visaType: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [visaRules, total, activeCount] = await Promise.all([
      prisma.visaRule.findMany({
        where,
        include: {
          fromCountry: true,
          toCountry: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visaRule.count({ where }),
      prisma.visaRule.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json({
      visaRules: visaRules.map(rule => ({
        id: rule.id,
        fromCountryId: rule.fromCountryId,
        toCountryId: rule.toCountryId,
        fromCountry: {
          id: rule.fromCountry.id,
          name: rule.fromCountry.name,
          code: rule.fromCountry.code,
          flag: rule.fromCountry.flag,
        },
        toCountry: {
          id: rule.toCountry.id,
          name: rule.toCountry.name,
          code: rule.toCountry.code,
          flag: rule.toCountry.flag,
        },
        visaType: rule.visaType,
        price: Number(rule.price),
        currency: rule.currency,
        processingTime: rule.processingTime,
        processingDays: rule.processingDays,
        maxStayDays: rule.maxStayDays,
        validityDays: rule.validityDays,
        entryType: rule.entryType,
        requirements: rule.requirements || [],
        documents: rule.documents || [],
        allowedActivities: rule.allowedActivities || [],
        additionalInfo: rule.additionalInfo,
        isActive: rule.isActive,
        createdAt: rule.createdAt?.toISOString(),
      })),
      stats: {
        total,
        active: activeCount,
        inactive: total - activeCount,
        avgPrice: total > 0 ? Math.round(visaRules.reduce((sum: number, r: any) => sum + Number(r.price), 0) / total) : 0
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Visa rules fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch visa rules' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fromCountryId,
      toCountryId,
      visaType,
      price,
      currency,
      processingTime,
      processingDays,
      maxStayDays,
      validityDays,
      entryType,
      requirements,
      documents,
      allowedActivities,
      additionalInfo,
      isActive,
    } = body;

    const existing = await prisma.visaRule.findFirst({
      where: {
        fromCountryId,
        toCountryId,
        visaType,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Visa rule already exists for this route and type' }, { status: 400 });
    }

    const visaRule = await prisma.visaRule.create({
      data: {
        fromCountryId,
        toCountryId,
        visaType,
        price,
        currency: currency || 'USD',
        processingTime: processingTime || '24-72 Hours',
        processingDays: processingDays || 3,
        maxStayDays: maxStayDays || 30,
        validityDays: validityDays || 90,
        entryType: entryType || 'Single Entry',
        requirements: requirements || [],
        documents: documents || [],
        allowedActivities: allowedActivities || [],
        additionalInfo: additionalInfo || '',
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        fromCountry: true,
        toCountry: true,
      },
    });

    return NextResponse.json({
      id: visaRule.id,
      fromCountryId: visaRule.fromCountryId,
      toCountryId: visaRule.toCountryId,
      fromCountry: {
        id: visaRule.fromCountry.id,
        name: visaRule.fromCountry.name,
        code: visaRule.fromCountry.code,
        flag: visaRule.fromCountry.flag,
      },
      toCountry: {
        id: visaRule.toCountry.id,
        name: visaRule.toCountry.name,
        code: visaRule.toCountry.code,
        flag: visaRule.toCountry.flag,
      },
      visaType: visaRule.visaType,
      price: Number(visaRule.price),
      currency: visaRule.currency,
      processingTime: visaRule.processingTime,
      processingDays: visaRule.processingDays,
      maxStayDays: visaRule.maxStayDays,
      validityDays: visaRule.validityDays,
      entryType: visaRule.entryType,
      requirements: visaRule.requirements || [],
      documents: visaRule.documents || [],
      allowedActivities: visaRule.allowedActivities || [],
      additionalInfo: visaRule.additionalInfo,
      isActive: visaRule.isActive,
    }, { status: 201 });
  } catch (error) {
    console.error('Visa rule creation error:', error);
    return NextResponse.json({ error: 'Failed to create visa rule' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      fromCountryId,
      toCountryId,
      visaType,
      price,
      currency,
      processingTime,
      processingDays,
      maxStayDays,
      validityDays,
      entryType,
      requirements,
      documents,
      allowedActivities,
      additionalInfo,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Visa rule ID is required' }, { status: 400 });
    }

    const visaRule = await prisma.visaRule.update({
      where: { id },
      data: {
        ...(fromCountryId && { fromCountryId }),
        ...(toCountryId && { toCountryId }),
        ...(visaType && { visaType }),
        ...(price !== undefined && { price }),
        ...(currency && { currency }),
        ...(processingTime && { processingTime }),
        ...(processingDays !== undefined && { processingDays }),
        ...(maxStayDays !== undefined && { maxStayDays }),
        ...(validityDays !== undefined && { validityDays }),
        ...(entryType && { entryType }),
        ...(requirements && { requirements }),
        ...(documents && { documents }),
        ...(allowedActivities && { allowedActivities }),
        ...(additionalInfo !== undefined && { additionalInfo }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        fromCountry: true,
        toCountry: true,
      },
    });

    return NextResponse.json({
      id: visaRule.id,
      fromCountryId: visaRule.fromCountryId,
      toCountryId: visaRule.toCountryId,
      fromCountry: {
        id: visaRule.fromCountry.id,
        name: visaRule.fromCountry.name,
        code: visaRule.fromCountry.code,
        flag: visaRule.fromCountry.flag,
      },
      toCountry: {
        id: visaRule.toCountry.id,
        name: visaRule.toCountry.name,
        code: visaRule.toCountry.code,
        flag: visaRule.toCountry.flag,
      },
      visaType: visaRule.visaType,
      price: Number(visaRule.price),
      currency: visaRule.currency,
      processingTime: visaRule.processingTime,
      processingDays: visaRule.processingDays,
      maxStayDays: visaRule.maxStayDays,
      validityDays: visaRule.validityDays,
      entryType: visaRule.entryType,
      requirements: visaRule.requirements || [],
      documents: visaRule.documents || [],
      allowedActivities: visaRule.allowedActivities || [],
      additionalInfo: visaRule.additionalInfo,
      isActive: visaRule.isActive,
    });
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

    await prisma.visaRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Visa rule deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete visa rule' }, { status: 500 });
  }
}