import Link from "next/link";

export const metadata = {
  title: "Consentimiento de acceso | Victoriosa",
  description: "Informacion sobre el uso de datos al iniciar sesion en Victoriosa.",
};

export default function OAuthConsentPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-800">Victoriosa</p>
      <h1 className="mt-3 text-3xl font-bold">Consentimiento de acceso</h1>
      <p className="mt-4 text-sm leading-7 text-gray-700">
        Victoriosa puede solicitar datos basicos de tu cuenta para crear o
        recuperar tu perfil cuando el inicio de sesion externo sea habilitado.
      </p>
      <section className="mt-8 space-y-3 text-sm leading-7 text-gray-700">
        <h2 className="text-xl font-bold text-gray-950">Datos utilizados</h2>
        <p>Nombre, direccion de email e identificador de cuenta.</p>
        <h2 className="pt-3 text-xl font-bold text-gray-950">Finalidad</h2>
        <p>Autenticacion, acceso a tu cuenta y preferencias de Victoriosa.</p>
        <h2 className="pt-3 text-xl font-bold text-gray-950">Control</h2>
        <p>
          El acceso externo permanece inactivo hasta completar la revision
          correspondiente. Cuando este disponible, podras revocar el permiso
          desde tu proveedor de identidad.
        </p>
      </section>
      <Link className="btn mt-8 inline-flex" href="/">Volver al inicio</Link>
    </main>
  );
}
