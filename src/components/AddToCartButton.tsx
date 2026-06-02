"use client";

import { useState } from "react";
import type { PublicCatalogProduct } from "@/domain/public-catalog";
import { useCart } from "@/lib/useCart";

export default function AddToCartButton({ product }: { product: PublicCatalogProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className="btn"
      type="button"
      onClick={() => {
        addItem({ product_id: product.id, name: product.title, price: product.salePrice, quantity: 1, image_url: product.mainImageUrl });
        setAdded(true);
      }}
    >
      {added ? "Agregado al carrito" : "Agregar al carrito"}
    </button>
  );
}
