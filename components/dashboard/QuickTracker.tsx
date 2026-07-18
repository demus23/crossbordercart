// components/dashboard/QuickTracker.tsx
// Replaces the existing Quick Track section with a shareable public link

import { useState } from "react";
import Link from "next/link";

interface Props {
  defaultTracking?: string;
}

export default function QuickTracker({ defaultTracking = "" }: Props) {
  const [tracking, setTracking] = useState(defaultTracking);
  const [copied,   setCopied]   = useState(false);

  const publicUrl = tracking ? `https://crossbordercart.com/track/${tracking.trim().toUpperCase()}` : "";

  function copyLink() {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div style={S.card}>
      <div style={S.head}>
        <span style={S.title}>🔍 Quick track</span>
        {tracking && (
          <span style={S.badge}>Share tracking link</span>
        )}
      </div>
      <div style={S.body}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Enter tracking number"
            style={{ ...S.inp, flex: 1 }}
          />
          <Link
            href={tracking ? `/track/${tracking.trim().toUpperCase()}` : "#"}
            style={{
              ...S.actionBtn,
              background: "#00E5A0", color: "#002B1A",
              opacity: tracking ? 1 : 0.5,
              pointerEvents: tracking ? "auto" : "none",
            }}
          >
            Track
          </Link>
          <button
            onClick={copyLink}
            disabled={!tracking}
            title="Copy shareable tracking link"
            style={{ ...S.actionBtn, background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}
          >
            {copied ? "✓ Copied" : "Share link"}
          </button>
        </div>

        {publicUrl && (
          <div style={S.linkBox}>
            <span style={{ fontSize: 11, color: "#64748b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {publicUrl}
            </span>
            <button onClick={copyLink} style={{ fontSize: 11, color: "#38bdf8", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        )}

        {copied && (
          <div style={{ fontSize: 11, color: "#00e5a0", marginTop: 6 }}>
            ✓ Link copied — share with anyone to let them track this parcel without logging in
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card:      { border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", background: "rgba(17,28,52,0.75)", backdropFilter: "blur(20px)" },
  head:      { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title:     { fontSize: 13, fontWeight: 700, color: "#f1f5f9" },
  badge:     { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(56,189,248,0.12)", color: "#38bdf8" },
  body:      { padding: 16 },
  inp:       { padding: "9px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 13, outline: "none" },
  actionBtn: { padding: "9px 14px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", border: "none", textDecoration: "none", display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" as any },
  linkBox:   { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10 },
};
