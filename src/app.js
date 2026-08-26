import express from "express";

import healthRouter from "./routes/health.routes.js";
import jobRouter from "./routes/job.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";
import cors from "cors";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/health", healthRouter);
app.use("/api/v1/jobs", jobRouter);

export default app;