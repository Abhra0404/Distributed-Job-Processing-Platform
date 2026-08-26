import { getDashboardStats } from "./dashboard.service.js";

export async function getStats(req, res, next) {
  try {
    const stats = await getDashboardStats();

    res.json(stats);
  } catch (error) {
    next(error);
  }
}