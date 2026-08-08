import { submitConsultation } from "./actions";

export default async function EvaluationPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const fields = [["name", "Nombre"], ["email", "Email"], ["contact", "Email o WhatsApp"], ["skinType", "Tipo de piel"], ["goal", "Objetivo"], ["budget", "Presupuesto"], ["sensitivity", "Sensibilidad"], ["routine", "Rutina actual"], ["avoid", "Productos que preferís evitar"]] as const;
  return <main className="container-page"><section className="card"><h1>Evaluación online Victoriosa</h1><p>Contanos qué estás buscando. Esta orientación inicial no reemplaza una consulta profesional presencial.</p>{params.error ? <p className="demo-notice">{params.error}</p> : null}{params.message ? <p className="demo-notice">{params.message}</p> : null}<form action={submitConsultation} className="mt-4 grid gap-3" style={{ maxWidth: 680 }}>{fields.map(([name, label]) => <label key={name}>{label}<input className="mt-1 w-full rounded border p-2" name={name} required={name === "name" || name === "contact" || name === "goal"} /></label>)}<button className="btn" type="submit">Enviar consulta</button></form></section></main>;
}
