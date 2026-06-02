import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Victoriosa Marketplace",
  description: "Marketplace propio de belleza, cuidado facial, corporal, kits y productos seleccionados con curaduria y seguimiento.",
};

const nav = [
  ["Inicio", "/"],
  ["Productos", "/productos"],
  ["Kits", "/kits"],
  ["Evaluacion online", "/evaluacion-online"],
  ["Contacto", "/evaluacion-online"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY">
      <body>
        <header className="container-page" style={{ paddingBottom: 0 }}>
          <nav className="card" style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 24 }}>Victoriosa</strong>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
