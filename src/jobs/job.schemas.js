import { z } from "zod";

import { JOB_TYPES } from "./job.types.js";

export const createJobSchema = z.object({
  type: z.enum(JOB_TYPES),

  payload: z.record(
    z.string(),
    z.unknown(),
  ),
});