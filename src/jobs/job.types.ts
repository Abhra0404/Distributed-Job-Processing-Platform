export const JOB_TYPES = [
  "fibonacci",
  "sleep",
] as const;

export type JobType = (typeof JOB_TYPES)[number];