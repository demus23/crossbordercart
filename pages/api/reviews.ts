import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { Shipment } from "@/lib/models/Shipment";
import { Review } from "@/lib/models/Review";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();
  } catch (error) {
    console.error("DB connection error in /api/reviews:", error);
    return res.status(500).json({ message: "Database connection error" });
  }

  if (req.method === "POST") {
    const { shipmentId, rating, comment, customerName, customerEmail } = req.body;

    if (!shipmentId || !rating) {
      return res.status(400).json({ message: "shipmentId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try {
      const shipment = await Shipment.findById(shipmentId);

      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Optional: only allow review if shipment is delivered
      if (
        shipment.status &&
        typeof shipment.status === "string" &&
        shipment.status.toLowerCase() !== "delivered"
      ) {
        return res
          .status(400)
          .json({ message: "You can only review delivered shipments" });
      }

      const review = await Review.findOneAndUpdate(
        { shipment: shipmentId },
        {
          rating,
          comment,
          customerName,
          customerEmail,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.status(200).json(review);
    } catch (error) {
      console.error("Error saving review:", error);
      return res.status(500).json({ message: "Error saving review" });
    }
  }

  if (req.method === "GET") {
    const { shipmentId, publicOnly } = req.query;

    try {
      if (shipmentId) {
        const review = await Review.findOne({ shipment: shipmentId });
        return res.status(200).json(review);
      }

      const filter: any = {};
      if (publicOnly === "true") {
        filter.isPublic = true;
      }

      const reviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .limit(30);

      return res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return res.status(500).json({ message: "Error fetching reviews" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
