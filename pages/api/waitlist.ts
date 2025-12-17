// pages/api/waitlist.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/mongoose";
import { WaitlistEntry } from "@/lib/models/WaitlistEntry";

type Data =
  | { ok: true }
  | { ok: false; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { email, country, volume } = req.body || {};

  if (!email || !country || !volume) {
    return res.status(400).json({ ok: false, message: "Missing fields" });
  }

  try {
    await dbConnect();

    await WaitlistEntry.create({
      email,
      country,
      volume,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Waitlist API error", err);
    return res.status(500).json({
      ok: false,
      message: "Something went wrong, please try again.",
    });
  }
}
