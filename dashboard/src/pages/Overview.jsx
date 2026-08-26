import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";

import { api } from "../services/api";

const statusStyles = {
  queued: "bg-amber-500/10 text-amber-400",
  running: "bg-blue-500/10 text-blue-400",
  succeeded: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-800 text-zinc-400",
};

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const [statsData, jobsData] = await Promise.all([
        api.getDashboardStats(),
        api.getJobs(1, 10),
      ]);

      setStats(statsData);
      setJobs(jobsData.jobs ?? []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(
      loadDashboard,
      10000,
    );

    return () => clearInterval(interval);
  }, []);

  const successRate = useMemo(() => {
    if (!stats?.total) return 0;

    return Math.round(
      (stats.succeeded / stats.total) * 100,
    );
  }, [stats]);

  const chartData = useMemo(() => {
    const grouped = {};

    jobs.forEach((job) => {
      const date = new Date(
        job.createdAt,
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!grouped[date]) {
        grouped[date] = 0;
      }

      grouped[date]++;
    });

    return Object.entries(grouped).map(
      ([time, jobs]) => ({
        time,
        jobs,
      }),
    );
  }, [jobs]);

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            Dashboard
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Overview
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Monitor your distributed job workload.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          <span className="text-xs text-zinc-400">
            System operational
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Jobs"
          value={loading ? "—" : stats?.total ?? 0}
          icon={Activity}
        />

        <StatCard
          title="Queued"
          value={loading ? "—" : stats?.queued ?? 0}
          icon={Clock3}
        />

        <StatCard
          title="Running"
          value={loading ? "—" : stats?.running ?? 0}
          icon={TrendingUp}
        />

        <StatCard
          title="Succeeded"
          value={loading ? "—" : stats?.succeeded ?? 0}
          icon={CheckCircle2}
          accent="success"
        />

        <StatCard
          title="Failed"
          value={loading ? "—" : stats?.failed ?? 0}
          icon={XCircle}
          accent="danger"
        />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Activity */}
        <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">
                Job Activity
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Recent job submissions
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="h-2 w-2 rounded-full bg-zinc-400" />
              Jobs
            </div>
          </div>

          <div className="h-[280px] p-5">
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="jobGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="100%"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#52525b",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#52525b",
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="jobs"
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    fill="url(#jobGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                No activity yet.
              </div>
            )}
          </div>
        </section>

        {/* Success rate */}
        <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <div className="mb-6">
            <p className="text-sm font-medium">
              Success Rate
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Overall job execution
            </p>
          </div>

          <div className="flex items-center justify-center py-6">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[12px] border-zinc-800">
              <div
                className="absolute inset-[-12px] rounded-full border-[12px] border-transparent"
                style={{
                  borderTopColor: "#a1a1aa",
                  transform: `rotate(${successRate * 3.6 - 45}deg)`,
                }}
              />

              <div className="text-center">
                <p className="text-3xl font-semibold">
                  {loading ? "—" : `${successRate}%`}
                </p>

                <p className="mt-1 text-[11px] text-zinc-600">
                  success
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <MetricRow
              label="Succeeded"
              value={stats?.succeeded ?? 0}
            />

            <MetricRow
              label="Failed"
              value={stats?.failed ?? 0}
            />

            <MetricRow
              label="Cancelled"
              value={stats?.cancelled ?? 0}
            />
          </div>
        </section>
      </div>

      {/* Recent jobs */}
      <section className="mt-6 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
          <div>
            <h2 className="text-sm font-medium">
              Recent Jobs
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Latest submitted workloads
            </p>
          </div>

          <Link
            to="/jobs"
            className="text-xs text-zinc-500 transition hover:text-white"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800/80 text-[10px] uppercase tracking-wider text-zinc-600">
              <tr>
                <th className="px-5 py-3">
                  Job ID
                </th>

                <th className="px-5 py-3">
                  Type
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/20"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="font-mono text-xs text-zinc-500 hover:text-white"
                    >
                      {job.id.slice(0, 12)}...
                    </Link>
                  </td>

                  <td className="px-5 py-4 font-medium">
                    {job.type}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge
                      status={job.status}
                    />
                  </td>

                  <td className="px-5 py-4 text-xs text-zinc-600">
                    {formatDate(job.createdAt)}
                  </td>
                </tr>
              ))}

              {!loading && jobs.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-sm text-zinc-600"
                  >
                    No jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}) {
  const accentClass =
    accent === "success"
      ? "text-emerald-400"
      : accent === "danger"
        ? "text-red-400"
        : "text-zinc-500";

  return (
    <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">
          {title}
        </p>

        <Icon
          className={`h-4 w-4 ${accentClass}`}
        />
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        statusStyles[status] ??
        "bg-zinc-800 text-zinc-400"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-zinc-500">
        {label}
      </span>

      <span className="text-sm font-medium">
        {value}
      </span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString();
}