export default function RefundPage() {
  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Refund <span className="text-transparent bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text">Policy</span>
            </h1>
            <p className="text-slate-600">Last updated: January 2026</p>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100 mb-8">
            <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-green-500/20 rounded-full blur-xl" />
            
            <div className="relative space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Our Refund Policy</h2>
                <p className="text-slate-600 leading-relaxed">
                  At eVisaTraveler, we strive to provide excellent service. However, we understand that circumstances may arise where you need to request a refund. Please read our policy carefully.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Refund Eligibility</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-2">Full Refund (Before Processing)</h3>
                    <p className="text-slate-600 text-sm">
                      You are eligible for a full refund if your application has not yet been submitted to the embassy or consulate. This includes our service fee and government fees.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <h3 className="font-semibold text-purple-800 mb-2">Partial Refund (During Processing)</h3>
                    <p className="text-slate-600 text-sm">
                      If processing has begun but not yet submitted, you may receive a partial refund excluding our service fee and any costs incurred.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <h3 className="font-semibold text-yellow-800 mb-2">Government Fees</h3>
                    <p className="text-slate-600 text-sm">
                      Government fees are generally non-refundable once submitted. These fees are collected by the embassy/consulate and are not controlled by eVisaTraveler.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Non-Refundable Scenarios</h2>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Applications already submitted to the embassy/consulate</li>
                  <li>Service fees for completed applications</li>
                  <li>Expedited processing fees (once processing has begun)</li>
                  <li>Cancellation after visa approval</li>
                  <li>Applications rejected due to incomplete or incorrect information provided by the user</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Visa Denial Refunds</h2>
                <p className="text-slate-600 leading-relaxed">
                  If your visa is denied by the embassy/consulate, our service fees are non-refundable as we have completed the processing service. However, we will assist you with reapplication if needed at a discounted rate.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">How to Request a Refund</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  To request a refund, please contact our support team with:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2">
                  <li>Your application reference number</li>
                  <li>Reason for the refund request</li>
                  <li>Supporting documentation (if applicable)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Refund Timeline</h2>
                <p className="text-slate-600 leading-relaxed">
                  Approved refunds are typically processed within 5-10 business days. The refund will be credited to your original payment method. Please note that your bank or card issuer may take additional time to process the refund.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions about our refund policy, please contact us at support@evisatraveler.com or call +1 (888) 123-4567.
                </p>
              </section>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-600 mb-4">Need help with your application?</p>
            <a href="/support" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
