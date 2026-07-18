// components/dashboard/DeliveryEstimator.tsx
import { useState } from "react";
import Link from "next/link";

const COUNTRIES = [
  { flag:"🇰🇪", name:"Kenya",        air:"5–9",   sea:"21–28", city:"Nairobi"       },
  { flag:"🇳🇬", name:"Nigeria",       air:"7–12",  sea:"25–35", city:"Lagos"         },
  { flag:"🇬🇭", name:"Ghana",         air:"7–11",  sea:"25–35", city:"Accra"         },
  { flag:"🇿🇲", name:"Zambia",        air:"8–13",  sea:"28–35", city:"Lusaka"        },
  { flag:"🇹🇿", name:"Tanzania",      air:"5–9",   sea:"21–28", city:"Dar es Salaam" },
  { flag:"🇺🇬", name:"Uganda",        air:"6–10",  sea:"21–28", city:"Kampala"       },
  { flag:"🇪🇹", name:"Ethiopia",      air:"9–14",  sea:"30–40", city:"Addis Ababa"   },
  { flag:"🇿🇦", name:"South Africa",  air:"10–16", sea:"35–45", city:"Johannesburg"  },
  { flag:"🇬🇧", name:"United Kingdom",air:"5–8",   sea:"28–35", city:"London"        },
  { flag:"🇺🇸", name:"United States", air:"6–10",  sea:"30–40", city:"New York"      },
  { flag:"🇮🇳", name:"India",         air:"4–7",   sea:"18–25", city:"Mumbai"        },
  { flag:"🇵🇰", name:"Pakistan",      air:"3–6",   sea:"15–22", city:"Karachi"       },
];

export default function DeliveryEstimator() {
  const [selected, setSelected] = useState<typeof COUNTRIES[0] | null>(null);

  return (
    <div style={S.card}>
      <div style={S.head}>
        <span style={S.title}>🕐 Delivery time estimator</span>
        <span style={S.badge}>New</span>
      </div>
      <div style={S.body}>
        {selected ? (
          /* Detail view */
          <div>
            <button onClick={() => setSelected(null)} style={S.back}>← All countries</button>
            <div style={S.detailHead}>
              <span style={{ fontSize: 32 }}>{selected.flag}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>Dubai → {selected.city}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{selected.name}</div>
              </div>
            </div>
            <div style={S.modeGrid}>
              <div style={S.modeCard}>
                <div style={{ fontSize: 20 }}>✈️</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: "6px 0 2px" }}>Air freight</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#00e5a0" }}>{selected.air}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>business days</div>
              </div>
              <div style={{ ...S.modeCard, borderColor: "rgba(56,189,248,0.25)" }}>
                <div style={{ fontSize: 20 }}>🚢</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", margin: "6px 0 2px" }}>Sea freight</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#38bdf8" }}>{selected.sea}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>business days</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 10 }}>
              Times are estimates from Dubai departure. Customs delays not included.
            </div>
            <Link href="/signup" style={S.ctaLink}>Ship to {selected.name} now →</Link>
          </div>
        ) : (
          /* Grid view */
          <div style={S.countryGrid}>
            {COUNTRIES.map((c) => (
              <div key={c.name} onClick={() => setSelected(c)} style={S.countryCard}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{c.flag}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "#00e5a0", marginTop: 2 }}>{c.air} days ✈️</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card:        { border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", background: "rgba(17,28,52,0.75)", backdropFilter: "blur(20px)" },
  head:        { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title:       { fontSize: 13, fontWeight: 700, color: "#f1f5f9" },
  badge:       { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(0,229,160,0.12)", color: "#00e5a0" },
  body:        { padding: 16 },
  countryGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  countryCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 8px", textAlign: "center", cursor: "pointer", transition: "all .2s" },
  back:        { fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", marginBottom: 14, padding: 0 },
  detailHead:  { display: "flex", alignItems: "center", gap: 14, marginBottom: 18 },
  modeGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  modeCard:    { background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 14, padding: "14px 12px", textAlign: "center" },
  ctaLink:     { display: "block", marginTop: 14, textAlign: "center", padding: "10px", borderRadius: 99, background: "#00E5A0", color: "#002B1A", fontWeight: 800, fontSize: 13, textDecoration: "none" },
};
