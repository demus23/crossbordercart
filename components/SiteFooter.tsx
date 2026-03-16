// components/SiteFooter.tsx
import React from "react";
import Link from "next/link";

const footerShell: React.CSSProperties = {
  marginTop: 80,
  padding: "32px 0 18px",
  background: "#0f172a",
  color: "#e5e7eb",
};

const footerInner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const footerTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 32,
  flexWrap: "wrap",
};

const brandBlock: React.CSSProperties = {
  minWidth: 220,
  maxWidth: 360,
};

const brandName: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 18,
  marginBottom: 6,
};

const brandText: React.CSSProperties = {
  fontSize: 13,
  color: "#9ca3af",
  maxWidth: 340,
  lineHeight: 1.7,
};

const colTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 8,
};

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#cbd5f5",
  textDecoration: "none",
  lineHeight: 1.8,
};

const linkCol: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  minWidth: 150,
};

const socialsRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 8,
};

const socialIcon: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  color: "#e5e7eb",
  textDecoration: "none",
};

const disclaimerBox: React.CSSProperties = {
  borderTop: "1px solid rgba(148,163,184,0.18)",
  borderBottom: "1px solid rgba(148,163,184,0.18)",
  padding: "14px 0",
  fontSize: 12,
  color: "#9ca3af",
  lineHeight: 1.7,
};

const footerBottom: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  fontSize: 12,
  color: "#9ca3af",
};

export default function SiteFooter() {
  return (
    <footer style={footerShell}>
      <div style={footerInner}>
        <div style={footerTop}>
          <div style={brandBlock}>
            <div style={brandName}>Cross Border Cart</div>

            <p style={brandText}>
              UAE-based parcel forwarding for shoppers and resellers who want
              Dubai prices with simple, transparent cross-border shipping.
            </p>

            <div style={{ marginTop: 10 }}>
              <div style={colTitle}>Connect</div>

              <div style={socialsRow}>
                <a
                  href="https://wa.me/971588178057"
                  target="_blank"
                  rel="noreferrer"
                  style={socialIcon}
                  aria-label="WhatsApp"
                >
                  WA
                </a>
              </div>
            </div>
          </div>

          <div>
            <div style={colTitle}>Product</div>

            <div style={linkCol}>
              <Link href="/how-it-works" style={linkStyle}>
                How it works
              </Link>
              <Link href="/pricing" style={linkStyle}>
                Pricing
              </Link>
              <Link href="/why" style={linkStyle}>
                Why Cross Border Cart
              </Link>
            </div>
          </div>

          <div>
            <div style={colTitle}>Company</div>

            <div style={linkCol}>
              <Link href="/about" style={linkStyle}>
                About Us
              </Link>
              <Link href="/contact" style={linkStyle}>
                Contact
              </Link>
            </div>
          </div>

          <div>
            <div style={colTitle}>Support</div>

            <div style={linkCol}>
              <Link href="/faq" style={linkStyle}>
                Help &amp; FAQ
              </Link>
              <Link href="/contact" style={linkStyle}>
                Contact
              </Link>
              <Link href="/policies/shipping" style={linkStyle}>
                Shipping Policy
              </Link>
              <Link href="/prohibited-items" style={linkStyle}>
                What You Cannot Ship
              </Link>
              <Link href="/policies/refunds" style={linkStyle}>
                Refund Policy
              </Link>
              <Link href="/legal/privacy" style={linkStyle}>
                Privacy Policy
              </Link>
              <Link href="/legal/terms" style={linkStyle}>
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>

        <div style={disclaimerBox}>
          Cross Border Cart is an independent parcel forwarding service. We do
          not sell products directly and we are not affiliated with the stores
          customers purchase from.
        </div>

        <div style={footerBottom}>
          <div>
            © {new Date().getFullYear()} Cross Border Cart. All rights reserved.
          </div>

          <div>
            Built with <span style={{ color: "#f97316" }}>❤️</span> in the UAE
            &amp; Africa.
          </div>
        </div>
      </div>
    </footer>
  );
}