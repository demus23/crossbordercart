// pages/about.tsx — CBC design system v2 (was Bootstrap + teal, now navy/gold)
// Same content structure as the original (hero, 4-step summary, "why we
// built it", CTA, testimonials) — reskinned to match the rest of the site.
// NOTE: keeps the existing Testimonials component import. Worth checking
// whether it shows real customer testimonials — if it's placeholder content
// like the ones removed from the homepage earlier, it should either be
// replaced with ReviewsSection (used elsewhere on the site) or removed.
import React from "react";
import SEO from "@/components/SEO";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Testimonials from "@/components/marketing/Testimonials";

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
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ width: 22, height: 1, background: C.gold }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: C.goldDark, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

const STEPS = [
  { step: "1", title: "Create your free account", text: "Sign up and receive your personal CBC Dubai address and customer suite number." },
  { step: "2", title: "Shop from online stores", text: "Use your CBC address as the delivery address when buying from eligible UAE stores." },
  { step: "3", title: "We receive and prepare", text: "We receive your parcels, log them into your dashboard, and help you consolidate where eligible." },
  { step: "4", title: "Ship to your country", text: "Choose your shipping option, complete payment, and track delivery from our warehouse to your destination." },
];

export default function AboutPage() {
  return (
    <>
      <SEO
  title="About Us | CBC (Cross Border Cart)"
  description="Learn about CBC, how our package forwarding service works, and why we built it for shoppers across Africa."
  path="/about"
/>

      <SiteHeader />

      <main style={{ background: C.bg, minHeight: "100vh", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: C.ink }}>

        {/* ═══ HERO ═══ */}
        <section style={{ background: `linear-gradient(180deg, ${C.ivory} 0%, #fff 100%)`, padding: "clamp(44px, 6vw, 64px) clamp(16px, 4vw, 40px)" }}>
          <div className="about-hero-grid" style={{ maxWidth: 1140, margin: "0 auto", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.goldSoft, border: `1px solid ${C.gold}`, color: C.goldDark, fontSize: 12, fontWeight: 700, padding: "7px 15px", borderRadius: 99, marginBottom: 20 }}>
                About CBC
              </span>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 600, lineHeight: 1.15, color: C.navy, marginBottom: 18 }}>
                Shop the world.<br /><span style={{ color: C.goldDark, fontStyle: "italic" }}>We handle the rest.</span>
              </h1>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, maxWidth: 480, marginBottom: 22 }}>
                CBC is your bridge between UAE online stores and your home country. We give you a Dubai delivery address, receive your orders, help you consolidate eligible shipments, and send them on with tracking and transparent pricing.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px", display: "flex", flexDirection: "column", gap: 9 }}>
                {["Personal CBC Dubai address", "Package receiving and consolidation", "Delivery to Africa, with more destinations coming", "Real quotes and shipment tracking"].map((t) => (
                  <li key={t} style={{ fontSize: 14, color: C.ink, display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ color: C.goldDark, fontWeight: 900 }}>✓</span>{t}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 26px", borderRadius: 12, textDecoration: "none" }}>
                  Create your free account
                </Link>
                <Link href="/how-it-works" style={{ background: "#fff", color: C.navy, border: `1.5px solid ${C.line}`, fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 12, textDecoration: "none" }}>
                  How it works
                </Link>
              </div>
            </div>

            {/* Example shipment card — clearly illustrative, matches the honesty
                pattern used elsewhere (Package Control card on the homepage) */}
            <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: shadowMd, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`, padding: "16px 22px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 3 }}>Example shipment</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}>What a tracked CBC shipment looks like</div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ fontWeight: 800, color: C.navy, fontSize: 15, marginBottom: 3 }}>CBC-20487 · In transit</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Dubai, UAE → Nairobi, Kenya</div>
                <div style={{ height: 7, background: C.ivory, borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ width: "65%", height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.goldDark})`, borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  Consolidated fashion and electronics order with active tracking and status updates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS SUMMARY ═══ */}
        <section style={{ padding: "64px clamp(16px, 4vw, 40px)", background: C.ivory }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 8 }}>How CBC works</h2>
              <p style={{ fontSize: 14.5, color: C.muted }}>A simple forwarding process designed for shoppers, start to finish.</p>
            </div>
            <div className="about-steps-grid">
              {STEPS.map((item) => (
                <div key={item.step} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, boxShadow: shadowSm }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`, border: `2px solid ${C.gold}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 15, color: C.gold, marginBottom: 16,
                  }}>{item.step}</div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: C.navy, marginBottom: 8 }}>{item.title}</div>
                  <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WHY WE BUILT IT ═══ */}
        <section style={{ padding: "64px clamp(16px, 4vw, 40px)", background: "#fff" }}>
          <div className="about-why-grid" style={{ maxWidth: 1100, margin: "0 auto", alignItems: "center" }}>
            <div>
              <Eyebrow>Why CBC</Eyebrow>
              <h2 style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 16 }}>
                Built for shoppers across Africa
              </h2>
              <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
                Many online stores don't ship directly to African countries, or charge very high delivery fees when they do. CBC was built to make shopping UAE stores more accessible, affordable, and reliable — without the guesswork.
              </p>
              <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.8 }}>
                Our goal is to keep the experience simple from your first order to final delivery — clear communication, honest pricing, and real visibility at every stage of your shipment.
              </p>
            </div>
            <div style={{ background: C.ivory, border: `1px solid ${C.line}`, borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Why customers choose CBC</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Dedicated suite ID for each customer",
                  "Warehouse operations based in Dubai, UAE",
                  "WhatsApp and email support",
                  "Tracking visibility inside your dashboard",
                  "Built for personal shoppers, with more services planned",
                ].map((t) => (
                  <li key={t} style={{ fontSize: 13.5, color: C.ink, display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ color: C.goldDark, fontWeight: 900 }}>✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ padding: "60px clamp(16px, 4vw, 40px) 70px", background: C.ivory }}>
          <div style={{
            maxWidth: 900, margin: "0 auto", textAlign: "center",
            background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
            borderRadius: 24, padding: "clamp(32px, 5vw, 48px)", color: "#fff",
            boxShadow: shadowMd,
          }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, marginBottom: 12 }}>Ready to start shipping smarter?</h2>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, marginBottom: 26, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              Open your free account, get your CBC Dubai address, and start managing your orders with more clarity and control.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 28px", borderRadius: 12, textDecoration: "none" }}>
                Create free account
              </Link>
              <Link href="/contact" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 15, padding: "14px 24px", borderRadius: 12, textDecoration: "none" }}>
                Contact us
              </Link>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>

      <SiteFooter />

      <style jsx global>{`
        .about-hero-grid  { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; }
        .about-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .about-why-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        @media (max-width: 860px) {
          .about-hero-grid  { grid-template-columns: 1fr; }
          .about-steps-grid { grid-template-columns: repeat(2, 1fr); }
          .about-why-grid   { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .about-steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}