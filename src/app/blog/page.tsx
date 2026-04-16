export default function BlogPage() {
  const articles = [
    {
      title: '10 Essential Tips for First-Time International Travelers',
      excerpt: 'Planning your first trip abroad? Here are the essential tips you need to know before boarding that plane...',
      category: 'Travel Tips',
      date: 'January 15, 2026',
      readTime: '5 min read',
      image: '✈️'
    },
    {
      title: 'Understanding Visa Types: A Complete Guide',
      excerpt: 'Tourist, business, student, or work visa - learn the differences and which one you need for your trip...',
      category: 'Visa Guide',
      date: 'January 12, 2026',
      readTime: '8 min read',
      image: '📋'
    },
    {
      title: 'Top 5 Visa-Free Destinations for US Citizens',
      excerpt: 'Great news for American travelers! Here are the countries you can visit without a visa...',
      category: 'Destinations',
      date: 'January 10, 2026',
      readTime: '4 min read',
      image: '🌍'
    },
    {
      title: 'How to Prepare Your Passport for International Travel',
      excerpt: 'Ensure your passport is valid and ready for your overseas adventure with these expert tips...',
      category: 'Travel Tips',
      date: 'January 8, 2026',
      readTime: '6 min read',
      image: '🛂'
    },
    {
      title: 'The Future of E-Visas: Trends to Watch in 2026',
      excerpt: 'Digital travel documents are revolutionizing how we cross borders. Here is what is changing...',
      category: 'Industry News',
      date: 'January 5, 2026',
      readTime: '7 min read',
      image: '💻'
    },
    {
      title: 'Common Visa Application Mistakes and How to Avoid Them',
      excerpt: 'Don not let these common errors derail your travel plans. Learn how to submit a perfect application...',
      category: 'Visa Guide',
      date: 'January 3, 2026',
      readTime: '5 min read',
      image: '⚠️'
    },
  ];

  const categories = ['All', 'Travel Tips', 'Visa Guide', 'Destinations', 'Industry News'];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Travel <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Blog</span>
            </h1>
            <p className="text-lg text-slate-600">
              Expert insights, travel tips, and the latest visa news
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-purple-600 to-green-500 text-white'
                    : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <article key={index} className="group bg-white rounded-2xl border border-purple-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{article.image}</span>
                    <div>
                      <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium mb-1">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{article.date}</span>
                        <span>•</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-green-500 group-hover:bg-clip-text transition-all">
                    {article.title}
                  </h2>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <a href="#" className="inline-flex items-center gap-2 text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text font-semibold hover:opacity-80 transition-opacity">
                    Read More
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="px-8 py-3 bg-white border border-purple-100 text-slate-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
              Load More Articles
            </button>
          </div>

          <div className="mt-16 relative bg-gradient-to-br from-purple-600 to-green-600 rounded-2xl p-8 text-white text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-purple-100 mb-6 max-w-lg mx-auto">
                Get the latest travel tips, visa updates, and exclusive deals delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
