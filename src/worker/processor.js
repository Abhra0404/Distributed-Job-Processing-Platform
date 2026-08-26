import { eq } from "drizzle-orm";

import { z } from "zod";

import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";


const fibonacciPayloadSchema = z.object({
  n: z.number().int().nonnegative(),
});

const sleepPayloadSchema = z.object({
  duration: z.number().nonnegative(),
});

function fibonacci(n) {
  if (n <= 1) {
    return n;
  }

  let previous = 0;
  let current = 1;

  for (let i = 2; i <= n; i++) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  return current;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function processJob(job) {
  const { jobId } = job.data;

  console.log(`[worker] Processing job ${jobId}`);

  const [existingJob] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);

  if (!existingJob) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (existingJob.status !== "queued") {
    throw new Error(
      `Job ${jobId} is not queued. Current status: ${existingJob.status}`,
    );
  }

  await db
    .update(jobs)
    .set({
      status: "running",
      startedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  try {
    let result;

    switch (existingJob.type) {
      case "fibonacci": {
        const payload = fibonacciPayloadSchema.safeParse(
        existingJob.payload,
        );

        if (!payload.success) {
        throw new Error("Invalid fibonacci payload");
        }

        result = {
        value: fibonacci(payload.data.n),
        };

        break;
      }

      case "sleep": {
        const payload = sleepPayloadSchema.safeParse(
        existingJob.payload,
        );

        if (!payload.success) {
        throw new Error("Invalid sleep payload");
        }

        await sleep(payload.data.duration);

        result = {
        sleptFor: payload.data.duration,
        };

        break;
      }

      default:
        throw new Error(
          `Unsupported job type: ${existingJob.type}`,
        );
    }

    await db
      .update(jobs)
      .set({
        status: "succeeded",
        result,
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    console.log(`[worker] Job ${jobId} succeeded`);

    return result;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown job execution error";

    await db
      .update(jobs)
      .set({
        status: "failed",
        error: message,
        completedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    console.error(
      `[worker] Job ${jobId} failed:`,
      message,
    );

    throw error;
  }
}