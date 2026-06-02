// WhatsApp integration utilities for Victoriosa

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+598'

export function formatWhatsAppNumber(number: string): string {
  // Remove spaces and special characters
  const cleaned = number.replace(/\D/g, '')
  return cleaned.startsWith('598') ? `+${cleaned}` : `+${cleaned}`
}

export function buildWhatsAppMessage(params: {
  type: 'product' | 'order' | 'consultation' | 'catalog'
  productName?: string
  orderNumber?: string
  message?: string
}): string {
  switch (params.type) {
    case 'product':
      return `Hola! 👋 Me interesa el producto: ${params.productName}`
    case 'order':
      return `Hola! 📦 Tengo una consulta sobre mi pedido #${params.orderNumber}`
    case 'consultation':
      return `Hola! 💬 Quisiera una consulta personalizada sobre productos de belleza`
    case 'catalog':
      return `Hola! 📸 Me gustaría ver el catálogo completo de productos`
    default:
      return params.message || 'Hola! 👋'
  }
}

export function getWhatsAppLink(message: string, phoneNumber: string = WHATSAPP_NUMBER): string {
  const encoded = encodeURIComponent(message)
  const phone = phoneNumber.replace(/\D/g, '')
  return `https://wa.me/${phone}?text=${encoded}`
}

export function buildProductShareMessage(product: {
  name: string
  price: number
  description?: string
  sku: string
}): string {
  return `
🛍️ *${product.name}*
💰 Precio: $${product.price.toFixed(2)} UYU
📋 SKU: ${product.sku}
${product.description ? `\n📝 ${product.description}` : ''}

¿Te interesa? Envíame un mensaje para más información 👉
  `.trim()
}

export function buildOrderSummaryMessage(order: {
  orderNumber: string
  customerName: string
  total: number
  itemCount: number
}): string {
  return `
📦 *PEDIDO RECIBIDO*
━━━━━━━━━━━━━━━━━━━
Pedido: *#${order.orderNumber}*
Cliente: ${order.customerName}
Productos: ${order.itemCount}
Total: *$${order.total.toFixed(2)} UYU*

Nos contactaremos pronto para confirmar detalles de entrega y pago.

¡Gracias por tu compra! 🙏
  `.trim()
}

export function buildCatalogMessage(): string {
  return `
¡Bienvenido a Victoriosa! 👋

Contamos con una amplia selección de productos de belleza y estética premium:

✨ Serums y tratamientos
🧴 Cremas hidratantes
💆 Mascarillas faciales
💇 Cuidado capilar
💅 Y mucho más...

¿Qué te interesa? Cuéntame y te muestro nuestras opciones 💬
  `.trim()
}
