// pages/guides/index.tsx — CBC Shopping Guides hub
// Three categories: Deals & Sales | Shopping Guides | Shipping Guides.
// Articles are NOT written yet — shown as an honest "coming soon" roadmap
// rather than linked to pages that don't exist, so nothing 404s. As each
// article is written, give it a real route (e.g. /guides/shop-uae-ship-ethiopia)
// and flip its `href` here from null to that path.
import Link from "next/link";
import React, { useState } from "react";
import Head from "next/head";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIChatbotModal from "@/components/AIChatbotModal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crossbordercart.com";

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
};

const shadowSm = "0 2px 10px -4px rgba(15,35,64,0.10)";
const shadowMd = "0 14px 34px -14px rgba(15,35,64,0.20)";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ width: 22, height: 1, background: C.gold }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: C.goldDark, textTransform: "uppercase" }}>{children}</span>
      <span style={{ width: 22, height: 1, background: C.gold }} />
    </div>
  );
}

type Article = { title: string; teaser: string; href: string | null; lastUpdated?: string };
type Category = { key: string; label: string; icon: string; items: Article[] };

const CATEGORIES: Category[] = [
  {
    key: "deals",
    label: "Deals & Sales",
    icon: "🔥",
    items: [
      { title: "Best Times of the Year to Shop UAE Sales", teaser: "A calendar overview of the UAE's major annual sale periods.", href: "/guides/best-times-to-shop-uae-sales", lastUpdated: "Aug 2026" },
      { title: "Dubai Shopping Festival: A Guide for International Shoppers", teaser: "What DSF is and how to shop it from outside the UAE.", href: "/guides/dubai-shopping-festival-guide", lastUpdated: "Aug 2026" },
      { title: "Ramadan & Eid Sales in the UAE", teaser: "What international shoppers should know about timing and promotions.", href: "/guides/ramadan-eid-sales-uae", lastUpdated: "Aug 2026" },
      { title: "UAE Back-to-School Sales 2026", teaser: "What's typically discounted and how forwarding fits in.", href: null },
      { title: "Black Friday / White Friday / Yellow Friday UAE 2026", teaser: "A shopper's guide to the UAE's biggest sale season.", href: null },
      { title: "UAE National Day Shopping Deals 2026", teaser: "What to expect and how to plan your order.", href: null },
    ],
  },
  {
    key: "shopping",
    label: "Shopping Guides",
    icon: "🛍️",
    items: [
      { title: "How to Shop Online in the UAE and Ship to Ethiopia", teaser: "A step-by-step walkthrough for Ethiopian shoppers.", href: "/guides/shop-uae-ship-to-ethiopia" },
      { title: "How to Shop Online in the UAE and Ship to Nigeria", teaser: "A step-by-step walkthrough for Nigerian shoppers.", href: "/guides/shop-uae-ship-to-nigeria" },
      { title: "Noon Yellow Friday: What International Shoppers Should Know", teaser: "An editorial guide — CBC isn't affiliated with Noon.", href: null },
      { title: "Amazon UAE White Friday: Shopping & Forwarding Guide", teaser: "An editorial guide — CBC isn't affiliated with Amazon.", href: null },
      { title: "SHEIN UAE Sales: Sending Your Order to a Dubai Address", teaser: "An editorial guide — CBC isn't affiliated with SHEIN.", href: null },
    ],
  },
  {
    key: "shipping",
    label: "Shipping Guides",
    icon: "📦",
    items: [
      { title: "How Package Forwarding from Dubai Works", teaser: "The mechanics of a UAE address and forwarding, explained plainly.", href: "/guides/how-package-forwarding-works" },
      { title: "Package Consolidation Explained: When Can It Save Costs?", teaser: "When combining packages helps — and when it doesn't.", href: "/guides/package-consolidation-explained" },
      { title: "Actual Weight vs Volumetric Weight", teaser: "Why your shipping price can change even with the same box.", href: "/guides/actual-vs-volumetric-weight" },
      { title: "Can I Ship Electronics from Dubai Internationally?", teaser: "What's generally fine and what needs extra care.", href: "/guides/ship-electronics-from-dubai" },
      { title: "What Can't Be Shipped Internationally from the UAE?", teaser: "A plain-language rundown of common restrictions.", href: "/guides/what-cant-be-shipped-from-uae" },
    ],
  },
];

function ArticleCard({ a }: { a: Article }) {
  const inner = (
    <div style={{
      background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: 22,
      boxShadow: shadowSm, height: "100%", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, lineHeight: 1.4 }}>{a.title}</div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, flex: 1 }}>{a.teaser}</p>
      {a.lastUpdated && (
        <span style={{ fontSize: 10.5, color: C.goldDark, fontWeight: 700 }}>🕒 Updated {a.lastUpdated}</span>
      )}
      {a.href ? (
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.goldDark }}>Read guide →</span>
      ) : (
        <span style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, background: C.ivory, borderRadius: 99, padding: "4px 12px", width: "fit-content" }}>Coming soon</span>
      )}
    </div>
  );
  return a.href ? <Link href={a.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>{inner}</Link> : <div>{inner}</div>;
}

export default function GuidesPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [active, setActive] = useState<string>("shopping");
  const current = CATEGORIES.find((c) => c.key === active)!;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: C.ink }}>
      <Head>
        <title>Shopping Guides – CBC (Cross Border Cart)</title>
        <meta name="description" content="Guides on UAE shopping deals, shopping tips, and shipping from Dubai to Africa — from CBC." />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shopping Guides – CBC" />
        <meta property="og:url" content={`${SITE_URL}/guides`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <SiteHeader />

      {/* ═══ HERO ═══ */}
      <section style={{ background: `linear-gradient(180deg, ${C.ivory} 0%, #fff 100%)`, padding: "clamp(44px, 6vw, 64px) clamp(16px, 4vw, 40px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Shopping Guides</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.9rem, 4vw, 2.7rem)", fontWeight: 600, color: C.navy, marginBottom: 16 }}>
            Shop smarter. Ship simpler.
          </h1>
          <p style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            Deals worth knowing about, tips for shopping UAE stores from abroad, and plain-language answers to shipping questions — all in one place.
          </p>
        </div>
      </section>

      {/* ═══ CATEGORY TABS ═══ */}
      <section style={{ padding: "0 clamp(16px, 4vw, 40px)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: -8, marginBottom: 40 }}>
          {CATEGORIES.map((c) => {
            const isActive = c.key === active;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: isActive ? `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})` : "#fff",
                  color: isActive ? "#fff" : C.navy,
                  border: `1.5px solid ${isActive ? C.navy : C.line}`,
                  borderRadius: 99, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: isActive ? shadowMd : shadowSm,
                }}
              >
                <span>{c.icon}</span>{c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ ARTICLE GRID ═══ */}
      <section style={{ padding: "0 clamp(16px, 4vw, 40px) 30px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="guides-grid">
            {current.items.map((a) => <ArticleCard key={a.title} a={a} />)}
          </div>
          <p style={{ fontSize: 12.5, color: C.muted, textAlign: "center", marginTop: 28, opacity: 0.8 }}>
            We're writing these guides now — check back soon, or ask us on WhatsApp if you need an answer today.
          </p>
        </div>
      </section>

      {/* ═══ MID-PAGE CTA (same pattern every article will use) ═══ */}
      <section style={{ margin: "40px clamp(16px, 4vw, 40px) 80px" }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
          borderRadius: 22, padding: "clamp(28px, 5vw, 44px)", color: "#fff", textAlign: "center",
          boxShadow: shadowMd,
        }}>
          <h2 style={{ fontSize: "clamp(1.3rem, 2.8vw, 1.7rem)", fontWeight: 800, marginBottom: 10 }}>Shopping from outside the UAE?</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: 22, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Get your CBC Dubai address and send eligible UAE purchases to one place before international forwarding.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 14.5, padding: "13px 26px", borderRadius: 12, textDecoration: "none" }}>
              Get My UAE Address →
            </Link>
            <Link href="/#calculator" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 14.5, padding: "13px 24px", borderRadius: 12, textDecoration: "none" }}>
              Calculate Shipping →
            </Link>
          </div>
        </div>
      </section>

      <FloatingChatButton isOpen={chatOpen} onOpen={() => setChatOpen(true)} />
      <AIChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
      <SiteFooter />

      <style jsx global>{`
        .guides-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 860px) { .guides-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .guides-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}