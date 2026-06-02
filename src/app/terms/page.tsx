import Link from "next/link";

export const metadata = {
  title: "Terminos | Victoriosa",
  description: "Terminos de uso de Victoriosa.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800">Victoriosa</p>
      <h1 className="mt-3 text-3xl font-bold">Terminos de uso</h1>
      <p className="mt-4 text-sm leading-7 text-gray-700">
        Al utilizar Victoriosa aceptas usar la plataforma de forma lícita y
        proporcionar información correcta para gestionar tu cuenta.
      </p>
      <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700">
        <h2 className="text-xl font-bold text-gray-950">Estado actual</h2>
        <p>La plataforma se encuentra en etapa controlada de preparación y revisión humana.</p>
        <h2 className="text-xl font-bold text-gray-950">Compras y disponibilidad</h2>
        <p>Los productos, precios, entrega y disponibilidad deben confirmarse antes de cualquier compra habilitada.</p>
        <h2 className="text-xl font-bold text-gray-950">Automatización</h2>
        <p>No se realizan pagos, compras a proveedores ni publicaciones automáticas de productos sin controles aprobados.</p>
        <h2 className="text-xl font-bold text-gray-950">Cambios</h2>
        <p>Estos términos podrán actualizarse antes de una apertura pública. La versión vigente será la publicada en este dominio.</p>
      </section>
      <div className="mt-8 flex gap-4 text-sm"><Link className="underline" href="/">Inicio</Link><Link className="underline" href="/privacy">Privacidad</Link></div>
    </main>
  );
}
