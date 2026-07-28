// pages/api/webhooks/new-signup.ts
//
// Triggered by a Supabase Database Webhook on INSERT into your users table.
// Sends:
//   1. WhatsApp + email alert to YOU (admin)
//   2. WhatsApp + email welcome to the NEW USER
//
// Reuses your existing lib/email/resend.ts sendEmail() helper (same one used for
// shipment update emails) rather than a separate Resend client — one place to
// configure sender address, reply-to, and the "don't crash if unconfigured" fallback.
//
// Channels run independently — if WhatsApp fails (e.g. template not yet approved,
// or an invalid phone number), email still goes out, and vice versa.

import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";
import { sendEmail } from "../../../lib/email/resend";
import WelcomeEmail from "../../../emails/WelcomeEmail";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const FROM_WHATSAPP = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`; // e.g. whatsapp:+14155238886
const ADMIN_WHATSAPP = `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER}`; // your own number
const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // where you receive alerts

interface NewUserRecord {
  name?: string;
  email?: string;
  phone?: string; // expected in E.164 format, e.g. +971501234567
  suite?: string;
  role?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Reject anything without the shared secret — set the same value as a custom
  // header on the Supabase webhook config.
  if (req.headers["x-webhook-secret"] !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const newUser: NewUserRecord = req.body.record ?? {};
  const { name = "New user", email, phone, suite = "N/A" } = newUser;

  const tasks: Promise<{ channel: string; ok: boolean; error?: string }>[] = [];

  // ---------- 1. Admin WhatsApp alert (no template needed — this is you, not the customer) ----------
  tasks.push(
    twilioClient.messages
      .create({
        from: FROM_WHATSAPP,
        to: ADMIN_WHATSAPP,
        body: `🆕 New signup!\nName: ${name}\nEmail: ${email ?? "N/A"}\nPhone: ${phone ?? "N/A"}\nSuite: ${suite}`,
      })
      .then(() => ({ channel: "admin_whatsapp", ok: true }))
      .catch((err) => ({ channel: "admin_whatsapp", ok: false, error: String(err) }))
  );

  // ---------- 2. Admin email alert ----------
  if (ADMIN_EMAIL) {
    tasks.push(
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New signup: ${name}`,
        html: `
          <h2>New user signed up</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email ?? "N/A"}</p>
          <p><strong>Phone:</strong> ${phone ?? "N/A"}</p>
          <p><strong>Suite:</strong> ${suite}</p>
        `,
      })
        .then(() => ({ channel: "admin_email", ok: true }))
        .catch((err) => ({ channel: "admin_email", ok: false, error: String(err) }))
    );
  }

  // ---------- 3. User WhatsApp welcome (requires an approved Utility template) ----------
  if (phone && process.env.TWILIO_WELCOME_TEMPLATE_SID) {
    tasks.push(
      twilioClient.messages
        .create({
          from: FROM_WHATSAPP,
          to: `whatsapp:${phone}`,
          contentSid: process.env.TWILIO_WELCOME_TEMPLATE_SID,
          contentVariables: JSON.stringify({ "1": name, "2": suite }),
        })
        .then(() => ({ channel: "user_whatsapp", ok: true }))
        .catch((err) => ({ channel: "user_whatsapp", ok: false, error: String(err) }))
    );
  }

  // ---------- 4. User welcome email (same helper + branded template as shipment update emails) ----------
  if (email) {
    tasks.push(
      sendEmail({
        to: email,
        subject: "Welcome to CrossBorderCart 🎉",
        react: WelcomeEmail({ name, suite }),
      })
        .then(() => ({ channel: "user_email", ok: true }))
        .catch((err) => ({ channel: "user_email", ok: false, error: String(err) }))
    );
  }

  const results = await Promise.all(tasks);
  const failures = results.filter((r) => !r.ok);

  if (failures.length > 0) {
    console.error("Signup notification partial failure:", failures);
  }

  // Always 200 back to Supabase — a notification failure shouldn't make Supabase
  // retry the webhook and re-send duplicate alerts. Failures are logged above instead.
  return res.status(200).json({ results });
}