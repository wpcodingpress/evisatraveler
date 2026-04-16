export default function CareersPage() {
  const benefits = [
    { icon: '🏥', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
    { icon: '🎓', title: 'Learning & Development', description: 'Annual budget for courses, conferences, and certifications' },
    { icon: '🏖️', title: 'Unlimited PTO', description: 'Take time off when you need it, we trust you' },
    { icon: '🌍', title: 'Remote-First', description: 'Work from anywhere in the world' },
    { icon: '💰', title: 'Competitive Pay', description: 'Market-leading salaries with equity options' },
    { icon: '🤝', title: 'Team Retreats', description: 'Annual company retreats to connect and celebrate' },
  ];

  const openPositions = [
    { title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Backend Developer', department: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Product Manager', department: 'Product', location: 'New York, NY', type: 'Full-time' },
    { title: 'Customer Success Manager', department: 'Operations', location: 'Remote', type: 'Full-time' },
    { title: 'Marketing Specialist', department: 'Marketing', location: 'Remote', type: 'Part-time' },
  ];

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Join Our <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Team</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Help us revolutionize the visa application process. We're looking for talented individuals who are passionate about travel and technology.
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-purple-600 to-green-600 rounded-3xl p-8 md:p-12 text-white mb-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Work With Us?</h2>
              <p className="text-purple-100 mb-8 max-w-xl">
                We're building the future of travel, one visa at a time. Join a team that's passionate about making international travel accessible to everyone.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <span className="text-2xl mb-2 block">{benefit.icon}</span>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-purple-100">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
              Open <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Positions</span>
            </h2>
            <div className="space-y-4">
              {openPositions.map((position, index) => (
                <div key={index} className="relative bg-white rounded-2xl p-6 border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden group">
                  <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-green-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">{position.department}</span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">{position.location}</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{position.type}</span>
                      </div>
                    </div>
                    <button className="relative group/btn px-6 py-2.5 rounded-xl text-white font-semibold overflow-hidden whitespace-nowrap">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-green-500 group-hover/btn:from-purple-500 group-hover/btn:to-green-400 transition-all duration-300" />
                      <span className="relative">Apply Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-purple-100 text-center">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Don't See Your Role?</h2>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
              </p>
              <a href="mailto:careers@evisatraveler.com" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send General Application
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
