// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sendMail } from "@/lib/email/nodemailer"; // same helper we used for labels
import { errorMessage } from "@/utils/errors";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "Name, email and message are required" });
  }

  const adminEmail = process.env.SUPPORT_EMAIL || "support@example.com"; // 🔁 change in .env

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>New contact form message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b></p>
      <p>${String(message).replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  try {
    await sendMail(adminEmail, `Contact form message from ${name}`, html);
    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    return res
      .status(500)
      .json({ ok: false, error: errorMessage(e) || "Failed to send message" });
  }
}
