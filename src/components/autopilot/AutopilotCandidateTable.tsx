import Link from "next/link";
import type { AutopilotWebCandidate } from "@/services/autopilot-web-service";

export function AutopilotCandidateTable({
  candidates,
  emptyMessage,
}: {
  candidates: AutopilotWebCandidate[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1240px] text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Producto</th>
            <th className="p-2">Proveedor / fuente</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Recomendacion</th>
            <th className="p-2">Compliance</th>
            <th className="p-2">Blockers</th>
            <th className="p-2">Warnings</th>
            <th className="p-2">Score / risk</th>
            <th className="p-2">Updated / created</th>
            <th className="p-2">Accion</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => {
            return (
              <tr className="border-b align-top" key={candidate.id}>
                <td className="p-2">
                  <strong>{candidate.title}</strong>
                  <div className="mt-1 text-xs text-gray-600">{candidate.category}</div>
                  <div className="mt-2">
                    <Badge tone="neutral">{candidate.draftSafetyLabel}</Badge>
                  </div>
                </td>
                <td className="p-2">
                  <div>{candidate.provider}</div>
                  <div className="mt-1 text-xs text-gray-600">{candidate.sourceUrl ?? "Sin source_url"}</div>
                </td>
                <td className="p-2"><Badge tone="neutral">{candidate.status}</Badge></td>
                <td className="p-2"><Badge tone={candidate.recommendation === "approve_candidate" ? "success" : candidate.recommendation === "reject" ? "danger" : "warning"}>{candidate.recommendation}</Badge></td>
                <td className="p-2"><Badge tone={candidate.complianceDecision === "approve_candidate" ? "success" : candidate.complianceDecision === "reject" ? "danger" : "warning"}>{candidate.complianceDecision}</Badge></td>
                <td className="p-2">
                  <InlineList items={candidate.blockers} emptyLabel="Sin blockers" tone={candidate.blockers.length > 0 ? "danger" : "neutral"} />
                </td>
                <td className="p-2">
                  <InlineList items={candidate.warnings} emptyLabel="Sin warnings" tone={candidate.warnings.length > 0 ? "warning" : "neutral"} />
                </td>
                <td className="p-2">
                  <div><Badge tone="neutral">score {Math.round(candidate.totalScore)}</Badge></div>
                  <div className="mt-2"><Badge tone={candidate.riskScore >= 70 ? "danger" : candidate.riskScore >= 40 ? "warning" : "success"}>risk {Math.round(candidate.riskScore)}</Badge></div>
                </td>
                <td className="p-2">
                  <div>{formatDate(candidate.updatedAt)}</div>
                  <div className="mt-1 text-xs text-gray-600">{formatDate(candidate.createdAt)}</div>
                </td>
                <td className="p-2">
                  <Link className="font-bold underline" href={`/admin/autopilot/candidates/${candidate.id}`}>
                    Ver detalle
                  </Link>
                  <div className="mt-2 text-xs text-gray-600">Sin publicar automaticamente.</div>
                </td>
              </tr>
            );
          })}
          {candidates.length === 0 && (
            <tr>
              <td className="p-4 text-gray-600" colSpan={10}>{emptyMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "border-[#d9cec2] bg-[#f8f3ee] text-[#5a463d]",
    success: "border-[#b8d3c0] bg-[#eff8f1] text-[#2f6f41]",
    warning: "border-[#e7d0a1] bg-[#fff7e4] text-[#8b5f16]",
    danger: "border-[#e0b8b8] bg-[#fff1f1] text-[#8f2d2d]",
  } as const;
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}>{children}</span>;
}

function InlineList({
  items,
  emptyLabel,
  tone,
}: {
  items: string[];
  emptyLabel: string;
  tone: "neutral" | "warning" | "danger";
}) {
  if (items.length === 0) return <span className="text-xs text-gray-500">{emptyLabel}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} tone={tone}>{item}</Badge>
      ))}
    </div>
  );
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}
