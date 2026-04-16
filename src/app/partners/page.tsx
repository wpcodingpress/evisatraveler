export default function PartnersPage() {
  const partners = [
    { name: 'IATA', description: 'International Air Transport Association', logo: '✈️' },
    { name: 'UNWTO', description: 'World Tourism Organization', logo: '🌍' },
    { name: 'WTTC', description: 'World Travel & Tourism Council', logo: '🏨' },
    { name: 'ATA', description: 'American Tourism Association', logo: '🇺🇸' },
    { name: 'ETAA', description: 'European Travel Agents Association', logo: '🇪🇺' },
    { name: 'PATA', description: 'Pacific Asia Travel Association', logo: '🌏' },
  ];

  const benefits = [
    {
      title: 'Increased Revenue',
      description: 'Access new customer segments and increase your booking volume through our extensive network.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Seamless Integration',
      description: 'Our API and widgets integrate easily with your existing systems and booking platforms.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      title: 'Dedicated Support',
      description: 'Get a dedicated account manager and 24/7 support for all your partnership needs.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: 'Competitive Rates',
      description: 'Enjoy exclusive partner pricing and commission structures tailored to your business.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Partners</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Collaborating with leading organizations to deliver seamless travel experiences worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {partners.map((partner, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 text-center group">
                <div className="text-5xl mb-4">{partner.logo}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-slate-600">{partner.description}</p>
              </div>
            ))}
          </div>

          <div className="relative bg-gradient-to-br from-purple-600 to-green-600 rounded-3xl p-8 md:p-12 text-white mb-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative text-center max-w-xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Become a Partner</h2>
              <p className="text-purple-100 mb-8">
                Join our growing network of travel agencies, tour operators, and technology partners.
              </p>
              <a href="mailto:partners@evisatraveler.com" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Partner With Us
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Partnership <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Benefits</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-purple-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-green-100 rounded-xl flex items-center justify-center text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 bg-white rounded-2xl p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Partner Types</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl">🛫</div>
                <h3 className="font-bold text-slate-900 mb-2">Travel Agencies</h3>
                <p className="text-sm text-slate-600">Add visa services to your offerings</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">💻</div>
                <h3 className="font-bold text-slate-900 mb-2">Tech Partners</h3>
                <p className="text-sm text-slate-600">API and integration solutions</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">🏢</div>
                <h3 className="font-bold text-slate-900 mb-2">Corporate Partners</h3>
                <p className="text-sm text-slate-600">Employee travel solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
