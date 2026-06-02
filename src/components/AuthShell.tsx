import Link from "next/link";

export default function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">TU CUENTA VICTORIOSA</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
        <Link className="editorial-link" href="/">Volver al inicio</Link>
      </section>
    </main>
  );
}
