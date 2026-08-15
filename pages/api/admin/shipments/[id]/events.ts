// pages/api/admin/shipments/[id]/events.ts

import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { Shipment, ShipmentStatus } from "@/lib/models/Shipment";
import PackageModel from "@/lib/models/Package";
import { errorMessage } from "@/utils/errors";

function buildShipmentOrQuery(idOrTracking: string) {
  const or: any[] = [];

  if (mongoose.Types.ObjectId.isValid(idOrTracking)) {
    or.push({ _id: idOrTracking });
  }

  or.push({ trackingNumber: idOrTracking });

  return or.length > 0 ? { $or: or } : { _id: null };
}

const allowedStatuses: ShipmentStatus[] = [
  "draft",
  "rated",
  "label_purchased",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "return_to_sender",
  "exception",
  "cancelled",
];

const paymentLockedStatuses: ShipmentStatus[] = [
  "in_transit",
  "out_for_delivery",
  "delivered",
];

function packageStatusFromShipment(status: ShipmentStatus) {
  switch (status) {
    case "delivered":
      return "Delivered";

    case "in_transit":
    case "out_for_delivery":
    case "label_purchased":
      return "Shipped";

    case "cancelled":
    case "return_to_sender":
      return "Cancelled";

    case "exception":
    case "rated":
      return "Processing";

    case "draft":
    default:
      return "Pending";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
  } catch (error) {
    console.error("DB error in shipment events API:", error);

    return res.status(500).json({
      ok: false,
      error: "Database connection error",
    });
  }

  const { id } = req.query as { id?: string };

  if (!id) {
    return res.status(400).json({
      ok: false,
      error: "Shipment identifier is required",
    });
  }

  const query = buildShipmentOrQuery(id);

  if (req.method === "POST") {
    try {
      const {
        status,
        description = "",
        location = "",
        code,
      } = req.body || {};

      if (!status) {
        return res.status(400).json({
          ok: false,
          error: "status is required",
        });
      }

      if (!allowedStatuses.includes(status as ShipmentStatus)) {
        return res.status(400).json({
          ok: false,
          error: "Invalid shipment status",
        });
      }

      const normalizedStatus = status as ShipmentStatus;

      const shipment = await Shipment.findOne(query);

      if (!shipment) {
        return res.status(404).json({
          ok: false,
          error: "Shipment not found",
        });
      }

      const isPaid =
        shipment.paymentStatus === "paid" ||
        shipment.isPaid === true;

      if (
        paymentLockedStatuses.includes(normalizedStatus) &&
        !isPaid
      ) {
        return res.status(403).json({
          ok: false,
          error: "Payment required before shipment can move forward",
        });
      }

      const now = new Date();

      const event = {
        status: normalizedStatus,
        description: String(description || "").trim(),
        location: String(location || "").trim(),
        code: code ? String(code).trim() : undefined,
        createdAt: now,
      };

      shipment.events = shipment.events ?? [];
      shipment.events.push(event);

      shipment.activity = shipment.activity ?? [];
      shipment.activity.push({
        at: now,
        type: "event_added",
        payload: {
          status: normalizedStatus,
          location: event.location,
          description: event.description,
          code: event.code,
        },
      });

      shipment.status = normalizedStatus;

      await shipment.save();

      const linkedPackageIds = Array.from(
        new Set(
          [
            ...(shipment.packageIds || []).map((packageId) =>
              String(packageId)
            ),
            shipment.packageId
              ? String(shipment.packageId)
              : "",
          ].filter(Boolean)
        )
      );

      if (linkedPackageIds.length > 0) {
        const packageStatus =
          packageStatusFromShipment(normalizedStatus);

        const packageUpdate: Record<string, any> = {
          shipmentTracking: shipment.trackingNumber || null,
          shipmentCarrier: shipment.carrier || null,
          status: packageStatus,
          lastLocation: event.location || "",
          lastNote:
            event.description ||
            `Shipment status changed to ${normalizedStatus}`,
          updatedAt: now,
        };

        if (normalizedStatus === "delivered") {
          packageUpdate.deliveredAt = now;
        }

        if (
          normalizedStatus === "in_transit" ||
          normalizedStatus === "out_for_delivery"
        ) {
          packageUpdate.shippedAt = now;
        }

        await PackageModel.updateMany(
          {
            _id: {
              $in: linkedPackageIds,
            },
          },
          {
            $set: packageUpdate,
          }
        );
      }

      return res.status(201).json({
        ok: true,
        event,
        shipment,
      });
    } catch (error: unknown) {
      console.error("Error adding shipment event:", error);

      return res.status(500).json({
        ok: false,
        error:
          errorMessage(error) ||
          "Failed to create event",
      });
    }
  }

  if (req.method === "GET") {
    try {
      const shipment = await Shipment.findOne(query)
        .select("events status trackingNumber")
        .lean();

      if (!shipment) {
        return res.status(404).json({
          ok: false,
          error: "Shipment not found",
        });
      }

      const events = (shipment.events || [])
        .slice()
        .sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

      return res.status(200).json({
        ok: true,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        events,
      });
    } catch (error: unknown) {
      console.error("Error fetching shipment events:", error);

      return res.status(500).json({
        ok: false,
        error:
          errorMessage(error) ||
          "Failed to fetch events",
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);

  return res.status(405).json({
    ok: false,
    error: `Method ${req.method} not allowed`,
  });
}