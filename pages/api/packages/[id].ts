// pages/api/packages/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { Types } from "mongoose";

import { Activity } from "@/lib/models/Activity";
import { sendEmail } from "@/lib/email/resend";
import PackageReceivedEmail from "@/emails/PackageReceivedEmail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;
  if (!id || !Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ error: "Invalid package ID" });
  }

  await dbConnect();

  const pkg = await PackageModel.findById(id);
  if (!pkg) {
    return res.status(404).json({ error: "Package not found" });
  }

  const isOwner = pkg.user?.toString() === session.user.id;
  const isAdmin =
    session.user.role === "admin" || session.user.role === "superadmin";

  if (req.method === "GET") {
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const pkgOut = {
      _id: pkg._id.toString(),
      title: pkg.title,
      status: pkg.status,
      tracking: pkg.tracking ?? null,
      courier: pkg.courier ?? null,
      value: pkg.value ?? null,
      userEmail: pkg.userEmail ?? null,
      suiteId: pkg.suiteId ?? null,
      location: (pkg as any).location ?? null,
      lastLocation: (pkg as any).lastLocation ?? null,
      lastNote: (pkg as any).lastNote ?? null,
      adminCreatedBy: pkg.adminCreatedBy ?? null,
      shipmentId: (pkg as any).shipmentId ?? null,
      shipmentTracking: (pkg as any).shipmentTracking ?? null,
      shipmentCarrier: (pkg as any).shipmentCarrier ?? null,
      createdAt: pkg.createdAt ?? null,
      updatedAt: pkg.updatedAt ?? null,
    };

    return res.status(200).json({ package: pkgOut });
  }

  if (req.method === "PATCH") {
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!isAdmin && pkg.status !== "Pending") {
      return res.status(400).json({ error: "You can only edit Pending packages" });
    }

    const {
      title,
      tracking,
      courier,
      value,
      status,
      userEmail,
      suiteId,
      location,
      note,
    } = req.body || {};

    const oldStatus = String(pkg.status || "");
    const oldLocation = String((pkg as any).location || "");

    if (typeof title === "string") {
      pkg.title = title.trim();
    }

    if (typeof tracking === "string") {
      pkg.tracking = tracking.trim();
    }

    if (typeof courier === "string") {
      pkg.courier = courier.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      pkg.value = value;
    }

    if (typeof userEmail === "string" && isAdmin) {
      (pkg as any).userEmail = userEmail.trim().toLowerCase();
    }

    if (typeof suiteId === "string" && isAdmin) {
      (pkg as any).suiteId = suiteId.trim();
    }

    if (typeof location === "string") {
      (pkg as any).location = location.trim();
      (pkg as any).lastLocation = location.trim();
    }

    if (typeof note === "string" && note.trim()) {
      (pkg as any).lastNote = note.trim();
    }

    if (isAdmin && typeof status === "string" && status.trim()) {
      pkg.status = status.trim();
    }

    await pkg.save();

    const newStatus = String(pkg.status || "");
    const becameReceived =
      oldStatus !== "Received" && newStatus === "Received";

    if (becameReceived && (pkg as any).userEmail) {
      const alreadySent = await Activity.exists({
        action: "email.package_received.sent",
        entity: "package",
        entityId: String(pkg._id),
      });

      if (!alreadySent) {
        try {
          const appUrl = process.env.APP_URL || "http://localhost:3000";
          const trackingValue = String(pkg.tracking || "");
          const customerEmail = String((pkg as any).userEmail || "");
          const customerName =
            customerEmail.split("@")[0] || "Customer";

          await sendEmail({
            to: customerEmail,
            subject: "Your package has arrived at our warehouse",
            from: "Cross Border Cart <no-reply@crossbordercart.com>",
            react: PackageReceivedEmail({
              customerName,
              tracking: trackingValue,
              location:
                String((pkg as any).location || oldLocation || "Warehouse"),
              receivedAt: new Date().toLocaleString(),
              trackUrl: `${appUrl}/track?tracking=${encodeURIComponent(trackingValue)}`,
              brandName: "Cross Border Cart",
              supportEmail: "support.crossbordercart@gmail.com",
            }),
          });

          await Activity.create({
            action: "email.package_received.sent",
            entity: "package",
            entityId: String(pkg._id),
            details: {
              to: customerEmail,
              tracking: trackingValue,
              status: newStatus,
            },
            createdAt: new Date(),
          });
        } catch (err) {
          console.error("Failed to send package received email:", err);
        }
      }
    }

    return res.status(200).json({
      message: "Package updated",
      package: pkg,
    });
  }

  if (req.method === "DELETE") {
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!isAdmin && pkg.status !== "Pending") {
      return res.status(400).json({ error: "You can only delete Pending packages" });
    }

    await pkg.deleteOne();
    return res.status(200).json({ message: "Package deleted" });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}