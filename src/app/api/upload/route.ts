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
    const applicationId = formData.get('applicationId') as string;
    const docType = formData.get('docType') as string || 'document';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, JPG, PNG allowed.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', applicationId);
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'pdf';
    const fileName = `${docType}_${timestamp}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    let document = null;
    try {
      document = await prisma.document.create({
        data: {
          applicationId,
          type: docType,
          originalName: file.name,
          fileName,
          filePath: `/uploads/${applicationId}/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
    } catch (dbError) {
      console.log('Database unavailable, document saved locally only');
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
        url: `/uploads/${applicationId}/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
      },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
