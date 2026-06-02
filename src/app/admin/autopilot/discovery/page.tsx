import { runProductDiscoveryAction } from "../actions";

export default function DiscoveryPage() {
  return (
    <main className="space-y-5">
      <section className="card">
        <h2 className="text-xl font-bold">Product discovery sandbox</h2>
        <p className="mt-2 text-sm text-gray-700">
          Ejecuta discovery persistente con proveedor mock. Cada resultado queda en revision humana obligatoria.
        </p>
        <form action={runProductDiscoveryAction} className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <label>Conector<select className="mt-1 w-full rounded border p-2" name="connectorId" defaultValue="mock"><option value="mock">Mock Connector</option><option value="cj">CJdropshipping (needs_credentials)</option></select></label>
          <label>Mercado<select className="mt-1 w-full rounded border p-2" name="targetMarket" defaultValue="Uruguay"><option>Uruguay</option><option>LATAM</option><option>global</option></select></label>
          <label>Categoria<input className="mt-1 w-full rounded border p-2" name="category" placeholder="Opcional" /></label>
          <label>Palabra clave<input className="mt-1 w-full rounded border p-2" name="keyword" placeholder="Opcional" /></label>
          <label>Margen minimo<input className="mt-1 w-full rounded border p-2" name="minimumMarginPercent" type="number" defaultValue="25" /></label>
          <label>Envio maximo dias<input className="mt-1 w-full rounded border p-2" name="maximumShippingDays" type="number" defaultValue="30" /></label>
          <label>Resultados maximos<input className="mt-1 w-full rounded border p-2" name="maximumResults" type="number" defaultValue="10" /></label>
          <button className="btn self-end" type="submit">Run Discovery</button>
        </form>
      </section>
      <section className="card">
        <h2 className="text-xl font-bold">Filtros preparados</h2>
        <p className="mt-2 text-sm">
          El servicio acepta categoria, palabra clave, margen minimo, costo maximo proveedor, mercado objetivo, envio maximo y limite de resultados.
        </p>
        <p className="mt-3 text-sm font-bold">Conectores reales siguen bloqueados hasta cargar credenciales aprobadas de forma segura.</p>
      </section>
    </main>
  );
}
