import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type ProspectRow = Database["public"]["Tables"]["connect_centre_prospects"]["Row"];

export const connectCentreService = {
  async list() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("connect_centre_prospects").select("*").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async setConfirmed(id: string, confirmed: boolean, userId: string) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("connect_centre_prospects")
      .update({ confirmed, confirmed_by: confirmed ? userId : null, confirmed_at: confirmed ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },
};
