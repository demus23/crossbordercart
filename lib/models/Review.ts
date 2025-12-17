import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IReview extends Document {
  shipment: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  customerName?: string;
  customerEmail?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    shipment: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
      unique: true, // one review per shipment
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isPublic: {
      type: Boolean,
      default: true, // use this to filter which reviews show on marketing pages
    },
  },
  { timestamps: true }
);

export const Review =
  (models.Review as mongoose.Model<IReview>) || model<IReview>("Review", ReviewSchema);
