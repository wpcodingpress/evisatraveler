import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user to check role
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId.value },
        select: { role: true },
      });
    } catch {
      // DB unavailable, but still allow if admin via env? We'll assume DB available
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const where: any = {};
    if (unreadOnly) {
      where.isRead = false;
    }

    // Admin and Super Admin see all notifications, user sees only their own
    if (!['admin', 'super_admin'].includes(user.role || '')) {
      where.OR = [
        { userId: userId.value },
        { userId: null },
      ];
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, message, data } = body;
    
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        data: data || {},
      },
    });
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notif.userId && notif.userId !== userId.value) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId.value },
        select: { role: true },
      });
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isRead, markAllRead } = body;

    if (markAllRead) {
      const where: any = {};
      if (!['admin', 'super_admin'].includes(user.role || '')) {
        where.userId = userId.value;
      }
      where.isRead = false;
      await prisma.notification.updateMany({
        where,
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      const notif = await prisma.notification.findUnique({
        where: { id },
      });
      if (!notif) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      if (!['admin', 'super_admin'].includes(user.role || '') && notif.userId !== userId.value) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}