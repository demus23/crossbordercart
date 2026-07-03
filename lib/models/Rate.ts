import mongoose, { Schema, models, model } from "mongoose";

export interface IRate {
  country: string;
  countryCode: string;
  pricePerKg: number;
  fuelPercent: number;
  profitPercent: number;
  stripePercent: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const RateSchema = new Schema<IRate>(
  {
    country: { type: String, required: true },
    countryCode: { type: String, required: true, uppercase: true },
    pricePerKg: { type: Number, required: true },
    fuelPercent: { type: Number, default: 10 },
    profitPercent: { type: Number, default: 20 },
    stripePercent: { type: Number, default: 3 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RateSchema.index({ countryCode: 1 }, { unique: true });

export const Rate = models.Rate || model<IRate>("Rate", RateSchema);