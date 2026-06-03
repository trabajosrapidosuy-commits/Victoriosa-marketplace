import Image from "next/image";
import type { PublicCatalogProduct } from "@/domain/public-catalog";

export default function ProductCard({ product }: { product: PublicCatalogProduct }) {
  return (
    <article className="product-card">
      <div className="product-media">
        {product.mainImageUrl ? <Image alt="" src={product.mainImageUrl} width={640} height={480} /> : <span>{product.category}</span>}
      </div>
      <span className="badge">{product.category}</span>
      <h3>{product.title}</h3>
      <p>{product.shortDescription}</p>
      <div className="product-meta">
        <strong>{product.localCurrency} {Math.round(product.salePrice)}</strong>
        <span>Confirmacion previa</span>
      </div>
      <p className="product-note">Disponibilidad y entrega sujetas a confirmacion.</p>
      <a className="btn btn-quiet" href={`/productos/${product.slug}`}>Ver detalle</a>
    </article>
  );
}
