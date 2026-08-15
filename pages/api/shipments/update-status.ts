// pages/api/shipments/update-status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import { Shipment, type ShipmentStatus } from "@/lib/models/Shipment";
import PackageModel from "@/lib/models/Package";
import { sendShipmentNotification, shipmentStatusToEvent } from "@/lib/notifications/sendShipmentNotification";

type AdminStatus = "Picked Up" | "In Transit" | "Out for Delivery" | "Delivered" | "Problem";

function mapAdminToShipmentStatus(s: AdminStatus): ShipmentStatus {
  switch (s) {
    case "Picked Up":
      return "in_transit";
    case "In Transit":
      return "in_transit";
    case "Out for Delivery":
      return "out_for_delivery";
    case "Delivered":
      return "delivered";
    case "Problem":
      return "exception";
    default:
      return "draft";
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // 👇 This is the bit that fixes the TS error
  const session = await getServerSession(req, res, authOptions as any);
  const user = (session as any)?.user;

  if (!user || user.role !== "admin") {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const { shipmentId, status } = req.body as { shipmentId?: string; status?: AdminStatus };

  if (!shipmentId || !status) {
    return res.status(400).json({ ok: false, error: "shipmentId and status are required" });
  }

  await dbConnect();

  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    return res.status(404).json({ ok: false, error: "Shipment not found" });
  }

  const newStatus: ShipmentStatus = mapAdminToShipmentStatus(status);
  const now = new Date();
  const previousStatus = shipment.status; // capture before reassigning — was previously logged as itself

  shipment.status = newStatus;
  shipment.activity = shipment.activity || [];
  shipment.activity.push({
    at: now,
    type: "status_change",
    payload: { from: previousStatus, to: newStatus },
  });

  await shipment.save();

  if (previousStatus !== newStatus) {
    const event = shipmentStatusToEvent(newStatus);
    if (event) {
      await sendShipmentNotification(event, {
        userId: shipment.userId,
        context: { trackingNumber: shipment.trackingNumber },
      });
    }
  }

  await PackageModel.updateMany(
    { tracking: shipment._id.toString() },
    {
      $set: {
        status:
          status === "Problem"
            ? "Problem"
            : status === "Delivered"
            ? "Delivered"
            : "Shipped",
        lastNote: `Status updated to ${status}`,
        lastLocation: shipment.to?.city ?? "",
        updatedAt: now,
      },
    }
  );

  return res.status(200).json({ ok: true });
}
