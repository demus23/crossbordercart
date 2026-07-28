//pages\api\support.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { topic, message } = req.body || {};

    if (!topic || !message) {
      return res.status(400).json({ error: "Topic and message are required" });
    }

    if (!resend) {
      return res.status(500).json({ error: "Email service is not configured" });
    }

    await resend.emails.send({
      from: "Cross Border Cart <no-reply@crossbordercart.com>",
      to: "support.crossbordercart@gmail.com",
      replyTo: session.user.email,
      subject: `[Support] ${topic}`,
      text: `
Support request from: ${session.user.email}
Name: ${session.user.name || "User"}

Topic: ${topic}

Message:
${message}
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send support request" });
  }
}