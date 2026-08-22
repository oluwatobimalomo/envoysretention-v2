import { z } from "zod";
import { SC_VISIT_TYPES, VISIT_STATUS_OPTIONS, URGENCY_OPTIONS } from "../constants";

export const visitSchema = z.object({
  visit_type: z.enum(SC_VISIT_TYPES, { message: "Type of visit is required" }),
  urgency: z.enum(URGENCY_OPTIONS).optional().or(z.literal("")),
  reason_for_care: z.string().optional().or(z.literal("")),
  visit_status: z.enum(VISIT_STATUS_OPTIONS, { message: "Visit status is required" }),
  visit_date: z.string().optional().or(z.literal("")),
  visit_time: z.string().optional().or(z.literal("")),
  meeting_notes: z.string().optional().or(z.literal("")),
  visit_photo_url: z.string().optional().or(z.literal("")),
  material_support: z.boolean(),
  material_support_notes: z.string().optional().or(z.literal("")),
  prayer_requests: z.string().optional().or(z.literal("")),
  testimony: z.string().optional().or(z.literal("")),
  follow_up_required: z.boolean(),
  next_follow_up_date: z.string().optional().or(z.literal("")),
  escalate_to_pastorate: z.boolean(),
  escalation_reason: z.string().optional().or(z.literal("")),
}).refine((v) => !v.escalate_to_pastorate || v.escalation_reason?.trim(), {
  message: "Please describe the reason for escalation.",
  path: ["escalation_reason"],
});

export type VisitInput = z.infer<typeof visitSchema>;

export const newContactSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the full name"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"]).optional().or(z.literal("")),
  marital_status: z.enum(["Single", "Married", "Divorced", "Widowed"]).optional().or(z.literal("")),
  life_stage: z.enum(["Student", "Employee", "Business Owner"]).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  house_address: z.string().optional().or(z.literal("")),
  nearest_landmark: z.string().optional().or(z.literal("")),
});

export type NewContactInput = z.infer<typeof newContactSchema>;
