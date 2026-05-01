import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'settings.json');

const defaultSettings = {
  siteName: 'eVisaTraveler',
  siteUrl: 'https://evisatraveler.com',
  supportEmail: 'support@evisatraveler.com',
  currency: 'USD',
  timezone: 'UTC',
  maintenanceMode: false,
  requireEmailVerification: true,
  allowGuestCheckout: true,
  autoApproveVisa: false,
};

function getSettings() {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const data = readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  return defaultSettings;
}

function saveSettings(settings: typeof defaultSettings) {
  try {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currentSettings = getSettings();
    const updatedSettings = { ...currentSettings, ...body };
    const success = saveSettings(updatedSettings);

    if (success) {
      return NextResponse.json({ success: true, settings: updatedSettings });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to save settings' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
