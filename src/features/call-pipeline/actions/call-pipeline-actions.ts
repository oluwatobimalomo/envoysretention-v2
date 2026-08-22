"use server";

import { revalidatePath } from "next/cache";
import { callFeedbackSchema, pipelineOverviewSchema } from "../schemas/call-feedback-schema";
import { callPipelineService } from "../services/call-pipeline-service";
import { requireRole } from "@/features/auth/utils/require-role";

export interface CallPipelineActionState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

export async function assignCallAction(firstTimerId: string, assignedTo: string) {
  const user = await requireRole(["admin", "experienceadmin"]);
  await callPipelineService.assign(firstTimerId, assignedTo, user.id);
  revalidatePath("/experience/assign-calls");
}

export async function bulkAssignCallsAction(firstTimerIds: string[], assignedTo: string) {
  const user = await requireRole(["admin", "experienceadmin"]);
  await callPipelineService.bulkAssign(firstTimerIds, assignedTo, user.id);
  revalidatePath("/experience/assign-calls");
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return v === null ? "" : String(v);
}

export async function logCallFeedbackAction(
  firstTimerId: string,
  week: number,
  callerName: string,
  _prev: CallPipelineActionState,
  formData: FormData
): Promise<CallPipelineActionState & { success?: boolean; pipelineComplete?: boolean }> {
  const user = await requireRole(["admin", "experienceadmin", "expteam"]);

  const parsed = callFeedbackSchema.safeParse({
    call_status: str(formData, "call_status"),
    experience_rating: str(formData, "experience_rating"),
    returning: str(formData, "returning"),
    notes: str(formData, "notes"),
    follow_up_date: str(formData, "follow_up_date"),
    church_attendance: str(formData, "church_attendance"),
    flagged_for_pastoral: formData.get("flagged_for_pastoral") === "on",
    flag_reason: str(formData, "flag_reason"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const isReached = parsed.data.call_status === "Reached";
  const existing = await callPipelineService.getFeedbackForWeek(firstTimerId, week);

  try {
    await callPipelineService.saveFeedback(
      {
        first_timer_id: firstTimerId,
        week_number: week,
        call_status: parsed.data.call_status,
        experience_rating: isReached ? parsed.data.experience_rating || null : null,
        returning: isReached ? parsed.data.returning || null : null,
        notes: parsed.data.notes || null,
        follow_up_date: parsed.data.follow_up_date || null,
        caller_name: callerName,
        caller_id: user.id,
        flagged_for_pastoral: parsed.data.flagged_for_pastoral,
        flag_reason: parsed.data.flagged_for_pastoral ? parsed.data.flag_reason || null : null,
        church_attendance: week >= 2 ? parsed.data.church_attendance || null : null,
      },
      existing?.id
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }

  revalidatePath("/experience/my-calls");
  revalidatePath("/experience/call-queue");
  return { error: null, success: true, pipelineComplete: week === 3 };
}

export async function submitPipelineOverviewAction(
  firstTimerId: string,
  submittedBy: string,
  _prev: CallPipelineActionState,
  formData: FormData
): Promise<CallPipelineActionState & { success?: boolean }> {
  const user = await requireRole(["admin", "experienceadmin", "expteam"]);

  const parsed = pipelineOverviewSchema.safeParse({
    move_to_membership: str(formData, "move_to_membership"),
    natural_groups: formData.getAll("natural_groups").map(String),
    connect_center: str(formData, "connect_center"),
    overview_notes: str(formData, "overview_notes"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await callPipelineService.saveOverview({
      first_timer_id: firstTimerId,
      submitted_by: submittedBy,
      submitted_by_id: user.id,
      move_to_membership: parsed.data.move_to_membership === "true",
      natural_groups: parsed.data.natural_groups.length ? parsed.data.natural_groups : null,
      connect_center: parsed.data.connect_center || null,
      overview_notes: parsed.data.overview_notes || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong." };
  }

  revalidatePath("/experience/my-calls");
  revalidatePath("/experience/completed");
  return { error: null, success: true };
}
