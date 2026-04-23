/**
 * Payment Return/Callback API
 * 
 * GET /api/payment/return
 * 
 * Handles response from Bank Alfalah after payment completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const transactionId = searchParams.get('transactionId');
    const transactionStatus = searchParams.get('transactionStatus');
    const responseCode = searchParams.get('responseCode');
    const responseMessage = searchParams.get('responseMessage');

    console.log('Payment return received:', {
      transactionId,
      transactionStatus,
      responseCode,
      responseMessage,
    });

    if (!transactionId) {
      return NextResponse.redirect(new URL('/payment/failed?error=no_transaction', request.url));
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: {
          contains: transactionId,
        },
      },
    });

    if (!application) {
      console.error('Application not found for transaction:', transactionId);
      return NextResponse.redirect(new URL('/payment/failed?error=app_not_found', request.url));
    }

    const isSuccess = responseCode === '00' || responseCode === '0' || transactionStatus === 'Captured';

    if (isSuccess) {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'paid',
        },
      });

      console.log('Payment successful for application:', application.applicationNumber);
      return NextResponse.redirect(
        new URL(`/confirmation/${application.applicationNumber}?paid=true`, request.url)
      );
    } else {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'failed',
        },
      });

      console.log('Payment failed for application:', application.applicationNumber, 'Reason:', responseMessage);
      return NextResponse.redirect(
        new URL(`/payment/failed?app=${application.applicationNumber}&reason=${encodeURIComponent(responseMessage || 'Payment failed')}`, request.url)
      );
    }

  } catch (error) {
    console.error('Payment return error:', error);
    return NextResponse.redirect(new URL('/payment/failed?error=server_error', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const transactionId = formData.get('transactionId') as string;
    const transactionStatus = formData.get('transactionStatus') as string;
    const responseCode = formData.get('responseCode') as string;
    const responseMessage = formData.get('responseMessage') as string;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com';

    console.log('Payment return (POST) received:', {
      transactionId,
      transactionStatus,
      responseCode,
      responseMessage,
    });

    if (!transactionId) {
      return NextResponse.redirect(new URL('/payment/failed?error=no_transaction', siteUrl));
    }

    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: {
          contains: transactionId,
        },
      },
    });

    if (!application) {
      console.error('Application not found for transaction:', transactionId);
      return NextResponse.redirect(new URL('/payment/failed?error=app_not_found', siteUrl));
    }

    const isSuccess = responseCode === '00' || responseCode === '0' || transactionStatus === 'Captured';

    if (isSuccess) {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'paid',
        },
      });

      return NextResponse.redirect(new URL(`/confirmation/${application.applicationNumber}?paid=true`, siteUrl));
    } else {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'failed',
        },
      });

      return NextResponse.redirect(
        new URL(`/payment/failed?app=${application.applicationNumber}&reason=${encodeURIComponent(responseMessage || 'Payment failed')}`, siteUrl)
      );
    }

  } catch (error) {
    console.error('Payment return (POST) error:', error);
    return NextResponse.redirect(new URL('/payment/failed?error=server_error', process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com'));
  }
}