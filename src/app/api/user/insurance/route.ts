import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdFromQuery = request.nextUrl.searchParams.get('userId');
    const applicationNumber = request.nextUrl.searchParams.get('orderNumber');

    // Get userId from query params or from cookies
    const userId = userIdFromQuery || cookieStore.get('user_id')?.value;

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
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: 'userId or orderNumber required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching insurance orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId') || searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Find the order and verify ownership
    const order = await prisma.insuranceOrder.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Only allow deletion of paid orders
    if (order.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Can only delete active insurance orders' }, { status: 400 });
    }

    await prisma.insuranceOrder.delete({
      where: { id: orderId },
    });

    return NextResponse.json({ success: true, message: 'Insurance order deleted' });
  } catch (error) {
    console.error('Error deleting insurance order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}