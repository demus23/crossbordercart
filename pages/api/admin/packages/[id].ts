// pages/api/admin/packages/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import ActivityLog from "@/lib/models/ActivityLog";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import type { Session } from "next-auth";
// import Package from "@/lib/models/Package"; // (unused) remove to avoid lint warning
import TrackingEvent from "@/lib/models/TrackingEvent";
import { sendEmail } from "@/lib/email/resend";
import PackageReceivedEmail from "@/emails/PackageReceivedEmail";
import PackageShippedEmail from "@/emails/PackageShippedEmail";
import PackageDeliveredEmail from "@/emails/PackageDeliveredEmail";
import { sendShipmentNotification } from "@/lib/notifications/sendShipmentNotification";

const { ObjectId } = mongoose.Types;

const isAdmin = (s: any) =>
  s?.user?.role === "admin" || s?.user?.role === "superadmin";

// Canonical status normalizer (matches your model/UI elsewhere)
function normalizeStatus(input?: string) {
  if (!input) return undefined;
  const v = String(input).trim().toLowerCase();
  if (v === "canceled") return "Cancelled";
  const map: Record<string, string> = {
    pending: "Pending",
    received: "Received",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    forwarded: "Forwarded",
    "in transit": "In Transit",
    in_transit: "In Transit",
    transit: "In Transit",
    problem: "Problem", // local/fallback you used in UI
  };
  return map[v] || undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session || !isAdmin(session as any)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await dbConnect();
  const db = mongoose.connection.db as mongoose.mongo.Db | undefined;
  if (!db) return res.status(500).json({ error: "Database not connected." });

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid package id" });
  }

  const col = db.collection("packages");

  try {
    if (req.method === "GET") {
      const pkg = await col.findOne({ _id: new ObjectId(id) });
      if (!pkg) return res.status(404).json({ error: "Package not found" });
      return res.status(200).json(pkg);
    }

    if (req.method === "PUT") {
      const {
        tracking,
        courier,
        value,
        weightKg,  
        status,     // accepts many variants; normalized below
        userEmail,
        suiteId,
        location,
        note,       // optional timeline note
      } = req.body || {};

      // Fetch existing package (for diffs + safe fallbacks)
      const existing = await col.findOne({ _id: new ObjectId(id) });
      if (!existing) return res.status(404).json({ error: "Package not found" });

      const prevStatus: string | undefined = existing.status;
      const prevLocation: string | undefined = existing.location;

      // Coerce & validate "value"
      const coercedValue =
        typeof value === "number" ? value :
        typeof value === "string" ? Number(value) : undefined;
      if (coercedValue == null || Number.isNaN(coercedValue) || coercedValue < 0) {
        return res.status(400).json({ error: "Value must be a non-negative number" });
      }

      const setUpdate: Record<string, any> = { updatedAt: new Date() };

      if (typeof tracking === "string") setUpdate.tracking = tracking.trim();
      if (typeof courier === "string") setUpdate.courier = courier.trim();
      if (typeof userEmail === "string") setUpdate.userEmail = userEmail.trim().toLowerCase();
      if (typeof location === "string") setUpdate.location = location.trim();
      setUpdate.value = coercedValue;

      if (weightKg !== undefined) {
  const w = Number(weightKg);

  if (!Number.isNaN(w) && w >= 0) {
    setUpdate.weightKg = w;
  }
}

      const normalized = normalizeStatus(status);

if (normalized) {
  setUpdate.status = normalized;

  // ✅ ADD THIS BLOCK HERE
  if (normalized === "Received" && !existing.receivedAt) {
    setUpdate.receivedAt = new Date();
  }

  if (normalized === "Shipped" && !existing.shippedAt) {
    setUpdate.shippedAt = new Date();
  }

  if (normalized === "Delivered" && !existing.deliveredAt) {
    setUpdate.deliveredAt = new Date();
  }
}

      const updateOps: any = { $set: setUpdate };

      // suiteId hygiene: unset if empty/whitespace, otherwise set trimmed
      if (typeof suiteId === "string") {
        const trimmed = suiteId.trim();
        if (!trimmed) {
          updateOps.$unset = { ...(updateOps.$unset || {}), suiteId: "" };
        } else {
          updateOps.$set.suiteId = trimmed;
        }
      }

      // Decide if we should also append an inline event to the package doc
      const statusToCompare = normalized ?? prevStatus;
      const statusChanged =
        typeof normalized === "string" && normalized !== prevStatus;
      const locationChanged =
        typeof location === "string" && location.trim() !== (prevLocation ?? "");
      const hasNote = typeof note === "string" && note.trim() !== "";

      if (statusChanged || locationChanged || hasNote) {
        const inlineEvent: any = { time: new Date() };
        if (statusChanged) inlineEvent.status = normalized;
        if (locationChanged) inlineEvent.location = setUpdate.location;
        if (hasNote) inlineEvent.message = String(note).trim();

        updateOps.$push = { events: inlineEvent };
      }

      // Update the package and get the new version
     const updated = await col.findOneAndUpdate(
  { _id: new ObjectId(id) },
  updateOps,
  { returnDocument: "after" }
);

if (!updated) {
  return res.status(404).json({ error: "Package not found" });
}
      // ===============================
// 📩 PACKAGE RECEIVED EMAIL LOGIC
// ===============================

const newStatus = normalizeStatus(updated.status) || updated.status;
const oldStatus = normalizeStatus(prevStatus) || prevStatus;
const becameReceived =
  oldStatus !== "Received" && newStatus === "Received";

console.log("=== PACKAGE EMAIL DEBUG ===");
console.log("id:", id);
console.log("oldStatus:", oldStatus);
console.log("newStatus:", newStatus);
console.log("existing.userEmail:", existing.userEmail);
console.log("updated.userEmail:", updated.userEmail);
console.log("becameReceived:", becameReceived);

if (becameReceived && updated.userEmail) {
  try {
    console.log("Entered package email block");

    const alreadySent = await ActivityLog.exists({
      action: "email.package_received.sent",
      entity: "package",
      entityId: String(id),
    });

    console.log("alreadySent:", !!alreadySent);

    if (!alreadySent) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const trackingNo = updated.tracking || existing.tracking || "";
      const email = String(updated.userEmail).trim().toLowerCase();
      const name = email.split("@")[0] || "Customer";

      console.log("Sending package received email to:", email);

      await sendEmail({
        to: email,
        subject: "Your package has arrived at our warehouse",
        react: PackageReceivedEmail({
          customerName: name,
          tracking: trackingNo,
          location: updated.location || existing.location || "Warehouse",
          receivedAt: updated.receivedAt
          ? new Date(updated.receivedAt).toLocaleString()
          : new Date().toLocaleString(),
          trackUrl: `${appUrl}/track?tracking=${encodeURIComponent(trackingNo)}`,
          brandName: "Cross Border Cart",
          supportEmail: "support@crossbordercart.com",
        }),
      });

      console.log("Package received email sent successfully");

      await ActivityLog.create({
        action: "email.package_received.sent",
        entity: "package",
        entityId: String(id),
        performedBy: (session as any)?.user?.email,
        details: {
          to: email,
          tracking: trackingNo,
          status: newStatus,
        },
      });
    }
  } catch (err: any) {
    console.error("Failed to send package received email:", err?.message || err);
  }
} else {
  console.log("Skipped package email block");
}

// ===============================
// 📱 PACKAGE RECEIVED PUSH + CONSOLIDATION-READY PUSH
// ===============================
// Separate from the email block above (and not gated on updated.userEmail
// being set) since push only needs the user id, not an email address.
if (becameReceived && updated.user) {
  await sendShipmentNotification("package_received", {
    userId: updated.user,
    context: { packageTracking: updated.tracking || existing.tracking },
  });

  // Count packages that are received/processing and not yet attached to a
  // shipment — i.e. eligible for consolidation right now.
  const eligibleCount = await col.countDocuments({
    user: updated.user,
    status: { $in: ["Received", "Processing"] },
    $or: [{ shipmentId: { $exists: false } }, { shipmentId: null }],
  });

  // Notify only on the crossing (2 -> 3), not on every receipt after —
  // this package is the one that just made the count eligible, so
  // eligibleCount - 1 is what the count was immediately before it.
  if (eligibleCount >= 3 && eligibleCount - 1 < 3) {
    await sendShipmentNotification("ready_to_consolidate", {
      userId: updated.user,
      context: { count: eligibleCount },
    });
  }
}

// ===============================
// 🚀 PACKAGE SHIPPED EMAIL LOGIC
// ===============================

const becameShipped =
  oldStatus !== "Shipped" && newStatus === "Shipped";

if (becameShipped && updated.userEmail) {
  try {
    console.log("Entered SHIPPED email block");

    const alreadySent = await ActivityLog.exists({
      action: "email.package_shipped.sent",
      entity: "package",
      entityId: String(id),
    });

    console.log("shipped alreadySent:", !!alreadySent);

    if (!alreadySent) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";

      const trackingNo = updated.tracking || existing.tracking || "";
      const email = String(updated.userEmail).trim().toLowerCase();
      const name = email.split("@")[0] || "Customer";

      console.log("Sending SHIPPED email to:", email);

      await sendEmail({
        to: email,
        subject: "Your package has been shipped 🚀",
        react: PackageShippedEmail({
          customerName: name,
          tracking: trackingNo,
          location: updated.location || existing.location || "In transit",
          shippedAt: updated.shippedAt
           ? new Date(updated.shippedAt).toLocaleString()
           : new Date().toLocaleString(),
          trackUrl: `${appUrl}/track?tracking=${encodeURIComponent(trackingNo)}`,
          brandName: "Cross Border Cart",
          supportEmail: "support@crossbordercart.com",
        }),
      });

      console.log("Shipped email sent successfully");

      await ActivityLog.create({
        action: "email.package_shipped.sent",
        entity: "package",
        entityId: String(id),
        performedBy: (session as any)?.user?.email,
        details: {
          to: email,
          tracking: trackingNo,
          status: newStatus,
        },
      });
    }
  } catch (err: any) {
    console.error("Failed to send shipped email:", err?.message || err);
  }
}

// ===============================
// ✅ PACKAGE DELIVERED EMAIL LOGIC
// ===============================

const becameDelivered =
  oldStatus !== "Delivered" && newStatus === "Delivered";

if (becameDelivered && updated.userEmail) {
  try {
    console.log("Entered DELIVERED email block");

    const alreadySent = await ActivityLog.exists({
      action: "email.package_delivered.sent",
      entity: "package",
      entityId: String(id),
    });

    console.log("delivered alreadySent:", !!alreadySent);

    if (!alreadySent) {
      const trackingNo = updated.tracking || existing.tracking || "";
      const email = String(updated.userEmail).trim().toLowerCase();
      const name = email.split("@")[0] || "Customer";

      console.log("Sending DELIVERED email to:", email);

      await sendEmail({
        to: email,
        subject: "Your package has been delivered ✅",
        react: PackageDeliveredEmail({
          customerName: name,
          tracking: trackingNo,
          deliveredAt: updated.deliveredAt
           ? new Date(updated.deliveredAt).toLocaleString()
           : new Date().toLocaleString(),
          location: updated.location || existing.location || "Destination",
          brandName: "Cross Border Cart",
          supportEmail: "support@crossbordercart.com",
        }),
      });

      console.log("Delivered email sent successfully");

      await ActivityLog.create({
        action: "email.package_delivered.sent",
        entity: "package",
        entityId: String(id),
        performedBy: (session as any)?.user?.email,
        details: {
          to: email,
          tracking: trackingNo,
          status: newStatus,
        },
      });
    }
  } catch (err: any) {
    console.error("Failed to send delivered email:", err?.message || err);
  }
}

      // Create a standalone TrackingEvent (preferred source for timelines)
      if (statusChanged || locationChanged || hasNote) {
        try {
          const actorId =
            (session as any)?.user?.id ||
            (session as any)?.user?._id ||
            undefined;
          const actorName =
            (session as any)?.user?.name ||
            (session as any)?.user?.email ||
            "admin";

          // If your TrackingEvent expects ObjectId for packageId, use new ObjectId(id)
          await TrackingEvent.create({
  packageId: new ObjectId(id),
  trackingNo: updated.tracking || existing.tracking,
  status: statusChanged ? normalized : prevStatus,
  location: locationChanged ? setUpdate.location : undefined,
  note: hasNote ? String(note).trim() : undefined,
  actorId,
  actorName,
  createdAt: new Date(),
});
        } catch (e) {
          // Don't block the update if event creation fails
          console.error("Failed to create TrackingEvent:", e);
        }
      }

      // Activity log
      try {
        await ActivityLog.create({
          action: "update_package",
          entity: "package",
          entityId: String(id),
          performedBy: (session as any)?.user?.email,
          details: {
            ...setUpdate,
            ...(updateOps.$unset ? { unset: Object.keys(updateOps.$unset) } : {}),
            note: hasNote ? String(note).trim() : undefined,
          },
        });
      } catch {
        /* ignore */
      }

      return res.status(200).json(updated);
    }

    
    
    if (req.method === "DELETE") {
      const found = await col.findOne({ _id: new ObjectId(id) });
      if (!found) return res.status(404).json({ error: "Package not found" });

      await col.deleteOne({ _id: new ObjectId(id) });

      try {
        await ActivityLog.create({
          action: "delete_package",
          entity: "package",
          entityId: String(id),
          performedBy: (session as any)?.user?.email,
          details: { tracking: found.tracking },
        });
      } catch {
        /* ignore */
      }

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
