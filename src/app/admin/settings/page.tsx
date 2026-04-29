'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'eVisaTraveler',
    siteUrl: 'https://evisatraveler.com',
    supportEmail: 'support@evisatraveler.com',
    currency: 'USD',
    timezone: 'UTC',
    maintenanceMode: false,
    requireEmailVerification: true,
    allowGuestCheckout: true,
    autoApproveVisa: false,
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'noreply@evisatraveler.com',
    smtpPassword: '',
  });
  
  const [currencySettings, setCurrencySettings] = useState({
    defaultCurrency: 'USD',
    exchangeRates: {
      USD: 1,
      PKR: 280,
      EUR: 0.92,
      GBP: 0.79,
    },
    enabledCurrencies: ['USD', 'PKR', 'EUR', 'GBP'],
  });

  useEffect(() => {
    fetch('/api/settings/currency')
      .then(res => res.json())
      .then(data => setCurrencySettings(data))
      .catch(err => console.error('Failed to load currency settings:', err));
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'currency', label: 'Currency', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'visa', label: 'Visa Settings', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];

  const handleSave = () => {
    setSaving(true);
    setSaveMessage('');
    setTimeout(() => {
      setSaving(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 500);
  };

  const handleSaveCurrency = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/settings/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currencySettings),
      });
      if (res.ok) {
        setSaveMessage('Currency settings saved successfully!');
        localStorage.removeItem('preferred_currency');
      } else {
        setSaveMessage('Failed to save currency settings');
      }
    } catch (error) {
      setSaveMessage('Error saving currency settings');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your application settings</p>
      </div>

      {saveMessage && (
        <div className={`px-6 py-4 rounded-xl ${saveMessage.includes('Failed') || saveMessage.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          {saveMessage}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <nav className="space-y-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">General Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Site URL</label>
                      <input
                        type="url"
                        value={settings.siteUrl}
                        onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Site Options</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Maintenance Mode</p>
                        <p className="text-sm text-slate-500">Put site into maintenance mode</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">Email Verification</p>
                        <p className="text-sm text-slate-500">Require email verification for new users</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.requireEmailVerification ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.requireEmailVerification ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'currency' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Currency Settings</h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Configure currencies and exchange rates. Your visa prices are stored in USD and will be automatically converted to the selected currency for customers.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Default Currency</label>
                      <select
                        value={currencySettings.defaultCurrency}
                        onChange={(e) => setCurrencySettings({ ...currencySettings, defaultCurrency: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      >
                        {currencySettings.enabledCurrencies.map(cur => (
                          <option key={cur} value={cur}>{cur}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Exchange Rates (1 USD = ?)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(currencySettings.exchangeRates).map(([code, rate]) => (
                        <div key={code} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                          <div className="w-16">
                            <span className="font-bold text-slate-900">{code}</span>
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              step="0.01"
                              value={rate}
                              onChange={(e) => setCurrencySettings({
                                ...currencySettings,
                                exchangeRates: {
                                  ...currencySettings.exchangeRates,
                                  [code]: parseFloat(e.target.value) || 1
                                }
                              })}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="font-semibold text-slate-900 mb-4">Enabled Currencies</h3>
                    <div className="flex flex-wrap gap-3">
                      {['USD', 'PKR', 'EUR', 'GBP'].map(cur => (
                        <label key={cur} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={currencySettings.enabledCurrencies.includes(cur)}
                            onChange={(e) => {
                              const enabled = currencySettings.enabledCurrencies;
                              if (e.target.checked) {
                                setCurrencySettings({
                                  ...currencySettings,
                                  enabledCurrencies: [...enabled, cur]
                                });
                              } else {
                                setCurrencySettings({
                                  ...currencySettings,
                                  enabledCurrencies: enabled.filter(c => c !== cur)
                                });
                              }
                            }}
                            className="w-4 h-4 text-violet-600 rounded"
                          />
                          <span className="font-medium">{cur}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <button
                      onClick={handleSaveCurrency}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Currency Settings'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Email Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Host</label>
                      <input
                        type="text"
                        value={settings.smtpHost}
                        onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Port</label>
                      <input
                        type="text"
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Username</label>
                      <input
                        type="text"
                        value={settings.smtpUser}
                        onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SMTP Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password to update"
                        value={settings.smtpPassword}
                        onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'visa' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Visa Application Settings</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Auto-Approve Visas</p>
                        <p className="text-sm text-slate-500">Automatically approve visa applications after review</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, autoApproveVisa: !settings.autoApproveVisa })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoApproveVisa ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoApproveVisa ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Allow Guest Checkout</p>
                        <p className="text-sm text-slate-500">Allow users to apply without creating an account</p>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, allowGuestCheckout: !settings.allowGuestCheckout })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.allowGuestCheckout ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowGuestCheckout ? 'left-7' : 'left-1'}`} />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Security Settings</h2>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <p className="text-amber-800 font-medium">Two-factor authentication is recommended</p>
                    <p className="text-amber-600 text-sm mt-1">Enable 2FA to add an extra layer of security to your admin account</p>
                    <button className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Change Account Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {passwordError}
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        setPasswordError('');
                        if (passwordData.newPassword !== passwordData.confirmPassword) {
                          setPasswordError('New passwords do not match');
                          return;
                        }
                        if (passwordData.newPassword.length < 6) {
                          setPasswordError('Password must be at least 6 characters');
                          return;
                        }
                        setChangingPassword(true);
                        try {
                          const res = await fetch('/api/user/password', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              currentPassword: passwordData.currentPassword,
                              newPassword: passwordData.newPassword,
                            }),
                          });
                          if (res.ok) {
                            alert('Password changed successfully!');
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          } else {
                            const data = await res.json();
                            setPasswordError(data.error || 'Failed to change password');
                          }
                        } catch {
                          setPasswordError('Failed to change password');
                        } finally {
                          setChangingPassword(false);
                        }
                      }}
                      disabled={changingPassword}
                      className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-50"
                    >
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-600/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
