import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const insurances = await prisma.insurance.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(insurances);
  } catch (error) {
    console.error('Error fetching insurances:', error);
    return NextResponse.json({ error: 'Failed to fetch insurances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, currency, coverage, duration, benefits, isActive, sortOrder } = body;

    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    const insurance = await prisma.insurance.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        currency: currency || 'USD',
        coverage: coverage || '',
        duration: duration || '',
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || '[]',
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(insurance);
  } catch (error) {
    console.error('Error creating insurance:', error);
    return NextResponse.json({ error: 'Failed to create insurance' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, currency, coverage, duration, benefits, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const insurance = await prisma.insurance.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        currency,
        coverage,
        duration,
        benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(insurance);
  } catch (error) {
    console.error('Error updating insurance:', error);
    return NextResponse.json({ error: 'Failed to update insurance' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.insurance.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance:', error);
    return NextResponse.json({ error: 'Failed to delete insurance' }, { status: 500 });
  }
}