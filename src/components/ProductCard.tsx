import type { MarketplaceProduct } from "@/types/marketplace";

export default function ProductCard({ product }: { product: MarketplaceProduct }) {
  return (
    <article className="card">
      <div style={{ aspectRatio: "4/3", background: "#f7e8d7", borderRadius: 18, display: "grid", placeItems: "center", marginBottom: 14 }}>
        <span>{product.category}</span>
      </div>
      <span className="badge">{product.fulfillmentType}</span>
      <h3>{product.title}</h3>
      <p>{product.shortDescription}</p>
      <strong>{product.localCurrency} {Math.round(product.salePrice * (product.fxRate || 1))}</strong>
      <p style={{ fontSize: 12 }}>Riesgo: {product.riskLevel} - Estado: {product.complianceStatus}</p>
      <a className="btn" href={`/productos/${product.slug}`}>Ver detalle</a>
    </article>
  );
}
