import Link from "next/link";

export const metadata = {
  title: "Privacidad | Victoriosa",
  description: "Politica de privacidad de Victoriosa.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800">Victoriosa</p>
      <h1 className="mt-3 text-3xl font-bold">Politica de privacidad</h1>
      <p className="mt-4 text-sm leading-7 text-gray-700">
        Victoriosa utiliza los datos necesarios para gestionar tu cuenta,
        preferencias y solicitudes. No vendemos datos personales.
      </p>
      <section className="mt-8 space-y-4 text-sm leading-7 text-gray-700">
        <h2 className="text-xl font-bold text-gray-950">Datos de cuenta</h2>
        <p>Podemos procesar nombre, email, identificador de cuenta y preferencias.</p>
        <h2 className="text-xl font-bold text-gray-950">Finalidad</h2>
        <p>Usamos estos datos para autenticarte, responder solicitudes y operar funciones habilitadas de Victoriosa.</p>
        <h2 className="text-xl font-bold text-gray-950">Funciones no activas</h2>
        <p>Pagos en vivo, compras automáticas a proveedores y publicación autónoma permanecen deshabilitados.</p>
        <h2 className="text-xl font-bold text-gray-950">Tus opciones</h2>
        <p>Podes solicitar revisión o eliminación de tus datos por los canales oficiales publicados por Victoriosa.</p>
      </section>
      <div className="mt-8 flex gap-4 text-sm"><Link className="underline" href="/">Inicio</Link><Link className="underline" href="/terms">Terminos</Link></div>
    </main>
  );
}
