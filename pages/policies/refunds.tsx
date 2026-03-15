// pages/policies/refunds.tsx
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
  lineHeight: 1.2,
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
  lineHeight: 1.4,
};

const pStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  marginBottom: 8,
  lineHeight: 1.7,
};

const linkStyle: React.CSSProperties = {
  color: "#0ea5a2",
  textDecoration: "none",
  fontWeight: 600,
};

export default function RefundPolicyPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Refund Policy | Cross Border Cart</title>
        <meta
          name="description"
          content="Learn how Cross Border Cart handles refunds for shipping charges, service fees and shipment-related claims."
        />
      </Head>

      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={h1Style}>Refund Policy</h1>
        <p style={subStyle}>
          How we handle refunds for shipping charges, service fees and related
          claims.
        </p>

        <h2 style={h2Style}>1. General policy</h2>
        <p style={pStyle}>
          Cross Border Cart aims to provide transparent and fair handling of
          refund requests. Refund eligibility depends on the type of service
          purchased, the shipment status and the reason for the request.
        </p>

        <h2 style={h2Style}>2. Shipping fees</h2>
        <p style={pStyle}>
          Shipping charges are generally non-refundable once a shipment has been
          processed, collected by the carrier or dispatched from our facility. A
          refund may be considered only if a shipment is cancelled before
          carrier pickup or before forwarding has begun.
        </p>

        <h2 style={h2Style}>3. Service fees</h2>
        <p style={pStyle}>
          Warehouse handling, consolidation, repacking, storage, special request
          services and similar service fees are non-refundable once the relevant
          service has been performed.
        </p>

        <h2 style={h2Style}>4. Cancellations before processing</h2>
        <p style={pStyle}>
          If you request cancellation before shipment processing or carrier
          pickup, we may approve a full or partial refund depending on the
          services already completed and any non-recoverable costs already
          incurred.
        </p>

        <h2 style={h2Style}>5. Customs duties, taxes and third-party charges</h2>
        <p style={pStyle}>
          Customs duties, import taxes, clearance fees and other third-party
          charges imposed by customs authorities, destination countries or
          logistics partners are generally non-refundable by Cross Border Cart
          unless the relevant third party refunds them to us.
        </p>

        <h2 style={h2Style}>6. Lost shipments</h2>
        <p style={pStyle}>
          If a shipment is confirmed as lost by the carrier, compensation or
          refund will be handled in line with the carrier&apos;s terms and any
          optional insurance or declared protection selected at the time of
          shipment. Claims are subject to carrier investigation and approval.
        </p>

        <h2 style={h2Style}>7. Damaged items</h2>
        <p style={pStyle}>
          If your shipment arrives damaged, you must contact us within 48 hours
          of delivery and provide clear photos of the package, shipping label
          and damaged contents. We will assist in opening a claim with the
          carrier where applicable. Any compensation depends on the
          carrier&apos;s assessment and any applicable insurance coverage.
        </p>

        <h2 style={h2Style}>8. Incorrect customer information</h2>
        <p style={pStyle}>
          Refunds will generally not be issued where delays, failed delivery,
          additional fees or shipment problems arise because of inaccurate
          addresses, incorrect contact details, incomplete customs information
          or incorrect item declarations provided by the customer.
        </p>

        <h2 style={h2Style}>9. Failed delivery or refused shipment</h2>
        <p style={pStyle}>
          If a shipment is refused, unclaimed or cannot be delivered for reasons
          outside our control, original shipping charges and completed service
          fees are non-refundable. Additional return, storage or disposal fees
          may also apply.
        </p>

        <h2 style={h2Style}>10. How to request a refund</h2>
        <p style={pStyle}>
          To request a refund, please email{" "}
          <a href="mailto:billing@crossbordercart.com" style={linkStyle}>
            billing@crossbordercart.com
          </a>{" "}
          and include your shipment ID, tracking number, payment details and a
          clear explanation of the issue, together with any relevant supporting
          documents.
        </p>

        <h2 style={h2Style}>11. Refund processing time</h2>
        <p style={pStyle}>
          If a refund is approved, it will usually be processed back to the
          original payment method within 5 to 10 business days, although actual
          timing may vary depending on the payment provider or bank.
        </p>

        <h2 style={h2Style}>12. Contact</h2>
        <p style={pStyle}>
          For refund and billing questions, contact{" "}
          <a href="mailto:billing@crossbordercart.com" style={linkStyle}>
            billing@crossbordercart.com
          </a>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}