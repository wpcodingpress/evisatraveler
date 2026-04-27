'use client';

import { useState } from 'react';
import Link from 'next/link';

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
            <a href="mailto:sheikhshoaibahmed81@gmail.com" className="relative bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 text-white overflow-hidden group block">
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
                    <p className="text-violet-200">sheikhshoaibahmed81@gmail.com</p>
                  </div>
                </div>
                <p className="text-sm text-violet-200">We respond within 24 hours</p>
              </div>
            </a>

            <div className="grid grid-rows-2 gap-4">
              <a href="tel:+923346881820" className="relative bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white overflow-hidden group flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 016.112 6.112l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Call Us</h3>
                  <p className="text-green-200 text-sm">+92 334 688 1820</p>
                </div>
              </a>
              <a href="https://wa.me/923346881820" target="_blank" rel="noopener noreferrer" className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white overflow-hidden group flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.197-.01-1.679-.415-2.816-.991-.792-.4-.833-1.959-.821-2.196l-.01-.214A2.194 2.194 0 0011.172 5.6c-.301.149-.601.297-.899.476-.149.074-.299.174-.429.273a.66.66 0 00.589.326c.273.074.547.099.82.049.298-.05.783-.497.884-.97.099-.473.199-.967.199-1.296a.582.582 0 00-.196-.392c-.149-.1-.417-.123-.598-.05l-1.106.297A11.14 11.14 0 016.06 4.728 12.14 12.14 0 002.197 4.73a12.04 12.04 0 001.95 4.132c.497.596 1.49.746 1.867.773.596.048 1.016.06 1.448.023.573-.05 1.678-.446 2.275-1.17l.896-.598c.223-.198.298-.298.4-.492a.67.67 0 00.199-.574c-.025-.197-.272-.596-.398-.796l-.6-.3c-.173-.124-.347-.149-.495-.049-.124.074-.523.174-.796.298zM12 22c2.757 0 5-2.243 5-5 0-2.757-2.243-5-5-5-2.757 0-5 2.243-5 5 0 2.757 2.243 5 5 5z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">WhatsApp</h3>
                  <p className="text-emerald-200 text-sm">+92 334 688 1820</p>
                </div>
              </a>
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

      {/* PromoBranding Section */}
      <section className="pb-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400">
                eVisa Traveler
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Experience the future of visa applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { num: '01', title: 'Apply in Minutes', desc: 'Complete your entire visa application in just 5 minutes from anywhere' },
              { num: '02', title: 'Zero Errors', desc: 'Our smart validation ensures your application is error-free' },
              { num: '03', title: 'Instant Updates', desc: 'Get real-time notifications on your visa status via SMS & email' },
              { num: '04', title: 'PDF Delivered', desc: 'Your approved visa PDF sent directly to your inbox' },
            ].map((feature, i) => (
              <div key={i} className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-white/10 hover:border-violet-500/30 transition-all duration-500">
                <div className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent opacity-50 mb-4">
                  {feature.num}
                </div>
                <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  {i === 0 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  {i === 1 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  {i === 2 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17l5 5-5 5m0-5l-5 5-5-5m5 0V7" /></svg>}
                  {i === 3 && <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-medium">98% Success Rate</span>
              </div>
              <div className="w-px h-5 bg-white/20" />
              <div className="text-slate-300">Trusted by 50,000+ Travelers</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
