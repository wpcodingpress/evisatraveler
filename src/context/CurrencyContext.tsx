'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

interface CurrencySettings {
  defaultCurrency: string;
  exchangeRates: Record<string, number>;
  enabledCurrencies: string[];
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  PKR: '₨',
  EUR: '€',
  GBP: '£',
};

const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  PKR: 'Pakistani Rupee',
  EUR: 'Euro',
  GBP: 'British Pound',
};

interface CurrencyContextType {
  selectedCurrency: Currency;
  currencies: Currency[];
  setCurrency: (code: string) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  isPKR: boolean;
  exchangeRate: number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings/currency');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          
          const savedCurrency = localStorage.getItem('preferred_currency');
          const currencyCode = savedCurrency || data.defaultCurrency || 'USD';
          const rate = data.exchangeRates?.[currencyCode] || 1;
          
          setSelectedCurrency({
            code: currencyCode,
            symbol: currencySymbols[currencyCode] || '$',
            name: currencyNames[currencyCode] || 'US Dollar',
            exchangeRate: rate,
          });
        }
      } catch (error) {
        console.error('Failed to fetch currency settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const setCurrency = (code: string) => {
    if (!settings) return;
    
    const rate = settings.exchangeRates?.[code] || 1;
    const newCurrency = {
      code,
      symbol: currencySymbols[code] || '$',
      name: currencyNames[code] || code,
      exchangeRate: rate,
    };
    
    setSelectedCurrency(newCurrency);
    localStorage.setItem('preferred_currency', code);
  };

  const convertPrice = (usdPrice: number): number => {
    return usdPrice * selectedCurrency.exchangeRate;
  };

  const formatPrice = (usdPrice: number): string => {
    const converted = convertPrice(usdPrice);
    return `${selectedCurrency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const currencies: Currency[] = settings?.enabledCurrencies?.map(code => ({
    code,
    symbol: currencySymbols[code] || '$',
    name: currencyNames[code] || code,
    exchangeRate: settings.exchangeRates?.[code] || 1,
  })) || [
    { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', exchangeRate: 280 },
  ];

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        currencies,
        setCurrency,
        convertPrice,
        formatPrice,
        isPKR: selectedCurrency.code === 'PKR',
        exchangeRate: selectedCurrency.exchangeRate,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
