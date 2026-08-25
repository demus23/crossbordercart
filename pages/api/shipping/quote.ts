// pages/api/shipping/quote.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { errorMessage } from "@/utils/errors";

/* =========================================================
   Types
   ========================================================= */

type Speed = "standard" | "express";

type CarrierKey = "DHL" | "Aramex" | "UPS";

type RateSource = "contract" | "estimate";

type ReqBody = {
  from?: string | { country?: string };
  to?: string | { country?: string; postcode?: string };

  weightKg?: unknown;

  dims?: {
    L?: unknown;
    W?: unknown;
    H?: unknown;
  };

  speed?: Speed;

  carriers?: Partial<Record<CarrierKey, boolean>>;

  currency?: string;

  insurance?: {
    add?: boolean;
    declared?: unknown;
  };

  remoteArea?: boolean;
};

type Quote = {
  carrier: CarrierKey;

  speed: Speed;

  chargeableKg: number;

  priceAED: number;

  etaDays?: number;

  rateSource: RateSource;

  breakdown: {
    baseAED: number;

    fuelAED: number;

    emergencyAED: number;

    remoteAED: number;

    insuranceAED: number;

    markupAED: number;
  };

  notes?: string[];
};

type CarrierSetting = {
  enabled: boolean;

  divisor: number;

  baseKg: {
    standard: number;
    express: number;
  };

  min: {
    standard: number;
    express: number;
  };

  fuelPct: number;

  markupPct: number;

  etaDays: {
    standard: number;
    express: number;
  };
};

/* =========================================================
   Basic helpers
   ========================================================= */

const asStr = (x: unknown) =>
  typeof x === "string" ? x.trim() : "";

const asNum = (x: unknown) => {
  const n = Number(x);

  return Number.isFinite(n)
    ? n
    : NaN;
};

const posNumOr = (
  x: unknown,
  dflt: number
) => {
  const n = asNum(x);

  return n > 0
    ? n
    : dflt;
};

function round2(n: number) {
  return Number(n.toFixed(2));
}

function getCountryValue(
  input: ReqBody["from"] | ReqBody["to"]
) {
  if (typeof input === "string") {
    return input.trim();
  }

  if (
    input &&
    typeof input === "object" &&
    "country" in input
  ) {
    return asStr(input.country);
  }

  return "";
}

/* =========================================================
   Country normalization
   ========================================================= */

function normalizeCountryName(s: string) {
  const v = s.trim().toLowerCase();

  const map: Record<string, string> = {
    ae: "United Arab Emirates",
    uae: "United Arab Emirates",
    "united arab emirates":
      "United Arab Emirates",

    gb: "United Kingdom",
    uk: "United Kingdom",
    "united kingdom":
      "United Kingdom",

    us: "United States",
    usa: "United States",
    "united states":
      "United States",

    ca: "Canada",
    canada: "Canada",

    saudi: "Saudi Arabia",
    ksa: "Saudi Arabia",
    "saudi arabia":
      "Saudi Arabia",

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

    egypt: "Egypt",

    "south africa":
      "South Africa",

    germany: "Germany",

    france: "France",

    india: "India",

    pakistan: "Pakistan",

    bangladesh: "Bangladesh",
  };

  return map[v] || s.trim();
}

/* =========================================================
   Generic route groups used by DHL / UPS fallback model
   ========================================================= */

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
  "Egypt",
  "South Africa",
]);

const GULF = new Set([
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
]);

/* =========================================================
   Carrier defaults
   =========================================================
   DHL and UPS are still estimated using the old model.

   Aramex:
   - fuelPct is intentionally configurable because the
     contract states fuel surcharge is variable.
   - markupPct is CBC's selling margin.
   - actual base rate now comes from the contract table.
   ========================================================= */

const DEFAULTS: Record<
  CarrierKey,
  CarrierSetting
> = {
  DHL: {
    enabled: true,

    divisor: 5000,

    baseKg: {
      standard: 24,
      express: 34,
    },

    min: {
      standard: 75,
      express: 110,
    },

    fuelPct: 13,

    markupPct: 12,

    etaDays: {
      standard: 4,
      express: 2,
    },
  },

  Aramex: {
    enabled: true,

    divisor: 5000,

    // No longer used for UAE outbound
    // destinations covered by the
    // contract zone table.
    baseKg: {
      standard: 20,
      express: 29,
    },

    min: {
      standard: 60,
      express: 90,
    },

    // IMPORTANT:
    // Contract says fuel is variable.
    // Update through CarrierRate DB.
    fuelPct: 11,

    // CBC margin
    markupPct: 10,

    etaDays: {
      standard: 5,
      express: 3,
    },
  },

  UPS: {
    enabled: true,

    divisor: 5000,

    baseKg: {
      standard: 23,
      express: 33,
    },

    min: {
      standard: 72,
      express: 105,
    },

    fuelPct: 12,

    markupPct: 11,

    etaDays: {
      standard: 4,
      express: 2,
    },
  },
};

const REMOTE_AREA_FLAT_AED = 35;

const INSURANCE_RATE = 0.005;

const INSURANCE_MIN_AED = 10;

/* =========================================================
   ARAMEX OUTBOUND CONTRACT
   =========================================================
   Source:
   Dliet General Trading FZC
   Aramex Emirates LLC
   Rate Sheet dated 30.03.2026

   Priority Parcel / Export Express
   ========================================================= */

/*
   Only countries currently relevant to CBC plus a few
   additional destinations already present in the app.

   Add more countries from the Aramex rate sheet when needed.
*/

const ARAMEX_OUTBOUND_ZONE:
  Record<string, number> = {
    /* Africa */

    Ethiopia: 5,

    Eritrea: 6,

    Kenya: 5,

    Tanzania: 5,

    Uganda: 5,

    Rwanda: 5,

    Burundi: 7,

    Zambia: 5,

    Angola: 7,

    Ghana: 5,

    Nigeria: 4,

    Egypt: 4,

    "South Africa": 6,

    /* GCC */

    "Saudi Arabia": 1,

    Bahrain: 1,

    Qatar: 1,

    Oman: 1,

    Kuwait: 2,

    /* Europe */

    "United Kingdom": 3,

    Germany: 3,

    France: 3,

    /* North America */

    "United States": 4,

    Canada: 6,

    /* South Asia */

    India: 2,

    Pakistan: 1,

    Bangladesh: 1,
  };

/*
   Priority Parcel rates in AED.

   Each row:
   weightKg -> [
     zone1,
     zone2,
     zone3,
     zone4,
     zone5,
     zone6,
     zone7,
     zone8
   ]
*/

const ARAMEX_PARCEL_RATES:
  Record<number, number[]> = {
    0.5: [
      42,
      49,
      65,
      70,
      77,
      85,
      115,
      196,
    ],

    1: [
      56,
      64,
      83,
      90,
      98,
      109,
      148,
      243,
    ],

    1.5: [
      70,
      79,
      101,
      110,
      119,
      133,
      181,
      290,
    ],

    2: [
      84,
      94,
      119,
      130,
      140,
      157,
      214,
      337,
    ],

    2.5: [
      98,
      109,
      137,
      150,
      161,
      181,
      247,
      384,
    ],

    3: [
      112,
      124,
      155,
      170,
      182,
      205,
      280,
      431,
    ],

    3.5: [
      126,
      139,
      173,
      190,
      203,
      229,
      313,
      478,
    ],

    4: [
      140,
      154,
      191,
      210,
      224,
      253,
      346,
      525,
    ],

    4.5: [
      154,
      169,
      209,
      230,
      245,
      277,
      379,
      572,
    ],

    5: [
      168,
      184,
      227,
      250,
      266,
      301,
      412,
      619,
    ],

    5.5: [
      182,
      199,
      245,
      270,
      287,
      325,
      445,
      666,
    ],

    6: [
      196,
      214,
      263,
      290,
      308,
      349,
      478,
      713,
    ],

    6.5: [
      210,
      229,
      281,
      310,
      329,
      373,
      511,
      760,
    ],

    7: [
      224,
      244,
      299,
      330,
      350,
      397,
      544,
      807,
    ],

    7.5: [
      238,
      259,
      317,
      350,
      371,
      421,
      577,
      854,
    ],

    8: [
      252,
      274,
      335,
      370,
      392,
      445,
      610,
      901,
    ],

    8.5: [
      266,
      289,
      353,
      390,
      413,
      469,
      643,
      948,
    ],

    9: [
      280,
      304,
      371,
      410,
      434,
      493,
      676,
      995,
    ],

    9.5: [
      294,
      319,
      389,
      430,
      455,
      517,
      709,
      1042,
    ],

    10: [
      308,
      334,
      407,
      450,
      476,
      541,
      742,
      1089,
    ],

    11: [
      329,
      357,
      434,
      480,
      509,
      587,
      794,
      1154,
    ],

    12: [
      350,
      380,
      461,
      510,
      542,
      633,
      846,
      1219,
    ],

    13: [
      371,
      403,
      488,
      540,
      575,
      679,
      898,
      1284,
    ],

    14: [
      392,
      426,
      515,
      570,
      608,
      725,
      950,
      1349,
    ],

    15: [
      413,
      449,
      542,
      600,
      641,
      771,
      1002,
      1414,
    ],

    16: [
      434,
      472,
      569,
      630,
      674,
      817,
      1054,
      1479,
    ],

    17: [
      455,
      495,
      596,
      660,
      707,
      863,
      1106,
      1544,
    ],

    18: [
      476,
      518,
      623,
      690,
      740,
      909,
      1158,
      1609,
    ],

    19: [
      497,
      541,
      650,
      720,
      773,
      955,
      1210,
      1674,
    ],

    20: [
      518,
      564,
      677,
      750,
      806,
      1001,
      1262,
      1739,
    ],

    21: [
      539,
      587,
      704,
      780,
      839,
      1047,
      1314,
      1804,
    ],

    22: [
      560,
      610,
      731,
      810,
      872,
      1093,
      1366,
      1869,
    ],

    23: [
      581,
      633,
      758,
      840,
      905,
      1139,
      1418,
      1934,
    ],

    24: [
      602,
      656,
      785,
      870,
      938,
      1185,
      1470,
      1999,
    ],

    25: [
      623,
      679,
      812,
      900,
      971,
      1231,
      1522,
      2064,
    ],
  };

/*
   For weights > 25 kg:
   each additional 1 kg.
*/

const ARAMEX_AFTER_25_PER_KG = [
  21, // zone 1
  23, // zone 2
  27, // zone 3
  30, // zone 4
  33, // zone 5
  46, // zone 6
  52, // zone 7
  65, // zone 8
];

/* =========================================================
   Aramex contract pricing helpers
   ========================================================= */

/*
   Contract has:
   - 0.5 kg increments through 10 kg
   - whole kg rows above 10 kg
*/

function roundAramexWeight(
  chargeableKg: number
) {
  if (chargeableKg <= 10) {
    return (
      Math.ceil(chargeableKg * 2) /
      2
    );
  }

  return Math.ceil(chargeableKg);
}

/*
   Emergency surcharge:
   AED 4 per half kg
   maximum AED 20
*/

function getAramexEmergencySurcharge(
  chargeableKg: number
) {
  const halfKgUnits =
    Math.ceil(chargeableKg / 0.5);

  return Math.min(
    20,
    halfKgUnits * 4
  );
}

function getAramexContractBaseRate(
  destination: string,
  chargeableKg: number
): {
  zone: number;
  billedKg: number;
  baseAED: number;
} | null {
  const zone =
    ARAMEX_OUTBOUND_ZONE[
      destination
    ];

  if (!zone) {
    return null;
  }

  const billedKg =
    roundAramexWeight(
      chargeableKg
    );

  /*
     Weight <= 25:
     direct table lookup
  */

  if (billedKg <= 25) {
    const row =
      ARAMEX_PARCEL_RATES[
        billedKg
      ];

    if (!row) {
      return null;
    }

    const baseAED =
      row[zone - 1];

    if (
      typeof baseAED !== "number"
    ) {
      return null;
    }

    return {
      zone,
      billedKg,
      baseAED,
    };
  }

  /*
     >25 kg:
     base at 25 kg +
     additional whole kg
  */

  const row25 =
    ARAMEX_PARCEL_RATES[25];

  if (!row25) {
    return null;
  }

  const base25 =
    row25[zone - 1];

  const extraPerKg =
    ARAMEX_AFTER_25_PER_KG[
      zone - 1
    ];

  if (
    typeof base25 !== "number" ||
    typeof extraPerKg !==
      "number"
  ) {
    return null;
  }

  const extraKg =
    Math.ceil(
      billedKg - 25
    );

  return {
    zone,

    billedKg,

    baseAED:
      base25 +
      extraKg *
        extraPerKg,
  };
}

/* =========================================================
   Optional DB carrier overrides
   ========================================================= */

async function applyDbOverrides(
  current: Record<
    CarrierKey,
    CarrierSetting
  >
): Promise<
  Record<
    CarrierKey,
    CarrierSetting
  >
> {
  try {
    try {
      const mongooseLib: any =
        await import(
          "@/lib/mongoose"
        )
          .then(
            (m) => m as any
          )
          .catch(() => null);

      const connectFn =
        mongooseLib &&
        (
          mongooseLib.default ||
          mongooseLib.connect ||
          mongooseLib.dbConnect ||
          mongooseLib.mongooseConnect
        );

      if (
        typeof connectFn ===
        "function"
      ) {
        await connectFn();
      }
    } catch {}

    let CarrierRateModel:
      any = null;

    try {
      CarrierRateModel =
        (
          await import(
            "@/lib/models/CarrierRate"
          )
        ).default;
    } catch {
      return current;
    }

    if (
      !CarrierRateModel?.find
    ) {
      return current;
    }

    const docs =
      await CarrierRateModel
        .find({})
        .lean?.();

    if (
      !Array.isArray(docs) ||
      docs.length === 0
    ) {
      return current;
    }

    const next = {
      ...current,
    };

    for (const d of docs) {
      const nm =
        String(
          d?.carrier ??
            d?.name ??
            ""
        ).toUpperCase();

      const key:
        | CarrierKey
        | null =
        nm === "DHL"
          ? "DHL"
          : nm === "ARAMEX"
          ? "Aramex"
          : nm === "UPS"
          ? "UPS"
          : null;

      if (!key) {
        continue;
      }

      const cur =
        next[key];

      next[key] = {
        enabled:
          Boolean(
            d?.enabled ??
              cur.enabled
          ),

        divisor:
          posNumOr(
            d?.divisor ??
              d?.volumetricDivisor,
            cur.divisor
          ),

        baseKg: {
          standard:
            posNumOr(
              d?.baseStd ??
                d?.baseStandard,
              cur.baseKg
                .standard
            ),

          express:
            posNumOr(
              d?.baseExp ??
                d?.baseExpress,
              cur.baseKg
                .express
            ),
        },

        min: {
          standard:
            posNumOr(
              d?.minStd ??
                d?.minStandard,
              cur.min.standard
            ),

          express:
            posNumOr(
              d?.minExp ??
                d?.minExpress,
              cur.min.express
            ),
        },

        fuelPct:
          posNumOr(
            d?.fuelPct,
            cur.fuelPct
          ),

        markupPct:
          posNumOr(
            d?.markupPct,
            cur.markupPct
          ),

        etaDays: {
          standard:
            posNumOr(
              d?.etaStd ??
                d?.etaStandard,
              cur.etaDays
                .standard
            ),

          express:
            posNumOr(
              d?.etaExp ??
                d?.etaExpress,
              cur.etaDays
                .express
            ),
        },
      };
    }

    return next;
  } catch {
    return current;
  }
}

/* =========================================================
   Generic pricing helpers
   ========================================================= */

function getRouteMultiplier(
  fromCountry: string,
  toCountry: string
) {
  const fromGulf =
    GULF.has(fromCountry);

  const toAfrica =
    AFRICA_DESTS.has(
      toCountry
    );

  if (
    fromGulf &&
    toAfrica
  ) {
    return 0.95;
  }

  if (
    fromCountry ===
      "United Arab Emirates" &&
    toCountry ===
      "United Kingdom"
  ) {
    return 1.08;
  }

  if (
    fromCountry ===
      "United Arab Emirates" &&
    toCountry ===
      "United States"
  ) {
    return 1.15;
  }

  if (
    fromCountry ===
      "United Arab Emirates" &&
    toCountry ===
      "Canada"
  ) {
    return 1.12;
  }

  return 1;
}

function calcChargeableKg(
  actualKg: number,
  dims:
    | {
        L?: number;
        W?: number;
        H?: number;
      }
    | undefined,
  divisor: number
) {
  if (
    dims &&
    Number.isFinite(
      dims.L
    ) &&
    Number.isFinite(
      dims.W
    ) &&
    Number.isFinite(
      dims.H
    ) &&
    (dims.L as number) >
      0 &&
    (dims.W as number) >
      0 &&
    (dims.H as number) >
      0
  ) {
    const volumetricKg =
      (
        (dims.L as number) *
        (dims.W as number) *
        (dims.H as number)
      ) / divisor;

    return Math.max(
      actualKg,
      volumetricKg
    );
  }

  return actualKg;
}

/* =========================================================
   Generic DHL / UPS / fallback quote
   ========================================================= */

function buildGenericQuote(
  carrier: CarrierKey,
  s: CarrierSetting,
  speed: Speed,
  weightKg: number,
  dimsCm:
    | {
        L?: number;
        W?: number;
        H?: number;
      }
    | undefined,
  opts: {
    insuranceAED: number;
    remoteAED: number;
    routeMultiplier: number;
  }
): Quote {
  const chargeable =
    calcChargeableKg(
      weightKg,
      dimsCm,
      s.divisor
    );

  const basePerKg =
    s.baseKg[speed] *
    opts.routeMultiplier;

  const min =
    s.min[speed] *
    opts.routeMultiplier;

  const base =
    Math.max(
      min,
      basePerKg *
        chargeable
    );

  const fuel =
    (
      s.fuelPct /
      100
    ) * base;

  const preMarkup =
    base +
    fuel +
    opts.remoteAED +
    opts.insuranceAED;

  const markup =
    (
      s.markupPct /
      100
    ) * preMarkup;

  const total =
    preMarkup +
    markup;

  return {
    carrier,

    speed,

    chargeableKg:
      round2(
        chargeable
      ),

    priceAED:
      round2(total),

    etaDays:
      s.etaDays[
        speed
      ],

    rateSource:
      "estimate",

    breakdown: {
      baseAED:
        round2(base),

      fuelAED:
        round2(fuel),

      emergencyAED: 0,

      remoteAED:
        round2(
          opts.remoteAED
        ),

      insuranceAED:
        round2(
          opts.insuranceAED
        ),

      markupAED:
        round2(markup),
    },

    notes: [
      "Estimated carrier rate",

      dimsCm
        ? "Volumetric weight applied if greater than actual weight"
        : "Actual weight used",
    ],
  };
}

/* =========================================================
   Real Aramex contract quote
   ========================================================= */

function buildAramexContractQuote(
  s: CarrierSetting,
  speed: Speed,
  weightKg: number,
  dimsCm:
    | {
        L?: number;
        W?: number;
        H?: number;
      }
    | undefined,
  destination: string,
  opts: {
    insuranceAED: number;
    remoteAED: number;
  }
): Quote | null {
  const chargeable =
    calcChargeableKg(
      weightKg,
      dimsCm,
      s.divisor
    );

  const contract =
    getAramexContractBaseRate(
      destination,
      chargeable
    );

  if (!contract) {
    return null;
  }

  const base =
    contract.baseAED;

  /*
     Fuel is variable according
     to Aramex.

     Current configured value comes
     from CarrierRate DB or DEFAULTS.
  */

  const fuel =
    base *
    (
      s.fuelPct /
      100
    );

  const emergency =
    getAramexEmergencySurcharge(
      contract.billedKg
    );

  const preMarkup =
    base +
    fuel +
    emergency +
    opts.remoteAED +
    opts.insuranceAED;

  const markup =
    preMarkup *
    (
      s.markupPct /
      100
    );

  const total =
    preMarkup +
    markup;

  return {
    carrier:
      "Aramex",

    speed,

    chargeableKg:
      round2(
        contract.billedKg
      ),

    priceAED:
      round2(total),

    etaDays:
      s.etaDays[
        speed
      ],

    rateSource:
      "contract",

    breakdown: {
      baseAED:
        round2(base),

      fuelAED:
        round2(fuel),

      emergencyAED:
        round2(
          emergency
        ),

      remoteAED:
        round2(
          opts.remoteAED
        ),

      insuranceAED:
        round2(
          opts.insuranceAED
        ),

      markupAED:
        round2(markup),
    },

    notes: [
      `Aramex DLIET contracted outbound parcel rate — Zone ${contract.zone}`,

      `Contract billed weight: ${contract.billedKg} kg`,

      `Emergency surcharge AED ${round2(
        emergency
      )}`,

      `Fuel surcharge ${s.fuelPct}% — configurable because Aramex publishes a variable fuel surcharge`,

      dimsCm
        ? "Volumetric weight checked"
        : "Actual weight used",
    ],
  };
}

/* =========================================================
   API handler
   ========================================================= */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    req.method !== "POST"
  ) {
    res.setHeader(
      "Allow",
      "POST"
    );

    return res
      .status(405)
      .json({
        ok: false,
        error:
          "Method not allowed",
      });
  }

  try {
    const body =
      (
        req.body ??
        {}
      ) as ReqBody;

    const fromCountry =
      normalizeCountryName(
        getCountryValue(
          body.from
        ) ||
          "United Arab Emirates"
      );

    const toCountry =
      normalizeCountryName(
        getCountryValue(
          body.to
        ) ||
          "United Kingdom"
      );

    const speed:
      Speed =
      asStr(
        body.speed
      ) === "express"
        ? "express"
        : "standard";

    const weightKg =
      posNumOr(
        body.weightKg,
        1
      );

    const dimsIn =
      body.dims ||
      {};

    const L =
      asNum(
        dimsIn.L
      );

    const W =
      asNum(
        dimsIn.W
      );

    const H =
      asNum(
        dimsIn.H
      );

    const dimsCm =
      Number.isFinite(L) &&
      Number.isFinite(W) &&
      Number.isFinite(H) &&
      L > 0 &&
      W > 0 &&
      H > 0
        ? {
            L,
            W,
            H,
          }
        : undefined;

    const carriersInput =
      body.carriers || {
        DHL: false,
        Aramex: true,
        UPS: false,
      };

    const requested:
      CarrierKey[] =
      (
        [
          "DHL",
          "Aramex",
          "UPS",
        ] as CarrierKey[]
      ).filter(
        (carrier) =>
          Boolean(
            (
              carriersInput as Record<
                string,
                boolean
              >
            )[carrier]
          )
      );

    if (
      requested.length === 0
    ) {
      return fail(
        res,
        400,
        "No carrier selected"
      );
    }

    /*
       Domestic same-country requests
       are outside this international
       quote endpoint for now.
    */

    if (
      fromCountry.toLowerCase() ===
      toCountry.toLowerCase()
    ) {
      return ok(
        res,
        {
          currency:
            "AED",

          from:
            fromCountry,

          to:
            toCountry,

          quotes:
            [] as Quote[],
        }
      );
    }

    const insuranceAED =
      body.insurance
        ?.add &&
      posNumOr(
        body.insurance
          ?.declared,
        0
      ) > 0
        ? Math.max(
            INSURANCE_MIN_AED,

            INSURANCE_RATE *
              posNumOr(
                body
                  .insurance
                  ?.declared,
                0
              )
          )
        : 0;

    const remoteAED =
      body.remoteArea
        ? REMOTE_AREA_FLAT_AED
        : 0;

    /*
       Generic multiplier is ONLY
       for carriers still using
       estimated calculation.

       Aramex contract pricing does
       NOT use this multiplier.
    */

    const routeMultiplier =
      getRouteMultiplier(
        fromCountry,
        toCountry
      );

    /*
       Pull current:
       - enabled status
       - fuel %
       - CBC markup %
       - volumetric divisor
       - ETA
       from MongoDB if configured.
    */

    const effective =
      await applyDbOverrides(
        DEFAULTS
      );

    const quotes:
      Quote[] = [];

    for (
      const carrier
      of requested
    ) {
      const cfg =
        effective[
          carrier
        ];

      if (
        !cfg?.enabled
      ) {
        continue;
      }

      /*
         ARAMEX

         Use DLIET contractual outbound
         rates whenever:

         origin = UAE
         AND destination exists
         in the contract zone map.
      */

      if (
        carrier ===
          "Aramex" &&
        fromCountry ===
          "United Arab Emirates"
      ) {
        const contractQuote =
          buildAramexContractQuote(
            cfg,
            speed,
            weightKg,
            dimsCm,
            toCountry,
            {
              insuranceAED,
              remoteAED,
            }
          );

        if (
          contractQuote
        ) {
          quotes.push(
            contractQuote
          );

          continue;
        }
      }

      /*
         FALLBACK

         DHL / UPS,
         plus Aramex destinations
         not yet entered into the
         contract zone map.
      */

      quotes.push(
        buildGenericQuote(
          carrier,
          cfg,
          speed,
          weightKg,
          dimsCm,
          {
            insuranceAED,
            remoteAED,
            routeMultiplier,
          }
        )
      );
    }

    /*
       Cheapest first
    */

    quotes.sort(
      (a, b) =>
        a.priceAED -
        b.priceAED
    );

    return ok(
      res,
      {
        currency:
          "AED",

        from:
          fromCountry,

        to:
          toCountry,

        quotes,
      }
    );
  } catch (
    e: unknown
  ) {
    return res
      .status(500)
      .json({
        ok: false,

        error:
          errorMessage(
            e
          ) ||
          "Internal Server Error",
      });
  }
}

/* =========================================================
   API helpers
   ========================================================= */

function ok(
  res: NextApiResponse,
  body: any
) {
  return res
    .status(200)
    .json({
      ok: true,
      ...body,
    });
}

function fail(
  res: NextApiResponse,
  code: number,
  msg: string,
  details?: any
) {
  return res
    .status(code)
    .json({
      ok: false,

      error: msg,

      ...(details
        ? {
            details,
          }
        : {}),
    });
}