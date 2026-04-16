export const metadata = { title: 'Privacy Policy | eVisaTraveler' };

export default function PrivacyPage() {
  return (
    <main className="flex-1 py-12 md:py-20 bg-slate-50">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-xl p-8 space-y-6 text-slate-600">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect personal information including name, email, passport details, and travel information necessary for visa processing.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process your visa applications</li>
              <li>Communicate with you about your application</li>
              <li>Improve our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Data Security</h2>
            <p>We use industry-standard encryption and security measures to protect your personal data. All data is encrypted in transit and at rest.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Information Sharing</h2>
            <p>We only share your information with relevant authorities as required for visa processing. We never sell your data to third parties.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, and delete your personal information. Contact us to exercise these rights.</p>
          </section>
          
          <p className="text-sm text-slate-400 pt-4">Last updated: January 2026</p>
        </div>
      </div>
    </main>
  );
}