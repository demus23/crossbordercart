// pages/api/admin/shipments/send-status-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import { sendMail } from "@/lib/email/nodemailer"; // same helper you use for label
import { errorMessage } from "@/utils/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Only admins can use this
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  // ✅ Only POST
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

  // same pattern as your label endpoint
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
  const updatedAt = doc.updatedAt ? new Date(doc.updatedAt) : new Date();

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const trackingUrl =
    tracking && tracking !== "-"
      ? `${baseUrl}/track/${encodeURIComponent(tracking)}`
      : `${baseUrl}/mypackages`;

  const formattedDate = updatedAt.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Your shipment status has been updated</h2>
      <p>
        <b>Status:</b> ${String(status).replace(/_/g, " ")}<br/>
        <b>Tracking:</b> ${tracking}<br/>
        <b>Carrier:</b> ${carrier} · <b>Service:</b> ${service}<br/>
        <b>Updated at:</b> ${formattedDate}
      </p>
      <p>
        You can view the latest tracking details here:<br/>
        <a href="${trackingUrl}" target="_blank">${trackingUrl}</a>
      </p>
      <p style="margin-top:24px;font-size:13px;color:#666">
        If you have any questions, just reply to this email.
      </p>
    </div>
  `;

  try {
    await sendMail(
      recipient,
      `Update on your shipment (Tracking ${tracking})`,
      html
    );
  } catch (e: unknown) {
    return res
      .status(500)
      .json({ ok: false, error: errorMessage(e) || "Failed to send email" });
  }

  return res.status(200).json({ ok: true });
}
