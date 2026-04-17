const BANK_ALFALAH_BASE_URL = process.env.BANK_ALFALAH_BASE_URL || 'https://pkg.test.bankalfalah.com';
const BANK_ALFALAH_MERCHANT_ID = process.env.BANK_ALFALAH_MERCHANT_ID || 'YOUR_MERCHANT_ID';
const BANK_ALFALAH_PASSWORD = process.env.BANK_ALFALAH_PASSWORD || 'YOUR_PASSWORD';
const BANK_ALFALAH_SECRET_KEY = process.env.BANK_ALFALAH_SECRET_KEY || 'YOUR_SECRET_KEY';

interface PaymentRequest {
  amount: number;
  currency?: string;
  orderId: string;
  productDescription: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export async function initiateBankAlfalahPayment(payment: PaymentRequest): Promise<PaymentResponse> {
  try {
    const payload = {
      merchantId: BANK_ALFALAH_MERCHANT_ID,
      password: BANK_ALFALAH_PASSWORD,
      amount: payment.amount.toString(),
      currency: payment.currency || 'USD',
      orderId: payment.orderId,
      productDescription: payment.productDescription,
      customer: {
        name: payment.customerName,
        email: payment.customerEmail,
        phone: payment.customerPhone,
      },
      signature: generateSignature(payment.orderId, payment.amount, payment.currency || 'USD'),
      returnUrl: payment.callbackUrl,
      // sandbox: true, // Enable for test environment
    };

    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/api/v1/payment/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BANK_ALFALAH_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Bank Alfalah error:', error);
      return { success: false, error: 'Payment initialization failed' };
    }

    const data = await response.json();
    
    return {
      success: true,
      paymentUrl: data.paymentUrl || data.paymentSessionUrl,
      transactionId: data.transactionId || data.sessionId,
    };
  } catch (error) {
    console.error('Bank Alfalah payment error:', error);
    return { success: false, error: 'Payment service unavailable' };
  }
}

function generateSignature(orderId: string, amount: number, currency: string): string {
  const data = `${orderId}${amount}${currency}${BANK_ALFALAH_SECRET_KEY}`;
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function verifyPayment(transactionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/api/v1/payment/verify/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${BANK_ALFALAH_SECRET_KEY}`,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.status === 'AUTHORIZED' || data.status === 'CAPTURED';
  } catch {
    return false;
  }
}

export async function refundPayment(transactionId: string, amount: number): Promise<boolean> {
  try {
    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/api/v1/payment/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BANK_ALFALAH_SECRET_KEY}`,
      },
      body: JSON.stringify({
        transactionId,
        amount: amount.toString(),
        reason: 'Customer refund request',
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

// For demo/mock mode when credentials aren't configured
export async function createPaymentLink(orderId: string, amount: number, description: string): Promise<string> {
  if (BANK_ALFALAH_MERCHANT_ID === 'YOUR_MERCHANT_ID') {
    // Demo mode - return mock success URL
    return `/confirmation/${orderId}?paid=true&mock=true`;
  }
  
  const result = await initiateBankAlfalahPayment({
    amount,
    orderId,
    productDescription: description,
    customerName: 'Customer',
    customerEmail: 'customer@example.com',
    customerPhone: '',
    callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback`,
  });

  return result.paymentUrl || `/confirmation/${orderId}?paid=true&mock=true`;
}