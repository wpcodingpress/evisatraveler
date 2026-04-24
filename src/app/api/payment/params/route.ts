/**
 * Client-Side Payment Parameters API
 * 
 * GET /api/payment/params
 * 
 * Returns payment parameters that client-side JavaScript will use
 * to communicate directly with Bank Alfalah from the user's browser
 * (no server-side connection needed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: applicationId' },
        { status: 400 }
      );
    }

    let application;
    try {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { visaRule: { include: { toCountry: true } }, user: true },
      });

      if (!application) {
        application = await prisma.application.findFirst({
          where: { applicationNumber: applicationId },
          include: { visaRule: { include: { toCountry: true } }, user: true },
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get amount in PKR
    let amountUSD: number;
    if (typeof application.totalAmount === 'number') {
      amountUSD = application.totalAmount;
    } else {
      amountUSD = parseFloat(String(application.totalAmount));
    }
    let amountPKR = Math.round(amountUSD * 280);

    // Generate transaction reference
    const transactionRef = application.applicationNumber.replace(/-/g, '').substring(0, 20);

    // Return payment parameters (no server connection to Bank Alfalah)
    const paymentParams = {
      // Application info
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      amount: amountPKR.toString(),
      amountUSD: amountUSD.toString(),
      currency: 'PKR',
      
      // Transaction reference
      transactionReferenceNumber: transactionRef,
      
      // Bank Alfalah credentials from environment
      merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
      storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
      merchantUsername: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
      merchantPassword: process.env.BANK_ALFALAH_PASSWORD || '',
      merchantHash: process.env.BANK_ALFALAH_SECRET_KEY || '',
      
      // Keys for hash generation
      key1: process.env.BANK_ALFALAH_KEY1 || 'FWBhnJmJWXuUee2J',
      key2: process.env.BANK_ALFALAH_KEY2 || '3200254418025343',
      
      // Return URLs
      returnUrl: process.env.BANK_ALFALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
      
      // Gateway URLs (for client-side)
      handshakeUrl: 'https://payments.bankalfalah.com/HS/HS/HS',
      ssoUrl: 'https://payments.bankalfalah.com/SSO/SSO/SSO',
      
      // Configuration
      channelId: '1002',
      isRedirectionRequest: '1',
      transactionTypeId: '3',
    };

    console.log('Returning payment params for:', transactionRef);

    return NextResponse.json(paymentParams);

  } catch (error) {
    console.error('Payment params error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment parameters' },
      { status: 500 }
    );
  }
}