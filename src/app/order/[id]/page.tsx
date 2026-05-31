export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="container-page">
      <section className="card">
        <h1>Orden {id}</h1>
        <p>Estado, tracking y soporte se conectan a marketplace_orders y marketplace_order_items.</p>
      </section>
    </main>
  );
}
