import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { generateCommercialDraft } from "@/services/autopilot-marketing-service";
import { getPersistentCandidate } from "@/services/autopilot-persistence-service";
import { approveProductCandidateAction, generateAiDraftForCandidateAction, importCandidateToDraftProductAction, markProductCandidateNeedsReviewAction, rejectProductCandidateAction } from "../../actions";

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const row = await getPersistentCandidate(supabase, id).catch(() => null);
  if (!row) notFound();
  const candidate = {
    ...row,
    supplierCost: Number(row.supplier_cost),
    shippingCost: Number(row.estimated_shipping_cost),
    suggestedSalePrice: Number(row.suggested_price),
    estimatedMarginPercent: Number(row.margin_percent),
    riskFlags: row.risk_flags ?? [],
  };
  const draft = generateCommercialDraft({
    id: candidate.id, connectorId: candidate.connector_id ?? "mock", supplierName: candidate.supplier_name,
    title: candidate.title, description: candidate.description ?? "", category: candidate.category ?? "Sin categoria",
    sourceUrl: candidate.source_url ?? "", supplierCost: candidate.supplierCost, shippingCost: candidate.shippingCost,
    currency: candidate.currency === "UYU" ? "UYU" : "USD", estimatedDeliveryDays: Number(candidate.raw_payload?.estimatedDeliveryDays ?? 0),
    suggestedSalePrice: candidate.suggestedSalePrice, estimatedMarginPercent: candidate.estimatedMarginPercent,
    score: candidate.scoring, riskFlags: candidate.riskFlags, status: candidate.status,
  });

  return (
    <main className="space-y-5">
      <section className="card">
        <span className="badge">{candidate.review_status}</span>
        <h2 className="mt-3 text-2xl font-bold">{candidate.title}</h2>
        <p className="mt-2">{candidate.description}</p>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <Info label="Proveedor" value={candidate.supplier_name} />
          <Info label="Categoria" value={candidate.category} />
          <Info label="Entrega estimada" value={`${Number(candidate.raw_payload?.estimatedDeliveryDays ?? 0)} dias`} />
          <Info label="Costo total" value={`USD ${(candidate.supplierCost + candidate.shippingCost).toFixed(2)}`} />
          <Info label="Precio sugerido" value={`USD ${candidate.suggestedSalePrice.toFixed(2)}`} />
          <Info label="Margen estimado" value={`${candidate.estimatedMarginPercent.toFixed(1)}%`} />
        </dl>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        <div className="card"><h3 className="font-bold">Scoring explicable</h3><ul className="mt-3 list-disc pl-5 text-sm">{candidate.scoring.explanation.map((line: string) => <li key={line}>{line}</li>)}</ul></div>
        <div className="card"><h3 className="font-bold">Riesgos detectados</h3><p className="mt-3 text-sm">{candidate.riskFlags.join(", ") || "Sin alertas automaticas. Requiere revision humana igualmente."}</p></div>
      </section>
      <section className="grid gap-5 md:grid-cols-2">
        <ListCard title="Fortalezas" values={candidate.strengths ?? []} />
        <ListCard title="Debilidades" values={candidate.weaknesses ?? []} />
      </section>
      <section className="card">
        <h3 className="font-bold">Acciones controladas</h3>
        <p className="mt-2 text-sm">Estas acciones persisten cambios admin-only. Publicar automaticamente permanece prohibido.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ActionForm action={approveProductCandidateAction} id={candidate.id} label="Aprobar para draft" />
          <ActionForm action={markProductCandidateNeedsReviewAction} id={candidate.id} label="Marcar needs review" />
          <ActionForm action={generateAiDraftForCandidateAction} id={candidate.id} label="Generar ficha local" />
          <ActionForm action={importCandidateToDraftProductAction} id={candidate.id} label="Importar como draft" />
          <form action={rejectProductCandidateAction} className="flex gap-2">
            <input name="id" type="hidden" value={candidate.id} />
            <input className="rounded border p-2 text-sm" name="reason" minLength={3} placeholder="Motivo rechazo" required />
            <button className="btn btn-secondary" type="submit">Rechazar</button>
          </form>
        </div>
      </section>
      <section className="card">
        <h3 className="font-bold">Borrador comercial local</h3>
        <p className="mt-2 text-lg font-bold">{draft.title}</p>
        <p className="mt-1 text-sm">{draft.subtitle}</p>
        <h4 className="mt-4 font-bold">Email draft</h4>
        <p className="mt-1 text-sm"><strong>Asunto:</strong> {draft.emailSubject}</p>
        <p className="mt-1 text-sm">{draft.emailBody}</p>
        <p className="mt-3 text-sm font-bold">{draft.safetyNotice}</p>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-bold">{label}</dt><dd>{value}</dd></div>;
}

function ListCard({ title, values }: { title: string; values: string[] }) {
  return <div className="card"><h3 className="font-bold">{title}</h3><ul className="mt-3 list-disc pl-5 text-sm">{values.map((value) => <li key={value}>{value}</li>)}{values.length === 0 && <li>Sin observaciones automaticas.</li>}</ul></div>;
}

function ActionForm({ action, id, label }: { action: (formData: FormData) => Promise<void>; id: string; label: string }) {
  return <form action={action}><input name="id" type="hidden" value={id} /><button className="btn btn-secondary" type="submit">{label}</button></form>;
}
