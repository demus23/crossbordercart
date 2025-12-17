// pages/api/packages/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import UserModel from "@/lib/models/User";
import PackageModel from "@/lib/models/Package";
import { Shipment, IShipment } from "@/lib/models/Shipment";
import { logActivity } from "@/lib/audit";

type UserPkg = {
  _id: string;
  tracking: string;
  courier: string;
  value: number;
  status: "pending" | "in_transit" | "delivered" | "problem" | string;
  userEmail?: string;
  suiteId?: string | null;
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

type Err = { error: string };
type IUserLean = { _id: any; suiteId?: string | null; email?: string | null };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | { packages: UserPkg[] }
    | { ok: boolean; data?: any; error?: string }
    | Err
  >
) {
  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as Session | null;
  if (!session?.user?.id)
    return res.status(401).json({ error: "Unauthorized" });

  await dbConnect();

  // ---------- GET: return current user's packages (enriched with shipment info) ----------
  if (req.method === "GET") {
    const rawDb = mongoose.connection.db;
    if (!rawDb) return res.status(500).json({ error: "Database not connected" });
    const db = rawDb as any;

    const me = await UserModel.findById(session.user.id).lean<IUserLean | null>();
    if (!me) return res.status(404).json({ error: "User not found" });

    const ors: any[] = [];
    if (session.user.id) ors.push({ userId: String(session.user.id) });
    if (me.suiteId) ors.push({ suiteId: String(me.suiteId) });
    if (me.email) ors.push({ userEmail: String(me.email).toLowerCase() });

    if (ors.length === 0) return res.status(200).json({ packages: [] });

    const docs = await db
      .collection("packages")
      .find({ $or: ors })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(200)
      .toArray();

    // 1️⃣ collect all package ids
    const pkgIds = docs
      .map((d: any) => d._id)
      .filter((id: any) => mongoose.Types.ObjectId.isValid(id)) as mongoose.Types.ObjectId[];

    // 2️⃣ fetch shipments that reference these packages
    const shipments = await Shipment.find({
      packageIds: { $in: pkgIds },
    })
      .sort({ createdAt: -1 }) // latest first
      .lean<IShipment[]>();

    // 3️⃣ build map: packageId -> latest shipment
    const latestByPackage: Record<string, IShipment> = {};
    for (const sh of shipments) {
      if (!sh.packageIds) continue;
      for (const pid of sh.packageIds) {
        const key = String(pid);
        // first one we see is the latest because of sort({ createdAt: -1 })
        if (!latestByPackage[key]) {
          latestByPackage[key] = sh;
        }
      }
    }

    // 4️⃣ build response
    const packages: UserPkg[] = docs.map((d: any) => {
      const pkgIdStr = String(d._id);
      const linked = latestByPackage[pkgIdStr];

      const baseCreated =
        d.createdAt ? new Date(d.createdAt) : new Date(Date.now());
      const baseUpdated = d.updatedAt
        ? new Date(d.updatedAt)
        : baseCreated;

      return {
        _id: pkgIdStr,
        tracking: String(d.tracking ?? pkgIdStr),
        courier: String(d.courier ?? linked?.carrier ?? ""),
        value:
          linked?.priceAED != null
            ? Number(linked.priceAED)
            : Number(d.value ?? 0),
        status: String(linked?.status ?? d.status ?? "pending"),
        userEmail: d.userEmail ? String(d.userEmail) : undefined,
        suiteId: d.suiteId == null ? null : String(d.suiteId),
        userId: d.userId ? String(d.userId) : undefined,
        createdAt: baseCreated.toISOString(),
        updatedAt: baseUpdated.toISOString(),
      };
    });

    return res.status(200).json({ packages });
  }

  // ---------- POST: create a package + audit ----------
  if (req.method === "POST") {
    const userId = String(session.user.id);
    const {
      tracking,
      courier,
      value,
      status,
      title,
      recipient,
      description,
      suiteId,
      address,
    } = req.body ?? {};

    if (!tracking || !courier || value == null) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing fields: tracking, courier, value" });
    }

    const pkg = await PackageModel.create({
      user: new mongoose.Types.ObjectId(userId),
      tracking,
      courier,
      value,
      status: status || "pending",
      title: title || "",
      recipient: recipient || "",
      description: description || "",
      suiteId: suiteId || "",
      address: address || "",
    });

    await logActivity(req, {
      action: "package.created",
      entity: "package",
      entityId: String(pkg._id),
      details: { tracking, courier, value, status: pkg.status },
      userId,
      email: (session.user as any)?.email,
    });

    return res.status(201).json({ ok: true, data: pkg });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
