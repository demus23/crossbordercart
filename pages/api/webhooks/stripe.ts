// pages/api/webhooks/stripe.ts

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

/* -------------------------------------------------- */
/* Email Resolver */
/* -------------------------------------------------- */

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

/* -------------------------------------------------- */
/* Handler */
/* -------------------------------------------------- */

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
    /* -------------------------------------------------- */
    /* Global idempotency guard for Stripe event retries   */
    /* -------------------------------------------------- */
    const alreadyProcessed = await Activity.exists({
      action: "stripe.event.processed",
      entity: "stripe",
      entityId: event.id,
    });

    if (alreadyProcessed) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    switch (event.type) {
      /* ========================================================= */
      /* CHECKOUT SESSION */
      /* ========================================================= */

      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const cs = event.data.object as Stripe.Checkout.Session;
        const invoiceNo =
          (cs.metadata?.invoiceNo as string | undefined) || undefined;

        if (!invoiceNo) {
          console.warn("[stripe webhook] checkout session missing invoiceNo", cs.id);
          break;
        }

        const paymentDoc = await Payment.findOne({ invoiceNo }).lean();
        if (!paymentDoc) {
          console.warn("[stripe webhook] payment not found for invoice", invoiceNo);
          break;
        }

        await Payment.updateOne(
          { invoiceNo },
          { $set: { stripeCheckoutSessionId: cs.id } }
        ).exec();

        await Activity.create({
          action: "checkout.completed",
          entity: "payment",
          entityId: invoiceNo,
          details: { checkoutSessionId: cs.id },
          createdAt: new Date(),
        });

        break;
      }

      /* ========================================================= */
      /* PAYMENT SUCCESS */
      /* ========================================================= */

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;

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

        const invoiceNo =
          (pi.metadata?.invoiceNo as string | undefined) || undefined;

        if (!invoiceNo) {
          console.warn("[stripe webhook] payment_intent.succeeded missing invoiceNo", pi.id);
          break;
        }

        const paymentDoc = await Payment.findOne({ invoiceNo }).lean();
        if (!paymentDoc) {
          console.warn("[stripe webhook] payment not found for invoice", invoiceNo);
          break;
        }

        const updatePaymentResult = await Payment.updateOne(
          { invoiceNo, status: { $ne: "succeeded" } },
          {
            $set: {
              status: "succeeded",
              amountPaid: fromStripeAmount(pi.amount_received ?? pi.amount),
              currency: (pi.currency || "aed").toUpperCase(),
              method: { type: "card", brand, last4 },
              stripePaymentIntentId: pi.id,
              receiptUrl,
              paidAt: new Date(),
            } as any,
          }
        ).exec();

        const paymentWasUpdated =
          (updatePaymentResult as any)?.modifiedCount > 0 ||
          (updatePaymentResult as any)?.nModified > 0;

        if (paymentWasUpdated) {
          await Activity.create({
            action: "payment.succeeded",
            entity: "payment",
            entityId: invoiceNo,
            details: { paymentIntentId: pi.id, receiptUrl },
            createdAt: new Date(),
          });
        }

        const freshPaymentDoc = await Payment.findOne({ invoiceNo }).lean();

        if (freshPaymentDoc?.shipmentId) {
          const shipmentUpdateResult = await Shipment.updateOne(
            { _id: freshPaymentDoc.shipmentId, isPaid: { $ne: true } },
            {
              $set: {
                isPaid: true,
                paidAt: new Date(),
                invoiceNo,
              } as any,
            }
          ).exec();

          const shipmentWasUpdated =
            (shipmentUpdateResult as any)?.modifiedCount > 0 ||
            (shipmentUpdateResult as any)?.nModified > 0;

          if (shipmentWasUpdated) {
            await Activity.create({
              action: "shipping.paid",
              entity: "shipping",
              entityId: String(freshPaymentDoc.shipmentId),
              details: { invoiceNo, paymentIntentId: pi.id },
              createdAt: new Date(),
            });
          }
        }

        const orderId = invoiceNo ?? pi.id;
        const { email, name, items } = await getEmailNameAndItemsFromPI(pi);

        const alreadySent = await Activity.exists({
          action: "email.order_confirmation.sent",
          entity: "payment",
          entityId: orderId,
        });

        if (!alreadySent && email) {
          const appUrl = process.env.APP_URL || "http://localhost:3000";
          const trackUrl = `${appUrl}/track?invoiceNo=${encodeURIComponent(
            invoiceNo || pi.id
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

      /* ========================================================= */
      /* PAYMENT FAILED */
      /* ========================================================= */

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const invoiceNo =
          (pi.metadata?.invoiceNo as string | undefined) || undefined;

        if (!invoiceNo) {
          console.warn("[stripe webhook] payment_intent.payment_failed missing invoiceNo", pi.id);
          break;
        }

        const paymentDoc = await Payment.findOne({ invoiceNo }).lean();
        if (!paymentDoc) {
          console.warn("[stripe webhook] payment not found for invoice", invoiceNo);
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

      /* ========================================================= */
      /* REFUND */
      /* ========================================================= */

      case "charge.refunded":
      case "refund.created":
      case "refund.updated": {
        const obj = event.data.object as any;

        let invoiceNo: string | undefined = obj?.metadata?.invoiceNo || undefined;

        if (!invoiceNo && obj?.payment_intent) {
          try {
            const pi = await stripe.paymentIntents.retrieve(obj.payment_intent);
            invoiceNo = pi.metadata?.invoiceNo;
          } catch {}
        }

        if (!invoiceNo) {
          console.warn("[stripe webhook] refund event missing invoiceNo", event.type, obj?.id);
          break;
        }

        const paymentDoc = await Payment.findOne({ invoiceNo }).lean();
        if (!paymentDoc) {
          console.warn("[stripe webhook] payment not found for refund invoice", invoiceNo);
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
          } else if (refundedAmountMinor === originalAmountMinor) {
            paymentStatus = "refunded";
          }
        } else {
          refundedAmount = fromStripeAmount(obj.amount || 0);

          const existingPaidAmount =
            Number((paymentDoc as any)?.amountPaid || 0) * 100 ||
            Number((paymentDoc as any)?.amount || 0);

          const currentRefundMinor = Number(obj.amount || 0);

          if (
            existingPaidAmount > 0 &&
            currentRefundMinor > 0 &&
            currentRefundMinor < existingPaidAmount
          ) {
            paymentStatus = "partially_refunded";
          }
        }

        await Payment.updateOne(
          { invoiceNo, status: { $in: ["succeeded", "partially_refunded", "refunded"] } },
          {
            $set: {
              status: paymentStatus,
              refundedAmount,
              refundedAt: new Date(),
              stripeRefundId: obj.id,
            } as any,
          }
        ).exec();

        const freshPaymentDoc = await Payment.findOne({ invoiceNo }).lean();

        if (freshPaymentDoc?.shipmentId) {
          await Shipment.updateOne(
            { _id: freshPaymentDoc.shipmentId },
            {
              $set: {
                isPaid: paymentStatus === "partially_refunded",
              } as any,
            }
          ).exec();

          await Activity.create({
            action: "shipping.refunded",
            entity: "shipping",
            entityId: String(freshPaymentDoc.shipmentId),
            details: { invoiceNo, refundId: obj.id, status: paymentStatus },
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