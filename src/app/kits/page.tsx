import ProductCard from "@/components/ProductCard";
import { EMPTY_CATALOG_MESSAGE, filterCatalogProducts } from "@/domain/public-catalog";
import { getPublicCatalog } from "@/services/public-catalog-service";

export const dynamic = "force-dynamic";

export default async function KitsPage() {
  const kits = filterCatalogProducts(await getPublicCatalog(), "Kits Victoriosa");
  return (
    <main className="container-page">
      <h1>Kits Victoriosa</h1>
      <p>Kits pensados para acompañar rutinas de belleza y cuidado personal con orientacion responsable.</p>
      {kits.length > 0 ? (
        <div className="grid-products">{kits.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <section className="card"><p>{EMPTY_CATALOG_MESSAGE}</p></section>
      )}
    </main>
  );
}
