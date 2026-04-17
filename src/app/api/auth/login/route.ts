import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch {
      // Database not available - check against env credentials
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        user = {
          id: 'admin',
          email: email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
        };
      } else {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    if (user) {
      if (user.isActive === false) {
        return NextResponse.json({ error: 'Account is disabled' }, { status: 401 });
      }

      const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false;
      if (!user.password || !isValidPassword) {
        // For demo without database - accept any password
        if (user.id !== 'admin' || process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
      }
    }

    // Set auth cookies
    const cookieStore = await cookies();
    cookieStore.set('auth_token', 'logged_in', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    cookieStore.set('user_id', user!.id, { path: '/' });
    cookieStore.set('user_email', user!.email, { path: '/' });
    cookieStore.set('user_name', user!.firstName, { path: '/' });

    return NextResponse.json({
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName || '',
        role: user!.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}