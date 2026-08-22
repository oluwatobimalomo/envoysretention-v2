import { z } from "zod";

export const peFeedbackSchema = z.object({
  call_status: z.enum(["Reached", "Not Reached", "Callback Requested", "Wrong Number"], { message: "Call status is required" }),
  notes: z.string().optional().or(z.literal("")),
  follow_up_date: z.string().optional().or(z.literal("")),
  flagged_for_pastoral: z.boolean(),
  flag_reason: z.string().optional().or(z.literal("")),
}).refine((v) => !v.flagged_for_pastoral || v.flag_reason?.trim(), {
  message: "Describe the reason for flagging.",
  path: ["flag_reason"],
});
export type PeFeedbackInput = z.infer<typeof peFeedbackSchema>;
