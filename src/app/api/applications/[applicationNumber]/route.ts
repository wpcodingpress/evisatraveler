import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

interface Props {
  params: Promise<{ applicationNumber: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { applicationNumber } = await params;

    if (!applicationNumber) {
      return NextResponse.json({ error: 'Application number required' }, { status: 400 });
    }

    let application;
    try {
      application = await prisma.application.findUnique({
        where: { applicationNumber },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          visaRule: {
            include: {
              toCountry: true,
              fromCountry: true,
            },
          },
          documents: true,
        },
      });
    } catch (err) {
      console.error('Database error:', err);
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (userId && application.userId && application.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      id: application.id,
      applicationNumber: application.applicationNumber,
      status: application.status,
      paymentStatus: application.paymentStatus,
      totalAmount: application.totalAmount,
      currency: application.currency,
      createdAt: application.createdAt,
      formData: application.formData,
      visaRule: application.visaRule,
      user: application.user,
      documents: application.documents || [],
    });
  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
