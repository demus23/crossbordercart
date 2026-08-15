import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import { Shipment } from "@/lib/models/Shipment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);

    return res.status(405).json({
      ok: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  const session: any = await getServerSession(
    req,
    res,
    authOptions as any
  );

  if (!session?.user?.id) {
    return res.status(401).json({
      ok: false,
      error: "Unauthorized",
    });
  }

  await dbConnect();

  try {
    const userId = session.user.id;
    const userEmail = String(
      session.user.email || ""
    )
      .trim()
      .toLowerCase();

    const shipments = await Shipment.find({
      $or: [
        { userId },
        { user: userId },

        ...(userEmail
          ? [
              { customerEmail: userEmail },
              { userEmail },
              { "to.email": userEmail },
            ]
          : []),
      ],
    })
      .populate({
        path: "packageIds",
        select:
          "tracking courier weightKg value status shipmentTracking",
      })
      .sort({ createdAt: -1 })
      .lean();

    const data = shipments.map((shipment: any) => {
      const packages = Array.isArray(
        shipment.packageIds
      )
        ? shipment.packageIds
        : [];

      return {
        _id: String(shipment._id),

        trackingNumber:
          shipment.trackingNumber || "",

        packageTrackingNumber:
          shipment.packageTrackingNumber || "",

        destination: {
          name: shipment.to?.name || "",
          city: shipment.to?.city || "",
          country: shipment.to?.country || "",
        },

        carrier: shipment.carrier || "",
        service: shipment.service || "",

        weightKg: Number(
          shipment.weightKg || 0
        ),

        priceAED: Number(
          shipment.priceAED || 0
        ),

        currency:
          shipment.currency || "AED",

        status:
          shipment.status || "draft",

        paymentStatus:
          shipment.paymentStatus ||
          (shipment.isPaid
            ? "paid"
            : "unpaid"),

        isPaid:
          shipment.isPaid === true ||
          shipment.paymentStatus === "paid",

        checkoutUrl:
          shipment.checkoutUrl || null,

        invoiceNo:
          shipment.invoiceNo || null,

        packageCount:
          packages.length,

        packages: packages.map(
          (pkg: any) => ({
            _id: String(pkg._id),
            tracking:
              pkg.tracking || "",
            courier:
              pkg.courier || "",
            weightKg: Number(
              pkg.weightKg || 0
            ),
            status:
              pkg.status || "",
          })
        ),

        latestEvent:
          Array.isArray(shipment.events) &&
          shipment.events.length > 0
            ? shipment.events[
                shipment.events.length - 1
              ]
            : null,

        createdAt:
          shipment.createdAt,

        updatedAt:
          shipment.updatedAt,
      };
    });

    return res.status(200).json({
      ok: true,
      shipments: data,
      total: data.length,
    });
  } catch (error: any) {
    console.error(
      "Customer shipments API error:",
      error
    );

    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        "Failed to load shipments",
    });
  }
}