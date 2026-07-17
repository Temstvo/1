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
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg>, name: 'Windows', note: 'Windows 10/11 (x64)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>, name: 'macOS', note: 'macOS 11+ (Intel/M1)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>, name: 'iOS', note: 'iOS 14+ (iPhone/iPad)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" /></svg>, name: 'Android', note: 'Android 8+ (ARM/x86)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.368 1.884 1.368.854 0 1.549-.675 1.549-1.504 0-.401-.136-.77-.36-1.07-.135-.2-.09-.47.09-.803.18-.335.22-.67.09-.937-.134-.267-.405-.4-.814-.536-.406-.134-.94-.2-1.346-.067-.404.134-.713.467-.875.866-.134.336-.09.67.135.87.224.199.533.268.81.134.279-.134.49-.4.53-.735.043-.399-.078-.804-.36-1.072-.279-.268-.654-.334-1.015-.267-.36.067-.7.267-.875.535-.177.268-.267.6-.178.868.09.267.314.401.59.401.223 0 .405-.134.574-.268.169-.133.36-.2.535-.133.177.066.267.267.178.467-.179.399-.532.668-.937.668-.527 0-1.015-.267-1.348-.667-.331-.4-.526-.936-.464-1.471.063-.536.332-1.004.714-1.338.382-.333.86-.534 1.35-.534.49 0 .873.134 1.148.467.274.334.359.803.225 1.204-.067.2-.135.334-.224.468-.09.133-.135.333-.044.467.089.133.268.2.49.134.224-.067.405-.2.535-.334.134-.134.224-.334.224-.534 0-.2-.045-.4-.135-.534-.09-.134-.224-.267-.404-.334-.179-.066-.404-.067-.63-.003-.224.064-.404.2-.535.334-.13.134-.22.334-.22.534 0 .134.045.267.135.334.089.066.224.134.404.067.179-.067.314-.268.314-.468 0-.2-.09-.404-.225-.534-.134-.134-.314-.2-.535-.2-.224 0-.405.066-.535.2-.13.13-.22.33-.22.534 0 .133.045.267.135.334.089.066.224.134.404.067.179-.067.314-.268.314-.468 0-.332-.09-.602-.225-.804-.134-.201-.314-.334-.535-.334-.314 0-.574.2-.754.467-.179.268-.268.602-.268.937 0 .334.09.602.268.803.18.2.4.334.754.334.314 0 .574-.134.754-.334.179-.2.268-.468.268-.803 0-.334-.09-.602-.268-.803-.18-.2-.4-.334-.754-.334-.314 0-.574.2-.754.467-.179.268-.268.602-.268.937 0 .334.09.602.268.803.18.2.4.334.754.334s.574-.134.754-.334c.179-.2.268-.468.268-.803 0-.334-.09-.602-.268-.803-.18-.2-.4-.334-.754-.334z" /></svg>, name: 'Linux', note: 'Ubuntu, Debian, CentOS', href: '#', primary: true },
            ].map((p, i) => (
              <a key={i} href={p.href} className="bg-[#141414] border border-white/5 rounded-2xl p-5 text-center hover:border-purple-500/20 transition-colors group">
                <div className="text-purple-400 mb-3 flex justify-center">{p.icon}</div>
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
