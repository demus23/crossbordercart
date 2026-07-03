// pages/api/admin/shipments/[id]/events.ts

import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";
import { errorMessage } from "@/utils/errors";

function buildShipmentOrQuery(idOrTracking: string) {
  const or: any[] = [];

  // if it looks like a valid ObjectId, allow search by _id
  if (mongoose.Types.ObjectId.isValid(idOrTracking)) {
    or.push({ _id: idOrTracking });
  }

  // always allow search by trackingNumber
  or.push({ trackingNumber: idOrTracking });

  // if somehow neither, just return impossible query to be safe
  return or.length > 0 ? { $or: or } : { _id: null };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
  } catch (e) {
    console.error("DB error in shipment events API:", e);
    return res
      .status(500)
      .json({ ok: false, error: "Database connection error" });
  }

  const { id } = req.query as { id?: string };
  if (!id) {
    return res.status(400).json({
      ok: false,
      error: "Shipment identifier (:id in the route) is required",
    });
  }

  const query = buildShipmentOrQuery(id);

  if (req.method === "POST") {
    try {
      const { status, description = "", location = "", code } = req.body || {};
      

      if (!status) {
        return res
          .status(400)
          .json({ ok: false, error: "status is required" });
      }

            const shipment = await Shipment.findOne(query);
      if (!shipment) {
        return res
          .status(404)
          .json({ ok: false, error: "Shipment not found" });
      }
      if (!shipment.isPaid && ["in_transit", "out_for_delivery", "delivered"].includes(status)) {
  return res.status(400).json({
    error: "Payment required before shipment can proceed",
  });
}

      const lockedStatuses = ["in_transit", "out_for_delivery", "delivered"];

      if (
        lockedStatuses.includes(status) &&
        shipment.paymentStatus !== "paid"
      ) {
        return res.status(403).json({
          ok: false,
          error: "Payment required before shipment can move forward",
        });
      }

      const event = {
        status,
        description,
        location,
        code,
        createdAt: new Date(),
      };

      // @ts-ignore – mongoose typing is not perfect here
      shipment.events = shipment.events || [];
      // @ts-ignore
      shipment.events.push(event);

      // keep main status in sync with last event
      // @ts-ignore
      shipment.status = status;

      await shipment.save();

      return res.status(201).json({ ok: true, event });
    } catch (e: unknown) {
      console.error("Error adding shipment event:", e);
      return res.status(500).json({
        ok: false,
        error: errorMessage(e) || "Failed to create event",
      });
    }
  }

  if (req.method === "GET") {
    try {
      const shipment = await Shipment.findOne(query).select("events");
      if (!shipment) {
        return res
          .status(404)
          .json({ ok: false, error: "Shipment not found" });
      }

      // @ts-ignore
      const events = (shipment.events || []).slice().sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return res.status(200).json({ ok: true, events });
    } catch (e: unknown) {
      console.error("Error fetching shipment events:", e);
      return res.status(500).json({
        ok: false,
        error: errorMessage(e) || "Failed to fetch events",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end("Method Not Allowed");
}
