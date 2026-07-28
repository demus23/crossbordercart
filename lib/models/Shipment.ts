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

export type ShipmentPaymentStatus =
  | "unpaid"
  | "pending"
  | "pending_payment"
  | "paid"
  | "refunded";

export interface IShipmentEvent {
  _id?: Types.ObjectId;
  code?: string;
  status: string;
  description?: string;
  location?: string;
  createdAt: Date;
}

export interface IShipmentActivity {
  _id?: Types.ObjectId;
  at: Date;
  type: string;
  payload?: any;
}

export interface IShipment {
  _id: Types.ObjectId;

  orderId?: string;

  currency: string;
  priceAED?: number;

  packageIds?: Types.ObjectId[];
  packageId?: Types.ObjectId | null;

  userId?: Types.ObjectId | null;
  user?: Types.ObjectId | null;

  customerEmail?: string | null;
  userEmail?: string | null;
  suiteId?: string | null;

  packageTrackingNumber?: string | null;

  isPaid?: boolean;
  paidAt?: Date;

  paymentStatus?: ShipmentPaymentStatus;

  checkoutUrl?: string | null;
  invoiceNo?: string | null;
  paymentId?: Types.ObjectId | null;

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

  dims?: {
    L?: number;
    W?: number;
    H?: number;
  };

  parcel?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
  };

  providerShipmentId?: string;
  selectedRateId?: string;

  speed?: string;

  carrier?: string;
  carrierSlug?: string;
  service?: string;

  trackingNumber?: string;
  labelUrl?: string;

  status: ShipmentStatus;

  ratesSnapshot?: any[];
  activity?: IShipmentActivity[];
  events?: IShipmentEvent[];

  createdAt: Date;
  updatedAt: Date;
}

const ShipmentEventSchema = new Schema<IShipmentEvent>(
  {
    code: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const ShipmentActivitySchema = new Schema<IShipmentActivity>(
  {
    at: {
      type: Date,
      default: Date.now,
    },

    type: {
      type: String,
      default: "status",
      trim: true,
    },

    payload: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: true,
  }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    orderId: {
      type: String,
      index: true,
      trim: true,
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: "AED",
    },

    priceAED: {
      type: Number,
      required: false,
      min: 0,
    },

    packageIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Package",
      },
    ],

    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerEmail: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    userEmail: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    suiteId: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
    },

    packageTrackingNumber: {
      type: String,
      default: null,
      trim: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "pending",
        "pending_payment",
        "paid",
        "refunded",
      ],
      default: "unpaid",
      index: true,
    },

    checkoutUrl: {
      type: String,
      default: null,
    },

    invoiceNo: {
      type: String,
      default: null,
      index: true,
      sparse: true,
      trim: true,
    },

    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    to: {
      name: {
        type: String,
        trim: true,
      },

      line1: {
        type: String,
        required: true,
        trim: true,
      },

      line2: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },

    from: {
      name: {
        type: String,
        trim: true,
      },

      line1: {
        type: String,
        required: true,
        trim: true,
      },

      line2: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },

    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },

    dims: {
      L: {
        type: Number,
        min: 0,
      },

      W: {
        type: Number,
        min: 0,
      },

      H: {
        type: Number,
        min: 0,
      },
    },

    parcel: {
      length: {
        type: Number,
        min: 0,
      },

      width: {
        type: Number,
        min: 0,
      },

      height: {
        type: Number,
        min: 0,
      },

      weight: {
        type: Number,
        min: 0,
      },
    },

    providerShipmentId: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
    },

    selectedRateId: {
      type: String,
      trim: true,
    },

    speed: {
      type: String,
      trim: true,
    },

    carrier: {
      type: String,
      trim: true,
    },

    carrierSlug: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    service: {
      type: String,
      trim: true,
    },

    trackingNumber: {
      type: String,
      index: true,
      sparse: true,
      trim: true,
    },

    labelUrl: {
      type: String,
    },

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
      index: true,
    },

    events: {
      type: [ShipmentEventSchema],
      default: [],
    },

    ratesSnapshot: {
      type: [Schema.Types.Mixed],
      default: [],
    },

    activity: {
      type: [ShipmentActivitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ShipmentSchema.index({
  status: 1,
  createdAt: -1,
});

ShipmentSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

ShipmentSchema.index({
  updatedAt: -1,
});

ShipmentSchema.index({
  providerShipmentId: 1,
});

ShipmentSchema.index({
  userId: 1,
  createdAt: -1,
});

ShipmentSchema.index({
  customerEmail: 1,
  createdAt: -1,
});

ShipmentSchema.index({
  packageIds: 1,
});

ShipmentSchema.index({
  trackingNumber: 1,
  createdAt: -1,
});

export const Shipment =
  (mongoose.models.Shipment as mongoose.Model<IShipment>) ||
  mongoose.model<IShipment>("Shipment", ShipmentSchema);