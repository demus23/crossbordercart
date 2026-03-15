import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";
import TrackingEvent from "@/lib/models/TrackingEvent";

type LiveItem = {
  _id: string;
  tracking: string;
  status: string;
  lastLocation?: string;
  lastNote?: string;
  lastUpdate?: string; // ISO
  value?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const session: any = await getServerSession(req, res, authOptions as any);
  const userId = session?.user?.id;
  if (!userId) return res.status(401).json({ ok: false, error: "Unauthorized" });

  await dbConnect();

  // 1) get user's packages
  const pkgs = await PackageModel.find({ user: userId })
    .select("_id tracking status value lastLocation lastNote updatedAt")
    .lean();

  const trackingNos = pkgs
    .map((p: any) => p.tracking)
    .filter(Boolean)
    .map(String);

  // 2) get latest TrackingEvent for each trackingNo (fast enough for user-level lists)
  let latestByTracking: Record<string, any> = {};
  if (trackingNos.length > 0) {
    const latestEvents = await TrackingEvent.aggregate([
      { $match: { trackingNo: { $in: trackingNos } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$trackingNo",
          status: { $first: "$status" },
          location: { $first: "$location" },
          note: { $first: "$note" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]);

    for (const e of latestEvents) {
      latestByTracking[String(e._id)] = e;
    }
  }

  // 3) merge: event overrides package display fields
  const items: LiveItem[] = pkgs.map((p: any) => {
    const t = p.tracking ? String(p.tracking) : "";
    const ev = t ? latestByTracking[t] : null;

    return {
      _id: String(p._id),
      tracking: t || String(p._id),
      status: ev?.status || p.status || "Pending",
      lastLocation: ev?.location || p.lastLocation || "",
      lastNote: ev?.note || p.lastNote || "",
      lastUpdate: ev?.createdAt
        ? new Date(ev.createdAt).toISOString()
        : p.updatedAt
        ? new Date(p.updatedAt).toISOString()
        : undefined,
      value: p.value ?? 0,
    };
  });

  // helpful “top” numbers for dashboard cards
  const shippedLike = new Set(["Shipped", "In Transit", "IN_TRANSIT"]);
  const deliveredLike = new Set(["Delivered", "DELIVERED"]);

  const summary = {
    total: items.length,
    shippedOrInTransit: items.filter((x) => shippedLike.has(x.status)).length,
    delivered: items.filter((x) => deliveredLike.has(x.status)).length,
    latest: items
      .filter((x) => x.lastUpdate)
      .sort((a, b) => new Date(b.lastUpdate!).getTime() - new Date(a.lastUpdate!).getTime())[0] || null,
  };

  return res.status(200).json({ ok: true, items, summary });
}
