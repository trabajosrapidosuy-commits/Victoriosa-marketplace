import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { resetPassword } from "../actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell title="Nueva clave" subtitle="Elegi una clave de al menos ocho caracteres.">
    {error ? <p className="form-error">{error}</p> : null}
    <AuthForm action={resetPassword} mode="reset" />
  </AuthShell>;
}
