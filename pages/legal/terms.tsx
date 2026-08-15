// pages/legal/terms.tsx
import React from "react";
import Head from "next/head";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
  lineHeight: 1.6,
};

const listStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  paddingLeft: 18,
  lineHeight: 1.6,
};

export default function TermsPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Terms &amp; Conditions – Cross Border Cart</title>
        <meta
          name="description"
          content="Read the terms and conditions for using Cross Border Cart."
        />
      </Head>

      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={h1Style}>Terms &amp; Conditions</h1>
        <p style={pStyle}>
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <p style={pStyle}>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of
          Cross Border Cart (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
          and our website, services and tools. By creating an account or using
          our services, you agree to these Terms.
        </p>

        <h2 style={h2Style}>1. Our service</h2>
        <p style={pStyle}>
          Cross Border Cart provides you with a UAE shipping address and
          facilitates receiving, consolidating and forwarding your shipments to
          your chosen destination, using third-party logistics partners.
        </p>

        <h2 style={h2Style}>2. Your responsibilities</h2>
        <ul style={listStyle}>
          <li>
            You are responsible for the accuracy of the information you provide,
            including names, addresses and declared values.
          </li>
          <li>
            You must ensure that items you ship are allowed under the laws of
            the origin and destination country and are not prohibited or
            restricted.
          </li>
          <li>
            You agree not to use our service for illegal or fraudulent
            activities.
          </li>
          <li>
  You are responsible for providing accurate package descriptions, values,
  quantities and supporting documents required for shipping, customs and compliance.
</li>
        </ul>

        <h2 style={h2Style}>3. Prohibited items</h2>
        <p style={pStyle}>
          You may not ship items that are illegal, dangerous or prohibited by
          airlines, couriers or customs authorities. This may include (but is
          not limited to) weapons, explosives, flammable liquids, certain
          batteries, drugs or counterfeit goods. We reserve the right to refuse
          or discard shipments that violate these rules.
        </p>

        <h2 style={h2Style}>4. Fees and payments</h2>
        <p style={pStyle}>
          You agree to pay all applicable shipping fees, service charges and any
          taxes or duties related to your shipments. Final amounts depend on
          weight, dimensions, destination, selected service and any extra
          services such as insurance or consolidation.
        </p>

        <h2 style={h2Style}>5. Customs, duties and regulations</h2>
        <p style={pStyle}>
          You are responsible for complying with customs regulations in your
          country and for paying any customs duties, taxes or import fees that
          may apply. We may assist with basic documentation but cannot provide
          legal or tax advice.
        </p>

       <h2 style={h2Style}>6. Limitation of liability</h2>
<p style={pStyle}>
We will take reasonable care in handling shipments and coordinating delivery
through third-party logistics partners. However, we do not guarantee that any
shipment will be delivered without delay, loss or damage.
</p>
<p style={pStyle}>
To the fullest extent permitted by law, Cross Border Cart will not be liable
for any indirect, incidental, special or consequential loss, including loss of
profit, business interruption or loss arising from customs delays, seizure,
carrier actions or events beyond our reasonable control.
</p>
<p style={pStyle}>
Where liability cannot be excluded, our liability will be limited to the amount
of the service fee paid to us for the affected shipment, unless additional
declared protection or insurance was explicitly purchased and confirmed.
</p>

        <h2 style={h2Style}>7. Account usage and termination</h2>
        <p style={pStyle}>
          We may suspend or terminate your account if we reasonably believe that
          you have violated these Terms, used our service for illegal purposes
          or created risk or possible legal exposure for us or others.
        </p>

        <h2 style={h2Style}>8. Refunds and cancellations</h2>
<p style={pStyle}>
Shipping fees, service charges and related payments are generally non-refundable
once shipment processing, consolidation, handling or forwarding has begun.
If a payment was made in error or a shipment cannot be processed due to reasons
within our control, we may review the matter and issue a partial or full refund
at our discretion.
</p>
<p style={pStyle}>
Refund requests must be submitted to our support team with the relevant shipment
or payment details. Any approved refund will be processed back to the original
payment method where possible.
</p>

<h2 style={h2Style}>9. Delivery timelines</h2>
<p style={pStyle}>
Any delivery or transit times shown on our website or shared by support are
estimates only. Actual delivery times may vary due to customs clearance,
airline schedules, weather, security checks, public holidays, destination
country processes or other events beyond our control.
</p>

<h2 style={h2Style}>10. Inspection and refusal of shipments</h2>
<p style={pStyle}>
We reserve the right to inspect shipment information, request supporting
documents, refuse acceptance, pause processing, return or dispose of packages
where reasonably necessary for safety, legal, customs or compliance reasons.
This includes cases involving prohibited items, inaccurate declarations,
unpaid charges or suspected fraud.
</p>

<h2 style={h2Style}>11. Governing law</h2>
<p style={pStyle}>
These Terms are governed by the laws applicable in the jurisdiction in which
Cross Border Cart operates, unless otherwise required by mandatory consumer law.
Any disputes arising from these Terms will be subject to the competent courts
of that jurisdiction.
</p>

        <h2 style={h2Style}>12. Changes to these Terms</h2>
        <p style={pStyle}>
          We may update these Terms from time to time. When we do, we will
          update the &quot;Last updated&quot; date above. Your continued use of
          our service after changes are posted means you accept the updated
          Terms.
        </p>

        <h2 style={h2Style}>9. Contact us</h2>
        <p style={pStyle}>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p style={pStyle}>
          Email: support@crossbordercart.com
          <br />
          
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
