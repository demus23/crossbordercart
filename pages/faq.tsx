import React from "react";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";


const colors = { mint: "#22c55e" };

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
const navLeft: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const navCenter: React.CSSProperties = { display: "flex", alignItems: "center", gap: 16 };
const navRight: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const brandName: React.CSSProperties = { fontWeight: 800, fontSize: 18, color: "#0f172a" };
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
  maxWidth: 900,
  margin: "30px auto",
  padding: "0 20px 40px",
};
const title: React.CSSProperties = { fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 10 };
const subtitle: React.CSSProperties = { fontSize: 15, color: "#64748b", marginBottom: 26 };

const faqItem: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 14,
  padding: "14px 16px",
  border: "1px solid #e5e7eb",
  marginBottom: 12,
};

export default function FaqPage() {
  return (
    <div style={pageShell}>
            <SiteHeader />

        

      <main style={main}>
        <h1 style={title}>Frequently asked questions</h1>
        <p style={subtitle}>
          Here are answers to the questions we get most often about Cross Border Cart.
        </p>

        <div style={faqItem}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Is it free to open an account?
          </h3>
          <p style={{ fontSize: 14, color: "#475569" }}>
            Yes. Getting your UAE address with Cross Border Cart is free. You only pay
            shipping charges and any optional services like insurance or extra photos.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            How long does shipping take?
          </h3>
          <p style={{ fontSize: 14, color: "#475569" }}>
            It depends on your destination and service speed. Economy routes can take
            7–14 days, while express shipments are usually 3–7 days after dispatch from
            the UAE.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            What items can&apos;t I ship?
          </h3>
          <p style={{ fontSize: 14, color: "#475569" }}>
            Like all logistics providers, we follow airline and customs rules. Items
            such as flammable liquids, some batteries, weapons and illegal goods are
            restricted. We&apos;ll publish a full &quot;What you cannot ship&quot; list in
            the dashboard.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Can I use Cross Border Cart as a reseller?
          </h3>
          <p style={{ fontSize: 14, color: "#475569" }}>
            Yes. Many users order in bulk from UAE stores, consolidate and ship to
            their home country to resell. Our upcoming Standard and Business plans are
            designed exactly for that.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            How do I contact support?
          </h3>
          <p style={{ fontSize: 14, color: "#475569" }}>
            You&apos;ll be able to reach us via WhatsApp and email directly from the
            dashboard. We aim to reply quickly because we know cross-border shipments
            can be time-sensitive.
          </p>
        </div>
      </main>
            <SiteFooter />

    </div>
  );
}
