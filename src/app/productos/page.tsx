import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { EMPTY_CATALOG_MESSAGE, filterCatalogProducts } from "@/domain/public-catalog";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const allProducts = await getPublicCatalog();
  const products = filterCatalogProducts(allProducts, categoria);
  const categories = Array.from(new Set(allProducts.map((product) => product.category)));
  return (
    <main className="container-page">
      <h1>Productos Victoriosa</h1>
      <p>Explora nuestra seleccion de belleza y cuidado personal. Cada producto visible fue revisado antes de incorporarse al catalogo.</p>
      {categories.length > 0 ? (
        <nav className="card" aria-label="Categorias" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <Link className="badge" href="/productos">Todos</Link>
          {categories.map((category) => <Link className="badge" href={`/productos?categoria=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
        </nav>
      ) : null}
      {products.length > 0 ? (
        <div className="grid-products">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <section className="card"><p>{EMPTY_CATALOG_MESSAGE}</p></section>
      )}
    </main>
  );
}
