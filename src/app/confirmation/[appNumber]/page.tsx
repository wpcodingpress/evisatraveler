'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Document {
  id: string;
  type: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
}

interface Application {
  id: string;
  applicationNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  visaRule: {
    visaType: string;
    processingTime: string;
    toCountry: {
      name: string;
      flag: string;
    };
  };
  documents: Document[];
}

function ConfirmationContent({ appNumber }: { appNumber: string }) {
  const searchParams = useSearchParams();
  const isPaid = searchParams.get('paid') === 'true';
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`/api/applications/${appNumber}`);
        if (res.ok) {
          const data = await res.json();
          setApp(data);
        }
      } catch (err) {
        console.error('Failed to fetch application', err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [appNumber]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600">Loading application...</p>
      </div>
    );
  }

  if (!app) return notFound();

  return (
    <div className="relative bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
      <div className="absolute -top-3 -left-3 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
      <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-full blur-xl" />
      
      <div className="relative">
        <div className="p-8 text-center border-b border-purple-100 bg-gradient-to-b from-purple-50/30 to-transparent">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            {isPaid || app?.paymentStatus === 'paid' ? (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isPaid || app?.paymentStatus === 'paid' ? 'Payment Successful!' : 'Application Submitted!'}
          </h1>
          <p className="text-slate-600">
            {isPaid || app?.paymentStatus === 'paid' 
              ? 'Your payment was successful. Your visa application is being processed.' 
              : 'Your visa application has been successfully submitted for processing.'}
          </p>
        </div>

        <div className="p-8">
          <dl className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-purple-100">
              <dt className="text-slate-500">Application Number</dt>
              <dd className="font-bold text-lg text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">{app.applicationNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Visa Type</dt>
              <dd className="font-medium text-slate-900">{app.visaRule.visaType} Visa</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Destination</dt>
              <dd className="font-medium text-slate-900">{app.visaRule.toCountry.flag} {app.visaRule.toCountry.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Processing Time</dt>
              <dd className="font-medium text-slate-900">{app.visaRule.processingTime}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Total Amount</dt>
              <dd className="font-bold text-xl text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">{formatCurrency(app.totalAmount)}</dd>
            </div>
            <div className="flex justify-between pt-4 border-t border-purple-100">
              <dt className="text-slate-500">Submitted</dt>
              <dd className="font-medium text-slate-900">{formatDateTime(app.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="mx-8 p-6 bg-gradient-to-br from-purple-100/30 to-green-100/30 rounded-xl border border-purple-100 mb-8">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What happens next?
          </h3>
          <ul className="text-slate-700 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-purple-600 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
              <span>We will review your application and documents</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-purple-600 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
              <span>You will receive updates via email</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-6 h-6 bg-gradient-to-br from-purple-600 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              <span>Once approved, your e-visa will be sent to your email</span>
            </li>
          </ul>
        </div>

        {app.documents && app.documents.length > 0 && (
          <div className="mx-8 mb-8">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1-1m1 1l-1 1m-3-1a1 1 0 000 1h3m-6 0a1 1 0 100-1h3m-6 0a1 1 0 000-1h3" />
              </svg>
              Uploaded Documents & Photos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {app.documents.map((doc) => {
                const imageUrl = doc.filePath 
                  ? (doc.filePath.startsWith('/') ? doc.filePath : `/${doc.filePath}`)
                  : `/uploads/${app.applicationNumber}/${doc.fileName}`;
                const isImage = doc.mimeType?.startsWith('image/') || 
                  doc.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                return (
                  <div key={doc.id} className="group relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all">
                    {isImage ? (
                      <div className="relative aspect-square">
                        <img 
                          src={imageUrl}
                          alt={doc.originalName || doc.type}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent) parent.style.background = '#fee2e2';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <button 
                            onClick={() => window.open(imageUrl, '_blank')}
                            className="w-full py-2 px-3 bg-white/90 hover:bg-white text-purple-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors mb-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Full
                          </button>
                          <a 
                            href={imageUrl}
                            download={doc.originalName || doc.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center bg-red-50 p-4">
                        <svg className="w-10 h-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-red-400 font-medium">PDF</span>
                      </div>
                    )}
                    <div className="p-2 bg-white">
                      <p className="font-semibold text-slate-900 text-sm capitalize">{doc.type || 'Document'}</p>
                      <p className="text-xs text-slate-500 truncate">{doc.originalName || doc.fileName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-8 border-t border-purple-100 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={async () => {
              const res = await fetch(`/api/applications/${app.applicationNumber}/invoice`, { credentials: 'include' });
              if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice-${app.applicationNumber}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
              } else {
                alert('Failed to download invoice');
              }
            }}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice (PDF)
          </button>
          <Link href="/track" className="px-8 py-3 border border-purple-200 text-slate-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors text-center">
            Track Application
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage({ params }: { params: { appNumber: string } }) {
  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600">Loading...</p>
            </div>
          }>
            <ConfirmationContent appNumber={params.appNumber} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}