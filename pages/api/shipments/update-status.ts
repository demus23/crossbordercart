// pages/api/shipments/update-status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { Shipment, ShipmentStatus } from "@/lib/models/Shipment";

type Body = {
  id?: string;
  status?: ShipmentStatus;
  location?: string | null;
  message?: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: true } | { ok: false; error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ ok: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id, status, location, message } = (req.body || {}) as Body;

    if (!id) {
      return res.status(400).json({ ok: false, error: "id is required" });
    }
    if (!status) {
      return res.status(400).json({ ok: false, error: "status is required" });
    }

    await dbConnect();

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ ok: false, error: "Shipment not found" });
    }

    // ✅ update canonical status (snake_case)
    shipment.status = status;

    // ✅ push activity item that matches schema:
    // { at, type, payload }
    shipment.activity = shipment.activity || [];
    shipment.activity.unshift({
      at: new Date(),
      type: "status",
      payload: {
        status,
        location: location ?? null,
        message: message ?? null,
      },
    });

    await shipment.save();

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("POST /api/shipments/update-status error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Server error" });
  }
}
