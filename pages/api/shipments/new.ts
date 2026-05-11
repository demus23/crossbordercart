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
  packageIds: string[];
  packageId: string;
  userId: string;
  parcel: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
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
  carrier: string;
  carrierSlug: string;
  service: string;
  trackingNumber: string;
  status: ShipmentStatus | string;
  priceAED: number;
  customerEmail: string;
  currency: string;
}>;

function generateTrackingNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CBC-${y}${m}${d}-${random}`;
}

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function findPackage(input: string) {
  const value = input.trim();
  if (!value) return null;

  if (isValidObjectId(value)) {
    const byId = await PackageModel.findById(value).lean();
    if (byId) return byId as any;
  }

  return PackageModel.findOne({
    $or: [
      { tracking: value },
      { trackingNumber: value },
      { carrierTrackingNumber: value },
      { courierTrackingNumber: value },
      { trackingNo: value },
    ],
  }).lean() as any;
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
      return res.status(400).json({
        ok: false,
        error: "Both from and to addresses are required.",
      });
    }

    let weight: number | undefined;
    let length: number | undefined;
    let width: number | undefined;
    let height: number | undefined;

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

    const currency = (body.currency || "AED").toUpperCase();
    const status = (body.status as ShipmentStatus) || ("draft" as ShipmentStatus);

    // ✅ IMPORTANT:
    // Try packageId first. If empty, use trackingNumber like AR245.
    const packageInput =
      typeof body.packageId === "string" && body.packageId.trim()
        ? body.packageId.trim()
        : typeof body.trackingNumber === "string"
        ? body.trackingNumber.trim()
        : "";

    const linkedPackage = await findPackage(packageInput);

    const linkedPackageId = linkedPackage?._id || null;

    const finalPackageIds = linkedPackageId
      ? [linkedPackageId]
      : Array.isArray(body.packageIds)
      ? body.packageIds.filter((id) => typeof id === "string" && isValidObjectId(id))
      : [];

    const finalUserId =
      linkedPackage?.userId ||
      linkedPackage?.user ||
      linkedPackage?.ownerId ||
      (body.userId && isValidObjectId(body.userId) ? body.userId : null);

    const finalCustomerEmail =
      linkedPackage?.customerEmail ||
      linkedPackage?.userEmail ||
      linkedPackage?.email ||
      body.customerEmail ||
      null;

    const finalSuiteId =
      linkedPackage?.suiteId ||
      linkedPackage?.suite ||
      linkedPackage?.suiteNumber ||
      null;

    const shipment = await Shipment.create({
      from,
      to,

      speed: body.speed,
      carrier: body.carrier,
      carrierSlug: body.carrierSlug || null,
      service: body.service,

     trackingNumber: generateTrackingNumber(),
     packageTrackingNumber: body.trackingNumber?.trim() || packageInput || null,
      status,

      priceAED: body.priceAED,
      currency,

      customerEmail: finalCustomerEmail,
      userEmail: finalCustomerEmail,

      packageIds: finalPackageIds,
      packageId: linkedPackageId,
      userId: finalUserId,
      user: finalUserId,
      suiteId: finalSuiteId,

      paymentStatus: "unpaid",
      isPaid: false,

      parcel: { weight, length, width, height },
      weightKg: weight,

      ratesSnapshot: [],
      events: [],
      activity: [],
    });

    const publicTracking = shipment.trackingNumber;

    // ✅ update linked package if found by AR245 / Mongo ID
  if (linkedPackageId) {
  await PackageModel.findByIdAndUpdate(linkedPackageId, {
    $set: {
      shipmentId: shipment._id,
      shipmentTracking: shipment.trackingNumber,
      shipmentCarrier: shipment.carrier || null,
      shipmentStatus: shipment.status || "draft",
      status: "Shipped",
      lastNote: "Shipment created",
      lastLocation: shipment.from?.city || "Dubai",
      updatedAt: new Date(),
    },
  });
}

    return res.status(200).json({
      ok: true,
      id: shipment._id,
      linkedPackageFound: !!linkedPackage,
      linkedPackageId: linkedPackageId ? String(linkedPackageId) : null,
    });
  } catch (err: any) {
    console.error("Error creating shipment", err);
    return res.status(500).json({
      ok: false,
      error: err?.message ?? "Unknown error",
    });
  }
}