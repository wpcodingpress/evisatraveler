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
import { createHandshakeFormData, createSSOFormData, createSSOFormHtml, convertUsdToPkr, generateTransactionRef, generateHandshakeHash } from '@/lib/alfalah-payment';
import { prisma } from '@/lib/prisma';

async function doHandshake(config: any): Promise<{ success: boolean; authToken?: string; returnUrl?: string; error?: string }> {
  const params: Record<string, string> = {
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

  // Generate RequestHash using the proper function
  const requestHash = generateHandshakeHash(params, config.key1, config.key2);

  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('HS_RequestHash', requestHash);

  try {
    const response = await fetch('https://payments.bankalfalah.com/HS/HS/HS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: AbortSignal.timeout(30000),
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
    
    if (error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || error.code === 'ETIMEDOUT') {
      return { 
        success: false, 
        error: 'Unable to connect to payment gateway. Please try again later or contact support.' + 
               ' (Network timeout - your server may have connectivity issues with the payment provider)' 
      };
    }
    
    return { success: false, error: error.message || 'Failed to connect to payment gateway' };
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, amount, customerEmail, customerPhone, customerName } = body;
    
    if (!applicationId || !amount) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: applicationId, amount' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
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
      return new NextResponse(
        JSON.stringify({ error: 'Database unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }
    
    if (!application) {
      return new NextResponse(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
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
    
    // Create SSO form data with proper hash generation
    const paymentRequest = {
      transactionReferenceNumber: transactionRef,
      amount: config.amount,
      currency: 'PKR',
      transactionTypeId: '3',
    };
    
    const ssoFormData = createSSOFormData(paymentRequest, authToken);
    const html = createSSOFormHtml(ssoFormData);
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Payment initiation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to initiate payment' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
        }
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

    // Create SSO form data with proper hash generation
    const paymentRequest = {
      transactionReferenceNumber: transactionRef,
      amount: config.amount,
      currency: 'PKR',
      transactionTypeId: '3',
    };

    const ssoFormData = createSSOFormData(paymentRequest, authToken);
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
    return new NextResponse(
      JSON.stringify({ error: 'Missing required parameters: applicationId, amount' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
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
      return new NextResponse(
        JSON.stringify({ error: 'Database unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!application) {
      return new NextResponse(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const transactionRef = generateTransactionRef(application.applicationNumber);
    const amountInPkr = convertUsdToPkr(amountNum);

    const config = {
      merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
      storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
      username: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
      password: process.env.BANK_ALFALAH_PASSWORD || 'P4SmutaC6YVvFzk4yqF7CA==',
      merchantHash: process.env.BANK_ALF_ALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYyWpNuGSXiBtFvFzk4yqF7CA==',
      key1: process.env.BANK_ALF_ALAH_KEY1 || 'FWBhnJmJWXuUee2J',
      key2: process.env.BANK_ALF_ALAH_KEY2 || '3200254418025343',
      returnUrl: process.env.BANK_ALF_ALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
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

    // Create SSO form data with proper hash generation
    const paymentRequest = {
      transactionReferenceNumber: transactionRef,
      amount: config.amount,
      currency: 'PKR',
      transactionTypeId: '3',
    };

    const ssoFormData = createSSOFormData(paymentRequest, authToken);
    const html = createSSOFormHtml(ssoFormData);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to initiate payment' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
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

    // Create SSO form data with proper hash generation
    const paymentRequest = {
      transactionReferenceNumber: transactionRef,
      amount: config.amount,
      currency: 'PKR',
      transactionTypeId: '3',
    };

    const ssoFormData = createSSOFormData(paymentRequest, authToken);
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