// pages/api/admin/shipments/mark-paid.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;

  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { shipmentId, isPaid } = req.body || {};
  if (!shipmentId) {
    return res.status(400).json({ ok: false, error: "shipmentId required" });
  }

  await dbConnect();

  const paidFlag = Boolean(isPaid);

  const update: any = { isPaid: paidFlag };
  if (paidFlag) {
    update.paidAt = new Date();
  } else {
    update.paidAt = null;
  }

  const sh = await Shipment.findByIdAndUpdate(shipmentId, update, { new: true }).lean();
  if (!sh) {
    return res.status(404).json({ ok: false, error: "Shipment not found" });
  }

  return res.status(200).json({ ok: true, shipment: sh });
}
