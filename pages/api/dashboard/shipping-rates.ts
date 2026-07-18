// pages/api/dashboard/shipping-rates.ts
// GET /api/dashboard/shipping-rates?weight=3&country=Kenya
// Returns air + sea estimated prices based on weight and destination

import type { NextApiRequest, NextApiResponse } from "next";

// AED per kg by country — update these to match your real rates
const RATES: Record<string, { air: number; sea: number; airDays: string; seaDays: string }> = {
  Kenya:        { air: 18, sea: 9,  airDays: "5–9",   seaDays: "21–28" },
  Nigeria:      { air: 22, sea: 11, airDays: "7–12",  seaDays: "25–35" },
  Ghana:        { air: 20, sea: 10, airDays: "7–11",  seaDays: "25–35" },
  Tanzania:     { air: 16, sea: 8,  airDays: "5–9",   seaDays: "21–28" },
  Zambia:       { air: 19, sea: 9,  airDays: "8–13",  seaDays: "28–35" },
  Uganda:       { air: 17, sea: 8,  airDays: "6–10",  seaDays: "21–28" },
  Ethiopia:     { air: 25, sea: 12, airDays: "9–14",  seaDays: "30–40" },
  "South Africa": { air: 30, sea: 15, airDays: "10–16", seaDays: "35–45" },
  "United Kingdom": { air: 35, sea: 16, airDays: "5–8", seaDays: "28–35" },
  "United States":  { air: 40, sea: 18, airDays: "6–10", seaDays: "30–40" },
  India:        { air: 22, sea: 10, airDays: "4–7",   seaDays: "18–25" },
  Pakistan:     { air: 20, sea: 9,  airDays: "3–6",   seaDays: "15–22" },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const weight  = parseFloat(req.query.weight as string);
  const country = req.query.country as string;

  if (!weight || weight <= 0)
    return res.status(400).json({ error: "Invalid weight" });
  if (!country || !RATES[country])
    return res.status(400).json({ error: "Country not supported" });

  const rate = RATES[country];
  // Add 15 AED handling fee for all shipments
  const handling = 15;
  const airTotal = Math.round((weight * rate.air + handling) * 100) / 100;
  const seaTotal = Math.round((weight * rate.sea + handling) * 100) / 100;

  return res.status(200).json({
    country,
    weight,
    air: { total: airTotal, perKg: rate.air, days: rate.airDays },
    sea: { total: seaTotal, perKg: rate.sea, days: rate.seaDays },
    handling,
    note: "Estimate only. Final price based on actual dimensions and declared value.",
  });
}
