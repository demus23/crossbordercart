import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";
import TrackingEvent from "@/lib/models/TrackingEvent";

const STATUS_IN_TRANSIT = new Set(["Shipped", "In Transit", "IN_TRANSIT"]);
const STATUS_DELIVERED = new Set(["Delivered", "DELIVERED"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    // get latest 6 tracking events (global)
    const latestEvents = await TrackingEvent.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const trackingNos = latestEvents.map((e: any) => String(e.trackingNo)).filter(Boolean);

    // lookup packages for those tracking numbers
    const pkgs = await PackageModel.find({ tracking: { $in: trackingNos } })
      .select("tracking courier status value suiteId updatedAt")
      .lean();

    const pkgByTracking: Record<string, any> = {};
    for (const p of pkgs as any[]) pkgByTracking[String(p.tracking)] = p;

    // build "latest" list for homepage
    const latest = latestEvents.map((e: any) => {
      const trackingNo = String(e.trackingNo);
      const pkg = pkgByTracking[trackingNo];

      return {
        id: String(e._id),
        trackingNo,
        status: String(e.status || pkg?.status || "Pending"),
        location: String(e.location || ""),
        note: String(e.note || ""),
        courier: String(pkg?.courier || ""),
        updatedAt: e.createdAt ? new Date(e.createdAt).toISOString() : undefined,
      };
    });

    // stats (global)
    const inTransit = await PackageModel.countDocuments({ status: { $in: Array.from(STATUS_IN_TRANSIT) } });
    const delivered = await PackageModel.countDocuments({ status: { $in: Array.from(STATUS_DELIVERED) } });

    return res.status(200).json({
  ok: true,
  updatedAt: new Date().toISOString(),     // optional (nice for “Updated: 11:32”)
  stats: {
    inTransit,
    delivered,
    updates: latest.length,                // ✅ this fixes “undefined”
    countries: 0,
  },
  latest,
});
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
}
