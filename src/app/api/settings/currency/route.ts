import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'currency-settings.json');

const defaultSettings = {
  defaultCurrency: 'USD',
  exchangeRates: {
    USD: 1,
    PKR: 280,
    EUR: 0.92,
    GBP: 0.79,
  },
  enabledCurrencies: ['USD', 'PKR', 'EUR', 'GBP'],
};

function getSettings() {
  try {
    if (existsSync(SETTINGS_FILE)) {
      const data = readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading currency settings:', error);
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
    console.error('Error saving currency settings:', error);
    return false;
  }
}

export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentSettings = getSettings();
    
    const updatedSettings = {
      ...currentSettings,
      ...body,
      exchangeRates: {
        ...currentSettings.exchangeRates,
        ...(body.exchangeRates || {}),
      },
    };
    
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
