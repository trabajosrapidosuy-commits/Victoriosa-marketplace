'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Product } from '@/types/database'
import { useCart } from '@/lib/useCart'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function ProductDetail() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()
        if (response.ok) {
          setProduct(data.product)
        }
      } catch (err) {
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleAddToCart = () => {
    if (product) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.retail_price,
        quantity,
        image_url: product.image_url || undefined,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading product...</div>
  }

  if (!product) {
    return <div className="text-center py-12 text-red-600">Product not found.</div>
  }

  return (
    <div className="py-8">
      <a href="/products" className="text-victoriosa-primary hover:underline mb-4 inline-block">
        ← Back to Products
      </a>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Price */}
          <div className="bg-victoriosa-light p-6 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Price (UYU)</p>
            <p className="text-4xl font-bold text-victoriosa-primary">
              ${product.retail_price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Margin: {product.margin_percentage}%
            </p>
          </div>

          {/* Stock */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-semibold">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600">✓ In Stock ({product.stock_quantity} available)</span>
              ) : (
                <span className="text-red-600">✗ Out of Stock</span>
              )}
            </p>
          </div>

          {/* Add to Cart */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-2">Quantity</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 border rounded p-2 text-center"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="w-full bg-victoriosa-primary text-white py-3 rounded-lg font-semibold hover:bg-victoriosa-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {addedToCart && (
              <p className="text-green-600 text-center font-semibold">✓ Added to cart!</p>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Status:</strong> <span className="capitalize">{product.status}</span></p>
            <p><strong>Added:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
          </div>

          {/* WhatsApp */}
          <WhatsAppButton
            type="product"
            productName={product.name}
            className="w-full justify-center py-3"
          />
        </div>
      </div>
    </div>
  )
}
