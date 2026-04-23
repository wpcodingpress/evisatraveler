/**
 * Payment Return/Callback API
 * 
 * GET /api/payment/return
 * 
 * Handles response from Bank Alfalah APG after payment completion
 * 
 * Response format from APG: /TS={status}/RC={code}/RD={description}/O={orderId}
 * Status: P (Pending), S (Success), F (Failed)
 * RC: 00 (Success), other codes = failure
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkTransactionStatus } from '@/lib/alfalah-payment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = request.nextUrl.pathname;
    
    console.log('Payment return URL:', request.nextUrl.href);
    console.log('Payment return path:', path);
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com';
    
    let transactionStatus = searchParams.get('TS') || searchParams.get('transactionStatus');
    let responseCode = searchParams.get('RC') || searchParams.get('responseCode');
    let responseDescription = searchParams.get('RD') || searchParams.get('responseDescription');
    let orderId = searchParams.get('O') || searchParams.get('orderId') || searchParams.get('transactionId');
    
    console.log('Parsed payment response:', {
      transactionStatus,
      responseCode,
      responseDescription,
      orderId,
    });
    
    if (!orderId) {
      console.error('No order ID in payment return');
      return NextResponse.redirect(new URL(`${siteUrl}/payment/failed?error=no_order`, siteUrl));
    }
    
    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: {
          contains: orderId,
        },
      },
    });
    
    if (!application) {
      console.error('Application not found for order:', orderId);
      return NextResponse.redirect(new URL(`${siteUrl}/payment/failed?error=app_not_found`, siteUrl));
    }
    
    const isSuccess = responseCode === '00' || responseCode === '0' || transactionStatus === 'S';
    
    if (isSuccess) {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'paid',
          status: 'approved',
        },
      });
      
      console.log('Payment successful for application:', application.applicationNumber);
      return NextResponse.redirect(
        new URL(`${siteUrl}/confirmation/${application.applicationNumber}?paid=true`, siteUrl)
      );
    } else {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'failed',
        },
      });
      
      console.log('Payment failed for application:', application.applicationNumber, 'Reason:', responseDescription);
      return NextResponse.redirect(
        new URL(`${siteUrl}/payment/failed?app=${application.applicationNumber}&reason=${encodeURIComponent(responseDescription || 'Payment failed')}`, siteUrl)
      );
    }
    
  } catch (error) {
    console.error('Payment return error:', error);
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com'}/payment/failed?error=server_error`, request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const transactionStatus = formData.get('TS') as string;
    const responseCode = formData.get('RC') as string;
    const responseDescription = formData.get('RD') as string;
    const orderId = formData.get('O') as string;
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com';
    
    console.log('Payment return (POST) received:', {
      transactionStatus,
      responseCode,
      responseDescription,
      orderId,
    });
    
    if (!orderId) {
      return NextResponse.redirect(new URL(`${siteUrl}/payment/failed?error=no_order`, siteUrl));
    }
    
    const application = await prisma.application.findFirst({
      where: {
        applicationNumber: {
          contains: orderId,
        },
      },
    });
    
    if (!application) {
      console.error('Application not found for order:', orderId);
      return NextResponse.redirect(new URL(`${siteUrl}/payment/failed?error=app_not_found`, siteUrl));
    }
    
    const isSuccess = responseCode === '00' || responseCode === '0' || transactionStatus === 'S';
    
    if (isSuccess) {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'paid',
          status: 'approved',
        },
      });
      
      return NextResponse.redirect(new URL(`${siteUrl}/confirmation/${application.applicationNumber}?paid=true`, siteUrl));
    } else {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          paymentStatus: 'failed',
        },
      });
      
      return NextResponse.redirect(
        new URL(`${siteUrl}/payment/failed?app=${application.applicationNumber}&reason=${encodeURIComponent(responseDescription || 'Payment failed')}`, siteUrl)
      );
    }
    
  } catch (error) {
    console.error('Payment return (POST) error:', error);
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com'}/payment/failed?error=server_error`, request.url));
  }
}