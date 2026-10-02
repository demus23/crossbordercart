import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
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
    // Must be signed in — prevents anyone who guesses/knows a shipmentId
    // from posting a review that isn't theirs.
    const session = (await getServerSession(req, res, authOptions as any)) as any;
    if (!session?.user?.id) {
      return res.status(401).json({ message: "Sign in to leave a review" });
    }

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

      // Only the shipment's own customer (matched by account, or by email as
      // a fallback for admin-entered shipments) or an admin can review it.
      const sessionUserId = String(session.user.id);
      const sessionEmail = (session.user.email || "").toLowerCase();
      const isAdmin = ["admin", "superadmin"].includes(session.user?.role || "");
      const isOwner =
        (shipment.userId && String(shipment.userId) === sessionUserId) ||
        (shipment.user && String(shipment.user) === sessionUserId) ||
        (sessionEmail &&
          [shipment.customerEmail, shipment.userEmail]
            .filter(Boolean)
            .some((e: string) => e.toLowerCase() === sessionEmail));

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "You can only review your own shipments" });
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
