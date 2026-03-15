// pages/faq.tsx
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
  maxWidth: 900,
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
  maxWidth: 700,
  marginLeft: "auto",
  marginRight: "auto",
};

const main: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "0 20px 50px",
};

const faqItem: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "18px 18px",
  border: "1px solid #e5e7eb",
  marginBottom: 14,
  boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
};

const questionStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 8,
  color: "#0f172a",
};

const answerStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#475569",
  lineHeight: 1.75,
  margin: 0,
};

const helpCard: React.CSSProperties = {
  marginTop: 28,
  background: "linear-gradient(135deg, #ecfeff 0%, #f8fafc 100%)",
  border: "1px solid #dbeafe",
  borderRadius: 18,
  padding: "22px 20px",
};

const helpTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
};

const helpText: React.CSSProperties = {
  fontSize: 14,
  color: "#64748b",
  lineHeight: 1.7,
  marginBottom: 14,
};

const linksRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const linkPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 999,
  background: "#ffffff",
  border: "1px solid #dbeafe",
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700,
};

export default function FaqPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>FAQ | Cross Border Cart</title>
        <meta
          name="description"
          content="Frequently asked questions about Cross Border Cart, including shipping timelines, tracking, restricted items, reseller use, and support."
        />
      </Head>

      <SiteHeader />

      <section style={heroSection}>
        <div style={badgeStyle}>Help & Support</div>
        <h1 style={title}>Frequently asked questions</h1>
        <p style={subtitle}>
          Here are answers to the questions we get most often about Cross Border
          Cart, including account setup, shipping, tracking, restricted items,
          and support.
        </p>
      </section>

      <main style={main}>
        <div style={faqItem}>
          <h3 style={questionStyle}>Is it free to open an account?</h3>
          <p style={answerStyle}>
            Yes. Opening an account and receiving your UAE forwarding address is
            free. You only pay for shipping and any optional services you choose,
            such as consolidation, extra handling, or shipment protection where available.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>How long does shipping take?</h3>
          <p style={answerStyle}>
            Delivery time depends on the destination country, the shipping method
            selected, customs clearance, and carrier operations. Economy shipments
            may take around 7–14 working days, while express shipments are often
            delivered within 3–7 working days after dispatch from the UAE.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>How do I track my shipment?</h3>
          <p style={answerStyle}>
            Once your shipment is dispatched, you will receive a tracking number.
            You can monitor shipment updates through your Cross Border Cart
            dashboard, and tracking activity may also appear through the carrier’s
            own tracking system depending on the route and service used.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>What items can’t I ship?</h3>
          <p style={answerStyle}>
            Certain goods cannot be shipped because of airline safety rules,
            customs restrictions, or carrier policies. These may include weapons,
            explosives, flammable materials, illegal goods, and some restricted
            batteries or regulated products. You can review our full policy on the{" "}
            <Link href="/prohibited-items">What You Cannot Ship</Link> page.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>Can I consolidate multiple packages?</h3>
          <p style={answerStyle}>
            Yes. Where available, you can combine multiple parcels into a single
            shipment to help reduce international shipping costs. Consolidation
            options are managed through your dashboard once your packages arrive
            at the warehouse.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>Can I use Cross Border Cart as a reseller?</h3>
          <p style={answerStyle}>
            Yes. Cross Border Cart can be used by both individual shoppers and
            resellers who buy from UAE stores and forward shipments to their home
            country. Many customers use the service to source products, combine
            shipments, and manage repeat orders more efficiently.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>Who pays customs duties and taxes?</h3>
          <p style={answerStyle}>
            Import duties, taxes, and clearance fees are determined by the
            destination country and are generally the responsibility of the
            recipient. These charges are separate from Cross Border Cart shipping
            fees unless clearly stated otherwise.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>What happens if my shipment is delayed?</h3>
          <p style={answerStyle}>
            Shipping timelines are estimates and may be affected by customs
            inspections, weather, airline scheduling, or destination-country
            delivery conditions. If a shipment is delayed, our team can help you
            review the latest tracking updates and next steps.
          </p>
        </div>

        <div style={faqItem}>
          <h3 style={questionStyle}>How do I contact support?</h3>
          <p style={answerStyle}>
            You can contact us by email for shipment, account, and billing
            questions. For the fastest help, include your tracking number,
            registered email, and a clear description of the issue.
          </p>
        </div>

        <div style={helpCard}>
          <h2 style={helpTitle}>Still need help?</h2>
          <p style={helpText}>
            Visit our policy pages or contact our team directly for more detailed
            support regarding shipping, refunds, restricted items, and account questions.
          </p>

          <div style={linksRow}>
            <Link href="/contact" style={linkPill}>
              Contact Us
            </Link>
            <Link href="/policies/shipping" style={linkPill}>
              Shipping Policy
            </Link>
            <Link href="/policies/refunds" style={linkPill}>
              Refund Policy
            </Link>
            <Link href="/prohibited-items" style={linkPill}>
              Prohibited Items
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}