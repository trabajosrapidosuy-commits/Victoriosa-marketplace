'use client'

import { useState } from 'react'

export default function AdminImports() {
  const [file, setFile] = useState<File | null>(null)
  const [method, setMethod] = useState('csv')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('method', method)

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      setResult(data)
      setFile(null)
    } catch (err) {
      setError(`Error: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Product Imports</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Upload Product File</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <p className="font-semibold">✅ Import Completed!</p>
            <p>Total: {result.total} | Imported: {result.imported_count} | Failed: {result.failed_count}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Import Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="csv">CSV File</option>
              <option value="json">JSON File</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">
              {method === 'csv' 
                ? 'CSV columns: sku, name, category, supplier_cost, margin_percentage (optional), description (optional), image_url (optional), stock_quantity (optional)'
                : 'JSON array of objects with the same fields as CSV'}
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">Select File</label>
            <input
              type="file"
              accept={method === 'csv' ? '.csv' : '.json'}
              onChange={handleFileChange}
              className="w-full border rounded p-2"
            />
            {file && <p className="text-sm text-green-600 mt-1">✓ {file.name}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full bg-victoriosa-primary text-white py-2 rounded font-semibold hover:bg-victoriosa-secondary disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Import Products'}
          </button>
        </form>

        {result && (
          <div className="mt-6">
            <h3 className="font-bold mb-2">Imported Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">SKU</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Category</th>
                    <th className="border p-2">Cost</th>
                    <th className="border p-2">Retail</th>
                  </tr>
                </thead>
                <tbody>
                  {result.products.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="border p-2 font-mono text-xs">{p.sku}</td>
                      <td className="border p-2">{p.name}</td>
                      <td className="border p-2">{p.category}</td>
                      <td className="border p-2">${p.supplier_cost.toFixed(2)}</td>
                      <td className="border p-2">${p.retail_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="font-bold mb-2">📋 CSV Format Example</h3>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{`sku,name,category,supplier_cost,margin_percentage,description
SERUM-001,Facial Serum Pro,Serums,500,80,Professional facial serum
CREAM-001,Anti-Aging Cream,Creams,700,75,Advanced anti-aging formula`}
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="font-bold mb-2">📋 JSON Format Example</h3>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
{`[
  {
    "sku": "SERUM-001",
    "name": "Facial Serum Pro",
    "category": "Serums",
    "supplier_cost": 500,
    "margin_percentage": 80,
    "description": "Professional facial serum"
  },
  {
    "sku": "CREAM-001",
    "name": "Anti-Aging Cream",
    "category": "Creams",
    "supplier_cost": 700,
    "margin_percentage": 75
  }
]`}
        </pre>
      </div>
    </div>
  )
}
