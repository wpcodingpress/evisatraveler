/**
 * Payment Initiation API - Full Flow
 * 
 * POST /api/payment/initiate
 * 
 * Returns HTML that:
 * 1. Does handshake to get AuthToken
 * 2. Auto-posts to SSO with AuthToken
 * 3. Shows Bank Alfalah payment page
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHandshakeFormData, createHandshakeFormHtml, createSSOFormHtml, convertUsdToPkr, generateTransactionRef } from '@/lib/alfalah-payment';
import { prisma } from '@/lib/prisma';

async function doHandshake(config: any): Promise<{ success: boolean; authToken?: string; returnUrl?: string; error?: string }> {
  const params = {
    HS_ChannelId: '1002',
    HS_IsRedirectionRequest: '1',
    HS_MerchantHash: config.merchantHash,
    HS_MerchantId: config.merchantId,
    HS_MerchantPassword: config.password,
    HS_MerchantUsername: config.username,
    HS_ReturnURL: config.returnUrl,
    HS_StoreId: config.storeId,
    HS_TransactionReferenceNumber: config.transactionRef,
  };

  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });

  try {
    const response = await fetch('https://payments.bankalfalah.com/HS/HS/HS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const text = await response.text();
    console.log('Handshake response:', text);

    const data = JSON.parse(text);
    
    if (data.success === 'true' || data.success === true) {
      return {
        success: true,
        authToken: data.AuthToken || data.authToken,
        returnUrl: data.ReturnURL || data.returnUrl || config.returnUrl,
      };
    }

    return {
      success: false,
      error: data.ErrorMessage || data.errorMessage || 'Invalid Request',
    };
  } catch (error: any) {
    console.error('Handshake error:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, amount, customerEmail, customerPhone, customerName } = body;

    if (!applicationId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, amount' },
        { status: 400 }
      );
    }

    let application;
    try {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true },
      });
      
      if (!application) {
        application = await prisma.application.findFirst({
          where: { applicationNumber: applicationId },
          include: { user: true },
        });
      }
    } catch {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const transactionRef = generateTransactionRef(application.applicationNumber);
    const amountInPkr = convertUsdToPkr(amount);

    const config = {
      merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
      storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
      username: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
      password: process.env.BANK_ALFALAH_PASSWORD || 'P4SmutaC6YVvFzk4yqF7CA==',
      merchantHash: process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYyWpNuGSXiBtFvFzk4yqF7CA==',
      key1: process.env.BANK_ALFALAH_KEY1 || 'FWBhnJmJWXuUee2J',
      key2: process.env.BANK_ALFALAH_KEY2 || '3200254418025343',
      returnUrl: process.env.BANK_ALFALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
      transactionRef,
      amount: amountInPkr,
    };

    console.log('Starting payment handshake for:', transactionRef);

    const handshakeResult = await doHandshake(config);

    if (!handshakeResult.success) {
      console.error('Handshake failed:', handshakeResult.error);
      return NextResponse.redirect(
        new URL(`/payment/failed?error=handshake_failed&reason=${encodeURIComponent(handshakeResult.error || 'Payment gateway error')}`, 'https://evisatraveler.com')
      );
    }

    const authToken = handshakeResult.authToken!;
    console.log('Handshake successful, AuthToken:', authToken.substring(0, 30) + '...');

    // Now create SSO form data
    const ssoParams = {
      AuthToken: authToken,
      ChannelId: '1002',
      Currency: 'PKR',
      ReturnURL: config.returnUrl,
      MerchantId: config.merchantId,
      StoreId: config.storeId,
      MerchantHash: config.merchantHash,
      MerchantUsername: config.username,
      MerchantPassword: config.password,
      TransactionTypeId: '3',
      TransactionReferenceNumber: transactionRef,
      TransactionAmount: config.amount.toString(),
    };

    const ssoFormData = {
      authToken: ssoParams.AuthToken,
      channelId: ssoParams.ChannelId,
      currency: ssoParams.Currency,
      returnUrl: ssoParams.ReturnURL,
      merchantId: ssoParams.MerchantId,
      storeId: ssoParams.StoreId,
      merchantHash: ssoParams.MerchantHash,
      merchantUsername: ssoParams.MerchantUsername,
      merchantPassword: ssoParams.MerchantPassword,
      transactionTypeId: ssoParams.TransactionTypeId,
      transactionReferenceNumber: ssoParams.TransactionReferenceNumber,
      transactionAmount: ssoParams.TransactionAmount,
    };

    console.log('Creating SSO form with params:', JSON.stringify(ssoParams));

    const html = createSSOFormHtml(ssoFormData);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const applicationId = searchParams.get('applicationId');
  const amount = searchParams.get('amount');

  if (!applicationId || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters: applicationId, amount' },
      { status: 400 }
    );
  }

  try {
    const amountNum = parseFloat(amount);

    let application;
    try {
      application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true },
      });
      
      if (!application) {
        application = await prisma.application.findFirst({
          where: { applicationNumber: applicationId },
          include: { user: true },
        });
      }
    } catch {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const transactionRef = generateTransactionRef(application.applicationNumber);
    const amountInPkr = convertUsdToPkr(amountNum);

    const config = {
      merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
      storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
      username: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
      password: process.env.BANK_ALFALAH_PASSWORD || 'P4SmutaC6YVvFzk4yqF7CA==',
      merchantHash: process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYyWpNuGSXiBtFvFzk4yqF7CA==',
      key1: process.env.BANK_ALFALAH_KEY1 || 'FWBhnJmJWXuUee2J',
      key2: process.env.BANK_ALFALAH_KEY2 || '3200254418025343',
      returnUrl: process.env.BANK_ALFALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
      transactionRef,
      amount: amountInPkr,
    };

    const handshakeResult = await doHandshake(config);

    if (!handshakeResult.success) {
      return NextResponse.redirect(
        new URL(`/payment/failed?error=handshake_failed&reason=${encodeURIComponent(handshakeResult.error || 'Payment gateway error')}`, 'https://evisatraveler.com')
      );
    }

    const authToken = handshakeResult.authToken!;

    const ssoFormData = {
      authToken: authToken,
      channelId: '1002',
      currency: 'PKR',
      returnUrl: config.returnUrl,
      merchantId: config.merchantId,
      storeId: config.storeId,
      merchantHash: config.merchantHash,
      merchantUsername: config.username,
      merchantPassword: config.password,
      transactionTypeId: '3',
      transactionReferenceNumber: transactionRef,
      transactionAmount: config.amount.toString(),
    };

    const html = createSSOFormHtml(ssoFormData);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}