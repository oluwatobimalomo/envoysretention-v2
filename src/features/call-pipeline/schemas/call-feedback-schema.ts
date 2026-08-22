import { z } from "zod";

export const callFeedbackSchema = z.object({
  call_status: z.enum(["Reached", "Not Reached", "Callback Requested", "Wrong Number"], { message: "Call status is required" }),
  experience_rating: z.enum(["Excellent", "Good", "Average", "Poor"]).optional().or(z.literal("")),
  returning: z.enum(["Yes", "Maybe", "No", "Undecided"]).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  follow_up_date: z.string().optional().or(z.literal("")),
  church_attendance: z.enum(["Present", "Absent", "Unknown"]).optional().or(z.literal("")),
  flagged_for_pastoral: z.boolean(),
  flag_reason: z.string().optional().or(z.literal("")),
}).refine((v) => !v.flagged_for_pastoral || v.flag_reason?.trim(), {
  message: "Describe the reason for flagging.",
  path: ["flag_reason"],
});

export type CallFeedbackInput = z.infer<typeof callFeedbackSchema>;

export const pipelineOverviewSchema = z.object({
  move_to_membership: z.enum(["true", "false"], { message: "Please indicate whether to move this person to Membership." }),
  natural_groups: z.array(z.string()),
  connect_center: z.string().optional().or(z.literal("")),
  overview_notes: z.string().optional().or(z.literal("")),
});

export type PipelineOverviewInput = z.infer<typeof pipelineOverviewSchema>;
