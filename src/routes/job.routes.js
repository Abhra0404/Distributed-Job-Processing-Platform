import { Router } from "express";

import {
  cancelJobController,
  getJob,
  getJobs,
  submitJob,
} from "../jobs/job.controller.js";

const router = Router();

router.post("/", submitJob);
router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/:id/cancel", cancelJobController);

export default router;