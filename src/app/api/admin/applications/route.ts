import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'processing', 'approved', 'completed', 'rejected']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  notes: z.string().optional(),
  processedAt: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (search) {
      where.OR = [
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: { 
            select: { 
              id: true, 
              firstName: true, 
              lastName: true, 
              email: true,
              phone: true,
              role: true,
              createdAt: true,
            } 
          },
          visaRule: {
            include: {
              fromCountry: { select: { code: true, name: true, flag: true } },
              toCountry: { select: { code: true, name: true, flag: true } },
            },
          },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    const stats = await prisma.application.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      applications,
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin applications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { id, status, paymentStatus, notes, processedAt } = validation.data;
    const updateData: any = {};
    const previousApp = await prisma.application.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (status) {
      updateData.status = status;
      if (processedAt || status === 'approved' || status === 'rejected' || status === 'completed') {
        updateData.processedAt = processedAt ? new Date(processedAt) : new Date();
      }
    }
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        visaRule: {
          include: {
            toCountry: true,
            fromCountry: true
          }
        }
      },
    });

    if (status && status !== (previousApp?.status || '')) {
      const statusMessages: Record<string, { title: string; message: string }> = {
        pending: { 
          title: 'Application Pending', 
          message: `Your application ${application.applicationNumber} is now pending review.` 
        },
        processing: { 
          title: 'Application Under Processing', 
          message: `Your application ${application.applicationNumber} is now being processed. An invoice has been generated.` 
        },
        approved: { 
          title: 'Application Approved!', 
          message: `Great news! Your application ${application.applicationNumber} has been approved. Your e-visa will be sent to your email.` 
        },
        completed: { 
          title: 'Application Completed', 
          message: `Your application ${application.applicationNumber} has been completed successfully. Thank you for choosing eVisaTraveler!` 
        },
        rejected: { 
          title: 'Application Rejected', 
          message: `Your application ${application.applicationNumber} has been rejected. Please contact support for more information.` 
        },
      };

      const notifData = statusMessages[status];
      if (notifData && application.userId) {
        await prisma.notification.create({
          data: {
            type: 'application_status',
            title: notifData.title,
            message: notifData.message,
            data: {
              applicationId: application.id,
              applicationNumber: application.applicationNumber,
              status: status,
              previousStatus: previousApp?.status,
            },
            userId: application.userId,
          },
        });
      }
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Delete associated documents first
    await prisma.document.deleteMany({
      where: { applicationId: id },
    });

    // Delete the application
    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}