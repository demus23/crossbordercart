import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import { Rate, IRate } from "@/lib/models/Rate";
import { calculateShippingPrice } from "@/lib/pricing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const countryCode = String(req.query.countryCode || "").toUpperCase();
  const weightKg = Number(req.query.weightKg || 0);

  if (!countryCode || !weightKg || weightKg <= 0) {
    return res.status(400).json({
      ok: false,
      error: "countryCode and valid weightKg are required",
    });
  }

  const rate = (await Rate.findOne({
    countryCode,
    active: true,
  }).lean()) as IRate | null;

  if (!rate) {
    return res.status(404).json({
      ok: false,
      error: "No active rate found for this country",
    });
  }

  const breakdown = calculateShippingPrice({
    weightKg,
    pricePerKg: rate.pricePerKg,
    fuelPercent: rate.fuelPercent,
    profitPercent: rate.profitPercent,
    stripePercent: rate.stripePercent,
  });

  return res.status(200).json({
    ok: true,
    country: rate.country,
    countryCode: rate.countryCode,
    weightKg,
    breakdown,
  });
}