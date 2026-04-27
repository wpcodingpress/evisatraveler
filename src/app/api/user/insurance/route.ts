import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const applicationNumber = request.nextUrl.searchParams.get('orderNumber');

    if (applicationNumber) {
      const order = await prisma.insuranceOrder.findUnique({
        where: { orderNumber: applicationNumber },
        include: { insurance: true },
      });
      return NextResponse.json(order || { error: 'Order not found' });
    }

    if (userId) {
      const orders = await prisma.insuranceOrder.findMany({
        where: { userId },
        include: { insurance: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: 'userId or orderNumber required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching insurance orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}