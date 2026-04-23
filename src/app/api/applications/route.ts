import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateApplicationNumber, generateOrderId } from '@/lib/utils';
import { initiateBankAlfalahPayment } from '@/lib/bank-alfalah';
import { z } from 'zod';

const applicationSchema = z.object({
  visaRuleId: z.string(),
  formData: z.any(),
  travelers: z.number().optional().default(1),
  processing: z.string().optional().default('standard'),
  totalAmount: z.number().optional(),
  currency: z.string().optional().default('USD'),
  documents: z.array(z.object({
    type: z.string(),
    fileName: z.string(),
    originalName: z.string(),
    filePath: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
  })).optional(),
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

    const { visaRuleId, formData, travelers, processing, totalAmount, currency, documents: docData } = validation.data;

    let visaRule;
    try {
      visaRule = await prisma.visaRule.findUnique({
        where: { id: visaRuleId },
      });
    } catch {
      // Database not available - use mock data
      visaRule = null;
    }

    // Generate application
    const applicationNumber = generateApplicationNumber();
    const orderId = generateOrderId();
    const amount = totalAmount || (visaRule?.price ? Number(visaRule.price) : 49) * (travelers || 1);
    const processingFee = processing === 'urgent' ? Math.round(amount * 0.5) : 0;
    const finalAmount = amount + processingFee;

    // Try to create application in database
    let application;
    try {
      const userId = (await cookies()).get('user_id')?.value;
      application = await prisma.application.create({
        data: {
          visaRuleId,
          applicationNumber,
          userId: userId || undefined,
          formData: formData as unknown as object,
          totalAmount: finalAmount,
          currency: currency || 'USD',
          status: 'pending',
          paymentStatus: 'pending',
        },
        include: {
          visaRule: {
            include: {
              toCountry: true,
              fromCountry: true,
            }
          },
          user: true,
        },
      });

      if (docData && docData.length > 0) {
        for (const doc of docData) {
          await prisma.document.create({
            data: {
              applicationId: application.id,
              type: doc.type,
              fileName: doc.fileName,
              originalName: doc.originalName,
              filePath: doc.filePath,
              mimeType: doc.mimeType,
              fileSize: doc.fileSize,
            },
          });
        }
      }

      await prisma.notification.create({
        data: {
          type: 'new_application',
          title: 'New Visa Application',
          message: `Application #${applicationNumber} for ${application.visaRule?.toCountry?.name || 'visa'} - $${finalAmount}`,
          data: { applicationId: application.id, amount: finalAmount },
          userId: application.userId || undefined,
        },
      });
    } catch (dbError) {
      console.log('Database unavailable, creating in-memory application');
      application = {
        id: applicationNumber,
        visaRuleId,
        applicationNumber,
        orderId,
        formData,
        totalAmount: finalAmount,
        currency: currency || 'USD',
        status: 'pending',
        paymentStatus: 'pending' as const,
      };
    }

    // Handle demo mode (no payment gateway)
    if (process.env.BANK_ALFALAH_MERCHANT_ID === 'YOUR_MERCHANT_ID' || !process.env.BANK_ALFALAH_MERCHANT_ID) {
      // Demo mode - skip payment and return success
      console.log('Demo mode: Skipping payment, returning success');
      return NextResponse.json({
        id: application?.id || applicationNumber,
        applicationNumber,
        orderId,
        totalAmount: finalAmount,
        currency,
        message: 'Application created (demo mode)',
        paymentUrl: `/confirmation/${applicationNumber}?demo=true`,
      });
    }

    // Initiate Bank Alfalah payment
    const paymentResult = await initiateBankAlfalahPayment({
      amount: finalAmount,
      currency: currency || 'USD',
      orderId,
      productDescription: `eVisa - Tourist Visa application`,
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      customerEmail: formData.email,
      customerPhone: formData.phone || '',
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback?app=${applicationNumber}`,
    });

    if (!paymentResult.success) {
      // If payment fails, still return application but redirect to confirmation
      console.error('Payment initiation failed:', paymentResult.error);
      return NextResponse.json({
        id: application?.id || applicationNumber,
        applicationNumber,
        orderId,
        totalAmount: finalAmount,
        currency,
        message: 'Application created',
        paymentUrl: `/confirmation/${applicationNumber}?pending=true`,
      });
    }

    return NextResponse.json({
      id: application?.id || applicationNumber,
      applicationNumber,
      orderId,
      totalAmount: finalAmount,
      currency,
      paymentUrl: paymentResult.paymentUrl,
      transactionId: paymentResult.transactionId,
    });
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Verify user owns this application
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');
    
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // If user is logged in, verify they own this application
    if (userId && app.userId && app.userId !== userId.value) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete associated documents first
    await prisma.document.deleteMany({
      where: { applicationId },
    });

    // Delete the application
    await prisma.application.delete({
      where: { id: applicationId },
    });

    // Also delete from incomplete apps cookie if present
    const incompleteAppsStr = cookieStore.get('incomplete_apps')?.value || '[]';
    const incompleteApps = JSON.parse(incompleteAppsStr).filter((app: any) => app.visaRuleId !== applicationId);
    cookieStore.set('incomplete_apps', JSON.stringify(incompleteApps), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationNumber = searchParams.get('applicationNumber');

    if (applicationNumber) {
      let application;
      try {
        application = await prisma.application.findUnique({
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
      } catch {
        // Database unavailable
        application = null;
      }

      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      return NextResponse.json(application);
    }

    let applications: any[] = [];
    try {
      applications = await prisma.application.findMany({
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
    } catch {
      // Database unavailable
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}