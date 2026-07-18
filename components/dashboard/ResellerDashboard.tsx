// components/dashboard/ResellerDashboard.tsx
import { useState } from "react";

interface Package {
  id:          string;
  trackingNo:  string;
  description: string;
  costAED:     number;
  sellingAED?: number;
  weight:      number;
  status:      string;
}

interface Props {
  packages: Package[]; // pass in from parent dashboard page
}

export default function ResellerDashboard({ packages }: Props) {
  const [pkgs, setPkgs] = useState<Package[]>(packages);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const totalCost   = pkgs.reduce((s, p) => s + p.costAED, 0);
  const totalSell   = pkgs.filter(p => p.sellingAED).reduce((s, p) => s + (p.sellingAED ?? 0), 0);
  const totalProfit = totalSell - totalCost;
  const margin      = totalSell > 0 ? Math.round((totalProfit / totalSell) * 100) : 0;

  function saveSellingPrice(id: string) {
    const val = parseFloat(editVal);
    if (!val || val <= 0) return;
    setPkgs(ps => ps.map(p => p.id === id ? { ...p, sellingAED: val } : p));
    setEditId(null);
    setEditVal("");
  }

  function exportCSV() {
    const rows = [
      ["Tracking", "Description", "Cost (AED)", "Selling price (AED)", "Profit (AED)", "Margin %", "Status"],
      ...pkgs.map(p => [
        p.trackingNo, p.description,
        p.costAED.toFixed(2),
        p.sellingAED?.toFixed(2) ?? "—",
        p.sellingAED ? (p.sellingAED - p.costAED).toFixed(2) : "—",
        p.sellingAED ? Math.round(((p.sellingAED - p.costAED) / p.sellingAED) * 100) + "%" : "—",
        p.status,
      ]),
    ];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "cbc-reseller-report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={S.card}>
      <div style={S.head}>
        <span style={S.title}>📊 Reseller dashboard</span>
        <span style={S.badge}>New</span>
      </div>
      <div style={S.body}>
        {/* Summary stats */}
        <div style={S.statsRow}>
          <div style={S.stat}>
            <div style={S.statLabel}>Total cost</div>
            <div style={S.statVal}>AED {totalCost.toFixed(2)}</div>
          </div>
          <div style={S.stat}>
            <div style={S.statLabel}>Total revenue</div>
            <div style={S.statVal}>AED {totalSell.toFixed(2)}</div>
          </div>
          <div style={{ ...S.stat, background: totalProfit > 0 ? "rgba(0,229,160,0.08)" : "rgba(239,68,68,0.08)", borderColor: totalProfit > 0 ? "rgba(0,229,160,0.2)" : "rgba(239,68,68,0.2)" }}>
            <div style={S.statLabel}>Net profit</div>
            <div style={{ ...S.statVal, color: totalProfit >= 0 ? "#00e5a0" : "#f87171" }}>
              {totalProfit >= 0 ? "+" : ""}AED {totalProfit.toFixed(2)}
            </div>
          </div>
          <div style={S.stat}>
            <div style={S.statLabel}>Avg margin</div>
            <div style={{ ...S.statVal, color: margin > 0 ? "#00e5a0" : "#64748b" }}>{margin}%</div>
          </div>
        </div>

        {/* Package table */}
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, marginTop: 4 }}>
          Click "Add selling price" to calculate your profit per shipment
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pkgs.map((p) => {
            const profit = p.sellingAED ? p.sellingAED - p.costAED : null;
            const mg     = p.sellingAED ? Math.round((profit! / p.sellingAED) * 100) : null;
            return (
              <div key={p.id} style={S.pkgRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{p.trackingNo}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{p.description || "No description"}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>Cost: AED {p.costAED.toFixed(2)}</div>
                  {editId === p.id ? (
                    <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                      <input
                        type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                        placeholder="Sell price (AED)"
                        style={{ width: 110, padding: "4px 8px", border: "1px solid rgba(0,229,160,0.4)", borderRadius: 7, background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 11 }}
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && saveSellingPrice(p.id)}
                      />
                      <button onClick={() => saveSellingPrice(p.id)} style={{ padding: "4px 10px", borderRadius: 7, background: "#00e5a0", color: "#002b1a", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Save</button>
                      <button onClick={() => setEditId(null)} style={{ padding: "4px 8px", borderRadius: 7, background: "none", color: "#64748b", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, cursor: "pointer" }}>✕</button>
                    </div>
                  ) : p.sellingAED ? (
                    <div style={{ marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: profit! >= 0 ? "#00e5a0" : "#f87171", fontWeight: 700 }}>
                        +AED {profit!.toFixed(2)} ({mg}%)
                      </span>
                      <button onClick={() => { setEditId(p.id); setEditVal(String(p.sellingAED)); }} style={{ marginLeft: 6, fontSize: 10, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>edit</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditId(p.id)} style={{ marginTop: 4, fontSize: 11, color: "#38bdf8", background: "none", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>
                      + Add selling price
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={exportCSV} style={S.exportBtn}>⬇ Export CSV report</button>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card:      { border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", background: "rgba(17,28,52,0.75)", backdropFilter: "blur(20px)" },
  head:      { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title:     { fontSize: 13, fontWeight: 700, color: "#f1f5f9" },
  badge:     { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(0,229,160,0.12)", color: "#00e5a0" },
  body:      { padding: 16 },
  statsRow:  { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 },
  stat:      { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 12px" },
  statLabel: { fontSize: 10, color: "#64748b", marginBottom: 4 },
  statVal:   { fontSize: 16, fontWeight: 900, color: "#f1f5f9" },
  pkgRow:    { display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 },
  exportBtn: { flex: 1, padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};
