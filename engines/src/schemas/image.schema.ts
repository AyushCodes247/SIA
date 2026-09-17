import { z } from "zod";

export const imageSchema = z.object({
  image: z.string().min(1),
});

export type ImageInput = z.infer<typeof imageSchema>;
