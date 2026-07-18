// lib/africaShippingData.ts
//
// Central content source for all /ship-to/[country] pages.
// Zones are matched to the current Aramex Express zone table (Part C1 rate card).
// Pricing fields are intentionally left as `null` placeholders — fill these in with
// YOUR retail price (Aramex/Emirates Post cost + your margin), never the raw carrier
// wholesale rate. Delivery-time ranges are typical for the service type; confirm
// against your live carrier agreements before publishing.

export type Region = "East Africa" | "West Africa" | "Southern Africa" | "North Africa" | "Horn of Africa";

export interface FAQItem {
  q: string;
  a: string;
}

export interface CountryShippingInfo {
  slug: string;
  name: string;
  region: Region;
  flagEmoji: string;
  aramexZone: number;
  express: {
    days: string; // e.g. "3-5 business days"
    priceFromAED: number | null; // YOUR retail starting price, not carrier cost
  };
  economy: {
    days: string; // e.g. "12-25 business days"
    priceFromAED: number | null; // YOUR retail starting price via Emirates Post economy
  };
  heroBlurb: string; // one-line, destination-specific — avoid generic copy
  popularItems: string[];
  customsNotes: string[];
  faqs: FAQItem[];
  metaTitle: string;
  metaDescription: string;
}

export const africaShippingData: CountryShippingInfo[] = [
  // ---------- EAST AFRICA ----------
  {
    slug: "kenya",
    name: "Kenya",
    region: "East Africa",
    flagEmoji: "🇰🇪",
    aramexZone: 5,
    express: { days: "3-5 business days", priceFromAED: null },
    economy: { days: "12-25 business days", priceFromAED: null },
    heroBlurb: "Send parcels from the UAE straight to Nairobi, Mombasa and beyond — tracked door to door.",
    popularItems: ["Electronics & phone accessories", "Clothing & shoes", "Baby items", "Small business stock (salon, boutique supplies)"],
    customsNotes: [
      "Personal gifts under a set value threshold typically clear with minimal duty — always confirm current KRA thresholds before shipping.",
      "Electronics may require original packaging/proof of purchase for smoother clearance.",
      "Commercial quantities (multiples of the same item) are usually treated as business imports, not personal gifts.",
    ],
    faqs: [
      { q: "How long does shipping to Kenya take from the UAE?", a: "Express shipments typically arrive in 3-5 business days. Our economy option takes longer but costs significantly less — ideal for non-urgent items." },
      { q: "Can I send electronics to Kenya?", a: "Yes, most personal electronics are fine. Keep original packaging and receipts handy in case customs requests them." },
      { q: "Is there a weight limit?", a: "Standard parcels go up to 30kg. For anything heavier, contact us for a freight quote." },
    ],
    metaTitle: "Ship to Kenya from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send packages from the UAE to Kenya with full tracking. Express (3-5 days) and budget-friendly economy options to Nairobi, Mombasa and nationwide.",
  },
  {
    slug: "uganda",
    name: "Uganda",
    region: "East Africa",
    flagEmoji: "🇺🇬",
    aramexZone: 5,
    express: { days: "3-6 business days", priceFromAED: null },
    economy: { days: "14-28 business days", priceFromAED: null },
    heroBlurb: "Door-to-door shipping from the UAE to Kampala and across Uganda, with live tracking the whole way.",
    popularItems: ["Mobile phones & accessories", "Clothing", "Household goods", "Documents & certificates"],
    customsNotes: [
      "Personal-use items under the local duty-free threshold usually clear faster.",
      "New, unused items in original packaging are processed more smoothly than used goods.",
      "Some electronics may need serial number declarations — check before shipping high-value items.",
    ],
    faqs: [
      { q: "How much does it cost to ship to Uganda?", a: "It depends on weight and whether you choose express or economy — use our calculator for an instant quote." },
      { q: "Do you deliver outside Kampala?", a: "Yes, we deliver nationwide, though delivery to areas outside major cities may take a little longer." },
    ],
    metaTitle: "Ship to Uganda from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Reliable UAE to Uganda parcel shipping with full tracking. Compare express and economy options to Kampala and nationwide.",
  },
  {
    slug: "tanzania",
    name: "Tanzania",
    region: "East Africa",
    flagEmoji: "🇹🇿",
    aramexZone: 5,
    express: { days: "3-6 business days", priceFromAED: null },
    economy: { days: "14-28 business days", priceFromAED: null },
    heroBlurb: "Ship from the UAE to Dar es Salaam, Zanzibar and across Tanzania with tracked, doorstep delivery.",
    popularItems: ["Clothing & textiles", "Electronics", "Business samples", "Gifts for family"],
    customsNotes: [
      "Zanzibar shipments may route through an additional local clearance step — factor in a little extra time.",
      "Duty-free personal allowances apply below a set value; commercial quantities are taxed differently.",
    ],
    faqs: [
      { q: "Can you ship to Zanzibar specifically?", a: "Yes — Zanzibar is served, though transit can take slightly longer than mainland Dar es Salaam." },
      { q: "What's the difference between express and economy?", a: "Express moves by air and arrives faster; economy is a more affordable postal-based service for non-urgent shipments." },
    ],
    metaTitle: "Ship to Tanzania from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send parcels from the UAE to Tanzania, including Dar es Salaam and Zanzibar. Tracked express and economy shipping options.",
  },
  {
    slug: "rwanda",
    name: "Rwanda",
    region: "East Africa",
    flagEmoji: "🇷🇼",
    aramexZone: 5,
    express: { days: "4-6 business days", priceFromAED: null },
    economy: { days: "14-28 business days", priceFromAED: null },
    heroBlurb: "Send packages from the UAE to Kigali and beyond — simple, tracked, and reliable.",
    popularItems: ["Clothing", "Electronics", "Documents", "Small commercial goods"],
    customsNotes: [
      "Rwanda enforces strict rules on used clothing imports in commercial quantities — check current regulations if shipping bulk secondhand items.",
      "Personal gifts under the local threshold are typically duty-free.",
    ],
    faqs: [
      { q: "How long does shipping to Rwanda take?", a: "Express typically takes 4-6 business days; economy is slower but more affordable." },
    ],
    metaTitle: "Ship to Rwanda from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "UAE to Rwanda parcel shipping with tracking. Express and economy options to Kigali and nationwide.",
  },
  {
    slug: "ethiopia",
    name: "Ethiopia",
    region: "Horn of Africa",
    flagEmoji: "🇪🇹",
    aramexZone: 5,
    express: { days: "3-6 business days", priceFromAED: null },
    economy: { days: "14-30 business days", priceFromAED: null },
    heroBlurb: "Ship from the UAE to Addis Ababa and across Ethiopia with full tracking, door to door.",
    popularItems: ["Electronics", "Clothing", "Baby & household items", "Business supplies"],
    customsNotes: [
      "Ethiopia's customs process can take longer than other East African destinations — factor extra time into delivery expectations.",
      "Currency/foreign exchange declarations may apply to high-value commercial shipments.",
    ],
    faqs: [
      { q: "Why does shipping to Ethiopia sometimes take longer?", a: "Customs clearance timelines in Ethiopia can vary more than neighboring countries — we build this into our delivery estimates." },
    ],
    metaTitle: "Ship to Ethiopia from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send packages from the UAE to Ethiopia, including Addis Ababa. Tracked express and economy shipping options.",
  },
  {
    slug: "somalia",
    name: "Somalia",
    region: "Horn of Africa",
    flagEmoji: "🇸🇴",
    aramexZone: 5,
    express: { days: "5-8 business days", priceFromAED: null },
    economy: { days: "N/A — express only", priceFromAED: null },
    heroBlurb: "Reliable UAE to Somalia shipping for one of the strongest diaspora shipping corridors from the Gulf.",
    popularItems: ["Electronics", "Clothing", "Household goods", "Commercial stock"],
    customsNotes: [
      "Somalia is typically served via express/courier network rather than economy postal service — confirm current service availability before quoting.",
      "Delivery timelines can vary more by city/region — Mogadishu vs other regions may differ.",
    ],
    faqs: [
      { q: "Is economy shipping available to Somalia?", a: "Economy postal service coverage to Somalia is limited — express is typically the reliable option for this destination." },
    ],
    metaTitle: "Ship to Somalia from UAE | Reliable Tracked Delivery — CrossBorderCart",
    metaDescription: "Send parcels from the UAE to Somalia with tracked delivery. Serving Mogadishu and beyond.",
  },

  // ---------- MAJOR / OTHER KEY MARKETS ----------
  {
    slug: "nigeria",
    name: "Nigeria",
    region: "West Africa",
    flagEmoji: "🇳🇬",
    aramexZone: 4,
    express: { days: "3-5 business days", priceFromAED: null },
    economy: { days: "12-25 business days", priceFromAED: null },
    heroBlurb: "Ship from the UAE to Lagos, Abuja and across Nigeria — Africa's largest diaspora shipping corridor.",
    popularItems: ["Electronics & phones", "Fashion & shoes", "Business inventory", "Auto parts"],
    customsNotes: [
      "Nigeria Customs applies duty based on item category and value — commercial-quantity shipments are assessed differently from personal gifts.",
      "Accurate, itemized invoices speed up clearance significantly and reduce the risk of delays.",
      "Some electronics and used goods categories face additional scrutiny — check restricted items before shipping.",
    ],
    faqs: [
      { q: "How much does it cost to ship to Lagos from the UAE?", a: "Cost depends on weight and service tier — use our calculator for an instant quote covering both express and economy." },
      { q: "Do you deliver to Abuja and other cities, not just Lagos?", a: "Yes, we deliver nationwide across Nigeria." },
      { q: "What documents do I need for a business shipment?", a: "An itemized commercial invoice is required for anything beyond personal gifts — we can guide you through this." },
    ],
    metaTitle: "Ship to Nigeria from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send packages from the UAE to Nigeria, including Lagos and Abuja, with full tracking. Compare express and economy shipping rates.",
  },
  {
    slug: "ghana",
    name: "Ghana",
    region: "West Africa",
    flagEmoji: "🇬🇭",
    aramexZone: 5,
    express: { days: "3-5 business days", priceFromAED: null },
    economy: { days: "12-25 business days", priceFromAED: null },
    heroBlurb: "Send parcels from the UAE to Accra, Kumasi and across Ghana — tracked and reliable.",
    popularItems: ["Electronics", "Clothing", "Cosmetics & personal care", "Business samples"],
    customsNotes: [
      "Ghana applies duty based on CIF value (cost, insurance, freight) — accurate declared values matter for smooth clearance.",
      "Personal gifts under the duty-free threshold clear faster than commercial shipments.",
    ],
    faqs: [
      { q: "Can I track my shipment to Ghana in real time?", a: "Yes — every shipment includes live tracking with WhatsApp status updates, no login required." },
    ],
    metaTitle: "Ship to Ghana from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "UAE to Ghana parcel shipping with tracking. Send to Accra, Kumasi and nationwide with express or economy service.",
  },
  {
    slug: "south-africa",
    name: "South Africa",
    region: "Southern Africa",
    flagEmoji: "🇿🇦",
    aramexZone: 6,
    express: { days: "4-6 business days", priceFromAED: null },
    economy: { days: "15-30 business days", priceFromAED: null },
    heroBlurb: "Ship from the UAE to Johannesburg, Cape Town, Durban and across South Africa.",
    popularItems: ["Electronics", "Fashion", "Business goods", "Personal effects"],
    customsNotes: [
      "South Africa Revenue Service (SARS) applies VAT and duty on most imports above a low value threshold — nearly all commercial shipments are dutiable.",
      "Accurate invoices with HS codes reduce clearance delays significantly.",
    ],
    faqs: [
      { q: "Is South Africa more expensive to ship to than East Africa?", a: "Rates vary by carrier zone — use our calculator to compare express vs economy pricing for your specific shipment." },
    ],
    metaTitle: "Ship to South Africa from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send packages from the UAE to South Africa, including Johannesburg and Cape Town. Tracked express and economy shipping.",
  },
  {
    slug: "egypt",
    name: "Egypt",
    region: "North Africa",
    flagEmoji: "🇪🇬",
    aramexZone: 4,
    express: { days: "2-4 business days", priceFromAED: null },
    economy: { days: "10-20 business days", priceFromAED: null },
    heroBlurb: "Fast, tracked shipping from the UAE to Cairo, Alexandria and across Egypt.",
    popularItems: ["Electronics", "Clothing", "Documents", "Gifts"],
    customsNotes: [
      "Egypt has a relatively short air transit time from the UAE — express is a strong option for time-sensitive shipments.",
      "Duty applies above a set personal-use threshold; commercial invoices are required for business shipments.",
    ],
    faqs: [
      { q: "How fast can I ship to Cairo?", a: "Express typically arrives in 2-4 business days thanks to the short flight distance." },
    ],
    metaTitle: "Ship to Egypt from UAE | Fast Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send parcels from the UAE to Egypt, including Cairo and Alexandria, with tracked express and economy delivery.",
  },
  {
    slug: "morocco",
    name: "Morocco",
    region: "North Africa",
    flagEmoji: "🇲🇦",
    aramexZone: 6,
    express: { days: "4-7 business days", priceFromAED: null },
    economy: { days: "15-30 business days", priceFromAED: null },
    heroBlurb: "Ship from the UAE to Casablanca, Rabat and across Morocco with full tracking.",
    popularItems: ["Electronics", "Clothing", "Cosmetics", "Gifts"],
    customsNotes: [
      "Morocco applies duty and VAT on most commercial imports — personal gifts under the threshold typically clear more easily.",
    ],
    faqs: [
      { q: "Do you ship to cities beyond Casablanca?", a: "Yes, we cover Morocco nationwide including Rabat, Marrakech and Fes." },
    ],
    metaTitle: "Ship to Morocco from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "UAE to Morocco parcel shipping with tracking. Send to Casablanca, Rabat and nationwide.",
  },
  {
    slug: "zambia",
    name: "Zambia",
    region: "Southern Africa",
    flagEmoji: "🇿🇲",
    aramexZone: 5,
    express: { days: "4-7 business days", priceFromAED: null },
    economy: { days: "15-30 business days", priceFromAED: null },
    heroBlurb: "Send packages from the UAE to Lusaka and across Zambia — tracked door to door.",
    popularItems: ["Electronics", "Clothing", "Household items", "Business samples"],
    customsNotes: [
      "Personal-use items under the duty-free threshold typically clear faster than commercial shipments.",
    ],
    faqs: [
      { q: "How long does shipping to Zambia take?", a: "Express typically takes 4-7 business days; economy is slower but more budget-friendly." },
    ],
    metaTitle: "Ship to Zambia from UAE | Express & Economy Rates — CrossBorderCart",
    metaDescription: "Send parcels from the UAE to Zambia, including Lusaka. Tracked express and economy shipping options.",
  },
];

export function getCountryBySlug(slug: string): CountryShippingInfo | undefined {
  return africaShippingData.find((c) => c.slug === slug);
}

export function getAllCountrySlugs(): string[] {
  return africaShippingData.map((c) => c.slug);
}

export function getCountriesByRegion(): Record<Region, CountryShippingInfo[]> {
  return africaShippingData.reduce((acc, country) => {
    if (!acc[country.region]) acc[country.region] = [];
    acc[country.region].push(country);
    return acc;
  }, {} as Record<Region, CountryShippingInfo[]>);
}