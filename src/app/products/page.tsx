'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Product } from '@/types/database'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function ProductsCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [search, category, page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      params.append('page', page.toString())

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setTotalPages(data.pagination.pages)
        
        // Extract unique categories
        if (data.products.length > 0 && categories.length === 0) {
          const uniqueCategories = [...new Set(data.products.map((p: Product) => p.category))]
          setCategories(uniqueCategories as string[])
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 py-8">
      <h1 className="text-4xl font-bold">Shop Our Collection</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search products..."
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
              className="w-full border rounded p-2"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('')
                setCategory('')
                setPage(1)
              }}
              className="w-full bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No products found.</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-1">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t">
                      <span className="font-bold text-victoriosa-primary">
                        ${product.retail_price.toFixed(2)}
                      </span>
                      <span className="text-xs bg-victoriosa-light text-victoriosa-primary px-2 py-1 rounded">
                        {product.margin_percentage}% margin
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                ← Previous
              </button>
              <div className="px-4 py-2">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}

          {/* WhatsApp CTA */}
          <div className="mt-12 bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-lg border border-green-200 text-center">
            <h2 className="text-2xl font-bold mb-3">¿Necesitas asesoramiento?</h2>
            <p className="text-gray-700 mb-6">Contáctanos por WhatsApp para consultas personalizadas y recomendaciones</p>
            <WhatsAppButton
              type="consultation"
              className="mx-auto"
            />
          </div>
        </>
      )}
    </div>
  )
}
