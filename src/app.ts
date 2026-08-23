import express from "express";

import healthRouter from "./routes/health.routes.js";
import jobRouter from "./routes/job.routes.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/v1/jobs", jobRouter);

export default app;