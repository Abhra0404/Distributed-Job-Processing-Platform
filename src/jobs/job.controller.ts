import type { Request, Response } from "express";

import { createJobSchema } from "./job.schemas.js";
import { createJob, getJobById } from "./job.service.js";

export async function submitJob(
  req: Request,
  res: Response,
) {
  const parsed = createJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid job request",
      details: parsed.error.flatten(),
    });
  }

  try {
    const job = await createJob(parsed.data);

    return res.status(202).json({
      id: job.id,
      type: job.type,
      status: job.status,
    });
  } catch (error) {
    console.error("Failed to submit job:", error);

    return res.status(500).json({
      error: "Failed to submit job",
    });
  }
}

export async function getJob(
  req: Request,
  res: Response,
) {
  try {
    const jobId = req.params.id;

    if (typeof jobId !== "string") {
        return res.status(400).json({
            error: "Invalid job ID",
        });
    }

    const job = await getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.error("Failed to retrieve job:", error);

    return res.status(500).json({
      error: "Failed to retrieve job",
    });
  }
}