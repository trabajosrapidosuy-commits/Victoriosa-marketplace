"use client";

import { useEffect, useState } from "react";

interface ReviewRow {
  id: string;
  status: string;
  notes?: string | null;
  marketplace_products?: { title?: string; publication_status?: string; compliance_status?: string; risk_level?: string } | null;
}

export default function ReviewQueuePage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/marketplace/reviews");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not load review queue");
    setReviews(payload.reviews ?? []);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load review queue"));
  }, []);

  async function update(id: string, status: "approved" | "rejected" | "needs_changes") {
    const response = await fetch("/api/admin/marketplace/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes: `Admin review updated to ${status}` }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Review update failed");
      return;
    }
    setMessage(`Review updated to ${status}. Product remains unpublished.`);
    await load();
  }

  return (
    <main className="container-page">
      <section className="card">
        <span className="badge">ADMIN ONLY - publication remains manual and disabled</span>
        <h1>Cola de revision</h1>
        <p>Approve actualiza compliance, pero mantiene publication_status=draft. Reject conserva trazabilidad.</p>
        {message ? <p>{message}</p> : null}
        {reviews.length === 0 ? <p>No hay productos pendientes.</p> : reviews.map((review) => (
          <article className="card" key={review.id} style={{ marginTop: 12 }}>
            <h2>{review.marketplace_products?.title ?? "Producto sin titulo"}</h2>
            <p>
              Review: {review.status} | Publicacion: {review.marketplace_products?.publication_status ?? "unknown"} |
              Compliance: {review.marketplace_products?.compliance_status ?? "unknown"} |
              Riesgo: {review.marketplace_products?.risk_level ?? "unknown"}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn" onClick={() => update(review.id, "approved")} type="button">Aprobar compliance</button>
              <button className="btn btn-secondary" onClick={() => update(review.id, "needs_changes")} type="button">Pedir cambios</button>
              <button className="btn btn-secondary" onClick={() => update(review.id, "rejected")} type="button">Rechazar</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
