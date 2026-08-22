import { z } from "zod";
import { CONVERSION_TYPES } from "../constants";

export const newConvertSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the full name"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  gender: z.enum(["Male", "Female"]).optional().or(z.literal("")),
  conversion_type: z.enum(CONVERSION_TYPES),
  conversion_date: z.string().min(1, "Conversion date is required"),
});
export type NewConvertInput = z.infer<typeof newConvertSchema>;

export const checkinSchema = z.object({
  call_status: z.enum(["Reached", "Not Reached", "Callback Requested", "Wrong Number"], { message: "Status is required" }),
  notes: z.string().optional().or(z.literal("")),
  follow_up_date: z.string().optional().or(z.literal("")),
  flagged_for_pastoral: z.boolean(),
  flag_reason: z.string().optional().or(z.literal("")),
}).refine((v) => !v.flagged_for_pastoral || v.flag_reason?.trim(), {
  message: "Describe the reason for flagging.",
  path: ["flag_reason"],
});
export type CheckinInput = z.infer<typeof checkinSchema>;
