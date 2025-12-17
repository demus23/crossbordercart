// pages/api/admin/shipments/debug.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("DB error in shipments debug API:", e);
    return res
      .status(500)
      .json({ ok: false, error: "Database connection error" });
  }

  try {
    const shipments = await Shipment.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id trackingNumber status createdAt to from");

    return res.status(200).json({ ok: true, shipments });
  } catch (e) {
    console.error("Error fetching shipments:", e);
    return res
      .status(500)
      .json({ ok: false, error: "Failed to fetch shipments" });
  }
}
