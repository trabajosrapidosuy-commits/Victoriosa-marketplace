'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Order } from '@/types/database'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setOrders(orders.map(o =>
          o.id === orderId ? { ...o, status } : o
        ))
        setSelectedOrder(null)
        setNewStatus('')
      }
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.reduce((sum, o) => sum + o.total_amount, 0),
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
        <p className="text-gray-600">Monitorea y actualiza el estado de todos los pedidos</p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Pendientes</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Confirmados</p>
          <p className="text-3xl font-bold text-blue-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Enviados</p>
          <p className="text-3xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Entregados</p>
          <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Ingresos</p>
          <p className="text-2xl font-bold text-victoriosa-primary">
            ${stats.revenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 bg-white p-4 rounded-lg">
        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((type) => (
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Pedido</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Cargando pedidos...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay pedidos
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-semibold text-victoriosa-primary hover:underline"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-gray-600">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('es-UY')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      className="text-victoriosa-primary hover:underline text-sm font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Status Update Panel */}
      {selectedOrder && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
          <h3 className="font-semibold">Actualizar Estado</h3>
          <div className="flex gap-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 border rounded p-2"
            >
              <option value="">Selecciona nuevo estado</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <button
              onClick={() => {
                if (newStatus) {
                  handleStatusUpdate(selectedOrder, newStatus)
                }
              }}
              disabled={!newStatus}
              className="px-6 py-2 bg-victoriosa-primary text-white rounded font-medium hover:bg-victoriosa-secondary disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setSelectedOrder(null)
                setNewStatus('')
              }}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded font-medium hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
