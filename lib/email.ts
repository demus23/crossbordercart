// lib/email.ts
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
} = process.env;

// In dev we just log instead of actually sending
const isDev = process.env.NODE_ENV !== "production";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (isDev) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: false,
      auth: SMTP_USER
        ? {
            user: SMTP_USER,
            pass: SMTP_PASS,
          }
        : undefined,
    });
  }
  return transporter;
}

// ✅ Generic sendMail used by other APIs (like send-receipt.ts)
export type SendMailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

export async function sendMail({
  to,
  subject,
  html = "",
  text = "",
  from,
}: SendMailOptions): Promise<void> {
  const finalFrom = from || MAIL_FROM || SMTP_USER || "no-reply@myus-app.local";

  if (isDev) {
    console.log("[DEV sendMail] Not actually sending email:", {
      to,
      from: finalFrom,
      subject,
      textPreview: text?.slice(0, 120),
      htmlPreview: html?.slice(0, 120),
    });
    return;
  }

  const t = getTransporter();
  if (!t) return;

  await t.sendMail({
    from: finalFrom,
    to,
    subject,
    html,
    text,
  });
}

// ✅ Your existing shipment-status helper (now using sendMail internally)
export async function sendShipmentStatusEmail(opts: {
  to: string;
  trackingNo: string;
  status: string;
  customerName?: string;
  publicUrl: string;
}) {
  const { to, trackingNo, status, customerName, publicUrl } = opts;

  const subject = `Update on your shipment ${trackingNo}`;
  const greeting = customerName ? `Hi ${customerName},` : "Hello,";

  const html = `
    <p>${greeting}</p>
    <p>Your shipment <strong>${trackingNo}</strong> has a new status:</p>
    <p style="font-size:16px"><strong>${status}</strong></p>
    <p>You can view the live tracking here:</p>
    <p><a href="${publicUrl}" target="_blank">${publicUrl}</a></p>
    <p>Thank you for using CrossBorderCart.</p>
  `;

  // Reuse generic helper
  await sendMail({ to, subject, html });
}
