import { useEffect, useState } from "react";
import { ArrowLeft, XCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api";

const statusStyles = {
  queued: "bg-amber-500/10 text-amber-400",
  running: "bg-blue-500/10 text-blue-400",
  succeeded: "bg-emerald-500/10 text-emerald-400",
  failed: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-800 text-zinc-400",
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  async function loadJob() {
    try {
      const data = await api.getJob(id);
      setJob(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJob();
  }, [id]);

  async function handleCancel() {
    if (!job || job.status !== "queued") return;

    setCancelling(true);

    try {
      await api.cancelJob(id);
      await loadJob();
    } catch (error) {
      console.error(error);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-zinc-500">
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <Link
          to="/jobs"
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>

        <p className="mt-8 text-zinc-500">
          Job not found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/jobs"
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-zinc-500">
            {job.id}
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {job.type}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs ${
              statusStyles[job.status] ??
              "bg-zinc-800 text-zinc-400"
            }`}
          >
            {job.status}
          </span>

          {job.status === "queued" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 rounded-lg border border-red-900/50 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {cancelling ? "Cancelling..." : "Cancel Job"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DataCard
          title="Job Information"
          content={
            <div className="space-y-4">
              <InfoRow label="ID" value={job.id} mono />
              <InfoRow label="Type" value={job.type} />
              <InfoRow label="Status" value={job.status} />
              <InfoRow
                label="Created"
                value={formatDate(job.createdAt)}
              />
              <InfoRow
                label="Started"
                value={formatDate(job.startedAt)}
              />
              <InfoRow
                label="Completed"
                value={formatDate(job.completedAt)}
              />
            </div>
          }
        />

        <DataCard
          title="Payload"
          content={<JsonBlock value={job.payload} />}
        />

        <DataCard
          title="Result"
          content={
            job.result ? (
              <JsonBlock value={job.result} />
            ) : (
              <EmptyState text="No result available." />
            )
          }
        />

        <DataCard
          title="Error"
          content={
            job.error ? (
              <pre className="whitespace-pre-wrap text-sm text-red-400">
                {job.error}
              </pre>
            ) : (
              <EmptyState text="No errors recorded." />
            )
          }
        />
      </div>
    </div>
  );
}

function DataCard({ title, content }) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h3 className="font-medium">{title}</h3>
      </div>

      <div className="p-5">{content}</div>
    </section>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-6 border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-zinc-500">
        {label}
      </span>

      <span
        className={`max-w-[70%] break-all text-right text-sm ${
          mono ? "font-mono text-xs" : "text-zinc-300"
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function JsonBlock({ value }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs leading-6 text-zinc-300">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function EmptyState({ text }) {
  return (
    <p className="text-sm text-zinc-500">
      {text}
    </p>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString();
}