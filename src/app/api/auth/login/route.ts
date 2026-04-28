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

    // CHECK ENV VARS FIRST (for super admin / admin bypass)
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        user = {
          id: 'super-admin',
          email: email,
          firstName: 'Rahman',
          lastName: 'CEO',
          role: 'super_admin',
          isActive: true,
        };
        
        // Set auth cookies
        const cookieStore = await cookies();
        cookieStore.set('auth_token', 'logged_in', { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        });
        cookieStore.set('user_id', user.id, { path: '/' });
        cookieStore.set('user_email', user.email, { path: '/' });
        cookieStore.set('user_name', `${user.firstName} ${user.lastName}`, { path: '/' });
        cookieStore.set('user_role', user.role, { path: '/' });
        
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        });
      }
    }

    // THEN check database
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
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
    cookieStore.set('user_name', `${user!.firstName} ${user!.lastName || ''}`.trim(), { path: '/' });
    cookieStore.set('user_role', user!.role || 'user', { path: '/' });
    
    return NextResponse.json({
      user: {
        id: user!.id,
        email: user!.email,
        firstName: user!.firstName,
        lastName: user!.lastName || '',
        phone: user!.phone || '',
        role: user!.role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}