import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Victoriosa",
  description: "Belleza, estetica y cuidado personal con seleccion responsable.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es-UY"><body><SiteHeader />{children}</body></html>;
}
