// pages/api/dashboard/whatsapp-settings.ts
// GET  — fetch current WhatsApp settings for logged-in user
// POST — update WhatsApp number + notification toggles

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email)
    return res.status(401).json({ error: "Not authenticated" });

  const email = session.user.email;

  // ── GET: fetch settings ──
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("users")
      .select("whatsapp_number, whatsapp_settings")
      .eq("email", email)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({
      whatsappNumber:  data?.whatsapp_number ?? null,
      settings: data?.whatsapp_settings ?? {
        packageReceived: true,
        customsCleared:  true,
        outForDelivery:  true,
        paymentDue:      false,
        delivered:       true,
      },
    });
  }

  // ── POST: update settings ──
  if (req.method === "POST") {
    const { whatsappNumber, settings } = req.body;

    const { error } = await supabase
      .from("users")
      .update({
        whatsapp_number:   whatsappNumber ?? null,
        whatsapp_settings: settings,
      })
      .eq("email", email);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
