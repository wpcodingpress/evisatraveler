import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ exists: false, status: null });
    }

    const url = new URL(request.url);
    const visaRuleId = url.searchParams.get('visaRuleId');

    if (!visaRuleId) {
      return NextResponse.json({ error: 'Missing visaRuleId' }, { status: 400 });
    }

    // Check for existing applications with same visaRuleId that are NOT completed/rejected
    const existingApp = await prisma.application.findFirst({
      where: {
        userId,
        visaRuleId,
        status: {
          in: ['pending', 'processing', 'approved', 'completed'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        visaRule: {
          include: {
            toCountry: true,
            fromCountry: true,
          },
        },
      },
    });

    if (existingApp) {
      return NextResponse.json({
        exists: true,
        status: existingApp.status,
        applicationId: existingApp.id,
        applicationNumber: existingApp.applicationNumber,
        visaType: existingApp.visaRule?.visaType,
        destination: existingApp.visaRule?.toCountry?.name,
      });
    }

    return NextResponse.json({ exists: false, status: null });
  } catch (error) {
    console.error('Check existing app error:', error);
    return NextResponse.json({ exists: false, status: null });
  }
}