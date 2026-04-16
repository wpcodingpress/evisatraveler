'use client';

import { useState } from 'react';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      question: 'How long does visa processing take?',
      answer: 'Processing times vary by destination. Most tourist visas are processed within 3-5 business days. Some may take longer depending on the country and season.'
    },
    {
      question: 'What documents do I need?',
      answer: 'Typically you need a valid passport, recent photo, and travel itinerary. Specific requirements vary by destination country.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes! We use bank-level encryption to protect your personal data. Your information is never shared with third parties.'
    },
    {
      question: 'Can I get a refund if my visa is denied?',
      answer: 'Refund policies vary by case. Please contact our support team for specific questions about your application.'
    },
    {
      question: 'How will I receive my visa?',
      answer: 'Approved visas are sent to your email address as a PDF document that you can print or save digitally.'
    }
  ];

  return (
    <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-violet-50/30 to-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Support <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text">Center</span>
            </h1>
            <p className="text-lg text-slate-600">We are here to help with any questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Email Us</h3>
                    <p className="text-violet-200">support@evisatraveler.com</p>
                  </div>
                </div>
                <p className="text-sm text-violet-200">We respond within 24 hours</p>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Call Us</h3>
                    <p className="text-purple-200">+1 (888) 123-4567</p>
                  </div>
                </div>
                <p className="text-sm text-purple-200">Mon-Fri: 9AM - 6PM EST</p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Send us a <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text">Message</span>
            </h2>
            {submitted ? (
              <div className="relative bg-white rounded-2xl shadow-xl p-12 border border-violet-100 text-center">
                <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl" />
                <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">We will get back to you within 24 hours.</p>
                </div>
              </div>
            ) : (
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-violet-100">
                <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-xl" />
                <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 rounded-full blur-xl" />
                <form onSubmit={handleSubmit} className="relative space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                    <textarea
                      className="w-full rounded-xl border border-violet-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-h-[150px] resize-none"
                      placeholder="Describe your issue or question..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full relative group py-4 rounded-xl text-white font-semibold overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 group-hover:from-violet-500 group-hover:to-purple-600 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                    <span className="relative">Send Message</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Frequently Asked <span className="text-transparent bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text">Questions</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-violet-100 p-6 hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center text-sm font-bold text-violet-600">
                      {index + 1}
                    </span>
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 pl-11">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
