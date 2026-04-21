'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // USD to this currency
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', exchangeRate: 280 }, // Default rate
  { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.79 },
];

interface CurrencyContextType {
  selectedCurrency: Currency;
  currencies: Currency[];
  setCurrency: (code: string) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  isPKR: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency');
    if (savedCurrency) {
      const currency = currencies.find(c => c.code === savedCurrency);
      if (currency) setSelectedCurrency(currency);
    }
  }, []);

  const setCurrency = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem('preferred_currency', code);
    }
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

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        currencies,
        setCurrency,
        convertPrice,
        formatPrice,
        isPKR: selectedCurrency.code === 'PKR',
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

export { currencies };