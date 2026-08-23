import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";
import { jobQueue } from "../queue/job.queue.js";
import type { JobType } from "./job.types.js";

interface CreateJobInput {
  type: JobType;
  payload: Record<string, unknown>;
}

export async function createJob(input: CreateJobInput) {
  const jobId = randomUUID();

  const [job] = await db
    .insert(jobs)
    .values({
      id: jobId,
      type: input.type,
      status: "queued",
      payload: input.payload,
    })
    .returning();

  if (!job) {
    throw new Error("Failed to create job");
  }

  await jobQueue.add(
    input.type,
    {
      jobId,
    },
    {
      jobId,
    },
  );

  return job;
}

export async function getJobById(jobId: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  return job ?? null;
}