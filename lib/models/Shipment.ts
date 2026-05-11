// lib/models/Shipment.ts
import mongoose, { Schema, Types } from "mongoose";

export type ShipmentStatus =
  | "draft"
  | "rated"
  | "label_purchased"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "return_to_sender"
  | "exception"
  | "cancelled";

// 👇 One tracking event entry
export interface IShipmentEvent {
  _id?: Types.ObjectId;
  code?: string;        // e.g. "IN_TRANSIT"
  status: string;       // e.g. "In transit"
  description?: string; // e.g. "Left Dubai hub"
  location?: string;    // e.g. "DXB, United Arab Emirates"
  createdAt: Date;
}

export interface IShipment {
  _id: Types.ObjectId;

  orderId?: string;

  currency: string;
  priceAED?: number;

  packageIds?: Types.ObjectId[];
  userId?: Types.ObjectId;

  isPaid?: boolean;
  paidAt?: Date;

  to: {
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode?: string;
    country: string;
    phone?: string;
    email?: string;
  };

  from: {
    name?: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode?: string;
    country: string;
    phone?: string;
    email?: string;
  };

  weightKg: number;
  dims?: { L?: number; W?: number; H?: number };
  parcel?: { length?: number; width?: number; height?: number; weight?: number };

  providerShipmentId?: string;
  selectedRateId?: string;

  carrier?: string;        // display name e.g. "Aramex"
  carrierSlug?: string;    // canonical id e.g. "aramex" (needed for tracking providers)

  service?: string;

  trackingNumber?: string;
  labelUrl?: string;

  customerEmail?: string | null;

  status: ShipmentStatus;

  paymentStatus?: "unpaid" | "pending" | "pending_payment" | "paid" | "refunded";

  ratesSnapshot?: any[];
  activity?: Array<{ at: Date; type: string; payload?: any }>;

  // 👇 Tracking timeline events
  events?: IShipmentEvent[];

  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    orderId: { type: String, index: true },

    currency: { type: String, required: true, uppercase: true },
    priceAED: { type: Number, required: false },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    to: {
      name: String,
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      postalCode: String,
      country: { type: String, required: true },
      phone: String,
      email: String,
    },

    from: {
      name: String,
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      postalCode: String,
      country: { type: String, required: true },
      phone: String,
      email: String,
    },

    weightKg: { type: Number, required: true, min: 0 },

    dims: {
      L: { type: Number, min: 0 },
      W: { type: Number, min: 0 },
      H: { type: Number, min: 0 },
    },

    parcel: {
      length: { type: Number, required: false, min: 0 },
      width: { type: Number, required: false, min: 0 },
      height: { type: Number, required: false, min: 0 },
      weight: { type: Number, required: false, min: 0 },
    },

    providerShipmentId: { type: String, index: true, sparse: true },

    selectedRateId: { type: String },

    carrier: { type: String },
    // ✅ NEW: carrierSlug for tracking providers (e.g., aftership)
    carrierSlug: { type: String, index: true, sparse: true },

    service: { type: String },

    trackingNumber: { type: String, index: true, sparse: true },

    labelUrl: { type: String },

    customerEmail: { type: String, index: true, sparse: true },

    packageIds: [{ type: Schema.Types.ObjectId, ref: "Package" }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    // ✅ Matches your union type (snake_case)
    status: {
      type: String,
      default: "draft",
      enum: [
        "draft",
        "rated",
        "label_purchased",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "return_to_sender",
        "exception",
        "cancelled",
      ],
      index: true,
    },

    // 👇 Tracking timeline events
    events: {
      type: [
        {
          code: { type: String },
          status: { type: String, required: true },
          description: { type: String },
          location: { type: String },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    ratesSnapshot: { type: Array },

    activity: [
      {
        at: { type: Date, default: Date.now },
        type: {
          type: String,
          default: "status",
          required: false,
        },
        payload: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

// Helpful indexes for dashboards + live widgets
ShipmentSchema.index({ status: 1, createdAt: -1 });
ShipmentSchema.index({ updatedAt: -1 });
ShipmentSchema.index({ providerShipmentId: 1 }, { sparse: true });

export const Shipment =
  (mongoose.models.Shipment as mongoose.Model<IShipment>) ||
  mongoose.model<IShipment>("Shipment", ShipmentSchema);
