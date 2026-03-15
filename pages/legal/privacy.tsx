// pages/legal/privacy.tsx
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

export default function PrivacyPage() {
  return (
    <div style={pageShell}>
      <Head>
        <title>Privacy Policy – Cross Border Cart</title>
        <meta
          name="description"
          content="Learn how Cross Border Cart collects, uses and protects your personal information."
        />
      </Head>

      <SiteHeader />

      <main style={mainStyle}>
        <h1 style={h1Style}>Privacy Policy</h1>
        <p style={pStyle}>
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>

        <p style={pStyle}>
          This Privacy Policy explains how Cross Border Cart (&quot;we&quot;,
          &quot;us&quot; or &quot;our&quot;) collects, uses and protects your
          information when you use our website, create an account or interact
          with our services.
        </p>

        <h2 style={h2Style}>1. Information we collect</h2>
        <p style={pStyle}>We may collect the following types of information:</p>
        <ul style={listStyle}>
          <li>Contact details such as name, email address and phone number</li>
          <li>
            Account details such as your login information and shipping
            preferences
          </li>
          <li>
            Shipment details such as package descriptions, values, addresses and
            tracking numbers
          </li>
          <li>
            Technical data such as IP address, browser information and basic
            analytics
          </li>
        </ul>

        <h2 style={h2Style}>2. How we use your information</h2>
        <p style={pStyle}>
          We use your information to operate and improve Cross Border Cart,
          including:
        </p>
        <ul style={listStyle}>
          <li>Creating and managing your account</li>
          <li>Processing shipments and providing tracking updates</li>
          <li>Communicating with you about your shipments or support requests</li>
          <li>Sending service updates and, where permitted, marketing emails</li>
          <li>Improving our routes, pricing and overall service</li>
        </ul>

        <h2 style={h2Style}>3. Sharing of information</h2>
        <p style={pStyle}>
          We may share your information with trusted third parties only when
          necessary, for example:
        </p>
        <ul style={listStyle}>
          <li>Logistics partners and couriers that move your shipments</li>
          <li>
            Payment providers that process your payments securely (e.g. Stripe)
          </li>
          <li>
            Service providers that help us with hosting, analytics or customer
            support
          </li>
        </ul>
        <p style={pStyle}>
          We do not sell your personal data to third parties.
        </p>

        <h2 style={h2Style}>4. Data retention</h2>
        <p style={pStyle}>
          We keep your information for as long as necessary to provide our
          service, comply with legal obligations and resolve disputes. You may
          request deletion of your account by contacting us.
        </p>

        <h2 style={h2Style}>5. Security</h2>
        <p style={pStyle}>
          We use reasonable technical and organisational measures to protect
          your information. However, no method of transmission or storage is
          100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 style={h2Style}>6. Your rights</h2>
        <p style={pStyle}>
          Depending on your location, you may have rights to access, correct or
          delete your personal data, or to object to certain processing. To
          exercise these rights, contact us using the details below.
        </p>

        <h2 style={h2Style}>7. Cookies and tracking technologies</h2>
<p style={pStyle}>
Cross Border Cart uses cookies and similar technologies to improve
website performance, remember user preferences and analyse traffic.
These technologies help us understand how visitors use our services
and allow us to improve our platform.
</p>

<p style={pStyle}>
You can control cookies through your browser settings. However,
disabling cookies may affect certain features of the website.
</p>

<h2 style={h2Style}>8. International data transfers</h2>
<p style={pStyle}>
Because Cross Border Cart provides international shipping services,
your information may be transferred to logistics partners or service
providers located in different countries. We ensure that appropriate
safeguards are in place to protect your personal data.
</p>

<h2 style={h2Style}>9. Changes to this Privacy Policy</h2>
<p style={pStyle}>
We may update this Privacy Policy from time to time to reflect
changes in our services, legal requirements or business operations.
Updates will be posted on this page with a revised "Last updated"
date.
</p>

        <h2 style={h2Style}>10. Contact us</h2>
        <p style={pStyle}>
          If you have any questions about this Privacy Policy, you can contact
          us at:
        </p>
        <p style={pStyle}>
          Email: support.crossbordercart@gmail.com
          <br />
          
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
