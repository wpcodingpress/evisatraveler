/**
 * Insurance Payment Initiation API
 * POST /api/insurance/payment
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
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount' },
        { status: 400 }
      );
    }

    const order = await prisma.insuranceOrder.findUnique({
      where: { id: orderId },
      include: { user: true, insurance: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const transactionRef = generateTransactionRef(order.orderNumber);
    const amountInPkr = convertUsdToPkr(amount);

    const config = {
      merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
      storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
      username: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
      password: process.env.BANK_ALFALAH_PASSWORD || 'P4SmutaC6YVvFzk4yqF7CA==',
      merchantHash: process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYyWpNuGSXiBtFvFzk4yqF7CA==',
      key1: process.env.BANK_ALFALAH_KEY1 || 'FWBhnJmJWXuUee2J',
      key2: process.env.BANK_ALFALAH_KEY2 || '3200254418025343',
      returnUrl: process.env.PAYMENT_INSURANCE_RETURN_URL || 'https://evisatraveler.com/api/payment/insurance-return',
      transactionRef,
      amount: amountInPkr,
    };

    const handshakeResult = await doHandshake(config);
    
    if (!handshakeResult.success) {
      console.error('Handshake failed:', handshakeResult.error);
      return NextResponse.json(
        { error: 'Handshake failed', message: handshakeResult.error },
        { status: 500 }
      );
    }

    const authToken = handshakeResult.authToken!;

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
    HS_MerchantHash: config.merchantHash,
    HS_MerchantId: config.merchantId,
    HS_MerchantPassword: config.password,
    HS_MerchantUsername: config.username,
    HS_ReturnURL: config.returnUrl,
    HS_StoreId: config.storeId,
    HS_TransactionReferenceNumber: config.transactionRef,
  };

  const requestHash = generateHandshakeHash(params, config.key1, config.key2);
  const formData = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('HS_RequestHash', requestHash);

  try {
    const response = await fetch('https://payments.bankalfalah.com/HS/HS/HS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json, text/html, */*',
        'User-Agent': 'Mozilla/5.0',
      },
      body: formData.toString(),
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';

    if (response.status === 200 && contentType.includes('text/html')) {
      const tokenMatch = text.match(/AuthToken["\s]*[:=]["\s]*([\w+/=-]+)/i);
      if (tokenMatch) {
        return { success: true, authToken: tokenMatch[1] };
      }
    }

    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location) {
        const url = new URL(location, 'https://payments.bankalfalah.com');
        const token = url.searchParams.get('AuthToken');
        if (token) {
          return { success: true, authToken: token };
        }
      }
    }

    try {
      const data = JSON.parse(text);
      if (data.AuthToken) {
        return { success: true, authToken: data.AuthToken };
      }
      if (data.ResponseCode === '00') {
        return { success: true, authToken: data.AuthToken };
      }
      return { success: false, error: data.ResponseMessage || 'Invalid Request' };
    } catch {
      const match = text.match(/"AuthToken"\s*:\s*"?([\w+/=-]+)"?/);
      if (match) {
        return { success: true, authToken: match[1] };
      }
      return { success: false, error: 'Failed to get auth token' };
    }
  } catch (error: any) {
    console.error('Handshake error:', error);
    return { success: false, error: error.message };
  }
}