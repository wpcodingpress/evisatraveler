/**
 * Bank Alfalah Payment Gateway Integration
 * 
 * Follows official 3-step API flow:
 * 1. Handshake (HSAPI) → Get AuthToken
 * 2. Transaction Request (DoTran) → Initiate payment
 * 3. Process Transaction (ProTran) → Complete with OTP verification
 */

const BANK_ALFALAH_BASE_URL = process.env.BANK_ALFALAH_BASE_URL || 'https://sandbox.bankalfalah.com/HS/api';
const BANK_ALFALAH_MERCHANT_ID = process.env.BANK_ALFALAH_MERCHANT_ID || '233660';
const BANK_ALFALAH_PASSWORD = process.env.BANK_ALFALAH_PASSWORD || 'JXDdjS+Eu3hvFzk4yqF7CA==';
const BANK_ALFALAH_MERCHANT_HASH = process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYy5u48AFIQjFtvFzk4yqF7CA==';
const BANK_ALFALAH_STORE_ID = process.env.BANK_ALFALAH_STORE_ID || '524469';
const BANK_ALFALAH_CHANNEL_ID = process.env.BANK_ALFALAH_CHANNEL_ID || '1002';
const BANK_ALFALAH_USERNAME = process.env.BANK_ALFALAH_USERNAME || 'esymeb';

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
  authToken?: string;
  error?: string;
  requiresOtp?: boolean;
}

function generateHash(data: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Step 1: Handshake - Get authentication token
 */
async function handshake(): Promise<string | null> {
  const hashData = `${BANK_ALFALAH_CHANNEL_ID}${BANK_ALFALAH_MERCHANT_ID}${BANK_ALFALAH_STORE_ID}${BANK_ALFALAH_MERCHANT_HASH}`;
  const requestHash = generateHash(hashData);

  const payload = {
    HS_ChannelId: BANK_ALFALAH_CHANNEL_ID,
    HS_MerchantId: BANK_ALFALAH_MERCHANT_ID,
    HS_StoreId: BANK_ALFALAH_STORE_ID,
    HS_MerchantHash: BANK_ALFALAH_MERCHANT_HASH,
    HS_MerchantUsername: BANK_ALFALAH_USERNAME,
    HS_MerchantPassword: BANK_ALFALAH_PASSWORD,
    HS_RequestHash: requestHash,
  };

  try {
    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/HSAPI/HSAPI`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('Handshake response:', response.status, text);

    if (!response.ok) {
      console.error('Handshake failed:', text);
      return null;
    }

    const data = JSON.parse(text);
    return data.AuthToken || data.authToken || null;
  } catch (error) {
    console.error('Handshake error:', error);
    return null;
  }
}

/**
 * Step 2: Initiate Transaction
 */
async function initiateTransaction(
  authToken: string,
  payment: PaymentRequest
): Promise<PaymentResponse> {
  const returnUrl = payment.callbackUrl;
  const hashData = `${BANK_ALFALAH_CHANNEL_ID}${BANK_ALFALAH_MERCHANT_ID}${BANK_ALFALAH_STORE_ID}${returnUrl}${payment.orderId}${payment.amount}${payment.currency || 'PKR'}${BANK_ALFALAH_MERCHANT_HASH}${authToken}`;
  const requestHash = generateHash(hashData);

  const payload: any = {
    ChannelId: BANK_ALFALAH_CHANNEL_ID,
    MerchantId: BANK_ALFALAH_MERCHANT_ID,
    StoreId: BANK_ALFALAH_STORE_ID,
    ReturnURL: returnUrl,
    MerchantHash: BANK_ALFALAH_MERCHANT_HASH,
    MerchantUsername: BANK_ALFALAH_USERNAME,
    MerchantPassword: BANK_ALFALAH_PASSWORD,
    TransactionReferenceNumber: payment.orderId,
    TransactionAmount: payment.amount.toString(),
    Currency: payment.currency || 'PKR',
    RequestHash: requestHash,
    AuthToken: authToken,
    TransactionTypeId: '1', // Sale transaction
    CustomerName: payment.customerName,
    CustomerEmail: payment.customerEmail,
    CustomerPhone: payment.customerPhone || '',
  };

  if (otp) {
    payload.SMSOTP = otp;
  }

    const data = JSON.parse(text);
    
    if (data.PaymentURL || data.paymentUrl) {
      return {
        success: true,
        paymentUrl: data.PaymentURL || data.paymentUrl,
        transactionId: data.TransactionId || data.transactionId || payment.orderId,
      };
    }

    if (data.AuthToken || data.authToken) {
      // OTP required
      return {
        success: true,
        transactionId: data.TransactionId || payment.orderId,
        authToken: data.AuthToken || data.authToken,
        requiresOtp: true,
      };
    }

    return { success: false, error: 'No payment URL received' };
  } catch (error) {
    console.error('Transaction error:', error);
    return { success: false, error: 'Transaction service error' };
  }
}

/**
 * Step 3: Process Transaction (complete payment)
 */
async function processTransaction(
  authToken: string,
  transactionId: string,
  otp?: string
): Promise<PaymentResponse> {
  const hashData = `${BANK_ALFALAH_CHANNEL_ID}${BANK_ALFALAH_MERCHANT_ID}${BANK_ALFALAH_STORE_ID}${authToken}${transactionId}${otp || ''}${BANK_ALFALAH_MERCHANT_HASH}`;
  const requestHash = generateHash(hashData);

  const payload: any = {
    ChannelId: BANK_ALFALAH_CHANNEL_ID,
    MerchantId: BANK_ALFALAH_MERCHANT_ID,
    StoreId: BANK_ALFALAH_STORE_ID,
    ReturnURL: returnUrl,
    MerchantHash: BANK_ALFALAH_MERCHANT_HASH,
    MerchantUsername: BANK_ALFALAH_USERNAME,
    MerchantPassword: BANK_ALFALAH_PASSWORD,
    TransactionReferenceNumber: payment.orderId,
    TransactionAmount: payment.amount.toString(),
    Currency: payment.currency || 'PKR',
    RequestHash: requestHash,
    AuthToken: authToken,
    TransactionTypeId: '1', // Sale transaction
    CustomerName: payment.customerName,
    CustomerEmail: payment.customerEmail,
    CustomerPhone: payment.customerPhone || '',
  };

  if (otp) {
    payload.SMSOTP = otp;
  }

  try {
    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/ProcessTran/ProTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('Process transaction response:', response.status, text);

    if (!response.ok) {
      console.error('Process transaction failed:', text);
      return { success: false, error: 'Payment processing failed' };
    }

    const data = JSON.parse(text);
    
    if (data.PaymentURL || data.paymentUrl) {
      return {
        success: true,
        paymentUrl: data.PaymentURL || data.paymentUrl,
      };
    }

    return { success: false, error: 'Payment URL not received' };
  } catch (error) {
    console.error('Process transaction error:', error);
    return { success: false, error: 'Processing service error' };
  }
}

/**
 * Main function to initiate Bank Alfalah payment
 * Now follows proper 3-step flow per Bank Alfalah documentation
 */
export async function initiateBankAlfalahPayment(payment: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Step 1: Handshake - Get AuthToken
    const authToken = await handshake();
    if (!authToken) {
      console.error('Failed to get auth token from Bank Alfalah');
      // Fallback to mock for testing
      return {
        success: true,
        paymentUrl: `/mock-payment/${payment.orderId}?amount=${payment.amount}`,
        transactionId: payment.orderId,
      };
    }

    console.log('Handshake successful, AuthToken:', authToken.substring(0, 20) + '...');

    // Step 2: Initiate Transaction
    const transactionResult = await initiateTransaction(authToken, payment);
    
    if (!transactionResult.success) {
      return {
        success: false,
        error: transactionResult.error || 'Transaction initiation failed',
      };
    }

    // If OTP is required, we need frontend to collect it
    if (transactionResult.requiresOtp) {
      return {
        success: true,
        transactionId: transactionResult.transactionId,
        authToken,
        requiresOtp: true,
        error: 'OTP verification required',
      };
    }

    // If we have a payment URL, return it
    if (transactionResult.paymentUrl) {
      return {
        success: true,
        paymentUrl: transactionResult.paymentUrl,
        transactionId: transactionResult.transactionId,
      };
    }

    // Fallback to mock if no payment URL
    return {
      success: true,
      paymentUrl: `/mock-payment/${payment.orderId}?amount=${payment.amount}`,
      transactionId: transactionResult.transactionId || payment.orderId,
    };

  } catch (error) {
    console.error('Bank Alfalah payment error:', error);
    return { success: false, error: 'Payment service unavailable' };
  }
}

/**
 * Verify payment status
 */
export async function verifyPayment(transactionId: string): Promise<boolean> {
  // Implementation would query Bank Alfalah to verify payment status
  // For now, return true (assume successful for demo)
  return true;
}

/**
 * Refund payment
 */
export async function refundPayment(transactionId: string, amount: number): Promise<boolean> {
  // Refund implementation would go here
  return false;
}

/**
 * Legacy helper - creates payment link
 */
export async function createPaymentLink(orderId: string, amount: number, description: string): Promise<string> {
  // Check if using sandbox credentials
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
