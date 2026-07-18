// components/dashboard/WhatsAppSettings.tsx
import { useState, useEffect } from "react";

interface Settings {
  packageReceived: boolean;
  customsCleared:  boolean;
  outForDelivery:  boolean;
  paymentDue:      boolean;
  delivered:       boolean;
}

const EVENTS: { key: keyof Settings; label: string; sub: string }[] = [
  { key: "packageReceived", label: "Package received",  sub: "When your parcel arrives in Dubai" },
  { key: "customsCleared",  label: "Customs cleared",   sub: "Instant alert at customs" },
  { key: "outForDelivery",  label: "Out for delivery",  sub: "When parcel is on its way to you" },
  { key: "delivered",       label: "Delivered",         sub: "Confirmed delivery notification" },
  { key: "paymentDue",      label: "Payment due",       sub: "Reminders before shipment" },
];

export default function WhatsAppSettings() {
  const [phone,    setPhone]    = useState("");
  const [settings, setSettings] = useState<Settings>({
    packageReceived: true,
    customsCleared:  true,
    outForDelivery:  true,
    paymentDue:      false,
    delivered:       true,
  });
  const [saving,    setSaving]   = useState(false);
  const [saved,     setSaved]    = useState(false);
  const [connected, setConnected]= useState(false);

  useEffect(() => {
    fetch("/api/dashboard/whatsapp-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.whatsappNumber) { setPhone(d.whatsappNumber); setConnected(true); }
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/dashboard/whatsapp-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber: phone, settings }),
    });
    setSaving(false);
    setSaved(true);
    setConnected(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggle(key: keyof Settings) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <div style={S.card}>
      <div style={S.head}>
        <span style={S.title}>💬 WhatsApp notifications</span>
        <span style={S.badge}>New</span>
      </div>
      <div style={S.body}>
        {/* Phone input */}
        <div style={{ marginBottom: 14 }}>
          <div style={S.lbl}>Your WhatsApp number</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 91 234 5678"
              style={{ ...S.inp, flex: 1 }}
            />
            <button
              onClick={save}
              disabled={saving || !phone}
              style={{
                padding: "9px 16px", borderRadius: 10,
                background: "#25D366", color: "#fff",
                border: "none", fontWeight: 700, fontSize: 12,
                cursor: saving || !phone ? "not-allowed" : "pointer",
                opacity: saving || !phone ? 0.6 : 1,
              }}
            >
              {saving ? "Saving…" : connected ? "Update" : "Connect"}
            </button>
          </div>
          {saved && (
            <div style={{ fontSize: 11, color: "#00e5a0", marginTop: 6 }}>
              ✓ WhatsApp connected — you'll receive notifications at {phone}
            </div>
          )}
        </div>

        {/* Toggles */}
        <div style={S.lbl}>Notify me when…</div>
        {EVENTS.map((ev) => (
          <div key={ev.key} style={S.toggleRow}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{ev.label}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{ev.sub}</div>
            </div>
            <div
              onClick={() => toggle(ev.key)}
              style={{
                width: 38, height: 22, borderRadius: 11,
                background: settings[ev.key] ? "#25D366" : "rgba(255,255,255,0.12)",
                position: "relative", cursor: "pointer", flexShrink: 0,
                transition: "background .2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "#fff", position: "absolute",
                top: 2, transition: "left .2s",
                left: settings[ev.key] ? 18 : 2,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card:      { border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", background: "rgba(17,28,52,0.75)", backdropFilter: "blur(20px)" },
  head:      { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title:     { fontSize: 13, fontWeight: 700, color: "#f1f5f9" },
  badge:     { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(37,211,102,0.12)", color: "#25D366" },
  body:      { padding: 16 },
  lbl:       { fontSize: 11, color: "#64748b", marginBottom: 6 },
  inp:       { padding: "9px 12px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, background: "rgba(255,255,255,0.05)", color: "#f1f5f9", fontSize: 13, outline: "none" },
  toggleRow: { display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
};
