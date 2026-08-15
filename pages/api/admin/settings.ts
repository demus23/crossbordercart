import type { NextApiRequest, NextApiResponse } from "next";

type Settings = {
  general: {
    companyName: string;
    domain: string;
    timezone: string;
  };
  branding: {
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  email: {
    supportEmail: string;
    smtpHost: string;
    smtpUser: string;
    smtpPass: string;
  };
  security: {
    twoFactor: boolean;
    passwordPolicy: string;
  };
  billing: {
    currency: string;
    vat: number;
  };
  shipping: {
    provider: string;
    freeShipping: number;
  };
  api: {
    apiKey: string;
    webhookUrl: string;
  };
  backup: {
    last: string;
    status: string;
  };
};

let settings: Settings = {
  general: {
    companyName: "Cross Border Cart",
    domain: "crossbordercart.com",
    timezone: "Asia/Dubai",
  },
  branding: {
    logo: "/cross-border-logo.png",
    primaryColor: "#0ea5e9",
    secondaryColor: "#16a34a",
  },
  email: {
    supportEmail: "support@crossbordercart.com",
    smtpHost: "",
    smtpUser: "",
    smtpPass: "",
  },
  security: {
    twoFactor: false,
    passwordPolicy: "medium",
  },
  billing: {
    currency: "AED",
    vat: 5,
  },
  shipping: {
    provider: "aramex",
    freeShipping: 0,
  },
  api: {
    apiKey: "",
    webhookUrl: "",
  },
  backup: {
    last: "",
    status: "idle",
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(settings);
  }

  if (req.method === "POST") {
    try {
      const body = req.body || {};

      settings = {
        ...settings,
        general: body.general ? { ...settings.general, ...body.general } : settings.general,
        branding: body.branding ? { ...settings.branding, ...body.branding } : settings.branding,
        email: body.email ? { ...settings.email, ...body.email } : settings.email,
        security: body.security ? { ...settings.security, ...body.security } : settings.security,
        billing: body.billing ? { ...settings.billing, ...body.billing } : settings.billing,
        shipping: body.shipping ? { ...settings.shipping, ...body.shipping } : settings.shipping,
        api: body.api ? { ...settings.api, ...body.api } : settings.api,
        backup: body.backup ? { ...settings.backup, ...body.backup } : settings.backup,
      };

      return res.status(200).json({ ok: true, settings });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "Failed to save settings" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}