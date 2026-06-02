import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { EMPTY_CATALOG_MESSAGE } from "@/domain/public-catalog";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getPublicCatalog();
  const featured = products.slice(0, 8);
  return (
    <main className="container-page">
      <section className="card" style={{ display: "grid", gap: 24 }}>
        <span className="badge">Belleza y cuidado personal seleccionados con criterio</span>
        <h1 style={{ fontSize: 56, lineHeight: 1, margin: 0 }}>Productos para verte y sentirte victoriosa.</h1>
        <p style={{ maxWidth: 760, fontSize: 18 }}>
          Descubri una seleccion cuidada de belleza, cuidado facial, corporal y accesorios pensada para acompañar tu rutina con informacion clara y asesoramiento cercano.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/productos">Ver productos</Link>
          <Link className="btn btn-secondary" href="/evaluacion-online">Agendar evaluacion</Link>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Seleccion Victoriosa</h2>
        {featured.length > 0 ? (
          <div className="grid-products">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <section className="card">
            <p>{EMPTY_CATALOG_MESSAGE}</p>
            <Link className="btn btn-secondary" href="/evaluacion-online">Consultar por asesoramiento</Link>
          </section>
        )}
      </section>

      <section className="card" style={{ marginTop: 32 }}>
        <h2>Una experiencia pensada para vos</h2>
        <p>Victoriosa combina estetica, cuidado personal y orientacion responsable para ayudarte a elegir con confianza.</p>
      </section>
    </main>
  );
}
