import { z } from "zod";
import { TESTIMONY_CATEGORIES } from "../constants";

export const publicTestimonySchema = z.object({
  name: z.string().trim().optional().or(z.literal("")),
  category: z.enum(TESTIMONY_CATEGORIES),
  testimony: z.string().trim().min(1, "Please share your testimony"),
});
export type PublicTestimonyInput = z.infer<typeof publicTestimonySchema>;
