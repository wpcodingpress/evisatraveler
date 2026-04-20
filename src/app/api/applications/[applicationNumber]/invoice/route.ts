import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationNumber = searchParams.get('applicationNumber');

    if (!applicationNumber) {
      return NextResponse.json({ error: 'Application number required' }, { status: 400 });
    }

    // Check authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let application;
    try {
      application = await prisma.application.findUnique({
        where: { applicationNumber },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true, phone: true },
          },
          visaRule: {
            include: { toCountry: true, fromCountry: true },
          },
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify ownership
    if (application.userId !== userId.value) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(124, 58, 237); // violet-600
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Date: ${formatDateTime(application.createdAt)}`, pageWidth / 2, 30, { align: 'center' });

    // Company Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('eVisaTraveler', 20, 45);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Global Visa Solutions', 20, 52);
    doc.text('contact@evisatraveler.com', 20, 59);

    // Bill To
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Bill To:', 20, 75);
    doc.setFontSize(10);
    doc.setTextColor(100);
    const userName = application.user ? `${application.user.firstName} ${application.user.lastName}` : 'Customer';
    const userEmail = application.user?.email || 'N/A';
    const userPhone = application.user?.phone || 'N/A';
    doc.text(userName, 20, 82);
    doc.text(userEmail, 20, 89);
    doc.text(userPhone, 20, 96);

    // Invoice Details
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Invoice #:', pageWidth - 60, 75);
    doc.text('Application #:', pageWidth - 60, 85);
    doc.text('Issue Date:', pageWidth - 60, 95);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(application.applicationNumber, pageWidth - 30, 75, { align: 'right' });
    doc.text(application.applicationNumber, pageWidth - 30, 85, { align: 'right' });
    doc.text(formatDateTime(application.createdAt), pageWidth - 30, 95, { align: 'right' });

    // Line Items
    doc.setDrawColor(200);
    doc.line(20, 105, pageWidth - 20, 105);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text('Description', 20, 115);
    doc.text('Amount', pageWidth - 40, 115);
    doc.line(20, 118, pageWidth - 20, 118);

    // Visa Details
    doc.setFontSize(10);
    doc.setTextColor(100);
    const visaDesc = `${application.visaRule.visaType} Visa to ${application.visaRule.toCountry.name}`;
    doc.text(visaDesc, 20, 128);
    const amount = formatCurrency(application.totalAmount);
    doc.text(amount, pageWidth - 40, 128, { align: 'right' });

    // Total
    doc.setDrawColor(150);
    doc.line(20, 138, pageWidth - 20, 138);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total', 20, 148);
    doc.setTextColor(124, 58, 237);
    doc.text(amount, pageWidth - 40, 148, { align: 'right' });

    // Payment Status
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Status: ${application.paymentStatus}`, 20, 165);
    doc.text(`Currency: ${application.currency}`, 20, 173);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for choosing eVisaTraveler!', pageWidth / 2, 270, { align: 'center' });
    doc.text('For questions, contact: support@evisatraveler.com', pageWidth / 2, 278, { align: 'center' });

    // Return PDF
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${applicationNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
