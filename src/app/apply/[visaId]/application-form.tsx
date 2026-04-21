'use client';

import { useState, useEffect } from 'react';
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
  { id: 2, title: 'Trip Details', description: 'Travel dates' },
  { id: 3, title: 'Documents', description: 'Upload required files' },
  { id: 4, title: 'Review & Pay', description: 'Confirm and pay' },
];

export function ApplicationForm({ visaRule, travelers = 1, processing = 'standard' }: ApplicationFormProps) {
  const router = useRouter();

  useEffect(() => {
    // Load saved form data from localStorage
    const savedKey = `evisa_form_${visaRule.id}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || {});
        if (parsed.uploadedFiles) {
          setUploadedFiles(parsed.uploadedFiles);
        }
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
        console.log('Restored saved form data');
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    trackIncomplete(1);
  }, [visaRule.id]);

  const trackIncomplete = async (step: number) => {
    try {
      await fetch('/api/applications/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visaRuleId: visaRule.id,
          step,
          callbackUrl: `/apply/${visaRule.id}?travelers=${travelers}&processing=${processing}`,
          travelers,
          processing,
        }),
      });
      
      // Save form data to localStorage for persistence
      localStorage.setItem(`evisa_form_${visaRule.id}`, JSON.stringify({
        formData,
        uploadedFiles,
        currentStep: step,
        travelers,
        processing,
        savedAt: new Date().toISOString()
      }));
    } catch { /* Silent fail */ }
  };
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: UploadedFile}>({});
  const [error, setError] = useState('');
  
  const basePrice = typeof visaRule.price === 'number' ? visaRule.price : Number(visaRule.price);
  const urgentFee = processing === 'urgent' ? Math.round(basePrice * 0.5) : 0;
  const totalPrice = (basePrice + urgentFee) * travelers;
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', nationality: '', passportNumber: '',
    passportExpiry: '', arrivalDate: '', departureDate: '',
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
      case 1: return formData.firstName && formData.lastName && formData.email && formData.dateOfBirth && formData.passportNumber && formData.passportExpiry && formData.phone;
      case 2: return formData.arrivalDate && formData.departureDate;
      case 3: return true;
      default: return true;
    }
  };

  const handleNext = async () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      await trackIncomplete(currentStep + 1);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      await trackIncomplete(currentStep - 1);
    }
  };

  const initiatePayment = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      // Create application first to get ID
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
        throw new Error(result.error || 'Failed to create application');
      }
      
      const applicationId = result.id;
      const applicationNumber = result.applicationNumber;
      
      // Upload each file to server
      const uploadedDocs = [];
      for (const [docId, fileData] of Object.entries(uploadedFiles)) {
        try {
          const formData = new FormData();
          formData.append('file', fileData.file);
          formData.append('applicationId', applicationId); // Use numeric ID for DB
          formData.append('docType', docId);
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedDocs.push(uploadData.document);
          }
        } catch (uploadError) {
          console.error('Failed to upload file:', docId, uploadError);
        }
      }
      
      // Clear saved form data on successful submission
      localStorage.removeItem(`evisa_form_${visaRule.id}`);
      
      if (result.paymentUrl && !result.paymentUrl.includes('demo')) {
        window.location.href = result.paymentUrl;
        return;
      }
      
      router.push(`/confirmation/${applicationId}`);
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
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
                <input type="tel" required value={formData.phone} onChange={e => updateField('phone', e.target.value)} 
                  placeholder="+92 300 1234567" className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth *</label>
                <div className="relative">
                  <input type="date" required value={formData.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} 
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
                  <svg className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender *</label>
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
              <div className="relative">
                <input type="date" required value={formData.passportExpiry} onChange={e => updateField('passportExpiry', e.target.value)} 
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
                <svg className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <p className="text-sm text-violet-700">
                <span className="font-semibold">Route:</span> {visaRule.fromCountry.flag} {visaRule.fromCountry.name} → {visaRule.toCountry.flag} {visaRule.toCountry.name}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Arrival Date *</label>
                <div className="relative">
                  <input type="date" required value={formData.arrivalDate} onChange={e => updateField('arrivalDate', e.target.value)} 
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
                  <svg className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departure Date *</label>
                <div className="relative">
                  <input type="date" required value={formData.departureDate} onChange={e => updateField('departureDate', e.target.value)}
                    min={formData.arrivalDate || new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all" />
                  <svg className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        const docs = [
          { id: 'passport', name: 'Passport Bio Page', required: true, desc: 'Clear color copy of your passport information page' },
          { id: 'photo', name: 'Passport Photo', required: true, desc: 'Recent passport-size photo (white background)' },
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
            {/* Visa Summary Card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-200">
              <h4 className="font-bold text-violet-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Application Summary
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Visa Type</span><p className="font-semibold">{visaRule.visaType} Visa</p></div>
                <div><span className="text-slate-500">Destination</span><p className="font-semibold">{visaRule.toCountry.flag} {visaRule.toCountry.name}</p></div>
                <div><span className="text-slate-500">From</span><p className="font-semibold">{visaRule.fromCountry.flag} {visaRule.fromCountry.name}</p></div>
                <div><span className="text-slate-500">Processing</span><p className="font-semibold">{processing === 'urgent' ? 'Express' : 'Standard'}</p></div>
                <div><span className="text-slate-500">Travelers</span><p className="font-semibold">{travelers} Passenger{travelers > 1 ? 's' : ''}</p></div>
                <div><span className="text-slate-500">Duration</span><p className="font-semibold">{daysDiff} Days</p></div>
              </div>
            </div>

            {/* Full Traveler Details */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Traveler Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Full Name</p>
                  <p className="font-semibold text-slate-900">{formData.firstName} {formData.lastName}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Email Address</p>
                  <p className="font-semibold text-slate-900 break-all">{formData.email}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Phone Number</p>
                  <p className="font-semibold text-slate-900">{formData.phone || 'Not provided'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Date of Birth</p>
                  <p className="font-semibold text-slate-900">{formData.dateOfBirth}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Gender</p>
                  <p className="font-semibold text-slate-900 capitalize">{formData.gender || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Nationality</p>
                  <p className="font-semibold text-slate-900">{formData.nationality || 'Not specified'}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Passport Number</p>
                  <p className="font-semibold text-slate-900">{formData.passportNumber}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Passport Expiry</p>
                  <p className="font-semibold text-slate-900">{formData.passportExpiry}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Arrival Date</p>
                  <p className="font-semibold text-slate-900">{formData.arrivalDate}</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 text-xs uppercase tracking-wide">Departure Date</p>
                  <p className="font-semibold text-slate-900">{formData.departureDate}</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t-2 border-violet-200 pt-4 bg-white rounded-xl p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Visa Fee × {travelers}</span>
                  <span className="font-semibold">${basePrice * travelers}</span>
                </div>
                {urgentFee > 0 && (
                  <div className="flex justify-between items-center text-amber-600">
                    <span>Express Processing</span>
                    <span className="font-semibold">+${urgentFee * travelers}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-900">Total Payable</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">${totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Payment Banner */}
            <div className="mt-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h18v18H3V3zm16.5 16.5v-15h-15v15h15zM9 9h6v6H9V9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold">Bank Alfalah Payment Gateway</p>
                    <p className="text-xs text-white/80">Secure & Encrypted Transaction</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Protected</span>
                </div>
              </div>
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
              {/* Form Header with Flag and Route Info */}
              <div className="p-5 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl" role="img" aria-label="{visaRule.toCountry.name} flag">{visaRule.toCountry.flag}</span>
                  <div className="flex-1 text-left">
                    <h1 className="text-xl font-bold text-slate-900">{visaRule.visaType} Visa</h1>
                    <p className="text-slate-600 text-sm">
                      {visaRule.fromCountry.flag} {visaRule.fromCountry.name} → {visaRule.toCountry.flag} {visaRule.toCountry.name}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">{travelers} traveler{travelers > 1 ? 's' : ''} • {processing === 'urgent' ? 'Express Processing' : 'Standard Processing'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">${totalPrice}</p>
                    <p className="text-xs text-slate-500">total</p>
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
                    className="flex-1 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-600 disabled:opacity-60 transition-all shadow-md flex items-center justify-center gap-2">
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
                        Pay $${totalPrice} Now →
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
            <span className="flex items-center gap-1">🛡️ Secure</span>
            <span>•</span>
            <span>Bank Alfalah</span>
          </div>
        </div>
      </div>
    </main>
  );
}
