// components/tracking/TrackingSearchCard.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";

type Props = any; // keep loose so existing usages don't break

export default function TrackingSearchCard(_props: Props) {
  const router = useRouter();
  const [tracking, setTracking] = useState("");

  const trimmed = tracking.trim();
  const hasTracking = trimmed.length > 0;

  const trackingPath = () => `/track/${encodeURIComponent(trimmed)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasTracking) {
      alert("Please enter a tracking number");
      return;
    }
    // Go to the public tracking page
    router.push(trackingPath());
  };

  const handleCopy = async () => {
    if (!hasTracking) {
      alert("Please enter a tracking number first");
      return;
    }
    try {
      const url = `${window.location.origin}${trackingPath()}`;
      await navigator.clipboard.writeText(url);
      alert("Tracking link copied");
    } catch {
      alert("Failed to copy tracking link");
    }
  };

  const handleOpenNewTab = () => {
    if (!hasTracking) {
      alert("Please enter a tracking number");
      return;
    }
    window.open(trackingPath(), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="quick-track-card">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Quick Track</h2>

        <input
          type="text"
          placeholder="Enter tracking number"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 text-lg"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold"
          >
            Track
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border px-6 py-2 font-semibold"
          >
            Copy
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="rounded-lg border px-6 py-2 font-semibold"
          >
            Open
          </button>
        </div>
      </div>
    </form>
  );
}
