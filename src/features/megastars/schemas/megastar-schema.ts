import { z } from "zod";
import { MEGASTAR_CLASSES } from "../constants";

export const newGuardianSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the guardian's full name"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
});
export type NewGuardianInput = z.infer<typeof newGuardianSchema>;

export const addMegastarSchema = z.object({
  child_full_name: z.string().trim().min(2, "Enter the child's full name"),
  gender: z.enum(["Male", "Female"]).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  class: z.enum(MEGASTAR_CLASSES).optional().or(z.literal("")),
  relationship: z.enum(["Parent", "Grandparent", "Guardian", "Other"]).default("Parent"),
  guardian_mode: z.enum(["existing", "new"]),
  existing_guardian_id: z.string().optional().or(z.literal("")),
  guardian_full_name: z.string().optional().or(z.literal("")),
  guardian_phone: z.string().optional().or(z.literal("")),
}).refine((v) => v.guardian_mode !== "existing" || v.existing_guardian_id, {
  message: "Look up a guardian by phone first.",
  path: ["existing_guardian_id"],
}).refine((v) => v.guardian_mode !== "new" || (v.guardian_full_name?.trim() && v.guardian_phone?.trim()), {
  message: "Guardian name and phone are required.",
  path: ["guardian_full_name"],
});
export type AddMegastarInput = z.infer<typeof addMegastarSchema>;

export const openServiceSchema = z.object({
  label: z.string().trim().min(1, "Service label is required"),
  service_date: z.string().min(1, "Date is required"),
});
export type OpenServiceInput = z.infer<typeof openServiceSchema>;
