// lib/models/WaitlistEntry.ts
import mongoose, { Schema, models, model } from "mongoose";

export interface IWaitlistEntry extends mongoose.Document {
  email: string;
  country: string;
  volume: "personal" | "reseller";
  createdAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    email: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    volume: {
      type: String,
      enum: ["personal", "reseller"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Avoid model overwrite issue in dev
export const WaitlistEntry =
  models.WaitlistEntry || model<IWaitlistEntry>("WaitlistEntry", WaitlistEntrySchema);
