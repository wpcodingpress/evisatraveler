import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateApplicationNumber } from '@/lib/utils';
import { z } from 'zod';

const applicationSchema = z.object({
  visaRuleId: z.string(),
  formData: z.any(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = applicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { visaRuleId, formData } = validation.data;

    const visaRule = await prisma.visaRule.findUnique({
      where: { id: visaRuleId },
    });

    if (!visaRule) {
      return NextResponse.json({ error: 'Visa rule not found' }, { status: 404 });
    }

    const application = await prisma.application.create({
      data: {
        visaRuleId,
        applicationNumber: generateApplicationNumber(),
        formData: formData as unknown as object,
        totalAmount: visaRule.price,
        currency: visaRule.currency,
        status: 'pending',
        paymentStatus: 'pending',
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationNumber = searchParams.get('applicationNumber');

    if (applicationNumber) {
      const application = await prisma.application.findUnique({
        where: { applicationNumber },
        include: {
          visaRule: {
            include: {
              toCountry: true,
              fromCountry: true,
            },
          },
          documents: true,
        },
      });

      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      return NextResponse.json(application);
    }

    const applications = await prisma.application.findMany({
      include: {
        visaRule: {
          include: {
            toCountry: true,
            fromCountry: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}