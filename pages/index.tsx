// pages/index.tsx — Cross Border Cart v8
// Adds 4 new sections and reorders the whole homepage:
// Hero -> How It Works -> Calculator -> Recent Shipments (NEW) -> Consolidation (NEW)
// -> Package Control (NEW) -> Categories -> Destinations -> What Can I Ship (NEW)
// -> Trust row -> Reviews -> FAQ -> Final CTA.
// Fraunces stays limited to the hero H1 + final CTA headline only; everything
// else is Inter. Real flag icons (flagcdn.com). No unverified stats/claims.
import Link from "next/link";
import React, { useState } from "react";
import Head from "next/head";
import ReviewsSection from "@/components/ReviewsSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIChatbotModal from "@/components/AIChatbotModal";
import LandedCostCalculator from "@/components/LandedCostCalculator";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crossbordercart.com";

/* ─── brand tokens — deep navy + brass gold, warm ivory paper ─── */
const C = {
  navy: "#0F2340",
  navyDeep: "#081527",
  gold: "#C9A227",
  goldDark: "#A8841A",
  goldSoft: "#F3E7C9",
  ivory: "#FBF8F2",
  bg: "#FFFFFF",
  ink: "#1C2436",
  muted: "#68707F",
  line: "#EAE3D2",
  green: "#1E8E5A",
  greenSoft: "#E7F6EE",
  amber: "#B36B00",
  amberSoft: "#FDF1E0",
};

const shadowSm = "0 2px 10px -4px rgba(15,35,64,0.10)";
const shadowMd = "0 14px 34px -14px rgba(15,35,64,0.20)";

/* ═══ Shared building blocks ═══ */
function NumberBadge({ n }: { n: string }) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
      border: `2px solid ${C.gold}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", fontSize: 22, fontWeight: 800, color: C.gold,
      margin: "0 auto", boxShadow: shadowSm, flexShrink: 0,
    }}>{n}</div>
  );
}

function Step({ n, icon, title, desc }: { n: string; icon: string; title: string; desc: string }) {
  return (
    <div className="step" style={{ textAlign: "center", padding: "0 10px", position: "relative" }}>
      <NumberBadge n={n} />
      <div style={{ fontSize: 20, margin: "14px 0 8px" }}>{icon}</div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{title}</div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div style={{
        width: 50, height: 50, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(155deg, ${C.goldSoft}, #fff)`,
        border: `1px solid ${C.gold}55`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21,
        boxShadow: shadowSm,
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 15.5, fontWeight: 800, color: C.navy, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

function CategoryCard({ icon, name }: { icon: string; name: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", border: `1px solid ${hover ? C.gold : C.line}`,
        borderRadius: 18, padding: "26px 18px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        boxShadow: hover ? shadowMd : shadowSm,
        transform: hover ? "translateY(-3px)" : "none",
        transition: "all .22s ease",
      }}
    >
      <div style={{
        width: 58, height: 58, borderRadius: "50%",
        background: `linear-gradient(155deg, ${C.goldSoft}, #fff)`,
        border: `1px solid ${C.gold}66`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25,
      }}>{icon}</div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, fontWeight: 700, color: C.navy, textAlign: "center" }}>{name}</div>
    </div>
  );
}

function FlagImg({ code, size = 22 }: { code: string; size?: number }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      width={size} height={Math.round(size * 0.73)}
      style={{ borderRadius: 3, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)", objectFit: "cover", display: "block" }}
    />
  );
}

function FlagPill({ code, name, featured }: { code: string; name: string; featured?: boolean }) {
  return (
    <span style={{
      display: "flex", alignItems: "center", gap: 10,
      background: featured ? `linear-gradient(155deg, ${C.goldSoft}, #fff)` : "#fff",
      border: `1.5px solid ${featured ? C.gold : C.line}`,
      borderRadius: 99, padding: "9px 18px 9px 10px",
      fontWeight: 600, fontSize: 14, color: C.navy, boxShadow: shadowSm,
    }}>
      <FlagImg code={code} />
      {name}
    </span>
  );
}

function FAQItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: "#fff", border: `1px solid ${C.line}`,
        borderLeftWidth: 3, borderLeftColor: open ? C.gold : C.line,
        borderRadius: 14, overflow: "hidden", cursor: "pointer",
        boxShadow: open ? shadowMd : shadowSm, transition: "all .2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", gap: 12 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, fontWeight: 700, color: C.navy, flex: 1 }}>{q}</span>
        <span style={{
          width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
          background: open ? C.gold : C.ivory, color: open ? "#fff" : C.muted,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          transform: open ? "rotate(180deg)" : "none", transition: "all .25s",
        }}>⌄</span>
      </div>
      {open && <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.75, padding: "0 22px 20px", margin: 0 }}>{a}</p>}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ width: 22, height: 1, background: C.gold }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: C.goldDark, textTransform: "uppercase" }}>{children}</span>
      <span style={{ width: 22, height: 1, background: C.gold }} />
    </div>
  );
}

/* ═══ NEW: Recent Shipments card ═══
   PLACEHOLDER DATA — replace with real completed shipments before this goes
   live. Never include customer names, phone numbers, or addresses — route,
   weight, and status only. Swap RECENT_SHIPMENTS for a real API/DB pull
   (e.g. GET /api/recent-shipments filtered to isPublicSafe/delivered) when ready. */
type Shipment = { fromCode: string; fromCity: string; toCode: string; toCity: string; weight: string; status: string };
const RECENT_SHIPMENTS: Shipment[] = [
  { fromCode: "ae", fromCity: "Dubai", toCode: "er", toCity: "Asmara", weight: "3.4 kg", status: "Delivered" },
  { fromCode: "ae", fromCity: "Dubai", toCode: "ng", toCity: "Abuja", weight: "1.0 kg", status: "Delivered" },
];

function ShipmentCard({ s }: { s: Shipment }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "18px 20px", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FlagImg code={s.fromCode} size={24} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{s.fromCity}</span>
        <span style={{ color: C.gold, fontSize: 15 }}>→</span>
        <FlagImg code={s.toCode} size={24} />
        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{s.toCity}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ fontSize: 12.5, color: C.muted }}>{s.weight}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: C.green, background: C.greenSoft, borderRadius: 99, padding: "4px 12px" }}>{s.status}</span>
      </div>
    </div>
  );
}

/* ═══ NEW: Consolidation flow diagram ═══ */
function FlowNode({ icon, label, sub, dark }: { icon: string; label: string; sub?: string; dark?: boolean }) {
  return (
    <div style={{
      background: dark ? `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})` : "#fff",
      border: dark ? "none" : `1px solid ${C.line}`,
      borderRadius: 16, padding: "16px 22px", boxShadow: dark ? shadowMd : shadowSm,
      display: "flex", alignItems: "center", gap: 12, minWidth: 220, justifyContent: "center",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: dark ? "#fff" : C.navy }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: dark ? "rgba(255,255,255,0.7)" : C.muted }}>{sub}</div>}
      </div>
    </div>
  );
}
function FlowArrow() {
  return <div style={{ color: C.gold, fontSize: 20, margin: "6px 0", lineHeight: 1 }}>↓</div>;
}

/* ═══ NEW: What Can I Ship checklist ═══ */
type ShipRule = { icon: string; name: string; ok: "yes" | "restricted" | "check" };
const SHIP_ITEMS: ShipRule[] = [
  { icon: "👗", name: "Clothing", ok: "yes" },
  { icon: "👟", name: "Shoes", ok: "yes" },
  { icon: "💻", name: "Laptops", ok: "restricted" },
  { icon: "📱", name: "Phones", ok: "restricted" },
  { icon: "💄", name: "Cosmetics", ok: "restricted" },
  { icon: "🧸", name: "Toys", ok: "yes" },
  { icon: "🏠", name: "Home items", ok: "yes" },
  { icon: "🔋", name: "Batteries", ok: "check" },
];
function ShipRow({ item }: { item: ShipRule }) {
  const badge =
    item.ok === "yes" ? { text: "✓", color: C.green, bg: C.greenSoft } :
    item.ok === "restricted" ? { text: "✓*", color: C.goldDark, bg: C.goldSoft } :
    { text: "Check first", color: C.amber, bg: C.amberSoft };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 18px", boxShadow: shadowSm }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: C.navy }}>
        <span style={{ fontSize: 18 }}>{item.icon}</span>{item.name}
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: badge.color, background: badge.bg, borderRadius: 99, padding: "4px 12px" }}>{badge.text}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function HomePage() {
  const CATEGORIES = [
    { emoji: "📱", name: "Electronics" },
    { emoji: "👗", name: "Fashion & Beauty" },
    { emoji: "🛋️", name: "Home & Living" },
    { emoji: "🏋️", name: "Sports & Fitness" },
    { emoji: "🧸", name: "Toys & Baby" },
    { emoji: "📚", name: "Books & Media" },
    { emoji: "💊", name: "Health & Wellness" },
    { emoji: "🛒", name: "Groceries & Essentials" },
  ];

  const FEATURED_COUNTRIES = [
    { code: "et", name: "Ethiopia" },
    { code: "ke", name: "Kenya" },
    { code: "ng", name: "Nigeria" },
    { code: "ug", name: "Uganda" },
    { code: "gh", name: "Ghana" },
  ];
  const MORE_COUNTRIES = [
    { code: "tz", name: "Tanzania" },
    { code: "rw", name: "Rwanda" },
    { code: "zm", name: "Zambia" },
    { code: "so", name: "Somalia" },
    { code: "za", name: "South Africa" },
    { code: "eg", name: "Egypt" },
    { code: "ma", name: "Morocco" },
  ];

  const [chatOpen, setChatOpen] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: C.ink }}>
      <Head>
        <title>CBC (Cross Border Cart) – Shop from Dubai, delivered to Africa</title>
        <meta name="description" content="CBC gives you a free UAE shipping address so you can shop from Dubai stores and have your packages delivered to your door in Africa." />
        <meta name="keywords" content="CBC, Cross Border Cart, UAE shipping address, Dubai to Africa, package forwarding, ship to Kenya, ship to Ethiopia, ship to Nigeria" />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CBC – Shop from Dubai, delivered to Africa" />
        <meta property="og:description" content="Free UAE address. Shop any Dubai store. We receive, combine and ship your packages to your door in Africa." />
        <meta property="og:image" content={`${SITE_URL}/og-cross-border-cart.png`} />
        <meta property="og:url" content={SITE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CBC – Shop from Dubai, delivered to Africa" />
        <meta name="twitter:description" content="Free UAE address. Shop any Dubai store. We deliver to your door in Africa." />
        <meta name="twitter:image" content={`${SITE_URL}/og-cross-border-cart.png`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <SiteHeader />

      {/* ═══ 1. HERO ═══ */}
      <section style={{ background: `linear-gradient(180deg, ${C.ivory} 0%, #fff 100%)`, padding: "clamp(40px, 6vw, 64px) clamp(16px, 4vw, 40px) 0" }}>
        <div className="hero-grid" style={{ maxWidth: 1160, margin: "0 auto", alignItems: "center" }}>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.goldSoft, border: `1px solid ${C.gold}`, color: C.goldDark, fontSize: 12, fontWeight: 700, padding: "7px 15px", borderRadius: 99, marginBottom: 22 }}>
              📦 CBC — Shop in UAE. We deliver to Africa.
            </span>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2.3rem, 5.5vw, 3.7rem)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.01em", marginBottom: 20, color: C.navy }}>
              Shop UAE.<br />Deliver to <span style={{ color: C.goldDark, fontStyle: "italic" }}>Africa.</span>
            </h1>
            <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.7, maxWidth: 460, marginBottom: 30 }}>
              Get your free CBC address in Dubai, shop from your favourite UAE stores, and let us handle the journey to your door.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 28px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 10px 24px -10px rgba(169,132,26,0.55)" }}>
                📦 Get My UAE Address
              </Link>
              <Link href="/#calculator" style={{ background: "#fff", color: C.navy, border: `1.5px solid ${C.line}`, fontWeight: 700, fontSize: 15, padding: "15px 24px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                🧮 Calculate Shipping
              </Link>
            </div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {["Free UAE address", "Track every step", "WhatsApp support"].map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.muted }}>
                  <span style={{ color: C.goldDark }}>✓</span>{t}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            position: "relative", borderRadius: 22, overflow: "hidden",
            aspectRatio: "4 / 5", border: `1px solid ${C.line}`,
            boxShadow: "0 30px 60px -24px rgba(15,35,64,0.35)",
          }}>
            <img
              src="/images/hero-shopper.jpg"
              alt="Shopper in Dubai with CBC packages ready to ship to Africa"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,21,39,0.35) 0%, transparent 30%)" }} />
          </div>
        </div>
      </section>

      {/* ═══ 2. HOW IT WORKS ═══ */}
      <section style={{ padding: "88px clamp(16px, 4vw, 40px) 60px", background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <Eyebrow>Simple &amp; Secure</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.7rem, 3.5vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 8 }}>From UAE Shopping to Your Door</h2>
            <p style={{ fontSize: 15, color: C.muted }}>Shopping in the UAE is easy. Getting it to Africa is even easier.</p>
          </div>
          <div style={{ position: "relative" }}>
            <div className="steps-connector" style={{ position: "absolute", top: 32, left: "10%", right: "10%", height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}88 15%, ${C.gold}88 85%, transparent)` }} />
            <div className="steps-5-grid">
              <Step n="1" icon="🛍️" title="Shop" desc="Shop from your favourite UAE stores." />
              <Step n="2" icon="📍" title="Send to CBC" desc="Use your personal CBC UAE address at checkout." />
              <Step n="3" icon="🏬" title="We Receive" desc="Your purchases arrive at our Dubai warehouse." />
              <Step n="4" icon="📦" title="Consolidate & Ship" desc="We can consolidate eligible packages into one shipment to simplify delivery and potentially reduce shipping costs." />
              <Step n="5" icon="🏠" title="Delivered" desc="Track your shipment until it reaches your door." />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. SHIPPING CALCULATOR ═══ */}
      <div id="calculator">
        <LandedCostCalculator />
      </div>

      {/* ═══ 4. NEW — RECENT CBC SHIPMENTS ═══ */}
      <section style={{ padding: "72px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 34 }}>
            <Eyebrow>Real Activity</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 8 }}>Recent CBC Shipments</h2>
            <p style={{ fontSize: 14, color: C.muted }}>See how CBC is helping customers ship from the UAE.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
            {RECENT_SHIPMENTS.map((s, i) => <ShipmentCard key={i} s={s} />)}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/login" style={{ fontSize: 13.5, fontWeight: 700, color: C.goldDark, textDecoration: "none", borderBottom: `1px solid ${C.gold}88`, paddingBottom: 2 }}>
              Track a Shipment →
            </Link>
          </div>
          <p style={{ fontSize: 11.5, color: C.muted, opacity: 0.8, textAlign: "center", marginTop: 18 }}>
            Only real, completed shipments are shown here. No customer names, phone numbers or addresses are ever displayed.
          </p>
        </div>
      </section>

      {/* ═══ 5. NEW — CONSOLIDATION ═══ */}
      <section style={{ padding: "76px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Eyebrow>Why CBC</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.3rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 8 }}>Shop Different Stores. Ship Together.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
              <FlowNode icon="👗" label="Fashion Store" />
              <FlowNode icon="💻" label="Electronics Store" />
              <FlowNode icon="🛍️" label="Online Marketplace" />
            </div>
            <FlowArrow />
            <FlowNode icon="🏢" label="Your CBC Dubai Address" dark />
            <FlowArrow />
            <FlowNode icon="📦" label="Consolidated Package" dark />
            <FlowArrow />
            <FlowNode icon="✈️" label="Delivered to You" dark />
          </div>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 540, margin: "36px auto 16px", textAlign: "center" }}>
            Send eligible purchases from different UAE stores to your CBC address. Once they arrive, you can request consolidation before international shipping.
          </p>
          <div style={{ textAlign: "center" }}>
            <Link href="/consolidation" style={{ fontSize: 13.5, fontWeight: 700, color: C.goldDark, textDecoration: "none", borderBottom: `1px solid ${C.gold}88`, paddingBottom: 2 }}>
              Learn How Consolidation Works →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 6. NEW — YOUR CBC DASHBOARD / PACKAGE CONTROL ═══ */}
      <section style={{ padding: "76px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Eyebrow>Your CBC Dashboard</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy }}>Your Package. You're in Control.</h2>
          </div>
          <p style={{ fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 1.7, marginBottom: 26 }}>
            Once your order arrives at CBC, see its weight, dimensions and package photos before deciding what to do next.
          </p>

          {/* Illustrative example package — not a real customer's shipment.
              The three actions below are real, live dashboard functionality;
              they link to /login so a visitor can see it for themselves. */}
          <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 26, boxShadow: shadowMd }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Package</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>CBC-1042</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.goldDark, background: C.goldSoft, borderRadius: 99, padding: "6px 14px" }}>Ready to Ship</span>
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Weight</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>2.4 kg</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Dimensions</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>35 × 24 × 18 cm</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ width: 44, height: 44, borderRadius: 10, background: C.ivory, border: `1px dashed ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📷</div>
              ))}
              <span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>Package Photos</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/login" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 13.5, padding: "12px", borderRadius: 10, textAlign: "center", textDecoration: "none" }}>Get Shipping Options</Link>
              <Link href="/login" style={{ background: C.ivory, border: `1px solid ${C.line}`, color: C.navy, fontWeight: 700, fontSize: 13.5, padding: "12px", borderRadius: 10, textAlign: "center", textDecoration: "none" }}>Consolidate</Link>
              <Link href="/login" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.muted, fontWeight: 700, fontSize: 13.5, padding: "12px", borderRadius: 10, textAlign: "center", textDecoration: "none" }}>Hold Package</Link>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginTop: 22, lineHeight: 1.7 }}>
            Once your purchase reaches CBC, you'll be able to see your package details and decide what happens next.
          </p>
        </div>
      </section>

      {/* ═══ 7. SHOP UAE CATEGORIES ═══ */}
      <section style={{ padding: "72px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>What you can order</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 8 }}>Shop from UAE stores</h2>
            <p style={{ fontSize: 14, color: C.muted, maxWidth: 480, margin: "0 auto" }}>
              Use your CBC Dubai address when shopping with participating UAE retailers and marketplaces — here are a few popular categories as examples.
            </p>
          </div>
          <div className="cats-4-grid">
            {CATEGORIES.map((s) => <CategoryCard key={s.name} icon={s.emoji} name={s.name} />)}
          </div>
          <p style={{ fontSize: 11.5, color: C.muted, opacity: 0.8, textAlign: "center", marginTop: 22 }}>
            Categories shown as examples only. CBC is not affiliated with or endorsed by any specific retailer.
          </p>
        </div>
      </section>

      {/* ═══ 8. WHERE WE DELIVER ═══ */}
      <section style={{ padding: "72px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>From UAE to Africa</Eyebrow>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 30 }}>Where We Deliver</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {FEATURED_COUNTRIES.map((d) => <FlagPill key={d.name} code={d.code} name={d.name} featured />)}
            {showAllCountries && MORE_COUNTRIES.map((d) => <FlagPill key={d.name} code={d.code} name={d.name} />)}
          </div>
          <button
            onClick={() => setShowAllCountries((v) => !v)}
            style={{ marginTop: 22, background: "none", border: "none", color: C.goldDark, fontWeight: 700, fontSize: 13, cursor: "pointer", borderBottom: `1px solid ${C.gold}88`, paddingBottom: 2 }}
          >
            {showAllCountries ? "Show fewer destinations ↑" : `View all destinations (+${MORE_COUNTRIES.length}) ↓`}
          </button>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 26 }}>
            Expanding soon to the <strong style={{ color: C.navy }}>Middle East</strong> and <strong style={{ color: C.navy }}>South Asia</strong> — check back or ask us on WhatsApp for the latest.
          </p>
        </div>
      </section>

      {/* ═══ 9. NEW — WHAT CAN I SHIP ═══ */}
      <section style={{ padding: "72px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Eyebrow>Good to know</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy }}>Wondering if you can ship it?</h2>
          </div>
          <div className="ship-2-grid">
            {SHIP_ITEMS.map((it) => <ShipRow key={it.name} item={it} />)}
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
            * Some products are subject to airline, carrier, customs or destination-country restrictions.
          </p>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button
              onClick={() => setChatOpen(true)}
              style={{ background: C.navy, color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 26px", borderRadius: 12, border: "none", cursor: "pointer" }}
            >
              Check an Item →
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 10. TRUST ROW ═══ */}
      <section style={{ padding: "60px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div className="trust-3-grid" style={{ maxWidth: 1000, margin: "0 auto" }}>
          <TrustItem icon="📷" title="Photos of every package" desc="We photograph every parcel at our Dubai warehouse, so you see what arrived before you ship it." />
          <TrustItem icon="📍" title="Track without login" desc="Follow your shipment step by step — and share the tracking link with family back home." />
          <TrustItem icon="💬" title="Real WhatsApp support" desc="Talk to real people who know your route, in your language." />
        </div>
      </section>

      {/* ═══ 11. REAL CUSTOMER REVIEWS ═══ */}
      <section style={{ padding: "72px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <ReviewsSection />
        </div>
      </section>

      {/* ═══ 12. FAQ ═══ */}
      <section style={{ padding: "72px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 8 }}>Common questions</h2>
            <p style={{ fontSize: 14, color: C.muted }}>Everything you need to know before you start shipping.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FAQItem defaultOpen q="Is it really free to create an account?" a="Yes. Opening a CBC account and getting your UAE address is free. You only pay when you actually ship a package." />
            <FAQItem q="Which countries can I ship to?" a="We currently ship from the UAE to Ethiopia, Kenya, Nigeria, Uganda, Ghana and several other African destinations — see the full list above. We're expanding to the Middle East and South Asia soon." />
            <FAQItem q="Can I see photos of my packages?" a="Yes. We photograph every parcel that arrives at our warehouse so you can check contents and condition before you choose to ship." />
            <FAQItem q="Can I combine multiple orders?" a="Yes. Consolidating multiple packages into one shipment can reduce your overall shipping cost compared to sending them separately — get an exact quote for your packages above." />
            <FAQItem q="How long does shipping take?" a="Delivery time depends on your destination and the shipping option you choose. Use the calculator above for an estimate for your specific route, or ask us on WhatsApp." />
          </div>
        </div>
      </section>

      {/* ═══ 13. FINAL CTA ═══ */}
      <section style={{ margin: "0 clamp(16px, 4vw, 40px) 80px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
          borderRadius: 28, padding: "clamp(36px, 6vw, 60px) clamp(20px, 4vw, 48px)",
          color: "#fff", textAlign: "center", position: "relative", overflow: "hidden",
          boxShadow: shadowMd,
        }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% -10%, ${C.gold}22, transparent 55%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)", fontWeight: 600, marginBottom: 12 }}>Your UAE shopping address starts here</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: 28, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              Create your free CBC account and your UAE address is ready right away — no credit card needed.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 30px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Get My UAE Address
              </Link>
              <Link href="/login" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 15, padding: "15px 26px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Track a Shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FloatingChatButton isOpen={chatOpen} onOpen={() => setChatOpen(true)} />
      <AIChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
      <SiteFooter />

      <style jsx global>{`
        html { scroll-behavior: smooth; }
        body { background: #ffffff !important; }

        .hero-grid      { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; }
        .steps-5-grid   { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; position: relative; }
        .cats-4-grid    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .trust-3-grid   { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
        .ship-2-grid    { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 640px) {
          .steps-5-grid    { grid-template-columns: 1fr; gap: 32px; }
          .steps-connector { display: none !important; }
          .cats-4-grid     { grid-template-columns: repeat(2, 1fr); }
          .trust-3-grid    { grid-template-columns: 1fr; gap: 22px; }
          .ship-2-grid     { grid-template-columns: 1fr; }
          h1, h2, h3 { word-break: keep-all; hyphens: none; }
        }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
      `}</style>
    </div>
  );
}