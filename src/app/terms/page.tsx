export default function TermsPage() {
  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Terms of <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Service</span>
            </h1>
            <p className="text-slate-600">Last updated: January 2026</p>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            
            <div className="relative space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  By accessing and using eVisaTraveler's services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">2. Service Description</h2>
                <p className="text-slate-600 leading-relaxed">
                  eVisaTraveler provides an online platform for processing visa applications on behalf of users. We act as an intermediary between users and relevant embassies/consulates. Our service includes application review, document preparation, and submission assistance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Responsibilities</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  As a user of our services, you agree to:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Provide accurate and complete information for your visa application</li>
                  <li>Submit genuine and valid documents</li>
                  <li>Pay all applicable fees in a timely manner</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not use our services for any illegal purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">4. Processing and Timelines</h2>
                <p className="text-slate-600 leading-relaxed">
                  While we make every effort to process applications within the stated timeframe, processing times are estimates and may vary based on embassy/consulate processing times, application complexity, and external factors. eVisaTraveler is not responsible for delays caused by third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">5. Fees and Refunds</h2>
                <p className="text-slate-600 leading-relaxed">
                  All fees are clearly displayed before submission. Service fees are non-refundable once processing has begun. Government fees may be refundable depending on the specific country's visa policy. Please refer to our Refund Policy for detailed information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
                <p className="text-slate-600 leading-relaxed">
                  eVisaTraveler shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from your use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">7. Privacy and Data Protection</h2>
                <p className="text-slate-600 leading-relaxed">
                  We collect and process personal information in accordance with our Privacy Policy. By using our services, you consent to such processing. We implement industry-standard security measures to protect your data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">8. Modifications to Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the modified terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">9. Governing Law</h2>
                <p className="text-slate-600 leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">10. Contact Information</h2>
                <p className="text-slate-600 leading-relaxed">
                  For any questions regarding these Terms of Service, please contact us at support@evisatraveler.com or call +1 (888) 123-4567.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
