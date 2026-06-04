export const AUTOPILOT_PRIORITY_CATEGORIES = [
  "belleza",
  "estetica",
  "cuidado facial",
  "cuidado corporal",
  "accesorios de belleza",
  "bienestar no medico",
  "hogar/lifestyle femenino",
  "regalos",
  "tendencia",
] as const;

export const AUTOPILOT_BLOCKED_CATEGORIES = [
  "medicamentos",
  "suplementos",
  "productos medicos con claims clinicos",
  "armas",
  "productos adultos",
  "quimicos peligrosos",
  "falsificaciones",
  "marcas dudosas",
  "productos regulados",
  "claims enganosos",
] as const;

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
  icon:
    | "layout-dashboard"
    | "sparkles"
    | "search"
    | "clipboard-check"
    | "file-text"
    | "history"
    | "sliders-horizontal"
    | "shield-check"
    | "box"
    | "shopping-bag"
    | "truck";
};

export const AUTOPILOT_MENU_ITEMS: AdminNavItem[] = [
  {
    href: "/admin/autopilot",
    label: "Dashboard",
    description: "Resumen de candidatos, drafts, riesgos y actividad.",
    icon: "layout-dashboard",
  },
  {
    href: "/admin/autopilot/candidates",
    label: "Candidatos",
    description: "Cola de productos descubiertos por Autopilot.",
    icon: "search",
  },
  {
    href: "/admin/autopilot/review",
    label: "Revision",
    description: "Productos pendientes de decision humana.",
    icon: "clipboard-check",
  },
  {
    href: "/admin/autopilot/drafts",
    label: "Drafts",
    description: "Productos importados como borrador.",
    icon: "file-text",
  },
  {
    href: "/admin/autopilot/runs",
    label: "Ejecuciones",
    description: "Historial de runs, simulaciones y resultados.",
    icon: "history",
  },
  {
    href: "/admin/autopilot/settings",
    label: "Reglas",
    description: "Scoring, margen minimo, categorias y bloqueos.",
    icon: "sliders-horizontal",
  },
  {
    href: "/admin/autopilot/security",
    label: "Seguridad",
    description: "RLS, limites, fixtures y proteccion de publicacion.",
    icon: "shield-check",
  },
];

export const STUDIO_MENU_ITEMS: AdminNavItem[] = [
  {
    href: "/admin/marketplace/products",
    label: "Productos",
    description: "Gestion interna del catalogo.",
    icon: "box",
  },
  {
    href: "/admin/marketplace/orders",
    label: "Pedidos",
    description: "Ordenes y seguimiento interno.",
    icon: "shopping-bag",
  },
  {
    href: "/admin/marketplace/suppliers",
    label: "Proveedores",
    description: "Proveedor, sourcing y cumplimiento.",
    icon: "truck",
  },
];
