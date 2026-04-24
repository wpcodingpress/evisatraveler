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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com';
    
    // Bank Alfalah handshake response parameters
    let success = searchParams.get('success');
    let authToken = searchParams.get('AuthToken') || searchParams.get('authToken');
    let errorMessage = searchParams.get('ErrorMessage') || searchParams.get('errorMessage');
    
    // Payment completion parameters
    let transactionStatus = searchParams.get('TS') || searchParams.get('transactionStatus');
    let responseCode = searchParams.get('RC') || searchParams.get('responseCode');
    let responseDescription = searchParams.get('RD') || searchParams.get('responseDescription');
    let orderId = searchParams.get('O') || searchParams.get('orderId') || searchParams.get('transactionId') || searchParams.get('txn');
    
    console.log('Payment return URL:', request.nextUrl.href);
    console.log('All params:', { success, authToken, errorMessage, transactionStatus, responseCode, orderId });
    
    // Handle handshake failure
    if (success === 'false' || errorMessage) {
      console.error('Handshake failed:', errorMessage);
      return NextResponse.redirect(new URL(`${siteUrl}/payment/failed?error=handshake_failed&reason=${encodeURIComponent(errorMessage || 'Payment gateway error')}`, siteUrl));
    }
    
    // Handle handshake success with AuthToken (but no payment yet)
    if (!orderId && authToken) {
      console.log('Handshake successful, AuthToken received. Waiting for payment completion...');
      return NextResponse.redirect(new URL(`${siteUrl}/payment/pending?token=${authToken.substring(0, 20)}`, siteUrl));
    }
    
    if (!orderId) {
      console.error('No order ID in payment return');
      return NextResponse.redirect(new URL(`${siteUrl}/payment/failed?error=no_order`, siteUrl));
    }
    
    console.log('Parsed payment response:', {
      transactionStatus,
      responseCode,
      responseDescription,
      orderId,
    });
    
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