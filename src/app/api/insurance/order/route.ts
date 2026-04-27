import { NextRequest, NextResponse } from 'next/server';
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

    const order = await prisma.insuranceOrder.create({
      data: {
        insuranceId,
        orderNumber: generateOrderNumber(),
        formData,
        totalAmount: insurance.price,
        currency: insurance.currency,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating insurance order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}