'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VisaRule } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ApplicationFormProps {
  visaRule: VisaRule;
  travelers?: number;
  processing?: string;
}

const steps = [
  { id: 1, title: 'Personal Info', description: 'Your basic information' },
  { id: 2, title: 'Travel Details', description: 'Trip information' },
  { id: 3, title: 'Documents', description: 'Upload required files' },
  { id: 4, title: 'Review', description: 'Confirm your application' },
];

export function ApplicationForm({ visaRule, travelers = 1, processing = 'standard' }: ApplicationFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [travelerCount] = useState(travelers);
  const [processingOption] = useState(processing);
  const basePrice = typeof visaRule.price === 'number' ? visaRule.price : Number(visaRule.price);
  const urgentFee = processingOption === 'urgent' ? basePrice * 0.5 : 0;
  const totalPrice = (basePrice + urgentFee) * travelerCount;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    passportNumber: '',
    passportExpiry: '',
    passportIssueDate: '',
    arrivalDate: '',
    departureDate: '',
    portOfEntry: '',
    accommodationType: 'hotel',
    accommodationAddress: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.dateOfBirth && formData.passportNumber;
      case 2:
        return formData.arrivalDate && formData.departureDate;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visaRuleId: visaRule.id, formData }),
      });
      if (!response.ok) throw new Error('Failed');
      const result = await response.json();
      router.push(`/confirmation/${result.applicationNumber}`);
    } catch {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
                <input type="text" required value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="John" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
                <input type="text" required value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Doe" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input type="email" required value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="john@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 234 567 8900" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth *</label>
              <input type="date" required value={formData.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Passport Number *</label>
              <input type="text" required value={formData.passportNumber} onChange={(e) => updateField('passportNumber', e.target.value)} placeholder="AB1234567" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Passport Issue Date</label>
                <input type="date" value={formData.passportIssueDate} onChange={(e) => updateField('passportIssueDate', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Passport Expiry *</label>
                <input type="date" required value={formData.passportExpiry} onChange={(e) => updateField('passportExpiry', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Arrival Date *</label>
                <input type="date" required value={formData.arrivalDate} onChange={(e) => updateField('arrivalDate', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Departure Date *</label>
                <input type="date" required value={formData.departureDate} onChange={(e) => updateField('departureDate', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Port of Entry *</label>
              <input type="text" required value={formData.portOfEntry} onChange={(e) => updateField('portOfEntry', e.target.value)} placeholder="e.g., Suvarnabhumi Airport" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Accommodation Type</label>
              <select value={formData.accommodationType} onChange={(e) => updateField('accommodationType', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                <option value="hotel">Hotel</option>
                <option value="hostel">Hostel</option>
                <option value="rental">Rental</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Accommodation Address</label>
              <input type="text" value={formData.accommodationAddress} onChange={(e) => updateField('accommodationAddress', e.target.value)} placeholder="123 Example Street" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" />
            </div>
          </div>
        );
      case 3:
        const docs = visaRule.documents as { id: string; name: string; required: boolean }[];
        return (
          <div className="space-y-4">
            <p className="text-slate-600 mb-4">Upload required documents (PDF, JPG, PNG - max 10MB)</p>
            {docs.filter(d => d.required).map(doc => (
              <div key={doc.id} className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center hover:border-purple-400 cursor-pointer transition-colors bg-purple-50/30">
                <svg className="w-12 h-12 mx-auto text-purple-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-medium text-slate-700 mb-1">{doc.name}</p>
                <p className="text-sm text-slate-500">Click or drag to upload</p>
              </div>
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50/50 to-green-50/50 rounded-xl p-4 border border-purple-100">
              <h4 className="font-semibold mb-3 text-slate-900">Application Summary</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Visa</dt><dd className="font-medium">{visaRule.visaType} Visa</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Destination</dt><dd className="font-medium">{visaRule.toCountry.flag} {visaRule.toCountry.name}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Processing</dt><dd className="font-medium">{visaRule.processingTime}</dd></div>
              </dl>
            </div>
            <div className="bg-gradient-to-br from-purple-50/50 to-green-50/50 rounded-xl p-4 border border-purple-100">
              <h4 className="font-semibold mb-3 text-slate-900">Traveler Info</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Name</dt><dd className="font-medium">{formData.firstName} {formData.lastName}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Email</dt><dd className="font-medium">{formData.email}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Passport</dt><dd className="font-medium">{formData.passportNumber}</dd></div>
              </dl>
            </div>
            <div className="border-t border-purple-100 pt-4 flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">{formatCurrency(visaRule.price)}</span>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/50 to-green-50/50">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{visaRule.toCountry.flag}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{visaRule.visaType} Visa</h1>
                    <p className="text-slate-600">{visaRule.toCountry.name} - {formatCurrency(visaRule.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep >= step.id 
                          ? 'bg-gradient-to-br from-purple-600 to-green-500 text-white shadow-lg shadow-purple-500/20' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {currentStep > step.id ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step.id}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-16 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-gradient-to-r from-purple-500 to-green-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{steps[currentStep - 1].title}</h2>
                  <p className="text-slate-500">{steps[currentStep - 1].description}</p>
                </div>
                {renderStep()}
              </div>
              
              <div className="p-6 border-t border-purple-100 flex justify-between">
                <button 
                  onClick={handleBack} 
                  disabled={currentStep === 1}
                  className="px-6 py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Back
                </button>
                {currentStep < 4 ? (
                  <button 
                    onClick={handleNext} 
                    disabled={!canProceed()}
                    className="relative group px-8 py-3 rounded-xl text-white font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 group-hover:from-purple-500 group-hover:to-green-400 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                    <span className="relative">Continue</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="relative group px-8 py-3 rounded-xl text-white font-semibold overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 group-hover:from-purple-500 group-hover:to-green-400 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                    <span className="relative">{isSubmitting ? 'Processing...' : 'Submit Application'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
