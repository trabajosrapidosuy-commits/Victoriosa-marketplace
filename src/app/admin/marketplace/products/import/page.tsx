"use client";

import { useState } from "react";

const examplePayload = {
  sourceType: "manual",
  supplier: { name: "Proveedor manual a revisar", type: "manual" },
  rows: [{
    title: "Producto controlado de ejemplo",
    category: "Cuidado facial",
    cost_price: 10,
    shipping_cost: 2,
    target_margin_percent: 55,
    source_url: "https://example.invalid/producto-controlado",
    allows_image_use: false,
    allows_resale: false,
  }],
};

export default function ImportProductsPage() {
  const [payload, setPayload] = useState(JSON.stringify(examplePayload, null, 2));
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setResult("");
    try {
      const response = await fetch("/api/admin/marketplace/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      setResult(JSON.stringify(await response.json(), null, 2));
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page">
      <section className="card">
        <span className="badge">ADMIN ONLY - persistent review workflow</span>
        <h1>Importar productos</h1>
        <p>Importa JSON controlado. Todo producto queda en draft + needs_review y entra en cola de revision.</p>
        <textarea aria-label="Payload JSON" style={{ width: "100%", minHeight: 320 }} value={payload} onChange={(event) => setPayload(event.target.value)} />
        <button className="btn" disabled={loading} onClick={submit} type="button">
          {loading ? "Importando..." : "Crear import auditable"}
        </button>
        {result ? <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{result}</pre> : null}
      </section>
    </main>
  );
}
