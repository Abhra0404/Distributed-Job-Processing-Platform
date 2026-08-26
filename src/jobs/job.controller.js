import { createJobSchema } from "./job.schemas.js";
import { cancelJob, createJob, getJobById, listJobs } from "./job.service.js";

export async function submitJob(req, res) {
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

export async function getJob(req, res) {
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

export async function getJobs(req, res) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  if (
    !Number.isInteger(page) ||
    !Number.isInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      error: "Invalid pagination parameters",
    });
  }

  try {
    const jobs = await listJobs(page, limit);

    return res.status(200).json({
      page,
      limit,
      jobs,
    });
  } catch (error) {
    console.error("Failed to list jobs:", error);

    return res.status(500).json({
      error: "Failed to list jobs",
    });
  }
}

export async function cancelJobController(req, res) {
  const jobId = req.params.id;

  if (typeof jobId !== "string") {
    return res.status(400).json({
      error: "Invalid job ID",
    });
  }

  try {
    const result = await cancelJob(jobId);

    if (result.status === "not_found") {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    if (result.status === "not_cancellable") {
      return res.status(409).json({
        error: `Job cannot be cancelled while ${result.job.status}`,
      });
    }

    return res.status(200).json(result.job);
  } catch (error) {
    console.error("Failed to cancel job:", error);

    return res.status(500).json({
      error: "Failed to cancel job",
    });
  }
}