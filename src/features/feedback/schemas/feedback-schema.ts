import { z } from "zod";

export const publicFeedbackSchema = z.object({
  name: z.string().trim().optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"]).optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  membership_status: z.enum(["Member", "Steward"], { message: "Select your membership status" }),
  focus_points: z.array(z.string()).min(1, "Select at least one focus point"),
  feedback: z.string().trim().min(1, "Feedback is required"),
});
export type PublicFeedbackInput = z.infer<typeof publicFeedbackSchema>;
