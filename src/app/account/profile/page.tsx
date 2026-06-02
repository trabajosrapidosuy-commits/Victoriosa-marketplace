import { requireUser } from "@/lib/supabase/require-user";
import { saveProfile } from "../actions";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("marketplace_profiles").select("full_name,phone,country,city,preferred_currency,marketing_opt_in").eq("id", user.id).maybeSingle();
  const { error, message } = await searchParams;
  return <section className="account-content card"><h1>Mi perfil</h1>
    {message ? <p className="form-success">{message}</p> : null}{error ? <p className="form-error">{error}</p> : null}
    <form action={saveProfile} className="account-form">
      <label>Email<input disabled value={user.email ?? ""} /></label>
      <label>Nombre completo<input defaultValue={data?.full_name ?? ""} name="full_name" /></label>
      <label>Telefono<input defaultValue={data?.phone ?? ""} name="phone" /></label>
      <label>Pais<input defaultValue={data?.country ?? ""} name="country" /></label>
      <label>Ciudad<input defaultValue={data?.city ?? ""} name="city" /></label>
      <label>Moneda<select defaultValue={data?.preferred_currency ?? "UYU"} name="preferred_currency"><option>UYU</option><option>USD</option></select></label>
      <label className="check-row"><input defaultChecked={data?.marketing_opt_in ?? false} name="marketing_opt_in" type="checkbox" /> Recibir novedades Victoriosa</label>
      <button className="editorial-button" type="submit">Guardar perfil</button>
    </form>
  </section>;
}
