export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[hsl(222,14%,6%)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-[hsl(222,10%,70%)]">
          <section>
            <h2 className="text-xl font-semibold text-white">1. No-Log Policy</h2>
            <p>APPI VPN operates a strict no-log policy. We do not collect, store, or monitor your browsing history, DNS queries, traffic data, or connection timestamps.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
            <p>We only collect information necessary to provide the service: your email address (for account creation), payment information (processed by third-party providers), and basic account settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">3. How We Use Your Information</h2>
            <p>Your email is used for account authentication and service communications. We never sell, share, or distribute your personal information to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">4. Data Storage</h2>
            <p>All user data is stored on secure, encrypted servers. We use industry-standard encryption protocols to protect your information at rest and in transit.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">5. Third-Party Services</h2>
            <p>We use third-party payment processors for subscription billing. These providers have their own privacy policies governing the use of your payment information.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
            <p>You have the right to access, modify, or delete your personal data at any time. Contact support to exercise these rights.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
            <p>For privacy-related inquiries, contact us at support@appivpn.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
