'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function OrderTrackingPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          setOrder(data.order)
        }
      } catch (err) {
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const statusSteps = [
    { status: 'pending', label: 'Pendiente', icon: '⏳' },
    { status: 'confirmed', label: 'Confirmado', icon: '✓' },
    { status: 'shipped', label: 'Enviado', icon: '📦' },
    { status: 'delivered', label: 'Entregado', icon: '🎉' },
  ]

  const getStatusIndex = (currentStatus: string) => {
    return statusSteps.findIndex(s => s.status === currentStatus)
  }

  if (loading) {
    return <div className="text-center py-12">Cargando pedido...</div>
  }

  if (!order) {
    return <div className="text-center py-12 text-red-600">Pedido no encontrado</div>
  }

  const currentStatusIndex = getStatusIndex(order.status)

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <Link href="/products" className="text-victoriosa-primary hover:underline mb-4 inline-block">
        ← Volver
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-lg space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Rastreo de Pedido</h1>
          <p className="text-gray-600">Pedido #{order.order_number}</p>
        </div>

        {/* Status Timeline */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Estado del Pedido</h2>
          <div className="space-y-4">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx <= currentStatusIndex
              const isActive = idx === currentStatusIndex

              return (
                <div key={step.status} className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition ${
                      isCompleted
                        ? 'bg-victoriosa-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    } ${isActive ? 'ring-4 ring-victoriosa-light' : ''}`}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-sm text-victoriosa-primary font-medium">
                        Estado actual
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <h3 className="font-semibold mb-3">Información del Cliente</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong> {order.customer_name}
              </p>
              <p>
                <strong>Email:</strong> {order.customer_email}
              </p>
              {order.customer_phone && (
                <p>
                  <strong>Teléfono:</strong> {order.customer_phone}
                </p>
              )}
              {order.customer_address && (
                <p>
                  <strong>Dirección:</strong> {order.customer_address}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Detalles del Pedido</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Pedido #:</strong> {order.order_number}
              </p>
              <p>
                <strong>Fecha:</strong>{' '}
                {new Date(order.created_at).toLocaleDateString('es-UY')}
              </p>
              <p>
                <strong>Total:</strong> ${order.total_amount.toFixed(2)} {order.currency}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className="capitalize font-medium text-victoriosa-primary">
                  {order.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="pt-6 border-t">
          <h3 className="font-semibold mb-4">Productos</h3>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded">
                {item.products?.image_url && (
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{item.products?.name}</p>
                  <p className="text-sm text-gray-600">
                    SKU: {item.products?.sku}
                  </p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span>Cantidad: {item.quantity}</span>
                    <span className="font-medium">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">Notas</h3>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* WhatsApp Contact */}
        <div className="pt-6 border-t bg-green-50 p-6 rounded text-center">
          <p className="text-gray-700 mb-4">¿Tienes preguntas sobre tu pedido?</p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20pedido%20%23${order.order_number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.306 1.794 3.159 5.747 5.14 9.52 5.106 3.106-.026 5.982-1.554 7.655-4.223 2.015-3.297 1.422-7.757-1.358-10.278-1.894-1.665-4.702-2.427-7.532-1.776.14.385.243.79.243 1.222 0 .414-.067.822-.19 1.214a8.867 8.867 0 01-2.387-.55Z" />
            </svg>
            💬 Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
