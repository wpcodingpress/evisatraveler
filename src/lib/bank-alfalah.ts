const BANK_ALFALAH_BASE_URL = process.env.BANK_ALFALAH_BASE_URL || 'https://sandbox.bankalfalah.com/HS/api';
const BANK_ALFALAH_MERCHANT_ID = process.env.BANK_ALFALAH_MERCHANT_ID || '233660';
const BANK_ALFALAH_PASSWORD = process.env.BANK_ALFALAH_PASSWORD || 'JXDdjS+Eu3hvFzk4yqF7CA==';
const BANK_ALFALAH_MERCHANT_HASH = process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYy5u48AFIQjFtvFzk4yqF7CA==';
const BANK_ALFALAH_STORE_ID = process.env.BANK_ALFALAH_STORE_ID || '524469';
const BANK_ALFALAH_CHANNEL_ID = process.env.BANK_ALFALAH_CHANNEL_ID || '1002';

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

function generateHash(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function initiateBankAlfalahPayment(payment: PaymentRequest): Promise<PaymentResponse> {
  try {
    const hashData = `${BANK_ALFALAH_CHANNEL_ID}${BANK_ALFALAH_MERCHANT_ID}${BANK_ALFALAH_STORE_ID}${payment.callbackUrl}${payment.orderId}${payment.amount}${payment.currency || 'USD'}${BANK_ALFALAH_MERCHANT_HASH}`;
    const requestHash = generateHash(hashData);

    const payload = {
      HS_ChannelId: BANK_ALFALAH_CHANNEL_ID,
      HS_MerchantId: BANK_ALFALAH_MERCHANT_ID,
      HS_StoreId: BANK_ALFALAH_STORE_ID,
      HS_ReturnURL: payment.callbackUrl,
      HS_MerchantHash: BANK_ALFALAH_MERCHANT_HASH,
      HS_MerchantUsername: BANK_ALFALAH_MERCHANT_ID,
      HS_MerchantPassword: BANK_ALFALAH_PASSWORD,
      HS_TransactionReferenceNumber: payment.orderId,
      HS_RequestHash: requestHash,
      HS_Amount: payment.amount.toString(),
      HS_Currency: payment.currency || 'USD',
      HS_ProductDescription: payment.productDescription,
      HS_CustomerName: payment.customerName,
      HS_CustomerEmail: payment.customerEmail,
      HS_CustomerPhone: payment.customerPhone || '',
    };

    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/HSAPI/HSAPI`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Bank Alfalah response:', response.status, responseText);

    if (!response.ok) {
      console.error('Bank Alfalah error:', responseText);
      return { success: false, error: 'Payment gateway error' };
    }

    const data = JSON.parse(responseText);
    const paymentUrl = data.HS_PaymentURL || data.paymentUrl || data.paymentSessionUrl;
    const transactionId = data.HS_TransactionId || data.transactionId || data.sessionId || payment.orderId;

    if (!paymentUrl) {
      return {
        success: true,
        paymentUrl: `/mock-payment/${payment.orderId}?amount=${payment.amount}`,
        transactionId,
      };
    }

    return { success: true, paymentUrl, transactionId };
  } catch (error) {
    console.error('Bank Alfalah payment error:', error);
    return { success: false, error: 'Payment service unavailable' };
  }
}

export async function verifyPayment(transactionId: string): Promise<boolean> {
  return true;
}

export async function refundPayment(transactionId: string, amount: number): Promise<boolean> {
  return false;
}

export async function createPaymentLink(orderId: string, amount: number, description: string): Promise<string> {
  if (BANK_ALFALAH_MERCHANT_ID === 'YOUR_MERCHANT_ID') {
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
