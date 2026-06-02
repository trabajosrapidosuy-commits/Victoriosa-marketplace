export default function EvaluationPage() {
  return (
    <main className="container-page">
      <section className="card">
        <h1>Evaluacion online Victoriosa</h1>
        <p>Contanos que estas buscando. Esta orientacion inicial no reemplaza una consulta profesional presencial.</p>
        <form style={{ display: "grid", gap: 12, maxWidth: 680 }}>
          {["Nombre", "Email o WhatsApp", "Tipo de piel", "Objetivo", "Presupuesto", "Sensibilidad", "Rutina actual", "Productos que preferis evitar"].map((label) => (
            <label key={label}>{label}<input style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e8c6be" }} /></label>
          ))}
          <button className="btn" type="button">Enviar consulta</button>
        </form>
      </section>
    </main>
  );
}
