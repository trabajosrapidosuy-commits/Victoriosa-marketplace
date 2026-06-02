import { requireUser } from "@/lib/supabase/require-user";
import { saveSettings } from "../actions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle();
  const { error, message } = await searchParams;
  return <section className="account-content card"><h1>Preferencias</h1>
    {message ? <p className="form-success">{message}</p> : null}{error ? <p className="form-error">{error}</p> : null}
    <form action={saveSettings} className="account-form">
      <label>Idioma<select defaultValue={data?.language ?? "es"} name="language"><option value="es">Espanol</option><option value="en">English</option><option value="pt">Portugues</option></select></label>
      <label>Tema<select defaultValue={data?.theme ?? "system"} name="theme"><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Oscuro</option></select></label>
      <label className="check-row"><input defaultChecked={data?.email_notifications ?? true} name="email_notifications" type="checkbox" /> Notificaciones por email</label>
      <label className="check-row"><input defaultChecked={data?.product_recommendations ?? true} name="product_recommendations" type="checkbox" /> Recomendaciones personalizadas</label>
      <label className="check-row"><input defaultChecked={data?.autopilot_suggestions ?? true} name="autopilot_suggestions" type="checkbox" /> Sugerencias de productos</label>
      <button className="editorial-button" type="submit">Guardar preferencias</button>
    </form>
    <p className="demo-notice">Google OAuth proximamente. La arquitectura queda preparada sin activarlo todavia.</p>
  </section>;
}
