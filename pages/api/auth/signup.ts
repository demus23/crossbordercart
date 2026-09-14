// pages/api/auth/signup.ts

import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import dbConnect from "@/lib/dbConnect";

import UserModel from "@/lib/models/User";

import EmailToken from "@/lib/models/EmailToken";

import bcrypt from "bcryptjs";

import crypto from "crypto";

import {
  Resend,
} from "resend";

import disposableDomains from "disposable-email-domains";

const disposableSet =
  new Set(
    disposableDomains.map(
      (
        domain: string
      ) =>
        domain.toLowerCase()
    )
  );

const resend =
  process.env.RESEND_API_KEY
    ? new Resend(
        process.env
          .RESEND_API_KEY
      )
    : null;

const DOMAIN_TYPOS: Record<
  string,
  string
> = {
  "gmial.com":
    "gmail.com",

  "gamil.com":
    "gmail.com",

  "gmail.con":
    "gmail.com",

  "gmail.co":
    "gmail.com",

  "hotmial.com":
    "hotmail.com",

  "hotmail.con":
    "hotmail.com",

  "outlok.com":
    "outlook.com",

  "outllook.com":
    "outlook.com",

  "yaho.com":
    "yahoo.com",

  "yahoo.con":
    "yahoo.com",

  "iclud.com":
    "icloud.com",

  "icloud.con":
    "icloud.com",
};

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
          "Method not allowed",
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

      addressLabel =
        "Home",

      address1,
      address2,
      city,
      state,
      postalCode,
    } = (
      req.body || {}
    ) as Record<
      string,
      string
    >;

    /*
      Required fields
    */

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !country
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields.",
        });
    }

    /*
      Normalize
    */

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const cleanCountry =
      country.trim();

    /*
      Email format
    */

    const EMAIL_RULE =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (
      !EMAIL_RULE.test(
        normalizedEmail
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Please enter a valid email address.",
        });
    }

    const domain =
      normalizedEmail.split(
        "@"
      )[1];

    /*
      Typo check
    */

    const suggestedDomain =
      DOMAIN_TYPOS[
        domain
      ];

    if (
      suggestedDomain
    ) {
      const username =
        normalizedEmail.split(
          "@"
        )[0];

      return res
        .status(400)
        .json({
          error:
            `Did you mean ${username}@${suggestedDomain}?`,
        });
    }

    /*
      Disposable email
    */

    if (
      disposableSet.has(
        domain
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Temporary email addresses are not allowed. Please use a permanent email address.",
        });
    }

    /*
      Password confirmation
    */

    if (
      password !==
      confirmPassword
    ) {
      return res
        .status(400)
        .json({
          error:
            "Passwords do not match.",
        });
    }

    /*
      Password rule
    */

    const PASS =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (
      !PASS.test(
        password
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Password must be at least 8 characters and include uppercase, lowercase and a number.",
        });
    }

    /*
      Existing account
    */

    const existing =
      await UserModel.findOne(
        {
          email:
            normalizedEmail,
        }
      );

    if (
      existing
    ) {
      return res
        .status(409)
        .json({
          error:
            "Email already registered.",
        });
    }

    /*
      Generate unique suite ID
    */

    let suiteId =
      "";

    let suiteExists =
      true;

    while (
      suiteExists
    ) {
      suiteId =
        "UAE-" +
        Math.floor(
          10000 +
            Math.random() *
              90000
        );

      suiteExists =
        !!(
          await UserModel.findOne(
            {
              suiteId,
            }
          )
        );
    }

    /*
      Password hash
    */

    const hashed =
      await bcrypt.hash(
        password,
        10
      );

    /*
      Optional address.

      IMPORTANT:
      only create it when
      address1 exists.

      Country alone must NOT
      create an empty address.
    */

    const addresses: any[] =
      [];

    if (
      address1?.trim()
    ) {
      addresses.push(
        {
          label:
            addressLabel?.trim() ||
            "Home",

          address:
            address1.trim(),

          address2:
            address2?.trim() ||
            "",

          city:
            city?.trim() ||
            "",

          state:
            state?.trim() ||
            "",

          postalCode:
            postalCode?.trim() ||
            "",

          country:
            cleanCountry,
        }
      );
    }

    /*
      Create user
    */

    const user =
      await UserModel.create(
        {
          email:
            normalizedEmail,

          name:
            `${firstName.trim()} ${lastName.trim()}`,

          password:
            hashed,

          suiteId,

          country:
            cleanCountry,

          phone:
            phone?.trim() ||
            undefined,

          role:
            "user",

          status:
            "Active",

          emailVerified:
            false,

          emailVerifiedAt:
            null,

          ...(addresses.length
            ? {
                addresses,
              }
            : {}),
        }
      );

    /*
      Generate verification token
    */

    await EmailToken.deleteMany(
      {
        userId:
          user._id,

        type:
          "verify",
      }
    );

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
          24 *
            60 *
            60 *
            1000
      );

    await EmailToken.create(
      {
        userId:
          user._id,

        email:
          normalizedEmail,

        token,

        type:
          "verify",

        expiresAt,
      }
    );

    /*
      URL
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
      Verification email
    */

    try {
      await sendVerificationEmail(
        normalizedEmail,
        verifyUrl
      );
    } catch (
      emailError
    ) {
      console.error(
        "Verification email failed:",
        emailError
      );
    }

    /*
      Admin notification
    */

    try {
      await sendAdminNotification(
        user
      );
    } catch (
      adminError
    ) {
      console.error(
        "Admin signup notification failed:",
        adminError
      );
    }

    return res
      .status(201)
      .json({
        success:
          true,

        message:
          "Account created. Please check your email to verify your account.",

        suiteId:
          user.suiteId,
      });
  } catch (
    error: any
  ) {
    console.error(
      "Signup error:",
      error
    );

    if (
      error?.code ===
      11000
    ) {
      return res
        .status(409)
        .json({
          error:
            "Email already registered.",
        });
    }

    return res
      .status(500)
      .json({
        error:
          "Something went wrong while creating your account.",
      });
  }
}

/* ==========================================
   CUSTOMER VERIFICATION EMAIL
========================================== */

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
                margin-bottom:12px;
                color:#A8841A;
                font-size:12px;
                font-weight:800;
                letter-spacing:1px;
              "
            >
              CROSS BORDER CART
            </div>

            <h1
              style="
                color:#0F2340;
                font-size:28px;
                margin:0 0 15px;
              "
            >
              Welcome to Cross Border Cart
            </h1>

            <p
              style="
                color:#68707F;
                line-height:1.7;
                font-size:15px;
              "
            >
              You're almost ready.
              Verify your email address
              to activate your CBC account.
            </p>

            <a
              href="${verifyUrl}"
              style="
                display:inline-block;
                margin:18px 0 22px;
                padding:14px 25px;
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
              This verification link expires in 24 hours.
            </p>

            <p
              style="
                margin-top:25px;
                color:#94A3B8;
                font-size:11px;
                line-height:1.6;
              "
            >
              If you didn't create a Cross Border Cart account,
              you can safely ignore this email.
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

/* ==========================================
   CBC ADMIN NOTIFICATION
========================================== */

async function sendAdminNotification(
  user: any
) {
  if (!resend) {
    return;
  }

  const result =
    await resend.emails.send(
      {
        from:
          process.env
            .EMAIL_FROM ||
          "Cross Border Cart <no-reply@crossbordercart.com>",

        to:
          "support@crossbordercart.com",

        subject:
          `New signup: ${user.name}`,

        text: `
New user signed up.

Name: ${user.name}
Email: ${user.email}
Country: ${user.country || "Not provided"}
Suite ID: ${user.suiteId}
        `.trim(),
      }
    );

  if (
    result.error
  ) {
    throw new Error(
      result.error.message
    );
  }
}