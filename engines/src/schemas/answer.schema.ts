import { z } from "zod";

export const answeringSchema = z.object({
  content: z.string(),
});

export type AnsweringResponse = z.infer<typeof answeringSchema>;
