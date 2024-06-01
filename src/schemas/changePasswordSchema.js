import { z } from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ message: "old password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
  newPassword: z
    .string({ message: "old password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});
