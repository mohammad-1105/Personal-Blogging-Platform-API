import { z } from "zod";

export const updatePostSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .min(10, { message: "Title must be at least 10 characters" })
    .max(40, { message: "Title must be not more than 40 characters" }),

  content: z
    .string({ message: "Content is required" })
    .min(50, { message: "why content less than 50 characters" })
    .max(500, { message: "content limit upto 500 characters" }),
});
