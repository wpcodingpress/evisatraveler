import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPayment } from '@/lib/bank-alfalah';

/**
 * Payment callback endpoint - called by Bank Alfalah after payment
 * URL: /api/payment/callback
 * 
 * Query params:
 * - app: Application number
 * - txn: Transaction ID from Bank Alfalah
 * - status: Payment status (success/failed)
 * - auth: Auth token for verification
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const applicationNumber = searchParams.get('app');
  const transactionId = searchParams.get('txn') || searchParams.get('transactionId');
  const paymentStatus = searchParams.get('status') || 'pending';
  const authToken = searchParams.get('auth') || searchParams.get('authToken');
  const amount = searchParams.get('amount');

  console.log('Payment callback received:', {
    applicationNumber,
    transactionId,
    paymentStatus,
    authToken: authToken?.substring(0, 20) + '...',
  });

  if (!applicationNumber) {
    return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
  }

  try {
    // Find the application
    const application = await prisma.application.findUnique({
      where: { applicationNumber },
      include: { visaRule: true },
    });

    if (!application) {
      console.error('Application not found:', applicationNumber);
      return NextResponse.redirect(
        new URL(`/confirmation/${applicationNumber}?error=not_found`, request.url)
      );
    }

    // Update application with payment info
    const updateData: any = {
      paymentGateway: 'BANK_ALFALAH',
      paymentTransactionId: transactionId,
      paymentStatus: paymentStatus,
      updatedAt: new Date(),
    };

    // If payment is successful, mark as paid
    if (paymentStatus === 'success' || paymentStatus === 'approved') {
      updateData.status = 'paid';
      updateData.paidAt = new Date();
      
      // Verify payment with Bank Alfalah (optional)
      if (transactionId) {
        try {
          const isValid = await verifyPayment(transactionId);
          if (isValid) {
            console.log('Payment verified successfully:', transactionId);
          }
        } catch (verifyError) {
          console.error('Payment verification error:', verifyError);
        }
      }
    } else if (paymentStatus === 'failed') {
      updateData.status = 'payment_failed';
    }

    await prisma.application.update({
      where: { id: application.id },
      data: updateData,
    });

    // Redirect to confirmation page
    const redirectUrl = `/confirmation/${applicationNumber}?paid=${paymentStatus === 'success' || paymentStatus === 'approved'}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(
      new URL(`/confirmation/${applicationNumber}?error=processing_failed`, request.url)
    );
  }
}

/**
 * POST endpoint for Bank Alfalah to send payment notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Payment webhook received:', JSON.stringify(body).substring(0, 200));

    const { app, txn, status, amount, auth } = body;

    if (!app) {
      return NextResponse.json({ error: 'Application number required' }, { status: 400 });
    }

    // Similar logic to GET
    const application = await prisma.application.findUnique({
      where: { applicationNumber: app },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updateData: any = {
      paymentGateway: 'BANK_ALFALAH',
      paymentTransactionId: txn,
      paymentStatus: status,
      updatedAt: new Date(),
    };

    if (status === 'success' || status === 'approved') {
      updateData.status = 'paid';
      updateData.paidAt = new Date();
    }

    await prisma.application.update({
      where: { id: application.id },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status updated',
      applicationNumber: app,
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
