export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Subscription
        </h2>
        <p className="text-muted-foreground">Manage your subscription and billing.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h3>
            <p className="text-sm text-muted-foreground">You are on the Pro plan</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
            Active
          </span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$9.99/mo</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Traffic Limit</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">100 GB</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Device Limit</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
            Change Plan
          </button>
          <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Plans</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: 'Basic', price: '$4.99/mo', traffic: '50 GB', devices: 3 },
            { name: 'Pro', price: '$9.99/mo', traffic: '100 GB', devices: 5 },
            { name: 'Premium', price: '$19.99/mo', traffic: 'Unlimited', devices: 10 },
          ].map((plan) => (
            <div
              key={plan.name}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.traffic} traffic</p>
              <p className="text-sm text-muted-foreground">{plan.devices} devices</p>
              <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
