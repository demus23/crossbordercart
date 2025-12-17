// pages/api/admin/shipments/kpis.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { Shipment } from "@/lib/models/Shipment";

type KpiResponse = {
  ok: true;
  totalShipments: number;
  inTransit: number;
  delivered: number;
  problems: number;
  unpaidCount: number;
  unpaidAmount: number;
  paidAmount: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KpiResponse | { ok: false; error: string }>
) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;

  // only admin / superadmin
  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) return res.status(500).json({ ok: false, error: "DB not ready" });

  // 1) Counts by status
  const statusAgg = await Shipment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  let totalShipments = 0;
  let inTransit = 0;
  let delivered = 0;
  let problems = 0;

  for (const row of statusAgg) {
    const status = row._id as string;
    const count = row.count as number;
    totalShipments += count;

    if (status === "in_transit" || status === "out_for_delivery") {
      inTransit += count;
    }
    if (status === "delivered") {
      delivered += count;
    }
    if (status === "exception" || status === "return_to_sender" || status === "cancelled") {
      problems += count;
    }
  }

  // 2) Payment totals
  const paymentAgg = await Shipment.aggregate([
    {
      $group: {
        _id: "$paymentStatus", // "paid" | "unpaid" | undefined
        count: { $sum: 1 },
        total: { $sum: { $ifNull: ["$priceAED", 0] } },
      },
    },
  ]);

  let unpaidCount = 0;
  let unpaidAmount = 0;
  let paidAmount = 0;

  for (const row of paymentAgg) {
    const status = (row._id || "") as string;
    const count = row.count as number;
    const total = row.total as number;

    if (status === "unpaid") {
      unpaidCount = count;
      unpaidAmount = total;
    } else if (status === "paid") {
      paidAmount = total;
    }
  }

  return res.status(200).json({
    ok: true,
    totalShipments,
    inTransit,
    delivered,
    problems,
    unpaidCount,
    unpaidAmount,
    paidAmount,
  });
}
