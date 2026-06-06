import { AUTOPILOT_MODE_FLAGS } from "@/lib/autopilot/config";

export function AutopilotSafetyBanner() {
  return (
    <section className="rounded-[28px] border border-[#d5b394] bg-[#fff6e9] p-5 text-[#6c4d34]">
      <p className="text-xs font-bold uppercase tracking-[0.24em]">Autopilot seguro</p>
      <h2 className="mt-2 text-2xl font-semibold text-[#3a2a27]">Autopilot esta en modo revision humana.</h2>
      <p className="mt-2 text-sm leading-6">
        Ningun producto se publica automaticamente. Los conectores live, pagos y acciones con proveedores permanecen apagados.
      </p>
      <p className="mt-2 text-sm leading-6 font-medium">
        No publicar como representante oficial hasta tener autorizacion escrita de la marca y validacion sanitaria/importacion correspondiente.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
        <span className="rounded-full border border-[#d5b394] px-3 py-2">Publicacion automatica: {AUTOPILOT_MODE_FLAGS.autoPublish}</span>
        <span className="rounded-full border border-[#d5b394] px-3 py-2">Proveedores live: {AUTOPILOT_MODE_FLAGS.liveProviders}</span>
        <span className="rounded-full border border-[#d5b394] px-3 py-2">Revision humana: {AUTOPILOT_MODE_FLAGS.humanReview}</span>
        <span className="rounded-full border border-[#d5b394] px-3 py-2">RLS: {AUTOPILOT_MODE_FLAGS.rls}</span>
      </div>
    </section>
  );
}
