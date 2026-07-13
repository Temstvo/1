export default function RegisterPage() {
  return (
    <div>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-white tracking-tight">Create account</h2>
        <p className="mt-2 text-gray-400">Join APPI VPN for private internet access</p>
      </div>
      <form className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#111] text-purple-500 focus:ring-purple-500/20" />
          <span className="text-sm text-gray-400">
            I agree to the{' '}
            <a href="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
              Privacy Policy
            </a>
          </span>
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Create Account
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
          Sign in
        </a>
      </p>
    </div>
  );
}
