'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

interface Country {
  id: string;
  name: string;
  code: string;
  flag?: string;
}

interface SearchFormProps {
  countries: Country[];
}

export function EnhancedSearchForm({ countries }: SearchFormProps) {
  const router = useRouter();
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeDropdown && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [activeDropdown]);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: { from?: string; to?: string } = {};
    if (!fromCountry) newErrors.from = 'Select your country';
    if (!toCountry) newErrors.to = 'Select destination';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearch = () => {
    if (!validateForm()) return;
    router.push(`/visa/${fromCountry}-to-${toCountry}`);
  };

  const handleSwap = () => {
    const tempFrom = fromCountry;
    const tempTo = toCountry;
    setFromCountry(tempTo);
    setToCountry(tempFrom);
  };

  const handleCountrySelect = (code: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFromCountry(code);
      setErrors(prev => ({ ...prev, from: undefined }));
    } else {
      setToCountry(code);
      setErrors(prev => ({ ...prev, to: undefined }));
    }
    setActiveDropdown(null);
    setSearchQuery('');
  };

  const selectedFrom = countries.find(c => c.code === fromCountry);
  const selectedTo = countries.find(c => c.code === toCountry);

  const DropdownModal = ({ type }: { type: 'from' | 'to' }) => {
    const isFrom = type === 'from';
    const selected = isFrom ? fromCountry : toCountry;
    
    if (activeDropdown !== type) return null;
    
    return createPortal(
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 2147483647 }}
        onClick={() => { setActiveDropdown(null); setSearchQuery(''); }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div 
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
          style={{ zIndex: 2147483647 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-4 border-b border-slate-100 ${isFrom ? 'bg-violet-50' : 'bg-emerald-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {isFrom ? 'Select Your Nationality' : 'Select Destination'}
              </h3>
              <button 
                onClick={() => { setActiveDropdown(null); setSearchQuery(''); }}
                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isFrom ? 'Search by country name...' : 'Search destination...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`w-full border-2 ${isFrom ? 'border-violet-300 focus:border-violet-500' : 'border-emerald-300 focus:border-emerald-500'} rounded-xl pl-10 pr-4 py-3 text-base focus:ring-2 ${isFrom ? 'focus:ring-violet-100' : 'focus:ring-emerald-100'} bg-white transition-all`}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCountrySelect(c.code, type)}
                  className={`w-full flex items-center gap-4 px-5 py-4 ${isFrom ? 'hover:bg-violet-50' : 'hover:bg-emerald-50'} transition-colors text-left border-b border-slate-50`}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-slate-900 font-medium flex-1">{c.name}</span>
                  <span className="text-slate-500 text-sm font-bold bg-slate-100 px-2 py-1 rounded">{c.code}</span>
                  {selected === c.code && (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isFrom ? 'bg-violet-500' : 'bg-emerald-500'}`}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-500">No countries found</p>
                <p className="text-slate-400 text-sm">Try a different search term</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-center">
            <button 
              onClick={() => { setActiveDropdown(null); setSearchQuery(''); }}
              className="text-slate-500 text-sm hover:text-slate-700 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-4xl mx-auto">
      <DropdownModal type="from" />
      <DropdownModal type="to" />
      
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Form Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Check Visa Requirements</h3>
              <p className="text-white/70 text-sm">Find the right visa for your trip</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/70 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure & Fast</span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            
            {/* From Country */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 text-xs font-bold">1</span>
                  </span>
                  My nationality is
                </span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setActiveDropdown('from'); setSearchQuery(''); }}
                  className={`w-full h-14 flex items-center gap-3 bg-white border-2 ${errors.from ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'} rounded-xl px-4 text-left transition-all duration-200`}
                >
                  {selectedFrom ? (
                    <>
                      <span className="text-2xl">{selectedFrom.flag}</span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-slate-900 font-semibold text-sm truncate">{selectedFrom.name}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 text-sm flex-1">Select country...</span>
                  )}
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
            </div>

            {/* Swap Button - Desktop */}
            <div className="hidden lg:flex lg:col-span-1 justify-center items-end pb-1">
              <button
                type="button"
                onClick={handleSwap}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                title="Swap countries"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* To Country */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600 text-xs font-bold">2</span>
                  </span>
                  Destination country
                </span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setActiveDropdown('to'); setSearchQuery(''); }}
                  className={`w-full h-14 flex items-center gap-3 bg-white border-2 ${errors.to ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'} rounded-xl px-4 text-left transition-all duration-200`}
                >
                  {selectedTo ? (
                    <>
                      <span className="text-2xl">{selectedTo.flag}</span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-slate-900 font-semibold text-sm truncate">{selectedTo.name}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 text-sm flex-1">Select destination...</span>
                  )}
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
            </div>

            {/* Search Button */}
            <div className="lg:col-span-3">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full h-14 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Get Started</span>
              </button>
            </div>
          </div>

          {/* Mobile Swap Button */}
          <div className="lg:hidden flex justify-center mt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-600 transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H8m0 0l4 4m-4-4l4-4" />
              </svg>
              Swap
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              99.9% Approval Rate
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure Payment
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
