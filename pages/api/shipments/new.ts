import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { Shipment } from "@/lib/models/Shipment";

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

    return res.status(200).json({ ok: true, id: shipment._id });
  } catch (err: any) {
    console.error("Error creating shipment", err);
    return res
      .status(500)
      .json({ ok: false, error: err.message ?? "Unknown error" });
  }
}
