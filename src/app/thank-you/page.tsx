import Link from 'next/link'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function ThankYou() {
  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold">¡Pedido Recibido!</h1>
        
        <div className="bg-green-50 p-4 rounded-lg text-green-800">
          <p className="font-semibold mb-2">✓ Pedido Confirmado</p>
          <p className="text-sm">
            Nuestro equipo se contactará contigo vía WhatsApp en las próximas 24 horas.
          </p>
        </div>

        <div className="space-y-3 text-left bg-blue-50 p-4 rounded">
          <p className="font-semibold text-blue-900">📋 ¿Qué sigue?</p>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Revisa tu email para la confirmación</li>
            <li>✓ Espera contacto nuestro por WhatsApp</li>
            <li>✓ Coordina envío y pago</li>
            <li>✓ Recibe actualizaciones en tiempo real</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm font-semibold text-purple-900 mb-3">💬 Contáctanos para consultas:</p>
          <WhatsAppButton
            type="consultation"
            className="w-full justify-center"
          />
        </div>

        <div className="space-y-3">
          <Link 
            href="/products"
            className="block bg-victoriosa-primary text-white py-3 rounded-lg font-semibold hover:bg-victoriosa-secondary transition"
          >
            Seguir Comprando
          </Link>
          <Link 
            href="/"
            className="block border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Volver al Inicio
          </Link>
        </div>

        <p className="text-xs text-gray-600">
          💬 Asegúrate de tener WhatsApp habilitado para recibir actualizaciones de tu pedido.
        </p>
      </div>
    </div>
  )
}
