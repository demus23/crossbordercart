// pages/api/mypackages/track.ts
import type { NextApiRequest, NextApiResponse } from "next";

type TrackEventDTO = {
  time: string;
  status?: string;
  location?: string | null;
  message?: string | null;
};

type ApiOk = { ok: true; events: TrackEventDTO[] };
type ApiErr = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiOk | ApiErr>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ ok: false, error: `Method ${req.method} Not Allowed` });
  }

  // The dashboard passes ?tracking=<id> (your package tracking number)
  const tracking =
    typeof req.query.tracking === "string"
      ? req.query.tracking
      : typeof req.query.trackingNo === "string"
      ? req.query.trackingNo
      : "";

  if (!tracking) {
    return res
      .status(400)
      .json({ ok: false, error: "tracking is required" });
  }

  try {
    // Use the same API as the public /track/[id] page
    const baseUrl =
      process.env.NEXTAUTH_URL || "http://localhost:3000";

    const r = await fetch(
      `${baseUrl}/api/track?trackingNo=${encodeURIComponent(tracking)}`
    );
    const j = await r.json();

    if (!r.ok || !j?.ok) {
      return res.status(200).json({ ok: true, events: [] });
    }

    // j.events is what we already use on the /track page
    return res.status(200).json({ ok: true, events: j.events || [] });
  } catch (err) {
    console.error("GET /api/mypackages/track error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Server error" });
  }
}
