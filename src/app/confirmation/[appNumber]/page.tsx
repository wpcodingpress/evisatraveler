import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Props {
  params: Promise<{ appNumber: string }>;
}

async function getApplication(appNumber: string) {
  const app = await prisma.application.findUnique({
    where: { applicationNumber: appNumber },
    include: {
      visaRule: {
        include: { toCountry: true, fromCountry: true },
      },
    },
  });
  return app;
}

export async function generateMetadata({ params }: Props) {
  const { appNumber } = await params;
  const app = await getApplication(appNumber);
  if (!app) return { title: 'Application Not Found' };
  return {
    title: `Application ${app.applicationNumber} | E-Visa Traveler`,
    description: `Your visa application status: ${app.status}`,
  };
}

export default async function ConfirmationPage({ params }: Props) {
  const { appNumber } = await params;
  const app = await getApplication(appNumber);

  if (!app) return notFound();

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
            <div className="absolute -top-3 -left-3 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="p-8 text-center border-b border-purple-100 bg-gradient-to-b from-purple-50/30 to-transparent">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-green-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
                <p className="text-slate-600">Your visa application has been successfully submitted for processing.</p>
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
        </div>
      </div>
    </main>
  );
}
