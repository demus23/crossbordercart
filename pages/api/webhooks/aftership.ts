// pages/api/webhooks/aftership.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { dbConnect } from "@/lib/mongoose";
import { Shipment, ShipmentStatus } from "@/lib/models/Shipment";

// IMPORTANT: need raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Read raw request body
async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// Constant-time compare
function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * AfterShip Tracking webhook signature:
 * header: aftership-hmac-sha256
 * value: base64(HMAC_SHA256(rawBody, webhookSecret))
 * :contentReference[oaicite:1]{index=1}
 */
function verifyAfterShipSignature(rawBody: Buffer, headerSig: string, secret: string) {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
  return safeEqual(digest, headerSig);
}

// Map AfterShip "tag" (delivery status category) to your ShipmentStatus union
function mapAfterShipTagToStatus(tag?: string): ShipmentStatus {
  const t = (tag || "").toLowerCase();

  // Common AfterShip tags (varies by carrier/provider)
  if (t.includes("delivered")) return "delivered";
  if (t.includes("outfordelivery") || t.includes("out_for_delivery")) return "out_for_delivery";
  if (t.includes("intransit") || t.includes("in_transit")) return "in_transit";
  if (t.includes("exception") || t.includes("expired")) return "exception";
  if (t.includes("return") || t.includes("returned")) return "return_to_sender";

  // "pending", "info_received", etc. -> keep early state
  if (t.includes("pending") || t.includes("info")) return "label_purchased";

  // fallback
  return "draft";
}

// Pull tracking info from different payload versions safely
function extractTracking(msg: any) {
  // Webhook specs say body has ts/event/event_id/msg :contentReference[oaicite:2]{index=2}
  const tracking =
    msg?.tracking ||
    msg?.data?.tracking ||
    msg?.trackings?.[0] ||
    msg?.tracking_update?.tracking ||
    msg?.tracking_data?.tracking;

  const trackingNumber =
    tracking?.tracking_number ||
    tracking?.trackingNumber ||
    tracking?.tracking_no ||
    tracking?.trackingId;

  const slug =
    tracking?.slug ||
    tracking?.courier_slug ||
    tracking?.carrier_slug ||
    tracking?.carrierSlug;

  const tag =
    tracking?.tag ||
    tracking?.status_tag ||
    tracking?.delivery_status ||
    tracking?.current_status;

  // checkpoints timeline
  const checkpoints =
    tracking?.checkpoints ||
    tracking?.checkpoint ||
    tracking?.events ||
    [];

  return { tracking, trackingNumber, slug, tag, checkpoints };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const secret = process.env.AFTERSHIP_WEBHOOK_SECRET;
  if (!secret) {
    // Don’t silently accept webhooks with no verification configured
    return res.status(500).json({ ok: false, error: "Missing AFTERSHIP_WEBHOOK_SECRET" });
  }

  // 1) Read raw body
  const rawBody = await readRawBody(req);

  // 2) Verify signature
  const headerSig =
    (req.headers["aftership-hmac-sha256"] as string) ||
    (req.headers["AfterShip-Hmac-Sha256"] as string);

  if (!headerSig) {
    return res.status(401).json({ ok: false, error: "Missing aftership-hmac-sha256 header" });
  }

  const ok = verifyAfterShipSignature(rawBody, headerSig, secret);
  if (!ok) {
    return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
  }

  // 3) Parse JSON
  let payload: any = null;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid JSON body" });
  }

  // 4) Extract msg + tracking info
  const msg = payload?.msg || payload?.data?.msg || payload;
  const { trackingNumber, slug, tag, checkpoints } = extractTracking(msg);

  if (!trackingNumber) {
    return res.status(400).json({ ok: false, error: "Missing tracking number in webhook payload" });
  }

  await dbConnect();

  // 5) Determine new status
  const newStatus: ShipmentStatus = mapAfterShipTagToStatus(tag);

  // 6) Convert checkpoints -> your events[] (append only newest item if possible)
  // We’ll try to take the last checkpoint from array.
  const last = Array.isArray(checkpoints) && checkpoints.length > 0
    ? checkpoints[checkpoints.length - 1]
    : null;

  const newEvent = last
    ? {
        code: last?.tag || last?.subtag || last?.code || undefined,
        status: last?.message || last?.status || tag || "Update",
        description: last?.description || last?.checkpoint_description || undefined,
        location: last?.location || last?.city || undefined,
        createdAt: last?.checkpoint_time ? new Date(last.checkpoint_time) : new Date(),
      }
    : null;

  // 7) Update shipment by trackingNumber (and slug if you store it)
  // Prefer match with carrierSlug if present
  const match: any = slug
    ? { trackingNumber, carrierSlug: slug }
    : { trackingNumber };

  const update: any = {
    $set: {
      status: newStatus,
      updatedAt: new Date(),
    },
  };

  // push event (keep last 50)
  if (newEvent) {
    update.$push = {
      events: {
        $each: [newEvent],
        $slice: -50,
      },
    };
  }

  const shipment = await Shipment.findOneAndUpdate(match, update, { new: true });

  // If not found by (trackingNumber + slug), fallback to trackingNumber only
  if (!shipment && slug) {
    await Shipment.findOneAndUpdate(
      { trackingNumber },
      update,
      { new: true }
    );
  }

  // Always respond 200 to stop retries after successful verification + processing
  return res.status(200).json({ ok: true });
}
