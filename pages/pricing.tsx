// pages/pricing.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const pageShell: React.CSSProperties = {
  background: "#f5f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const heroSection: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "36px 20px 10px",
  textAlign: "center",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 999,
  background: "#ecfeff",
  border: "1px solid #ccfbf1",
  color: "#0f766e",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 16,
};

const heading: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
  lineHeight: 1.2,
};

const subheading: React.CSSProperties = {
  fontSize: 15,
  color: "#64748b",
  marginBottom: 24,
  lineHeight: 1.7,
  maxWidth: 760,
  marginLeft: "auto",
  marginRight: "auto",
};

const mainStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 20px 50px",
};

const pricingIntro: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 20,
  padding: "20px 20px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
  marginBottom: 24,
};

const introTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
};

const introText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.8,
  marginBottom: 0,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
};

const cardBase: React.CSSProperties = {
  borderRadius: 20,
  background: "#ffffff",
  padding: "20px 20px 22px",
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
  fontWeight: 700,
};

const planName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#0f172a",
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

const desc: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
  marginBottom: 4,
  lineHeight: 1.7,
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
  marginBottom: 6,
  lineHeight: 1.7,
};

const bullet: React.CSSProperties = {
  marginTop: 2,
};

const button: React.CSSProperties = {
  marginTop: 10,
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center",
};

const sharedSection: React.CSSProperties = {
  marginTop: 28,
  borderRadius: 20,
  background: "#ecfdf5",
  padding: "20px 20px",
  border: "1px solid #bbf7d0",
};

const sharedTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#065f46",
  marginBottom: 10,
};

const sharedGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 10,
  listStyle: "none",
  paddingLeft: 0,
  margin: 0,
  fontSize: 13,
  color: "#064e3b",
  lineHeight: 1.7,
};

const noteBox: React.CSSProperties = {
  marginTop: 24,
  background: "#ffffff",
  borderRadius: 18,
  padding: "18px 18px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
};

const noteTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
};

const noteText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.8,
  marginBottom: 0,
};

export default function PricingPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Pricing | Cross Border Cart</title>
        <meta
          name="description"
          content="See how Cross Border Cart pricing works for personal shoppers, resellers, and business users shipping from UAE to Africa and beyond."
        />
      </Head>

      <SiteHeader />

      <section style={heroSection}>
        <div style={badgeStyle}>Simple pricing</div>
        <h1 style={heading}>Pricing made for real shipments</h1>
        <p style={subheading}>
          Start with simple, transparent pricing. There is no sign-up fee and no
          long-term contract. You mainly pay when you ship, based on your parcel
          details, destination, service level, and any optional extras you select.
        </p>
      </section>

      <main style={mainStyle}>
        <div style={pricingIntro}>
          <h2 style={introTitle}>How pricing works</h2>
          <p style={introText}>
            Cross Border Cart is a parcel forwarding service. We do not sell the
            products customers buy. Final shipping charges usually depend on
            package weight, dimensions, destination country, shipping speed,
            consolidation choices, and optional services such as protection or
            special handling. Customers can review the applicable charges before
            confirming shipment.
          </p>
        </div>

        <section>
          <div style={grid}>
            <div style={cardBase}>
              <span style={planName}>Personal</span>
              <div>
                <span style={price}>Free</span>{" "}
                <span style={priceNote}>+ shipment charges</span>
              </div>
              <p style={desc}>
                For individual shoppers who want a UAE address for personal
                online orders.
              </p>
              <ul style={featuresList}>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Personal UAE forwarding address</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Suitable for occasional shopping shipments</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Basic shipment handling and visibility</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Email support during business hours</span>
                </li>
              </ul>
              <Link
                href="/signup"
                style={{
                  ...button,
                  background: "#0f172a",
                  color: "#f9fafb",
                }}
              >
                Start free
              </Link>
            </div>

            <div
              style={{
                ...cardBase,
                border: "2px solid #22c55e",
                boxShadow: "0 18px 40px rgba(34,197,94,0.18)",
              }}
            >
              <span style={{ ...badge, background: "#dcfce7", color: "#166534" }}>
                Most popular
              </span>
              <span style={planName}>Reseller</span>
              <div>
                <span style={price}>Better rates</span>{" "}
                <span style={priceNote}>with regular volume</span>
              </div>
              <p style={desc}>
                For customers shipping more frequently to Africa and other
                markets for family orders, sourcing, or small business resale.
              </p>
              <ul style={featuresList}>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Better pricing potential on repeat shipments</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>More flexible consolidation support</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Priority warehouse handling where available</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Email and customer support assistance</span>
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
                Get started as reseller
              </Link>
            </div>

            <div style={cardBase}>
              <span style={planName}>Pro / Business</span>
              <div>
                <span style={price}>Custom</span>{" "}
                <span style={priceNote}>for larger volume</span>
              </div>
              <p style={desc}>
                For exporters, businesses, and partners that need dedicated
                pricing, support, and higher shipping capacity.
              </p>
              <ul style={featuresList}>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Custom pricing based on route and volume</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>More tailored operational support</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Workflow and integration discussions where needed</span>
                </li>
                <li style={li}>
                  <span style={bullet}>✅</span>
                  <span>Business-focused account handling</span>
                </li>
              </ul>
              <Link
                href="/contact"
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

        <section style={sharedSection}>
          <h2 style={sharedTitle}>Every plan includes</h2>
          <ul style={sharedGrid}>
            <li>Transparent shipment pricing with clear charge visibility</li>
            <li>Tracking visibility from warehouse dispatch to destination</li>
            <li>Support for standard forwarding workflows</li>
          </ul>
        </section>

        <div style={noteBox}>
          <h3 style={noteTitle}>Important pricing note</h3>
          <p style={noteText}>
            Actual shipping costs may vary by carrier, route, parcel size,
            volumetric weight, destination-country fees, customs handling, and
            service level selected. Pricing examples on this page are for
            general guidance only and do not replace the final shipment quote
            shown during booking or confirmation.
          </p>
        </div>
      </main>
Cross Border Cart is a parcel forwarding service. 
Customers purchase products from third-party stores and ship them to their personal Cross Border Cart UAE address. 
We then forward those parcels internationally on the customer's behalf.
      <SiteFooter />
    </div>
  );
}