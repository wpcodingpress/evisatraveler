/**
 * GET /api/payment/params
 * 
 * Returns payment parameters for client-side Bank Alfalah integration
 * Uses official production URLs: payments.bankalfalah.com
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing required parameter: applicationId' },
        { status: 400 }
      );
    }

    // Get application from database
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

    // Calculate amount in PKR (1 USD = 280 PKR)
    const amountUSD = typeof application.totalAmount === 'number' 
      ? application.totalAmount 
      : parseFloat(String(application.totalAmount));
    const amountPKR = Math.round(amountUSD * 280);

    // Generate transaction reference (max 20 chars, no dashes)
    const transactionRef = application.applicationNumber.replace(/-/g, '').substring(0, 20);

    // Bank Alfalah official production URLs
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
      
      // Encryption keys
      key1: process.env.BANK_ALFALAH_KEY1 || 'FWBhnJmJWXuUee2J',
      key2: process.env.BANK_ALFALAH_KEY2 || '3200254418025343',
      
      // Return URL after payment
      returnUrl: process.env.BANK_ALFALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
      
      // Official Production URLs (per documentation)
      handshakeUrl: 'https://payments.bankalfalah.com/HS/HS/HS',
      ssoUrl: 'https://payments.bankalfalah.com/SSO/SSO/SSO',
      
      // Channel 1001 = Page Redirection (Alfa Wallet, Card, Account)
      channelId: '1001',
      channelIdApi: '1002',
      isRedirectionRequest: '1',
      transactionTypeId: '1',  // 1 = Wallet
    };

    console.log('Returning payment params for:', transactionRef, 'channel:', paymentParams.channelId);

    return NextResponse.json(paymentParams);

  } catch (error) {
    console.error('Payment params error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment parameters' },
      { status: 500 }
    );
  }
}