import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import { Rate } from "@/lib/models/Rate";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(req, res, authOptions as any);

  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user.role)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === "GET") {
    const rates = await Rate.find({}).sort({ country: 1 }).lean();
    return res.status(200).json({ ok: true, rates });
  }

  if (req.method === "POST") {
    const {
      country,
      countryCode,
      pricePerKg,
      fuelPercent = 10,
      profitPercent = 20,
      stripePercent = 3,
      active = true,
    } = req.body || {};

    if (!country || !countryCode || !pricePerKg) {
      return res.status(400).json({
        ok: false,
        error: "country, countryCode and pricePerKg are required",
      });
    }

    const rate = await Rate.findOneAndUpdate(
      { countryCode: String(countryCode).toUpperCase() },
      {
        $set: {
          country,
          countryCode: String(countryCode).toUpperCase(),
          pricePerKg: Number(pricePerKg),
          fuelPercent: Number(fuelPercent),
          profitPercent: Number(profitPercent),
          stripePercent: Number(stripePercent),
          active: Boolean(active),
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json({ ok: true, rate });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}