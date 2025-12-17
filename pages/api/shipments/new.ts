import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { Shipment } from "@/lib/models/Shipment";
import mongoose from "mongoose";
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
  userId: string;
  packageId: string;  


  // NEW schema
  parcel: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };

  // OLD schema
  weightKg: number;
  weight: number;
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
  service: string;
  priceAED: number;
  customerEmail: string;

  // NEW: currency for schema
  currency: string;
}>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ ok: false, error: "Method Not Allowed" });
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
      body.parcel?.weight &&
      body.parcel.length &&
      body.parcel.width &&
      body.parcel.height
    ) {
      weight = body.parcel.weight;
      length = body.parcel.length;
      width = body.parcel.width;
      height = body.parcel.height;
    } else if (body.weightKg && body.dims) {
      // Fall back to OLD shape
      weight = body.weightKg;
      length = body.dims.length ?? body.dims.L;
      width = body.dims.width ?? body.dims.W;
      height = body.dims.height ?? body.dims.H;
    }

    if (!weight || !length || !width || !height) {
      return res.status(400).json({
        ok: false,
        error:
          "Invalid parcel - weight, length, width, height are required.",
      });
    }

    // NEW: currency (default AED if not provided)
    const currency = body.currency || "AED";

    // 2) Build document to satisfy BOTH old and new schemas
    const shipment = await Shipment.create({
      from,
      to,
      speed: body.speed,
      carrier: body.carrier,
      service: body.service,
      priceAED: body.priceAED,
       packageIds: body.packageIds || [],
  userId: body.userId || null,

      // currency required by schema
      currency,

      // NEW schema field
      parcel: {
        weight,
        length,
        width,
        height,
      },

      // OLD schema field (so Mongo doesn't complain)
      weightKg: weight,
    });

    // ✅ Optional link: if admin passed a packageId, tie this shipment to that package
const rawPackageId =
  typeof req.body.packageId === "string" ? req.body.packageId.trim() : "";

if (rawPackageId) {
  // if it's not a proper ObjectId, return a clean 400 instead of crashing
  if (!mongoose.Types.ObjectId.isValid(rawPackageId)) {
    return res
      .status(400)
      .json({ ok: false, error: "Invalid packageId (must be Mongo ObjectId)" });
  }

  const packageObjectId = new mongoose.Types.ObjectId(rawPackageId);

  await PackageModel.findByIdAndUpdate(
    packageObjectId,
    {
      $set: {
        tracking: shipment._id.toString(),           // public tracking number
        courier: shipment.carrier ?? null,
        status: "Shipped",                           // your PackageStatus enum
        lastNote: "Shipment created",
        lastLocation: shipment.from?.city ?? "",
        userEmail: shipment.customerEmail ?? undefined,
      },
    },
    { new: true }
  );
}


    // link packages → shipment
if (Array.isArray(req.body.packageIds) && req.body.packageIds.length > 0) {
  await PackageModel.updateMany(
    { _id: { $in: req.body.packageIds } },
    {
      $set: {
        shipmentId: shipment._id,
        shipmentTracking: shipment._id.toString(), // using shipment id as tracking for now
        shipmentCarrier: shipment.carrier ?? null,
        status: "Shipped",
      },
    }
  );
}
 // 👇 If this shipment is for an existing Package, link it
if (body.packageId && typeof body.packageId === "string") {
  const pkgId = body.packageId.trim();

  try {
    await PackageModel.findByIdAndUpdate(
      pkgId,
      {
        $set: {
          shipmentId: shipment._id,
          shipmentTracking: shipment._id.toString(),    // we use shipment _id as tracking number
          shipmentCarrier: shipment.carrier ?? undefined,

          // also keep old fields in sync
          tracking: shipment._id.toString(),
          courier: shipment.carrier ?? undefined,
          status: "Shipped",                            // from your PackageStatus enum
          lastNote: "Shipment created",
          lastLocation: shipment.to?.city || "",
        },
      },
      { new: true }
    );
  } catch (e) {
    console.error("Failed to link shipment to package:", e);
  }
}


    // ✅ If admin passed a packageId, link it to this shipment
const packageId =
  typeof req.body.packageId === "string" ? req.body.packageId.trim() : "";

if (packageId) {
  await PackageModel.findByIdAndUpdate(
    packageId,
    {
      $set: {
        tracking: shipment._id.toString(),      // public tracking number
        courier: shipment.carrier ?? null,
        status: "Shipped",                      // from your PackageStatus enum
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
    return res
      .status(500)
      .json({ ok: false, error: err.message ?? "Unknown error" });
  }
}
