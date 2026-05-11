// pages/api/mypackages/forward.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";
import ActivityLog from "@/lib/models/ActivityLog";
import { Shipment } from "@/lib/models/Shipment";
import { authOptions } from "../auth/[...nextauth]";

type AppSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
} | null;

function generateTrackingNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `CBC-${y}${m}${d}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as AppSession;

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { packageId } = req.body || {};

  if (!packageId || !Types.ObjectId.isValid(packageId)) {
    return res.status(400).json({
      error: "Invalid package ID",
      received: packageId,
    });
  }

  await dbConnect();

  const pkg = await PackageModel.findById(packageId).lean();

  if (!pkg) {
    return res.status(404).json({ error: "Package not found" });
  }

  const isOwner = String((pkg as any).user) === String(session.user.id);
  const isAdmin =
    session.user.role === "admin" || session.user.role === "superadmin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const status = String((pkg as any).status || "").toLowerCase();

  if (!["received", "processing"].includes(status)) {
    return res.status(400).json({
      error: "Forwarding can only be requested after the package is received.",
    });
  }

  if ((pkg as any).forwardRequested && (pkg as any).shipmentId) {
    return res.status(200).json({
      ok: true,
      message: "Forwarding already requested",
      shipmentId: String((pkg as any).shipmentId),
      trackingNumber: (pkg as any).shipmentTracking || null,
    });
  }

  const trackingNumber = generateTrackingNumber();

  const shipment = await Shipment.create({
    from: {
      name: "CrossBorderCart Warehouse",
      line1: "Mamzar / Dubai",
      city: "Dubai",
      country: "AE",
      phone: "+971-52-535-0353",
      email: "support.crossbordercart@gmail.com",
    },
    to: {
      name: session.user.name || "Customer",
      line1: "Address pending - admin review",
      city: "Pending",
      country: "AE",
      email: session.user.email || (pkg as any).userEmail || undefined,
    },

    speed: "standard",
    carrier: "Pending",
    carrierSlug: null,
    service: "Forwarding request",

    trackingNumber,
    status: "draft",

    priceAED: 0,
    currency: "AED",
    customerEmail: session.user.email || (pkg as any).userEmail || null,

    packageIds: [new mongoose.Types.ObjectId(String((pkg as any)._id))],
    userId: new mongoose.Types.ObjectId(String(session.user.id)),

    parcel: {
      weight: 1,
      length: 1,
      width: 1,
      height: 1,
    },
    weightKg: 1,
  });

  await PackageModel.updateOne(
    { _id: new mongoose.Types.ObjectId(packageId) },
    {
      $set: {
        forwardRequested: true,
        forwardRequestedAt: new Date(),
        forwardRequestedBy: session.user.id,

        shipmentId: shipment._id,
        shipmentTracking: trackingNumber,
        shipmentCarrier: "Pending",

        status: "Processing",
        lastNote: "Forwarding requested by customer",
      },
    }
  );

  try {
    await ActivityLog.create({
      action: "package.forwarding_requested",
      entity: "package",
      entityId: String(packageId),
      performedBy: session.user.email || undefined,
      details: {
        packageTracking: (pkg as any).tracking,
        shipmentId: String(shipment._id),
        shipmentTracking: trackingNumber,
        userEmail: session.user.email || (pkg as any).userEmail,
      },
    });
  } catch {}

  return res.status(200).json({
    ok: true,
    message: "Forwarding requested and draft shipment created",
    shipmentId: String(shipment._id),
    trackingNumber,
  });
}