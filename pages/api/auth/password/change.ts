import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/User";
import bcrypt from "bcryptjs";
// import { Activity } from "@/lib/models/Activity";

const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Missing fields." });
  }

  if (!STRONG.test(newPassword)) {
    return res.status(400).json({
      error: "New password must be at least 10 characters and include upper, lower, and a number.",
    });
  }

  await dbConnect();

  const user = await UserModel.findById((session.user as any).id).select("+password");
  if (!user || !user.password) {
    return res.status(400).json({ error: "Unable to change password." });
  }

  const currentOk = await bcrypt.compare(currentPassword, user.password);
  if (!currentOk) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld) {
    return res.status(400).json({
      error: "New password must be different from current password.",
    });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Optional audit log
  // await Activity.create({
  //   action: "security.password_changed",
  //   entity: "user",
  //   entityId: String(user._id),
  //   details: { email: user.email },
  //   createdAt: new Date(),
  // });

  return res.status(200).json({ ok: true });
}