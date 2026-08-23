"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateNameSchema } from "../schemas/profile-schema";
import { requireUser } from "@/features/auth/utils/require-role";

export interface ProfileActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

/** Users can only rename themselves — RLS's profiles_update_self_name
 *  policy from migration 0001 enforces this can't touch role/is_active,
 *  even if someone tampered with the request. */
export async function updateNameAction(_prev: ProfileActionState, formData: FormData): Promise<ProfileActionState & { success?: boolean }> {
  const user = await requireUser();
  const parsed = updateNameSchema.safeParse({ full_name: str(formData, "full_name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input.", fieldErrors: { full_name: parsed.error.issues[0]?.message ?? "" } };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data.full_name }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { error: null, success: true };
}
