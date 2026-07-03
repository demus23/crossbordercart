import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";
import { Shipment } from "@/lib/models/Shipment";
import { Payment } from "@/lib/models/Payment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(req, res, authOptions as any);

  if (!session?.user?.id) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  await dbConnect();

  const packageId = String(req.query.packageId || "");

  const pkg: any = await PackageModel.findOne({
  _id: packageId,
  $or: [
    { user: session.user.id },
    { userId: session.user.id },
  ],
}).lean();

  if (!pkg?.shipmentId) {
    return res.status(404).json({ ok: false, error: "Shipment not found" });
  }

  const shipment: any = await Shipment.findById(pkg.shipmentId).lean();

  if (!shipment) {
    return res.status(404).json({ ok: false, error: "Shipment not found" });
  }

  if (shipment.isPaid) {
    return res.status(200).json({ ok: true, paid: true });
  }

  let checkoutUrl = shipment.checkoutUrl;

if (!checkoutUrl) {
  const payment: any = await Payment.findOne({
    shipmentId: shipment._id,
    status: "pending",
  })
    .sort({ createdAt: -1 })
    .lean();

  checkoutUrl = payment?.checkoutUrl;
}

if (!checkoutUrl) {
  return res.status(404).json({
    ok: false,
    error: "Payment link is not ready yet. Admin must create payment link first.",
  });
}

  return res.status(200).json({
    ok: true,
    checkoutUrl,
  });
}