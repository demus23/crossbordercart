// components/tracking/QuickTrackHome.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";

type TrackResult = {
  tracking: string;
  status: string;
  updatedAt?: string | null;
};

export default function QuickTrackHome() {
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = tracking.trim();
    if (!t) return;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/track?trackingNo=${encodeURIComponent(t)}&limit=1`,
        { headers: { Accept: "application/json" } }
      );

      if (!res.ok) {
        throw new Error("Tracking lookup failed");
      }

      const data: any = await res.json();

      if (data.ok === false) {
        throw new Error(data.error || "Tracking number not found");
      }

      const events: any[] = Array.isArray(data.events) ? data.events : [];
      const ev = events[0];

      if (!ev) {
        setResult({ tracking: t, status: "Not found", updatedAt: null });
      } else {
        setResult({
          tracking: t,
          status: ev.status || "Unknown",
          updatedAt: ev.at || ev.updatedAt || null,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to track package");
    } finally {
      setBusy(false);
    }
  }

  function openFullPage() {
    const t = tracking.trim();
    if (!t) return;
    // goes to /track/[trackingNo]
    router.push(`/track/${encodeURIComponent(t)}`);
  }

  return (
    <section className="w-full max-w-3xl mx-auto my-8 rounded-2xl bg-white shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Quick Track</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Enter tracking number"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-base outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy || !tracking.trim()}
            className="px-5 py-2 rounded-xl font-semibold bg-blue-600 text-white disabled:opacity-60"
          >
            {busy ? "Tracking..." : "Track"}
          </button>

          <button
            type="button"
            onClick={openFullPage}
            disabled={!tracking.trim()}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium disabled:opacity-60"
          >
            Open Page
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Result */}
      {result && !error && (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              result.status.toLowerCase() === "delivered"
                ? "bg-green-100 text-green-700"
                : "bg-teal-100 text-teal-700"
            }`}
          >
            {result.status}
          </span>

          {result.updatedAt && (
            <span className="text-gray-500">
              Updated:{" "}
              {new Date(result.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
