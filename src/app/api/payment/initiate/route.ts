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
import { createSSOFormData, createSSOFormHtml, convertUsdToPkr, generateTransactionRef, generateHandshakeHash } from '@/lib/alfalah-payment';
import { prisma } from '@/lib/prisma';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, amount } = body;

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

    // Do handshake server-to-server
    const handshakeResult = await doHandshake(config);
    
    if (!handshakeResult.success) {
      console.error('Handshake failed:', handshakeResult.error);
      return NextResponse.json(
        { error: 'Handshake failed', message: handshakeResult.error },
        { status: 500 }
      );
    }

    const authToken = handshakeResult.authToken!;
    console.log('Handshake successful, AuthToken:', authToken.substring(0, 30) + '...');

    // Create SSO form data
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

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment', message: error.message },
      { status: 500 }
    );
  }
}

async function doHandshake(config: any): Promise<{ success: boolean; authToken?: string; error?: string }> {
  const params: Record<string, string> = {
    HS_ChannelId: '1001',
    HS_IsRedirectionRequest: '1',
    HS_MerchantId: config.merchantId,
    HS_StoreId: config.storeId,
    HS_ReturnURL: config.returnUrl,
    HS_MerchantHash: config.merchantHash,
    HS_MerchantUsername: config.username,
    HS_MerchantPassword: config.password,
    HS_TransactionReferenceNumber: config.transactionRef,
  };

  const requestHash = generateHandshakeHash(params, config.key1, config.key2);

  // Build form data properly
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('HS_RequestHash', requestHash);

  console.log('Handshake request payload:', formData.toString());

  try {
    // First request - handshake
    const response = await fetch('https://payments.bankalfalah.com/HS/HS/HS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/html, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: formData.toString(),
      redirect: 'manual', // Don't follow redirects - we need to capture the token
      signal: AbortSignal.timeout(30000),
    });

    const status = response.status;
    const contentType = response.headers.get('content-type') || '';
    
    console.log('Handshake response status:', status);
    console.log('Handshake response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
    
    // Check for redirect with token in URL (302/301)
    if (status === 302 || status === 301) {
      const location = response.headers.get('location');
      console.log('Redirect location:', location);
      
      if (location) {
        const url = new URL(location, 'https://payments.bankalfalah.com');
        const token = url.searchParams.get('AuthToken') || 
                      url.searchParams.get('authToken') ||
                      url.searchParams.get('token');
        if (token) {
          console.log('Found auth token in redirect URL');
          return { success: true, authToken: token };
        }
      }
    }
    
    const text = await response.text();
    console.log('Handshake response body (first 500 chars):', text.substring(0, 500));
    
    // Try to find AuthToken in response body
    const tokenMatch = text.match(/AuthToken["\s]*[:=]["\s]*([\w+/=-]+)/i) ||
                      text.match(/authToken["\s]*[:=]["\s]*([\w+/=-]+)/i);
    if (tokenMatch) {
      console.log('Found auth token in response body');
      return { success: true, authToken: tokenMatch[1] };
    }
    
    // Try JSON parsing
    try {
      const data = JSON.parse(text);
      console.log('Parsed handshake JSON:', JSON.stringify(data));
      
      const authToken = data.AuthToken || data.authToken || data.ResponseAuthToken || data.Token;
      
      if (authToken) {
        return { success: true, authToken: authToken };
      }
      
      return {
        success: false,
        error: data.ResponseMessage || data.ErrorMessage || data.errorMessage || data.Message || 'Invalid Request - No Token',
      };
    } catch (e) {
      // Not JSON, return error with response text
      return { 
        success: false, 
        error: 'Handshake failed: ' + text.substring(0, 200) 
      };
    }
  } catch (error: any) {
    console.error('Handshake error:', error);
    if (error.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || error.code === 'ETIMEDOUT') {
      return { 
        success: false, 
        error: 'Unable to connect to payment gateway. Please try again later.' 
      };
    }
    return { success: false, error: error.message || 'Failed to connect to payment gateway' };
  }
}
