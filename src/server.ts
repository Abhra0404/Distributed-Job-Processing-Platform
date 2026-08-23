import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/index.js";
import { redis } from "./queue/redis.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `API server running on http://localhost:${env.PORT}`,
  );
});

async function shutdown(signal: string) {
  console.log(`[server] Received ${signal}`);

  server.close(async () => {
    await redis.quit();
    await pool.end();

    console.log("[server] Shutdown complete");

    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});