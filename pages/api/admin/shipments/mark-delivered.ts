import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { Shipment } from "@/lib/models/Shipment";
import { sendShipmentNotification, shipmentStatusToEvent } from "@/lib/notifications/sendShipmentNotification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id || !["admin","superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }
  const { shipmentId, trackingNumber, status = "delivered" } = req.body || {};
  if (!shipmentId && !trackingNumber) {
    return res.status(400).json({ ok: false, error: "shipmentId or trackingNumber required" });
  }

  await dbConnect();

  const filter: any = shipmentId
    ? { $or: [{ _id: new mongoose.Types.ObjectId(String(shipmentId)) }, { shipmentId: String(shipmentId) }] }
    : { trackingNumber: String(trackingNumber) };

  // Use the Shipment model (not a raw collection update) so we get the
  // previous status back and can trigger a notification off it.
  const before = await Shipment.findOne(filter).select("status").lean();
  if (!before) return res.status(404).json({ ok: false, error: "Shipment not found" });

  const updated = await Shipment.findOneAndUpdate(
    filter,
    { $set: { status: String(status), updatedAt: new Date() } },
    { new: true }
  ).select("userId trackingNumber status").lean();

  if (!updated) return res.status(404).json({ ok: false, error: "Shipment not found" });

  if ((before as any).status !== (updated as any).status) {
    const event = shipmentStatusToEvent((updated as any).status);
    if (event) {
      await sendShipmentNotification(event, {
        userId: (updated as any).userId,
        context: { trackingNumber: (updated as any).trackingNumber },
      });
    }
  }

  return res.status(200).json({ ok: true });
}
