/**
 * Payment Initiation API
 * 
 * POST /api/payment/initiate
 * 
 * Creates a payment request with Bank Alfalah and returns auto-submit form
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentFormData, createPaymentFormHtml, convertUsdToPkr, generateTransactionId } from '@/lib/alfalah-payment';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, amount, customerEmail, customerPhone: custMobile, customerName } = body;

    if (!applicationId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, amount' },
        { status: 400 }
      );
    }

    // Get application from database
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Generate transaction ID from application number
    const transactionId = generateTransactionId(application.applicationNumber);

    // Convert USD to PKR
    const amountInPkr = convertUsdToPkr(amount);

    // Create payment form data
    const formData = createPaymentFormData({
      transactionId,
      amount: amountInPkr,
      currency: 'PKR',
      productDetail: `Visa Application - ${application.applicationNumber}`,
      customerEmail: customerEmail || application.user?.email || '',
      customerMobile: custMobile || application.user?.phone || '',
      customerName: customerName || `${(application.formData as any)?.firstName || ''} ${(application.formData as any)?.lastName || ''}`.trim() || 'Customer',
    });

    // Return HTML form that auto-submits to Bank Alfalah
    const html = createPaymentFormHtml(formData);

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

// Also support GET for simple redirect testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const applicationId = searchParams.get('applicationId');
  const amount = searchParams.get('amount');

  if (!applicationId || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters: applicationId, amount' },
      { status: 400 }
    );
  }

  try {
    const amountNum = parseFloat(amount);

    // Get application from database
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Generate transaction ID
    const transactionId = generateTransactionId(application.applicationNumber);

    // Convert USD to PKR
    const amountInPkr = convertUsdToPkr(amountNum);

    // Create payment form data
    const formData = createPaymentFormData({
      transactionId,
      amount: amountInPkr,
      currency: 'PKR',
      productDetail: `Visa Application - ${application.applicationNumber}`,
      customerEmail: application.user?.email || '',
      customerMobile: application.user?.phone || '',
      customerName: `${(application.formData as any)?.firstName || ''} ${(application.formData as any)?.lastName || ''}`.trim() || 'Customer',
    });

    // Return HTML form
    const html = createPaymentFormHtml(formData);

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