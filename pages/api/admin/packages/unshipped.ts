import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import PackageModel from "@/lib/models/Package";
import "@/lib/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session: any = await getServerSession(
    req,
    res,
    authOptions as any
  );

  const role = session?.user?.role;

  if (
    !session?.user?.id ||
    !["admin", "superadmin"].includes(role)
  ) {
    return res.status(401).json({
      ok: false,
      error: "Unauthorized",
    });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  await dbConnect();

  try {
    const packages = await PackageModel.find({
      $and: [
        {
          $or: [
            { shipmentId: { $exists: false } },
            { shipmentId: null },
          ],
        },
        {
          status: {
            $in: ["Pending", "Received", "Processing"],
          },
        },
      ],
    })
      .populate({
        path: "user",
        select: "name email phone suiteId addresses",
      })
      .sort({ createdAt: -1 })
      .lean();

    const data = packages.map((pkg: any) => {
      const customer = pkg.user || {};
      const addresses = Array.isArray(customer.addresses)
        ? customer.addresses
        : [];

      const destinationAddress =
        addresses.find((address: any) => {
          const label = String(
            address?.label || ""
          ).toLowerCase();

          return (
            label === "shipping" ||
            label === "delivery" ||
            label === "home" ||
            label === "default"
          );
        }) ||
        addresses[0] ||
        null;

      return {
        _id: String(pkg._id),
        tracking: pkg.tracking || "",
        courier: pkg.courier || "",
        value: Number(pkg.value || 0),
        weightKg: Number(pkg.weightKg || 0),
        userEmail:
          customer.email || pkg.userEmail || "",
        suiteId:
          customer.suiteId || pkg.suiteId || "",
        userId: customer?._id
          ? String(customer._id)
          : "",
        status: pkg.status || "",
        createdAt: pkg.createdAt,

        customer: {
          id: customer?._id
            ? String(customer._id)
            : "",
          name: customer.name || "",
          email:
            customer.email || pkg.userEmail || "",
          phone: customer.phone || "",
          suiteId:
            customer.suiteId || pkg.suiteId || "",

          address: destinationAddress
            ? {
                label:
                  destinationAddress.label || "",
                line1:
                  destinationAddress.address || "",
                city:
                  destinationAddress.city || "",
                country:
                  destinationAddress.country || "",
                postalCode:
                  destinationAddress.postalCode || "",
              }
            : null,
        },
      };
    });

    return res.status(200).json({
      ok: true,
      packages: data,
    });
  } catch (error: any) {
    console.error(
      "UNSHIPPED PACKAGES ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        "Failed to load unshipped packages",
    });
  }
}