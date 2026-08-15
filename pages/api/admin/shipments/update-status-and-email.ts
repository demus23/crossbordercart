// pages/api/admin/shipments/update-status-and-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { Shipment } from "@/lib/models/Shipment";
import { sendMail } from "@/lib/email/nodemailer";
import { errorMessage } from "@/utils/errors";
import { sendShipmentNotification, shipmentStatusToEvent } from "@/lib/notifications/sendShipmentNotification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Only admin/superadmin can call this
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { shipmentId, status, toEmail } = req.body || {};

  if (!shipmentId) {
    return res.status(400).json({ ok: false, error: "shipmentId required" });
  }
  if (!status) {
    return res.status(400).json({ ok: false, error: "status required" });
  }

  try {
    await dbConnect();

    // ✅ Load shipment
    const sh = await Shipment.findById(shipmentId);
    if (!sh) {
      return res.status(404).json({ ok: false, error: "Shipment not found" });
    }

    const prevStatus = sh.status;

    // ✅ Update status
    sh.status = status;

    // add activity log
    sh.activity = sh.activity || [];
    sh.activity.push({
      at: new Date(),
      type: "status",
      payload: { from: prevStatus, to: status },
    });

    await sh.save();

    if (prevStatus !== status) {
      const event = shipmentStatusToEvent(status);
      if (event) {
        await sendShipmentNotification(event, {
          userId: sh.userId,
          context: { trackingNumber: sh.trackingNumber },
        });
      }
    }

    // ✅ Decide recipient
    const recipient =
      String(
        toEmail ||
        sh.customerEmail ||
        (sh.to as any)?.email ||
        ""
      ).trim();

    if (!recipient) {
      return res.status(200).json({
        ok: true,
        warning: "Status updated but no email sent (no recipient email)",
      });
    }

    const tracking = sh.trackingNumber || "-";
    const carrier = sh.carrier || "-";
    const service = sh.service || "-";

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    // Pre-existing bug fixed here: /track.tsx only reads ?no=/?id=/?tracking=/
    // ?trackingNo= — it never recognized ?code=, so this link previously sent
    // customers to a blank search box instead of their shipment.
    // /track/[trackingNo] is the actual per-shipment page (same one used by
    // dashboard/my-shipments.tsx and the app's push notification deep link).
    const trackingUrl = `${baseUrl}/track/${encodeURIComponent(tracking)}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Your shipment status update</h2>
        <p>
          <b>Tracking:</b> ${tracking}<br/>
          <b>Carrier:</b> ${carrier} · <b>Service:</b> ${service}<br/>
          <b>Current status:</b> ${status}
        </p>
        <p>You can check the latest movement of your shipment at any time:</p>
        <p>
          <a href="${trackingUrl}" target="_blank"
             style="background:#111;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none">
            View shipment status
          </a>
        </p>
        <p>If the button doesn't work, copy this URL into your browser:<br/>
          <a href="${trackingUrl}">${trackingUrl}</a>
        </p>
      </div>
    `;

    try {
      await sendMail(
        recipient,
        `Shipment status update (Tracking ${tracking})`,
        html
      );
    } catch (e: unknown) {
      // Status updated, but email failed
      return res.status(200).json({
        ok: true,
        warning:
          "Status updated but email failed: " + (errorMessage(e) || "Unknown error"),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    return res
      .status(500)
      .json({ ok: false, error: errorMessage(e) || "Server error" });
  }
}
