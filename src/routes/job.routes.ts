import { Router } from "express";

import {
  getJob,
  submitJob,
} from "../jobs/job.controller.js";

const router = Router();

router.post("/", submitJob);
router.get("/:id", getJob);

export default router;