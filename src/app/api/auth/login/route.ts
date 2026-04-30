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
    let dbAvailable = true;

    // CHECK ENV VARS FIRST (for super admin bypass) - NO DATABASE REQUIRED
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // Try to find user in DB first to get real ID (if DB available)
        let dbUser = null;
        try {
          dbUser = await prisma.user.findUnique({
            where: { email },
          });
        } catch (dbError) {
          dbAvailable = false;
          console.warn('Database unavailable during login, using env-based auth');
        }

        // If user exists in DB, update to super_admin role
        if (dbUser) {
          if (dbUser.role !== 'super_admin') {
            try {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: 'super_admin' },
              });
            } catch (updateError) {
              console.warn('Could not update user role, using existing data');
            }
          }
          user = {
            id: dbUser.id,
            email: dbUser.email,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
            role: 'super_admin',
            isActive: true,
          };
        } else {
          // User doesn't exist in DB or DB unavailable, use env var credentials
          user = {
            id: dbAvailable ? 'super-admin-temp' : 'super-admin',
            email: email,
            firstName: 'Rahman',
            lastName: 'CEO',
            role: 'super_admin',
            isActive: true,
          };
        }
      
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

    // THEN check database (only if env check failed)
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      // Database unavailable - cannot authenticate without DB
      console.error('Database error during login:', error);
      return NextResponse.json({ 
        error: 'Authentication service unavailable. Please contact administrator.' 
      }, { status: 503 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
