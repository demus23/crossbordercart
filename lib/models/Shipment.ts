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

export interface IShipment {
  _id: Types.ObjectId;
  orderId?: string;
  currency: string;
  priceAED?: number;

  to: {
    name?: string;
    line1: string; line2?: string;
    city: string; postalCode?: string; country: string;
    phone?: string; email?: string;
  };
  from: {
    name?: string;
    line1: string; line2?: string;
    city: string; postalCode?: string; country: string;
    phone?: string; email?: string;
  };

  weightKg: number;
  dims?: { L?: number; W?: number; H?: number };
  parcel?: { length?: number; width?: number; height?: number; weight?: number };

  providerShipmentId?: string;
  selectedRateId?: string;
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  labelUrl?: string;

  customerEmail?: string | null;

  status: ShipmentStatus;

  ratesSnapshot?: any[];
  activity?: Array<{ at: Date; type: string; payload?: any }>;

  createdAt: Date;
  updatedAt: Date;
}

const ShipmentSchema = new Schema<IShipment>(
  {
    orderId: { type: String, index: true },

    currency: { type: String, required: true, uppercase: true },
    priceAED: { type: Number, required: false },

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
      width:  { type: Number, required: false, min: 0 },
      height: { type: Number, required: false, min: 0 },
      weight: { type: Number, required: false, min: 0 },
    },

    providerShipmentId: { type: String },

    selectedRateId: { type: String },
    carrier:        { type: String },
    service:        { type: String },

    trackingNumber: { type: String, index: true, sparse: true },

    labelUrl: { type: String },

    customerEmail: { type: String, index: true, sparse: true },

    // ✅ STORE CANONICAL SNAKE_CASE (matches TS type + API)
    status: {
      type: String,
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
      default: "draft",
    },

    ratesSnapshot: { type: Array },

    activity: [
      {
        at: { type: Date, default: Date.now },

        // ✅ make safe: default + not required
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

ShipmentSchema.index({ status: 1, createdAt: -1 });
ShipmentSchema.index({ providerShipmentId: 1 }, { sparse: true });

export const Shipment =
  (mongoose.models.Shipment as mongoose.Model<IShipment>) ||
  mongoose.model<IShipment>("Shipment", ShipmentSchema);
