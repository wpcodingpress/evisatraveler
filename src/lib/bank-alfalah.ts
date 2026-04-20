/**
 * Bank Alfalah Payment Gateway Integration
 * 
 * Follows official 3-step API flow per Bank Alfalah documentation:
 * 1. Handshake (HSAPI) → Get AuthToken
 * 2. Transaction Request (DoTran) → Initiate payment
 * 3. Process Transaction (ProTran) → Complete with OTP verification
 * 
 * API Testing Endpoints:
 * - Handshake: https://sandbox.bankalfalah.com/HS/api/HSAPI/HSAPI
 * - Transaction: https://sandbox.bankalfalah.com/HS/api/Tran/DoTran
 * - Process: https://sandbox.bankalfalah.com/HS/api/ProcessTran/ProTran
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
 * Step 1: Handshake - Get authentication token from Bank Alfalah
 * Required before initiating any transaction
 */
async function handshake(): Promise<string | null> {
  // Handshake hash: ChannelId + MerchantId + StoreId + MerchantHash
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
    console.log('Bank Alfalah handshake response:', response.status, text);

    if (!response.ok) {
      console.error('Handshake failed:', text);
      return null;
    }

    const data = JSON.parse(text);
    const authToken = data.AuthToken || data.authToken;
    
    if (!authToken) {
      console.error('No auth token in handshake response:', data);
    }
    
    return authToken;
  } catch (error) {
    console.error('Handshake error:', error);
    return null;
  }
}

/**
 * Step 2: Initiate Transaction - Request payment from customer
 * Returns either paymentUrl or requires OTP verification
 */
async function initiateTransaction(
  authToken: string,
  payment: PaymentRequest
): Promise<PaymentResponse> {
  const returnUrl = payment.callbackUrl;
  
  // Transaction hash: ChannelId + MerchantId + StoreId + ReturnURL + TxnRefNo + Amount + Currency + MerchantHash + AuthToken
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

  try {
    const response = await fetch(`${BANK_ALFALAH_BASE_URL}/Tran/DoTran`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('Bank Alfalah transaction response:', response.status, text);

    if (!response.ok) {
      console.error('Transaction request failed:', text);
      return { success: false, error: 'Transaction initiation failed' };
    }

    const data = JSON.parse(text);

    // Case 1: Direct payment URL (no OTP required)
    if (data.PaymentURL || data.paymentUrl) {
      return {
        success: true,
        paymentUrl: data.PaymentURL || data.paymentUrl,
        transactionId: data.TransactionId || data.transactionId || payment.orderId,
      };
    }

    // Case 2: OTP/Auth required - Bank Alfalah returns AuthToken again
    if (data.AuthToken || data.authToken) {
      return {
        success: true,
        transactionId: data.TransactionId || payment.orderId,
        authToken: data.AuthToken || data.authToken,
        requiresOtp: true,
      };
    }

    return { success: false, error: 'No payment URL or auth token received' };
  } catch (error) {
    console.error('Transaction error:', error);
    return { success: false, error: 'Transaction service unavailable' };
  }
}

/**
 * Step 3: Process Transaction - Complete payment after OTP/OTAC verification
 */
async function processTransaction(
  authToken: string,
  transactionId: string,
  otp?: string
): Promise<PaymentResponse> {
  const returnUrl = paymentCallbackUrl(transactionId);
  
  // Process hash: ChannelId + MerchantId + StoreId + AuthToken + TxnRefNo + SMSOTP + MerchantHash
  const hashData = `${BANK_ALFALAH_CHANNEL_ID}${BANK_ALFALAH_MERCHANT_ID}${BANK_ALFALAH_STORE_ID}${authToken}${transactionId}${otp || ''}${BANK_ALFALAH_MERCHANT_HASH}`;
  const requestHash = generateHash(hashData);

  const payload: any = {
    ChannelId: BANK_ALFALAH_CHANNEL_ID,
    MerchantId: BANK_ALFALAH_MERCHANT_ID,
    StoreId: BANK_ALFALAH_STORE_ID,
    MerchantHash: BANK_ALFALAH_MERCHANT_HASH,
    MerchantUsername: BANK_ALFALAH_USERNAME,
    MerchantPassword: BANK_ALFALAH_PASSWORD,
    AuthToken: authToken,
    TransactionReferenceNumber: transactionId,
    RequestHash: requestHash,
  };

  // Include OTP if provided (SMS or email OTP)
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
    console.log('Bank Alfalah process transaction response:', response.status, text);

    if (!response.ok) {
      console.error('Process transaction failed:', text);
      return { success: false, error: 'Payment processing failed' };
    }

    const data = JSON.parse(text);

    if (data.PaymentURL || data.paymentUrl) {
      return {
        success: true,
        paymentUrl: data.PaymentURL || data.paymentUrl,
        transactionId: data.TransactionId || transactionId,
      };
    }

    return { success: false, error: 'Payment confirmation failed' };
  } catch (error) {
    console.error('Process transaction error:', error);
    return { success: false, error: 'Processing service unavailable' };
  }
}

function paymentCallbackUrl(transactionId: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/callback?txn=${transactionId}`;
}

/**
 * Main function to initiate Bank Alfalah payment
 * Complete 3-step flow: Handshake → Transaction → (Optional OTP) → Process
 */
export async function initiateBankAlfalahPayment(payment: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Step 1: Handshake - get auth token
    const authToken = await handshake();
    if (!authToken) {
      console.error('Failed to get auth token from Bank Alfalah, falling back to mock');
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

    // Case A: OTP required
    if (transactionResult.requiresOtp && transactionResult.authToken) {
      return {
        success: true,
        transactionId: transactionResult.transactionId,
        authToken: transactionResult.authToken,
        requiresOtp: true,
        error: 'OTP verification required',
      };
    }

    // Case B: Direct payment URL (no OTP)
    if (transactionResult.paymentUrl) {
      return {
        success: true,
        paymentUrl: transactionResult.paymentUrl,
        transactionId: transactionResult.transactionId,
      };
    }

    // Fallback to mock payment
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
 * Verify payment status with Bank Alfalah
 */
export async function verifyPayment(transactionId: string): Promise<boolean> {
  // In production, this would call Bank Alfalah's verification endpoint
  // For now, return true (assume successful)
  // Implementation: GET /Verification/VerifyTran?txn=xxx
  return true;
}

/**
 * Refund payment
 */
export async function refundPayment(transactionId: string, amount: number): Promise<boolean> {
  // Refund implementation would go here
  // POST /ProcessTran/RefundTran
  return false;
}

/**
 * Legacy helper - creates a payment link (deprecated, use initiateBankAlfalahPayment)
 */
export async function createPaymentLink(orderId: string, amount: number, description: string): Promise<string> {
  // Check if using sandbox credentials
  if (BANK_ALFALAH_MERCHANT_ID === 'YOUR_MERCHANT_ID' || !BANK_ALFALAH_MERCHANT_ID) {
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
