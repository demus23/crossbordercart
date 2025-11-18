import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { Shipment } from "@/lib/models/Shipment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const shipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ ok: true, shipments });
  } catch (err: any) {
    console.error("Error listing shipments", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message ?? "Unknown error" });
  }
}
