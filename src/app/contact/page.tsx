'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactMethods = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Us',
      value: 'sheikhshoaibahmed81@gmail.com',
      link: 'mailto:sheikhshoaibahmed81@gmail.com',
      gradient: 'from-purple-600 to-purple-700'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 016.112 6.112l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Call / WhatsApp',
      value: '+92 334 688 1820',
      link: 'tel:+923346881820',
      gradient: 'from-green-600 to-green-700'
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Visit Us',
      value: 'Office 26, 2nd floor, Mall-9, G-9 Markaz, Islamabad',
      link: 'https://maps.google.com/?q=Office+26+2nd+floor+mall-9+G-9+markaz+Islamabad',
      gradient: 'from-violet-600 to-fuchsia-600'
    }
  ];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Get in <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Touch</span>
            </h1>
            <p className="text-lg text-slate-600">We'd love to hear from you. Send us a message!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <a key={index} href={method.link} target="_blank" rel="noopener noreferrer" className={`relative bg-gradient-to-br ${method.gradient} rounded-2xl p-6 text-white overflow-hidden group block`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                  <p className="text-sm opacity-90">{method.value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-full blur-xl" />
            
            <div className="relative">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Send us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full relative group py-4 rounded-xl text-white font-semibold overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 group-hover:from-purple-500 group-hover:to-green-400 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 blur transition-all duration-300 group-hover:blur-lg opacity-30" />
                    <span className="relative">Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Business Hours</h3>
            <div className="flex flex-wrap justify-center gap-6 text-slate-600">
              <div className="bg-white rounded-xl px-6 py-3 border border-purple-100">
                <span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM PKT
              </div>
              <div className="bg-white rounded-xl px-6 py-3 border border-purple-100">
                <span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM PKT
              </div>
              <div className="bg-white rounded-xl px-6 py-3 border border-purple-100">
                <span className="font-semibold">Sunday:</span> Closed
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
