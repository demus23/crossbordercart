// components/GuideLayout.tsx — shared wrapper for every /guides/[slug] article.
// Keeps design system consistent (navy + brass gold, Inter body, Fraunces only
// on the hero H1) without repeating it in every article file. Authors drop
// <MidCTA /> partway through their content to keep the "guide -> calculator ->
// signup" funnel consistent across all articles, per the strategy discussed.
import Link from "next/link";
import React, { useState } from "react";
import Head from "next/head";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIChatbotModal from "@/components/AIChatbotModal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crossbordercart.com";

export const C = {
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

const shadowMd = "0 14px 34px -14px rgba(15,35,64,0.20)";

export function MidCTA() {
  return (
    <div style={{
      background: `linear-gradient(155deg, ${C.navy}, ${C.navyDeep})`,
      borderRadius: 20, padding: "clamp(24px, 4vw, 36px)", color: "#fff",
      textAlign: "center", margin: "36px 0", boxShadow: shadowMd,
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Shopping from outside the UAE?</h3>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: 18, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
        Get your CBC Dubai address and send eligible UAE purchases to one place before international forwarding.
      </p>
      <Link href="/signup" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
        Get My UAE Address →
      </Link>
    </div>
  );
}

function ClosingCTA() {
  return (
    <div style={{
      maxWidth: 900, margin: "48px auto 0",
      background: C.ivory, border: `1px solid ${C.line}`,
      borderRadius: 20, padding: "clamp(26px, 4vw, 38px)", textAlign: "center",
    }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Want to know the shipping cost before buying?</div>
      <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 18 }}>Get a real quote based on your package's actual weight and dimensions.</p>
      <Link href="/#calculator" style={{ background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff", fontWeight: 700, fontSize: 14, padding: "13px 26px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
        Calculate Shipping →
      </Link>
    </div>
  );
}

type Props = {
  title: string;
  category: string;
  categoryHref: string;
  dek: string;
  lastUpdated?: string;
  metaDescription: string;
  slug: string;
  children: React.ReactNode;
};

export default function GuideLayout({ title, category, categoryHref, dek, lastUpdated, metaDescription, slug, children }: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", overflowX: "hidden", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: C.ink }}>
      <Head>
        <title>{title} – CBC Shopping Guides</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index,follow" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={`${SITE_URL}/guides/${slug}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <SiteHeader />

      <article>
        {/* ═══ HERO ═══ */}
        <header style={{ background: `linear-gradient(180deg, ${C.ivory} 0%, #fff 100%)`, padding: "clamp(36px, 6vw, 56px) clamp(16px, 4vw, 40px) 40px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>
              <Link href="/guides" style={{ color: C.muted, textDecoration: "none" }}>Guides</Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <Link href={categoryHref} style={{ color: C.muted, textDecoration: "none" }}>{category}</Link>
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, color: C.navy, lineHeight: 1.2, marginBottom: 14 }}>
              {title}
            </h1>
            <p style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.7, maxWidth: 620 }}>{dek}</p>
            {lastUpdated && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 18, background: C.goldSoft, border: `1px solid ${C.gold}`, color: C.goldDark, fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 99 }}>
                🕒 Last updated: {lastUpdated}
              </div>
            )}
          </div>
        </header>

        {/* ═══ ARTICLE BODY ═══ */}
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 clamp(16px, 4vw, 40px) 60px" }}>
          <div className="guide-prose">{children}</div>
          <ClosingCTA />
        </div>
      </article>

      <FloatingChatButton isOpen={chatOpen} onOpen={() => setChatOpen(true)} />
      <AIChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
      <SiteFooter />

      <style jsx global>{`
        .guide-prose h2 { font-size: 21px; font-weight: 800; color: ${C.navy}; margin: 32px 0 12px; letter-spacing: -0.01em; }
        .guide-prose h3 { font-size: 16.5px; font-weight: 800; color: ${C.navy}; margin: 22px 0 8px; }
        .guide-prose p { font-size: 15px; color: ${C.ink}; line-height: 1.8; margin-bottom: 14px; }
        .guide-prose ul, .guide-prose ol { margin: 0 0 16px; padding-left: 22px; }
        .guide-prose li { font-size: 15px; color: ${C.ink}; line-height: 1.75; margin-bottom: 6px; }
        .guide-prose strong { color: ${C.navy}; }
        .guide-prose a.inline-link { color: ${C.goldDark}; font-weight: 700; text-decoration: none; border-bottom: 1px solid ${C.gold}88; }
        .guide-prose .callout { background: ${C.ivory}; border: 1px solid ${C.line}; border-left: 3px solid ${C.gold}; border-radius: 10px; padding: 16px 18px; margin: 18px 0; font-size: 14px; color: ${C.muted}; line-height: 1.7; }
      `}</style>
    </div>
  );
}