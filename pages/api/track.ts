// pages/api/track.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { Shipment } from "@/lib/models/Shipment";

type TrackEventDTO = {
  time: string;               // ISO
  status?: string;
  location?: string | null;
  message?: string | null;
  trackingNo?: string;
  createdAt?: string;
};

type TrackOk = {
  ok: true;
  package: {
    tracking: string;
    courier: string | null;
    status: string;
    location: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
  events: TrackEventDTO[];
};

type TrackErr = { ok: false; error: string };

function normalizeStatus(s?: string | null) {
  if (!s) return "Pending";
  const t = s.toLowerCase();
  if (t.includes("out") && t.includes("deliver")) return "Out for Delivery";
  if (t.includes("deliver")) return "Delivered";
  if (t.includes("transit") || t.includes("in-transit")) return "In Transit";
  if (t.includes("exception") || t.includes("fail") || t.includes("problem")) return "Problem";
  if (t.includes("pending") || t.includes("created") || t.includes("label")) return "Pending";
  return s[0].toUpperCase() + s.slice(1);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrackOk | TrackErr>
) {
  // no cache for live tracking
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ ok: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    // support ?trackingNo=<id> or ?tracking=<id>
    const trackingNo =
      typeof req.query.trackingNo === "string"
        ? req.query.trackingNo.trim()
        : typeof req.query.tracking === "string"
        ? req.query.tracking.trim()
        : "";

    if (!trackingNo) {
      return res
        .status(400)
        .json({ ok: false, error: "trackingNo is required" });
    }

    await dbConnect();

    // For now we use Mongo _id as tracking number
    const shipment: any = await Shipment.findById(trackingNo).lean();

    if (!shipment) {
      return res.status(404).json({ ok: false, error: "Not found" });
    }

    // ---------- Build events from shipment.activity ----------
    const events: TrackEventDTO[] = [];

    // Base "Shipment created" event
    events.push({
      time: (shipment.createdAt
        ? new Date(shipment.createdAt)
        : new Date()
      ).toISOString(),
      status: normalizeStatus(shipment.status) || "Created",
      location:
        shipment.to?.city && shipment.to?.country
          ? `${shipment.to.city}, ${shipment.to.country}`
          : null,
      message: "Shipment created",
      trackingNo,
      createdAt: shipment.createdAt
        ? new Date(shipment.createdAt).toISOString()
        : undefined,
    });

    // If you later start saving events in shipment.activity, they’ll show up here
    if (Array.isArray(shipment.activity)) {
      for (const act of shipment.activity) {
        const when = act.time || act.createdAt || shipment.createdAt || new Date();
        events.push({
          time: new Date(when).toISOString(),
          status: normalizeStatus(act.status),
          location: act.location ?? null,
          message: act.message ?? act.note ?? null,
          trackingNo: trackingNo,
          createdAt: act.createdAt
            ? new Date(act.createdAt).toISOString()
            : undefined,
        });
      }
    }

    // newest first (your React page also sorts, but this keeps it clean)
    events.sort(
      (a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    // ---------- Package summary ----------
    const pkgOut: TrackOk["package"] = {
      tracking: trackingNo,
      courier: (shipment.carrier as any) ?? null,
      status: normalizeStatus(shipment.status),
      location:
        shipment.to?.city && shipment.to?.country
          ? `${shipment.to.city}, ${shipment.to.country}`
          : null,
      createdAt: shipment.createdAt
        ? new Date(shipment.createdAt).toISOString()
        : null,
      updatedAt: shipment.updatedAt
        ? new Date(shipment.updatedAt).toISOString()
        : null,
    };

    return res.status(200).json({ ok: true, package: pkgOut, events });
  } catch (err) {
    console.error("GET /api/track error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
