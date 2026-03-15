// pages/why.tsx
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

const title: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
  lineHeight: 1.2,
};

const subtitle: React.CSSProperties = {
  fontSize: 15,
  color: "#64748b",
  marginBottom: 26,
  lineHeight: 1.7,
  maxWidth: 760,
  marginLeft: "auto",
  marginRight: "auto",
};

const main: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 20px 50px",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
};

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 18,
  padding: "20px 20px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
};

const cardTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  marginBottom: 8,
  color: "#0f172a",
};

const cardText: React.CSSProperties = {
  fontSize: 14,
  color: "#475569",
  lineHeight: 1.75,
  margin: 0,
};

const sectionCard: React.CSSProperties = {
  marginTop: 28,
  background: "#ffffff",
  borderRadius: 22,
  padding: "26px 24px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
};

const sectionText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.8,
  marginBottom: 0,
};

const ctaBox: React.CSSProperties = {
  marginTop: 30,
  background: "linear-gradient(135deg, #ecfeff 0%, #f8fafc 100%)",
  border: "1px solid #dbeafe",
  borderRadius: 24,
  padding: "28px 24px",
  textAlign: "center",
};

const ctaTitle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
};

const ctaText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.8,
  maxWidth: 720,
  margin: "0 auto 18px",
};

const ctaButtons: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 12,
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 18px",
  borderRadius: 999,
  background: "#0f172a",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 18px",
  borderRadius: 999,
  background: "#ffffff",
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
  border: "1px solid #cbd5e1",
};

export default function WhyPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Why Cross Border Cart | Cross Border Cart</title>
        <meta
          name="description"
          content="Discover why shoppers and resellers choose Cross Border Cart for UAE parcel forwarding, transparent pricing, consolidation, and cross-border delivery support."
        />
      </Head>

      <SiteHeader />

      <section style={heroSection}>
        <div style={badgeStyle}>Why choose us</div>
        <h1 style={title}>Why Cross Border Cart?</h1>
        <p style={subtitle}>
          Cross Border Cart is built for real shoppers and resellers who want
          UAE prices without complicated logistics, confusing processes, or
          surprise charges. We focus on practical shipping solutions, clear
          communication, and a smoother cross-border buying experience.
        </p>
      </section>

      <main style={main}>
        <div style={grid}>
          <div style={card}>
            <h3 style={cardTitle}>🇦🇪 Optimised for UAE and Africa</h3>
            <p style={cardText}>
              Our service is built around UAE sourcing and delivery into African
              markets and other international destinations. That means better
              familiarity with routes, common shipping patterns, and the needs
              of customers buying across borders.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>💸 Clear and honest pricing</h3>
            <p style={cardText}>
              We aim to keep pricing transparent so customers understand what
              they are paying for. Shipping costs depend on weight, size,
              destination, speed, and optional services, with visibility before
              shipment confirmation.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>📦 Consolidation that helps reduce costs</h3>
            <p style={cardText}>
              Buy from multiple UAE stores, receive the parcels at one address,
              and combine them into a smaller number of shipments where
              available. This can help reduce total delivery costs and make
              repeat buying more efficient.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>🧑‍💻 Human support when you need it</h3>
            <p style={cardText}>
              Cross-border shipping can be stressful when delays, customs
              questions, or tracking issues happen. Our support approach is
              designed to be practical, responsive, and easier to understand.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>🔎 Better shipment visibility</h3>
            <p style={cardText}>
              From parcel arrival at the warehouse to final dispatch, customers
              get more visibility into shipment status, tracking updates, and
              delivery progress through the platform.
            </p>
          </div>

          <div style={card}>
            <h3 style={cardTitle}>🛍 Built for both shoppers and resellers</h3>
            <p style={cardText}>
              Whether you are ordering a few personal items or sourcing products
              for resale, Cross Border Cart is designed to support both
              occasional purchases and more frequent forwarding needs.
            </p>
          </div>
        </div>

        <div style={sectionCard}>
          <h2 style={sectionTitle}>What makes us different</h2>
          <p style={sectionText}>
            Cross Border Cart is not just a mailbox service. It is a parcel
            forwarding platform focused on giving customers a more reliable
            buying and shipping journey from UAE stores to their destination
            country. We work to make the process easier to understand, easier to
            manage, and more suitable for customers in markets that are often
            underserved by international retailers.
          </p>
        </div>

        <div style={ctaBox}>
          <h2 style={ctaTitle}>Ready to try Cross Border Cart?</h2>
          <p style={ctaText}>
            Open your account, get your UAE shipping address, and start managing
            your international purchases with more clarity, better shipment
            control, and simpler forwarding from Dubai.
          </p>

          <div style={ctaButtons}>
            <Link href="/signup" style={primaryBtn}>
              Create free account
            </Link>
            <Link href="/how-it-works" style={secondaryBtn}>
              See how it works
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}