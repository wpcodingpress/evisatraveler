import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where = status && status !== 'all' ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.insuranceOrder.findMany({
        where,
        include: { insurance: true, user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.insuranceOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching insurance orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (status === 'approved') updateData.processedAt = new Date();

    const order = await prisma.insuranceOrder.update({
      where: { id },
      data: updateData,
      include: { insurance: true, user: true },
    });

    if (order.userId && status) {
      await prisma.notification.create({
        data: {
          type: status === 'approved' ? 'insurance_approved' : 'insurance_rejected',
          title: status === 'approved' ? 'Insurance Approved!' : 'Insurance Rejected',
          message: `Your ${order.insurance.name} insurance has been ${status}. Order: ${order.orderNumber}`,
          userId: order.userId,
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating insurance order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.insuranceOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting insurance order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}