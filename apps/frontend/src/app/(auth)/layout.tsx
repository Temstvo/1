export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black">
      <div className="hidden w-1/2 bg-gradient-to-br from-[#111] to-[#0a0a0a] lg:flex lg:items-center lg:justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-md px-8 text-center">
          <div className="mb-6">
            <img src="/logo.svg" alt="APPI VPN" className="w-20 h-20 mx-auto" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white tracking-tight">APPI VPN</h1>
          <p className="text-lg text-gray-400">Private Internet. Without Limits.</p>
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>
              <span>WireGuard</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>
              <span>OpenVPN</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="4"/></svg>
              <span>Xray</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md px-8">{children}</div>
      </div>
    </div>
  );
}
