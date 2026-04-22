import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visaRuleId = searchParams.get('visaRuleId');

    if (visaRuleId) {
      const progress = await prisma.applicationProgress.findUnique({
        where: {
          userId_visaRuleId: {
            userId: userId.value,
            visaRuleId,
          },
        },
      });
      return NextResponse.json(progress || null);
    }

    const progress = await prisma.applicationProgress.findMany({
      where: { userId: userId.value },
      include: {
        visaRule: {
          include: {
            toCountry: true,
            fromCountry: true,
          },
        },
      },
      orderBy: { lastActivity: 'desc' },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { visaRuleId, formData, uploadedFiles, currentStep, travelers, processing } = body;

    if (!visaRuleId) {
      return NextResponse.json({ error: 'Visa rule ID required' }, { status: 400 });
    }

    const progress = await prisma.applicationProgress.upsert({
      where: {
        userId_visaRuleId: {
          userId: userId.value,
          visaRuleId,
        },
      },
      update: {
        formData: formData || {},
        uploadedFiles: uploadedFiles || {},
        currentStep: currentStep || 1,
        travelers: travelers || 1,
        processing: processing || 'standard',
        lastActivity: new Date(),
      },
      create: {
        userId: userId.value,
        visaRuleId,
        formData: formData || {},
        uploadedFiles: uploadedFiles || {},
        currentStep: currentStep || 1,
        travelers: travelers || 1,
        processing: processing || 'standard',
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Progress save error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const visaRuleId = searchParams.get('visaRuleId');

    if (!visaRuleId) {
      return NextResponse.json({ error: 'Visa rule ID required' }, { status: 400 });
    }

    await prisma.applicationProgress.delete({
      where: {
        userId_visaRuleId: {
          userId: userId.value,
          visaRuleId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress delete error:', error);
    return NextResponse.json({ error: 'Failed to delete progress' }, { status: 500 });
  }
}