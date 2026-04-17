import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { visaRuleId } = body;

    if (!visaRuleId) {
      return NextResponse.json({ error: 'Visa rule ID required' }, { status: 400 });
    }

    // Get existing incomplete apps
    const incompleteAppsStr = cookieStore.get('incomplete_apps')?.value || '[]';
    let incompleteApps: any[] = JSON.parse(incompleteAppsStr);

    // Remove the completed application
    incompleteApps = incompleteApps.filter(app => app.visaRuleId !== visaRuleId);

    // Save back
    cookieStore.set('incomplete_apps', JSON.stringify(incompleteApps), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      remaining: incompleteApps.length 
    });
  } catch (error) {
    console.error('Complete error:', error);
    return NextResponse.json({ error: 'Failed to complete' }, { status: 500 });
  }
}