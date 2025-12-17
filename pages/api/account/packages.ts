// pages/api/account/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import UserModel, { type IUser } from "@/lib/models/User";
import PackageModel from "@/lib/models/Package";

type PackageDoc = {
  _id: any;
  tracking?: string;
  courier?: string;
  value?: number;
  status?: string;
  user?: any;
  userEmail?: string;
  suiteId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type ApiOk = { ok: true; packages: PackageDoc[] };
type ApiErr = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiOk | ApiErr>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res
      .status(405)
      .json({ ok: false, error: `Method ${req.method} Not Allowed` });
  }

  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as Session | null;

  if (!session?.user?.email) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  await dbConnect();

  // normalize email
  const emailLc = String(session.user.email).trim().toLowerCase();

  const user = await UserModel.findOne({ email: emailLc })
    .lean<IUser | null>()
    .exec();

  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }

  // Build OR query:
  const or: Record<string, any>[] = [];

  // 1) match by user ObjectId (main way)
  if (user._id) or.push({ user: user._id });

  // 2) match by suiteId, if present
  if ((user as any).suiteId) {
    or.push({ suiteId: (user as any).suiteId });
  }

  // 3) match by lowercased email
  or.push({ userEmail: emailLc });

  const query = { $or: or };

  const packages = (await PackageModel.find(query)
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean()) as unknown as PackageDoc[];

  return res.status(200).json({ ok: true, packages });
}
