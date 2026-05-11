import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import Stripe from "stripe";

import dbConnect from "@/lib/dbConnect";
import { stripe } from "@/lib/stripe";
import { Activity } from "@/lib/models/Activity";
import { Payment } from "@/lib/models/Payment";
import { Shipment } from "@/lib/models/Shipment";

import { sendEmail } from "@/lib/email/resend";
import OrderConfirmationEmail from "@/emails/OrderConfirmation";

export const config = {
  api: { bodyParser: false },
};

const fromStripeAmount = (amount: number | null | undefined) =>
  (amount ?? 0) / 100;

async function markShipmentPaid({
  invoiceNo,
  shipmentId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
}: {
  invoiceNo: string;
  shipmentId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
}) {
  let resolvedShipmentId = shipmentId;

  if (!resolvedShipmentId) {
    const paymentDoc: any = await Payment.findOne({ invoiceNo }).lean();
    resolvedShipmentId = paymentDoc?.shipmentId?.toString();
  }

  console.log("🔥 Resolved shipmentId:", resolvedShipmentId);

  if (!resolvedShipmentId) {
    console.warn("❌ No shipmentId found for invoice:", invoiceNo);
    return;
  }

  const updatedShipment = await Shipment.findByIdAndUpdate(
    resolvedShipmentId,
    {
      $set: {
        paymentStatus: "paid",
        isPaid: true,
        paidAt: new Date(),
        invoiceNo,
        stripeCheckoutSessionId,
        stripePaymentIntentId,
      },
    },
    { new: true }
  ).exec();

  console.log("✅ Shipment auto-paid:", updatedShipment?._id);
}

async function getEmailNameAndItemsFromPI(
  pi: Stripe.PaymentIntent
): Promise<{
  email?: string;
  name?: string;
  items: { name: string; qty: number }[];
}> {
  let email: string | undefined =
    (pi.receipt_email as string | null) || undefined;
  let name: string | undefined;
  let items: { name: string; qty: number }[] = [];

  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: pi.id,
      limit: 1,
    });

    const cs = sessions.data[0];

    if (cs) {
      email =
        email ||
        cs.customer_details?.email ||
        cs.customer_email ||
        undefined;

      name = cs.customer_details?.name || name;

      const li = await stripe.checkout.sessions.listLineItems(cs.id);

      items = li.data.map((d) => ({
        name: d.description || "Item",
        qty: d.quantity || 1,
      }));
    }
  } catch {}

  return { email, name, items };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) return res.status(400).send("Missing Stripe-Signature");

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
  }

  let event: Stripe.Event;

  try {
    const buf = await getRawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature failed:", err?.message);
    return res.status(400).send("Invalid signature");
  }

  await dbConnect();

  try {
    console.log("🔥 STRIPE WEBHOOK RECEIVED:", event.type);

    const alreadyProcessed = await Activity.exists({
      action: "stripe.event.processed",
      entity: "stripe",
      entityId: event.id,
    });

    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const cs = event.data.object as Stripe.Checkout.Session;

        const invoiceNo = cs.metadata?.invoiceNo;
        const shipmentId = cs.metadata?.shipmentId;

        console.log("🔥 CHECKOUT METADATA:", cs.metadata);

        if (!invoiceNo) {
          console.warn("❌ Checkout session missing invoiceNo:", cs.id);
          break;
        }

        const paymentIntentId =
          typeof cs.payment_intent === "string"
            ? cs.payment_intent
            : undefined;

        await Payment.updateOne(
          { invoiceNo },
          {
            $set: {
              status: "succeeded",
              stripeCheckoutSessionId: cs.id,
              stripePaymentIntentId: paymentIntentId,
              paidAt: new Date(),
            },
          }
        ).exec();

        await markShipmentPaid({
          invoiceNo,
          shipmentId,
          stripeCheckoutSessionId: cs.id,
          stripePaymentIntentId: paymentIntentId,
        });

        await Activity.create({
          action: "checkout.completed",
          entity: "payment",
          entityId: invoiceNo,
          details: {
            checkoutSessionId: cs.id,
            paymentIntentId,
            shipmentId,
          },
          createdAt: new Date(),
        });

        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;

        const invoiceNo = pi.metadata?.invoiceNo;
        const shipmentId = pi.metadata?.shipmentId;

        console.log("🔥 PI METADATA:", pi.metadata);

        if (!invoiceNo) {
          console.warn("❌ payment_intent.succeeded missing invoiceNo:", pi.id);
          break;
        }

        let receiptUrl: string | undefined;
        let brand: string | undefined;
        let last4: string | undefined;

        if (pi.latest_charge) {
          const chargeId =
            typeof pi.latest_charge === "string"
              ? pi.latest_charge
              : pi.latest_charge.id;

          const ch = await stripe.charges.retrieve(chargeId);
          receiptUrl = ch.receipt_url || undefined;

          const pmCard = ch.payment_method_details?.card;
          brand = pmCard?.brand || undefined;
          last4 = pmCard?.last4 || undefined;
        }

        await Payment.updateOne(
          { invoiceNo },
          {
            $set: {
              status: "succeeded",
              amountPaid: fromStripeAmount(pi.amount_received ?? pi.amount),
              currency: (pi.currency || "aed").toUpperCase(),
              method: { type: "card", brand, last4 },
              stripePaymentIntentId: pi.id,
              receiptUrl,
              paidAt: new Date(),
            },
          }
        ).exec();

        await markShipmentPaid({
          invoiceNo,
          shipmentId,
          stripePaymentIntentId: pi.id,
        });

        await Activity.create({
          action: "payment.succeeded",
          entity: "payment",
          entityId: invoiceNo,
          details: {
            paymentIntentId: pi.id,
            receiptUrl,
            shipmentId,
          },
          createdAt: new Date(),
        });

        const orderId = invoiceNo;
        const { email, name, items } = await getEmailNameAndItemsFromPI(pi);

        const alreadySent = await Activity.exists({
          action: "email.order_confirmation.sent",
          entity: "payment",
          entityId: orderId,
        });

        if (!alreadySent && email) {
          const appUrl = process.env.APP_URL || "http://localhost:3000";
          const trackUrl = `${appUrl}/track?invoiceNo=${encodeURIComponent(
            invoiceNo
          )}`;

          try {
            await sendEmail({
              to: email,
              subject: `Order #${orderId} confirmed`,
              from: "Cross Border Cart <no-reply@crossbordercart.com>",
              react: OrderConfirmationEmail({
                customerName: name,
                orderId,
                amount: fromStripeAmount(pi.amount_received ?? pi.amount),
                currency: (pi.currency || "AED").toUpperCase(),
                items,
                trackUrl,
                brandName: "Cross Border Cart",
                brandUrl: "https://crossbordercart.com",
                supportEmail: "support.crossbordercart@gmail.com",
              }),
            });

            await Activity.create({
              action: "email.order_confirmation.sent",
              entity: "payment",
              entityId: orderId,
              details: { to: email, paymentIntentId: pi.id },
              createdAt: new Date(),
            });
          } catch (err) {
            console.error("[stripe webhook] email failed:", err);
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const invoiceNo = pi.metadata?.invoiceNo;

        if (!invoiceNo) {
          console.warn("❌ payment_intent.payment_failed missing invoiceNo:", pi.id);
          break;
        }

        await Payment.updateOne(
          { invoiceNo, status: { $ne: "succeeded" } },
          { $set: { status: "failed" } }
        ).exec();

        await Activity.create({
          action: "payment.failed",
          entity: "payment",
          entityId: invoiceNo,
          details: { paymentIntentId: pi.id },
          createdAt: new Date(),
        });

        break;
      }

      case "charge.refunded":
      case "refund.created":
      case "refund.updated": {
        const obj = event.data.object as any;

        let invoiceNo: string | undefined = obj?.metadata?.invoiceNo;

        if (!invoiceNo && obj?.payment_intent) {
          try {
            const pi = await stripe.paymentIntents.retrieve(obj.payment_intent);
            invoiceNo = pi.metadata?.invoiceNo;
          } catch {}
        }

        if (!invoiceNo) {
          console.warn("❌ Refund event missing invoiceNo:", event.type);
          break;
        }

        const paymentDoc: any = await Payment.findOne({ invoiceNo }).lean();
        if (!paymentDoc) {
          console.warn("❌ Payment not found for refund invoice:", invoiceNo);
          break;
        }

        let refundedAmount = 0;
        let paymentStatus: "refunded" | "partially_refunded" = "refunded";

        if (event.type === "charge.refunded") {
          refundedAmount = fromStripeAmount(obj.amount_refunded || 0);

          const originalAmountMinor = Number(obj.amount || 0);
          const refundedAmountMinor = Number(obj.amount_refunded || 0);

          if (
            refundedAmountMinor > 0 &&
            refundedAmountMinor < originalAmountMinor
          ) {
            paymentStatus = "partially_refunded";
          } else {
            paymentStatus = "refunded";
          }
        } else {
          refundedAmount = fromStripeAmount(obj.amount || 0);
        }

        await Payment.updateOne(
          {
            invoiceNo,
            status: { $in: ["succeeded", "partially_refunded", "refunded"] },
          },
          {
            $set: {
              status: paymentStatus,
              refundedAmount,
              refundedAt: new Date(),
              stripeRefundId: obj.id,
            },
          }
        ).exec();

        if (paymentDoc.shipmentId) {
          await Shipment.findByIdAndUpdate(paymentDoc.shipmentId, {
            $set: {
              isPaid: paymentStatus === "partially_refunded",
              paymentStatus:
                paymentStatus === "partially_refunded"
                  ? "paid"
                  : "refunded",
            },
          }).exec();

          await Activity.create({
            action: "shipping.refunded",
            entity: "shipping",
            entityId: String(paymentDoc.shipmentId),
            details: {
              invoiceNo,
              refundId: obj.id,
              status: paymentStatus,
            },
            createdAt: new Date(),
          });
        }

        await Activity.create({
          action: "refund.webhook",
          entity: "payment",
          entityId: invoiceNo,
          details: {
            refundId: obj.id,
            refundedAmount,
            status: paymentStatus,
          },
          createdAt: new Date(),
        });

        break;
      }

      default:
        console.log("Unhandled Stripe event:", event.type);
        break;
    }

    await Activity.create({
      action: "stripe.event.processed",
      entity: "stripe",
      entityId: event.id,
      details: { type: event.type },
      createdAt: new Date(),
    });

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({
      received: false,
      error: err?.message || "Webhook handler failed",
    });
  }
}