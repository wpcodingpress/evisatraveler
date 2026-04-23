/**
 * Bank Alfalah Alfa Payment Gateway - Signature Utility
 * 
 * Page Redirect Method Integration
 * 
 * Signature Format (per APG documentation):
 * merchantId + transactionId + amount + currency + returnUrl
 * Then HMAC SHA256 with Secret Key → Base64
 */

import crypto from 'crypto';

interface BankAlfalahConfig {
  merchantId: string;
  storeId: string;
  username: string;
  password: string;
  secretKey: string;
  gatewayUrl: string;
  returnUrl: string;
  webhookUrl: string;
}

interface PaymentRequest {
  transactionId: string;
  amount: number; // In PKR
  currency?: string;
  productDetail?: string;
  customerEmail?: string;
  customerMobile?: string;
  customerName?: string;
}

interface PaymentFormData {
  merchantId: string;
  transactionId: string;
  amount: string;
  currency: string;
  returnUrl: string;
  signature: string;
  productDetail: string;
  customerEmail?: string;
  customerMobile?: string;
  customerName?: string;
  paymentDateTime?: string;
  merchantCallbackUrl?: string;
}

function getConfig(): BankAlfalahConfig {
  return {
    merchantId: process.env.BANK_ALFALAH_MERCHANT_ID || '233660',
    storeId: process.env.BANK_ALFALAH_STORE_ID || '524469',
    username: process.env.BANK_ALFALAH_USERNAME || 'fykoqu',
    password: process.env.BANK_ALFALAH_PASSWORD || 'P4SmutaC6YVvFzk4yqF7CA==',
    secretKey: process.env.BANK_ALFALAH_SECRET_KEY || 'OUU362MB1upc67ZO/pNWYAfQ8A/8LuYyWpNuGSXiBtFvFzk4yqF7CA==',
    gatewayUrl: process.env.BANK_ALFALAH_GATEWAY_URL || 'https://gateway.alfalah.com/lms/payment/sale',
    returnUrl: process.env.BANK_ALFALAH_RETURN_URL || 'https://evisatraveler.com/api/payment/return',
    webhookUrl: process.env.BANK_ALFALAH_WEBHOOK_URL || 'https://evisatraveler.com/api/payment/webhook',
  };
}

/**
 * Generate HMAC SHA256 signature for payment request
 * Format: merchantId + transactionId + amount + currency + returnUrl
 */
export function generateSignature(
  merchantId: string,
  transactionId: string,
  amount: string,
  currency: string,
  returnUrl: string,
  secretKey: string
): string {
  const data = `${merchantId}${transactionId}${amount}${currency}${returnUrl}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  const signature = hmac.update(data).digest('base64');
  return signature;
}

/**
 * Generate payment form data for Bank Alfalah Gateway
 */
export function createPaymentFormData(payment: PaymentRequest): PaymentFormData {
  const config = getConfig();
  const currency = payment.currency || 'PKR';
  const amountStr = payment.amount.toFixed(2);
  
  const signature = generateSignature(
    config.merchantId,
    payment.transactionId,
    amountStr,
    currency,
    config.returnUrl,
    config.secretKey
  );

  return {
    merchantId: config.merchantId,
    transactionId: payment.transactionId,
    amount: amountStr,
    currency: currency,
    returnUrl: config.returnUrl,
    signature: signature,
    productDetail: payment.productDetail || 'Visa Application Fee',
    customerEmail: payment.customerEmail,
    customerMobile: payment.customerMobile,
    customerName: payment.customerName,
    paymentDateTime: new Date().toISOString(),
    merchantCallbackUrl: config.webhookUrl,
  };
}

/**
 * Verify response signature from Bank Alfalah
 */
export function verifyResponseSignature(
  transactionId: string,
  amount: string,
  responseCode: string,
  status: string,
  signature: string
): boolean {
  const config = getConfig();
  
  // Response signature format: transactionId + amount + responseCode + status
  const data = `${transactionId}${amount}${responseCode}${status}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.secretKey)
    .update(data)
    .digest('base64');

  return signature === expectedSignature;
}

/**
 * Get gateway URL
 */
export function getGatewayUrl(): string {
  return getConfig().gatewayUrl;
}

/**
 * Convert USD to PKR (Exchange rate: 1 USD = 280 PKR)
 */
export function convertUsdToPkr(usdAmount: number): number {
  return Math.round(usdAmount * 280);
}

/**
 * Generate transaction ID from application number
 */
export function generateTransactionId(applicationNumber: string): string {
  return applicationNumber.replace(/-/g, '').substring(0, 20);
}

/**
 * Create auto-submit form HTML for redirect
 */
export function createPaymentFormHtml(formData: PaymentFormData): string {
  const gatewayUrl = getGatewayUrl();
  
  let formHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting to Payment...</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 400px;
          width: 90%;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h2 {
          color: #333;
          margin: 0 0 10px;
        }
        p {
          color: #666;
          margin: 0 0 20px;
        }
        .secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #10b981;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h2>Redirecting to Payment</h2>
        <p>Please wait while we connect you to Bank Alfalah Payment Gateway...</p>
        <form id="paymentForm" method="POST" action="${gatewayUrl}">
          <input type="hidden" name="merchantId" value="${formData.merchantId}">
          <input type="hidden" name="transactionId" value="${formData.transactionId}">
          <input type="hidden" name="amount" value="${formData.amount}">
          <input type="hidden" name="currency" value="${formData.currency}">
          <input type="hidden" name="returnUrl" value="${formData.returnUrl}">
          <input type="hidden" name="signature" value="${formData.signature}">
          <input type="hidden" name="productDetail" value="${formData.productDetail}">
          ${formData.customerEmail ? `<input type="hidden" name="customerEmail" value="${formData.customerEmail}">` : ''}
          ${formData.customerMobile ? `<input type="hidden" name="customerMobile" value="${formData.customerMobile}">` : ''}
          ${formData.customerName ? `<input type="hidden" name="customerName" value="${formData.customerName}">` : ''}
          <input type="hidden" name="paymentDateTime" value="${formData.paymentDateTime}">
          <input type="hidden" name="merchantCallbackUrl" value="${formData.merchantCallbackUrl}">
        </form>
        <div class="secure">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
          Secured by Bank Alfalah
        </div>
      </div>
      <script>
        document.getElementById('paymentForm').submit();
      </script>
    </body>
    </html>
  `;
  
  return formHtml;
}