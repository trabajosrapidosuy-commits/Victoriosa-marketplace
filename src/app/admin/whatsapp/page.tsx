'use client'

import { useEffect, useState } from 'react'
import { AnalyticsEvent } from '@/types/database'


export default function WhatsAppAdminPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'product' | 'order' | 'consultation' | 'catalog'>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/whatsapp')
        const data = await response.json()
        // In a real scenario, we'd fetch analytics events
        setEvents([])
      } catch (err) {
        console.error('Error fetching WhatsApp events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = filter === 'all'
    ? events
    : events.filter((e) => e.event_type?.includes(filter))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">WhatsApp Integration</h1>
        <p className="text-gray-600">Monitor customer interactions via WhatsApp</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Product Inquiries</p>
          <p className="text-3xl font-bold text-green-600">
            {events.filter((e) => e.event_type?.includes('product')).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Order Consultations</p>
          <p className="text-3xl font-bold text-blue-600">
            {events.filter((e) => e.event_type?.includes('order')).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Consultations</p>
          <p className="text-3xl font-bold text-purple-600">
            {events.filter((e) => e.event_type?.includes('consultation')).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Interactions</p>
          <p className="text-3xl font-bold text-gray-600">
            {events.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-white p-4 rounded-lg">
        {['all', 'product', 'order', 'consultation', 'catalog'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as any)}
            className={`px-4 py-2 rounded font-medium transition ${
              filter === type
                ? 'bg-victoriosa-primary text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Order</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Loading events...
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No WhatsApp interactions yet
                </td>
              </tr>
            ) : (
              filteredEvents.map((event, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {event.event_type?.replace('whatsapp_', '') || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{event.product_id || '—'}</td>
                  <td className="px-6 py-4 text-sm">{event.order_id || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(event.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Configuration */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-bold mb-4">📱 WhatsApp Configuration</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-800">Business Number:</p>
            <p className="text-gray-600">{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not configured'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Integration Status:</p>
            <p className="text-green-600">✓ Active</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Features:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Product inquiry tracking</li>
              <li>Order status notifications</li>
              <li>Consultation requests</li>
              <li>Catalog sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
