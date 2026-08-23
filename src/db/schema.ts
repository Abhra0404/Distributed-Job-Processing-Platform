import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),

  type: text("type").notNull(),

  status: jobStatusEnum("status")
    .notNull()
    .default("queued"),

  payload: jsonb("payload")
    .$type<Record<string, unknown>>()
    .notNull(),

  result: jsonb("result")
    .$type<Record<string, unknown> | null>(),

  error: text("error"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  startedAt: timestamp("started_at", {
    withTimezone: true,
  }),

  completedAt: timestamp("completed_at", {
    withTimezone: true,
  }),
});