import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
};

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

if (!env.REDIS_URL) {
  throw new Error("REDIS_URL is required");
}