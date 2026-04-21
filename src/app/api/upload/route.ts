import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const applicationIdOrNumber = formData.get('applicationId') as string;
    const docType = formData.get('docType') as string || 'document';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!applicationIdOrNumber) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Get actual numeric ID from DB or use as-is if it's already a numeric ID
    let actualAppId = applicationIdOrNumber;
    try {
      const app = await prisma.application.findFirst({
        where: {
          OR: [
            { id: applicationIdOrNumber },
            { applicationNumber: applicationIdOrNumber }
          ]
        },
        select: { id: true }
      });
      if (app) {
        actualAppId = app.id;
      }
    } catch (err) {
      console.log('Using provided ID directly');
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, JPG, PNG allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', applicationIdOrNumber);
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'pdf';
    const fileName = `${docType}_${timestamp}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    let document = null;
    try {
      console.log('Attempting DB connection for document...');
      console.log('ApplicationId to use:', actualAppId);
      document = await prisma.document.create({
        data: {
          applicationId: actualAppId,
          type: docType,
          originalName: file.name,
          fileName,
          filePath: `/uploads/${applicationIdOrNumber}/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
      console.log('Document saved to DB:', document.id);
    } catch (dbError) {
      console.error('Database error saving document:', JSON.stringify(dbError, null, 2));
      console.log('Document saved locally only');
    }

    return NextResponse.json({
      success: true,
      document: document ? {
        id: document.id,
        type: document.type,
        originalName: document.originalName,
        fileName: document.fileName,
        url: document.filePath,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
      } : {
        id: fileName,
        type: docType,
        originalName: file.name,
        fileName,
        url: `/uploads/${applicationIdOrNumber}/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
