import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { register } from "../actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell title="Crear cuenta" subtitle="Tu espacio para guardar pedidos, favoritos y preferencias.">
    {error ? <p className="form-error">{error}</p> : null}
    <AuthForm action={register} mode="register" />
    <p>Ya tenes cuenta? <Link href="/auth/login">Ingresar</Link></p>
  </AuthShell>;
}
