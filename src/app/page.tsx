import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { EMPTY_CATALOG_MESSAGE } from "@/domain/public-catalog";
import { getSofiaHeroAsset } from "@/lib/brand/sofia-hero";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

const heroTags = [
  "Rostro y rituales",
  "Cuerpo en calma",
  "Asesoría personalizada",
  "Belleza limpia",
];

export default async function HomePage() {
  const featured = (await getPublicCatalog()).slice(0, 8);
  const heroAsset = getSofiaHeroAsset();
  const rituals = [
    ["Rituales faciales", "Cuidado facial", "Limpieza, hidratacion y pequenos gestos que devuelven claridad."],
    ["Rituales corporales", "Cuidado corporal", "Texturas suaves, descanso visual y bienestar cotidiano sin exceso."],
    ["Asesoria cercana", "Evaluacion", "Una mirada profesional para elegir mejor y sostener una rutina realista."],
  ];

  return (
    <main className="premium-home">
      <section className="reference-hero-wrap">
        <div className="reference-hero-shell">
          <div className="reference-hero-image-shell">
            <Image
              alt={heroAsset.alt}
              className="reference-hero-image reference-hero-image-desktop"
              height={1024}
              priority
              sizes="(max-width: 920px) 100vw, 92vw"
              src={heroAsset.desktopSrc}
              width={1792}
            />
            <Image
              alt={heroAsset.alt}
              className="reference-hero-image reference-hero-image-mobile"
              height={1024}
              priority
              sizes="100vw"
              src={heroAsset.mobileSrc}
              width={1792}
            />
            <div className="reference-hero-overlay" />
            <div className="reference-hero-copy reference-hero-copy-centered">
              <p className="hero-overline">Rituales de Belleza Consciente</p>
              <h1>Tu belleza, en calma</h1>
              <p className="hero-support hero-support-centered">
                Una selección curada para rostro, cuerpo y bienestar, con asesoría cercana y una experiencia cálida y confiable.
              </p>
              <div className="hero-actions hero-actions-centered">
                <Link className="editorial-button" href="/productos">Descubrir rituales</Link>
                <Link className="editorial-button editorial-button-soft" href="/evaluacion-online">Agendar evaluación</Link>
              </div>
              <div className="hero-tag-row hero-tag-row-centered" aria-label="Etiquetas curadas">
                {heroTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p className="hero-authority hero-authority-centered">Inspirada por Sofía Victoria, fundadora de Victoriosa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-band trust-band-editorial" aria-label="Confianza Victoriosa">
        <article>
          <span>01</span>
          <strong>Selección curada</strong>
          <p>Productos elegidos por coherencia, sensibilidad estética y uso cotidiano.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Asesoría personalizada</strong>
          <p>Orientación simple para elegir sin ruido, exceso de oferta ni presión comercial.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Experiencia profesional</strong>
          <p>Una marca serena, femenina y cercana, pensada para bienestar real.</p>
        </article>
      </section>

      <section className="container-page editorial-section">
        <div className="section-heading section-heading-centered">
          <p className="eyebrow">SELECCION VICTORIOSA</p>
          <h2>Esenciales para una rutina suave</h2>
          <p>
            Destacados para construir una experiencia de cuidado simple, estética y confiable.
            La disponibilidad se confirma antes de cualquier compra.
          </p>
        </div>
        {featured.length > 0 ? (
          <div className="grid-products">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : (
          <section className="card card-editorial-empty">
            <p>{EMPTY_CATALOG_MESSAGE}</p>
          </section>
        )}
      </section>

      <section className="rituals-section rituals-section-soft">
        <div className="section-heading section-heading-centered">
          <p className="eyebrow">RITUALES</p>
          <h2>Elegir desde la calma</h2>
          <p>Tres puertas de entrada para navegar Victoriosa con más claridad y menos saturación.</p>
        </div>
        <div className="ritual-grid">
          {rituals.map(([title, category, description]) => (
            <Link className="ritual-card ritual-card-premium" href={`/productos?categoria=${encodeURIComponent(category)}`} key={title}>
              <span>{category}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="guidance-section guidance-section-editorial">
        <div>
          <p className="eyebrow">ASESORÍA</p>
          <h2>Una evaluación cercana para elegir mejor.</h2>
          <p>
            Si no sabes por dónde empezar, Victoriosa puede orientarte con una mirada
            simple, cálida y profesional. Sin promesas médicas ni tono agresivo.
          </p>
        </div>
        <Link className="editorial-button editorial-button-light" href="/evaluacion-online">Agendar evaluación</Link>
      </section>

      <section className="editorial-manifesto editorial-manifesto-soft">
        <p className="eyebrow">VICTORIOSA</p>
        <h2>Belleza en calma, elegida con criterio.</h2>
        <p>
          Estética profesional y bienestar femenino para acompañar rutinas reales,
          con una identidad visual más limpia, suave y premium.
        </p>
      </section>

      <footer className="site-footer site-footer-editorial">
        <div>
          <p className="eyebrow">VICTORIOSA</p>
          <strong>Belleza consciente con calidez editorial.</strong>
        </div>
        <nav aria-label="Links de pie de pagina">
          <Link href="/productos">Productos</Link>
          <Link href="/kits">Kits</Link>
          <Link href="/evaluacion-online">Evaluación</Link>
          <Link href="/auth/login">Cuenta</Link>
        </nav>
      </footer>
    </main>
  );
}
