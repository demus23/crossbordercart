// pages/api/dashboard/update-package.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ error: "Not authenticated" });

  const { id, selling_price_aed, description, weight } = req.body;
  if (!id) return res.status(400).json({ error: "Package id required" });

  const update: Record<string, unknown> = {};
  if (selling_price_aed !== undefined) update.selling_price_aed = selling_price_aed;
  if (description       !== undefined) update.description       = description;
  if (weight            !== undefined) update.weight            = weight;

  const { error } = await supabase
    .from("packages")
    .update(update)
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}