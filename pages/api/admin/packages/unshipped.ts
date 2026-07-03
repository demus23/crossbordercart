import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(req, res, authOptions as any);
const role = session?.user?.role;

if (!session?.user?.id || !["admin", "superadmin"].includes(role)) {
  console.log("UNSHIPPED API Unauthorized session:", session);
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

  await dbConnect();

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const packages = await PackageModel.find({
    $or: [
      { shipmentId: { $exists: false } },
      { shipmentId: null },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();

  const data = packages.map((p: any) => ({
    _id: String(p._id),
    tracking: p.tracking || "",
    courier: p.courier || "",
    value: Number(p.value || 0),
    weightKg: Number(p.weightKg || p.weight || 0),
    userEmail: p.userEmail || "",
    suiteId: p.suiteId || "",
    status: p.status || "",
    createdAt: p.createdAt,
  }));

  return res.status(200).json({
    ok: true,
    packages: data,
  });
}