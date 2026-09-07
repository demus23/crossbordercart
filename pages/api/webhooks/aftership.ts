// pages/api/webhooks/aftership.ts

import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

import { dbConnect } from "@/lib/mongoose";
import { Shipment, ShipmentStatus } from "@/lib/models/Shipment";

import {
  sendShipmentNotification,
  shipmentStatusToEvent,
} from "@/lib/notifications/sendShipmentNotification";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);

  if (ba.length !== bb.length) {
    return false;
  }

  return crypto.timingSafeEqual(ba, bb);
}

function verifyAfterShipSignature(
  rawBody: Buffer,
  headerSig: string,
  secret: string
) {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  return safeEqual(digest, headerSig);
}

function mapAfterShipTagToStatus(
  tag?: string
): ShipmentStatus | null {
  const normalized = String(tag || "")
    .replace(/[\s_-]/g, "")
    .toLowerCase();

  switch (normalized) {
    case "delivered":
      return "delivered";

    case "outfordelivery":
      return "out_for_delivery";

    case "intransit":
      return "in_transit";

    case "exception":
    case "expired":
    case "attemptfail":
      return "exception";

    case "pending":
    case "inforeceived":
      return "label_purchased";

    /*
     * CBC currently has no dedicated available-for-pickup
     * shipment status. Keep it as in transit rather than
     * sending the shipment backwards.
     */
    case "availableforpickup":
      return "in_transit";

    default:
      return null;
  }
}

function extractTracking(msg: any) {
  const tracking =
    msg?.tracking ||
    msg?.data?.tracking ||
    msg?.trackings?.[0] ||
    msg?.tracking_update?.tracking ||
    msg?.tracking_data?.tracking ||
    msg;

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

  const checkpoints = Array.isArray(tracking?.checkpoints)
    ? tracking.checkpoints
    : Array.isArray(tracking?.events)
    ? tracking.events
    : [];

  return {
    tracking,
    trackingNumber,
    slug,
    tag,
    checkpoints,
  };
}

function getCheckpointDate(checkpoint: any) {
  const raw =
    checkpoint?.checkpoint_time ||
    checkpoint?.created_at ||
    checkpoint?.time;

  if (!raw) {
    return new Date();
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime())
    ? new Date()
    : parsed;
}

function getCheckpointLocation(checkpoint: any) {
  if (!checkpoint) {
    return "";
  }

  if (checkpoint.location) {
    return String(checkpoint.location);
  }

  return [
    checkpoint.city,
    checkpoint.state,
    checkpoint.country_region_name ||
      checkpoint.country_name ||
      checkpoint.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      error: "Method Not Allowed",
    });
  }

  const secret = process.env.AFTERSHIP_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      "[AfterShip] Missing AFTERSHIP_WEBHOOK_SECRET"
    );

    return res.status(500).json({
      ok: false,
      error: "Missing AFTERSHIP_WEBHOOK_SECRET",
    });
  }

  let rawBody: Buffer;

  try {
    rawBody = await readRawBody(req);
  } catch (error) {
    console.error("[AfterShip] Failed reading body:", error);

    return res.status(400).json({
      ok: false,
      error: "Unable to read request body",
    });
  }

  const headerSig =
    req.headers["aftership-hmac-sha256"];

  const signature = Array.isArray(headerSig)
    ? headerSig[0]
    : headerSig;

  if (!signature) {
    return res.status(401).json({
      ok: false,
      error: "Missing aftership-hmac-sha256 header",
    });
  }

  if (
    !verifyAfterShipSignature(
      rawBody,
      signature,
      secret
    )
  ) {
    console.warn("[AfterShip] Invalid webhook signature");

    return res.status(401).json({
      ok: false,
      error: "Invalid webhook signature",
    });
  }

  let payload: any;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({
      ok: false,
      error: "Invalid JSON body",
    });
  }

  const webhookEventId =
    payload?.event_id ||
    payload?.eventId;

  const webhookType =
    payload?.event ||
    "tracking_update";

  const msg =
    payload?.msg ??
    payload?.data?.msg ??
    payload;

  const {
    trackingNumber,
    slug,
    tag,
    checkpoints,
  } = extractTracking(msg);

  console.log("[AfterShip] webhook:", {
    webhookEventId,
    webhookType,
    trackingNumber,
    slug,
    tag,
  });

  /*
   * Some webhook types such as EDD revisions may not
   * contain the normal tracking status information.
   */
  if (!trackingNumber) {
    console.warn(
      "[AfterShip] No tracking number. Ignoring webhook:",
      webhookType
    );

    return res.status(200).json({
      ok: true,
      ignored: true,
      reason: "No tracking number",
    });
  }

  await dbConnect();

  /*
   * Find the CBC shipment first.
   *
   * Try carrier slug + tracking number, then tracking
   * number alone.
   */
  let shipment = slug
    ? await Shipment.findOne({
        trackingNumber,
        carrierSlug: slug,
      })
    : null;

  if (!shipment) {
    shipment = await Shipment.findOne({
      trackingNumber,
    });
  }

  if (!shipment) {
    console.warn(
      "[AfterShip] CBC shipment not found:",
      trackingNumber
    );

    /*
     * Valid webhook, but nothing exists in CBC yet.
     * Returning 200 prevents pointless AfterShip retries.
     */
    return res.status(200).json({
      ok: true,
      ignored: true,
      reason: "Shipment not found",
    });
  }

  const previousStatus = shipment.status;

  const mappedStatus =
    mapAfterShipTagToStatus(tag);

  /*
   * IMPORTANT:
   * Unknown AfterShip statuses must NEVER reset a shipment
   * to Draft.
   */
  const newStatus =
    mappedStatus ?? previousStatus;

  const lastCheckpoint =
    Array.isArray(checkpoints) &&
    checkpoints.length > 0
      ? checkpoints[checkpoints.length - 1]
      : null;

  const checkpointHash =
    lastCheckpoint?.hash ||
    lastCheckpoint?.id ||
    undefined;

  const checkpointDescription =
    lastCheckpoint?.message ||
    lastCheckpoint?.description ||
    lastCheckpoint?.checkpoint_description ||
    lastCheckpoint?.subtag_message ||
    String(tag || "Tracking update");

  const checkpointLocation =
    getCheckpointLocation(lastCheckpoint);

  const checkpointDate =
    getCheckpointDate(lastCheckpoint);

  /*
   * Prevent duplicate checkpoint events.
   *
   * Newer AfterShip webhook versions provide a
   * checkpoints[].hash value which is ideal for this.
   */
  let duplicateEvent = false;

  if (checkpointHash) {
    duplicateEvent = (shipment.events || []).some(
      (existing: any) =>
        existing?.code === checkpointHash
    );
  } else if (lastCheckpoint) {
    duplicateEvent = (shipment.events || []).some(
      (existing: any) =>
        existing?.status === newStatus &&
        existing?.description ===
          checkpointDescription &&
        String(existing?.location || "") ===
          checkpointLocation &&
        new Date(
          existing?.createdAt || 0
        ).getTime() === checkpointDate.getTime()
    );
  }

  shipment.status = newStatus;

  /*
   * Useful summary location for tracking pages.
   */
  if (checkpointLocation) {
    shipment.currentLocation =
      checkpointLocation;
  }

  if (
    newStatus === "in_transit" ||
    newStatus === "out_for_delivery"
  ) {
    if (!shipment.shippedAt) {
      shipment.shippedAt = checkpointDate;
    }
  }

  if (newStatus === "delivered") {
    if (!shipment.deliveredAt) {
      shipment.deliveredAt =
        checkpointDate;
    }
  }

  if (lastCheckpoint && !duplicateEvent) {
    shipment.events =
      shipment.events || [];

    shipment.events.push({
      /*
       * Keep CBC's normalized shipment status here.
       */
      status: newStatus,

      /*
       * Use the AfterShip checkpoint hash as our
       * deduplication code where available.
       */
      code:
        checkpointHash ||
        lastCheckpoint?.subtag ||
        lastCheckpoint?.tag ||
        undefined,

      description:
        checkpointDescription,

      location:
        checkpointLocation,

      createdAt:
        checkpointDate,
    });

    /*
     * Keep timeline size manageable.
     */
    if (shipment.events.length > 50) {
      shipment.events =
        shipment.events.slice(-50);
    }

    shipment.activity =
      shipment.activity || [];

    shipment.activity.push({
      at: checkpointDate,
      type: "tracking_update",
      payload: {
        source: "aftership",
        status: newStatus,
        previousStatus,
        trackingNumber,
        carrierSlug: slug,
        description:
          checkpointDescription,
        location:
          checkpointLocation,
      },
    });
  }

  await shipment.save();

  /*
   * Notify customer only when the major CBC shipment
   * status actually changes.
   */
  if (
    previousStatus !== shipment.status
  ) {
    const notificationEvent =
      shipmentStatusToEvent(
        shipment.status
      );

    if (notificationEvent) {
      try {
        await sendShipmentNotification(
          notificationEvent,
          {
            userId: shipment.userId,
            context: {
              trackingNumber:
                shipment.trackingNumber,
            },
          }
        );
      } catch (error) {
        /*
         * Tracking must still be saved even when a push
         * notification fails.
         */
        console.error(
          "[AfterShip] notification failed:",
          error
        );
      }
    }
  }

  console.log(
    `[AfterShip] ${trackingNumber}: ${previousStatus} -> ${shipment.status}`
  );

  return res.status(200).json({
    ok: true,
    trackingNumber,
    previousStatus,
    status: shipment.status,
    eventAdded:
      !!lastCheckpoint &&
      !duplicateEvent,
  });
}