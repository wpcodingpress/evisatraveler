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

    let order;
    try {
      order = await prisma.insuranceOrder.findUnique({
        where: { id: orderId },
        include: { user: true, insurance: true },
      });
      
      if (!order) {
        order = await prisma.insuranceOrder.findFirst({
          where: { orderNumber: orderId },
          include: { user: true, insurance: true },
        });
      }
    } catch {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://evisatraveler.com',
        'Referer': 'https://evisatraveler.com/',
      },
      body: formData.toString(),
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });

    const text = await response.text();
    const status = response.status;
    const contentType = response.headers.get('content-type') || '';
    
    if (status === 200 && contentType.includes('text/html')) {
      const tokenMatch = text.match(/AuthToken["\s]*[:=]["\s]*([\w+/=-]+)/i);
      if (tokenMatch) {
        return { success: true, authToken: tokenMatch[1] };
      }
    }

    if (status === 302 || status === 301) {
      const location = response.headers.get('location');
      if (location) {
        const url = new URL(location, 'https://payments.bankalfalah.com');
        const token = url.searchParams.get('AuthToken') || url.searchParams.get('authToken') || url.searchParams.get('token');
        if (token) {
          return { success: true, authToken: token };
        }
      }
    }

    try {
      const data = JSON.parse(text);
      console.log('Handshake response:', JSON.stringify(data));
      
      if (data.AuthToken || data.authToken || data.ResponseAuthToken) {
        return { success: true, authToken: data.AuthToken || data.authToken || data.ResponseAuthToken };
      }
      
      if (data.ResponseCode === '00' || data.ResponseCode === '000' || data.ResponseStatus === 'Success') {
        return { success: true, authToken: data.AuthToken || data.authToken };
      }
      
      return {
        success: false,
        error: data.ResponseMessage || data.ErrorMessage || data.message || 'Invalid Request',
      };
    } catch {
      const patterns = [
        /"AuthToken"\s*:\s*"?([\w+/=-]+)"?/,
        /AuthToken\s*[:=]\s*([\w+/=-]+)/,
        /authToken\s*[:=]\s*([\w+/=-]+)/,
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          return { success: true, authToken: match[1] };
        }
      }
      
      return { success: false, error: 'Failed to get auth token' };
    }
  } catch (error: any) {
    console.error('Handshake error:', error);
    return { success: false, error: error.message || 'Failed to connect to payment gateway' };
  }
}