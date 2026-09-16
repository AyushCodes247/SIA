import { z } from "zod";

export const answeringSchema = z.object({
  content: z.string().min(1),
});

export type AnsweringResponse = z.infer<typeof answeringSchema>;
