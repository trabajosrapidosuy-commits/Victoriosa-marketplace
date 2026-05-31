export default function EvaluationPage() {
  return (
    <main className="container-page">
      <section className="card">
        <h1>Evaluacion online Victoriosa</h1>
        <p>La evaluacion online no reemplaza una consulta profesional presencial. Sirve para orientar el primer contacto y recomendar una rutina responsable.</p>
        <form style={{ display: "grid", gap: 12, maxWidth: 680 }}>
          {['Nombre','Email o WhatsApp','Tipo de piel','Objetivo','Presupuesto','Sensibilidad','Rutina actual','Productos que no quiere usar'].map((label) => (
            <label key={label}>{label}<input style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #e8c6be' }} /></label>
          ))}
          <button className="btn" type="button">Crear beauty_consultation demo</button>
        </form>
      </section>
    </main>
  );
}
