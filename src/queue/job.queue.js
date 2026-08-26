import { Queue } from "bullmq";

import { redis } from "./redis.js";

export const JOB_QUEUE_NAME = "job-processing";

export const jobQueue = new Queue(JOB_QUEUE_NAME, {
  connection: redis,
});