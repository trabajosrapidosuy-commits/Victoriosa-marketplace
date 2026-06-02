import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { forgotPassword } from "../actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell title="Recuperar clave" subtitle="Te enviaremos un enlace seguro para elegir una nueva clave.">
    {error ? <p className="form-error">{error}</p> : null}
    <AuthForm action={forgotPassword} mode="forgot" />
  </AuthShell>;
}
