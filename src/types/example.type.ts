import { z } from "zod";

export const Example = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
});
export type Example = z.infer<typeof Example>;

export const CreateExampleInput = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
});
export type CreateExampleInput = z.infer<typeof CreateExampleInput>;
