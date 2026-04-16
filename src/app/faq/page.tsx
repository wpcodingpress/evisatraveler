'use client';

import { useState } from 'react';

const faqs = [
  { q: 'How long does visa processing take?', a: 'Processing times vary by destination. Most tourist visas are processed within 3-5 business days. Some countries may take longer depending on their specific requirements.' },
  { q: 'What documents do I need?', a: 'Typically, you\'ll need a valid passport, recent passport-sized photo, and travel itinerary. Specific requirements vary by destination country.' },
  { q: 'Is my information secure?', a: 'Yes! We use 256-bit SSL encryption to protect your personal data. Your information is never shared with third parties.' },
  { q: 'Can I get a refund if my visa is denied?', a: 'Our refund policy varies by case. If the denial is due to our processing error, we offer a full refund. Contact our support team for specific situations.' },
  { q: 'How will I receive my visa?', a: 'Approved visas are sent to your email as a PDF document. You can print it or save it digitally on your phone.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers.' },
  { q: 'Can I apply for multiple people at once?', a: 'Yes! Our platform allows you to submit applications for multiple travelers in a single session.' },
  { q: 'What if I make a mistake on my application?', a: 'Contact our support team immediately. We can help correct errors before your application is processed.' },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-purple-900 via-slate-900 to-green-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-green-500/30 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-slate-300">Find answers to common questions about our visa services</p>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                    <svg className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openIndex === i && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-slate-600 mb-4">Still have questions?</p>
              <a href="/support" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                Contact Support
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}