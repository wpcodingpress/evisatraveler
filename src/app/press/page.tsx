export default function PressPage() {
  const pressReleases = [
    {
      title: 'eVisaTraveler Expands to 50+ Countries',
      date: 'January 10, 2026',
      excerpt: 'We are thrilled to announce our expansion to over 50 countries, making international travel more accessible than ever.'
    },
    {
      title: 'New AI-Powered Application Review System',
      date: 'December 15, 2025',
      excerpt: 'Introducing our revolutionary AI system that reviews applications in seconds, reducing errors and speeding up processing.'
    },
    {
      title: 'Partnership with Global Tourism Board',
      date: 'November 20, 2025',
      excerpt: 'Strategic partnership announced to promote seamless travel experiences for millions of travelers worldwide.'
    },
  ];

  const mediaMentions = [
    { outlet: 'TechCrunch', date: 'January 5, 2026', headline: 'eVisaTraveler Raises $50M to Simplify Global Travel' },
    { outlet: 'Forbes', date: 'December 20, 2025', headline: 'Top 10 Startups to Watch in Travel Technology' },
    { outlet: 'The Wall Street Journal', date: 'November 15, 2025', headline: 'How Digital Visas Are Changing International Travel' },
    { outlet: 'Bloomberg', date: 'October 25, 2025', headline: 'The Future of Travel Documentation' },
  ];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Press <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">& Media</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Discover the latest news, press releases, and media resources from eVisaTraveler.
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-purple-600 to-green-600 rounded-3xl p-8 md:p-12 text-white mb-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative max-w-xl">
              <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">Press Contact</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Media Inquiries</h2>
              <p className="text-purple-100 mb-6">
                For press inquiries, interview requests, or media kit information, please contact our communications team.
              </p>
              <a href="mailto:press@evisatraveler.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                press@evisatraveler.com
              </a>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Press <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Releases</span>
            </h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index} className="relative bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden group">
                  <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-green-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <span className="text-sm text-slate-500">{release.date}</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2 mb-3">{release.title}</h3>
                    <p className="text-slate-600 mb-4">{release.excerpt}</p>
                    <a href="#" className="inline-flex items-center gap-2 text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-semibold text-sm hover:opacity-80 transition-opacity">
                      Read Full Release
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Media <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Coverage</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mediaMentions.map((mention, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-green-100 rounded-xl flex items-center justify-center text-lg font-bold text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">
                      {mention.outlet[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">{mention.outlet}</span>
                      <p className="text-sm text-slate-500">{mention.date}</p>
                    </div>
                  </div>
                  <p className="text-slate-700 font-medium">{mention.headline}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Brand <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Assets</span>
            </h2>
            <div className="bg-white rounded-2xl p-8 border border-purple-100 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-green-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-3xl font-bold">E</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">eVisaTraveler Logo Pack</h3>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                Download our official logo, brand guidelines, and press kit for authorized use.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                Download Media Kit
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
