import { z } from "zod";
import { APP_ROLES } from "@/lib/config/roles";

// Admin isn't self-requestable — that role is granted manually by an
// existing admin, never through the public form.
export const REQUESTABLE_ROLES = APP_ROLES.filter((r) => r !== "admin");

export const accessRequestSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional().or(z.literal("")),
  requested_role: z.enum(REQUESTABLE_ROLES as [string, ...string[]], { message: "Select the team you're joining" }),
  message: z.string().trim().optional().or(z.literal("")),
});
export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
