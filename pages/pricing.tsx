// pages/pricing.tsx
import React from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Head from "next/head";


const pageShell: React.CSSProperties = {
  background: "#f5f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const mainStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "30px auto",
  padding: "0 20px 40px",
};

const heading: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const subheading: React.CSSProperties = {
  fontSize: 15,
  color: "#64748b",
  marginBottom: 26,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
} as any;

const cardBase: React.CSSProperties = {
  borderRadius: 20,
  background: "#ffffff",
  padding: "18px 18px 20px",
  boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
  border: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const badge: React.CSSProperties = {
  alignSelf: "flex-start",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
};

const price: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  color: "#0f172a",
};

const priceNote: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
};

const featuresList: React.CSSProperties = {
  listStyle: "none",
  paddingLeft: 0,
  margin: "8px 0 0",
  fontSize: 13,
  color: "#4b5563",
};

const li: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 6,
  marginBottom: 4,
};

const bullet: React.CSSProperties = {
  marginTop: 3,
};

const button: React.CSSProperties = {
  marginTop: 10,
  padding: "9px 16px",
  borderRadius: 999,
  border: "none",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center" as const,
};

const sharedSection: React.CSSProperties = {
  marginTop: 34,
  borderRadius: 18,
  background: "#ecfdf5",
  padding: "18px 18px",
  border: "1px solid #bbf7d0",
};

export default function PricingPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Pricing – Cross Border Cart</title>
        <meta
          name="description"
          content="See how Cross Border Cart pricing works for personal shoppers, resellers and business users shipping from UAE to Africa and beyond."
        />
        <meta
          property="og:title"
          content="Cross Border Cart pricing – made for real shipments"
        />
        <meta
          property="og:description"
          content="Start free, then unlock better rates as your shipping volume grows. Designed for UAE ➝ Africa lanes and global routes."
        />
        <meta
          property="og:image"
          content="https://your-domain.com/og-cross-border-cart.png"
        />
        <meta
          property="og:url"
          content="https://your-domain.com/pricing"
        />
      </Head>
      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={heading}>Pricing made for real shipments</h1>
        <p style={subheading}>
          Start with simple, transparent pricing. No sign-up fee, no long contracts.
          You only pay when you ship – and you can change your plan as you grow.
        </p>

        {/* PRICING GRID */}
        <section>
          <div style={grid}>
            {/* PERSONAL */}
            <div style={cardBase}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Personal
              </span>
              <div>
                <span style={price}>Free</span>{" "}
                <span style={priceNote}>+ per-shipment fees</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                For shoppers who want a UAE address for their own online orders.
              </p>
              <ul style={featuresList}>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>1 UAE address for your personal shopping</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Up to 3 active shipments at a time</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Basic consolidation for multiple store orders</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Email support during business hours</span>
                </li>
              </ul>
              <Link
                href="/#get-started"
                style={{
                  ...button,
                  background: "#0f172a",
                  color: "#f9fafb",
                }}
              >
                Join free waitlist
              </Link>
            </div>

            {/* RESELLER – MOST POPULAR */}
            <div
              style={{
                ...cardBase,
                border: "2px solid #22c55e",
                boxShadow: "0 18px 40px rgba(34,197,94,0.25)",
                position: "relative",
              }}
            >
              <span style={{ ...badge, background: "#dcfce7", color: "#166534" }}>
                Most popular
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Reseller
              </span>
              <div>
                <span style={price}>Better rates</span>{" "}
                <span style={priceNote}>with volume discounts</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                For people shipping regularly to Africa &amp; beyond – for friends,
                family or a small business.
              </p>
              <ul style={featuresList}>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Best rates on UAE ➝ Africa lanes</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Unlimited shipments and consolidation</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Priority handling at the warehouse</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>WhatsApp + email support</span>
                </li>
              </ul>
              <Link
                href="/signup"
                style={{
                  ...button,
                  background: "#22c55e",
                  color: "#022c22",
                }}
              >
                Get started as a reseller
              </Link>
            </div>

            {/* PRO / BUSINESS */}
            <div style={cardBase}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Pro / Business
              </span>
              <div>
                <span style={price}>Custom</span>{" "}
                <span style={priceNote}>for serious volume</span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                For exporters, brands and logistics partners who move big volumes and
                need a dedicated setup.
              </p>
              <ul style={featuresList}>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Dedicated account manager</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Custom pricing based on lanes &amp; volume</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>API access &amp; integration support</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Advanced reporting and reconciliation</span>
                </li>
              </ul>
              <Link
                href="/#get-started"
                style={{
                  ...button,
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1px solid #d1d5db",
                }}
              >
                Talk to us about Pro
              </Link>
            </div>
          </div>
        </section>

        {/* SHARED BENEFITS */}
        <section style={sharedSection}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#065f46",
              marginBottom: 6,
            }}
          >
            Every plan includes
          </h2>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              listStyle: "none",
              paddingLeft: 0,
              margin: 0,
              fontSize: 13,
              color: "#064e3b",
            } as any}
          >
            <li>Transparent per-kg rates with no hidden handling fees</li>
            <li>Real-time shipment tracking from Dubai to your destination</li>
            <li>Help with basic customs documentation for your lane</li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
