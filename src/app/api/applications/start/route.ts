import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface IncompleteApp {
  visaRuleId: string;
  startedAt: string;
  step: number;
  callbackUrl?: string;
  travelers?: number;
  processing?: string;
}

const MAX_INCOMPLETE = 5;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { visaRuleId, step, callbackUrl, travelers, processing } = body;

    // Get existing incomplete apps
    const incompleteAppsStr = cookieStore.get('incomplete_apps')?.value || '[]';
    let incompleteApps: IncompleteApp[] = JSON.parse(incompleteAppsStr);

    // Check if this application already exists
    const existingIndex = incompleteApps.findIndex(app => app.visaRuleId === visaRuleId);
    
    if (existingIndex >= 0) {
      // Update existing
      incompleteApps[existingIndex].step = step;
      incompleteApps[existingIndex].startedAt = new Date().toISOString();
    } else {
      // Add new incomplete application (limit to MAX)
      if (incompleteApps.length >= MAX_INCOMPLETE) {
        incompleteApps = incompleteApps.slice(1);
      }
      incompleteApps.push({
        visaRuleId,
        startedAt: new Date().toISOString(),
        step: step || 1,
        callbackUrl,
        travelers,
        processing,
      });
    }

    // Save back
    cookieStore.set('incomplete_apps', JSON.stringify(incompleteApps), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      count: incompleteApps.length,
      incomplete: incompleteApps 
    });
  } catch (error) {
    console.error('Track incomplete error:', error);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const incompleteAppsStr = cookieStore.get('incomplete_apps')?.value || '[]';
    const incompleteApps: IncompleteApp[] = JSON.parse(incompleteAppsStr);

    return NextResponse.json({ 
      count: incompleteApps.length,
      incomplete: incompleteApps 
    });
  } catch {
    return NextResponse.json({ count: 0, incomplete: [] });
  }
}