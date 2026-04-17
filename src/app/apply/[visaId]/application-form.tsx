'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { VisaRule } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ApplicationFormProps {
  visaRule: VisaRule;
  travelers?: number;
  processing?: string;
}

interface UploadedFile {
  name: string;
  file: File;
  preview?: string;
}

const steps = [
  { id: 1, title: 'Personal Info', description: 'Your basic information' },
  { id: 2, title: 'Trip Details', description: 'When & where' },
  { id: 3, title: 'Documents', description: 'Upload required files' },
  { id: 4, title: 'Review & Pay', description: 'Confirm and pay' },
];

export function ApplicationForm({ visaRule, travelers = 1, processing = 'standard' }: ApplicationFormProps) {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: UploadedFile }>({});
  const [error, setError] = useState('');
  
  const basePrice = typeof visaRule.price === 'number' ? visaRule.price : Number(visaRule.price);
  const urgentFee = processing === 'urgent' ? Math.round(basePrice * 0.5) : 0;
  const totalPrice = (basePrice + urgentFee) * travelers;
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', nationality: '', passportNumber: '',
    passportExpiry: '', arrivalDate: '', departureDate: '',
    portOfEntry: 'airport', accommodationType: 'hotel', accommodationAddress: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docId: string, file: File) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload PDF, JPG or PNG files only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError('');
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setUploadedFiles(prev => ({ ...prev, [docId]: { name: file.name, file, preview } }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.firstName && formData.lastName && formData.email && formData.dateOfBirth && formData.passportNumber && formData.passportExpiry;
      case 2: return formData.arrivalDate && formData.departureDate;
      case 3: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const initiatePayment = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const appData = {
        visaRuleId: visaRule.id,
        travelers,
        processing,
        totalAmount: totalPrice,
        currency: visaRule.currency || 'USD',
        formData,
        uploadedFiles: Object.keys(uploadedFiles).map(id => ({ docId: id, fileName: uploadedFiles[id].name })),
      };
      
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }
        throw new Error(result.error || 'Failed to create application');
      }
      
      router.push(`/confirmation/${result.applicationNumber}`);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
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
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name *</label>
                <input type="text" required value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} 
                  placeholder="John" className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name *</label>
                <input type="text" required value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} 
                  placeholder="Doe" className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email *</label>
                <input type="email" required value={formData.email} onChange={e => updateField('email', e.target.value)} 
                  placeholder="john@example.com" className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} 
                  placeholder="+92 300 1234567" className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
                <input type="date" required value={formData.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} 
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                <select value={formData.gender} onChange={e => updateField('gender', e.target.value)} 
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Passport Number *</label>
              <input type="text" required value={formData.passportNumber} onChange={e => updateField('passportNumber', e.target.value)} 
                placeholder="AB1234567" className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Passport Expiry Date *</label>
              <input type="date" required value={formData.passportExpiry} onChange={e => updateField('passportExpiry', e.target.value)} 
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <p className="text-sm text-violet-700"><span className="font-semibold">Simplified Flow:</span> Enter your travel dates - we'll handle the rest!</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">When will you arrive? *</label>
                <input type="date" required value={formData.arrivalDate} onChange={e => updateField('arrivalDate', e.target.value)} 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">When will you leave? *</label>
                <input type="date" required value={formData.departureDate} onChange={e => updateField('departureDate', e.target.value)}
                  min={formData.arrivalDate || new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">How will you enter?</label>
              <select value={formData.portOfEntry} onChange={e => updateField('portOfEntry', e.target.value)} 
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all">
                <option value="airport">✈️ By Air</option>
                <option value="land">🚗 By Land</option>
                <option value="sea">🚢 By Sea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Where will you stay?</label>
              <select value={formData.accommodationType} onChange={e => updateField('accommodationType', e.target.value)} 
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all">
                <option value="hotel">🏨 Hotel</option>
                <option value="hostel">🛏️ Hostel</option>
                <option value="rental">🏠 Rental/ Airbnb</option>
                <option value="friend">👨‍👩‍👧 With Friend/Family</option>
                <option value="other">📍 Other</option>
              </select>
            </div>
            {formData.accommodationType !== 'other' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Accommodation Name/Address</label>
                <input type="text" value={formData.accommodationAddress} onChange={e => updateField('accommodationAddress', e.target.value)} 
                  placeholder={formData.accommodationType === 'hotel' ? 'Hotel name or booking reference' : 'Address'}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
            )}
          </div>
        );
      case 3:
        const docs = [
          { id: 'passport', name: 'Passport Bio Page', required: true, desc: 'Clear color copy of your passport information page' },
          { id: 'photo', name: 'Passport Photo', required: true, desc: 'Recent passport-size photo (white background)' },
          { id: 'hotel', name: 'Hotel Booking', required: false, desc: 'Hotel reservation (if available)' },
        ];
        return (
          <div className="space-y-4">
            <p className="text-slate-600 mb-4">Upload required documents (PDF, JPG, PNG - max 10MB each)</p>
            {docs.map(doc => (
              <div key={doc.id} className="relative">
                <input
                  type="file"
                  id={doc.id}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileUpload(doc.id, e.target.files[0])}
                />
                <label htmlFor={doc.id} className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  uploadedFiles[doc.id] 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50'
                }`}>
                  {uploadedFiles[doc.id] ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-green-700">{uploadedFiles[doc.id].name}</span>
                      <span className="text-sm text-green-600">(Click to change)</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="font-semibold text-slate-700">{doc.name} {doc.required && <span className="text-red-500">*</span>}</p>
                      <p className="text-sm text-slate-500">{doc.desc}</p>
                      <p className="text-xs text-slate-400 mt-1">Click to upload</p>
                    </>
                  )}
                </label>
              </div>
            ))}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case 4:
        const daysDiff = formData.arrivalDate && formData.departureDate 
          ? Math.ceil((new Date(formData.departureDate).getTime() - new Date(formData.arrivalDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
              <h4 className="font-bold text-violet-900 mb-3">📋 Application Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Visa Type</span><span className="font-semibold">{visaRule.visaType}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Destination</span><span className="font-semibold">{visaRule.toCountry.flag} {visaRule.toCountry.name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Processing</span><span className="font-semibold">{processing === 'urgent' ? 'Express' : 'Standard'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Travelers</span><span className="font-semibold">{travelers}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Trip Duration</span><span className="font-semibold">{daysDiff} days</span></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
              <h4 className="font-bold text-violet-900 mb-3">👤 Traveler Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-semibold">{formData.firstName} {formData.lastName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-semibold">{formData.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Passport</span><span className="font-semibold">{formData.passportNumber}</span></div>
              </div>
            </div>
            <div className="border-t-2 border-violet-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Visa Fee × {travelers}</span>
                <span className="font-semibold">${basePrice * travelers}</span>
              </div>
              {urgentFee > 0 && (
                <div className="flex justify-between items-center mb-2 text-amber-600">
                  <span>Express Processing</span>
                  <span className="font-semibold">+${urgentFee * travelers}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">${totalPrice}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Secure payment via Bank Alfalah
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-white via-violet-50/30 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-violet-600 font-semibold hover:text-violet-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
          
          <div className="relative bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="p-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{visaRule.toCountry.flag}</span>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{visaRule.visaType}</h1>
                    <p className="text-slate-600 text-sm">{visaRule.toCountry.name} • {travelers} traveler{travelers > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-center flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        currentStep >= step.id 
                          ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {currentStep > step.id ? '✓' : step.id}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-1 rounded ${currentStep > step.id ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">{steps[currentStep - 1].title}</h2>
                  <p className="text-slate-500 text-sm">{steps[currentStep - 1].description}</p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                {renderStep()}
              </div>
              
              <div className="p-5 border-t border-violet-100 flex justify-between gap-3">
                <button onClick={handleBack} disabled={currentStep === 1}
                  className="px-5 py-2.5 rounded-xl font-semibold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  ← Back
                </button>
                {currentStep < 4 ? (
                  <button onClick={handleNext} disabled={!canProceed()}
                    className="flex-1 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
                    Continue →
                  </button>
                ) : (
                  <button onClick={initiatePayment} disabled={isSubmitting}
                    className="flex-1 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 transition-all shadow-md flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Pay ${totalPrice} →
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">🔒 256-bit SSL</span>
            <span>•</span>
            <span className="flex items-center gap-1">🛡️ Verified</span>
            <span>•</span>
            <span>Bank Alfalah</span>
          </div>
        </div>
      </div>
    </main>
  );
}