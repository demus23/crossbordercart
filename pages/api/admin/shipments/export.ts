// pages/api/admin/shipments/export.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = (await getServerSession(req, res, authOptions as any)) as any;

  // 🔐 Only admin/superadmin
  if (!session?.user?.id || !["admin", "superadmin"].includes(session.user?.role || "")) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  await dbConnect();

  // Optional filters: ?status=delivered&payment=paid
  const { status, payment, from, to } = req.query;

  const filter: any = {};
  if (status && typeof status === "string") filter.status = status;
  if (payment && typeof payment === "string") filter.paymentStatus = payment;

  // Optional date range
  if (from || to) {
    filter.createdAt = {};
    if (from && typeof from === "string") {
      filter.createdAt.$gte = new Date(from);
    }
    if (to && typeof to === "string") {
      // include whole day
      const d = new Date(to);
      d.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = d;
    }
  }

  const shipments = await Shipment.find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .limit(5000); // safety limit

  // CSV header
  const header = [
    "id",
    "createdAt",
    "status",
    "paymentStatus",
    "carrier",
    "service",
    "trackingNumber",
    "price",
    "currency",
    "weightKg",
    "toName",
    "toCity",
    "toCountry",
    "customerEmail",
  ];

  const escape = (val: any) => {
    if (val == null) return "";
    const s = String(val);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = shipments.map((s: any) => [
    s._id,
    s.createdAt?.toISOString?.() || "",
    s.status || "",
    s.paymentStatus || "",
    s.carrier || "",
    s.service || "",
    s.trackingNumber || "",
    s.priceAED ?? "",
    s.currency || "",
    s.weightKg ?? "",
    s.to?.name || "",
    s.to?.city || "",
    s.to?.country || "",
    s.customerEmail || s.to?.email || "",
  ]);

  const csv =
    header.map(escape).join(",") +
    "\n" +
    rows.map((r) => r.map(escape).join(",")).join("\n");

  const filename = `shipments-${new Date().toISOString().slice(0, 10)}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}
