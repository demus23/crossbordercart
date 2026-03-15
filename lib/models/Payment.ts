// lib/models/Payment.ts
import mongoose, { Schema, Types } from "mongoose";

export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";
export type PaymentMethodType = "card" | "paypal" | "wire";

export interface IBillingAddress {
  fullName?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface IPaymentMethodSnapshot {
  type: PaymentMethodType;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  paypalEmail?: string;
  wireReference?: string;
  label?: string;
}

export interface IPayment {
  _id: Types.ObjectId;

  invoiceNo: string;
  user: Types.ObjectId;
  email?: string;

  amount: number;   // minor units
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, any>;
  method: IPaymentMethodSnapshot;
  billingAddress: IBillingAddress;

  // ✅ Link to shipment (this fixes your whole manual "Mark paid" issue)
  shipmentId?: Types.ObjectId;

  // Stripe linkage + extras
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;

  receiptUrl?: string;
  refundedAt?: Date;
  refundedAmount?: number;
  failureMessage?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const BillingAddressSchema = new Schema<IBillingAddress>(
  {
    fullName: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    country: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

const MethodSchema = new Schema<IPaymentMethodSnapshot>(
  {
    type: { type: String, enum: ["card", "paypal", "wire"], required: true },
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number,
    paypalEmail: String,
    wireReference: String,
    label: String,
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    invoiceNo: { type: String, required: true, unique: true, index: true },

    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String },
    shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", index: true },

    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, uppercase: true, trim: true },

    status: {
      type: String,
      enum: ["succeeded", "pending", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    description: String,
    metadata: { type: Schema.Types.Mixed },

    method: { type: MethodSchema, required: true },
    billingAddress: { type: BillingAddressSchema, required: true },

    
    

    // Stripe linkage + extras
    stripeCheckoutSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, index: true },
    stripeRefundId: { type: String },

    receiptUrl: { type: String },
    refundedAt: { type: Date },
    refundedAmount: { type: Number },
    failureMessage: { type: String },
  },
  { timestamps: true }
);

export const Payment =
  (mongoose.models.Payment as mongoose.Model<IPayment>) ||
  mongoose.model<IPayment>("Payment", PaymentSchema);