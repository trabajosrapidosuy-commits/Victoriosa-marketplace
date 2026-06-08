import AuthForm from "@/components/AuthForm";
import AuthShell from "@/components/AuthShell";
import { redirect } from "next/navigation";
import { resetPassword } from "../actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code, error } = await searchParams;
  if (code) {
    const callbackParams = new URLSearchParams({
      code,
      next: "/auth/reset-password",
    });
    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  return <AuthShell title="Nueva clave" subtitle="Elegi una clave de al menos ocho caracteres.">
    {error ? <p className="form-error">{error}</p> : null}
    <AuthForm action={resetPassword} mode="reset" />
  </AuthShell>;
}
