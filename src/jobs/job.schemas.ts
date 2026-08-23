import { z } from "zod";

export const createJobSchema = z.object({
  type: z.enum(["fibonacci", "sleep"]),

  payload: z.record(z.string(), z.unknown()),
});

export type CreateJobRequest = z.infer<typeof createJobSchema>;
