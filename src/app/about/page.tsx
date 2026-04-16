export default function AboutPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-purple-900 via-slate-900 to-green-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-green-500/30 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">About eVisaTraveler</h1>
            <p className="text-xl text-slate-300">Building the future of visa applications since 2020</p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Democratizing Global Travel</h2>
              <p className="text-lg text-slate-600 mb-6">At eVisaTraveler, we believe everyone deserves the opportunity to explore the world. Our mission is to make visa applications accessible, fast, and hassle-free for travelers everywhere.</p>
              <p className="text-slate-600">Founded in 2020, we've helped over 500,000 travelers from around the world obtain their visas quickly and efficiently. Our team of experts combines technology with deep knowledge of immigration processes to deliver exceptional results.</p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-green-600 rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">500K+</div>
                    <div className="text-purple-200">Happy Travelers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">150+</div>
                    <div className="text-purple-200">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">99.9%</div>
                    <div className="text-purple-200">Approval Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-purple-200">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">What We Stand For</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: '🎯', title: 'Customer First', desc: 'Every decision we make starts with our customers\' needs' },
              { icon: '🔒', title: 'Trust & Security', desc: 'Bank-level encryption protects your sensitive data' },
              { icon: '⚡', title: 'Innovation', desc: 'Continuously improving our platform with cutting-edge tech' },
              { icon: '🌍', title: 'Global Reach', desc: 'Serving travelers from every corner of the world' },
              { icon: '💯', title: 'Excellence', desc: 'Setting the highest standards in visa services' },
              { icon: '🤝', title: 'Partnership', desc: 'Building lasting relationships with our clients' },
            ].map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center border border-slate-100 hover:border-purple-200 transition-all hover:-translate-y-1">
                <div className="text-5xl mb-4">{v.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Meet the Leaders</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Ahmed Al-Rashid', role: 'CEO & Founder', emoji: '👨‍💼' },
              { name: 'Sarah Chen', role: 'Chief Technology Officer', emoji: '👩‍💻' },
              { name: 'Michael Brown', role: 'Head of Operations', emoji: '👨‍💼' },
            ].map((t, i) => (
              <div key={i} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center text-6xl">{t.emoji}</div>
                <h3 className="text-xl font-bold text-slate-900">{t.name}</h3>
                <p className="text-slate-600">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}