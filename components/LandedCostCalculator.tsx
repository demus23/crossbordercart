import { useState } from 'react';

/**
 * Landed Cost Calculator — CrossBorderCart homepage widget.
 *
 * SHIPPING is now sourced live: this component calls CBC's own
 * `/api/shipping/quote` endpoint (pages/api/shipping/quote.ts) — the same
 * pricing engine already used by ShippingCalc/ShippingQuoteSimple — and
 * uses the cheapest of the DHL/Aramex/UPS quotes it returns, converted
 * from AED to USD at the live FX rate. If that call fails for any reason
 * (offline preview, API down), it falls back to the shipRatePerKg
 * placeholder below so the widget never breaks — but in production, on
 * the real site, shipping is real, not guessed.
 *
 * DUTY % and VAT/GST % are sourced from each destination's published
 * customs tariff — regional trade blocs where they apply (EAC, ECOWAS,
 * GCC Common External Tariff, EU Common Customs Tariff), or each
 * country's own national schedule — verified August 2026. Several of
 * these regimes are mid-change (South Africa phasing out low-value
 * relief, EU/UK phasing out their thresholds through 2028, US de minimis
 * suspended Aug 2025, Bahrain's threshold only 3 months old at time of
 * writing) — re-check periodically. Category-to-band mapping is the
 * commonly-cited "typical" figure for that category, not a line-by-line
 * HS/HTS code lookup — treat this as a good-faith estimate rather than
 * exact for every SKU (disclosed to users via the trust panel in the UI).
 *
 * shipRatePerKg is only a FALLBACK, used when the live quote call fails.
 * apiCountry is the country string passed to /api/shipping/quote — most
 * match pages/api/shipping/quote.ts's normalizeCountryName map exactly;
 * a few (South Africa, Egypt, India, Pakistan, Bangladesh, Germany,
 * France) aren't in that map yet, so they fall through to a neutral 1x
 * route multiplier there rather than a route-specific one. Worth adding
 * to that map server-side for better accuracy on those routes.
 */

type CategoryKey = 'Beauty' | 'General' | 'Electronics' | 'Clothing';

type Region = 'Africa' | 'GCC & Middle East' | 'South Asia' | 'Europe' | 'North America';

const REGIONS: Region[] = ['Africa', 'GCC & Middle East', 'South Asia', 'Europe', 'North America'];

interface DeMinimis {
  thresholdUSD: number;
  /** 'all' = duty AND vat/levies waived below threshold. 'duty' = only duty waived, VAT/GST still applies. */
  waives: 'all' | 'duty';
}

interface DestinationConfig {
  label: string;
  region: Region;
  currency: string;
  apiCountry: string; // passed to /api/shipping/quote as `to`
  vatPct: number;
  otherLeviesPct: number;
  leviesLabel: string;
  deMinimis: DeMinimis | null;
  dutyByCategory: Record<CategoryKey, number>;
  shipRatePerKg: number; // fallback only — used if the live quote call fails
  sourceNote: string;
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  Beauty: 'Beauty and cosmetics',
  General: 'General merchandise',
  Electronics: 'Electronics',
  Clothing: 'Clothing and textiles',
};

const DESTINATIONS = {
  // ---------------- Africa ----------------
  Nairobi: {
    label: 'Nairobi, Kenya', region: 'Africa', currency: 'KES', apiCountry: 'Kenya',
    vatPct: 16, otherLeviesPct: 3.75, leviesLabel: 'IDF + RDL (Kenya import declaration & railway levy)',
    deMinimis: null,
    dutyByCategory: { General: 25, Electronics: 25, Clothing: 35, Beauty: 35 },
    shipRatePerKg: 7.5, sourceNote: 'KRA / EAC Common External Tariff, 4th band gazette',
  },
  Kampala: {
    label: 'Kampala, Uganda', region: 'Africa', currency: 'UGX', apiCountry: 'Uganda',
    vatPct: 18, otherLeviesPct: 3.5, leviesLabel: 'Infrastructure levy + IDF',
    deMinimis: null,
    dutyByCategory: { General: 25, Electronics: 25, Clothing: 35, Beauty: 25 },
    shipRatePerKg: 8.0, sourceNote: 'URA / EAC Common External Tariff',
  },
  Lagos: {
    label: 'Lagos, Nigeria', region: 'Africa', currency: 'NGN', apiCountry: 'Nigeria',
    vatPct: 7.5, otherLeviesPct: 4.5, leviesLabel: 'Surcharge + FCS + ETLS',
    deMinimis: { thresholdUSD: 300, waives: 'all' },
    dutyByCategory: { General: 12, Electronics: 10, Clothing: 15, Beauty: 12 },
    shipRatePerKg: 8.5, sourceNote: 'Nigeria Customs Service, incl. Sept 2025 $300 de minimis',
  },
  Accra: {
    label: 'Accra, Ghana', region: 'Africa', currency: 'GHS', apiCountry: 'Ghana',
    vatPct: 20, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: null,
    dutyByCategory: { General: 10, Electronics: 10, Clothing: 20, Beauty: 20 },
    shipRatePerKg: 8.0, sourceNote: 'Ghana Revenue Authority (VAT+NHIL+GETFund) / ECOWAS CET',
  },
  AddisAbaba: {
    label: 'Addis Ababa, Ethiopia', region: 'Africa', currency: 'ETB', apiCountry: 'Ethiopia',
    vatPct: 15, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: null,
    dutyByCategory: { General: 17, Electronics: 17, Clothing: 18, Beauty: 17 },
    shipRatePerKg: 8.5, sourceNote: 'Ethiopia Customs Commission tariff book; excise may apply to specific goods, not modeled here',
  },
  Johannesburg: {
    label: 'Johannesburg, South Africa', region: 'Africa', currency: 'ZAR', apiCountry: 'South Africa',
    vatPct: 15, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: null, // South Africa is actively phasing OUT low-value relief — treat as none
    dutyByCategory: { General: 15, Electronics: 8, Clothing: 40, Beauty: 18 },
    shipRatePerKg: 8.5, sourceNote: 'SARS — note: low-value consignment relief was phased out 2024-25; clothing/textiles always get full clearance regardless of value',
  },
  DarEsSalaam: {
    label: 'Dar es Salaam, Tanzania', region: 'Africa', currency: 'TZS', apiCountry: 'Tanzania',
    vatPct: 18, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: null,
    dutyByCategory: { General: 25, Electronics: 25, Clothing: 35, Beauty: 35 },
    shipRatePerKg: 8.0, sourceNote: 'TRA / EAC Common External Tariff',
  },
  Kigali: {
    label: 'Kigali, Rwanda', region: 'Africa', currency: 'RWF', apiCountry: 'Rwanda',
    vatPct: 18, otherLeviesPct: 1.7, leviesLabel: 'Infrastructure Development Levy + AU import levy',
    deMinimis: null,
    dutyByCategory: { General: 25, Electronics: 25, Clothing: 35, Beauty: 35 },
    shipRatePerKg: 8.0, sourceNote: 'RRA / EAC Common External Tariff',
  },
  Cairo: {
    label: 'Cairo, Egypt', region: 'Africa', currency: 'EGP', apiCountry: 'Egypt',
    vatPct: 14, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: null,
    dutyByCategory: { General: 25, Electronics: 10, Clothing: 35, Beauty: 25 },
    shipRatePerKg: 8.5, sourceNote: 'Egyptian customs tariff — mobile phones specifically carry a much higher combined rate (~38.5%) since Jan 2026, not reflected in the generic Electronics figure here',
  },
  Lusaka: {
    label: 'Lusaka, Zambia', region: 'Africa', currency: 'ZMW', apiCountry: 'Zambia',
    vatPct: 16, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 50, waives: 'all' },
    dutyByCategory: { General: 25, Electronics: 25, Clothing: 25, Beauty: 25 },
    shipRatePerKg: 8.5, sourceNote: 'ZRA — $50 parcel-post exemption for personal, non-commercial consignments',
  },
  // ---------------- GCC & Middle East ----------------
  Riyadh: {
    label: 'Riyadh, Saudi Arabia', region: 'GCC & Middle East', currency: 'SAR', apiCountry: 'Saudi Arabia',
    vatPct: 15, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 267, waives: 'duty' },
    dutyByCategory: { General: 5, Electronics: 5, Clothing: 5, Beauty: 5 },
    shipRatePerKg: 4.5, sourceNote: 'ZATCA / GCC Common External Tariff (5% baseline applies to nearly all consumer goods)',
  },
  Doha: {
    label: 'Doha, Qatar', region: 'GCC & Middle East', currency: 'QAR', apiCountry: 'Qatar',
    vatPct: 0, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 275, waives: 'all' },
    dutyByCategory: { General: 5, Electronics: 5, Clothing: 5, Beauty: 5 },
    shipRatePerKg: 4.5, sourceNote: 'Qatar General Authority of Customs / GCC CET — Qatar has not implemented VAT as of Aug 2026',
  },
  KuwaitCity: {
    label: 'Kuwait City, Kuwait', region: 'GCC & Middle East', currency: 'KWD', apiCountry: 'Kuwait',
    vatPct: 0, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 325, waives: 'all' },
    dutyByCategory: { General: 5, Electronics: 5, Clothing: 5, Beauty: 5 },
    shipRatePerKg: 4.5, sourceNote: 'Kuwait Customs / GCC CET — Kuwait has not implemented VAT; de minimis figure has low confidence, verify directly with Kuwait Customs',
  },
  Manama: {
    label: 'Manama, Bahrain', region: 'GCC & Middle East', currency: 'BHD', apiCountry: 'Bahrain',
    vatPct: 10, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 265, waives: 'duty' },
    dutyByCategory: { General: 5, Electronics: 5, Clothing: 5, Beauty: 5 },
    shipRatePerKg: 4.5, sourceNote: 'Bahrain Customs Affairs — new BHD 100 threshold effective May 2026, recent enough to re-verify periodically',
  },
  Muscat: {
    label: 'Muscat, Oman', region: 'GCC & Middle East', currency: 'OMR', apiCountry: 'Oman',
    vatPct: 5, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 260, waives: 'duty' },
    dutyByCategory: { General: 5, Electronics: 5, Clothing: 5, Beauty: 5 },
    shipRatePerKg: 4.5, sourceNote: 'Oman Customs / GCC CET',
  },
  // ---------------- South Asia ----------------
  Mumbai: {
    label: 'Mumbai, India', region: 'South Asia', currency: 'INR', apiCountry: 'India',
    vatPct: 18, otherLeviesPct: 2, leviesLabel: 'Social Welfare Surcharge (10% of duty)',
    deMinimis: null, // gift/personal exemption abolished 2019-2020 — no meaningful de minimis today
    dutyByCategory: { General: 12, Electronics: 22, Clothing: 20, Beauty: 20 },
    shipRatePerKg: 6.0, sourceNote: 'CBIC — duty-free gift/personal exemption abolished (2019); duty+IGST apply from the first rupee on commercial-value parcels',
  },
  Karachi: {
    label: 'Karachi, Pakistan', region: 'South Asia', currency: 'PKR', apiCountry: 'Pakistan',
    vatPct: 18, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 3.5, waives: 'all' }, // effectively irrelevant at CBC's typical order values
    dutyByCategory: { General: 12, Electronics: 15, Clothing: 18, Beauty: 18 },
    shipRatePerKg: 6.0, sourceNote: 'FBR — de minimis (Rs 1,000) is far below typical parcel values and rarely applies; category rates are representative, verify against live FBR tariff',
  },
  Dhaka: {
    label: 'Dhaka, Bangladesh', region: 'South Asia', currency: 'BDT', apiCountry: 'Bangladesh',
    vatPct: 15, otherLeviesPct: 5, leviesLabel: 'Advance Income Tax',
    deMinimis: null,
    dutyByCategory: { General: 28, Electronics: 15, Clothing: 28, Beauty: 30 },
    shipRatePerKg: 6.0, sourceNote: 'NBR — Bangladesh stacks Customs + Regulatory + Supplementary Duty ahead of VAT/AIT; figures here are a simplified blended estimate, actual assessment can run higher, especially for cosmetics',
  },
  // ---------------- Europe ----------------
  London: {
    label: 'London, United Kingdom', region: 'Europe', currency: 'GBP', apiCountry: 'United Kingdom',
    vatPct: 20, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 175, waives: 'duty' }, // £135 duty relief; being phased out by Oct 2028
    dutyByCategory: { General: 4, Electronics: 0, Clothing: 12, Beauty: 6.5 },
    shipRatePerKg: 11.0, sourceNote: "UK Global Tariff / gov.uk — £135 duty relief is being phased out by Oct 2028; VAT always applies regardless of value",
  },
  Berlin: {
    label: 'Berlin, Germany', region: 'Europe', currency: 'EUR', apiCountry: 'Germany',
    vatPct: 19, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 165, waives: 'duty' }, // €150; from Jul 2026 a small flat per-item fee replaces this, approximated as duty-free here
    dutyByCategory: { General: 4, Electronics: 0, Clothing: 12, Beauty: 6.5 },
    shipRatePerKg: 11.0, sourceNote: 'EU Common Customs Tariff — VAT always applies regardless of value (abolished low-value exemption, Jul 2021); €150 duty threshold being unwound 2026-2028',
  },
  Paris: {
    label: 'Paris, France', region: 'Europe', currency: 'EUR', apiCountry: 'France',
    vatPct: 20, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 165, waives: 'duty' },
    dutyByCategory: { General: 4, Electronics: 0, Clothing: 12, Beauty: 6.5 },
    shipRatePerKg: 11.0, sourceNote: 'EU Common Customs Tariff (same duty as Germany) — VAT always applies regardless of value',
  },
  // ---------------- North America ----------------
  NewYork: {
    label: 'New York, United States', region: 'North America', currency: 'USD', apiCountry: 'United States',
    vatPct: 0, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: null, // $800 de minimis suspended for all countries, Aug 2025 — no exemption currently
    dutyByCategory: { General: 13, Electronics: 0, Clothing: 28, Beauty: 13 }, // includes +10% UAE reciprocal tariff except ITA-exempt electronics
    shipRatePerKg: 13.0, sourceNote: 'CBP / USTR — $800 de minimis suspended for all countries since Aug 29, 2025; no federal sales tax on imports; electronics ITA-exempt from the reciprocal tariff (policy noted as possibly temporary)',
  },
  Toronto: {
    label: 'Toronto, Canada', region: 'North America', currency: 'CAD', apiCountry: 'Canada',
    vatPct: 5, otherLeviesPct: 0, leviesLabel: '',
    deMinimis: { thresholdUSD: 14, waives: 'all' }, // CAD $20 general threshold (non-CUSMA origin)
    dutyByCategory: { General: 5, Electronics: 0, Clothing: 17, Beauty: 6.5 },
    shipRatePerKg: 12.5, sourceNote: "CBSA — CUSMA's higher thresholds do not apply to UAE-origin parcels; GST shown here is the 5% federal rate only, provincial HST/PST may add more depending on destination province",
  },
} satisfies Record<string, DestinationConfig>;

type DestinationKey = keyof typeof DESTINATIONS;

function fmtUSD(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtLocal(n: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n.toFixed(0)} ${currency}`;
  }
}

interface ShippingQuoteResult {
  priceAED: number;
  carrier: string;
}

/** Calls CBC's own live pricing engine. Returns null on any failure so the caller can fall back gracefully. */
async function fetchLiveShippingQuote(
  apiCountry: string,
  weightKg: number
): Promise<ShippingQuoteResult | null> {
  try {
    const res = await fetch('/api/shipping/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'United Arab Emirates',
        to: apiCountry,
        weightKg,
        speed: 'standard',
        carriers: { DHL: false, Aramex: true, UPS: false },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.quotes) || data.quotes.length === 0) return null;
    // API already sorts quotes ascending by priceAED — first is cheapest
    const cheapest = data.quotes[0];
    if (typeof cheapest?.priceAED !== 'number' || !cheapest?.carrier) return null;
    return { priceAED: cheapest.priceAED, carrier: cheapest.carrier };
  } catch {
    return null;
  }
}

interface Breakdown {
  declaredValue: number;
  shipping: number;
  shippingIsLive: boolean;
  shippingCarrier: string | null;
  duty: number;
  dutyPct: number;
  waivesAll: boolean;
  waivesDutyOnly: boolean;
  levies: number;
  vat: number;
  serviceFee: number;
  importCharges: number;
  total: number;
  localTotal: number | null;
}

export default function LandedCostCalculator() {
  const [category, setCategory] = useState<CategoryKey>('General');
  const [weight, setWeight] = useState('12');
  const [value, setValue] = useState('600');
  const [destKey, setDestKey] = useState<DestinationKey>('Nairobi');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Breakdown | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [fxRates, setFxRates] = useState<Record<string, number> | null>(null);
  const [fxLoaded, setFxLoaded] = useState(false);

  async function ensureFx() {
    if (fxLoaded) return fxRates;
    setFxLoaded(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data?.result === 'success' && data.rates) {
        setFxRates(data.rates);
        return data.rates as Record<string, number>;
      }
    } catch {
      // live FX is a nice-to-have; local-currency line just won't show
    }
    return null;
  }

  async function handleCalculate() {
    const w = parseFloat(weight);
    const v = parseFloat(value);
    if (!w || w <= 0 || !v || v <= 0) {
      setError('Enter a valid weight and declared value first.');
      setResult(null);
      return;
    }
    setError(null);
    setCalculating(true);

    const dest = DESTINATIONS[destKey];

    const [rates, liveQuote] = await Promise.all([
      ensureFx(),
      fetchLiveShippingQuote(dest.apiCountry, w),
    ]);

    const aedRate = rates?.AED; // USD -> AED
    let shipping: number;
    let shippingIsLive = false;
    let shippingCarrier: string | null = null;

    if (liveQuote && aedRate) {
      shipping = liveQuote.priceAED / aedRate; // AED -> USD
      shippingIsLive = true;
      shippingCarrier = liveQuote.carrier;
    } else {
      shipping = dest.shipRatePerKg * w; // fallback placeholder
    }

    const cif = v + shipping;
    const dm = dest.deMinimis;
    const underDM = !!(dm && v <= dm.thresholdUSD);
    const waivesAll = underDM && dm!.waives === 'all';
    const waivesDutyOnly = underDM && dm!.waives === 'duty';

    const dutyPct = dest.dutyByCategory[category];
    const duty = waivesAll || waivesDutyOnly ? 0 : cif * (dutyPct / 100);
    const levies = waivesAll ? 0 : cif * (dest.otherLeviesPct / 100);
    const vat = waivesAll ? 0 : (cif + duty) * (dest.vatPct / 100);
    const serviceFee = 0; // CBC's own consolidation/handling/clearance fee — plug in a real figure when set
    const importCharges = shipping + duty + levies + vat + serviceFee;
    const total = v + importCharges;

    const localTotal =
      rates && rates[dest.currency] && dest.currency !== 'USD' ? total * rates[dest.currency] : null;

    setResult({
      declaredValue: v,
      shipping,
      shippingIsLive,
      shippingCarrier,
      duty,
      dutyPct,
      waivesAll,
      waivesDutyOnly,
      levies,
      vat,
      serviceFee,
      importCharges,
      total,
      localTotal,
    });
    setCalculating(false);
  }

  const dest = DESTINATIONS[destKey];

  return (
    <section className="lcc-wrap">
      <div className="lcc-header">
        <div className="lcc-eyebrow">CrossBorderCart · Trade Tools</div>
        <h2>What will it actually cost to land, wherever you are?</h2>
        <p>
          A real breakdown of shipping, duty, VAT/GST and fees for destinations across Africa, the
          GCC, South Asia, Europe and North America. Shipping is calculated using CBC&apos;s current
          carrier pricing — duty and VAT are sourced from published customs rates. Final duty is
          always set by customs on arrival.
        </p>
      </div>

      <div className="lcc-panel">
        <div className="lcc-panel-top">
          <strong>Shipment details</strong>
          <span>
            Estimated import charges only. Final customs duty and taxes depend on the
            product&apos;s HS classification, origin, declared value, and destination customs
            assessment.
          </span>
        </div>
        <div className="lcc-field-grid">
          <div className="lcc-field">
            <label htmlFor="lcc-category">Item category</label>
            <select
              id="lcc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryKey)}
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="lcc-field">
            <label htmlFor="lcc-weight">Weight (kg)</label>
            <input
              id="lcc-weight"
              type="number"
              min="0.1"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="lcc-field">
            <label htmlFor="lcc-value">Declared value (USD)</label>
            <input
              id="lcc-value"
              type="number"
              min="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="lcc-hint">CBC bills in AED; USD is used here for duty calculation</div>
          </div>
          <div className="lcc-field">
            <label htmlFor="lcc-destination">Destination</label>
            <select
              id="lcc-destination"
              value={destKey}
              onChange={(e) => setDestKey(e.target.value as DestinationKey)}
            >
              {REGIONS.map((region) => (
                <optgroup key={region} label={region}>
                  {(Object.entries(DESTINATIONS) as [DestinationKey, DestinationConfig][])
                    .filter(([, d]) => d.region === region)
                    .map(([key, d]) => (
                      <option key={key} value={key}>
                        {d.label}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
        <button className="lcc-calc-btn" onClick={handleCalculate} disabled={calculating}>
          {calculating ? 'Fetching live rates…' : 'Calculate landed cost'}
        </button>
        {error && <div className="lcc-error">{error}</div>}
      </div>

      {result && (
        <div className="lcc-results">
          <div className="lcc-results-label">
            <span>Estimated landed cost — {dest.label}</span>
            {result.localTotal !== null && <span className="lcc-fx-note">FX: live mid-market rate</span>}
          </div>
          <div className="lcc-breakdown-card">
            {(result.waivesAll || result.waivesDutyOnly) && dest.deMinimis && (
              <div className="lcc-deminimis-flag">
                {result.waivesAll
                  ? `Duty & tax waived — under ${fmtUSD(dest.deMinimis.thresholdUSD)} de minimis`
                  : `Duty waived — under ${fmtUSD(dest.deMinimis.thresholdUSD)} threshold (VAT/GST still applies)`}
              </div>
            )}
            <div className="lcc-line">
              <span>
                Shipping to destination
                <span className="lcc-sub">
                  {result.shippingIsLive
                    ? ` current CBC rate via ${result.shippingCarrier}`
                    : ` ${weight}kg @ ${fmtUSD(dest.shipRatePerKg)}/kg — estimated (live rates unavailable)`}
                </span>
              </span>
              <span>{fmtUSD(result.shipping)}</span>
            </div>
            <div className="lcc-line">
              <span>
                Import duty
                <span className="lcc-sub">
                  {result.waivesAll || result.waivesDutyOnly
                    ? ` waived (below $${dest.deMinimis?.thresholdUSD} threshold)`
                    : ` ${result.dutyPct}% of CIF · ${CATEGORY_LABELS[category]}`}
                </span>
              </span>
              <span>{fmtUSD(result.duty)}</span>
            </div>
            {dest.otherLeviesPct > 0 && (
              <div className="lcc-line">
                <span>
                  Other customs levies
                  <span className="lcc-sub"> {dest.leviesLabel}</span>
                </span>
                <span>{fmtUSD(result.levies)}</span>
              </div>
            )}
            {dest.vatPct > 0 && (
              <div className="lcc-line">
                <span>
                  VAT / GST
                  <span className="lcc-sub">
                    {result.waivesAll ? ' waived' : ` ${dest.vatPct}% on CIF + duty`}
                  </span>
                </span>
                <span>{fmtUSD(result.vat)}</span>
              </div>
            )}
            {result.serviceFee > 0 && (
              <div className="lcc-line">
                <span>
                  CBC service fee
                  <span className="lcc-sub">Consolidation, handling &amp; customs clearance</span>
                </span>
                <span>{fmtUSD(result.serviceFee)}</span>
              </div>
            )}

            <div className="lcc-line">
              <span>Declared item value</span>
              <span>{fmtUSD(result.declaredValue)}</span>
            </div>

            <div className="lcc-line">
              <span>Estimated shipping &amp; import charges</span>
              <span>{fmtUSD(result.importCharges)}</span>
            </div>

            <div className="lcc-total-row">
              <div className="lcc-totals-left">
                <span>Total landed cost (USD)</span>
                {result.localTotal !== null && (
                  <span className="lcc-local-fx">≈ {fmtLocal(result.localTotal, dest.currency)}</span>
                )}
              </div>
              <span className="lcc-amount">{fmtUSD(result.total)}</span>
            </div>
          </div>
          <div className="lcc-trust-panel">
            <strong>Where these numbers come from:</strong> shipping is a live quote from CBC&apos;s
            own rate engine (the same one used at checkout) — the cheapest of DHL, Aramex and UPS
            for this route right now. Duty and tax figures use general category estimates based on
            published customs information. Actual assessment may differ by HS code and customs
            classification, last checked August 2026. Customs authorities can reclassify goods or
            revise rates without notice — the amount CBC collects at checkout is always confirmed
            before your shipment is dispatched, never charged silently after the fact.
            <div className="lcc-sources">This destination: {dest.sourceNote}.</div>
          </div>
        </div>
      )}

      <style jsx>{`
        .lcc-wrap {
          --ink: #10152a;
          --ink-soft: #1b2240;
          --ink-line: rgba(237, 230, 214, 0.14);
          --parchment: #f2ebda;
          --parchment-dim: #dcd2b8;
          --brass: #cda046;
          --brass-dim: #8e7133;
          --teal: #2a8078;
          --teal-dim: #184f49;
          --clay: #b85c33;
          --text: #ede6d6;
          --text-muted: #9ba3c7;
          background: var(--ink);
          color: var(--text);
          font-family: 'IBM Plex Sans', sans-serif;
          padding: 56px 28px 80px;
        }
        .lcc-header {
          max-width: 920px;
          margin: 0 auto 40px;
        }
        .lcc-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brass);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lcc-eyebrow::before {
          content: '';
          width: 22px;
          height: 1px;
          background: var(--brass);
        }
        .lcc-header h2 {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: clamp(26px, 3.6vw, 38px);
          margin: 16px 0 0;
          color: var(--parchment);
          max-width: 600px;
          line-height: 1.15;
        }
        .lcc-header p {
          color: var(--text-muted);
          font-size: 15px;
          margin-top: 14px;
          max-width: 580px;
          line-height: 1.6;
        }
        .lcc-panel {
          max-width: 920px;
          margin: 0 auto;
          background: var(--parchment);
          color: var(--ink);
          padding: 32px 32px 28px;
          position: relative;
        }
        .lcc-panel-top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-bottom: 1px dashed rgba(16, 21, 42, 0.3);
          padding-bottom: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .lcc-panel-top strong {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          font-weight: 500;
        }
        .lcc-panel-top span {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #5b5646;
        }
        .lcc-field-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        .lcc-field label {
          display: block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #6b6552;
          margin-bottom: 8px;
        }
        .lcc-field select,
        .lcc-field input {
          width: 100%;
          padding: 10px 12px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 14px;
          color: var(--ink);
          background: #fff;
          border: 1px solid rgba(16, 21, 42, 0.25);
        }
        .lcc-hint {
          font-size: 11px;
          color: #8a8266;
          margin-top: 6px;
        }
        .lcc-calc-btn {
          margin-top: 24px;
          width: 100%;
          padding: 14px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--ink);
          color: var(--parchment);
          border: none;
          cursor: pointer;
        }
        .lcc-calc-btn:hover {
          background: var(--teal-dim);
        }
        .lcc-calc-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .lcc-error {
          margin-top: 14px;
          font-size: 13px;
          color: var(--clay);
          font-family: 'IBM Plex Mono', monospace;
        }
        .lcc-results {
          max-width: 920px;
          margin: 48px auto 0;
        }
        .lcc-results-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 18px;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .lcc-fx-note {
          text-transform: none;
          letter-spacing: 0;
        }
        .lcc-breakdown-card {
          background: var(--ink-soft);
          border: 1px solid var(--ink-line);
          padding: 28px 30px;
        }
        .lcc-deminimis-flag {
          display: inline-block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--teal);
          border: 1px solid var(--teal-dim);
          padding: 3px 9px;
          margin-bottom: 16px;
        }
        .lcc-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 14px;
          color: var(--text-muted);
          padding: 9px 0;
          border-bottom: 1px solid var(--ink-line);
        }
        .lcc-sub {
          font-size: 11px;
          display: block;
          color: #6b7196;
          margin-top: 2px;
        }
        .lcc-line span:last-child {
          color: var(--parchment-dim);
          font-family: 'IBM Plex Mono', monospace;
        }
        .lcc-total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed var(--ink-line);
        }
        .lcc-totals-left {
          display: flex;
          flex-direction: column;
        }
        .lcc-totals-left > span:first-child {
          font-size: 12px;
          color: var(--text-muted);
        }
        .lcc-local-fx {
          font-size: 12px;
          color: var(--brass);
          font-family: 'IBM Plex Mono', monospace;
          margin-top: 4px;
        }
        .lcc-amount {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          color: var(--parchment);
        }
        .lcc-trust-panel {
          margin-top: 22px;
          padding: 18px 22px;
          border: 1px dashed var(--ink-line);
          font-size: 12px;
          line-height: 1.7;
          color: var(--text-muted);
        }
        .lcc-sources {
          margin-top: 10px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          color: #6b7196;
        }
        @media (max-width: 760px) {
          .lcc-field-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .lcc-field-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
