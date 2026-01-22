import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail({
  to,
  subject,
  react,
  html,
  from,
}: {
  to: string;
  subject: string;
  react?: React.ReactElement;
  html?: string;
  from?: string;
}) {
  // Don’t crash production flows if email is not configured
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing. Skipping email send.");
    return;
  }

  const rendered = html ?? (react ? await render(react) : "");
  if (!rendered) throw new Error("No email body provided");

  const sender = from ?? process.env.EMAIL_FROM ?? "no-reply@example.com";

  const { error } = await resend.emails.send({
    from: sender,
    to,
    subject,
    html: rendered,
  });

  if (error) throw error;
}
