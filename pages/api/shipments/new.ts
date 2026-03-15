// pages/api/shipments/new.ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { Shipment, ShipmentStatus } from "@/lib/models/Shipment";
import PackageModel from "@/lib/models/Package";

type Address = {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
};

type Body = Partial<{
  from: Address;
  to: Address;

  // link to packages
  packageIds: string[];
  packageId: string;
  userId: string;

  // NEW schema
  parcel: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };

  // OLD schema fallback
  weightKg: number;
  dims: {
    L?: number;
    W?: number;
    H?: number;
    length?: number;
    width?: number;
    height?: number;
  };

  speed: string;
  carrier: string;        // display name e.g. "Aramex"
  carrierSlug: string;    // canonical e.g. "aramex"
  service: string;

  trackingNumber: string; // carrier tracking
  status: ShipmentStatus | string;

  priceAED: number;
  customerEmail: string;

  currency: string;
}>;

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const body = req.body as Body;

    const { from, to } = body;

    if (!from || !to) {
      return res
        .status(400)
        .json({ ok: false, error: "Both from and to addresses are required." });
    }

    // 1) Normalize parcel dimensions
    let weight: number | undefined;
    let length: number | undefined;
    let width: number | undefined;
    let height: number | undefined;

    // Prefer NEW shape if present
    if (
      body.parcel?.weight != null &&
      body.parcel.length != null &&
      body.parcel.width != null &&
      body.parcel.height != null
    ) {
      weight = Number(body.parcel.weight);
      length = Number(body.parcel.length);
      width = Number(body.parcel.width);
      height = Number(body.parcel.height);
    } else if (body.weightKg != null && body.dims) {
      // Fall back to OLD shape
      weight = Number(body.weightKg);
      length = Number(body.dims.length ?? body.dims.L);
      width = Number(body.dims.width ?? body.dims.W);
      height = Number(body.dims.height ?? body.dims.H);
    }

    if (!weight || !length || !width || !height) {
      return res.status(400).json({
        ok: false,
        error: "Invalid parcel - weight, length, width, height are required.",
      });
    }

    // currency default
    const currency = (body.currency || "AED").toUpperCase();

    // status default must match schema union (snake_case)
    const status =
      (body.status as ShipmentStatus) ||
      ("draft" as ShipmentStatus);

    // 2) Create shipment
    const shipment = await Shipment.create({
      from,
      to,

      speed: body.speed,
      carrier: body.carrier,
      carrierSlug: body.carrierSlug || null,
      service: body.service,

      trackingNumber: body.trackingNumber || null,
      status,

      priceAED: body.priceAED,
      currency,

      customerEmail: body.customerEmail || null,

      packageIds: Array.isArray(body.packageIds)
        ? body.packageIds.filter((id) => typeof id === "string" && isValidObjectId(id))
        : [],
      userId: body.userId && isValidObjectId(body.userId) ? body.userId : null,

      parcel: { weight, length, width, height },
      weightKg: weight,
    });

    // Use real carrier tracking if provided, else fallback to shipment id
    const publicTracking = shipment.trackingNumber || shipment._id.toString();

    // 3) Link packages (bulk first)
    if (Array.isArray(body.packageIds) && body.packageIds.length > 0) {
      const ids = body.packageIds
        .filter((id) => typeof id === "string" && isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (ids.length > 0) {
        await PackageModel.updateMany(
          { _id: { $in: ids } },
          {
            $set: {
              shipmentId: shipment._id,
              shipmentTracking: publicTracking,
              shipmentCarrier: shipment.carrier ?? null,

              // keep old fields in sync (optional)
              tracking: publicTracking,
              courier: shipment.carrier ?? null,
              status: "Shipped",
              lastNote: "Shipment created",
              lastLocation: shipment.from?.city ?? "",
              userEmail: shipment.customerEmail ?? undefined,
            },
          }
        );
      }
    }

    // 4) Link single packageId
    const singlePackageId = typeof body.packageId === "string" ? body.packageId.trim() : "";
    if (singlePackageId) {
      if (!isValidObjectId(singlePackageId)) {
        return res
          .status(400)
          .json({ ok: false, error: "Invalid packageId (must be Mongo ObjectId)" });
      }

      await PackageModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(singlePackageId),
        {
          $set: {
            shipmentId: shipment._id,
            shipmentTracking: publicTracking,
            shipmentCarrier: shipment.carrier ?? null,

            tracking: publicTracking,
            courier: shipment.carrier ?? null,
            status: "Shipped",
            lastNote: "Shipment created",
            lastLocation: shipment.from?.city ?? "",
            userEmail: shipment.customerEmail ?? undefined,
          },
        },
        { new: true }
      );
    }

    return res.status(200).json({ ok: true, id: shipment._id });
  } catch (err: any) {
    console.error("Error creating shipment", err);
    return res.status(500).json({
      ok: false,
      error: err?.message ?? "Unknown error",
    });
  }
}
