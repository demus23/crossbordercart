// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/User";

type SafeAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

function sanitizeString(value: unknown, max = 120) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function sanitizeAddress(input: any): SafeAddress {
  const raw = input && typeof input === "object" ? input : {};

  return {
    line1: sanitizeString(raw.line1, 200),
    line2: sanitizeString(raw.line2, 200),
    city: sanitizeString(raw.city, 100),
    state: sanitizeString(raw.state, 100),
    postalCode: sanitizeString(raw.postalCode, 40),
    country: sanitizeString(raw.country, 100),
    phone: sanitizeString(raw.phone, 30),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === "GET") {
    const user = await UserModel.findOne({ email: session.user.email }).select("-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  }

  if (req.method === "PUT") {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    const allowedTopLevelKeys = ["address"];
    const invalidKeys = Object.keys(body).filter((key) => !allowedTopLevelKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        error: `These fields cannot be updated here: ${invalidKeys.join(", ")}`,
      });
    }

    const safeAddress = sanitizeAddress(body.address);

    if (!safeAddress.line1 || !safeAddress.city || !safeAddress.country) {
      return res.status(400).json({
        error: "Address line 1, city, and country are required",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          address: safeAddress,
          phone: safeAddress.phone || "",
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method not allowed" });
}