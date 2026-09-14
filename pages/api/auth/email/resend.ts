// pages/api/auth/email/resend.ts

import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import dbConnect from "@/lib/dbConnect";

import UserModel from "@/lib/models/User";

import EmailToken from "@/lib/models/EmailToken";

import crypto from "crypto";

import { Resend } from "resend";

import type { IEmailToken } from "@/lib/models/EmailToken";

const VERIFY_TTL_MS =
  24 *
  60 *
  60 *
  1000;

const RESEND_COOLDOWN_MS =
  60 * 1000;

const resend =
  process.env.RESEND_API_KEY
    ? new Resend(
        process.env
          .RESEND_API_KEY
      )
    : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    req.method !==
    "POST"
  ) {
    res.setHeader(
      "Allow",
      "POST"
    );

    return res
      .status(405)
      .json({
        error:
          "Method Not Allowed",
      });
  }

  try {
    await dbConnect();

    const email =
      typeof req.body
        ?.email ===
      "string"
        ? req.body.email
            .trim()
            .toLowerCase()
        : "";

    if (!email) {
      return res
        .status(400)
        .json({
          error:
            "Email is required.",
        });
    }

    /*
      Find account.

      We still return a generic
      response when it doesn't
      exist so we don't reveal
      registered accounts.
    */

    const user =
      await UserModel.findOne({
        email,
      });

    if (!user) {
      return res
        .status(200)
        .json({
          ok: true,
          message:
            "If this account exists, a verification email has been sent.",
        });
    }

    /*
      Already verified?
    */

    if (
      user.emailVerified ===
      true
    ) {
      return res
        .status(200)
        .json({
          ok: true,
          alreadyVerified:
            true,
          message:
            "This email is already verified. You can sign in.",
        });
    }

    /*
      Find latest verification
      token for cooldown.
    */

   const latestToken =
  await EmailToken.findOne(
    {
      userId: user._id,
      type: "verify",
    }
  )
    .sort({
      createdAt: -1,
    })
    .lean<IEmailToken | null>();

    if (
      latestToken &&
      latestToken.createdAt
    ) {
      const age =
        Date.now() -
        new Date(
          latestToken.createdAt
        ).getTime();

      if (
        age <
        RESEND_COOLDOWN_MS
      ) {
        const seconds =
          Math.ceil(
            (RESEND_COOLDOWN_MS -
              age) /
              1000
          );

        return res
          .status(429)
          .json({
            error: `Please wait ${seconds} seconds before requesting another verification email.`,
          });
      }
    }

    /*
      Remove old verification
      tokens.
    */

    await EmailToken.deleteMany(
      {
        userId:
          user._id,

        type:
          "verify",
      }
    );

    /*
      Create new token.
    */

    const token =
      crypto
        .randomBytes(
          32
        )
        .toString(
          "hex"
        );

    const expiresAt =
      new Date(
        Date.now() +
          VERIFY_TTL_MS
      );

    await EmailToken.create(
      {
        userId:
          user._id,

        email:
          user.email,

        token,

        type:
          "verify",

        expiresAt,
      }
    );

    /*
      Build verification URL.
    */

    const baseUrl =
      process.env
        .APP_ORIGIN ||
      process.env
        .NEXT_PUBLIC_APP_URL ||
      process.env
        .NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";

    const verifyUrl =
      `${baseUrl}/verify-email?token=${encodeURIComponent(
        token
      )}`;

    /*
      Send using RESEND.
    */

    await sendVerificationEmail(
      user.email,
      verifyUrl
    );

    /*
      Useful in local dev only.
    */

    if (
      /^true$/i.test(
        process.env
          .DEV_RETURN_VERIFY_LINK ||
          ""
      )
    ) {
      return res
        .status(200)
        .json({
          ok: true,
          verifyUrl,
        });
    }

    return res
      .status(200)
      .json({
        ok: true,

        message:
          "Verification email sent.",
      });
  } catch (
    error
  ) {
    console.error(
      "Resend verification error:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Unable to send verification email right now.",
      });
  }
}

async function sendVerificationEmail(
  to: string,
  verifyUrl: string
) {
  if (!resend) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const result =
    await resend.emails.send(
      {
        from:
          process.env
            .EMAIL_FROM ||
          "Cross Border Cart <no-reply@crossbordercart.com>",

        to,

        subject:
          "Verify your Cross Border Cart email",

        html: `
          <div
            style="
              max-width:600px;
              margin:0 auto;
              padding:36px;
              font-family:Arial,sans-serif;
              color:#1C2436;
              background:#ffffff;
            "
          >

            <div
              style="
                font-size:13px;
                font-weight:800;
                color:#A8841A;
                margin-bottom:12px;
              "
            >
              CROSS BORDER CART
            </div>

            <h1
              style="
                margin:0 0 16px;
                color:#0F2340;
                font-size:28px;
              "
            >
              Verify your email
            </h1>

            <p
              style="
                color:#68707F;
                line-height:1.7;
                font-size:15px;
              "
            >
              Welcome to Cross Border Cart.
              Please verify your email address
              before signing in.
            </p>

            <a
              href="${verifyUrl}"
              style="
                display:inline-block;
                margin:18px 0 24px;
                padding:14px 24px;
                background:#C9A227;
                color:#ffffff;
                text-decoration:none;
                border-radius:10px;
                font-weight:800;
              "
            >
              Verify my email
            </a>

            <p
              style="
                color:#68707F;
                font-size:13px;
                line-height:1.6;
              "
            >
              This link expires in 24 hours.
            </p>

            <p
              style="
                color:#94A3B8;
                font-size:12px;
                line-height:1.6;
              "
            >
              If the button does not work,
              copy and paste this link:
            </p>

            <p
              style="
                word-break:break-all;
                font-size:11px;
              "
            >
              <a
                href="${verifyUrl}"
                style="color:#A8841A;"
              >
                ${verifyUrl}
              </a>
            </p>

            <p
              style="
                margin-top:30px;
                color:#94A3B8;
                font-size:11px;
              "
            >
              If you did not create this account,
              you can ignore this message.
            </p>

          </div>
        `,
      }
    );

  if (
    result.error
  ) {
    throw new Error(
      result.error.message
    );
  }

  return result.data;
}