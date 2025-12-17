// pages/stores.tsx
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

const mainStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "30px auto",
  padding: "0 20px 40px",
};

const heading: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 6,
};

const subheading: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  marginBottom: 24,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
} as any;

const card: React.CSSProperties = {
  borderRadius: 18,
  background: "#ffffff",
  padding: "14px 14px 16px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.10)",
  border: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const nameStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#0f172a",
};

const tagStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6b7280",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  padding: "3px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  background: "#eef2ff",
  color: "#4338ca",
};

const dealText: React.CSSProperties = {
  fontSize: 12,
  color: "#16a34a",
};

const externalLink: React.CSSProperties = {
  marginTop: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#2563eb",
  textDecoration: "none",
};

type Store = {
  name: string;
  category: string;
  deal?: string;
  note?: string;
  href: string;
  highlight?: boolean;
};

const STORES: Store[] = [
  {
    name: "Amazon UAE",
    category: "Everything / electronics / home",
    deal: "Great for electronics and mixed carts",
    note: "Use Cross Border Cart to consolidate multiple Amazon sellers into one shipment.",
    href: "#",
    highlight: true,
  },
  {
    name: "Shein",
    category: "Fashion, shoes & home decor",
    deal: "Frequent discount codes and bundles",
    href: "#",
  },
  {
    name: "Sephora Middle East",
    category: "Beauty & fragrance",
    deal: "Exclusive sets & GCC launches",
    href: "#",
  },
  {
    name: "Namshi",
    category: "Fashion & shoes",
    deal: "Great for Gulf brands & sneakers",
    href: "#",
  },
  {
    name: "Noon",
    category: "Electronics, home & toys",
    deal: "Flash deals & big sale events",
    href: "#",
  },
  {
    name: "Carrefour UAE",
    category: "Groceries & bulk household",
    note: "Useful for resellers shipping food / household to Africa.",
    href: "#",
  },
];

const DEALS_THIS_MONTH: Store[] = [
  {
    name: "Shein",
    category: "Fashion",
    deal: "Extra 15% off on orders over 250 AED (example)",
    href: "#",
    highlight: true,
  },
  {
    name: "Amazon UAE",
    category: "Electronics",
    deal: "Deals on phones & laptops this week",
    href: "#",
  },
];

export default function StoresPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Stores – Cross Border Cart</title>
        <meta
          name="description"
          content="Discover popular UAE stores you can ship from using Cross Border Cart – including Amazon, Shein, Namshi, Noon and more."
        />
      </Head>

      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={heading}>Stores you can shop from</h1>
        <p style={subheading}>
          Shop from your favourite UAE &amp; global online stores, send
          everything to your Cross Border Cart address in Dubai, and ship in one
          simple, tracked shipment to your country.
        </p>

        {/* Deals of the month */}
        <section style={{ marginBottom: 26 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Deals of the month
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            } as any}
          >
            {DEALS_THIS_MONTH.map((store) => (
              <div
                key={store.name}
                style={{
                  ...card,
                  borderColor: "#22c55e",
                  boxShadow: "0 16px 36px rgba(34,197,94,0.25)",
                }}
              >
                <span style={badge}>Top deal</span>
                <div style={nameStyle}>{store.name}</div>
                <div style={tagStyle}>{store.category}</div>
                {store.deal && <div style={dealText}>{store.deal}</div>}
                <a
                  href={store.href}
                  target="_blank"
                  rel="noreferrer"
                  style={externalLink}
                >
                  Shop this store →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* All stores */}
        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Popular UAE stores for Cross Border Cart
          </h2>
          <div style={grid}>
            {STORES.map((store) => (
              <div
                key={store.name}
                style={{
                  ...card,
                  borderColor: store.highlight ? "#a5b4fc" : "#e5e7eb",
                }}
              >
                {store.highlight && <span style={badge}>Recommended</span>}
                <div style={nameStyle}>{store.name}</div>
                <div style={tagStyle}>{store.category}</div>
                {store.deal && (
                  <div style={dealText}>
                    {store.deal}
                  </div>
                )}
                {store.note && (
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{store.note}</div>
                )}
                <a
                  href={store.href}
                  target="_blank"
                  rel="noreferrer"
                  style={externalLink}
                >
                  Visit store →
                </a>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginTop: 12,
            }}
          >
            Store names and deals above are examples. Always check the store
            website for the latest offers. Later you can plug in real affiliate
            links and live deals.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
