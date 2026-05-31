import Link from 'next/link'
import { getFeaturedProducts } from "@/services/marketplace-product-service";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  const products = getFeaturedProducts(8);
  return (
    <main className="container-page">
      <section className="card" style={{ display: "grid", gap: 24 }}>
        <span className="badge">Marketplace propio - dropshipping controlado - afiliados - stock local</span>
        <h1 style={{ fontSize: 56, lineHeight: 1, margin: 0 }}>Productos seleccionados para verte y sentirte victoriosa.</h1>
        <p style={{ maxWidth: 760, fontSize: 18 }}>
          Compra belleza, cuidado facial, corporal, accesorios y tendencias internacionales con curaduria, margen claro, revision humana y seguimiento desde Victoriosa.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/productos">Ver productos</Link>
          <Link className="btn btn-secondary" href="/evaluacion-online">Hacer evaluacion online</Link>
          <Link className="btn btn-secondary" href="/admin/marketplace/products/import">Importar productos</Link>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Productos destacados demo</h2>
        <div className="grid-products">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="card" style={{ marginTop: 32 }}>
        <h2>Como funciona</h2>
        <ol>
          <li>Importas productos por CSV/JSON o conectores autorizados.</li>
          <li>Victoriosa calcula margen, riesgo, permisos e imagenes.</li>
          <li>Todo entra en revision humana como draft o needs_review.</li>
          <li>Admin aprueba, ajusta precio y publica solo productos seguros.</li>
          <li>El cliente compra, consulta por WhatsApp o sale por afiliado segun modelo.</li>
        </ol>
      </section>
    </main>
  );
}
