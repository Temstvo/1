import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 mx-auto max-w-2xl text-center px-6">
        <div className="mb-8">
          <img src="/logo.svg" alt="APPI VPN" className="w-24 h-24 mx-auto" />
        </div>
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            APPI VPN
          </span>
        </h1>
        <p className="mb-6 text-xl text-gray-300">
          Private Internet. Without Limits.
        </p>
        <p className="mb-12 text-gray-500">
          Premium VPN service with WireGuard, OpenVPN, Xray Reality & VLESS. Fast, secure, unlimited.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-700/50 bg-[#111] px-8 py-3.5 text-sm font-semibold text-gray-300 hover:bg-[#222] hover:border-gray-600 transition-all"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white">4</div>
            <div className="text-sm text-gray-500">Protocols</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-gray-500">Servers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Unlimited</div>
            <div className="text-sm text-gray-500">Traffic</div>
          </div>
        </div>
      </div>
    </div>
  );
}
