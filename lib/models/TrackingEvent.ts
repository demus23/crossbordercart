// lib/models/TrackingEvent.ts
import mongoose, { Schema, model, models, InferSchemaType } from "mongoose";

const TrackingEventSchema = new Schema(
  {
    packageId: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      index: true,
      required: true,
    },
    trackingNo: { type: String, index: true, required: true },

    // ✅ Match your app’s human-readable statuses
    status: {
  type: String,
  enum: [
    "Pending",
    "Received",
    "Processing",
    "Shipped",
    "In Transit",
    "IN_TRANSIT",
    "Delivered",
    "Cancelled",
    "Canceled",
    "Forwarded",
    "Problem",
  ],
  required: true,
  default: "Pending",
},


    location: { type: String, default: "" },
    note: { type: String, default: "" },
    actorId: { type: String, default: "" },
    actorName: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TrackingEventSchema.index({ trackingNo: 1, createdAt: -1 });

export type TrackingEventDoc = InferSchemaType<typeof TrackingEventSchema>;

export default models.TrackingEvent ||
  model<TrackingEventDoc>("TrackingEvent", TrackingEventSchema);
