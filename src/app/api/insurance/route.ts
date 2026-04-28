import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET() {
  try {
    const insurances = await prisma.insurance.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(insurances);
  } catch (error) {
    console.error('Error fetching insurances:', error);
    return NextResponse.json({ error: 'Failed to fetch insurances' }, { status: 500 });
  }
}