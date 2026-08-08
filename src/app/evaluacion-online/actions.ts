"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const consultationSchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.string().trim().email().optional().or(z.literal("")),
  contact: z.string().trim().min(3).max(160), skinType: z.string().trim().max(100), goal: z.string().trim().min(3).max(500),
  budget: z.string().trim().max(100), sensitivity: z.string().trim().max(500), routine: z.string().trim().max(1000), avoid: z.string().trim().max(1000),
});

export async function submitConsultation(formData: FormData) {
  const values = Object.fromEntries(formData);
  try {
    const input = consultationSchema.parse(values);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("beauty_consultations").insert({
      user_id: user?.id ?? null, name: input.name, email: input.email || null, skin_type: input.skinType || null,
      budget_range: input.budget || null, routine_goal: input.goal, status: "submitted",
      answers: { contact: input.contact, sensitivity: input.sensitivity, routine: input.routine, avoid: input.avoid },
    });
    if (error) throw new Error(error.message);
    redirect("/evaluacion-online?message=Consulta enviada. Te responderemos para continuar.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar la consulta";
    redirect(`/evaluacion-online?error=${encodeURIComponent(message)}`);
  }
}
