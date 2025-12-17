// components/StoresStrip.tsx
import React, { useEffect, useRef } from "react";
import Link from "next/link";

const stripShell: React.CSSProperties = {
  marginTop: 40,
  padding: "18px 20px",
  borderRadius: 20,
  background: "#0f172a",
  color: "#e5e7eb",
  boxShadow: "0 14px 40px rgba(15,23,42,0.35)",
};

const stripHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const stripTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
};

const stripLink: React.CSSProperties = {
  fontSize: 13,
  color: "#a5b4fc",
  textDecoration: "none",
};

const rail: React.CSSProperties = {
  display: "flex",
  gap: 20,
  overflow: "hidden",
  position: "relative",
};

const logoCard: React.CSSProperties = {
  minWidth: 130,
  padding: "10px 12px",
  borderRadius: 14,
  background: "#020617",
  border: "1px solid rgba(148,163,184,0.4)",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const logoName: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
};

const logoTag: React.CSSProperties = {
  fontSize: 11,
  color: "#9ca3af",
};

type Store = {
  name: string;
  tagline: string;
  deal?: string;
  href: string;
};

const STORES: Store[] = [
  {
    name: "Amazon",
    tagline: "Everything in one basket",
    deal: "Prime & UAE deals",
    href: "#",
  },
  {
    name: "Shein",
    tagline: "Fashion & home",
    deal: "Extra 10–20% codes",
    href: "#",
  },
  {
    name: "Sephora",
    tagline: "Beauty & fragrance",
    deal: "Gifts & mini sets",
    href: "#",
  },
  {
    name: "Namshi",
    tagline: "Gulf fashion",
    deal: "Daily flash sales",
    href: "#",
  },
  {
    name: "Noon",
    tagline: "Electronics & more",
    deal: "Yellow Friday offers",
    href: "#",
  },
  {
    name: "Carrefour",
    tagline: "Groceries & bulk",
    deal: "Weekly promos",
    href: "#",
  },
];

export default function StoresStrip() {
  const railRef = useRef<HTMLDivElement | null>(null);

  // simple auto-scroll effect
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    let offset = 0;
    const id = window.setInterval(() => {
      offset += 0.5; // speed
      el.scrollLeft = offset;
      // loop when reaching end
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        offset = 0;
        el.scrollLeft = 0;
      }
    }, 20);

    return () => window.clearInterval(id);
  }, []);

  return (
    <section style={stripShell}>
      <div style={stripHeader}>
        <div style={stripTitle}>Top stores our users love</div>
        <Link href="/stores" style={stripLink}>
          View all stores →
        </Link>
      </div>

      <div style={rail} ref={railRef}>
        {/* duplicate list to make loop smoother */}
        {[...STORES, ...STORES].map((store, idx) => (
          <a
            key={store.name + idx}
            href={store.href}
            target="_blank"
            rel="noreferrer"
            style={logoCard}
          >
            <div style={logoName}>{store.name}</div>
            <div style={logoTag}>{store.tagline}</div>
            {store.deal && (
              <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>
                {store.deal}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
