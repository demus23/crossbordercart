// pages/api/dashboard/send-whatsapp.ts
// Internal helper — call this from your package status update logic
// e.g. when a shipment changes status, call sendWhatsApp(userId, event, data)

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

type WhatsAppEvent =
  | "packageReceived"
  | "customsCleared"
  | "outForDelivery"
  | "paymentDue"
  | "delivered";

// Message templates per event
function buildMessage(event: WhatsAppEvent, data: Record<string, string>): string {
  const templates: Record<WhatsAppEvent, string> = {
    packageReceived:  `📦 Your package *${data.tracking}* has arrived at our Dubai warehouse (CrossBorderCart). We'll notify you when it's ready to ship.`,
    customsCleared:   `✅ Great news! Your package *${data.tracking}* has cleared customs at ${data.location}. It's on its way to you.`,
    outForDelivery:   `🚚 Your package *${data.tracking}* is out for delivery in *${data.city}* today. Expected by end of day.`,
    paymentDue:       `💳 Action needed: Payment of *AED ${data.amount}* is due for shipment *${data.shipmentId}*. Pay at crossbordercart.com/dashboard`,
    delivered:        `🎉 Delivered! Your package *${data.tracking}* has been delivered to ${data.address}. Thank you for using CrossBorderCart!`,
  };
  return templates[event];
}

// Send via Twilio WhatsApp API
async function sendViaTwilio(to: string, message: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886

  if (!accountSid || !authToken || !fromNumber) {
    console.error("Twilio env vars missing");
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({
    From: fromNumber,
    To:   `whatsapp:${to}`,
    Body: message,
  });

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return r.ok;
}

// Main exported helper — call this from other API routes
export async function sendWhatsAppNotification(
  userEmail: string,
  event: WhatsAppEvent,
  data: Record<string, string>
): Promise<void> {
  const { data: user } = await supabase
    .from("users")
    .select("whatsapp_number, whatsapp_settings")
    .eq("email", userEmail)
    .single();

  if (!user?.whatsapp_number) return;
  if (!user?.whatsapp_settings?.[event]) return; // user has this event toggled off

  const message = buildMessage(event, data);
  await sendViaTwilio(user.whatsapp_number, message);
}

// API handler — for testing from dashboard
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { userEmail, event, data } = req.body;
  if (!userEmail || !event) return res.status(400).json({ error: "Missing fields" });

  await sendWhatsAppNotification(userEmail, event, data ?? {});
  return res.status(200).json({ ok: true });
}
