import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { EMPTY_CATALOG_MESSAGE } from "@/domain/public-catalog";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = (await getPublicCatalog()).slice(0, 8);
  const rituals = [
    ["Rostro en calma", "Cuidado facial", "Texturas suaves, limpieza y luminosidad cotidiana."],
    ["Cuerpo consciente", "Cuidado corporal", "Rituales simples para volver al cuerpo con presencia."],
    ["Belleza preparada", "Accesorios", "Organizadores y herramientas para una rutina serena."],
  ];
  return (
    <main>
      <section className="editorial-hero">
        <div className="hero-copy">
          <p className="eyebrow">RITUALES DE BELLEZA CONSCIENTE</p>
          <h1>Tu belleza,<br />en calma.</h1>
          <p>Una seleccion curada para rostro, cuerpo y bienestar, con asesoria cercana y una experiencia calida y confiable.</p>
          <p className="founder-signature">Inspirada por Sofia Victoria, fundadora de Victoriosa.</p>
          <div className="hero-actions">
            <Link className="editorial-button" href="/productos">Descubrir rituales</Link>
            <Link className="editorial-link" href="/evaluacion-online">Agendar evaluacion</Link>
          </div>
          <div className="hero-proof" aria-label="Pilares de confianza">
            <span>Seleccion curada</span>
            <span>Asesoria personalizada</span>
            <span>Experiencia profesional</span>
          </div>
        </div>
        <div className="hero-portrait-shell">
          <Image alt="Sofia Victoria, fundadora de Victoriosa" className="hero-image" height={1024} priority src="/victoriosa-hero-editorial.png" width={1792} />
          <div className="hero-image-caption">Sofia Victoria · estetica profesional y rituales de autocuidado</div>
        </div>
      </section>
      <section className="trust-band" aria-label="Confianza Victoriosa">
        <article><span>01</span><strong>Seleccion curada</strong><p>Productos elegidos por coherencia, utilidad y belleza cotidiana.</p></article>
        <article><span>02</span><strong>Asesoria personalizada</strong><p>Orientacion cercana para elegir sin ruido ni presion.</p></article>
        <article><span>03</span><strong>Experiencia profesional</strong><p>Una mirada estetica responsable, calida y humana.</p></article>
      </section>
      <section className="container-page editorial-section">
        <div className="section-heading">
          <p className="eyebrow">SELECCION VICTORIOSA</p>
          <h2>Esenciales para rituales suaves</h2>
          <p>Destacados para construir una rutina simple, sensorial y confiable. La disponibilidad se confirma antes de cualquier compra.</p>
        </div>
        {featured.length > 0 ? <div className="grid-products">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <section className="card"><p>{EMPTY_CATALOG_MESSAGE}</p></section>}
      </section>
      <section className="rituals-section">
        <div className="section-heading">
          <p className="eyebrow">RITUALES</p>
          <h2>Elegir desde la calma</h2>
        </div>
        <div className="ritual-grid">
          {rituals.map(([title, category, description]) => (
            <Link className="ritual-card" href={`/productos?categoria=${encodeURIComponent(category)}`} key={title}>
              <span>{category}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="guidance-section">
        <div>
          <p className="eyebrow">ACOMPANAMIENTO</p>
          <h2>Una evaluacion cercana para elegir mejor.</h2>
          <p>Si no sabes por donde empezar, Victoriosa puede orientarte con una mirada simple, calida y profesional. Sin promesas medicas ni presion comercial.</p>
        </div>
        <Link className="editorial-button" href="/evaluacion-online">Agendar evaluacion</Link>
      </section>
      <section className="editorial-manifesto">
        <p className="eyebrow">VICTORIOSA</p>
        <h2>Belleza que se siente propia.</h2>
        <p>Estetica, cuidado personal y orientacion responsable para elegir con confianza, en un entorno sereno y honesto.</p>
      </section>
      <footer className="site-footer">
        <div>
          <p className="eyebrow">VICTORIOSA</p>
          <strong>Estetica profesional y bienestar femenino.</strong>
        </div>
        <nav aria-label="Links de pie de pagina">
          <Link href="/productos">Productos</Link>
          <Link href="/kits">Kits</Link>
          <Link href="/evaluacion-online">Evaluacion</Link>
          <Link href="/auth/login">Cuenta</Link>
        </nav>
      </footer>
    </main>
  );
}
