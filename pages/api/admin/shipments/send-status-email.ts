// pages/api/admin/shipments/send-status-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { sendMail } from "@/lib/email/nodemailer";
import { errorMessage } from "@/utils/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ only admin / superadmin
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { shipmentId, toEmail } = req.body || {};
  if (!shipmentId) {
    return res.status(400).json({ ok: false, error: "shipmentId required" });
  }

  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) {
    return res.status(500).json({ ok: false, error: "DB not ready" });
  }

  // ✅ allow either Mongo _id or custom shipmentId
  const filter = mongoose.isValidObjectId(String(shipmentId))
    ? { _id: new mongoose.Types.ObjectId(String(shipmentId)) }
    : { shipmentId: String(shipmentId) };

  const doc = await db.collection("shipments").findOne(filter);
  if (!doc) {
    return res.status(404).json({ ok: false, error: "Shipment not found" });
  }

  const recipient = String(toEmail || doc.customerEmail || doc.to?.email || "");
  if (!recipient) {
    return res.status(400).json({ ok: false, error: "No recipient email on file" });
  }

  const tracking = doc.trackingNumber || "-";
  const carrier = doc.carrier || "-";
  const service = doc.service || "-";
  const status = doc.status || "in_transit";

  // Optional: link to your public tracking page (adjust if your route is different)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const trackingUrl = `${baseUrl}/track?code=${encodeURIComponent(tracking)}`;

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
    await sendMail(recipient, `Shipment status update (Tracking ${tracking})`, html);
  } catch (e: unknown) {
    return res
      .status(500)
      .json({ ok: false, error: errorMessage(e) || "Failed to send status email" });
  }

  return res.status(200).json({ ok: true });
}
