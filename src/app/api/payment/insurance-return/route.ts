import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const orderNumber = request.nextUrl.searchParams.get('orderNumber');
    const status = request.nextUrl.searchParams.get('status');
    const message = request.nextUrl.searchParams.get('message');

    if (!orderNumber) {
      return NextResponse.redirect(new URL('/insurance/failed?error=missing', request.url));
    }

    const order = await prisma.insuranceOrder.findUnique({
      where: { orderNumber },
      include: { insurance: true },
    });

    if (!order) {
      return NextResponse.redirect(new URL('/insurance/failed?error=notfound', request.url));
    }

    if (status === '000' || status === '00') {
      await prisma.insuranceOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'approved',
          processedAt: new Date(),
        },
      });

      if (order.userId) {
        await prisma.notification.create({
          data: {
            type: 'insurance_approved',
            title: 'Insurance Approved!',
            message: `Your ${order.insurance.name} insurance has been approved. Order: ${order.orderNumber}`,
            userId: order.userId,
          },
        });
      }

      return NextResponse.redirect(new URL(`/insurance/success?order=${orderNumber}`, request.url));
    } else {
      await prisma.insuranceOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          status: 'failed',
        },
      });

      return NextResponse.redirect(new URL(`/insurance/failed?order=${orderNumber}&message=${encodeURIComponent(message || 'Payment failed')}`, request.url));
    }
  } catch (error) {
    console.error('Insurance payment return error:', error);
    return NextResponse.redirect(new URL('/insurance/failed?error=error', request.url));
  }
}