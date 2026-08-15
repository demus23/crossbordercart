// pages/api/me/push-token.ts
//
// Called by the mobile app after it registers with FCM, so we know which
// device tokens belong to which user. POST to register/refresh a token,
// DELETE to remove one (e.g. on logout).
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === "POST") {
    const { deviceToken, platform } = req.body || {};
    if (!deviceToken || !platform) {
      return res.status(400).json({ ok: false, error: "deviceToken and platform are required" });
    }
    if (!["ios", "android", "web"].includes(platform)) {
      return res.status(400).json({ ok: false, error: "platform must be ios, android, or web" });
    }

    // Remove any existing entry for this exact token (covers token refresh /
    // re-registering on the same device), then push a fresh one.
    await UserModel.updateOne(
      { _id: session.user.id },
      { $pull: { pushTokens: { deviceToken } } }
    );
    await UserModel.updateOne(
      { _id: session.user.id },
      {
        $push: {
          pushTokens: {
            deviceToken,
            platform,
            createdAt: new Date(),
            lastActive: new Date(),
          },
        },
      }
    );

    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { deviceToken } = req.body || {};
    if (!deviceToken) {
      return res.status(400).json({ ok: false, error: "deviceToken is required" });
    }

    await UserModel.updateOne(
      { _id: session.user.id },
      { $pull: { pushTokens: { deviceToken } } }
    );

    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "POST, DELETE");
  return res.status(405).json({ ok: false, error: "Method Not Allowed" });
}
