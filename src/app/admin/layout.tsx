'use client'

import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-victoriosa-primary text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4 flex-1">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            📦 Products
          </Link>
          <Link
            href="/admin/pricing"
            className="block px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            💰 Pricing
          </Link>
          <Link
            href="/admin/imports"
            className="block px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            📥 Imports
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            📋 Orders
          </Link>
          <Link
            href="/admin/whatsapp"
            className="block px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            💬 WhatsApp
          </Link>
        </nav>
        <div className="border-t border-victoriosa-secondary pt-4">
          <button
            onClick={async () => {
              // TODO: Implement logout
              window.location.href = '/'
            }}
            className="w-full text-left px-4 py-2 rounded hover:bg-victoriosa-secondary transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}
