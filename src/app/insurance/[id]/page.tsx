'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

interface Insurance {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  coverage: string;
  duration: string;
  benefits: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth: string;
  travelDate: string;
  returnDate: string;
  beneficiaryName: string;
  beneficiaryRelation: string;
}

export default function InsuranceFormPage() {
  const router = useRouter();
  const params = useParams();
  const { formatPrice } = useCurrency();
  const [insurance, setInsurance] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    dateOfBirth: '',
    travelDate: '',
    returnDate: '',
    beneficiaryName: '',
    beneficiaryRelation: '',
  });

  useEffect(() => {
    checkAuth();
    fetchInsurance();
  }, [params.id]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (!data.authenticated) {
        router.push(`/login?callback=/insurance/${params.id}`);
      }
    } catch {
      router.push(`/login?callback=/insurance/${params.id}`);
    }
  };

  const fallbackInsurances = [
    { id: '1', name: 'Basic Protection', description: 'Essential travel insurance covering medical emergencies up to $25,000. Perfect for short trips.', price: 3, currency: 'USD', coverage: '$25,000', duration: 'Per Trip', benefits: '["Medical emergency coverage","Trip cancellation","24/7 assistance"]' },
    { id: '2', name: 'Standard Plus', description: 'Comprehensive coverage with higher limits. Ideal for family travelers and longer trips.', price: 5, currency: 'USD', coverage: '$50,000', duration: 'Per Trip', benefits: '["Medical coverage","Trip interruption","Flight delays","Travel accident"]' },
    { id: '3', name: 'Premium Shield', description: 'Maximum protection for worry-free travel. Includes adventure sports coverage.', price: 10, currency: 'USD', coverage: '$100,000', duration: 'Per Trip', benefits: '["Full coverage","Adventure sports","Personal liability","Home burglary"]' },
  ];

  const fetchInsurance = async () => {
    try {
      const res = await fetch('/api/insurance');
      const data = await res.json();
      let found = null;
      if (Array.isArray(data)) {
        found = data.find((i: Insurance) => i.id === params.id);
      }
      if (!found) {
        found = fallbackInsurances.find((i) => i.id === params.id);
      }
      setInsurance(found || null);
    } catch (err) {
      const found = fallbackInsurances.find((i) => i.id === params.id);
      setInsurance(found || null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.passportNumber.trim() &&
      formData.dateOfBirth &&
      formData.travelDate &&
      formData.returnDate &&
      formData.beneficiaryName.trim() &&
      formData.beneficiaryRelation
    );
  };

  const initiatePayment = async () => {
    setSubmitting(true);
    setError('');
    
    try {
      const appData = {
        insuranceId: params.id,
        formData: {
          ...formData,
          insuranceName: insurance?.name,
          insurancePrice: insurance?.price,
          coverage: insurance?.coverage,
        }
      };
      
      // Try to create order in database first
      const res = await fetch('/api/insurance/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData),
      });
      
      let orderId = null;
      let useDirectPayment = false;
      
      if (res.ok) {
        const result = await res.json();
        if (result.id) {
          orderId = result.id;
        }
      }
      
      // If no database order, use direct payment (for fallback without DB)
      if (!orderId) {
        // Generate a temporary order reference
        orderId = `INS-TEMP-${Date.now()}`;
        useDirectPayment = true;
      }
      
      // Now initiate payment via same endpoint
      const payRes = await fetch('/api/insurance/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: insurance?.price }),
      });

      if (payRes.ok) {
        const html = await payRes.text();
        document.write(html);
        document.close();
      } else {
        throw new Error('Payment gateway unavailable');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError('Unable to process payment. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <main className="flex-1 py-12 md:py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!insurance) {
    return (
      <main className="flex-1 py-12 md:py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-slate-900">Insurance not found</h1>
            <Link href="/insurance" className="text-violet-600 hover:underline mt-2 inline-block">
              Back to Insurance
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Link href="/insurance" className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Insurance
            </Link>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 rounded-full blur-xl" />
            
            <div className="relative p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{insurance.name}</h1>
                  <p className="text-slate-600">{insurance.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-sm">Coverage: {insurance.coverage}</p>
                  <p className="text-3xl font-bold text-violet-600">{formatPrice(insurance.price)}</p>
                </div>
              </div>

              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Passport Number *</label>
                    <input
                      type="text"
                      name="passportNumber"
                      required
                      value={formData.passportNumber}
                      onChange={handleChange}
                      placeholder="AB1234567"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Travel Start Date *</label>
                    <input
                      type="date"
                      name="travelDate"
                      required
                      value={formData.travelDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Return Date *</label>
                    <input
                      type="date"
                      name="returnDate"
                      required
                      value={formData.returnDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Beneficiary Name *</label>
                    <input
                      type="text"
                      name="beneficiaryName"
                      required
                      value={formData.beneficiaryName}
                      onChange={handleChange}
                      placeholder="Emergency contact name"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Relationship *</label>
                    <select
                      name="beneficiaryRelation"
                      required
                      value={formData.beneficiaryRelation}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Select</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={initiatePayment}
                    disabled={submitting || !isFormValid()}
                    className="w-full relative group py-4 rounded-xl text-white font-semibold overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 group-hover:from-violet-500 group-hover:to-purple-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                    <span className="relative">
                      {submitting ? 'Processing...' : `Pay ${formatPrice(insurance.price)}`}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure payment via Bank Alfalah
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}