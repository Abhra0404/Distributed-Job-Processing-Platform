const API_URL = "http://localhost:5000/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Request failed",
    );
  }

  return data;
}

export const api = {
  getDashboardStats: () =>
    request("/dashboard/stats"),

  getJobs: (page = 1, limit = 20) =>
    request(`/jobs?page=${page}&limit=${limit}`),

  getJob: (id) =>
    request(`/jobs/${id}`),

  createJob: (job) =>
    request("/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    }),

  cancelJob: (id) =>
    request(`/jobs/${id}/cancel`, {
      method: "POST",
    }),
};