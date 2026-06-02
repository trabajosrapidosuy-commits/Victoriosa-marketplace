'use client'

import { useCallback, useEffect, useState } from 'react'
import { Product } from '@/types/database'
import { PriceCalculator, MARGIN_PRESETS, calculateRetailPrice } from '@/lib/pricingUtils'

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [newMargin, setNewMargin] = useState(75)
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products`)
      const data = await response.json()

      if (response.ok) {
        let filtered = data.products
        if (category) {
          filtered = filtered.filter((p: Product) => p.category === category)
        }
        setProducts(filtered)

        // Extract unique categories
        setCategories((currentCategories) => currentCategories.length > 0
          ? currentCategories
          : [...new Set(data.products.map((p: Product) => p.category))] as string[])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleBulkUpdate = async () => {
    if (selectedProducts.length === 0) {
      setMessage({ type: 'error', text: 'Select at least one product' })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/products/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: selectedProducts,
          margin_percentage: newMargin,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✓ Updated ${data.updated_count} products to ${newMargin}% margin`,
        })
        fetchProducts()
        setSelectedProducts([])
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${String(err)}` })
    } finally {
      setUpdating(false)
    }
  }

  const handleCategoryBulkUpdate = async () => {
    if (!category) {
      setMessage({ type: 'error', text: 'Select a category' })
      return
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/products/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          margin_percentage: newMargin,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✓ Updated all ${category} products to ${newMargin}% margin`,
        })
        fetchProducts()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${String(err)}` })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6 py-8">
      <h1 className="text-3xl font-bold">💰 Pricing & Margins</h1>

      {message && (
        <div
          className={`p-4 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Price Calculator */}
      <PriceCalculator />

      {/* Bulk Operations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold">📂 Update by Category</h2>

          <div>
            <label className="block font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">All Products</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">New Margin %</label>
            <input
              type="number"
              value={newMargin}
              onChange={(e) => setNewMargin(parseFloat(e.target.value) || 75)}
              step="0.01"
              className="w-full border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MARGIN_PRESETS.map(preset => (
              <button
                key={preset.value}
                onClick={() => setNewMargin(preset.value)}
                className="p-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                {preset.value}%
              </button>
            ))}
          </div>

          <button
            onClick={handleCategoryBulkUpdate}
            disabled={updating || !category}
            className="w-full bg-victoriosa-primary text-white py-2 rounded font-semibold hover:bg-victoriosa-secondary disabled:opacity-50"
          >
            {updating ? 'Updating...' : `Update All ${category || 'Products'}`}
          </button>
        </div>

        {/* By Selection */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-bold">✋ Update Selected</h2>

          <div>
            <label className="block font-semibold mb-2">New Margin %</label>
            <input
              type="number"
              value={newMargin}
              onChange={(e) => setNewMargin(parseFloat(e.target.value) || 75)}
              step="0.01"
              className="w-full border rounded p-2"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="font-semibold">{selectedProducts.length} products selected</p>
          </div>

          <button
            onClick={handleBulkUpdate}
            disabled={updating || selectedProducts.length === 0}
            className="w-full bg-victoriosa-primary text-white py-2 rounded font-semibold hover:bg-victoriosa-secondary disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Selected'}
          </button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-8">Loading products...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="p-2 text-left font-semibold">SKU</th>
                <th className="p-2 text-left font-semibold">Product</th>
                <th className="p-2 text-right font-semibold">Cost (UYU)</th>
                <th className="p-2 text-right font-semibold">Margin %</th>
                <th className="p-2 text-right font-semibold">Retail (UYU)</th>
                <th className="p-2 text-right font-semibold">Profit/Unit</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const newPrice = calculateRetailPrice(product.supplier_cost, newMargin)
                const profit = newPrice - product.supplier_cost
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleToggleProduct(product.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-2 font-mono text-sm">{product.sku}</td>
                    <td className="p-2 font-semibold">{product.name}</td>
                    <td className="p-2 text-right">${product.supplier_cost.toFixed(2)}</td>
                    <td className="p-2 text-right">{product.margin_percentage}%</td>
                    <td className="p-2 text-right font-semibold">${product.retail_price.toFixed(2)}</td>
                    <td className="p-2 text-right text-green-600 font-semibold">
                      ${(product.retail_price - product.supplier_cost).toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
