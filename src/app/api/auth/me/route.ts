import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userId.value,
        email: userEmail?.value || '',
        firstName: userName?.value || 'User',
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}