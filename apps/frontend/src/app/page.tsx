import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            APPI VPN
          </span>
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Private Internet. Without Limits.
        </p>
        <p className="mb-12 text-lg text-muted-foreground">
          Premium VPN service with WireGuard, OpenVPN, Xray Reality. Fast, secure, unlimited.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
