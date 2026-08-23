import { z } from "zod";

export const updateNameSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name"),
});
export type UpdateNameInput = z.infer<typeof updateNameSchema>;

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Enter your current password"),
  new_password: z.string().min(8, "New password must be at least 8 characters"),
  confirm_password: z.string(),
}).refine((v) => v.new_password === v.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
