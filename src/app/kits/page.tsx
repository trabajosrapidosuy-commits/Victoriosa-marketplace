import { getProductsByCategory } from "@/services/marketplace-product-service";
import ProductCard from "@/components/ProductCard";

export default function KitsPage() {
  const kits = getProductsByCategory("Kits Victoriosa");
  return (
    <main className="container-page">
      <h1>Kits Victoriosa</h1>
      <p>Kits armados para rutinas beauty, siempre con revision responsable y sin promesas medicas.</p>
      <div className="grid-products">{kits.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </main>
  );
}
