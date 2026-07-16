import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="APPI VPN" className="w-8 h-8" />
            <span className="font-bold text-lg">APPI VPN</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#servers" className="hover:text-white transition-colors">Servers</a>
            <a href="#download" className="hover:text-white transition-colors">Download</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/checkout" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors">
              Get Key
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Fast and Secure<br />
            <span className="text-purple-400">VPN Application</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Stable servers, 24/7 uptime without limits. Set up in a minute with the modern VLESS protocol
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/checkout" className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              Get Key
            </Link>
            <Link href="/register" className="px-8 py-3.5 border border-white/10 rounded-xl font-semibold text-sm text-gray-300 hover:bg-white/5 transition-all">
              Try Free
            </Link>
          </div>
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold">10M+</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-gray-500">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose APPI VPN?</h2>
          <p className="text-gray-400 text-center mb-12">Cutting-edge technologies for maximum performance and security</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'High Speed', desc: 'Optimized engine with VLESS protocol for maximum connection speed without quality loss' },
              { icon: '📱', title: 'Native Apps', desc: 'Native apps for Windows, macOS, iOS, Android and Linux with a single intuitive interface' },
              { icon: '∞', title: 'Unlimited Traffic', desc: 'No traffic or bandwidth limits for comfortable use 24/7' },
              { icon: '🔒', title: 'VLESS Protocol', desc: 'Modern next-gen VLESS protocol for maximum security and performance' },
              { icon: '🌍', title: 'Servers Worldwide', desc: 'High-speed servers in over 50 countries for stable connections' },
              { icon: '🛡️', title: 'Full Privacy', desc: 'Strict no-logs policy and military-grade encryption protect your data' },
            ].map((f, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servers */}
      <section id="servers" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Servers Worldwide</h2>
          <p className="text-gray-400 text-center mb-12">High-speed servers in key locations for optimal connectivity</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { flag: '🇺🇸', name: 'USA', cities: 'New York, Los Angeles', ping: '15ms', speed: '25 Gbps', uptime: '99.9%' },
              { flag: '🇬🇧', name: 'UK', cities: 'London, Manchester', ping: '12ms', speed: '25 Gbps', uptime: '99.8%' },
              { flag: '🇩🇪', name: 'Germany', cities: 'Frankfurt, Berlin', ping: '8ms', speed: '25 Gbps', uptime: '99.9%' },
              { flag: '🇯🇵', name: 'Japan', cities: 'Tokyo, Osaka', ping: '25ms', speed: '25 Gbps', uptime: '99.7%' },
              { flag: '🇸🇬', name: 'Singapore', cities: 'Singapore', ping: '18ms', speed: '25 Gbps', uptime: '99.9%' },
              { flag: '🇨🇦', name: 'Canada', cities: 'Toronto, Vancouver', ping: '20ms', speed: '25 Gbps', uptime: '99.8%' },
            ].map((s, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{s.flag}</span>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-gray-500">{s.cities}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-gray-500">Ping</div>
                    <div className="font-medium text-green-400">{s.ping}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-gray-500">Speed</div>
                    <div className="font-medium">{s.speed}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-gray-500">Uptime</div>
                    <div className="font-medium">{s.uptime}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Download APPI VPN</h2>
          <p className="text-gray-400 text-center mb-12">Choose your platform and start using it right now</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { icon: '🖥️', name: 'Windows', note: 'Windows 10/11 (x64)', href: '#', primary: true },
              { icon: '🍎', name: 'macOS', note: 'macOS 11+ (Intel/M1)', href: '#', primary: true },
              { icon: '📱', name: 'iOS', note: 'iOS 14+ (iPhone/iPad)', href: '#', primary: true },
              { icon: '🤖', name: 'Android', note: 'Android 8+ (ARM/x86)', href: '#', primary: true },
              { icon: '🐧', name: 'Linux', note: 'Ubuntu, Debian, CentOS', href: '#', primary: true },
            ].map((p, i) => (
              <a key={i} href={p.href} className="bg-[#141414] border border-white/5 rounded-2xl p-5 text-center hover:border-purple-500/20 transition-colors group">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{p.note}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                  Download
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What is the VLESS protocol and how is it better?', a: 'VLESS is a modern next-gen protocol that provides maximum speed and security. It uses minimal resources, has low latency and high resistance to blocking.' },
              { q: 'Are there any traffic limits?', a: 'No, APPI VPN provides completely unlimited traffic. You can use as much data as you need without any speed or volume restrictions.' },
              { q: 'Which devices does APPI VPN support?', a: 'APPI VPN supports all popular platforms: Windows, macOS, iOS, Android and Linux. All apps have a native interface optimized for each platform.' },
              { q: 'How secure is APPI VPN?', a: 'We use cutting-edge encryption, modern security protocols and do not log your activity. Your data is fully protected and never stored on our servers.' },
              { q: 'What is the connection speed?', a: 'Thanks to the VLESS protocol and optimized infrastructure, APPI VPN provides speeds up to 25 Gbps on our servers. Actual speed depends on your internet connection and chosen server.' },
            ].map((faq, i) => (
              <details key={i} className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Join millions of users who already chose APPI VPN for fast and secure internet</p>
          <Link href="/checkout" className="inline-flex px-10 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
            Get Key
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.svg" alt="APPI VPN" className="w-7 h-7" />
              <span className="font-bold">APPI VPN</span>
            </div>
            <p className="text-sm text-gray-500">Fast and secure proxy service</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#features" className="block hover:text-white transition-colors">Features</a>
                <a href="#servers" className="block hover:text-white transition-colors">Servers</a>
                <a href="#download" className="block hover:text-white transition-colors">Downloads</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/login" className="block hover:text-white transition-colors">Sign In</Link>
                <Link href="/checkout" className="block hover:text-white transition-colors">Get Key</Link>
                <Link href="/register" className="block hover:text-white transition-colors">Register</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
          © 2026 APPI VPN. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
