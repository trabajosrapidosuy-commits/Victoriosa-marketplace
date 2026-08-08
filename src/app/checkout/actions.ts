"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/require-user";
import { createManualOrder } from "@/services/manual-commerce-service";

export async function submitManualOrder(formData: FormData) {
  const { supabase, user } = await requireUser();
  const rawItems = String(formData.get("items") ?? "[]");
  let items: unknown;
  try { items = JSON.parse(rawItems); } catch { redirect("/checkout?error=Carrito invalido"); }
  try {
    const id = await createManualOrder(supabase, user.id, { items, customerNotes: String(formData.get("customerNotes") ?? "") });
    redirect(`/account/orders/${id}?message=Solicitud recibida. Te contactaremos para confirmar disponibilidad.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo registrar la solicitud";
    redirect(`/checkout?error=${encodeURIComponent(message)}`);
  }
}
