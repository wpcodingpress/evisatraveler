import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ applicationNumber: string }>;
}

const MARGIN = 20;
let pageCount = 1;

function checkAndAddPage(doc: jsPDF, y: number, requiredSpace: number = 30): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y > pageHeight - MARGIN - requiredSpace) {
    doc.addPage();
    pageCount++;
    return MARGIN;
  }
  return y;
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

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - MARGIN * 2;
    let y = MARGIN;
    let pageCount = 1;

    function addHeader() {
      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('eVisaTraveler - Global Visa Solutions', pageWidth / 2, 30, { align: 'center' });
      doc.text('www.evisatraveler.com | support@evisatraveler.com', pageWidth / 2, 37, { align: 'center' });
      
      y = 55;
    }

    function addFooter() {
      const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : pageCount;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    }

    addHeader();
    y = checkAndAddPage(doc, y, MARGIN);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Details', MARGIN, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    const invoiceNum = `INV-${application.applicationNumber}`;
    doc.text(`Invoice Number: ${invoiceNum}`, MARGIN, y);
    doc.text(`Application Number: ${application.applicationNumber}`, MARGIN + contentWidth / 2, y);
    y += 6;
    doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, y);
    doc.text(`Status: ${application.status.toUpperCase()}`, MARGIN + contentWidth / 2, y);
    y += 12;

    doc.setDrawColor(200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Applicant Information', MARGIN, y);
    y += 8;

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
    doc.text('Full Name:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(applicantName, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Email:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(applicantEmail, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Phone:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(applicantPhone, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Date of Birth:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(dob, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Gender:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(gender.charAt(0).toUpperCase() + gender.slice(1), MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Nationality:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(nationality, MARGIN + 35, y);
    y += 12;

    doc.setDrawColor(200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Passport Information', MARGIN, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const passportNumber = formData?.passportNumber || 'N/A';
    const passportExpiry = formData?.passportExpiry || 'N/A';
    
    doc.setTextColor(100, 100, 100);
    doc.text('Passport Number:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(passportNumber, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Passport Expiry:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(passportExpiry, MARGIN + 35, y);
    y += 12;

    doc.setDrawColor(200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Details', MARGIN, y);
    y += 8;

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
    doc.text('From Country:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(fromCountry, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Destination:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(destination, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Arrival Date:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(arrivalDate, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Departure Date:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(departureDate, MARGIN + 35, y);
    y += 6;

    if (portOfEntry !== 'N/A') {
      doc.setTextColor(100, 100, 100);
      doc.text('Port of Entry:', MARGIN, y);
      doc.setTextColor(0, 0, 0);
      doc.text(portOfEntry.charAt(0).toUpperCase() + portOfEntry.slice(1), MARGIN + 35, y);
      y += 6;
    }

    if (accommodationType !== 'N/A') {
      doc.setTextColor(100, 100, 100);
      doc.text('Accommodation:', MARGIN, y);
      doc.setTextColor(0, 0, 0);
      doc.text(accommodationType.charAt(0).toUpperCase() + accommodationType.slice(1) + (accommodationAddress !== 'N/A' ? ` - ${accommodationAddress}` : ''), MARGIN + 35, y);
      y += 6;
    }
    y += 8;

    y = checkAndAddPage(doc, y, MARGIN);
    doc.setDrawColor(200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Visa Information', MARGIN, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const visaType = application.visaRule?.visaType || 'N/A';
    const processingTime = application.visaRule?.processingTime || 'N/A';
    const maxStayDays = application.visaRule?.maxStayDays || 'N/A';
    const validityDays = application.visaRule?.validityDays || 'N/A';
    const entryType = application.visaRule?.entryType || 'N/A';
    
    doc.setTextColor(100, 100, 100);
    doc.text('Visa Type:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`${visaType} Visa`, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Processing Time:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(processingTime, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Maximum Stay:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`${maxStayDays} days`, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Validity:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`${validityDays} days`, MARGIN + 35, y);
    y += 6;
    
    doc.setTextColor(100, 100, 100);
    doc.text('Entry Type:', MARGIN, y);
    doc.setTextColor(0, 0, 0);
    doc.text(entryType, MARGIN + 35, y);
    y += 12;

    y = checkAndAddPage(doc, y, MARGIN);
    doc.setFillColor(124, 58, 237);
    doc.rect(MARGIN, y, contentWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount', MARGIN + 5, y + 12);
    doc.setFontSize(16);
    doc.text(`$${Number(application.totalAmount).toFixed(2)} ${application.currency || 'USD'}`, pageWidth - MARGIN - 5, y + 20, { align: 'right' });
    y += 45;

    y = checkAndAddPage(doc, y, MARGIN);
    doc.setDrawColor(200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    y += 8;

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Payment Status:', MARGIN, y);
    const paymentStatus = application.paymentStatus?.toUpperCase() || 'PENDING';
    doc.setTextColor(
      application.paymentStatus === 'paid' ? 22 : 234, 
      application.paymentStatus === 'paid' ? 179 : 179, 
      application.paymentStatus === 'paid' ? 68 : 68
    );
    doc.text(paymentStatus, MARGIN + 35, y);
    y += 12;

    const documents = application.documents as any[] || [];
    if (documents.length > 0) {
      y = checkAndAddPage(doc, y, 50);
      doc.setDrawColor(200);
      doc.line(MARGIN, y, pageWidth - MARGIN, y);
      y += 8;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Uploaded Documents', MARGIN, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const uploadDir = path.join(process.cwd(), 'public');
      
      for (const docItem of documents) {
        y = checkAndAddPage(doc, y, 50);
        doc.setTextColor(100, 100, 100);
        doc.text('Document:', MARGIN, y);
        doc.setTextColor(0, 0, 0);
        doc.text(`${docItem.type || 'Document'} - ${docItem.originalName || docItem.fileName}`, MARGIN + 25, y);
        
        // Try to embed image if it's an image file
        const filePath = docItem.filePath;
        if (filePath && (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png'))) {
          try {
            const fullImagePath = path.join(uploadDir, filePath);
            if (fs.existsSync(fullImagePath)) {
              y += 3;
              const imgData = fs.readFileSync(fullImagePath);
              const imgProps = doc.getImageProperties(imgData.toString('base64'));
              const maxImgWidth = 60;
              const maxImgHeight = 40;
              let imgWidth = maxImgWidth;
              let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
              if (imgHeight > maxImgHeight) {
                imgHeight = maxImgHeight;
                imgWidth = (imgProps.width * imgHeight) / imgProps.height;
              }
              doc.addImage(imgData.toString('base64'), 'JPEG', MARGIN, y, imgWidth, imgHeight);
              y += imgHeight + 5;
            }
          } catch (imgError) {
            console.log('Could not embed image:', docItem.fileName);
            y += 6;
          }
        } else {
          y += 6;
        }
      }
    }

    y = checkAndAddPage(doc, y, MARGIN);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text('Terms & Conditions:', MARGIN, y);
    y += 6;
    doc.setFontSize(8);
    doc.text('1. This invoice is valid for 30 days from the date of issue.', MARGIN, y);
    y += 5;
    doc.text('2. Visa processing time starts from the date of payment confirmation.', MARGIN, y);
    y += 5;
    doc.text('3. All documents submitted must be authentic and valid.', MARGIN, y);
    y += 5;
    doc.text('4. The visa fee is non-refundable once processing has begun.', MARGIN, y);
    y += 10;

    doc.setTextColor(124, 58, 237);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing eVisaTraveler!', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('For questions, contact: support@evisatraveler.com | www.evisatraveler.com', pageWidth / 2, y, { align: 'center' });

    addFooter();

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