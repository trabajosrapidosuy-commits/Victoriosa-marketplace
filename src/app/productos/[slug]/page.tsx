import { notFound } from "next/navigation";
import { getPublicCatalogProduct } from "@/services/public-catalog-service";

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
        <span className="badge">{product.category}</span>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <h2>{product.localCurrency} {Math.round(product.salePrice)}</h2>
        <p>Entrega estimada: {delivery}. Disponibilidad sujeta a confirmacion.</p>
        {product.returnWindowDays ? <p>Plazo informado para devoluciones: {product.returnWindowDays} dias.</p> : null}
        <p>La compra online estara disponible proximamente. Mientras tanto, podes consultar con Victoriosa para recibir orientacion.</p>
        <a className="btn" href="/evaluacion-online">Consultar antes de comprar</a>
      </article>
    </main>
  );
}
