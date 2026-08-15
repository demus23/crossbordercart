// lib/notifications/sendShipmentNotification.ts
//
// Single, centralized entry point for shipment/package push notifications.
// Every place in the codebase that changes a shipment's status or payment
// state should call this instead of talking to FCM directly, so notification
// copy and delivery logic live in exactly one place.
//
// The actual FCM transport (deliverPush) is stubbed until a Firebase project
// exists — see FIREBASE_SETUP.md. Once FIREBASE_PROJECT_ID / credentials are
// configured, only deliverPush needs to change; every call site below stays
// the same.

import mongoose from "mongoose";
import UserModel from "@/lib/models/User";

export type ShipmentNotificationEvent =
  | "package_received"
  | "ready_to_consolidate"
  | "payment_required"
  | "payment_confirmed"
  | "shipment_dispatched"
  | "in_transit"
  | "customs"
  | "out_for_delivery"
  | "delivered";

export interface ShipmentNotificationContext {
  trackingNumber?: string | null;
  packageTracking?: string | null;
  count?: number;
  amount?: number | string;
  currency?: string;
  [key: string]: unknown;
}

type CopyBuilder = (ctx: ShipmentNotificationContext) => { title: string; body: string };

const COPY: Record<ShipmentNotificationEvent, CopyBuilder> = {
  package_received: (ctx) => ({
    title: "📦 Your package has arrived!",
    body: `Package ${ctx.packageTracking ?? ""} has been received at the Cross Border Cart Dubai warehouse.`.trim(),
  }),
  ready_to_consolidate: (ctx) => ({
    title: `📦 You have ${ctx.count ?? "several"} packages ready`,
    body: "Consolidate them now and save on shipping.",
  }),
  payment_required: (ctx) => ({
    title: "💳 Your shipment is ready",
    body: `Pay ${ctx.currency ?? "AED"} ${ctx.amount ?? ""} to continue shipment ${ctx.trackingNumber ?? ""}.`.trim(),
  }),
  payment_confirmed: (ctx) => ({
    title: "✅ Payment received",
    body: `We've received your payment for shipment ${ctx.trackingNumber ?? ""}. It's being prepared for dispatch.`.trim(),
  }),
  shipment_dispatched: (ctx) => ({
    title: "✈️ Your shipment is on the way!",
    body: `${ctx.trackingNumber ?? "Your shipment"} has left Dubai.`,
  }),
  in_transit: (ctx) => ({
    title: "✈️ Your shipment is on the way!",
    body: `${ctx.trackingNumber ?? "Your shipment"} is in transit.`,
  }),
  customs: (ctx) => ({
    title: "🛃 Customs update",
    body: `Your shipment ${ctx.trackingNumber ?? ""} is currently being processed by customs.`.trim(),
  }),
  out_for_delivery: (ctx) => ({
    title: "🚚 Your package is coming today!",
    body: `${ctx.trackingNumber ?? "Your shipment"} is out for delivery.`,
  }),
  delivered: (ctx) => ({
    title: "✅ Delivered",
    body: `Your Cross Border Cart shipment ${ctx.trackingNumber ?? ""} has been successfully delivered.`.trim(),
  }),
};

// Maps the Shipment model's `status` field to a notification event.
// Statuses with no customer-facing notification (draft, rated, cancelled,
// return_to_sender, exception) intentionally return null.
export function shipmentStatusToEvent(status: string | null | undefined): ShipmentNotificationEvent | null {
  switch (status) {
    case "label_purchased":
      return "shipment_dispatched";
    case "in_transit":
      return "in_transit";
    case "out_for_delivery":
      return "out_for_delivery";
    case "delivered":
      return "delivered";
    default:
      return null;
  }
}

export async function sendShipmentNotification(
  event: ShipmentNotificationEvent,
  opts: {
    userId?: string | mongoose.Types.ObjectId | null;
    context?: ShipmentNotificationContext;
  }
) {
  if (!opts.userId) {
    // Guest / unlinked shipment — nothing to notify.
    return;
  }

  const user = await UserModel.findById(opts.userId).select("pushTokens").lean();
  const tokens = ((user as any)?.pushTokens || [])
    .map((t: any) => t?.deviceToken)
    .filter((t: unknown): t is string => Boolean(t));

  if (!tokens.length) return;

  const { title, body } = COPY[event](opts.context || {});

  await deliverPush(tokens, { title, body, data: { event, ...(opts.context || {}) } });
}

async function deliverPush(
  tokens: string[],
  payload: { title: string; body: string; data?: Record<string, unknown> }
) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    // No Firebase project configured yet — log instead of sending so the
    // rest of the app (and this function's call sites) can be built and
    // tested before FCM credentials exist.
    console.log("[push:stub] would send to", tokens.length, "device(s):", payload);
    return;
  }

  try {
    const { getMessaging } = await import("firebase-admin/messaging");
    const { getFirebaseAdmin } = await import("@/lib/firebaseAdmin");
    getFirebaseAdmin();

    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: Object.fromEntries(
        Object.entries(payload.data || {}).map(([k, v]) => [k, String(v)])
      ),
    });

    const staleTokens = res.responses
      .map((r, i) => (!r.success && r.error?.code === "messaging/registration-token-not-registered" ? tokens[i] : null))
      .filter((t): t is string => Boolean(t));

    if (staleTokens.length) {
      await UserModel.updateMany(
        { "pushTokens.deviceToken": { $in: staleTokens } },
        { $pull: { pushTokens: { deviceToken: { $in: staleTokens } } } }
      );
    }

    console.log(`[push] sent: ${res.successCount}, failed: ${res.failureCount}`);
  } catch (err) {
    // Never let a push failure break the API route that triggered it
    // (status update, payment, etc.) — log and move on. getFirebaseAdmin()
    // now lives inside this try too, so bad/missing credentials also fail
    // safe instead of throwing out of deliverPush.
    console.error("[push] Firebase delivery failed:", err);
  }
}
