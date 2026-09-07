// pages/api/auth/signup.ts

import type { NextApiRequest, NextApiResponse } from "next";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/User";
import EmailToken from "@/lib/models/EmailToken";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import disposableDomains from "disposable-email-domains";

const disposableSet = new Set(
  disposableDomains.map((domain: string) => domain.toLowerCase())
);

/* ─────────────────────────────────────────────
   Common email typo suggestions
───────────────────────────────────────────── */

const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.co": "gmail.com",

  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",

  "outlok.com": "outlook.com",
  "outllook.com": "outlook.com",

  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",

  "iclud.com": "icloud.com",
  "icloud.con": "icloud.com",
};

/* ─────────────────────────────────────────────
   Signup Handler
───────────────────────────────────────────── */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      country,
      phone,
      addressLabel = "Home",
      address1,
      address2,
      city,
      state,
      postalCode,
    } = (req.body || {}) as Record<string, string>;

    /* ─────────────────────────────────────────
       Required fields
    ───────────────────────────────────────── */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !country
    ) {
      return res.status(400).json({
        error: "Missing required fields.",
      });
    }

    /* ─────────────────────────────────────────
       Normalize email
    ───────────────────────────────────────── */

    const normalizedEmail = email.trim().toLowerCase();

    /* ─────────────────────────────────────────
       Basic email format validation
    ───────────────────────────────────────── */

    const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!EMAIL_RULE.test(normalizedEmail)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    const domain = normalizedEmail.split("@")[1];

    /* ─────────────────────────────────────────
       Common typo check
    ───────────────────────────────────────── */

    const suggestedDomain = DOMAIN_TYPOS[domain];

    if (suggestedDomain) {
      const username = normalizedEmail.split("@")[0];

      return res.status(400).json({
        error: `Did you mean ${username}@${suggestedDomain}?`,
      });
    }

    /* ─────────────────────────────────────────
       Disposable email check
    ───────────────────────────────────────── */

    if (disposableSet.has(domain)) {
      return res.status(400).json({
        error:
          "Temporary email addresses are not allowed. Please use a permanent email address.",
      });
    }

    /* ─────────────────────────────────────────
       Password confirmation
    ───────────────────────────────────────── */

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match.",
      });
    }

    /* ─────────────────────────────────────────
       Password strength
    ───────────────────────────────────────── */

    const PASS = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!PASS.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase and a number.",
      });
    }

    /* ─────────────────────────────────────────
       Check existing account
    ───────────────────────────────────────── */

    const exists = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      return res.status(409).json({
        error: "Email already registered.",
      });
    }

    /* ─────────────────────────────────────────
       Generate unique UAE Suite ID
    ───────────────────────────────────────── */

    let suiteId = "";
    let existsSuite = true;

    while (existsSuite) {
      suiteId =
        "UAE-" +
        Math.floor(10000 + Math.random() * 90000);

      existsSuite = !!(await UserModel.findOne({
        suiteId,
      }));
    }

    /* ─────────────────────────────────────────
       Hash password
    ───────────────────────────────────────── */

    const hashed = await bcrypt.hash(password, 10);

    /* ─────────────────────────────────────────
       Address
    ───────────────────────────────────────── */

    const addresses: any[] = [];

    if (
      address1 ||
      address2 ||
      city ||
      state ||
      postalCode ||
      country
    ) {
      addresses.push({
        label: addressLabel || "Home",
        address: address1 || "",
        address2: address2 || "",
        city: city || "",
        state: state || "",
        postalCode: postalCode || "",
        country,
      });
    }

    /* ─────────────────────────────────────────
       Create User
    ───────────────────────────────────────── */

    const user = await UserModel.create({
      email: normalizedEmail,

      name: `${firstName.trim()} ${lastName.trim()}`,

      password: hashed,

      suiteId,

      country,

      phone: phone?.trim() || undefined,

      role: "user",

      status: "Active",

      // User cannot login until verification
      emailVerified: false,

      ...(addresses.length
        ? {
            addresses,
          }
        : {}),
    });

    /* ─────────────────────────────────────────
       Remove any old verification tokens
    ───────────────────────────────────────── */

    await EmailToken.deleteMany({
      userId: user._id,
      type: "verify",
    });

    /* ─────────────────────────────────────────
       Create verification token
    ───────────────────────────────────────── */

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    // 24 hour expiry
    const expires = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    await EmailToken.create({
      userId: user._id,
      email: normalizedEmail,
      token,
      type: "verify",
      expiresAt: expires,
    });

    /* ─────────────────────────────────────────
       Verification URL
    ───────────────────────────────────────── */

    const baseUrl =
      process.env.APP_ORIGIN ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const verifyUrl =
      `${baseUrl}/verify-email?token=${encodeURIComponent(
        token
      )}`;

    /* ─────────────────────────────────────────
       Verification Email
    ───────────────────────────────────────── */

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verifyUrl
      );
    } catch (emailError) {
      console.error(
        "Verification email failed:",
        emailError
      );

      /*
       We keep the account.

       The user can use the resend-verification
       feature rather than losing their account.
      */
    }

    /* ─────────────────────────────────────────
       Notify CBC Admin
    ───────────────────────────────────────── */

    try {
      await sendAdminNotification(user);
    } catch (adminError) {
      console.error(
        "Admin signup notification failed:",
        adminError
      );
    }

    /* ─────────────────────────────────────────
       Success
    ───────────────────────────────────────── */

    return res.status(201).json({
      success: true,

      message:
        "Account created. Please check your email to verify your account.",

      suiteId: user.suiteId,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    /*
      Mongo duplicate key error.
      Helpful if two requests arrive simultaneously.
    */
    if (error?.code === 11000) {
      return res.status(409).json({
        error: "Email already registered.",
      });
    }

    return res.status(500).json({
      error:
        "Something went wrong while creating your account.",
    });
  }
}

/* ═══════════════════════════════════════════
   VERIFICATION EMAIL
═══════════════════════════════════════════ */

async function sendVerificationEmail(
  to: string,
  verifyUrl: string
) {
  const transporter =
    nodemailer.createTransport({
      host: process.env.SMTP_HOST,

      port: Number(
        process.env.SMTP_PORT || 587
      ),

      secure:
        Number(
          process.env.SMTP_PORT || 587
        ) === 465,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

  await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      `"Cross Border Cart" <no-reply@crossbordercart.com>`,

    to,

    subject:
      "Verify your Cross Border Cart email",

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          max-width:600px;
          margin:0 auto;
          padding:32px;
          background:#ffffff;
          color:#111827;
        "
      >

        <h2
          style="
            margin-bottom:12px;
            color:#111827;
          "
        >
          Welcome to Cross Border Cart 👋
        </h2>

        <p
          style="
            line-height:1.6;
            color:#475569;
          "
        >
          You're almost ready.
          Confirm your email address to activate
          your Cross Border Cart account.
        </p>

        <div
          style="
            margin:28px 0;
          "
        >

          <a
            href="${verifyUrl}"
            style="
              display:inline-block;
              background:#00E5A0;
              color:#002B1A;
              text-decoration:none;
              padding:14px 24px;
              border-radius:10px;
              font-weight:700;
            "
          >
            Verify my email
          </a>

        </div>

        <p
          style="
            font-size:13px;
            color:#64748b;
            line-height:1.6;
          "
        >
          This verification link expires in
          24 hours.
        </p>

        <p
          style="
            font-size:12px;
            color:#94a3b8;
            margin-top:28px;
          "
        >
          If you didn't create a Cross Border
          Cart account, you can safely ignore
          this email.
        </p>

      </div>
    `,
  });
}

/* ═══════════════════════════════════════════
   ADMIN NOTIFICATION
═══════════════════════════════════════════ */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function sendAdminNotification(
  user: any
) {
  if (!resend) return;

  await resend.emails.send({
    from:
      "Cross Border Cart <no-reply@crossbordercart.com>",

    to: "support@crossbordercart.com",

    subject: `New signup: ${user.name}`,

    text: `
New user signed up.

Name: ${user.name}
Email: ${user.email}
Country: ${user.country}
Suite ID: ${user.suiteId}
    `.trim(),
  });
}