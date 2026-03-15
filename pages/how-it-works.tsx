// pages/how-it-works.tsx
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
};

const heroCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #ecfeff 0%, #f8fafc 100%)",
  border: "1px solid #dbeafe",
  borderRadius: 20,
  padding: "28px 24px",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 999,
  background: "#ffffff",
  border: "1px solid #dbeafe",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 16,
};

const title: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
  lineHeight: 1.15,
};

const subtitle: React.CSSProperties = {
  fontSize: 15,
  color: "#64748b",
  marginBottom: 18,
  lineHeight: 1.7,
  maxWidth: 760,
};

const ctaRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 8,
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

const main: React.CSSProperties = {
  maxWidth: 1100,
  margin: "18px auto 0",
  padding: "0 20px 50px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const sectionText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.7,
  marginBottom: 22,
  maxWidth: 760,
};

const timeline: React.CSSProperties = {
  position: "relative",
  paddingLeft: 28,
  borderLeft: "2px solid #dbe3ee",
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const stepCard: React.CSSProperties = {
  position: "relative",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: "18px 18px 16px",
  boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
};

const stepDot: React.CSSProperties = {
  position: "absolute",
  left: -38,
  top: 18,
  width: 18,
  height: 18,
  borderRadius: "999px",
  background: "#0ea5a2",
  border: "4px solid #f5f7fb",
};

const stepNumber: React.CSSProperties = {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 800,
  color: "#0ea5a2",
  marginBottom: 8,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const stepTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  marginBottom: 6,
  color: "#0f172a",
};

const stepText: React.CSSProperties = {
  fontSize: 14,
  color: "#475569",
  lineHeight: 1.7,
  margin: 0,
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
  marginTop: 30,
};

const infoCard: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
};

const infoCardTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
};

const infoCardText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.7,
  margin: 0,
};

export default function HowItWorksPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>How It Works | Cross Border Cart</title>
        <meta
          name="description"
          content="Learn how Cross Border Cart works, from getting your UAE shipping address to receiving your parcels at home."
        />
      </Head>

      <SiteHeader />

      <section style={heroSection}>
        <div style={heroCard}>
          <div style={badgeStyle}>Parcel Forwarding Made Simple</div>

          <h1 style={title}>How Cross Border Cart works</h1>

          <p style={subtitle}>
            Cross Border Cart gives you a UAE delivery address so you can shop
            from UAE stores, receive your parcels in our facility, choose how
            you want them shipped, and track them until delivery in your home
            country.
          </p>

          <div style={ctaRow}>
            <Link href="/register" style={primaryBtn}>
              Create Free Account
            </Link>
            <Link href="/pricing" style={secondaryBtn}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <main style={main}>
        <h2 style={sectionTitle}>Step-by-step process</h2>
        <p style={sectionText}>
          From shopping online to final delivery, here is exactly how the
          Cross Border Cart forwarding process works.
        </p>

        <div style={timeline}>
          <div style={stepCard}>
            <div style={stepDot} />
            <div style={stepNumber}>Step 1</div>
            <div style={stepTitle}>Create your free account</div>
            <p style={stepText}>
              Sign up with your email and basic details. Once your account is
              active, you receive your personal UAE shipping address inside your
              Cross Border Cart dashboard.
            </p>
          </div>

          <div style={stepCard}>
            <div style={stepDot} />
            <div style={stepNumber}>Step 2</div>
            <div style={stepTitle}>Shop online and use your assigned address</div>
            <p style={stepText}>
              Buy from UAE stores or other supported sellers and enter your
              Cross Border Cart delivery address at checkout. Your orders are
              sent to our warehouse instead of directly to your home country.
            </p>
          </div>

          <div style={stepCard}>
            <div style={stepDot} />
            <div style={stepNumber}>Step 3</div>
            <div style={stepTitle}>We receive and log your parcels</div>
            <p style={stepText}>
              When your package arrives, our team checks it in, records it in
              your dashboard, and updates your account so you know exactly what
              has been received.
            </p>
          </div>

          <div style={stepCard}>
            <div style={stepDot} />
            <div style={stepNumber}>Step 4</div>
            <div style={stepTitle}>Choose shipping, consolidation, and extras</div>
            <p style={stepText}>
              You decide whether to ship parcels individually or combine
              multiple packages into one shipment to help reduce delivery costs.
              You may also select speed, carrier options, and any available
              protection or additional services.
            </p>
          </div>

          <div style={stepCard}>
            <div style={stepDot} />
            <div style={stepNumber}>Step 5</div>
            <div style={stepTitle}>Pay shipping and dispatch your shipment</div>
            <p style={stepText}>
              Once you confirm your shipping choice and complete payment, we
              prepare your parcel and hand it over to the selected delivery
              partner for international forwarding.
            </p>
          </div>

          <div style={stepCard}>
            <div style={stepDot} />
            <div style={stepNumber}>Step 6</div>
            <div style={stepTitle}>Track delivery to your destination</div>
            <p style={stepText}>
              After dispatch, you can follow tracking updates through your
              dashboard. Delivery times depend on the selected service,
              destination country, customs clearance, and carrier operations.
            </p>
          </div>
        </div>

        <div style={infoGrid}>
          <div style={infoCard}>
            <div style={infoCardTitle}>Important note about customs</div>
            <p style={infoCardText}>
              Import duties, taxes, and customs clearance requirements are set
              by the destination country. These charges, if any, are the
              responsibility of the recipient.
            </p>
          </div>

          <div style={infoCard}>
            <div style={infoCardTitle}>Tracking and visibility</div>
            <p style={infoCardText}>
              Shipment tracking is available after dispatch. Tracking events may
              vary depending on the carrier and the destination country.
            </p>
          </div>

          <div style={infoCard}>
            <div style={infoCardTitle}>Restricted items</div>
            <p style={infoCardText}>
              Some products cannot be shipped because of airline, customs, or
              safety rules. Always review prohibited and restricted item rules
              before ordering.
            </p>
          </div>
        </div>
      </main>
Cross Border Cart is a parcel forwarding service. 
Customers purchase products from third-party stores and ship them to their personal Cross Border Cart UAE address. 
We then forward those parcels internationally on the customer's behalf.
      <SiteFooter />
    </div>
  );
}