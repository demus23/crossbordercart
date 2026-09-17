// pages/about.tsx — CBC design system v2 (navy/gold)
// 2026-09-16: full content rewrite using Nati's own founder copy (real
// problem statement, real "why I started CBC" story, real mission — not
// AI-invented). Replaced the old generic "why we built it" boilerplate and
// the old fabricated Testimonials component (see prior comment history —
// that component showed three invented customers and a made-up rating and
// has been removed from this page in favor of the real ReviewsSection).
import React from "react";
import SEO from "@/components/SEO";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ReviewsSection from "@/components/ReviewsSection";

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
  { step: "1", title: "Get your CBC UAE address", text: "Create an account and receive your personal CBC receiving details." },
  { step: "2", title: "Shop online", text: "Use your CBC address when purchasing from stores that can deliver to the UAE." },
  { step: "3", title: "We receive your packages", text: "Your purchases arrive at our UAE receiving location and are added to your CBC account." },
  { step: "4", title: "Consolidate when needed", text: "Multiple purchases can be combined into fewer shipments where appropriate, helping simplify international forwarding." },
  { step: "5", title: "Choose your shipping option", text: "Review available delivery options and shipping costs for your destination." },
  { step: "6", title: "Track your shipment", text: "Follow the progress of your international shipment through CBC." },
];

const MISSION_CITIES = ["Nairobi", "Addis Ababa", "Kampala", "Lagos", "Accra"];

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
                About Cross Border Cart
              </span>
              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 600, lineHeight: 1.15, color: C.navy, marginBottom: 18 }}>
                Making global shopping<br /><span style={{ color: C.goldDark, fontStyle: "italic" }}>easier to reach.</span>
              </h1>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, maxWidth: 480, marginBottom: 14 }}>
                Cross Border Cart (CBC) was created around a simple problem: shopping online may be global, but delivery still isn't. Many international stores offer great products, prices and choices, yet customers in Africa and other underserved markets often face limited delivery options, expensive international shipping, complicated forwarding arrangements, or stores that simply don't ship to their country.
              </p>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.75, maxWidth: 480, marginBottom: 22 }}>
                CBC was built to make that process easier.
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

            {/* Real shipment card — CBC-20260511-5831, an actual delivered
                shipment (customer: Luwam Eyob, review + Trustpilot invite
                sent Sep 2026), not a mockup. Replace only with another real
                shipment if this one is retired — never revert to a fake
                example. */}
            <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, boxShadow: shadowMd, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`, padding: "16px 22px" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 3 }}>Real CBC shipment</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5 }}>An actual delivered order, not a mockup</div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ fontWeight: 800, color: C.navy, fontSize: 15, marginBottom: 3 }}>CBC-20260511-5831 · Delivered</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Dubai, UAE → Nairobi, Kenya 🇰🇪</div>
                <div style={{ height: 7, background: C.ivory, borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ width: "100%", height: "100%", background: `linear-gradient(90deg, ${C.gold}, ${C.goldDark})`, borderRadius: 99 }} />
                </div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  Clothing order · 0.8 kg · Aramex Express · delivered within 5 days of purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHAT WE PROVIDE ═══ */}
        <section style={{ padding: "56px clamp(16px, 4vw, 40px)", background: "#fff" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, marginBottom: 16 }}>
              We provide customers with a UAE receiving address where their online purchases can be delivered. Once packages arrive, CBC can receive, manage, consolidate and prepare them for international delivery.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85 }}>
              And CBC isn't limited to purchases made in the UAE. Our goal is to help customers move purchases and packages across borders, whether they are shopping from UAE stores, international online platforms, or arranging goods from another supplier.
            </p>
          </div>
        </section>

        {/* ═══ WHY I STARTED CBC (founder) ═══ */}
        <section style={{ padding: "64px clamp(16px, 4vw, 40px)", background: C.ivory }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <Eyebrow>Founder</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 18 }}>
              Why I started CBC
            </h2>
            <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.9, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0 }}>I'm Natnael, the founder of Cross Border Cart.</p>
              <p style={{ margin: 0 }}>
                I've spent years working in international trade from the UAE, supplying and moving goods to markets across Africa. Through that experience, I repeatedly saw the same problem.
              </p>
              <p style={{ margin: 0 }}>
                People could find what they wanted online, but getting it to where they lived was often the difficult part.
              </p>
              <p style={{ margin: 0 }}>
                Sometimes a store wouldn't ship to their country. Sometimes international shipping was too expensive. Sometimes customers had several purchases from different stores and needed them brought together. And sometimes people simply needed someone they could reach and trust to help them understand the shipping process.
              </p>
              <p style={{ margin: 0 }}>
                I believed there should be a simpler bridge between global shopping and customers in markets that are often underserved by international e-commerce.
              </p>
              <p style={{ margin: 0, fontWeight: 700, color: C.navy }}>That idea became Cross Border Cart.</p>
            </div>
            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontWeight: 800, fontSize: 13 }}>NE</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: C.navy }}>Natnael Eyob</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>Founder, Cross Border Cart · Dubai, UAE</div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHAT WE'RE BUILDING ═══ */}
        <section style={{ padding: "64px clamp(16px, 4vw, 40px)", background: "#fff" }}>
          <div className="about-why-grid" style={{ maxWidth: 1100, margin: "0 auto", alignItems: "center" }}>
            <div>
              <Eyebrow>What we're building</Eyebrow>
              <h2 style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 16 }}>
                More than a forwarding address
              </h2>
              <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
                We're building a cross-border shopping and logistics platform where customers can manage packages, request consolidation, compare available shipping options, pay for shipments and follow their deliveries from one place.
              </p>
              <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.8 }}>
                Our UAE hub gives us a strategic starting point between major global shopping markets and destinations across Africa, the Middle East and beyond. We're starting with a strong focus on Africa because this is where we understand many of the logistics challenges firsthand — but our long-term vision is broader.
              </p>
            </div>
            <div style={{ background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`, borderRadius: 20, padding: 32, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "clamp(1.1rem, 2.2vw, 1.4rem)", color: "#fff", lineHeight: 1.6 }}>
                "Shop from anywhere.<br />Move it across borders.<br />Manage it through CBC."
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW CBC WORKS ═══ */}
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

        {/* ═══ BUILT AROUND TRANSPARENCY ═══ */}
        <section style={{ padding: "64px clamp(16px, 4vw, 40px)", background: "#fff" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <Eyebrow>Built around transparency</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 16 }}>
              We want to earn trust shipment by shipment
            </h2>
            <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.85, marginBottom: 14 }}>
              Cross-border shipping involves more than moving a box from one country to another. Shipping charges, package dimensions, customs requirements, duties, prohibited items and destination regulations can all affect a shipment. We believe customers should understand these things before making decisions.
            </p>
            <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.85, marginBottom: 22 }}>
              That's why we're building CBC around transparent pricing, shipment information, accessible customer support and clear communication throughout the forwarding process.
            </p>
            <div style={{ background: C.ivory, border: `1px solid ${C.gold}`, borderRadius: 16, padding: "20px 24px" }}>
              <p style={{ fontSize: 14, color: C.navy, lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
                We're also a growing company. We won't pretend to have decades of history that we don't have. Instead, we want to earn trust shipment by shipment.
              </p>
            </div>
          </div>
        </section>

        {/* ═══ OUR MISSION ═══ */}
        <section style={{ padding: "64px clamp(16px, 4vw, 40px)", background: C.ivory }}>
          <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
            <Eyebrow>Our mission</Eyebrow>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 18 }}>
              Where you live shouldn't limit what you can access
            </h2>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, marginBottom: 14 }}>
              Our mission is to make cross-border shopping and shipping more accessible for people who have historically had fewer international delivery options.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, marginBottom: 22 }}>
              We want someone in {MISSION_CITIES.slice(0, -1).join(", ")} — or eventually almost anywhere — to have greater access to the same global marketplace available to customers in major e-commerce markets.
            </p>
            <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "clamp(1.2rem, 2.6vw, 1.6rem)", color: C.navy }}>
              Cross Borders. Access More.
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ padding: "60px clamp(16px, 4vw, 40px) 70px", background: "#fff" }}>
          <div style={{
            maxWidth: 900, margin: "0 auto", textAlign: "center",
            background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
            borderRadius: 24, padding: "clamp(32px, 5vw, 48px)", color: "#fff",
            boxShadow: shadowMd,
          }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, marginBottom: 12 }}>Shop globally. Receive through CBC. Ship across borders.</h2>
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

        <ReviewsSection />
      </main>

      <SiteFooter />

      <style jsx global>{`
        .about-hero-grid  { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; }
        .about-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
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
