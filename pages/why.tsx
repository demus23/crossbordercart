import React from "react";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";


const colors = {
  mint: "#22c55e",
};

const headerShell: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 40,
  background: "#ffffff",
  boxShadow: "0 4px 18px rgba(15,23,42,0.06)",
};

const nav: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "10px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const navLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const navCenter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const navRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const brandName: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 18,
  color: "#0f172a",
};

const navLink: React.CSSProperties = {
  fontSize: 13,
  color: "#475569",
  textDecoration: "none",
  fontWeight: 500,
};

const navBtn: React.CSSProperties = {
  borderRadius: 999,
  padding: "7px 18px",
  fontWeight: 600,
  fontSize: 13,
  textDecoration: "none",
};

const pageShell: React.CSSProperties = {
  background: "#f5f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const main: React.CSSProperties = {
  maxWidth: 1100,
  margin: "30px auto",
  padding: "0 20px 40px",
};

const title: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 10,
};

const subtitle: React.CSSProperties = {
  fontSize: 15,
  color: "#64748b",
  marginBottom: 26,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
} as any;

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 18,
  padding: "18px 18px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
};

export default function WhyPage() {
  return (
    <div style={pageShell}>
      {/* Header – same as homepage */}
      <SiteHeader />
       
      

      <main style={main}>
        <h1 style={title}>Why Cross Border Cart?</h1>
        <p style={subtitle}>
          Cross Border Cart is built for real shoppers and resellers who want UAE
          prices without UAE paperwork, confusing logistics or surprise charges.
        </p>

        <div style={grid}>
          <div style={card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              🇦🇪 Optimised for UAE &amp; Africa
            </h3>
            <p style={{ fontSize: 14, color: "#475569" }}>
              Our strongest shipping lanes are from the UAE into African markets and
              beyond. That means better routes, smarter consolidation and real
              experience with customs in your region.
            </p>
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              💸 Clear, honest pricing
            </h3>
            <p style={{ fontSize: 14, color: "#475569" }}>
              Get instant estimates before you ship, see exactly where your money
              goes, and avoid ugly surprises when your parcel arrives.
            </p>
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              📦 Consolidation that actually saves you
            </h3>
            <p style={{ fontSize: 14, color: "#475569" }}>
              Order from multiple UAE stores, then combine your packages into one
              shipment to reduce per-kg pricing and extra fees.
            </p>
          </div>
          <div style={card}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              🧑‍💻 Human support, not just bots
            </h3>
            <p style={{ fontSize: 14, color: "#475569" }}>
              WhatsApp and email support from people who understand the UAE, your
              destination country and the realities of cross-border shipping.
            </p>
          </div>
        </div>
      </main>
            <SiteFooter />

    </div>
  );
}
