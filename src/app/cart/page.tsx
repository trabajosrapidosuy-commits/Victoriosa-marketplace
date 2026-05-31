'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/useCart'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clear, loaded } = useCart()
  const [orderCreating, setOrderCreating] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in name and email')
      return
    }

    setOrderCreating(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          items: items.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✓ Order created! Order number: ${data.order.order_number}`)
        clear()
        setCustomerInfo({ name: '', email: '', phone: '', address: '' })
        window.location.href = '/thank-you'
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert(`Error: ${String(err)}`)
    } finally {
      setOrderCreating(false)
    }
  }

  if (!loaded) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="py-8 space-y-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link href="/products" className="text-victoriosa-primary hover:underline font-semibold">
            Continue Shopping →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product_id} className="bg-white p-4 rounded-lg shadow flex gap-4">
                {item.image_url && (
                  <div className="relative w-20 h-20 rounded overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="px-2 py-1 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-20">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Form */}
          <div className="bg-white p-6 rounded-lg shadow h-fit space-y-4">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping:</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-victoriosa-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleCheckout() }}>
              <div>
                <label className="block font-semibold text-sm mb-1">Name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1">Email *</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full border rounded p-2 text-sm"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="+598..."
                />
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1">Address</label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Delivery address"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={orderCreating}
                className="w-full bg-victoriosa-primary text-white py-2 rounded font-semibold hover:bg-victoriosa-secondary disabled:opacity-50"
              >
                {orderCreating ? 'Processing...' : 'Place Order via WhatsApp'}
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center">
              💬 You will be connected to WhatsApp after order creation
            </p>

            <button
              onClick={() => clear()}
              className="w-full text-red-600 py-2 rounded border border-red-300 hover:bg-red-50"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
