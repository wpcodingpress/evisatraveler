export default function CookiesPage() {
  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Cookie <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Policy</span>
            </h1>
            <p className="text-slate-600">Last updated: January 2026</p>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            
            <div className="relative space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">What Are Cookies?</h2>
                <p className="text-slate-600 leading-relaxed">
                  Cookies are small text files that are stored on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">How We Use Cookies</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  eVisaTraveler uses cookies for the following purposes:
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-slate-900 mb-2">Essential Cookies</h3>
                    <p className="text-slate-600 text-sm">
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, session management, and accessibility.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <h3 className="font-semibold text-slate-900 mb-2">Performance Cookies</h3>
                    <p className="text-slate-600 text-sm">
                      These cookies help us understand how visitors interact with our website by collecting anonymous information about page visits, time spent on pages, and error messages.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-slate-900 mb-2">Functionality Cookies</h3>
                    <p className="text-slate-600 text-sm">
                      These cookies allow the website to remember your preferences and provide enhanced, personalized features such as language preferences and location settings.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Third-Party Cookies</h2>
                <p className="text-slate-600 leading-relaxed">
                  Some cookies on our website are set by third-party services we use, including payment processors, analytics providers, and social media platforms. These third parties may collect information about your browsing activities across different websites.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Managing Cookies</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.
                </p>
                <p className="text-slate-600 leading-relaxed mb-4">
                  To manage cookie settings:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Privacy & services → Cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Impact of Disabling Cookies</h2>
                <p className="text-slate-600 leading-relaxed">
                  If you choose to disable cookies, please note that some features of our website may not function properly. You may experience reduced functionality, and some services may not be available.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Updates to This Policy</h2>
                <p className="text-slate-600 leading-relaxed">
                  We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions about our use of cookies, please contact us at support@evisatraveler.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
