// components/SiteHeader.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const colors = {
  mint: "#22c55e",
};

const headerShell: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 60,
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
};

const nav: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "10px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  position: "relative", // ✅ for dropdown positioning
};

const navLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const brandName: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
  color: "#0f172a",
  whiteSpace: "nowrap",
};

const navLinkBase: React.CSSProperties = {
  fontSize: 13,
  color: "#475569",
  textDecoration: "none",
  fontWeight: 600,
  padding: "6px 0px",
  whiteSpace: "nowrap",
};

const navBtnBase: React.CSSProperties = {
  borderRadius: 999,
  padding: "9px 16px",
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
  gap: 18,
};

const rightRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const hamburgerBtn: React.CSSProperties = {
  display: "none", // will be enabled via small inline logic below
  border: 0,
  background: "transparent",
  padding: 10,
  cursor: "pointer",
  borderRadius: 10,
};

const bar: React.CSSProperties = {
  height: 2,
  width: 22,
  background: "#0f172a",
  borderRadius: 999,
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const active =
    router.pathname === href || router.pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      style={{
        ...navLinkBase,
        ...(active && {
          color: "#0f172a",
          borderBottom: `2px solid ${colors.mint}`,
        }),
      }}
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  // close on route change
  const router = useRouter();
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events]);

  return (
    <header style={headerShell}>
      <nav style={nav}>
        {/* Left: Logo + brand */}
        <div style={navLeft}>
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
          >
            <div style={{ position: "relative", width: 42, height: 42, flex: "0 0 auto" }}>
              <Image
                src="/cross-border-cart-logo.png"
                alt="Cross Border Cart logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
            <span style={brandName}>
              C<span style={{ color: colors.mint }}>r</span>oss Border Cart
            </span>
          </Link>
        </div>

        {/* Desktop center links */}
        <div className="siteheader-desktop" style={desktopRow}>
          <NavLink href="/why">Why Cross Border Cart</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/stores">Stores</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
           <NavLink href="/about">About</NavLink>
        </div>

        {/* Desktop right buttons */}
        <div className="siteheader-desktop" style={rightRow}>
          <Link
            href="/login"
            style={{ ...navBtnBase, border: "1px solid #cbd5f5", color: "#0f172a", background: "#fff" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              ...navBtnBase,
              background: colors.mint,
              color: "#022c22",
              boxShadow: "0 10px 25px rgba(34, 197, 158, 0.35)",
            }}
          >
            Get started
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
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 12,
              boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              zIndex: 80,
            }}
          >
            <NavLink href="/why">Why Cross Border Cart</NavLink>
            <NavLink href="/how-it-works">How it works</NavLink>
            <NavLink href="/stores">Stores</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/faq">FAQ</NavLink>

            <div style={{ height: 1, background: "#e2e8f0", margin: "6px 0" }} />

            <Link
              href="/login"
              style={{
                ...navBtnBase,
                width: "100%",
                borderRadius: 14,
                border: "1px solid #cbd5f5",
                color: "#0f172a",
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
                background: colors.mint,
                color: "#022c22",
                padding: "12px 14px",
              }}
            >
              Get started
            </Link>
          </div>
        )}
      </nav>

      {/* Tiny CSS to hide/show desktop vs mobile */}
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
