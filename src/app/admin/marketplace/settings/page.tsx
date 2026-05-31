export default function AdminPage() {
  return (
    <main className="container-page">
      <section className="card">
        <span className="badge">ADMIN_DEMO_MODE - proteger con Auth/RLS antes de produccion</span>
        <h1>Configuracion marketplace</h1>
        <p>Margen minimo, monedas, flags, WhatsApp, pagos sandbox y politica comercial.</p>
        <ul>
          <li>No publicar automaticamente.</li>
          <li>No activar pagos live.</li>
          <li>Todo producto importado entra en needs_review.</li>
          <li>Productos high_risk requieren revision explicita.</li>
        </ul>
      </section>
    </main>
  );
}
