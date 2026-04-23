/**
 * Payment Webhook API
 * 
 * POST /api/payment/webhook
 * 
 * Server-to-server callback from Bank Alfalah for payment notifications
 * This is the backup for reliable payment status updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyResponseSignature } from '@/lib/alfalah-payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bank Alfalah webhook parameters
    const {
      transactionId,
      transactionStatus,
      responseCode,
      responseMessage,
      amount,
      currency,
      rrn,
      approvalCode,
      signature,
      transactionDateTime,
    } = body;

    console.log('Payment webhook received:', {
      transactionId,
      transactionStatus,
      responseCode,
      amount,
    });

    // Validate required fields
    if (!transactionId) {
      console.error('Webhook missing transactionId');
      return NextResponse.json({ error: 'Missing transactionId' }, { status: 400 });
    }

    // Find application by transaction ID
    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: {
          contains: transactionId,
        },
      },
    });

    if (!application) {
      console.error('Application not found for webhook transaction:', transactionId);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify signature if provided
    if (signature && amount) {
      const isValid = verifyResponseSignature(
        transactionId,
        amount,
        responseCode || '',
        transactionStatus || '',
        signature
      );

      if (!isValid) {
        console.warn('Invalid webhook signature for transaction:', transactionId);
        // Continue anyway - some gateways may not send signatures
      }
    }

    // Determine payment status based on response code
    let paymentStatus = 'pending';
    let isSuccess = false;

    switch (responseCode) {
      case '00':
      case '0':
      case 'CAPTURED':
        paymentStatus = 'paid';
        isSuccess = true;
        break;
      case '01':
      case 'DECLINED':
        paymentStatus = 'failed';
        break;
      case '03':
      case 'CANCELLED':
      case 'USER_CANCELLED':
        paymentStatus = 'failed';
        break;
      case '04':
      case 'HELD_FOR_REVIEW':
        paymentStatus = 'pending';
        break;
      default:
        // Handle transactionStatus field
        if (transactionStatus === 'Captured' || transactionStatus === 'Success') {
          paymentStatus = 'paid';
          isSuccess = true;
        } else if (transactionStatus === 'Failed' || transactionStatus === 'Declined') {
          paymentStatus = 'failed';
        }
    }

    // Update application payment status
    await prisma.application.update({
      where: { id: application.id },
      data: {
        paymentStatus: paymentStatus,
      },
    });

    console.log(`Webhook updated application ${application.applicationNumber} to status: ${paymentStatus}`);

    // Return success response
    return NextResponse.json({
      success: true,
      status: paymentStatus,
      transactionId: transactionId,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also handle GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'active',
    message: 'Payment webhook endpoint is ready',
  });
}