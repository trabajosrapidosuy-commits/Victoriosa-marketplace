import { notFound } from "next/navigation";
import { getPublicCatalogProduct } from "@/services/public-catalog-service";
import { DEMO_CATALOG_NOTICE } from "@/domain/public-catalog";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublicCatalogProduct(slug).catch(() => null);
  if (!product) notFound();
  const delivery = product.estimatedDeliveryMinDays && product.estimatedDeliveryMaxDays
    ? `${product.estimatedDeliveryMinDays}-${product.estimatedDeliveryMaxDays} dias`
    : "a confirmar";
  return (
    <main className="container-page">
      <article className="card">
        {product.isDemo ? <p className="demo-notice">{DEMO_CATALOG_NOTICE}</p> : null}
        <span className="badge">{product.category}</span>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <h2>{product.localCurrency} {Math.round(product.salePrice)}</h2>
        <p>Entrega estimada: {delivery}. Disponibilidad sujeta a confirmacion.</p>
        {product.returnWindowDays ? <p>Plazo informado para devoluciones: {product.returnWindowDays} dias.</p> : null}
        <p>El checkout funciona como preparacion manual. No procesa pagos reales.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <AddToCartButton product={product} />
          <a className="btn btn-secondary" href="/evaluacion-online">Consultar antes de comprar</a>
        </div>
      </article>
    </main>
  );
}
