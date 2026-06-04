export const catalogProducts = [
  {
    id: "victoriosa-routine-kit",
    title: "Kit rutina facial Victoriosa",
    category: "Cuidado facial",
    description:
      "Seleccion curada para organizar una rutina facial simple, sin promesas medicas y pendiente de revision comercial.",
    url: "https://victoriosa.example/productos/kit-rutina-facial",
    priceLabel: "UYU 1.490",
    tags: ["rutina", "cuidado facial", "kit"],
  },
  {
    id: "victoriosa-body-care",
    title: "Set cuidado corporal",
    category: "Cuidado corporal",
    description:
      "Set orientado a cuidado corporal diario, con lenguaje comercial responsable y estado de compra real deshabilitado.",
    url: "https://victoriosa.example/productos/set-cuidado-corporal",
    priceLabel: "UYU 1.190",
    tags: ["corporal", "set", "bienestar"],
  },
  {
    id: "victoriosa-beauty-accessories",
    title: "Accesorios beauty esenciales",
    category: "Accesorios beauty",
    description:
      "Accesorios genericos para complementar rutinas de belleza sin marcas famosas ni claims sensibles.",
    url: "https://victoriosa.example/productos/accesorios-beauty",
    priceLabel: "UYU 690",
    tags: ["accesorios", "beauty", "rutina"],
  },
  {
    id: "victoriosa-online-evaluation",
    title: "Evaluacion online Victoriosa",
    category: "Servicios de estetica",
    description:
      "Flujo informativo para orientar necesidades de belleza antes de comprar; no reemplaza consejo profesional.",
    url: "https://victoriosa.example/evaluacion-online",
    priceLabel: "Consulta preparada",
    tags: ["evaluacion", "orientacion", "servicio"],
  },
];

export function searchCatalog({ query = "", category, limit = 5 }) {
  const normalizedQuery = normalize(query);
  const normalizedCategory = normalize(category);

  return catalogProducts
    .filter((product) => {
      const searchable = normalize(
        [
          product.title,
          product.category,
          product.description,
          product.priceLabel,
          product.tags.join(" "),
        ].join(" ")
      );
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesCategory =
        !normalizedCategory || normalize(product.category) === normalizedCategory;
      return matchesQuery && matchesCategory;
    })
    .slice(0, limit);
}

export function fetchCatalogProduct(id) {
  return catalogProducts.find((product) => product.id === id);
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
