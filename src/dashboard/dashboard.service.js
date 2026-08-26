import { count, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { jobs } from "../db/schema.js";

export async function getDashboardStats() {
  const [total] = await db
    .select({ count: count() })
    .from(jobs);

  const [queued] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "queued"));

  const [running] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "running"));

  const [succeeded] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "succeeded"));

  const [failed] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "failed"));

  const [cancelled] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "cancelled"));

  return {
    total: Number(total.count),
    queued: Number(queued.count),
    running: Number(running.count),
    succeeded: Number(succeeded.count),
    failed: Number(failed.count),
    cancelled: Number(cancelled.count),
  };
}