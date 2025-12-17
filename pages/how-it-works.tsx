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
  maxWidth: 1100,
  margin: "30px auto",
  padding: "0 20px 40px",
};
const title: React.CSSProperties = { fontSize: 32, fontWeight: 800, color: "#0f172a", marginBottom: 10 };
const subtitle: React.CSSProperties = { fontSize: 15, color: "#64748b", marginBottom: 26 };
const timeline: React.CSSProperties = {
  position: "relative",
  paddingLeft: 30,
  borderLeft: "2px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const stepTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, marginBottom: 6 };
const stepText: React.CSSProperties = { fontSize: 14, color: "#475569" };

export default function HowItWorksPage() {
  return (
    <div style={pageShell}>
            <SiteHeader />

        
      

      <main style={main}>
        <h1 style={title}>How Cross Border Cart works</h1>
        <p style={subtitle}>
          From browsing a UAE website to opening your parcel at home, here’s exactly
          what happens step by step.
        </p>

        <div style={timeline}>
          <div>
            <div style={stepTitle}>1. Create your free account</div>
            <p style={stepText}>
              Sign up with your email, verify your details, and instantly get your
              personal UAE shipping address inside the Cross Border Cart dashboard.
            </p>
          </div>
          <div>
            <div style={stepTitle}>2. Shop any UAE or global store</div>
            <p style={stepText}>
              At checkout, use your Cross Border Cart address. We receive your
              packages in our UAE facility and notify you when each parcel arrives.
            </p>
          </div>
          <div>
            <div style={stepTitle}>3. We check &amp; store your parcels</div>
            <p style={stepText}>
              Our team scans and logs your parcels. We can optionally take photos,
              check outer packaging and flag any visible damage.
            </p>
          </div>
          <div>
            <div style={stepTitle}>4. You choose how to ship</div>
            <p style={stepText}>
              In your dashboard you decide: ship one by one, or consolidate multiple
              parcels into one box to save on shipping. You also choose speed, carrier
              and insurance.
            </p>
          </div>
          <div>
            <div style={stepTitle}>5. Track everything live</div>
            <p style={stepText}>
              Once shipped, you get live tracking, status updates and delivery ETA.
              Our support team is available if customs or last-mile couriers need any
              clarification.
            </p>
          </div>
        </div>
      </main>
            <SiteFooter />

    </div>
  );
}
