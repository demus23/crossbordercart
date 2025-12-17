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
};

const brandName: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 18,
  marginBottom: 6,
};

const colTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
};

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#cbd5f5",
  textDecoration: "none",
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

const footerBottom: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  borderTop: "1px solid rgba(148,163,184,0.3)",
  paddingTop: 10,
  fontSize: 12,
  color: "#9ca3af",
};

export default function SiteFooter() {
  return (
    <footer style={footerShell}>
      <div style={footerInner}>
        {/* TOP */}
        <div style={footerTop}>
          {/* Brand & short description */}
          <div style={brandBlock}>
            <div style={brandName}>Cross Border Cart</div>
            <p style={{ fontSize: 13, color: "#9ca3af", maxWidth: 340 }}>
              UAE-based parcel forwarding for shoppers and resellers who want
              Dubai prices with simple, transparent cross-border shipping.
            </p>

            <div style={{ marginTop: 10 }}>
              <div style={colTitle}>Connect</div>
              <div style={socialsRow}>
                {/* TODO: replace # with your real links */}
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  style={socialIcon}
                >
                  f
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  style={socialIcon}
                >
                  {/* looks like a simple camera if you like, or use "ig" */}
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="X / Twitter"
                  style={socialIcon}
                >
                  X
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  style={socialIcon}
                >
                  in
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  style={socialIcon}
                >
                  WA
                </a>
              </div>
            </div>
          </div>

          {/* Product column */}
          <div>
            <div style={colTitle}>Product</div>
            <div style={linkCol}>
              <Link href="/how-it-works" style={linkStyle}>
                How it works
              </Link>
              <Link href="/why" style={linkStyle}>
                Why Cross Border Cart
              </Link>
              <Link href="/stores" style={linkStyle}>
                Stores
              </Link>
              <Link href="/pricing" style={linkStyle}>
                Pricing
              </Link>
            </div>
          </div>

          {/* Company column */}
          <div>
            <div style={colTitle}>Company</div>
            <div style={linkCol}>
              <Link href="/about" style={linkStyle}>
                About (coming soon)
              </Link>
              <span style={linkStyle}>Blog (coming soon)</span>
              <span style={linkStyle}>Partner with us (soon)</span>
              <span style={linkStyle}>Contact (soon)</span>
            </div>
          </div>

          {/* Support / Legal column */}
          <div>
            <div style={colTitle}>Support</div>
            <div style={linkCol}>
              <Link href="/faq" style={linkStyle}>
                Help &amp; FAQ
              </Link>
              <span style={linkStyle}>Shipping guidelines (soon)</span>
              <span style={linkStyle}>What you cannot ship (soon)</span>
              <Link href="/legal/privacy" style={linkStyle}>
                Privacy Policy
              </Link>
              <Link href="/legal/terms" style={linkStyle}>
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={footerBottom}>
          <div>
            © {new Date().getFullYear()} Cross Border Cart. All rights reserved.
          </div>
          <div>
            Built with <span style={{ color: "#f97316" }}>❤️</span> in the UAE &amp;
            Africa.
          </div>
        </div>
      </div>
    </footer>
  );
}
