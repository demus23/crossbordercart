// components/TrackWidget.tsx
import { useState } from "react";
import { useRouter } from "next/router";

export default function TrackWidget() {
  const router = useRouter();
  const [trackingNo, setTrackingNo] = useState("");
  const [error, setError] = useState("");

  async function doTrack(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");

    const trimmed = trackingNo.trim();
    if (!trimmed) {
      setError("Enter a tracking number");
      return;
    }

    // ✅ Use the new tracking page that we already fixed
    router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={doTrack}
      className="d-flex align-items-center gap-3 p-3 border rounded"
    >
      <div className="fw-semibold">Track Package:</div>
      <input
        className="form-control"
        style={{ maxWidth: 220 }}
        placeholder="e.g., 69299ad9ff1ee7fffce05caa"
        value={trackingNo}
        onChange={(e) => setTrackingNo(e.target.value)}
      />
      <button className="btn btn-secondary" type="submit">
        Track
      </button>

      {error && <div className="ms-4 text-danger small">{error}</div>}
    </form>
  );
}
