import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type EnvoysVisitorRow = Database["public"]["Tables"]["envoys_visitors"]["Row"];

export const envoysVisitorsService = {
  async list() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("envoys_visitors").select("*").order("moved_at", { ascending: false }).limit(3000);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  /** Restoring clears their overview so PipelineOverviewDialog treats
   *  them as needing a fresh recommendation, and marks restored_at on
   *  the archive row for the audit trail (row itself stays, per V1's
   *  "kept for reference, export, or restoration"). */
  async restore(id: string, originalFirstTimerId: string) {
    const supabase = await createClient();
    const { error: e1 } = await supabase.from("envoys_visitors").update({ restored_at: new Date().toISOString() }).eq("id", id);
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await supabase.from("pipeline_overviews").delete().eq("first_timer_id", originalFirstTimerId);
    if (e2) throw new Error(e2.message);
  },
};
