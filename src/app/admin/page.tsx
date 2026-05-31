export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">📦 Products</h3>
          <p className="text-gray-600 mb-4">Manage your product catalog</p>
          <a href="/admin/products" className="text-victoriosa-primary hover:underline font-semibold">
            Go to Products →
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">💰 Pricing</h3>
          <p className="text-gray-600 mb-4">Manage margins and pricing</p>
          <a href="/admin/pricing" className="text-victoriosa-primary hover:underline font-semibold">
            Go to Pricing →
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2">📥 Imports</h3>
          <p className="text-gray-600 mb-4">Upload products via CSV/JSON</p>
          <a href="/admin/imports" className="text-victoriosa-primary hover:underline font-semibold">
            Go to Imports →
          </a>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-3">ℹ️ Quick Tips</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• All products are created in <strong>draft status</strong> - they won&apos;t appear on the storefront until activated by an admin</li>
          <li>• Use the <strong>Imports</strong> section to bulk upload products via CSV or JSON files</li>
          <li>• Suppliers can only see and edit their own products</li>
          <li>• Archive products instead of deleting them to preserve order history</li>
          <li>• Prices are automatically calculated based on supplier cost + margin percentage</li>
        </ul>
      </div>
    </div>
  )
}
