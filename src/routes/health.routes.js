import { Router } from "express";
import { sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { redis } from "../queue/redis.js";

const router = Router();

router.get("/", async (_req, res) => {
  let database = "ok";
  let redisStatus = "ok";

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    database = "error";
  }

  try {
    await redis.ping();
  } catch {
    redisStatus = "error";
  }

  const healthy =
    database === "ok" &&
    redisStatus === "ok";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    services: {
      database,
      redis: redisStatus,
    },
  });
});

export default router;