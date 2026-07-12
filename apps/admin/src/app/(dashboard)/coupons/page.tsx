'use client';

const coupons = [
  { id: '1', code: 'SAVE20', type: 'PERCENTAGE', value: 20, uses: 45, maxUses: 100, expiresAt: '2026-06-30', isActive: true },
  { id: '2', code: 'FIRST10', type: 'FIXED', value: 10, uses: 120, maxUses: null, expiresAt: null, isActive: true },
  { id: '3', code: 'FREEDAYS', type: 'FREE_DAYS', value: 7, uses: 30, maxUses: 50, expiresAt: '2026-03-31', isActive: true },
  { id: '4', code: 'EXPIRED50', type: 'PERCENTAGE', value: 50, uses: 200, maxUses: 200, expiresAt: '2025-12-31', isActive: false },
];

export default function CouponsPage() {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PERCENTAGE':
        return '% Off';
      case 'FIXED':
        return '$ Off';
      case 'FREE_DAYS':
        return 'Free Days';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          + Create Coupon
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Uses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-mono font-bold text-gray-900 dark:text-white">
                    {coupon.code}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {getTypeLabel(coupon.type)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : coupon.type === 'FIXED' ? `$${coupon.value}` : `${coupon.value} days`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {coupon.uses}/{coupon.maxUses || '∞'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {coupon.expiresAt || 'Never'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                        Edit
                      </button>
                      <button className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
