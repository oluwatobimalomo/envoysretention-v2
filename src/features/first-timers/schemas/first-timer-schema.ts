import { z } from "zod";
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, LIFE_STAGE_OPTIONS, MEMBERSHIP_DECISION_OPTIONS } from "../constants";

/**
 * Shared by the internal (staff) form and the public self-registration
 * form. `publicMode` relaxes nothing on validation — every first-timer
 * still needs a name, phone, and gender — it only changes which fields
 * the *form* shows (membership_decision / heard_from are staff-only in
 * V1's PublicForm).
 */
export const firstTimerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the full name"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  gender: z.enum(GENDER_OPTIONS, { message: "Select a gender" }),
  dob: z.string().optional().or(z.literal("")),
  marital_status: z.enum(MARITAL_STATUS_OPTIONS).optional().or(z.literal("")),
  house_address: z.string().optional().or(z.literal("")),
  nearest_landmark: z.string().optional().or(z.literal("")),
  membership_decision: z.enum(MEMBERSHIP_DECISION_OPTIONS).optional().or(z.literal("")),
  life_stage: z.enum(LIFE_STAGE_OPTIONS).optional().or(z.literal("")),
  heard_from: z.string().optional().or(z.literal("")),
  areas_of_interest: z.array(z.string()),
  service_feedback: z.string().optional().or(z.literal("")),
  service_date: z.string().min(1, "Service date is required"),
});

export type FirstTimerInput = z.infer<typeof firstTimerSchema>;

export const BLANK_FIRST_TIMER: FirstTimerInput = {
  full_name: "", phone: "", email: "", gender: undefined as never, dob: "",
  marital_status: "", house_address: "", nearest_landmark: "",
  membership_decision: "", life_stage: "", heard_from: "",
  areas_of_interest: [], service_feedback: "",
  service_date: new Date().toISOString().slice(0, 10),
};
