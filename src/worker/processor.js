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

const primePayloadSchema = z.object({
  n: z.number().int().nonnegative(),
});

const matrixPayloadSchema = z.object({
  a: z.array(z.array(z.number())),
  b: z.array(z.array(z.number())),
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

function calculatePrime(n) {
  if (n < 2) {
    return false;
  }

  if (n === 2) {
    return true;
  }

  if (n % 2 === 0) {
    return false;
  }

  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }

  return true;
}

function multiplyMatrices(a, b) {
  const rowsA = a.length;
  const colsA = a[0].length;
  const rowsB = b.length;
  const colsB = b[0].length;

  if (colsA !== rowsB) {
    throw new Error(
      "Matrix dimensions are incompatible",
    );
  }

  const result = Array.from(
    { length: rowsA },
    () => Array(colsB).fill(0),
  );

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] +=
          a[i][k] * b[k][j];
      }
    }
  }

  return result;
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

      case "prime": {
        const payload = primePayloadSchema.safeParse(
          existingJob.payload,
        );

        if (!payload.success) {
          throw new Error("Invalid prime payload");
        }

        const n = payload.data.n;

        result = {
          n,
          isPrime: calculatePrime(n),
        };

        break;
      }

      case "matrix": {
        const payload = matrixPayloadSchema.safeParse(
          existingJob.payload,
        );

        if (!payload.success) {
          throw new Error("Invalid matrix payload");
        }

        const { a, b } = payload.data;

        result = {
          matrix: multiplyMatrices(a, b),
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