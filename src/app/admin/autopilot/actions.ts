"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase/require-admin";
import {
  approvePersistentCandidate,
  generatePersistentAiDraft,
  importPersistentCandidateToDraft,
  rejectPersistentCandidate,
  runPersistentProductDiscovery,
} from "@/services/autopilot-persistence-service";

export async function runProductDiscoveryAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  await runPersistentProductDiscovery(supabase, user.id, Object.fromEntries(formData));
  revalidatePath("/admin/autopilot");
  redirect("/admin/autopilot/candidates");
}

export async function approveProductCandidateAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await approvePersistentCandidate(supabase, id);
  revalidatePath(`/admin/autopilot/candidates/${id}`);
}

export async function rejectProductCandidateAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await rejectPersistentCandidate(supabase, id, String(formData.get("reason") ?? ""));
  revalidatePath(`/admin/autopilot/candidates/${id}`);
}

export async function generateAiDraftForCandidateAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await generatePersistentAiDraft(supabase, id);
  revalidatePath(`/admin/autopilot/candidates/${id}`);
}

export async function importCandidateToDraftProductAction(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await importPersistentCandidateToDraft(supabase, id, user.id);
  revalidatePath(`/admin/autopilot/candidates/${id}`);
}
