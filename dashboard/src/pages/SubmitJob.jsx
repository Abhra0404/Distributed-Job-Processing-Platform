import { useState } from "react";
import { CheckCircle2, Loader2, Plus } from "lucide-react";

import { api } from "../services/api";

const JOB_CONFIG = {
  fibonacci: {
    label: "Fibonacci",
    description:
      "Calculate the nth Fibonacci number.",
    defaultPayload: {
      n: 40,
    },
  },

  sleep: {
    label: "Sleep",
    description:
      "Simulate a long-running computational job.",
    defaultPayload: {
      duration: 5000,
    },
  },

  prime: {
    label: "Prime Number",
    description:
      "Check whether a number is prime.",
    defaultPayload: {
      n: 9973,
    },
  },

  matrix: {
    label: "Matrix Multiplication",
    description:
      "Multiply two compatible matrices.",
    defaultPayload: {
      a: [
        [1, 2],
        [3, 4],
      ],
      b: [
        [5, 6],
        [7, 8],
      ],
    },
  },
};

export default function SubmitJob() {
  const [type, setType] = useState("fibonacci");
  const [payload, setPayload] = useState(
    JSON.stringify(
      JOB_CONFIG.fibonacci.defaultPayload,
      null,
      2,
    ),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdJob, setCreatedJob] = useState(null);

  function handleTypeChange(event) {
    const nextType = event.target.value;

    setType(nextType);
    setPayload(
      JSON.stringify(
        JOB_CONFIG[nextType].defaultPayload,
        null,
        2,
      ),
    );

    setError("");
    setCreatedJob(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setCreatedJob(null);

    let parsedPayload;

    try {
      parsedPayload = JSON.parse(payload);
    } catch {
      setError("Payload must be valid JSON.");
      return;
    }

    setSubmitting(true);

    try {
      const job = await api.createJob({
        type,
        payload: parsedPayload,
      });

      setCreatedJob(job);
    } catch (error) {
      setError(error.message || "Failed to submit job.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Submit Job
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Submit a computational workload to the worker pool.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-zinc-800 bg-zinc-900"
      >
        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Job Type
            </label>

            <select
              value={type}
              onChange={handleTypeChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
            >
              {Object.entries(JOB_CONFIG).map(
                ([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ),
              )}
            </select>

            <p className="mt-2 text-xs text-zinc-500">
              {JOB_CONFIG[type].description}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                Payload
              </label>

              <span className="text-xs text-zinc-600">
                JSON
              </span>
            </div>

            <textarea
              value={payload}
              onChange={(event) =>
                setPayload(event.target.value)
              }
              rows={10}
              spellCheck={false}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 p-4 font-mono text-sm text-zinc-300 outline-none focus:border-zinc-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {createdJob && (
            <div className="flex gap-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Job submitted successfully
                </p>

                <p className="mt-1 font-mono text-xs text-zinc-500">
                  {createdJob.id}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Status: {createdJob.status}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-zinc-800 px-6 py-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Submit Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}