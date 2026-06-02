import type { PublicCatalogProduct } from "@/domain/public-catalog";

export default function ProductCard({ product }: { product: PublicCatalogProduct }) {
  return (
    <article className="card">
      <div style={{ aspectRatio: "4/3", background: "#f7e8d7", borderRadius: 18, display: "grid", placeItems: "center", marginBottom: 14 }}>
        <span>{product.category}</span>
      </div>
      <span className="badge">{product.category}</span>
      <h3>{product.title}</h3>
      <p>{product.shortDescription}</p>
      <strong>{product.localCurrency} {Math.round(product.salePrice)}</strong>
      <p style={{ fontSize: 13 }}>Disponibilidad y entrega sujetas a confirmacion.</p>
      <a className="btn" href={`/productos/${product.slug}`}>Ver detalle</a>
    </article>
  );
}
