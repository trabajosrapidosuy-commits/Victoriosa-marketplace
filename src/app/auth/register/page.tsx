import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { register } from "../actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell title="Crear cuenta" subtitle="Tu espacio para guardar pedidos, favoritos y preferencias.">
    {error ? <p className="form-error">{error}</p> : null}
    <div className="auth-social-login">
      <p>También podés crear cuenta con Google:</p>
      <Link className="editorial-button editorial-button-soft" href="/auth/oauth/google" prefetch={false}>Crear cuenta con Google</Link>
    </div>
    <AuthForm action={register} mode="register" />
    <p>Ya tenes cuenta? <Link href="/auth/login">Ingresar</Link></p>
  </AuthShell>;
}
