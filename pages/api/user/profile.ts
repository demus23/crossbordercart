// pages/api/user/profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/User";
import ActivityLog from "@/lib/models/ActivityLog";

type Profile = {
  name: string;
  email: string;
  phone?: string;
  membership?: "Free" | "Premium" | "Pro" | string;
  subscribed?: boolean;
  suiteId?: string | null;
  role?: string;
};

type Err = { error: string };

const ALLOWED_UPDATE_FIELDS = new Set(["name", "phone"]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Profile | Err>
) {
  const session = (await getServerSession(req, res, authOptions as any)) as Session | null;
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  await dbConnect();

  const user = await UserModel.findById(session.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      membership: user.membership || "Free",
      subscribed: !!user.subscribed,
      suiteId: user.suiteId ?? null,
      role: user.role || "user",
    });
  }

  if (req.method === "PUT") {
    const body = req.body && typeof req.body === "object" ? req.body : {};

    const invalidKeys = Object.keys(body).filter((key) => !ALLOWED_UPDATE_FIELDS.has(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        error: `These fields cannot be updated here: ${invalidKeys.join(", ")}`,
      });
    }

    const { name, phone } = body;

    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ error: "Name cannot be empty" });
      if (trimmed.length > 100) return res.status(400).json({ error: "Name is too long" });
      user.name = trimmed;
    }

    if (typeof phone === "string") {
      const trimmed = phone.trim();
      if (trimmed.length > 30) return res.status(400).json({ error: "Phone is too long" });
      user.phone = trimmed;
    }

    await user.save();

    try {
      await ActivityLog.create({
        action: "user_update_profile",
        entity: "user",
        entityId: user._id.toString(),
        performedBy: session.user?.email,
        details: {
          name: user.name,
          phone: user.phone,
        },
      });
    } catch {}

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      membership: user.membership || "Free",
      subscribed: !!user.subscribed,
      suiteId: user.suiteId ?? null,
      role: user.role || "user",
    });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}