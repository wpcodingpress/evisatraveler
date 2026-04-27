'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  dateOfBirth: string;
  travelDate: string;
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
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    passportNumber: '',
    dateOfBirth: '',
    travelDate: '',
    beneficiaryName: '',
    beneficiaryRelation: '',
  });

  useEffect(() => {
    fetchInsurance();
  }, [params.id]);

  const fetchInsurance = async () => {
    try {
      const res = await fetch('/api/insurance');
      const data = await res.json();
      const found = data.find((i: Insurance) => i.id === params.id);
      setInsurance(found || null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/insurance/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insuranceId: insurance?.id, formData }),
      });

      const order = await res.json();

      if (order.id) {
        const payRes = await fetch('/api/insurance/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id, amount: insurance?.price }),
        });

        if (payRes.ok) {
          const html = await payRes.text();
          document.write(html);
          document.close();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
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
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {insurance.name}
            </h1>
            <p className="text-slate-600">{insurance.description}</p>
            <div className="mt-2 text-2xl font-bold text-violet-600">{formatPrice(insurance.price)}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-violet-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Travel Date *</label>
                <input
                  type="date"
                  name="travelDate"
                  required
                  value={formData.travelDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full relative group py-4 rounded-xl text-white font-semibold overflow-hidden disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 group-hover:from-violet-500 group-hover:to-purple-600 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                  <span className="relative">
                    {submitting ? 'Processing...' : `Pay ${formatPrice(insurance.price)}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}