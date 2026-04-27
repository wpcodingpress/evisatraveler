import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com';
    
    let transactionStatus = searchParams.get('TS') || searchParams.get('transactionStatus');
    let responseCode = searchParams.get('RC') || searchParams.get('responseCode');
    let responseDescription = searchParams.get('RD') || searchParams.get('responseDescription');
    let orderId = searchParams.get('O') || searchParams.get('orderId') || searchParams.get('transactionId');
    let errorMessage = searchParams.get('ErrorMessage') || searchParams.get('errorMessage');
    
    console.log('Insurance payment return URL:', request.nextUrl.href);
    console.log('Insurance return params:', { transactionStatus, responseCode, orderId, errorMessage });
    
    if (errorMessage) {
      console.error('Insurance payment error:', errorMessage);
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?error=payment_failed&reason=${encodeURIComponent(errorMessage)}`, siteUrl));
    }
    
    if (!orderId) {
      console.error('No order ID in insurance payment return');
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?error=no_order`, siteUrl));
    }
    
    const order = await prisma.insuranceOrder.findFirst({
      where: {
        orderNumber: {
          contains: orderId,
        },
      },
      include: { insurance: true },
    });
    
    if (!order) {
      console.error('Insurance order not found for:', orderId);
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?error=order_not_found`, siteUrl));
    }
    
    const isSuccess = responseCode === '00' || responseCode === '0' || transactionStatus === 'S';
    
    if (isSuccess) {
      await prisma.insuranceOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'approved',
          processedAt: new Date(),
        },
      });
      
      if (order.userId) {
        await prisma.notification.create({
          data: {
            type: 'insurance_approved',
            title: 'Insurance Approved!',
            message: `Your ${order.insurance?.name || 'Travel'} insurance has been approved. Order: ${order.orderNumber}`,
            userId: order.userId,
          },
        });
      }
      
      console.log('Insurance payment successful for order:', order.orderNumber);
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/success?order=${order.orderNumber}`, siteUrl));
    } else {
      await prisma.insuranceOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          status: 'failed',
        },
      });
      
      console.log('Insurance payment failed for order:', order.orderNumber, 'Reason:', responseDescription);
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?order=${order.orderNumber}&reason=${encodeURIComponent(responseDescription || 'Payment failed')}`, siteUrl));
    }
  } catch (error) {
    console.error('Insurance payment return error:', error);
    return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?error=server_error`, request.url));
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
    
    console.log('Insurance payment return (POST):', { transactionStatus, responseCode, orderId });
    
    if (!orderId) {
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?error=no_order`, siteUrl));
    }
    
    const order = await prisma.insuranceOrder.findFirst({
      where: {
        orderNumber: {
          contains: orderId,
        },
      },
      include: { insurance: true },
    });
    
    if (!order) {
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?error=order_not_found`, siteUrl));
    }
    
    const isSuccess = responseCode === '00' || responseCode === '0' || transactionStatus === 'S';
    
    if (isSuccess) {
      await prisma.insuranceOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          status: 'approved',
          processedAt: new Date(),
        },
      });
      
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/success?order=${order.orderNumber}`, siteUrl));
    } else {
      await prisma.insuranceOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'failed',
          status: 'failed',
        },
      });
      
      return NextResponse.redirect(new URL(`${siteUrl}/insurance/failed?order=${order.orderNumber}&reason=${encodeURIComponent(responseDescription || 'Payment failed')}`, siteUrl));
    }
  } catch (error) {
    console.error('Insurance payment return (POST) error:', error);
    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://evisatraveler.com'}/insurance/failed?error=server_error`, request.url));
  }
}