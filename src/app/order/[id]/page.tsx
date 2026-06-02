import Link from "next/link";

export default function OrderPage() {
  return (
    <main className="container-page">
      <section className="card">
        <h1>Seguimiento de orden proximamente</h1>
        <p>
          Estamos preparando el seguimiento seguro de compras. Todavia no
          procesamos pedidos ni pagos online.
        </p>
        <Link className="btn mt-4 inline-flex" href="/evaluacion-online">
          Agendar evaluacion
        </Link>
      </section>
    </main>
  );
}
