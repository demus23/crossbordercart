// components/dashboard/ShippingCalculator.tsx
// Drop this inside your dashboard.tsx

import { useState, useEffect } from "react";

const COUNTRIES = [
  "Kenya","Nigeria","Ghana","Tanzania","Zambia",
  "Uganda","Ethiopia","South Africa","United Kingdom",
  "United States","India","Pakistan",
];

interface Result {
  air: { total: number; days: string };
  sea: { total: number; days: string };
  note: string;
}

export default function ShippingCalculator() {
  const [weight,  setWeight]  = useState(3);
  const [country, setCountry] = useState("Kenya");
  const [result,  setResult]  = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function calculate() {
    if (!weight || weight <= 0) return;
    setLoading(true);
    try {
      const r    = await fetch(`/api/dashboard/shipping-rates?weight=${weight}&country=${encodeURIComponent(country)}`);
      const data = await r.json();
      if (r.ok) setResult(data);
    } finally {
      setLoading(false);
    }
  }

  // Auto-calculate on change
  useEffect(() => { calculate(); }, [weight, country]);

  return (
    <div style={S.card}>
      <div style={S.head}>
        <span style={S.title}>📦 Shipping cost calculator</span>
        <span style={S.badge}>New</span>
      </div>
      <div style={S.body}>
        <div style={S.row2}>
          <label style={S.fld}>
            <span style={S.lbl}>Weight (kg)</span>
            <input
              type="number" min="0.1" step="0.5" value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              style={S.inp}
            />
          </label>
          <label style={S.fld}>
            <span style={S.lbl}>Destination</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} style={S.inp}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {loading && <div style={S.loading}>Calculating…</div>}

        {result && !loading && (
          <div style={S.results}>
            {/* Air */}
            <div style={S.resultCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={S.resultLabel}>✈️ Air freight</div>
                  <div style={S.resultPrice}>AED {result.air.total.toFixed(2)}</div>
                </div>
                <div style={S.resultDays}>{result.air.days} days</div>
              </div>
            </div>
            {/* Sea */}
            <div style={{ ...S.resultCard, background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ ...S.resultLabel, color: "#38bdf8" }}>🚢 Sea freight</div>
                  <div style={{ ...S.resultPrice, color: "#38bdf8" }}>AED {result.sea.total.toFixed(2)}</div>
                </div>
                <div style={{ ...S.resultDays, color: "#38bdf8" }}>{result.sea.days} days</div>
              </div>
            </div>
          </div>
        )}
        <div style={S.note}>Estimate only · Includes AED 15 handling · Final price on actual dimensions</div>
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
  row2:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 },
  fld:         { display: "flex", flexDirection: "column", gap: 5 },
  lbl:         { fontSize: 11, color: "#64748b" },
  inp:         { padding: "9px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 13, outline: "none", width: "100%" },
  loading:     { textAlign: "center", fontSize: 12, color: "#64748b", padding: "10px 0" },
  results:     { display: "flex", flexDirection: "column", gap: 8 },
  resultCard:  { background: "rgba(0,229,160,0.07)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 12, padding: "12px 14px" },
  resultLabel: { fontSize: 11, color: "#00e5a0", marginBottom: 4 },
  resultPrice: { fontSize: 20, fontWeight: 900, color: "#00e5a0" },
  resultDays:  { fontSize: 12, fontWeight: 700, color: "#00e5a0", background: "rgba(0,229,160,0.1)", padding: "4px 10px", borderRadius: 99 },
  note:        { fontSize: 10, color: "#475569", marginTop: 10 },
};
