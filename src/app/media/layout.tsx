export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="py-4 px-6 bg-white border-b flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">Media App</h1>
        <nav className="flex space-x-4">
          <a href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </a>
          <a href="/builder" className="text-gray-600 hover:text-gray-900">
            Builder
          </a>
          <a href="/media" className="text-blue-600 font-medium">
            Media
          </a>
        </nav>
      </div>
      {children}
    </div>
  );
}
