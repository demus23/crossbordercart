// pages/prohibited-items.tsx
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

export default function ProhibitedItemsPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>What You Cannot Ship | Cross Border Cart</title>
        <meta
          name="description"
          content="Learn which items are prohibited or restricted when using Cross Border Cart."
        />
      </Head>

      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={h1Style}>What You Cannot Ship</h1>

        <p style={subStyle}>
          Certain products cannot be shipped through Cross Border Cart because
          of airline safety rules, customs restrictions, legal requirements, or
          carrier policies. Customers are responsible for ensuring their items
          are permitted in both the origin and destination country.
        </p>

        <h2 style={h2Style}>1. Prohibited items</h2>
        <p style={pStyle}>
          The following categories are generally not accepted for shipping:
        </p>
        <ul style={listStyle}>
          <li>Weapons, firearms, ammunition, and explosives</li>
          <li>Illegal drugs, narcotics, and controlled substances</li>
          <li>Flammable liquids, gases, and hazardous chemicals</li>
          <li>Corrosive, toxic, or radioactive materials</li>
          <li>Counterfeit goods and illegal products</li>
          <li>Stolen property or goods obtained unlawfully</li>
          <li>Live animals or biological materials</li>
          <li>Perishable goods not suitable for transport</li>
          <li>Any item prohibited by law or by the destination country</li>
        </ul>

        <h2 style={h2Style}>2. Restricted items</h2>
        <p style={pStyle}>
          Some items may be accepted only under specific conditions, subject to
          carrier approval, documentation, or destination-country rules.
        </p>
        <ul style={listStyle}>
          <li>Lithium batteries and battery-powered devices</li>
          <li>Perfumes, aerosols, and alcohol-based products</li>
          <li>Cosmetics and skincare products with regulated ingredients</li>
          <li>Food items, supplements, and ingestible products</li>
          <li>Medicines, medical devices, and health-related items</li>
          <li>High-value goods such as jewelry, watches, and electronics</li>
        </ul>

        <h2 style={h2Style}>3. Customs and destination rules</h2>
        <p style={pStyle}>
          Import regulations differ by country. An item that is allowed in one
          country may be restricted or prohibited in another. Customs
          authorities may delay, reject, confiscate, or destroy shipments based
          on local laws and regulations.
        </p>

        <h2 style={h2Style}>4. Customer responsibility</h2>
        <p style={pStyle}>
          You are responsible for accurately declaring the contents, value, and
          nature of each shipment. Inaccurate declarations may lead to delays,
          refusal, penalties, or disposal of the shipment.
        </p>

        <h2 style={h2Style}>5. Our right to refuse shipments</h2>
        <p style={pStyle}>
          Cross Border Cart reserves the right to refuse, hold, return, or
          dispose of any shipment that appears unsafe, prohibited, restricted,
          incorrectly declared, or non-compliant with carrier or customs rules.
        </p>

        <h2 style={h2Style}>6. Need help before ordering?</h2>
        <p style={pStyle}>
          If you are unsure whether an item can be shipped, please contact our
          support team before placing your order or sending it to our warehouse.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}