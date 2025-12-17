// components/SiteHeader.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const colors = {
  mint: "#22c55e",
};

const headerShell: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 40,
  background: "#ffffff",
  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
};

const nav: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "10px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const navLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const navCenter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
};

const navRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const brandName: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 18,
  color: "#0f172a",
};

const navLinkBase: React.CSSProperties = {
  fontSize: 13,
  color: "#475569",
  textDecoration: "none",
  fontWeight: 500,
  padding: "4px 0px",
};

const navBtn: React.CSSProperties = {
  borderRadius: 999,
  padding: "7px 18px",
  fontWeight: 600,
  fontSize: 13,
  textDecoration: "none",
};

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const active = router.pathname === href;

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
  return (
    <header style={headerShell}>
      <nav style={nav}>
        <div style={navLeft}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ position: "relative", width: 42, height: 42 }}>
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

        <div style={navCenter}>
          <NavLink href="/why">Why Cross Border Cart</NavLink>
          <NavLink href="/how-it-works">How it works</NavLink>
          <NavLink href="/stores">Stores</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/faq">FAQ</NavLink>
        </div>

        <div style={navRight}>
          <Link
            href="/login"
            style={{ ...navBtn, border: "1px solid #cbd5f5", color: "#0f172a" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              ...navBtn,
              background: colors.mint,
              color: "#022c22",
              boxShadow: "0 10px 25px rgba(34, 197, 158, 0.35)",
            }}
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
