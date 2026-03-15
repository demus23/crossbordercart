// pages/api/track.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";
import PackageModel from "@/lib/models/Package";
import TrackingEvent from "@/lib/models/TrackingEvent";

type RawEvent = {
  time?: string;
  status?: string;
  location?: string | null;
  message?: string | null;
  trackingNo?: string;
  createdAt?: string;
};

type TrackResponse = {
  ok: boolean;
  tracking: string;
  shipment: any | null;
  package: any | null;
  events: RawEvent[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrackResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { trackingNo, tracking, limit } = req.query;

  const trackingNumber =
    (Array.isArray(trackingNo) ? trackingNo[0] : trackingNo) ||
    (Array.isArray(tracking) ? tracking[0] : tracking) ||
    "";

  if (!trackingNumber || !trackingNumber.toString().trim()) {
    return res.status(400).json({ error: "Missing tracking parameter" });
  }

  const maxLimit =
    typeof limit === "string" ? Math.min(parseInt(limit, 10) || 50, 100) : 50;

  await dbConnect();

  let shipmentDoc: any | null = null;
  let packageDoc: any | null = null;

  // 1) Try shipment
  shipmentDoc = await Shipment.findOne({ trackingNumber }).lean().catch(() => null);

  // 2) Try package if no shipment
  if (!shipmentDoc) {
    packageDoc = await PackageModel.findOne({ tracking: trackingNumber }).lean().catch(() => null);
  }

  // 3) Pull events from TrackingEvent collection (THIS is the missing part)
  const tevents = await TrackingEvent.find({ trackingNo: trackingNumber })
    .sort({ createdAt: -1 })
    .limit(maxLimit)
    .lean()
    .catch(() => []);

  const events: RawEvent[] = (tevents || []).map((e: any) => ({
    time: e.createdAt ? new Date(e.createdAt).toISOString() : undefined,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : undefined,
    status: e.status,
    location: e.location ?? null,
    message: e.note ?? null, // map note -> message so UI shows it
    trackingNo: e.trackingNo,
  }));

  // After `const events: RawEvent[] = ...`

const latest = events[0]; // because we sorted createdAt desc

// If we found a package, override its live status/location/updatedAt for display
if (packageDoc && latest) {
  packageDoc.status = latest.status || packageDoc.status;
  packageDoc.lastLocation = latest.location || packageDoc.lastLocation;
  packageDoc.lastNote = latest.message || packageDoc.lastNote;
  packageDoc.updatedAt = latest.time || packageDoc.updatedAt;
}


  // 4) If we found nothing at all
  if (!shipmentDoc && !packageDoc) {
    return res.status(200).json({
      ok: false,
      tracking: trackingNumber.toString(),
      shipment: null,
      package: null,
      events: [],
      error: "Shipment not found",
    });
  }

  // 5) Optional: if no tracking events exist yet, synthesize one from package/shipment status
  if (events.length === 0) {
    const doc: any = shipmentDoc || packageDoc;
    const at = doc?.updatedAt || doc?.createdAt ? new Date(doc.updatedAt || doc.createdAt) : new Date();
    events.push({
      time: at.toISOString(),
      createdAt: at.toISOString(),
      status: doc?.status || "Pending",
      location: doc?.lastLocation ?? doc?.location ?? null,
      message: doc?.lastNote ?? null,
      trackingNo: trackingNumber.toString(),
    });
  }

  return res.status(200).json({
    ok: true,
    tracking: trackingNumber.toString(),
    shipment: shipmentDoc,
    package: packageDoc,
    events,
  });
}
