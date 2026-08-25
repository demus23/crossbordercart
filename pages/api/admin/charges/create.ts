import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import mongoose, { Schema, model, models, Types } from "mongoose";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import { stripe } from "@/lib/stripe";
import { Payment } from "@/lib/models/Payment";
import { Shipment } from "@/lib/models/Shipment";
import { Activity } from "@/lib/models/Activity";
import User from "@/lib/models/User";
import { sendShipmentNotification } from "@/lib/notifications/sendShipmentNotification";

type CounterDoc = {
  _id: string;
  seq: number;
};

const CounterSchema = new Schema<CounterDoc>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: "invoice_counters", versionKey: false }
);

const InvoiceCounter =
  (models.InvoiceCounter as mongoose.Model<CounterDoc>) ||
  model<CounterDoc>("InvoiceCounter", CounterSchema);

function todayBase() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `INV-${yyyy}${mm}${dd}`;
}

async function maxSeqInPayments(
  db: mongoose.mongo.Db,
  base: string
): Promise<number> {
  const start = `${base}-0000`;
  const end = `${base}-9999`;

  const doc = await db
    .collection<{ invoiceNo: string }>("payments")
    .find(
      { invoiceNo: { $gte: start, $lte: end } },
      { projection: { invoiceNo: 1 } }
    )
    .sort({ invoiceNo: -1 })
    .limit(1)
    .next();

  if (!doc?.invoiceNo) return 0;

  const m = doc.invoiceNo.match(/-(\d{4})$/);
  return m ? parseInt(m[1], 10) : 0;
}

async function allocateInvoiceNo(db: mongoose.mongo.Db): Promise<string> {
  const base = todayBase();

  const [current, maxUsed] = await Promise.all([
    InvoiceCounter.findById(base).lean(),
    maxSeqInPayments(db, base),
  ]);

  if (!current || (current.seq ?? 0) < maxUsed) {
    await InvoiceCounter.findByIdAndUpdate(
      base,
      { $set: { seq: maxUsed } },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  const updated = await InvoiceCounter.findByIdAndUpdate(
    base,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  const seqNum = updated?.seq ?? maxUsed + 1;
  const seq = String(seqNum).padStart(4, "0");

  return `${base}-${seq}`;
}

function getOrigin(req: NextApiRequest) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  const session: any = await getServerSession(req, res, authOptions as any);

  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user.role)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    await dbConnect();

    const db = mongoose.connection.db!;

    const {
      amount,
      currency = "AED",
      description = "Shipment charge",
      email,
      userId,
      shipmentId,
      collectMode = "link",
    } = req.body || {};

    const amountMajor = Number(amount);

    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      return res.status(400).json({
        ok: false,
        error: "Amount must be greater than 0",
      });
    }

    const amountMinor = Math.round(amountMajor * 100);
    const finalCurrency = String(currency || "AED").toUpperCase();

    let finalShipment: any = null;
    let finalShipmentId: string | undefined =
      shipmentId && Types.ObjectId.isValid(String(shipmentId))
        ? String(shipmentId)
        : undefined;

    if (finalShipmentId) {
      finalShipment = await Shipment.findById(finalShipmentId).lean();

      if (!finalShipment) {
        return res.status(404).json({
          ok: false,
          error: "Shipment not found",
        });
      }
    }

    let finalUserId: any =
      userId && Types.ObjectId.isValid(String(userId))
        ? new Types.ObjectId(String(userId))
        : undefined;

    let finalEmail: string | undefined =
      email ||
      finalShipment?.customerEmail ||
      finalShipment?.userEmail ||
      finalShipment?.to?.email ||
      undefined;

    if (!finalUserId && finalShipment) {
      const possibleUserId =
        finalShipment.userId || finalShipment.user || finalShipment.ownerId;

      if (possibleUserId && Types.ObjectId.isValid(String(possibleUserId))) {
        finalUserId = new Types.ObjectId(String(possibleUserId));
      }
    }

    if (!finalEmail && finalUserId) {
      const userDoc: any = await User.findById(finalUserId).lean();
      finalEmail = userDoc?.email;
    }

    if (!finalUserId && finalEmail) {
      let userDoc: any = await User.findOne({ email: finalEmail }).lean();

      if (!userDoc) {
        userDoc = await User.create({
          email: finalEmail,
          name: finalEmail.split("@")[0],
          emailVerified: null,
          createdAt: new Date(),
        });
      }

      finalUserId = userDoc._id;
    }

    if (!finalUserId) {
      return res.status(400).json({
        ok: false,
        error: "Cannot resolve customer user",
      });
    }

    if (!finalEmail) {
      const userDoc: any = await User.findById(finalUserId).lean();
      finalEmail = userDoc?.email;
    }

    if (!finalEmail) {
      return res.status(400).json({
        ok: false,
        error: "Customer email is required",
      });
    }

    const invoiceNo = await allocateInvoiceNo(db);

    const payment = await Payment.create({
      invoiceNo,
      amount: amountMinor,
      currency: finalCurrency,
      description:
        finalShipment?.trackingNumber || finalShipment?._id
          ? `${description} (Shipment ${
              finalShipment.trackingNumber || finalShipment._id
            })`
          : description,
      status: "pending",
      method: {
        type: collectMode === "saved" ? "saved_card" : "card",
        label: collectMode === "saved" ? "Saved card" : "Pay link",
      },
      user: finalUserId,

      // ✅ IMPORTANT: this is what webhook uses to mark shipment paid
      shipmentId: finalShipmentId ? new Types.ObjectId(finalShipmentId) : undefined,

      billingAddress: {
         name: finalShipment?.to?.name || finalEmail,
         line1: finalShipment?.to?.line1 || "N/A",
         city: finalShipment?.to?.city || "N/A",
         country: finalShipment?.to?.country || "AE",
},

      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ORIGIN = getOrigin(req);

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: finalEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: finalCurrency.toLowerCase(),
            unit_amount: amountMinor,
            product_data: {
              name: `Invoice ${invoiceNo}`,
              description:
                finalShipment?.trackingNumber
                  ? `Shipment ${finalShipment.trackingNumber}`
                  : description,
            },
          },
        },
      ],
      success_url: `${ORIGIN}/pay/return?paid=1&inv=${encodeURIComponent(
        invoiceNo
      )}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ORIGIN}/pay/return?canceled=1&inv=${encodeURIComponent(
        invoiceNo
      )}&session_id={CHECKOUT_SESSION_ID}`,

      // ✅ IMPORTANT: Stripe webhook can read shipmentId here
      metadata: {
        invoiceNo,
        shipmentId: finalShipmentId || "",
      },

      // ✅ IMPORTANT: payment_intent.succeeded can also read shipmentId
      payment_intent_data: {
        metadata: {
          invoiceNo,
          shipmentId: finalShipmentId || "",
        },
      },
    });

    await Payment.updateOne(
      { invoiceNo },
      {
        $set: {
          stripeCheckoutSessionId: checkout.id,
          checkoutUrl: checkout.url,
          updatedAt: new Date(),
        },
      }
    ).exec();

    if (finalShipmentId) {
      await Shipment.findByIdAndUpdate(finalShipmentId, {
        $set: {
          paymentStatus: "pending_payment",
          isPaid: false,
          invoiceNo,
          paymentId: payment._id,
          stripeCheckoutSessionId: checkout.id,
          checkoutUrl: checkout.url,
        },
      }).exec();

      // This is the moment a real, payable checkout link exists for the
      // customer — the right point to notify, not shipment creation itself
      // (which can sit unpriced/unpayable for a while before this runs).
      await sendShipmentNotification("payment_required", {
        userId: finalUserId,
        context: {
          trackingNumber: finalShipment?.trackingNumber,
          amount: amountMajor,
          currency: finalCurrency,
          checkoutUrl: checkout.url,
        },
      });
    }

    try {
      await Activity.create({
        action: "charge.created",
        entity: "payment",
        entityId: invoiceNo,
        performedBy:
          session?.user?.id && Types.ObjectId.isValid(String(session.user.id))
            ? new Types.ObjectId(String(session.user.id))
            : undefined,
        performedByEmail: session?.user?.email,
        details: {
          amount: amountMinor,
          currency: finalCurrency,
          shipmentId: finalShipmentId || null,
          checkoutSessionId: checkout.id,
        },
        createdAt: new Date(),
      });
    } catch (activityErr) {
      console.warn("[activity] charge.created failed:", activityErr);
    }

    return res.status(201).json({
      ok: true,
      invoiceNo,
      paymentId: String(payment._id),
      checkoutUrl: checkout.url,
      status: "pending",
      shipmentId: finalShipmentId || null,
    });
  } catch (err: any) {
    console.error("Create charge error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Server error",
    });
  }
}