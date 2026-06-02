import Link from "next/link";

const modules = [
  ["/admin/autopilot", "Autopilot", "Discovery, scoring y borradores con revision humana."],
  ["/admin/marketplace/products/review", "Cola de revision", "Aprobar o rechazar productos antes de cualquier publicacion."],
  ["/admin/marketplace/products/import", "Importar drafts", "Ingresar catalogos controlados sin publicacion automatica."],
  ["/admin/marketplace/orders", "Pedidos", "Consultar ordenes y tareas manuales de fulfillment."],
];

export default function AdminDashboard() {
  return (
    <section className="studio-content">
      <p className="studio-kicker">VICTORIOSA STUDIO</p>
      <h2>Panel privado del propietario</h2>
      <p className="studio-lead">Gestion interna separada de la experiencia de compra. Toda automatizacion permanece sujeta a revision humana.</p>
      <div className="studio-grid">
        {modules.map(([href, title, description]) => (
          <Link className="studio-card" href={href} key={href}>
            <strong>{title}</strong>
            <span>{description}</span>
          </Link>
        ))}
      </div>
      <div className="studio-notice">NO-GO_PRODUCTION: pagos, publicacion automatica y acciones de proveedores permanecen deshabilitados.</div>
    </section>
  );
}
