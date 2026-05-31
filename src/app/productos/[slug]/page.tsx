import { getFeaturedProducts, buildAffiliateRedirectUrl } from "@/services/marketplace-product-service";
import { notFound } from "next/navigation";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getFeaturedProducts(50).find((item) => item.slug === slug);
  if (!product) notFound();
  const isAffiliate = product.fulfillmentType === "affiliate";
  return (
    <main className="container-page">
      <article className="card">
        <span className="badge">{product.category} / {product.fulfillmentType}</span>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <h2>Precio estimado: {product.localCurrency} {Math.round(product.salePrice * product.fxRate)}</h2>
        <p>Envio estimado: {product.estimatedDeliveryMinDays}-{product.estimatedDeliveryMaxDays} dias. Sujeto a confirmacion.</p>
        <p>Riesgo interno: {product.riskLevel}. Compliance: {product.complianceStatus}. Imagen: {product.imageRightsStatus}.</p>
        {isAffiliate ? (
          <>
            <p><strong>Aviso:</strong> La compra se completa en el sitio del proveedor. Victoriosa registra el click y no cobra este producto.</p>
            <a className="btn" href={buildAffiliateRedirectUrl(product)}>Ver en proveedor</a>
          </>
        ) : (
          <>
            <p><strong>Aviso:</strong> Producto importado o gestionado por Victoriosa. Disponibilidad y tracking se confirman por admin.</p>
            <a className="btn" href="/checkout">Comprar preparado</a>
            <a className="btn btn-secondary" style={{ marginLeft: 8 }} href="/carrito">Agregar al carrito</a>
          </>
        )}
      </article>
    </main>
  );
}
