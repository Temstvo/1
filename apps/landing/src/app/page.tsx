export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600" />
          <span className="text-2xl font-bold text-white">APPI VPN</span>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="text-white hover:text-blue-300">Login</a>
          <a href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">Get Started</a>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white">
            Private Internet.<br />Without Limits.
          </h1>
          <p className="mt-6 text-xl text-blue-200">
            Fast, secure VPN with WireGuard, OpenVPN, Xray Reality.<br />
            Protect your privacy today.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="/register" className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-500">
              Start Free Trial
            </a>
            <a href="#pricing" className="rounded-lg border border-white/30 px-8 py-3 text-lg font-semibold text-white hover:bg-white/10">
              View Plans
            </a>
          </div>
        </div>

        <div className="mt-32 grid gap-8 md:grid-cols-3">
          {[
            { title: 'WireGuard', desc: 'Ultra-fast protocol with modern cryptography' },
            { title: 'OpenVPN', desc: 'Battle-tested, works everywhere' },
            { title: 'Xray Reality', desc: 'Undetectable, bypasses any firewall' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white/10 p-8 backdrop-blur">
              <h3 className="text-xl font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-blue-200">{f.desc}</p>
            </div>
          ))}
        </div>

        <div id="pricing" className="mt-32 text-center">
          <h2 className="text-4xl font-bold text-white">Simple Pricing</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { name: 'Basic', price: '$4.99', features: ['3 devices', '5 countries', 'WireGuard'] },
              { name: 'Pro', price: '$9.99', features: ['10 devices', 'All countries', 'All protocols', 'Priority support'], popular: true },
              { name: 'Premium', price: '$14.99', features: ['Unlimited devices', 'All countries', 'All protocols', 'Dedicated IP', '24/7 support'] },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.popular ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-white/10'}`}>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-4xl font-bold text-white">{plan.price}<span className="text-lg">/mo</span></p>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-blue-100">✓ {f}</li>
                  ))}
                </ul>
                <a href="/register" className="mt-8 block rounded-lg bg-white px-6 py-3 text-center font-semibold text-blue-600 hover:bg-blue-50">
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-32 border-t border-white/10 py-8 text-center text-blue-300">
          <p>© 2026 APPI VPN. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
