import { createManualCandidateAction } from "../actions";

export default function ManualAutopilotImportPage() {
  return (
    <main className="card">
      <h2 className="text-xl font-bold">Carga manual supplier-agnostic</h2>
      <p className="mt-2 text-sm">Crea candidatos privados para revision. Nunca publica productos.</p>
      <form action={createManualCandidateAction} className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <label>Titulo<input className="mt-1 w-full rounded border p-2" name="title" required /></label>
        <label>Categoria<input className="mt-1 w-full rounded border p-2" name="category" defaultValue="Beauty" required /></label>
        <label className="md:col-span-2">Descripcion<textarea className="mt-1 w-full rounded border p-2" name="description" required /></label>
        <label>Imagen URL<input className="mt-1 w-full rounded border p-2" name="imageUrl" type="url" /></label>
        <label>URL origen<input className="mt-1 w-full rounded border p-2" name="sourceUrl" type="url" /></label>
        <label>Precio compra USD<input className="mt-1 w-full rounded border p-2" min="0" name="buyPrice" step="0.01" type="number" required /></label>
        <label>Envio USD<input className="mt-1 w-full rounded border p-2" defaultValue="0" min="0" name="shippingCost" step="0.01" type="number" /></label>
        <label>Inventario<input className="mt-1 w-full rounded border p-2" defaultValue="0" min="0" name="inventoryTotal" type="number" /></label>
        <label>Inventario verificado<input className="mt-1 w-full rounded border p-2" defaultValue="0" min="0" name="verifiedInventory" type="number" /></label>
        <button className="btn md:col-span-2" type="submit">Crear candidato para revision</button>
      </form>
    </main>
  );
}
