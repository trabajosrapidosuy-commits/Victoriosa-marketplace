import { AUTOPILOT_FLAGS } from "@/lib/autopilot/config";
import type { AIDraft, ProductCandidate } from "@/types/autopilot";

export interface CommercialDraft extends AIDraft {
  generationMode: "mock-safe";
}

export function generateCommercialDraft(candidate: ProductCandidate): CommercialDraft {
  const generationMode = AUTOPILOT_FLAGS.aiEnabled ? "mock-safe" : "mock-safe";
  const safeTitle = candidate.riskFlags.length === 0
    ? candidate.title
    : `[NO PUBLICAR] ${candidate.title}`;
  return {
    generationMode,
    title: safeTitle,
    subtitle: `Una opcion seleccionada para ${candidate.category.toLowerCase()} con revision Victoriosa pendiente.`,
    benefits: [
      "Ficha clara para evaluar encaje con la marca.",
      "Precio sugerido calculado desde costo y envio.",
      "Contenido preparado para revision comercial humana.",
    ],
    socialCaption: `${safeTitle}. Una propuesta Victoriosa para sumar a tu rutina. Disponible proximamente, sujeto a revision final.`,
    whatsappText: `Hola. Estamos evaluando ${safeTitle} para Victoriosa. Responde si te interesa recibir novedades cuando este aprobado.`,
    emailSubject: `Novedad Victoriosa en evaluacion: ${safeTitle}`,
    emailPreview: "Conoce una oportunidad de producto antes de su posible lanzamiento.",
    emailBody: `Estamos evaluando ${safeTitle} para incorporarlo al catalogo Victoriosa. Queremos ofrecer una opcion clara, confiable y con informacion revisada. Si deseas recibir novedades, conserva tu suscripcion activa.`,
    safetyNotice: candidate.riskFlags.length === 0
      ? "BORRADOR_NO_ENVIAR: requiere revision humana, opt-in verificable y proveedor email configurado."
      : `BLOQUEADO_NO_ENVIAR: revisar alertas ${candidate.riskFlags.join(", ")}.`,
  };
}
