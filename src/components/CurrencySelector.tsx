'use client';

import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

export function CurrencySelector() {
  const { selectedCurrency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <span className="text-lg">{selectedCurrency.symbol}</span>
        <span className="text-sm font-medium text-slate-700">{selectedCurrency.code}</span>
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-2">
              <p className="text-xs text-slate-500 px-3 py-2">Select Currency</p>
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    setCurrency(currency.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCurrency.code === currency.code
                      ? 'bg-violet-50 text-violet-700'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{currency.symbol}</span>
                    <span className="font-medium">{currency.code}</span>
                  </span>
                  <span className="text-xs text-slate-400">{currency.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PriceDisplay({ price, className = '' }: { price: number; className?: string }) {
  const { formatPrice } = useCurrency();
  return <span className={className}>{formatPrice(price)}</span>;
}