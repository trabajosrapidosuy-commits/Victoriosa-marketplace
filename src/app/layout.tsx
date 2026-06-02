import type { Metadata } from "next";
import { headers } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Victoriosa",
  description: "Belleza, estetica y cuidado personal con seleccion responsable.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const isPrivateControlSurface = headerStore.get("x-victoriosa-private-surface") === "true";
  return <html lang="es-UY"><body>{isPrivateControlSurface ? null : <SiteHeader />}{children}</body></html>;
}
