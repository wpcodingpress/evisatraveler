import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    const userId = cookieStore.get('user_id');
    const userEmail = cookieStore.get('user_email');
    const userName = cookieStore.get('user_name');

    if (!token || !userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId.value },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      });
    } catch {
      user = null;
    }

    if (user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId.value,
        email: userEmail?.value || '',
        firstName: userName?.value || 'User',
        lastName: '',
        phone: '',
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}