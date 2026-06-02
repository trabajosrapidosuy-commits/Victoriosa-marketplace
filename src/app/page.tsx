import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { EMPTY_CATALOG_MESSAGE } from "@/domain/public-catalog";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = (await getPublicCatalog()).slice(0, 8);
  return (
    <main>
      <section className="editorial-hero">
        <div className="hero-copy">
          <p className="eyebrow">RITUALES DE BELLEZA</p>
          <h1>Tu belleza.<br />Tu momento.</h1>
          <p>Una seleccion curada para rostro, cuerpo y bienestar. Elegi con confianza y recibi orientacion cercana.</p>
          <div className="hero-actions">
            <Link className="editorial-button" href="/productos">Descubrir</Link>
            <Link className="editorial-link" href="/evaluacion-online">Agendar evaluacion</Link>
          </div>
        </div>
        <Image alt="Editorial Victoriosa de belleza y cuidado personal" className="hero-image" height={1024} priority src="/victoriosa-hero-editorial.png" width={1792} />
      </section>
      <section className="container-page editorial-section">
        <p className="eyebrow">SELECCION VICTORIOSA</p>
        <h2>Esenciales para tu rutina</h2>
        {featured.length > 0 ? <div className="grid-products">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <section className="card"><p>{EMPTY_CATALOG_MESSAGE}</p></section>}
      </section>
      <section className="editorial-manifesto">
        <p className="eyebrow">VICTORIOSA</p>
        <h2>Belleza que se siente propia</h2>
        <p>Estetica, cuidado personal y orientacion responsable para elegir con confianza.</p>
      </section>
    </main>
  );
}
