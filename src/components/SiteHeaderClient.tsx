"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/useCart";

const nav = [
  ["RITUALES", "/productos"],
  ["ROSTRO", "/productos?categoria=Cuidado facial"],
  ["CUERPO", "/productos?categoria=Cuidado corporal"],
  ["KITS", "/kits"],
  ["ASESORÍA", "/evaluacion-online"],
] as const;

export default function SiteHeaderClient({
  canAccessStudio,
  isAuthenticated,
}: {
  canAccessStudio: boolean;
  isAuthenticated: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items, loaded } = useCart();
  const cartCount = loaded ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const accountHref = isAuthenticated ? "/account" : "/auth/login";
  const accountLabel = isAuthenticated ? "Mi cuenta" : "Ingresar";

  return (
    <header className="site-header">
      <div className="site-header-shell">
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar navegacion" : "Abrir navegacion"}
          className="header-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <nav aria-label="Navegacion principal" className="header-nav header-nav-desktop">
          {nav.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>

        <Link className="brand-wordmark" href="/">
          VICTORIOSA
          <span>BELLEZA EN CALMA</span>
        </Link>

        <div className="header-actions">
          {canAccessStudio ? (
            <Link className="header-action-chip header-studio-link" href="/admin/autopilot">
              Autopilot
            </Link>
          ) : null}
          <Link className="header-action-chip header-action-secondary" href={accountHref}>
            {accountLabel}
          </Link>
          {isAuthenticated ? (
            <form action="/auth/logout" method="post">
              <button className="header-action-chip" type="submit">Salir</button>
            </form>
          ) : (
            <Link className="header-action-chip" href="/auth/register">Crear cuenta</Link>
          )}
          <Link aria-label="Carrito" className="header-cart-link" href="/carrito">
            <ShoppingCart className="h-4 w-4" />
            <span>Carrito</span>
            {cartCount > 0 ? <strong>{cartCount}</strong> : null}
          </Link>
        </div>
      </div>

      <div className={`header-mobile-panel${menuOpen ? " is-open" : ""}`}>
        <nav aria-label="Navegacion movil" className="header-nav header-nav-mobile">
          {nav.map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href={accountHref} onClick={() => setMenuOpen(false)}>
            {accountLabel}
          </Link>
          {canAccessStudio ? (
            <Link href="/admin/autopilot" onClick={() => setMenuOpen(false)}>
              Victoriosa Studio / Autopilot
            </Link>
          ) : null}
          {!isAuthenticated ? (
            <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
              Crear cuenta
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
