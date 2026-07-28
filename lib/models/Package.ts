// lib/models/Package.ts

import { Schema, model, models, Document, Types } from "mongoose";

export type PackageStatus =
  | "Pending"
  | "Received"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Forwarded"
  | "In Transit";

export interface IPackage extends Document {
  title: string;
  user: Types.ObjectId;

  tracking?: string;
  courier?: string;

  value?: number;
  weightKg?: number;

  userEmail?: string;
  suiteId?: string;

  status: PackageStatus;

  lastLocation?: string;
  lastNote?: string;

  adminCreatedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;

  shipmentId?: Types.ObjectId;
  shipmentTracking?: string;
  shipmentCarrier?: string;

  receivedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;

  forwardRequested?: boolean;
  forwardRequestedAt?: Date;
  forwardRequestedBy?: Types.ObjectId | string;
}

const PackageSchema = new Schema<IPackage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tracking: {
      type: String,
      trim: true,
      index: true,
    },

    courier: {
      type: String,
      trim: true,
    },

    value: {
      type: Number,
      default: 0,
    },

    weightKg: {
      type: Number,
      default: 0,
      min: 0,
    },

    userEmail: {
      type: String,
      trim: true,
    },

    suiteId: {
      type: String,
      trim: true,
      default: undefined,
      index: true,
    },

    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },

    shipmentTracking: {
      type: String,
      trim: true,
    },

    shipmentCarrier: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Received",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Forwarded",
        "In Transit",
      ],
      default: "Pending",
      index: true,
    },

    receivedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,

    lastLocation: {
      type: String,
      trim: true,
    },

    lastNote: {
      type: String,
      trim: true,
    },

    adminCreatedBy: {
      type: String,
      trim: true,
    },

    forwardRequested: {
      type: Boolean,
      default: false,
    },

    forwardRequestedAt: Date,

    forwardRequestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

function normalizeUpdateObject(update: any) {
  if (!update) return;

  const scrubSuiteId = (obj: any) => {
    if (!obj || typeof obj !== "object") return;

    if ("suiteId" in obj) {
      const s = obj.suiteId;

      if (s === null || (typeof s === "string" && s.trim() === "")) {
        obj.$unset = {
          ...(obj.$unset || {}),
          suiteId: "",
        };

        delete obj.suiteId;
      } else if (typeof s === "string") {
        obj.suiteId = s.trim();
      }
    }
  };

  scrubSuiteId(update);

  if (update.$set) {
    scrubSuiteId(update.$set);
  }

  const normalizeStatus = (status: any) => {
    if (
      typeof status === "string" &&
      status.toLowerCase() === "canceled"
    ) {
      return "Cancelled";
    }

    return status;
  };

  if ("status" in update) {
    update.status = normalizeStatus(update.status);
  }

  if (update.$set && "status" in update.$set) {
    update.$set.status = normalizeStatus(update.$set.status);
  }
}

PackageSchema.pre("save", function (next) {
  if (this.suiteId === "" || this.suiteId === null) {
    // @ts-ignore
    this.suiteId = undefined;
  }

  if ((this.status as any) === "Canceled") {
    this.status = "Cancelled";
  }

  next();
});

PackageSchema.pre("findOneAndUpdate", function (next) {
  const update = (this.getUpdate() ?? {}) as Record<string, any>;

  normalizeUpdateObject(update);

  this.setUpdate(update as any);

  next();
});

PackageSchema.pre("updateOne", function (next) {
  const update = (this.getUpdate() ?? {}) as Record<string, any>;

  normalizeUpdateObject(update);

  this.setUpdate(update as any);

  next();
});

const PackageModel =
  models.Package || model<IPackage>("Package", PackageSchema);

export default PackageModel;