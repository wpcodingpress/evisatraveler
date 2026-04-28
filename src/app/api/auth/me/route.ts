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
    const userRole = cookieStore.get('user_role');
    
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
          role: true,
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
          role: user.role,
        },
      });
    }
    
    // User not in DB, return cookie data
    const nameParts = userName?.value?.split(' ') || ['User'];
    const role = userRole?.value || 'user';
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId.value,
        email: userEmail?.value || '',
        firstName: nameParts[0] || 'User',
        lastName: nameParts[1] || '',
        phone: '',
        role: role,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
