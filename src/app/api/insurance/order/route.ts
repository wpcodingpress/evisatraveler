import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function generateOrderNumber(): string {
  const prefix = 'INS';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insuranceId, formData } = body;

    if (!insuranceId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: insuranceId, formData' },
        { status: 400 }
      );
    }

    const insurance = await prisma.insurance.findUnique({
      where: { id: insuranceId },
    });

    if (!insurance) {
      return NextResponse.json(
        { error: 'Insurance not found' },
        { status: 404 }
      );
    }

    const userId = (await cookies()).get('user_id')?.value;
    
    const order = await prisma.insuranceOrder.create({
      data: {
        insuranceId,
        orderNumber: generateOrderNumber(),
        formData,
        userId: userId || undefined,
        totalAmount: insurance.price,
        currency: insurance.currency,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    // Create notification for admin about new order
    try {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' },
      });
      if (adminUser) {
        await prisma.notification.create({
          data: {
            type: 'new_insurance_order',
            title: 'New Insurance Order!',
            message: `New ${insurance.name} insurance order received. Order: ${order.orderNumber} - $${insurance.price}`,
            userId: adminUser.id,
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating insurance order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}