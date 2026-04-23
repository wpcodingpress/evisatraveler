/**
 * Payment Initiation API
 * 
 * POST /api/payment/initiate
 * 
 * Creates payment request with Bank Alfalah APG
 * Returns auto-submit form that redirects to APG handshake endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHandshakeFormData, createHandshakeFormHtml, convertUsdToPkr, generateTransactionRef } from '@/lib/alfalah-payment';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, amount, customerEmail, customerPhone, customerName } = body;

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
    const formData = createHandshakeFormData({
      transactionReferenceNumber: transactionRef,
      amount: amountInPkr,
      currency: 'PKR',
      productDetail: `Visa Application - ${application.applicationNumber}`,
      customerEmail: customerEmail || application.user?.email || '',
      customerMobile: customerPhone || application.user?.phone || '',
      customerName: customerName || `${(application.formData as any)?.firstName || ''} ${(application.formData as any)?.lastName || ''}`.trim() || 'Customer',
    });

    const html = createHandshakeFormHtml(formData);

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
    const amountInPkr = convertUsdToPkr(amountNum);
    const formData = createHandshakeFormData({
      transactionReferenceNumber: transactionRef,
      amount: amountInPkr,
      currency: 'PKR',
      productDetail: `Visa Application - ${application.applicationNumber}`,
      customerEmail: application.user?.email || '',
      customerMobile: application.user?.phone || '',
      customerName: `${(application.formData as any)?.firstName || ''} ${(application.formData as any)?.lastName || ''}`.trim() || 'Customer',
    });

    const html = createHandshakeFormHtml(formData);

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