import type { SupplierProduct } from '@/types/sourcing'

function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSeo(p: SupplierProduct) {
  const title = (p.title || '').slice(0, 78)
  const slug = slugify(title || 'producto-victoriosa').slice(0, 100)

  const shortDescription = (p.title || '').length > 60 ? (p.title || '').slice(0, 60) + '…' : (p.title || '')

  const bullets = [
    'Calidad seleccionada para uso diario',
    'Envío desde proveedor',
    'Fácil de usar y conservar',
    'Ideal para regalo o uso personal',
    'Garantía de revisión humana por Victoriosa',
  ]

  const longDescription = `Qué es\n${p.title}\n\nBeneficios:\n- ${bullets.join('\n- ')}\n\nModo de uso: seguir instrucciones del proveedor. Tiempo de entrega estimado según proveedor.`

  const seoTitle = `${title} • Victoriosa`
  const seoDescription = shortDescription

  const altTexts = (p.images || []).map((url, i) => `Imagen ${i + 1} de ${title} - Victoriosa`)

  return {
    title: seoTitle,
    slug,
    shortDescription,
    longDescription,
    bullets,
    seoTitle,
    seoDescription,
    metaKeywords: (p.title || '').split(' ').slice(0, 8),
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    altTexts,
  }
}

export default generateSeo
