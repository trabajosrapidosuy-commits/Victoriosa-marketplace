'use client'

import Link from 'next/link'
import { buildWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsappUtils'

interface WhatsAppButtonProps {
  type: 'product' | 'order' | 'consultation' | 'catalog'
  productName?: string
  orderNumber?: string
  customMessage?: string
  phoneNumber?: string
  className?: string
  label?: string
}

export default function WhatsAppButton({
  type,
  productName,
  orderNumber,
  customMessage,
  phoneNumber,
  className = '',
  label,
}: WhatsAppButtonProps) {
  const message = customMessage || buildWhatsAppMessage({ type, productName, orderNumber })
  const whatsappLink = getWhatsAppLink(message, phoneNumber)

  const defaultLabels = {
    product: '💬 Consulta por WhatsApp',
    order: '📞 Rastrear pedido',
    consultation: '👨‍💼 Consulta personalizada',
    catalog: '📸 Ver catálogo',
  }

  const buttonLabel = label || defaultLabels[type]

  return (
    <Link
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ${className}`}
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.896 10.306 1.794 3.159 5.747 5.14 9.52 5.106 3.106-.026 5.982-1.554 7.655-4.223 2.015-3.297 1.422-7.757-1.358-10.278-1.894-1.665-4.702-2.427-7.532-1.776.14.385.243.79.243 1.222 0 .414-.067.822-.19 1.214a8.867 8.867 0 01-2.387-.55Z" />
      </svg>
      {buttonLabel}
    </Link>
  )
}
