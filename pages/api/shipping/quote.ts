// pages/api/shipping/quote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { errorMessage } from "@/utils/errors";

/* =========================
   Types & helpers
   ========================= */
type Speed = "standard" | "express";
type CarrierKey = "DHL" | "Aramex" | "UPS";

type ReqBody = {
  from?: string | { country?: string };
  to?: string | { country?: string; postcode?: string };
  weightKg?: unknown;
  dims?: { L?: unknown; W?: unknown; H?: unknown };
  speed?: Speed;
  carriers?: Partial<Record<CarrierKey, boolean>>;
  currency?: string;
  insurance?: { add?: boolean; declared?: unknown };
  remoteArea?: boolean;
};

type Quote = {
  carrier: CarrierKey;
  speed: Speed;
  chargeableKg: number;
  priceAED: number;
  etaDays?: number;
  breakdown: {
    baseAED: number;
    fuelAED: number;
    remoteAED: number;
    insuranceAED: number;
    markupAED: number;
  };
  notes?: string[];
};

type CarrierSetting = {
  enabled: boolean;
  divisor: number;
  baseKg: { standard: number; express: number };
  min: { standard: number; express: number };
  fuelPct: number;
  markupPct: number;
  etaDays: { standard: number; express: number };
};

const asStr = (x: unknown) => (typeof x === "string" ? x.trim() : "");
const asNum = (x: unknown) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : NaN;
};
const posNumOr = (x: unknown, dflt: number) => {
  const n = asNum(x);
  return n > 0 ? n : dflt;
};

function round2(n: number) {
  return Number(n.toFixed(2));
}

function getCountryValue(input: ReqBody["from"] | ReqBody["to"]) {
  if (typeof input === "string") return input.trim();
  if (input && typeof input === "object" && "country" in input) {
    return asStr(input.country);
  }
  return "";
}

function normalizeCountryName(s: string) {
  const v = s.trim().toLowerCase();

  const map: Record<string, string> = {
    ae: "United Arab Emirates",
    uae: "United Arab Emirates",
    "united arab emirates": "United Arab Emirates",
    gb: "United Kingdom",
    uk: "United Kingdom",
    "united kingdom": "United Kingdom",
    us: "United States",
    usa: "United States",
    "united states": "United States",
    ca: "Canada",
    canada: "Canada",
    saudi: "Saudi Arabia",
    "saudi arabia": "Saudi Arabia",
    qatar: "Qatar",
    kuwait: "Kuwait",
    oman: "Oman",
    bahrain: "Bahrain",
    ethiopia: "Ethiopia",
    eritrea: "Eritrea",
    kenya: "Kenya",
    tanzania: "Tanzania",
    uganda: "Uganda",
    rwanda: "Rwanda",
    burundi: "Burundi",
    zambia: "Zambia",
    angola: "Angola",
    ghana: "Ghana",
    nigeria: "Nigeria",
  };

  return map[v] || s.trim();
}

const AFRICA_DESTS = new Set([
  "Ethiopia",
  "Eritrea",
  "Kenya",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Burundi",
  "Zambia",
  "Angola",
  "Ghana",
  "Nigeria",
]);

const GULF = new Set([
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
]);

/* =========================
   Base carrier defaults
   ========================= */
const DEFAULTS: Record<CarrierKey, CarrierSetting> = {
  DHL: {
    enabled: true,
    divisor: 5000,
    baseKg: { standard: 24, express: 34 },
    min: { standard: 75, express: 110 },
    fuelPct: 13,
    markupPct: 12,
    etaDays: { standard: 4, express: 2 },
  },
  Aramex: {
    enabled: true,
    divisor: 5000,
    baseKg: { standard: 20, express: 29 },
    min: { standard: 60, express: 90 },
    fuelPct: 11,
    markupPct: 10,
    etaDays: { standard: 5, express: 3 },
  },
  UPS: {
    enabled: true,
    divisor: 5000,
    baseKg: { standard: 23, express: 33 },
    min: { standard: 72, express: 105 },
    fuelPct: 12,
    markupPct: 11,
    etaDays: { standard: 4, express: 2 },
  },
};

const REMOTE_AREA_FLAT_AED = 35;
const INSURANCE_RATE = 0.005;
const INSURANCE_MIN_AED = 10;

/* ================================================================
   Optional DB overrides
   ================================================================ */
async function applyDbOverrides(
  current: Record<CarrierKey, CarrierSetting>
): Promise<Record<CarrierKey, CarrierSetting>> {
  try {
    try {
      const mongooseLib: any = await import("@/lib/mongoose")
        .then((m) => m as any)
        .catch(() => null);

      const connectFn =
        (mongooseLib &&
          (mongooseLib.default ||
            mongooseLib.connect ||
            mongooseLib.dbConnect ||
            mongooseLib.mongooseConnect)) ||
        null;

      if (typeof connectFn === "function") {
        await connectFn();
      }
    } catch {}

    let CarrierRateModel: any = null;
    try {
      CarrierRateModel = (await import("@/lib/models/CarrierRate")).default;
    } catch {
      return current;
    }

    if (!CarrierRateModel?.find) return current;

    const docs = await CarrierRateModel.find({}).lean?.();
    if (!Array.isArray(docs) || docs.length === 0) return current;

    const next = { ...current };

    for (const d of docs) {
      const nm = String(d?.carrier ?? d?.name ?? "").toUpperCase();
      const key: CarrierKey | null =
        nm === "DHL" ? "DHL" : nm === "ARAMEX" ? "Aramex" : nm === "UPS" ? "UPS" : null;

      if (!key) continue;

      const cur = next[key];
      next[key] = {
        enabled: Boolean(d?.enabled ?? cur.enabled),
        divisor: posNumOr(d?.divisor ?? d?.volumetricDivisor, cur.divisor),
        baseKg: {
          standard: posNumOr(d?.baseStd ?? d?.baseStandard, cur.baseKg.standard),
          express: posNumOr(d?.baseExp ?? d?.baseExpress, cur.baseKg.express),
        },
        min: {
          standard: posNumOr(d?.minStd ?? d?.minStandard, cur.min.standard),
          express: posNumOr(d?.minExp ?? d?.minExpress, cur.min.express),
        },
        fuelPct: posNumOr(d?.fuelPct, cur.fuelPct),
        markupPct: posNumOr(d?.markupPct, cur.markupPct),
        etaDays: {
          standard: posNumOr(d?.etaStd ?? d?.etaStandard, cur.etaDays.standard),
          express: posNumOr(d?.etaExp ?? d?.etaExpress, cur.etaDays.express),
        },
      };
    }

    return next;
  } catch {
    return current;
  }
}

/* =========================
   Pricing helpers
   ========================= */
function getRouteMultiplier(fromCountry: string, toCountry: string) {
  const fromGulf = GULF.has(fromCountry);
  const toAfrica = AFRICA_DESTS.has(toCountry);

  if (fromGulf && toAfrica) return 0.95;
  if (fromCountry === "United Arab Emirates" && toCountry === "United Kingdom") return 1.08;
  if (fromCountry === "United Arab Emirates" && toCountry === "United States") return 1.15;
  if (fromCountry === "United Arab Emirates" && toCountry === "Canada") return 1.12;

  return 1;
}

function calcChargeableKg(
  actualKg: number,
  dims: { L?: number; W?: number; H?: number } | undefined,
  divisor: number
) {
  if (
    dims &&
    Number.isFinite(dims.L) &&
    Number.isFinite(dims.W) &&
    Number.isFinite(dims.H) &&
    (dims.L as number) > 0 &&
    (dims.W as number) > 0 &&
    (dims.H as number) > 0
  ) {
    const vol = ((dims.L as number) * (dims.W as number) * (dims.H as number)) / divisor;
    return Math.max(actualKg, vol);
  }

  return actualKg;
}

function buildQuoteForCarrier(
  carrier: CarrierKey,
  s: CarrierSetting,
  speed: Speed,
  weightKg: number,
  dimsCm: { L?: number; W?: number; H?: number } | undefined,
  opts: {
    insuranceAED: number;
    remoteAED: number;
    routeMultiplier: number;
  }
): Quote {
  const chargeable = calcChargeableKg(weightKg, dimsCm, s.divisor);

  const basePerKg = s.baseKg[speed] * opts.routeMultiplier;
  const min = s.min[speed] * opts.routeMultiplier;

  const base = Math.max(min, basePerKg * chargeable);
  const fuel = (s.fuelPct / 100) * base;
  const preMarkup = base + fuel + opts.remoteAED + opts.insuranceAED;
  const markup = (s.markupPct / 100) * preMarkup;
  const total = preMarkup + markup;

  return {
    carrier,
    speed,
    chargeableKg: round2(chargeable),
    priceAED: round2(total),
    etaDays: s.etaDays[speed],
    breakdown: {
      baseAED: round2(base),
      fuelAED: round2(fuel),
      remoteAED: round2(opts.remoteAED),
      insuranceAED: round2(opts.insuranceAED),
      markupAED: round2(markup),
    },
    notes: [
      "Non-binding estimate",
      dimsCm ? "Volumetric check applied if dimensions provided" : "Actual weight used",
    ],
  };
}

/* =========================
   API handler
   ========================= */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = (req.body ?? {}) as ReqBody;

    const fromCountry =
      normalizeCountryName(getCountryValue(body.from) || "United Arab Emirates");
    const toCountry =
      normalizeCountryName(getCountryValue(body.to) || "United Kingdom");

    const speed: Speed = asStr(body?.speed) === "express" ? "express" : "standard";
    const weightKg = posNumOr(body?.weightKg, 1);

    const dimsIn = body?.dims || {};
    const L = asNum(dimsIn?.L);
    const W = asNum(dimsIn?.W);
    const H = asNum(dimsIn?.H);

    const dimsCm =
      Number.isFinite(L) && Number.isFinite(W) && Number.isFinite(H) && L > 0 && W > 0 && H > 0
        ? { L, W, H }
        : undefined;

    const carriersInput = body?.carriers || { DHL: true, Aramex: true, UPS: true };

    const requested: CarrierKey[] = (["DHL", "Aramex", "UPS"] as CarrierKey[]).filter(
      (c) => Boolean((carriersInput as Record<string, boolean>)[c])
    );

    if (requested.length === 0) {
      return fail(res, 400, "No carrier selected");
    }

    if (fromCountry.toLowerCase() === toCountry.toLowerCase()) {
      return ok(res, {
        currency: "AED",
        from: fromCountry,
        to: toCountry,
        quotes: [] as Quote[],
      });
    }

    const insuranceAED =
      body?.insurance?.add && posNumOr(body?.insurance?.declared, 0) > 0
        ? Math.max(INSURANCE_MIN_AED, INSURANCE_RATE * posNumOr(body?.insurance?.declared, 0))
        : 0;

    const remoteAED = body?.remoteArea ? REMOTE_AREA_FLAT_AED : 0;
    const routeMultiplier = getRouteMultiplier(fromCountry, toCountry);

    const effective = await applyDbOverrides(DEFAULTS);

    const quotes: Quote[] = [];

    for (const c of requested) {
      const cfg = effective[c];
      if (!cfg?.enabled) continue;

      quotes.push(
        buildQuoteForCarrier(c, cfg, speed, weightKg, dimsCm, {
          insuranceAED,
          remoteAED,
          routeMultiplier,
        })
      );
    }

    quotes.sort((a, b) => a.priceAED - b.priceAED);

    return ok(res, {
      currency: "AED",
      from: fromCountry,
      to: toCountry,
      quotes,
    });
  } catch (e: unknown) {
    return res.status(500).json({
      ok: false,
      error: errorMessage(e) || "Internal Server Error",
    });
  }
}

function ok(res: NextApiResponse, body: any) {
  return res.status(200).json({ ok: true, ...body });
}

function fail(res: NextApiResponse, code: number, msg: string, details?: any) {
  return res.status(code).json({
    ok: false,
    error: msg,
    ...(details ? { details } : {}),
  });
}