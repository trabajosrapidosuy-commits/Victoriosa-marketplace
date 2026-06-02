'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types/database'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products')
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch products')
        return
      }

      setProducts(data.products || [])
      setError(null)
    } catch (err) {
      setError(`Error: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error)
        return
      }

      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      alert(`Error: ${String(err)}`)
    }
  }

  const handleArchiveProduct = async (id: string) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: id,
          status: 'archived',
        }),
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (err) {
      alert(`Error: ${String(err)}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-victoriosa-primary text-white px-4 py-2 rounded hover:bg-victoriosa-secondary"
        >
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      {showForm && <ProductForm onSuccess={fetchProducts} />}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">SKU</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Cost</th>
                <th className="border p-2">Retail</th>
                <th className="border p-2">Margin</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="border p-2 font-mono text-sm">{product.sku}</td>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.category}</td>
                  <td className="border p-2">${product.supplier_cost.toFixed(2)}</td>
                  <td className="border p-2">${product.retail_price.toFixed(2)}</td>
                  <td className="border p-2">{product.margin_percentage}%</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'draft' ? 'bg-yellow-100' :
                      product.status === 'active' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="border p-2 space-x-1">
                    {product.status !== 'archived' && (
                      <button
                        onClick={() => handleArchiveProduct(product.id)}
                        className="text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    description: '',
    supplier_cost: '',
    margin_percentage: '75',
    stock_quantity: '0',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          supplier_cost: parseFloat(formData.supplier_cost),
          margin_percentage: parseFloat(formData.margin_percentage),
          stock_quantity: parseInt(formData.stock_quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      setFormData({
        sku: '',
        name: '',
        category: '',
        description: '',
        supplier_cost: '',
        margin_percentage: '75',
        stock_quantity: '0',
        image_url: '',
      })
      onSuccess()
    } catch (err) {
      setError(`Error: ${String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h2 className="text-xl font-bold">Add New Product</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">SKU *</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
            placeholder="e.g., SERUM-001"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
            placeholder="e.g., Facial Serum Pro"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Category *</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
            placeholder="e.g., Serums, Creams, etc"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Supplier Cost (UYU) *</label>
          <input
            type="number"
            name="supplier_cost"
            value={formData.supplier_cost}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full border rounded p-2"
            placeholder="e.g., 500.00"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Margin % (default 75)</label>
          <input
            type="number"
            name="margin_percentage"
            value={formData.margin_percentage}
            onChange={handleChange}
            step="0.01"
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Stock Quantity</label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Product description..."
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Image URL</label>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="https://..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-victoriosa-primary text-white py-2 rounded font-semibold hover:bg-victoriosa-secondary disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Product (Draft)'}
      </button>
    </form>
  )
}
