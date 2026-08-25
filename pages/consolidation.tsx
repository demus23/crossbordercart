// pages/consolidation.tsx — Cross Border Cart
// Educates customers on consolidation before they request it. Deliberately
// cautious on two points per Nati's review: (1) never promises consolidation
// saves money — final cost depends on actual/volumetric weight, destination,
// carrier; (2) does NOT claim CBC removes/repacks retail packaging, since that
// wasn't confirmed as an actual CBC process — phrased generically instead.
// Reuses the same design tokens as pages/index.tsx (navy + brass gold, Inter,
// Fraunces reserved for the hero headline only).
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
  green: "#1E8E5A",
  greenSoft: "#E7F6EE",
  amber: "#B36B00",
  amberSoft: "#FDF1E0",
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

function NumberBadge({ n }: { n: string }) {
  return (
    <div style={{
      width: 52, height: 52, borderRadius: "50%",
      background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
      border: `2px solid ${C.gold}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif", fontSize: 18, fontWeight: 800, color: C.gold,
      flexShrink: 0, boxShadow: shadowSm,
    }}>{n}</div>
  );
}

function WorkStep({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
      <NumberBadge n={n} />
      <div>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: C.navy, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

function ListCard({ title, items, tone }: { title: string; items: string[]; tone: "ok" | "check" }) {
  const color = tone === "ok" ? C.green : C.amber;
  const bg = tone === "ok" ? C.greenSoft : C.amberSoft;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, boxShadow: shadowSm }}>
      <div style={{ display: "inline-block", fontSize: 12, fontWeight: 700, color, background: bg, borderRadius: 99, padding: "5px 14px", marginBottom: 16 }}>{title}</div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <li key={it} style={{ fontSize: 14, color: C.ink, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ color, fontWeight: 900 }}>{tone === "ok" ? "✓" : "•"}</span>{it}
          </li>
        ))}
      </ul>
    </div>
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
        <span style={{ fontSize: 14.5, fontWeight: 700, color: C.navy, flex: 1 }}>{q}</span>
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

export default function ConsolidationPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: C.ink }}>
      <Head>
        <title>How Consolidation Works – CBC (Cross Border Cart)</title>
        <meta name="description" content="Learn how CBC package consolidation works: combine eligible purchases from different UAE stores into one shipment before it ships to Africa." />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="How Consolidation Works – CBC" />
        <meta property="og:description" content="Combine eligible purchases from different UAE stores into one shipment with CBC." />
        <meta property="og:url" content={`${SITE_URL}/consolidation`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <SiteHeader />

      {/* ═══ HERO ═══ */}
      <section style={{ background: `linear-gradient(180deg, ${C.ivory} 0%, #fff 100%)`, padding: "clamp(48px, 7vw, 76px) clamp(16px, 4vw, 40px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Consolidation</Eyebrow>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 600, lineHeight: 1.15, color: C.navy, marginBottom: 18 }}>
            Combine Your Packages. Ship Smarter.
          </h1>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, maxWidth: 560, margin: "0 auto 30px" }}>
            Shopping from multiple UAE stores? Send your eligible purchases to your CBC Dubai address and request consolidation. We'll combine them where possible into a more convenient shipment for international delivery.
          </p>
          <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 30px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 10px 24px -10px rgba(169,132,26,0.55)" }}>
            Get My UAE Address
          </Link>
        </div>
      </section>

      {/* ═══ HOW CONSOLIDATION WORKS — 6 STEPS ═══ */}
      <section style={{ padding: "68px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <Eyebrow>The Process</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy }}>How Consolidation Works</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <WorkStep n="1" title="Shop from different stores" desc="Use your CBC Dubai address when ordering from UAE retailers." />
            <WorkStep n="2" title="We receive your packages" desc="Each package is received and recorded by CBC." />
            <WorkStep n="3" title="Choose the packages" desc="Select eligible packages you want to ship together." />
            <WorkStep n="4" title="CBC consolidates them" desc="Where practical and permitted, we repack the selected items into fewer packages." />
            <WorkStep n="5" title="Get your shipping options" desc="The consolidated shipment is weighed and measured so you can see the applicable shipping options." />
            <WorkStep n="6" title="Ship to your destination" desc="Choose your option, pay, and track the shipment to your destination." />
          </div>
        </div>
      </section>

      {/* ═══ BEFORE & AFTER ═══ */}
      <section style={{ padding: "68px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>Before &amp; After</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy }}>What Consolidation Looks Like</h2>
          </div>
          <div className="ba-grid">
            <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 26, boxShadow: shadowSm, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 18 }}>Before</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Package 1", "Package 2", "Package 3"].map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", background: C.ivory, border: `1px dashed ${C.line}`, borderRadius: 12, padding: "12px 16px" }}>
                    <span style={{ fontSize: 18 }}>📦</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: C.navy }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, color: C.gold }} className="ba-arrow">→</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.goldDark, marginTop: 4, whiteSpace: "nowrap" }}>CBC Consolidation</div>
              </div>
            </div>
            <div style={{ background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`, borderRadius: 18, padding: 26, boxShadow: shadowMd, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 18 }}>After</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px" }}>
                <span style={{ fontSize: 22 }}>📦</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>One consolidated shipment</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, maxWidth: 600, margin: "32px auto 0", textAlign: "center" }}>
            Consolidation can reduce unnecessary outer packaging and make multiple purchases easier to manage. Whether it reduces your shipping cost depends on the final actual or volumetric weight, destination and carrier.
          </p>
        </div>
      </section>

      {/* ═══ WHAT CAN BE CONSOLIDATED ═══ */}
      <section style={{ padding: "68px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>Eligibility</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy }}>What Can Be Consolidated?</h2>
          </div>
          <div className="wc-grid">
            <ListCard tone="ok" title="Usually suitable" items={["Clothing", "Shoes", "Books", "Small accessories", "Compatible household items"]} />
            <ListCard tone="check" title="May require special handling" items={["Electronics", "Batteries", "Liquids", "Cosmetics", "Fragile products", "Oversized goods"]} />
          </div>
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", marginTop: 24, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Eligibility depends on the product, packaging, carrier requirements and destination-country rules.
          </p>
        </div>
      </section>

      {/* ═══ PACKAGING — deliberately cautious, no repacking claim confirmed ═══ */}
      <section style={{ padding: "60px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 10 }}>About Packaging</h3>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>
            As part of consolidation, our team focuses on combining your eligible packages into fewer shipments where practical. If you have specific requirements or questions about how your items will be packaged, ask our team before you request consolidation.
          </p>
        </div>
      </section>

      {/* ═══ WHEN NOT TO CONSOLIDATE ═══ */}
      <section style={{ padding: "60px clamp(16px, 4vw, 40px)", background: "#fff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <Eyebrow>Worth Knowing</Eyebrow>
          <h2 style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 14 }}>When Consolidation Might Not Be Best</h2>
          <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.8, marginBottom: 20 }}>
            Consolidation isn't always the cheapest or safest option. Fragile items, oversized goods, restricted products or items with significantly different handling requirements may be better shipped separately.
          </p>
          <button
            onClick={() => setChatOpen(true)}
            style={{ background: C.navy, color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 26px", borderRadius: 12, border: "none", cursor: "pointer" }}
          >
            Not sure? Ask CBC before consolidating
          </button>
        </div>
      </section>

      {/* ═══ CONSOLIDATION FAQ ═══ */}
      <section style={{ padding: "68px clamp(16px, 4vw, 40px)", background: C.ivory }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>FAQ</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy }}>Consolidation FAQ</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FAQItem
              defaultOpen
              q="Does consolidation always save money?"
              a="No. International shipping can be calculated using actual or volumetric weight. Consolidation may reduce unnecessary packaging, but the final shipping price depends on the resulting package."
            />
            <FAQItem
              q="Can every item be consolidated?"
              a="No. Some items may need to remain separate because of safety, carrier or customs requirements."
            />
            <FAQItem
              q="Can I consolidate orders from different stores?"
              a="Yes, provided the packages and contents are eligible for consolidation."
            />
            <FAQItem
              q="Can I see my packages before consolidation?"
              a="Yes. We photograph every package that arrives at our warehouse, so you can review contents and condition before deciding whether to consolidate."
            />
            <FAQItem
              q="Will you throw away the original boxes?"
              a="This depends on the specific packages involved. If you have a preference about your original packaging, let our team know before you request consolidation."
            />
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ margin: "0 clamp(16px, 4vw, 40px) 80px" }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
          borderRadius: 26, padding: "clamp(36px, 6vw, 54px) clamp(20px, 4vw, 48px)",
          color: "#fff", textAlign: "center", position: "relative", overflow: "hidden",
          boxShadow: shadowMd,
        }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% -10%, ${C.gold}22, transparent 55%)`, pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", fontWeight: 600, marginBottom: 12 }}>Ready to Start Shopping?</h2>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: 26, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              Get your CBC Dubai address. Shop from the UAE. We'll handle the journey from there.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 15, padding: "15px 28px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Get My UAE Address
              </Link>
              <Link href="/#calculator" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 15, padding: "15px 24px", borderRadius: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Calculate Shipping
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
        .wc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        .ba-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: stretch; }
        @media (max-width: 700px) {
          .wc-grid { grid-template-columns: 1fr; }
          .ba-grid { grid-template-columns: 1fr; }
          .ba-arrow { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  );
}