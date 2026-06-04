import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return <AuthShell title="Ingresar" subtitle="Accede a tus favoritos, consultas y recomendaciones.">
    {message ? <p className="form-success">{message}</p> : null}
    {error ? <p className="form-error">{error}</p> : null}
    <div className="auth-social-login">
      <p>O ingresá con tu cuenta de Google:</p>
      <Link className="editorial-button editorial-button-soft" href="/auth/oauth/google">Ingresar con Google</Link>
    </div>
    <AuthForm action={login} mode="login" />
    <p><Link href="/auth/forgot-password">Olvide mi clave</Link></p>
    <p>Todavia no tenes cuenta? <Link href="/auth/register">Crear cuenta</Link></p>
  </AuthShell>;
}
