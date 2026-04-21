import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';

interface Props {
  params: Promise<{ applicationNumber: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { applicationNumber: appNum } = await params;
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true';
    const applicationNumber = appNum;

    if (!applicationNumber) {
      return NextResponse.json({ error: 'Application number required' }, { status: 400 });
    }

    if (!adminView) {
      const cookieStore = await cookies();
      const userId = cookieStore.get('user_id');
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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
          documents: true,
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!adminView && application.userId !== (await cookies()).get('user_id')?.value) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('eVisaTraveler - Global Visa Solutions', pageWidth / 2, 33, { align: 'center' });

    y = 55;
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const invoiceNum = `INV-${application.applicationNumber}`;
    doc.text(`Invoice Number: ${invoiceNum}`, 20, y);
    doc.text(`Application Number: ${application.applicationNumber}`, 120, y);
    y += 7;
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, y);
    doc.text(`Status: ${application.status.toUpperCase()}`, 120, y);
    y += 15;

    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Applicant Information', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const formData = application.formData as Record<string, any>;
    const applicantName = formData?.firstName && formData?.lastName 
      ? `${formData.firstName} ${formData.lastName}` 
      : (application.user ? `${application.user.firstName} ${application.user.lastName}` : 'N/A');
    const applicantEmail = formData?.email || application.user?.email || 'N/A';
    const applicantPhone = formData?.phone || application.user?.phone || 'N/A';
    const dob = formData?.dateOfBirth || 'N/A';
    const gender = formData?.gender || 'N/A';
    const nationality = formData?.nationality || 'N/A';
    
    doc.setTextColor(100, 100, 100);
    doc.text('Full Name:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(applicantName, 60, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Email:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(applicantEmail, 60, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Phone:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(applicantPhone, 60, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Date of Birth:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(dob, 60, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Gender:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(gender.charAt(0).toUpperCase() + gender.slice(1), 60, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Nationality:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(nationality, 60, y);
    y += 15;

    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Passport Information', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const passportNumber = formData?.passportNumber || 'N/A';
    const passportExpiry = formData?.passportExpiry || 'N/A';
    
    doc.setTextColor(100, 100, 100);
    doc.text('Passport Number:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(passportNumber, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Passport Expiry:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(passportExpiry, 70, y);
    y += 15;

    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Details', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const arrivalDate = formData?.arrivalDate || 'N/A';
    const departureDate = formData?.departureDate || 'N/A';
    const portOfEntry = formData?.portOfEntry || 'N/A';
    const accommodationType = formData?.accommodationType || 'N/A';
    const accommodationAddress = formData?.accommodationAddress || 'N/A';
    const destination = application.visaRule?.toCountry?.name || 'N/A';
    const fromCountry = application.visaRule?.fromCountry?.name || 'N/A';
    
    doc.setTextColor(100, 100, 100);
    doc.text('From Country:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(fromCountry, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Destination:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(destination, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Arrival Date:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(arrivalDate, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Departure Date:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(departureDate, 70, y);
    y += 7;

    if (portOfEntry !== 'N/A') {
      doc.setTextColor(100, 100, 100);
      doc.text('Port of Entry:', 20, y);
      doc.setTextColor(0, 0, 0);
      doc.text(portOfEntry.charAt(0).toUpperCase() + portOfEntry.slice(1), 70, y);
      y += 7;
    }

    if (accommodationType !== 'N/A') {
      doc.setTextColor(100, 100, 100);
      doc.text('Accommodation:', 20, y);
      doc.setTextColor(0, 0, 0);
      doc.text(accommodationType.charAt(0).toUpperCase() + accommodationType.slice(1) + (accommodationAddress !== 'N/A' ? ` - ${accommodationAddress}` : ''), 70, y);
      y += 7;
    }
    y += 8;

    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Visa Information', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const visaType = application.visaRule?.visaType || 'N/A';
    const processingTime = application.visaRule?.processingTime || 'N/A';
    const maxStayDays = application.visaRule?.maxStayDays || 'N/A';
    const validityDays = application.visaRule?.validityDays || 'N/A';
    const entryType = application.visaRule?.entryType || 'N/A';
    
    doc.setTextColor(100, 100, 100);
    doc.text('Visa Type:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`${visaType} Visa`, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Processing Time:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(processingTime, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Maximum Stay:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`${maxStayDays} days`, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Validity:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`${validityDays} days`, 70, y);
    y += 7;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Entry Type:', 20, y);
    doc.setTextColor(0, 0, 0);
    doc.text(entryType, 70, y);
    y += 15;

    doc.setDrawColor(124, 58, 237);
    doc.setFillColor(124, 58, 237);
    doc.rect(20, y, pageWidth - 40, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount', 30, y + 12);
    doc.setFontSize(16);
    doc.text(`$${Number(application.totalAmount).toFixed(2)} ${application.currency || 'USD'}`, pageWidth - 30, y + 20, { align: 'right' });
    y += 40;

    doc.setDrawColor(200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Payment Status:', 20, y);
    const paymentStatus = application.paymentStatus?.toUpperCase() || 'PENDING';
    doc.setTextColor(
      application.paymentStatus === 'paid' ? 22 : 234, 
      application.paymentStatus === 'paid' ? 179 : 179, 
      application.paymentStatus === 'paid' ? 68 : 68
    );
    doc.text(paymentStatus, 60, y);
    y += 15;

    // Documents Section
    const documents = application.documents as any[] || [];
    if (documents.length > 0) {
      doc.setDrawColor(200);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Uploaded Documents', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      for (const docItem of documents) {
        doc.setTextColor(100, 100, 100);
        doc.text('Document:', 20, y);
        doc.setTextColor(0, 0, 0);
        doc.text(`${docItem.type || 'Document'} - ${docItem.originalName || docItem.fileName}`, 55, y);
        y += 7;
      }
      y += 5;
    }

    y += 5;

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', 20, y);
    y += 7;
    doc.setFontSize(8);
    doc.text('1. This invoice is valid for 30 days from the date of issue.', 20, y);
    y += 5;
    doc.text('2. Visa processing time starts from the date of payment confirmation.', 20, y);
    y += 5;
    doc.text('3. All documents submitted must be authentic and valid.', 20, y);
    y += 5;
    doc.text('4. The visa fee is non-refundable once processing has begun.', 20, y);
    y += 15;

    doc.setTextColor(124, 58, 237);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing eVisaTraveler!', pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('For questions, contact: support@evisatraveler.com | www.evisatraveler.com', pageWidth / 2, y, { align: 'center' });

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
