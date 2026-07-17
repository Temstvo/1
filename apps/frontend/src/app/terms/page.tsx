export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[hsl(222,14%,6%)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-[hsl(222,10%,70%)]">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>By accessing and using APPI VPN, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
            <p>APPI VPN provides a virtual private network service that enables secure, private internet access. We offer multiple protocols including WireGuard, OpenVPN, and Xray.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">3. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to use the service for any unlawful purpose.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">4. Subscription & Payments</h2>
            <p>Paid plans are billed in advance on a recurring basis. You may cancel your subscription at any time. Refunds are handled in accordance with applicable law.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">5. Privacy</h2>
            <p>We do not log, monitor, or store your browsing activity. Please refer to our Privacy Policy for detailed information about data handling.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">6. Limitation of Liability</h2>
            <p>APPI VPN is provided &quot;as is&quot; without warranties. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
