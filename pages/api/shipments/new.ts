// pages/api/shipments/new.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { Shipment, ShipmentStatus } from "@/lib/models/Shipment";
import PackageModel from "@/lib/models/Package";
import { Rate, IRate } from "@/lib/models/Rate";
import { calculateShippingPrice } from "@/lib/pricing";


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

function normalizeCountryCode(country?: string) {
  const value = String(country || "").trim().toUpperCase();

  const map: Record<string, string> = {
    KENYA: "KE",
    KE: "KE",
    UGANDA: "UG",
    UG: "UG",
    ETHIOPIA: "ET",
    ET: "ET",
    "SOUTH SUDAN": "SS",
    SS: "SS",
    UAE: "AE",
    "UNITED ARAB EMIRATES": "AE",
    AE: "AE",
  };

  return map[value] || value;
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

  const session: any = await getServerSession(
  req,
  res,
  authOptions as any
);

const role = session?.user?.role;

if (
  !session?.user?.id ||
  !["admin", "superadmin"].includes(role)
) {
  return res.status(401).json({
    ok: false,
    error: "Unauthorized",
  });
}

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

    const requestedPackageIds = Array.from(
  new Set(
    (Array.isArray(body.packageIds) ? body.packageIds : [])
      .filter(
        (id): id is string =>
          typeof id === "string" && isValidObjectId(id)
      )
  )
);

if (requestedPackageIds.length === 0) {
  return res.status(400).json({
    ok: false,
    error: "At least one valid package is required.",
  });
}

const linkedPackages = await PackageModel.find({
  _id: { $in: requestedPackageIds },
}).lean();

if (linkedPackages.length !== requestedPackageIds.length) {
  return res.status(400).json({
    ok: false,
    error: "One or more selected packages could not be found.",
  });
}

const alreadyShippedPackage = linkedPackages.find(
  (pkg: any) => pkg.shipmentId
);

if (alreadyShippedPackage) {
  return res.status(409).json({
    ok: false,
    error: `Package ${
      (alreadyShippedPackage as any).tracking || ""
    } already belongs to a shipment.`,
  });
}

const allowedStatuses = [
  "Pending",
  "Received",
  "Processing",
];

const invalidStatusPackage = linkedPackages.find(
  (pkg: any) => !allowedStatuses.includes(pkg.status)
);

if (invalidStatusPackage) {
  return res.status(400).json({
    ok: false,
    error: `Package ${
      (invalidStatusPackage as any).tracking || ""
    } cannot be shipped because its status is ${
      (invalidStatusPackage as any).status || "unknown"
    }.`,
  });
}

const packageUserIds = Array.from(
  new Set(
    linkedPackages
      .map((pkg: any) => String(pkg.user || ""))
      .filter(Boolean)
  )
);

if (packageUserIds.length !== 1) {
  return res.status(400).json({
    ok: false,
    error:
      "Selected packages belong to different customers. Create separate shipments.",
  });
}

const finalPackageIds = linkedPackages.map(
  (pkg: any) => pkg._id
);

const firstPackage: any = linkedPackages[0];

const finalUserId = firstPackage.user;

const finalCustomerEmail =
  firstPackage.userEmail ||
  body.customerEmail ||
  null;

const finalSuiteId =
  firstPackage.suiteId ||
  null;

// Always calculate weight from the selected packages
const packageWeight = linkedPackages.reduce(
  (total: number, pkg: any) =>
    total + Number(pkg.weightKg || 0),
  0
);

if (packageWeight <= 0) {
  return res.status(400).json({
    ok: false,
    error:
      "Selected packages must have a valid weight before creating a shipment.",
  });
}

weight = Number(packageWeight.toFixed(2));

    // ✅ AUTO PRICING
    const destinationCode = normalizeCountryCode(to.country);
    const rate = (await Rate.findOne({
      countryCode: destinationCode,
      active: true,
    }).lean()) as IRate | null;

    if (!rate) {
  return res.status(400).json({
    ok: false,
    error: `No active shipping rate found for ${destinationCode}.`,
  });
}

    const pricingBreakdown = calculateShippingPrice({
  weightKg: weight,
  pricePerKg: rate.pricePerKg,
  fuelPercent: rate.fuelPercent,
  profitPercent: rate.profitPercent,
  stripePercent: rate.stripePercent,
});

const finalPriceAED = pricingBreakdown.total;

    const shipment = await Shipment.create({
      from,
      to,

      speed: body.speed,
      carrier: body.carrier,
      carrierSlug: body.carrierSlug || null,
      service: body.service,

      trackingNumber: generateTrackingNumber(),
      packageTrackingNumber:
  linkedPackages
    .map((pkg: any) => pkg.tracking)
    .filter(Boolean)
    .join(", ") || null,
      status,

      priceAED: finalPriceAED,
      currency,

      customerEmail: finalCustomerEmail,
      userEmail: finalCustomerEmail,

      packageIds: finalPackageIds,
      packageId: finalPackageIds[0] || null,
      userId: finalUserId,
      user: finalUserId,
      suiteId: finalSuiteId,

      paymentStatus: "unpaid",
      isPaid: false,

      parcel: { weight, length, width, height },
      weightKg: weight,

      ratesSnapshot: rate
        ? [
            {
              country: rate.country,
              countryCode: rate.countryCode,
              pricePerKg: rate.pricePerKg,
              fuelPercent: rate.fuelPercent,
              profitPercent: rate.profitPercent,
              stripePercent: rate.stripePercent,
              breakdown: pricingBreakdown,
            },
          ]
        : [],

      events: [],
      activity: [],
    });

    await PackageModel.updateMany(
  {
    _id: { $in: finalPackageIds },
    $or: [
      { shipmentId: { $exists: false } },
      { shipmentId: null },
    ],
  },
  {
    $set: {
      shipmentId: shipment._id,
      shipmentTracking: shipment.trackingNumber,
      shipmentCarrier: shipment.carrier || null,
      status: "Shipped",
      lastNote: "Shipment created",
      lastLocation: shipment.from?.city || "Dubai",
      shippedAt: new Date(),
    },
  }
);

    return res.status(200).json({
      ok: true,
      id: shipment._id,
      priceAED: finalPriceAED,
      pricingBreakdown,
      autoPriced: true,
      destinationCode,
      linkedPackageFound: finalPackageIds.length > 0,
      linkedPackageIds: finalPackageIds.map(String),
      packageCount: finalPackageIds.length,
    });
  } catch (err: any) {
    console.error("Error creating shipment", err);
    return res.status(500).json({
      ok: false,
      error: err?.message ?? "Unknown error",
    });
  }
}