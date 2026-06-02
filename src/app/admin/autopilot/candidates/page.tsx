import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { listPersistentCandidates } from "@/services/autopilot-persistence-service";

export default async function CandidatesPage() {
  const { supabase } = await requireAdmin();
  const candidates = await listPersistentCandidates(supabase);
  return (
    <main className="card overflow-x-auto">
      <h2 className="text-xl font-bold">Candidatos persistidos</h2>
      <p className="mt-2 text-sm">Ningun candidato puede publicarse sin revision humana.</p>
      <table className="mt-4 w-full min-w-[980px] text-left text-sm">
        <thead><tr className="border-b"><th className="p-2">Producto</th><th className="p-2">Costo</th><th className="p-2">Shipping</th><th className="p-2">Precio sugerido</th><th className="p-2">Margen</th><th className="p-2">Score</th><th className="p-2">Estado</th><th className="p-2">Accion</th></tr></thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr className="border-b align-top" key={candidate.id}>
              <td className="p-2"><strong>{candidate.title}</strong><br /><span className="text-gray-600">{candidate.category}</span></td>
              <td className="p-2">USD {Number(candidate.supplier_cost).toFixed(2)}</td>
              <td className="p-2">USD {Number(candidate.estimated_shipping_cost).toFixed(2)}</td>
              <td className="p-2">USD {Number(candidate.suggested_price).toFixed(2)}</td>
              <td className="p-2">{Number(candidate.margin_percent).toFixed(1)}%</td>
              <td className="p-2 font-bold">{candidate.total_score}</td>
              <td className="p-2"><span className="badge">{candidate.review_status}</span></td>
              <td className="p-2"><Link className="font-bold underline" href={`/admin/autopilot/candidates/${candidate.id}`}>Ver detalle</Link></td>
            </tr>
          ))}
          {candidates.length === 0 && <tr><td className="p-4 text-gray-600" colSpan={8}>No hay candidatos persistidos. Ejecuta Discovery para crear la primera cola.</td></tr>}
        </tbody>
      </table>
    </main>
  );
}
