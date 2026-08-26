import { randomUUID } from "node:crypto";

import { desc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";
import { jobQueue } from "../queue/job.queue.js";

export async function createJob(input) {
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

export async function getJobById(jobId) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  return job ?? null;
}

export async function listJobs(page, limit) {
  const offset = (page - 1) * limit;

  const result = await db
    .select()
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

export async function cancelJob(jobId) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!job) {
    return {
      status: "not_found",
    };
  }

  if (job.status !== "queued") {
    return {
      status: "not_cancellable",
      job,
    };
  }

  const [cancelledJob] = await db
    .update(jobs)
    .set({
      status: "cancelled",
      completedAt: new Date(),
    })
    .where(eq(jobs.id, jobId))
    .returning();

  return {
    status: "cancelled",
    job: cancelledJob,
  };
}