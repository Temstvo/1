export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md px-8 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold">APPI VPN</h1>
          <p className="text-lg text-blue-100">Private Internet. Without Limits.</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md px-8">{children}</div>
      </div>
    </div>
  );
}
