export default function ReferralPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Referral Program</h2>
        <p className="text-muted-foreground">Invite friends and earn rewards.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-sm">
        <h3 className="text-lg font-semibold">Your Referral Link</h3>
        <p className="mt-1 text-blue-100">Share this link with friends. You both get 1 month free!</p>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value="https://appi-vpn.com/ref/ABC12345"
            readOnly
            className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-white placeholder-blue-200 backdrop-blur-sm"
          />
          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
            Copy
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Total Referrals</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">12</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Active Referrals</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">8</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Balance</p>
          <p className="mt-2 text-3xl font-bold text-green-600">$24.00</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Referral History</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {[
            { email: 'user1@example.com', date: 'Jul 10, 2026', status: 'Active', reward: '$3.00' },
            { email: 'user2@example.com', date: 'Jul 5, 2026', status: 'Active', reward: '$3.00' },
            { email: 'user3@example.com', date: 'Jun 28, 2026', status: 'Expired', reward: '$0.00' },
            { email: 'user4@example.com', date: 'Jun 20, 2026', status: 'Active', reward: '$3.00' },
          ].map((referral) => (
            <div key={referral.email} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{referral.email}</p>
                <p className="text-sm text-muted-foreground">{referral.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    referral.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {referral.status}
                </span>
                <p className="font-medium text-green-600">{referral.reward}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
