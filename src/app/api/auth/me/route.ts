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
    
    // Try to fetch from database, but don't fail if DB is unavailable
    let user = null;
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
    } catch (error) {
      console.warn('Database unavailable, returning cookie-based auth');
      // DB unavailable - return auth based on cookies
      return NextResponse.json({
        authenticated: true,
        user: {
          id: userId.value,
          email: userEmail?.value || '',
          firstName: userName?.value?.split(' ')[0] || 'User',
          lastName: userName?.value?.split(' ').slice(1).join(' ') || '',
          phone: '',
          role: userRole?.value || 'user',
        },
        warning: 'Database connection unavailable - using session data',
      });
    }
    
    if (user) {
      return NextResponse.json({ authenticated: true, user });
    }
    
    // User not in DB - return cookie data (for env-based auth)
    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId.value,
        email: userEmail?.value || '',
        firstName: userName?.value?.split(' ')[0] || 'User',
        lastName: userName?.value?.split(' ').slice(1).join(' ') || '',
        phone: '',
        role: userRole?.value || 'user',
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
