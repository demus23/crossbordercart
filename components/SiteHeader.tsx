// components/SiteHeader.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

/* Matches the homepage design system: deep navy + brass gold. */
const colors = {
  navy: "#0F2340",
  navyDeep: "#081527",
  gold: "#C9A227",
  goldDark: "#A8841A",
  goldSoft: "#F3E7C9",
  ink: "#1C2436",
  muted: "#68707F",
  line: "#EAE3D2",
};

const headerShell: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 60,
  background: "rgba(255,255,255,0.94)",
  backdropFilter: "blur(10px)",
  borderBottom: `1px solid ${colors.line}`,
};

const nav: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  position: "relative",
};

const navLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const brandStack: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.1,
};

const brandCBC: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 17,
  color: colors.navy,
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
};

const brandFull: React.CSSProperties = {
  fontWeight: 500,
  fontSize: 10.5,
  color: colors.muted,
  whiteSpace: "nowrap",
  letterSpacing: "0.02em",
};

const navLinkBase: React.CSSProperties = {
  fontSize: 13,
  color: colors.muted,
  textDecoration: "none",
  fontWeight: 600,
  padding: "6px 0px",
  whiteSpace: "nowrap",
  borderBottom: "2px solid transparent",
};

const navBtnBase: React.CSSProperties = {
  borderRadius: 999,
  padding: "10px 18px",
  fontWeight: 700,
  fontSize: 13,
  textDecoration: "none",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const desktopRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const rightRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const hamburgerBtn: React.CSSProperties = {
  display: "none",
  border: 0,
  background: "transparent",
  padding: 10,
  cursor: "pointer",
  borderRadius: 10,
};

const bar: React.CSSProperties = {
  height: 2,
  width: 22,
  background: colors.navy,
  borderRadius: 999,
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  const active = router.pathname === href || router.pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      style={{
        ...navLinkBase,
        ...(active && {
          color: colors.navy,
          borderBottom: `2px solid ${colors.gold}`,
        }),
      }}
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events]);

  return (
    <header style={headerShell}>
      <nav style={nav}>
        {/* Left: Logo — CBC dominant, "Cross Border Cart" secondary */}
        <div style={navLeft}>
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, textDecoration: "none" }}
          >
            <div style={{ position: "relative", width: 40, height: 40, flex: "0 0 auto" }}>
              <Image
                src="/cross-border-cart-logo.png"
                alt="CBC logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <div style={brandStack}>
              <span style={brandCBC}>CBC</span>
              <span style={brandFull}>Cross Border Cart</span>
            </div>
          </Link>
        </div>

        {/* Desktop center links */}
        <div className="siteheader-desktop" style={desktopRow}>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/shipping">Shipping rates</NavLink>
          <NavLink href="/destinations">Destinations</NavLink>
          <NavLink href="/guides">Shopping Guides</NavLink>
          <NavLink href="/track">Track package</NavLink>
          <NavLink href="/faq">Help</NavLink>
        </div>

        {/* Desktop right buttons */}
        <div className="siteheader-desktop" style={rightRow}>
          <Link
            href="/login"
            style={{ ...navBtnBase, border: `1.5px solid ${colors.line}`, color: colors.navy, background: "#fff" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              ...navBtnBase,
              background: `linear-gradient(155deg, ${colors.gold}, ${colors.goldDark})`,
              color: "#fff",
              boxShadow: "0 10px 22px -10px rgba(169,132,26,0.55)",
            }}
          >
            Get My UAE Address
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="siteheader-mobile"
          style={{ ...hamburgerBtn, display: "inline-flex", flexDirection: "column", gap: 6 }}
        >
          <span style={bar} />
          <span style={bar} />
          <span style={bar} />
        </button>

        {/* Mobile dropdown */}
        {open && (
          <div
            className="siteheader-mobile"
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              top: "62px",
              background: "#fff",
              border: `1px solid ${colors.line}`,
              borderRadius: 16,
              padding: 12,
              boxShadow: "0 16px 40px rgba(15,35,64,0.14)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              zIndex: 80,
            }}
          >
            <NavLink href="/how-it-works">How it works</NavLink>
            <NavLink href="/shipping">Shipping rates</NavLink>
            <NavLink href="/destinations">Destinations</NavLink>
            <NavLink href="/guides">Shopping Guides</NavLink>
            <NavLink href="/track">Track package</NavLink>
            <NavLink href="/faq">Help</NavLink>

            <div style={{ height: 1, background: colors.line, margin: "6px 0" }} />

            <Link
              href="/login"
              style={{
                ...navBtnBase,
                width: "100%",
                borderRadius: 14,
                border: `1.5px solid ${colors.line}`,
                color: colors.navy,
                background: "#fff",
                padding: "12px 14px",
              }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                ...navBtnBase,
                width: "100%",
                borderRadius: 14,
                background: `linear-gradient(155deg, ${colors.gold}, ${colors.goldDark})`,
                color: "#fff",
                padding: "12px 14px",
              }}
            >
              Get My UAE Address
            </Link>
          </div>
        )}
      </nav>

      <style jsx>{`
        @media (max-width: 860px) {
          :global(.siteheader-desktop) {
            display: none !important;
          }
        }
        @media (min-width: 861px) {
          :global(.siteheader-mobile) {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}