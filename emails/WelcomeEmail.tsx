// emails/WelcomeEmail.tsx
//
// React Email template for the new-user welcome email, sent via the existing
// lib/email/resend.ts sendEmail() helper (react prop, not raw html).
//
// If @react-email/components isn't already installed alongside @react-email/render:
//   npm install @react-email/components

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
  suite: string;
}

export default function WelcomeEmail({ name, suite }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to CrossBorderCart — your Suite number is {suite}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome, {name} 🎉</Heading>
          <Text style={text}>
            Your CrossBorderCart account is ready. You can now shop from UAE stores and
            have your packages forwarded straight to you.
          </Text>

          <Section style={suiteBox}>
            <Text style={suiteLabel}>Your Suite Number</Text>
            <Text style={suiteValue}>{suite}</Text>
          </Section>

          <Text style={text}>
            Use this Suite number as your shipping address when checking out on UAE
            stores — we'll receive, consolidate, and forward your packages from there.
          </Text>

          <Hr style={hr} />

          <Text style={footerText}>
            Questions? Just reply to this email, or message us on WhatsApp — we're
            happy to help.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Inline styles — React Email doesn't support external stylesheets reliably
// across email clients, so styles are defined as plain objects here.
const main = {
  backgroundColor: "#0B1220",
  fontFamily: "Arial, sans-serif",
  padding: "32px 0",
};

const container = {
  backgroundColor: "#0B1220",
  maxWidth: "480px",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "12px",
  border: "1px solid rgba(14, 165, 162, 0.25)",
};

const heading = {
  color: "#00E5A0",
  fontSize: "22px",
  marginBottom: "16px",
};

const text = {
  color: "#f6fbfb",
  fontSize: "15px",
  lineHeight: "1.6",
};

const suiteBox = {
  backgroundColor: "rgba(14, 165, 162, 0.12)",
  border: "1px solid rgba(14, 165, 162, 0.3)",
  borderRadius: "10px",
  padding: "16px 20px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const suiteLabel = {
  color: "rgba(246, 251, 251, 0.65)",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  margin: "0 0 4px",
};

const suiteValue = {
  color: "#0ea5a2",
  fontSize: "24px",
  fontWeight: "bold",
  margin: 0,
};

const hr = {
  borderColor: "rgba(14, 165, 162, 0.2)",
  margin: "24px 0",
};

const footerText = {
  color: "rgba(246, 251, 251, 0.6)",
  fontSize: "13px",
};