/**
 * Bank Alfalah Alfa Payment Gateway (APG) - Complete Integration
 * 
 * Based on APG Merchant Integration Guide v1.1
 * 
 * Flow:
 * 1. HS (Handshake) - POST to /HS/HS/HS with encrypted RequestHash
 * 2. SSO - POST to /SSO/SSO/SSO with AuthToken
 * 3. IPN - Check transaction status via /HS/api/IPN/OrderStatus/
 */

import crypto from 'crypto';

interface APGConfig {
  merchantId: string;
  storeId: string;
  username: string;
  password: string;
  merchantHash: string;
  key1: string;
  key2: string;
  isProduction: boolean;
  returnUrl: string;
  ipnUrl: string;
}

interface PaymentRequest {
  transactionReferenceNumber: string;
  amount: number;
  currency?: string;
  transactionTypeId?: string;
  productDetail?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerName?: string;
}

interface HandshakeResponse {
  success: boolean;
  authToken: string;
  returnUrl: string;
  errorMessage?: string;
}

interface PaymentFormData {
  channelId: string;
  merchantId: string;
  storeId: string;
  returnUrl: string;
  merchantHash: string;
  merchantUsername: string;
  merchantPassword: string;
  transactionReferenceNumber: string;
  requestHash: string;
  isRedirectionRequest: string;
  authToken?: string;
  currency?: string;
  transactionTypeId?: string;
  transactionAmount?: string;
  ipnUrl?: string;
}

function getConfig(): APGConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log('APG Config:', {
    merchantId: process.env.BANK_ALFALAH_MERCHANT_ID,
    storeId: process.env.BANK_ALFALAH_STORE_ID,
    username: process.env.BANK_ALFALAH_USERNAME,
    isProduction,
    nodeEnv: process.env.NODE_ENV,
  });
  return {
    merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
    storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
    username: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
    password: process.env.BANK_ALFALAH_PASSWORD || 'P4SmutaC6YVvFzk4yqF7CA==',
    merchantHash: process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYyWpNuGSXiBtFvFzk4yqF7CA==',
    key1: process.env.BANK_ALFALAH_KEY1 || 'FWBhnJmJWXuUee2J',
    key2: process.env.BANK_ALFALAH_KEY2 || '3200254418025343',
    isProduction,
    returnUrl: process.env.BANK_ALFALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
    ipnUrl: process.env.BANK_ALFALAH_WEBHOOK_URL || 'https://evisatraveler.com/api/payment/webhook',
  };
}

export function getGatewayUrls() {
  const config = getConfig();
  return {
    handshakeUrl: config.isProduction 
      ? 'https://payments.bankalfalah.com/HS/HS/HS' 
      : 'https://sandbox.bankalfalah.com/HS/HS/HS',
    ssoUrl: config.isProduction 
      ? 'https://payments.bankalfalah.com/SSO/SSO/SSO' 
      : 'https://sandbox.bankalfalah.com/SSO/SSO/SSO',
    ipnUrl: config.isProduction 
      ? 'https://payments.bankalfalah.com/HS/api/IPN/OrderStatus' 
      : 'https://sandbox.bankalfalah.com/HS/api/IPN/OrderStatus',
  };
}

/**
 * AES Encryption for RequestHash
 * Algorithm: AES/CBC/PKCS7Padding
 * Key: Key1 (128-bit)
 * IV: Key2
 */
export function encryptRequestHash(data: string, key1: string, key2: string): string {
  const key = Buffer.from(key1, 'utf8').slice(0, 16);
  const iv = Buffer.from(key2, 'utf8').slice(0, 16);
  
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}

/**
 * Verify webhook signature
 */
export function verifyResponseSignature(
  transactionId: string,
  amount: string,
  responseCode: string,
  status: string,
  signature: string
): boolean {
  const config = getConfig();
  
  const data = `${transactionId}${amount}${responseCode}${status}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.merchantHash)
    .update(data)
    .digest('base64');
  
  return signature === expectedSignature;
}

/**
 * Generate map string for hash calculation
 * Format: key1=value1&key2=value2&...
 */
function generateMapString(params: Record<string, string>): string {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

/**
 * Generate Handshake Request Hash
 */
export function generateHandshakeHash(params: Record<string, string>, key1: string, key2: string): string {
  const mapString = generateMapString(params);
  return encryptRequestHash(mapString, key1, key2);
}

/**
 * Create Handshake form data
 */
export function createHandshakeFormData(payment: PaymentRequest): PaymentFormData {
  const config = getConfig();
  const currency = payment.currency || 'PKR';
  const transactionTypeId = payment.transactionTypeId || '3';
  
  const params: Record<string, string> = {
    HS_ChannelId: '1001',
    HS_MerchantId: config.merchantId,
    HS_StoreId: config.storeId,
    HS_ReturnURL: config.returnUrl,
    HS_MerchantHash: config.merchantHash,
    HS_MerchantUsername: config.username,
    HS_MerchantPassword: config.password,
    HS_TransactionReferenceNumber: payment.transactionReferenceNumber,
  };
  
  const requestHash = generateHandshakeHash(params, config.key1, config.key2);
  
  return {
    channelId: '1001',
    merchantId: config.merchantId,
    storeId: config.storeId,
    returnUrl: config.returnUrl,
    merchantHash: config.merchantHash,
    merchantUsername: config.username,
    merchantPassword: config.password,
    transactionReferenceNumber: payment.transactionReferenceNumber,
    requestHash,
    isRedirectionRequest: '1',
  };
}

/**
 * Create SSO form data (after receiving AuthToken)
 */
export function createSSOFormData(payment: PaymentRequest, authToken: string): PaymentFormData {
  const config = getConfig();
  const currency = payment.currency || 'PKR';
  const transactionTypeId = payment.transactionTypeId || '3';
  const amountStr = payment.amount.toFixed(2);
  
  const params: Record<string, string> = {
    ChannelId: '1001',
    MerchantId: config.merchantId,
    StoreId: config.storeId,
    ReturnURL: config.returnUrl,
    MerchantHash: config.merchantHash,
    MerchantUsername: config.username,
    MerchantPassword: config.password,
    TransactionTypeId: transactionTypeId,
    TransactionReferenceNumber: payment.transactionReferenceNumber,
    TransactionAmount: amountStr,
    AuthToken: authToken,
    Currency: currency,
  };
  
  const mapString = generateMapString(params);
  const requestHash = encryptRequestHash(mapString, config.key1, config.key2);
  
  return {
    channelId: '1001',
    merchantId: config.merchantId,
    storeId: config.storeId,
    returnUrl: config.returnUrl,
    merchantHash: config.merchantHash,
    merchantUsername: config.username,
    merchantPassword: config.password,
    transactionReferenceNumber: payment.transactionReferenceNumber,
    requestHash,
    authToken,
    currency,
    transactionTypeId,
    transactionAmount: amountStr,
    ipnUrl: config.ipnUrl,
  };
}

/**
 * Convert USD to PKR (Exchange rate: 1 USD = 280 PKR)
 */
export function convertUsdToPkr(usdAmount: number): number {
  return Math.round(usdAmount * 280);
}

/**
 * Generate transaction reference number from application number
 */
export function generateTransactionRef(applicationNumber: string): string {
  return applicationNumber.replace(/-/g, '').substring(0, 20);
}

/**
 * Create auto-submit form HTML for handshake step
 */
export function createHandshakeFormHtml(formData: PaymentFormData): string {
  const urls = getGatewayUrls();
  const gatewayUrl = urls.handshakeUrl;
  
  const formHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to Payment...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e3a5f 0%, #0d7377 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 450px;
      width: 90%;
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #e0e0e0;
      border-top: 4px solid #0d7377;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 25px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 { color: #1e3a5f; margin: 0 0 10px; font-size: 24px; }
    p { color: #666; margin: 0 0 20px; font-size: 15px; }
    .secure {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #10b981;
      font-size: 14px;
      margin-top: 25px;
    }
    .secure svg { width: 20px; height: 20px; }
    form { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Connecting to Payment Gateway</h2>
    <p>Please wait while we securely connect you to Bank Alfalah...</p>
    <form id="handshakeForm" method="POST" action="${gatewayUrl}">
      <input type="hidden" name="HS_ChannelId" value="${formData.channelId}">
      <input type="hidden" name="HS_MerchantId" value="${formData.merchantId}">
      <input type="hidden" name="HS_StoreId" value="${formData.storeId}">
      <input type="hidden" name="HS_ReturnURL" value="${formData.returnUrl}">
      <input type="hidden" name="HS_MerchantHash" value="${formData.merchantHash}">
      <input type="hidden" name="HS_MerchantUsername" value="${formData.merchantUsername}">
      <input type="hidden" name="HS_MerchantPassword" value="${formData.merchantPassword}">
      <input type="hidden" name="HS_TransactionReferenceNumber" value="${formData.transactionReferenceNumber}">
      <input type="hidden" name="HS_RequestHash" value="${formData.requestHash}">
      <input type="hidden" name="HS_IsRedirectionRequest" value="${formData.isRedirectionRequest}">
    </form>
    <div class="secure">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
      </svg>
      Secured by Bank Alfalah
    </div>
  </div>
  <script>
    setTimeout(function() {
      document.getElementById('handshakeForm').submit();
    }, 500);
  </script>
</body>
</html>`;
  
  return formHtml;
}

/**
 * Create auto-submit form HTML for SSO step (payment)
 */
export function createSSOFormHtml(formData: PaymentFormData): string {
  const urls = getGatewayUrls();
  const gatewayUrl = urls.ssoUrl;
  
  const formHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Processing Payment...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1e3a5f 0%, #0d7377 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 450px;
      width: 90%;
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 4px solid #e0e0e0;
      border-top: 4px solid #0d7377;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 25px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 { color: #1e3a5f; margin: 0 0 10px; font-size: 24px; }
    p { color: #666; margin: 0 0 20px; font-size: 15px; }
    .secure {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #10b981;
      font-size: 14px;
      margin-top: 25px;
    }
    .secure svg { width: 20px; height: 20px; }
    form { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Redirecting to Secure Payment</h2>
    <p>You will be redirected to enter your payment details...</p>
    <form id="ssoForm" method="POST" action="${gatewayUrl}">
      <input type="hidden" name="AuthToken" value="${formData.authToken}">
      <input type="hidden" name="ChannelId" value="${formData.channelId}">
      <input type="hidden" name="Currency" value="${formData.currency}">
      <input type="hidden" name="ReturnURL" value="${formData.returnUrl}">
      <input type="hidden" name="MerchantId" value="${formData.merchantId}">
      <input type="hidden" name="StoreId" value="${formData.storeId}">
      <input type="hidden" name="MerchantHash" value="${formData.merchantHash}">
      <input type="hidden" name="MerchantUsername" value="${formData.merchantUsername}">
      <input type="hidden" name="MerchantPassword" value="${formData.merchantPassword}">
      <input type="hidden" name="TransactionTypeId" value="${formData.transactionTypeId}">
      <input type="hidden" name="TransactionReferenceNumber" value="${formData.transactionReferenceNumber}">
      <input type="hidden" name="TransactionAmount" value="${formData.transactionAmount}">
      <input type="hidden" name="RequestHash" value="${formData.requestHash}">
    </form>
    <div class="secure">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
      </svg>
      Secured by Bank Alfalah
    </div>
  </div>
  <script>
    setTimeout(function() {
      document.getElementById('ssoForm').submit();
    }, 500);
  </script>
</body>
</html>`;
  
  return formHtml;
}

/**
 * Check transaction status via IPN
 */
export async function checkTransactionStatus(merchantId: string, storeId: string, orderId: string): Promise<{
  responseCode: string;
  description: string;
  transactionStatus: string;
  transactionId: string;
  transactionAmount: string;
} | null> {
  const urls = getGatewayUrls();
  const url = `${urls.ipnUrl}/${merchantId}/${storeId}/${orderId}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}