import { getFeaturedProducts } from "@/services/marketplace-product-service";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const products = getFeaturedProducts(50);
  const categories = Array.from(new Set(products.map((product) => product.category)));
  return (
    <main className="container-page">
      <h1>Productos Victoriosa</h1>
      <p>Catalogo demo con filtros conceptuales. Solo deben publicarse productos approved + published.</p>
      <div className="card" style={{ marginBottom: 24 }}>
        <strong>Filtros previstos:</strong> categoria, precio, tipo, envio, riesgo, proveedor y fulfillment type.
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {categories.map((category) => <span className="badge" key={category}>{category}</span>)}
        </div>
      </div>
      <div className="grid-products">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </main>
  );
}
