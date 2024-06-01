import { z } from "zod";

export const updateBioSchema = z.object({
  bio: z
    .string({ message: "bio is required" })
    .min(20, { message: "Bio must be least 20 characters" })
    .max(150, { message: "Bio must not be more than 150 characters" }),
});
