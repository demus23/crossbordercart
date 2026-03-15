// pages/policies/shipping.tsx
import Head from "next/head";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import React from "react";

const pageShell: React.CSSProperties = {
  background: "#f5f7fb",
  minHeight: "100vh",
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const mainStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "30px auto",
  padding: "0 20px 40px",
};

const h1Style: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const subStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  marginBottom: 18,
  lineHeight: 1.6,
};

const h2Style: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
  marginTop: 22,
  marginBottom: 6,
};

const pStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  marginBottom: 8,
  lineHeight: 1.7,
};

const listStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  paddingLeft: 18,
  lineHeight: 1.7,
};

export default function ShippingPolicyPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Shipping Policy | Cross Border Cart</title>
        <meta
          name="description"
          content="Information about shipping processing, transit times, customs and delivery responsibilities."
        />
      </Head>

      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={h1Style}>Shipping Policy</h1>

        <p style={subStyle}>
          Information about shipping methods, processing timelines and
          responsibilities when using Cross Border Cart.
        </p>

        <h2 style={h2Style}>1. Processing time</h2>
        <p style={pStyle}>
          Once your package is received at our warehouse and all charges are
          paid, we generally process and hand it over to the carrier within
          1–2 working days.
        </p>

        <h2 style={h2Style}>2. Transit times</h2>
        <p style={pStyle}>
          Transit times depend on the shipping service selected and the
          destination country.
        </p>

        <ul style={listStyle}>
          <li>Express services: typically 3–7 working days.</li>
          <li>Economy services: typically 7–14 working days.</li>
        </ul>

        <p style={pStyle}>
          These timelines are estimates only. Delays may occur due to customs
          inspections, weather conditions or carrier operations.
        </p>

        <h2 style={h2Style}>3. Tracking</h2>
        <p style={pStyle}>
          Every shipment receives a tracking number which is visible in your
          Cross Border Cart dashboard and may also be available through the
          carrier’s tracking system. Tracking updates are provided by the
          carrier and update frequency may vary.
        </p>

        <h2 style={h2Style}>4. Customs clearance</h2>
        <p style={pStyle}>
          Customs procedures are controlled by authorities in the destination
          country. We provide shipment documentation and invoices when
          required, but we cannot control customs inspection timelines,
          clearance decisions or any duties and taxes imposed.
        </p>

        <h2 style={h2Style}>5. Address accuracy</h2>
        <p style={pStyle}>
          Customers are responsible for providing accurate and complete
          delivery information. Cross Border Cart is not responsible for
          delays, returns or additional charges caused by incorrect or
          incomplete addresses.
        </p>

        <h2 style={h2Style}>6. Duties and taxes</h2>
        <p style={pStyle}>
          Import duties, customs taxes and local fees may apply depending on
          your country’s regulations. These charges are determined by the
          destination country and must be paid by the recipient when required.
        </p>

        <h2 style={h2Style}>7. Lost or damaged shipments</h2>
        <p style={pStyle}>
          If a shipment appears lost or damaged, please contact our support
          team as soon as possible. We will assist in opening a claim with the
          carrier according to their procedures and any optional insurance
          coverage selected for the shipment.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}