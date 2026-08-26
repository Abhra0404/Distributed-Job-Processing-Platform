import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../services/api";

const statusStyles = {
  queued: "bg-amber-500/10 text-amber-400",
  running: "bg-blue-500/10 text-blue-400",
  succeeded: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-800 text-zinc-400",
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadJobs() {
    setLoading(true);

    try {
      const data = await api.getJobs(page, 20);
      setJobs(data.jobs ?? []);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [page]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Jobs
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          View and manage your distributed jobs.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-4">
                  Job ID
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

                <th className="px-5 py-4">
                  Created
                </th>

                <th className="px-5 py-4">
                  Started
                </th>

                <th className="px-5 py-4">
                  Completed
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-zinc-500"
                  >
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-zinc-500"
                  >
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-mono text-xs text-zinc-400 transition hover:text-white"
                      >
                        {job.id.slice(0, 12)}...
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {job.type}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          statusStyles[job.status] ??
                          "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {formatDate(job.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {formatDate(job.startedAt)}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {formatDate(job.completedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-4">
          <span className="text-sm text-zinc-500">
            Page {page}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() =>
                setPage((current) => current - 1)
              }
              className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              disabled={jobs.length < 20 || loading}
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}