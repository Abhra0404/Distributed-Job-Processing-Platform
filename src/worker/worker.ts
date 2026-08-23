import { Worker } from "bullmq";
import { Redis } from "ioredis";

import { env } from "../config/env.js";
import { JOB_QUEUE_NAME } from "../queue/job.queue.js";
import { processJob } from "./processor.js";

const connection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const workerId =
  process.argv
    .find((arg) => arg.startsWith("--worker-id="))
    ?.split("=")[1] ??
  `worker-${process.pid}`;

const worker = new Worker(
  JOB_QUEUE_NAME,
  processJob,
  {
    connection,
    concurrency: 1,
  },
);

worker.on("ready", () => {
  console.log(`[worker:${workerId}] Ready`);
});

worker.on("active", (job) => {
  console.log(
    `[worker:${workerId}] Job ${job.id} started`,
  );
});

worker.on("completed", (job) => {
  console.log(
    `[worker:${workerId}] Job ${job.id} completed`,
  );
});

worker.on("failed", (job, error) => {
  console.error(
    `[worker:${workerId}] Job ${job?.id} failed:`,
    error.message,
  );
});

worker.on("error", (error) => {
  console.error(
    `[worker:${workerId}] Worker error:`,
    error,
  );
});

async function shutdown(signal: string) {
  console.log(
    `[worker:${workerId}] Received ${signal}`,
  );

  await worker.close();
  await connection.quit();

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});