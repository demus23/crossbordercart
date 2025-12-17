// pages/api/track.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";
import PackageModel from "@/lib/models/Package";

type TimelineEvent = {
  at: string;              // ISO date
  status: string;
  source: "shipment" | "package" | "system";
  raw?: any;
};

type TrackResponse = {
  ok: boolean;
  tracking: string;
  shipment: any | null;
  package: any | null;
  events: TimelineEvent[];
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

  // Accept both ?trackingNo= and ?tracking=
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
  const events: TimelineEvent[] = [];

  // 1️⃣ Try to find a Shipment by trackingNumber
  try {
    shipmentDoc = (await Shipment.findOne({
      trackingNumber: trackingNumber,
    }).lean()) as any | null;
  } catch (e) {
    // ignore DB error, we'll still try packages
  }

  if (shipmentDoc) {
    const activity = Array.isArray(shipmentDoc.activity)
      ? shipmentDoc.activity
      : [];

    for (const a of activity.slice(0, maxLimit)) {
      const at = a?.at
        ? new Date(a.at)
        : shipmentDoc.updatedAt || shipmentDoc.createdAt || new Date();

      events.push({
        at: at.toISOString(),
        status: a?.type || shipmentDoc.status || "created",
        source: "shipment",
        raw: a,
      });
    }
  }

  // 2️⃣ If no shipment found, try a Package by tracking
  if (!shipmentDoc) {
    try {
      packageDoc = (await PackageModel.findOne({
        tracking: trackingNumber,
      }).lean()) as any | null;
    } catch (e) {
      // ignore DB error here as well
    }

    if (packageDoc) {
      const activity = Array.isArray(packageDoc.activity)
        ? packageDoc.activity
        : [];

      for (const a of activity.slice(0, maxLimit)) {
        const at = a?.at
          ? new Date(a.at)
          : packageDoc.updatedAt || packageDoc.createdAt || new Date();

        events.push({
          at: at.toISOString(),
          status: a?.status || packageDoc.status || "created",
          source: "package",
          raw: a,
        });
      }
    }
  }

  // 3️⃣ Fallback: if we have a doc but zero events, synthesize one
  if (events.length === 0) {
    const doc: any = shipmentDoc || packageDoc;

    if (doc) {
      const at =
        doc.updatedAt || doc.createdAt ? new Date(doc.updatedAt || doc.createdAt) : new Date();

      events.push({
        at: at.toISOString(),
        status: doc.status || "created",
        source: shipmentDoc ? "shipment" : "package",
      });
    }
  }

  // 4️⃣ Nothing found at all
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

  // 5️⃣ Normal success
  return res.status(200).json({
    ok: true,
    tracking: trackingNumber.toString(),
    shipment: shipmentDoc,
    package: packageDoc,
    events,
  });
}
