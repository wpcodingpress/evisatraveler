export default function GuidesPage() {
  const guides = [
    {
      country: 'Thailand',
      flag: '🇹🇭',
      visaTypes: ['Tourist Visa', 'Business Visa', 'Transit Visa'],
      processingTime: '3-5 Business Days',
      image: 'bangkok'
    },
    {
      country: 'Japan',
      flag: '🇯🇵',
      visaTypes: ['Tourist Visa', 'Business Visa', 'Student Visa'],
      processingTime: '5-7 Business Days',
      image: 'tokyo'
    },
    {
      country: 'Turkey',
      flag: '🇹🇷',
      visaTypes: ['Tourist Visa', 'Business Visa', 'Work Visa'],
      processingTime: '1-3 Business Days',
      image: 'istanbul'
    },
    {
      country: 'United Arab Emirates',
      flag: '🇦🇪',
      visaTypes: ['Tourist Visa', 'Business Visa', 'Transit Visa'],
      processingTime: '24-48 Hours',
      image: 'dubai'
    },
    {
      country: 'Vietnam',
      flag: '🇻🇳',
      visaTypes: ['E-Visa', 'Tourist Visa', 'Business Visa'],
      processingTime: '2-3 Business Days',
      image: 'hanoi'
    },
    {
      country: 'India',
      flag: '🇮🇳',
      visaTypes: ['Tourist Visa', 'Business Visa', 'Medical Visa'],
      processingTime: '3-5 Business Days',
      image: 'mumbai'
    },
  ];

  const categories = [
    { name: 'Passport Requirements', icon: '📘', count: 12 },
    { name: 'Application Process', icon: '📝', count: 8 },
    { name: 'Required Documents', icon: '📄', count: 15 },
    { name: 'Interview Tips', icon: '💡', count: 6 },
    { name: 'Photo Requirements', icon: '📷', count: 4 },
    { name: 'Fees & Payments', icon: '💳', count: 5 },
  ];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Travel <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Guides</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive guides to help you navigate the visa application process for destinations worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-purple-100 hover:shadow-lg hover:border-purple-200 transition-all text-center cursor-pointer">
                <span className="text-3xl mb-2 block">{category.icon}</span>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{category.name}</h3>
                <span className="text-xs text-slate-500">{category.count} guides</span>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Popular <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Destinations</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <div key={index} className="group bg-white rounded-2xl border border-purple-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300">
                  <div className="h-32 bg-gradient-to-br from-purple-100 to-green-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-green-500/20" />
                    <span className="text-6xl relative z-10">{guide.flag}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{guide.country}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Visa Types:</span> {guide.visaTypes.join(', ')}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Processing:</span> {guide.processingTime}
                      </p>
                    </div>
                    <a href={`/visa/US-to-${guide.country.substring(0, 2).toUpperCase()}`} className="inline-flex items-center gap-2 text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-semibold text-sm hover:opacity-80 transition-opacity">
                      View Guide
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-purple-600 to-green-600 rounded-2xl p-8 text-white mb-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Can not find your destination?</h2>
              <p className="text-purple-100 mb-6 max-w-lg">
                We are constantly adding new destinations. Contact our support team and we will help you with your visa needs.
              </p>
              <a href="/support" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
              Essential <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Resources</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">📋</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Passport Validity Requirements</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Most countries require your passport to be valid for at least 6 months beyond your planned stay.
                    </p>
                    <a href="#" className="text-sm text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-medium hover:opacity-80 transition-opacity">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">📷</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Photo Requirements Guide</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Get the right photo specifications for your visa application to avoid delays.
                    </p>
                    <a href="#" className="text-sm text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-medium hover:opacity-80 transition-opacity">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">✈️</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Travel Insurance Requirements</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Many countries now require proof of travel insurance with your visa application.
                    </p>
                    <a href="#" className="text-sm text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-medium hover:opacity-80 transition-opacity">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">⏰</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Application Timing Tips</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      When to apply for your visa to ensure timely processing and avoid last-minute stress.
                    </p>
                    <a href="#" className="text-sm text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-medium hover:opacity-80 transition-opacity">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
