// pages/request-item.tsx — CBC "Request an Item" (sourcing help)
// Intentionally scoped narrower than a future "Buy For Me" service: this form
// collects what the customer is looking for and lets CBC help them find
// sourcing options in the UAE. It does NOT purchase on their behalf — that's
// a distinct, later service with its own pricing model.
//
// NOTE FOR NATI: this posts to /api/request-item, which doesn't exist yet.
// You'll need a backend route that stores the submission (and forwards the
// optional photo upload somewhere — S3/Cloudinary/etc.) before this goes live.
// Until then this form will fail gracefully with the error message state.
import Link from "next/link";
import React, { useState } from "react";
import Head from "next/head";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIChatbotModal from "@/components/AIChatbotModal";
import { countries } from "@/utils/countries";

const C = {
  navy: "#0F2340",
  navyDeep: "#081527",
  gold: "#C9A227",
  goldDark: "#A8841A",
  goldSoft: "#F3E7C9",
  ivory: "#FBF8F2",
  bg: "#FFFFFF",
  ink: "#1C2436",
  muted: "#68707F",
  line: "#EAE3D2",
};

const shadowMd = "0 14px 34px -14px rgba(15,35,64,0.20)";

type FormState = {
  description: string;
  productLink: string;
  brandModel: string;
  budget: string;
  quantity: string;
  country: string;
  name: string;
  contact: string;
};

const initialForm: FormState = {
  description: "", productLink: "", brandModel: "", budget: "",
  quantity: "1", country: "", name: "", contact: "",
};

export default function RequestItemPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || !form.country || !form.name.trim() || !form.contact.trim()) {
      setStatus("error");
      setErrorMsg("Please fill in what you're looking for, your destination country, name, and a way to reach you.");
      return;
    }
    setStatus("submitting");
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (photo) body.append("photo", photo);

      const res = await fetch("/api/request-item", { method: "POST", body });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setForm(initialForm);
      setPhoto(null);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong submitting your request. Please try again, or reach us on WhatsApp instead.");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", border: `1.5px solid ${C.line}`, borderRadius: 12,
    fontSize: 14.5, color: C.ink, background: C.ivory, outline: "none", fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 7, display: "block" };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Inter, system-ui, -apple-system, sans-serif", color: C.ink }}>
      <Head>
        <title>Request an Item – CBC (Cross Border Cart)</title>
        <meta name="description" content="Can't find what you're looking for? Tell CBC what you need and we'll help you check sourcing options in the UAE." />
        <meta name="robots" content="noindex" />
      </Head>

      <SiteHeader />

      <section style={{ background: `linear-gradient(180deg, ${C.ivory} 0%, #fff 100%)`, padding: "clamp(40px, 6vw, 60px) clamp(16px, 4vw, 40px) 50px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>🔎</span>
          <h1 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, letterSpacing: "-0.01em", color: C.navy, marginBottom: 12 }}>
            Request an Item
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>
            Know what you want but not where to find it? Tell us about it and we'll help you check sourcing options in the UAE. This is a sourcing-help request, not a purchase — we'll get back to you with options before anything is bought.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 clamp(16px, 4vw, 40px) 70px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <form onSubmit={onSubmit} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 22, padding: "clamp(24px, 4vw, 36px)", boxShadow: shadowMd, display: "grid", gap: 18 }}>

            <div>
              <label style={labelStyle}>What are you looking for? <span style={{ color: C.goldDark }}>*</span></label>
              <textarea
                name="description" value={form.description} onChange={onChange} required
                placeholder="Describe the product — as much detail as you can give helps us find the right options."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={labelStyle}>Product link (optional)</label>
              <input type="url" name="productLink" value={form.productLink} onChange={onChange} placeholder="https://..." style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Photo (optional)</label>
              <input
                type="file" accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                style={{ ...inputStyle, padding: "10px 14px" }}
              />
            </div>

            <div className="req-row">
              <div>
                <label style={labelStyle}>Preferred brand / model (optional)</label>
                <input name="brandModel" value={form.brandModel} onChange={onChange} placeholder="e.g. Samsung, specific model" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Budget (optional)</label>
                <input name="budget" value={form.budget} onChange={onChange} placeholder="e.g. AED 500" style={inputStyle} />
              </div>
            </div>

            <div className="req-row">
              <div>
                <label style={labelStyle}>Quantity</label>
                <input type="number" min={1} name="quantity" value={form.quantity} onChange={onChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Destination country <span style={{ color: C.goldDark }}>*</span></label>
                <select name="country" value={form.country} onChange={onChange} required style={inputStyle}>
                  <option value="">Select country…</option>
                  {countries.map((c: { code: string; name: string }) => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="req-row">
              <div>
                <label style={labelStyle}>Name <span style={{ color: C.goldDark }}>*</span></label>
                <input name="name" value={form.name} onChange={onChange} required placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp / Email <span style={{ color: C.goldDark }}>*</span></label>
                <input name="contact" value={form.contact} onChange={onChange} required placeholder="How should we reach you?" style={inputStyle} />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === "submitting" || status === "success"}
              style={{
                background: `linear-gradient(155deg, ${C.gold}, ${C.goldDark})`, color: "#fff",
                fontWeight: 800, fontSize: 15, padding: "15px", borderRadius: 12, border: "none",
                cursor: status === "submitting" || status === "success" ? "not-allowed" : "pointer",
                opacity: status === "submitting" || status === "success" ? 0.65 : 1,
                marginTop: 4,
              }}
            >
              {status === "submitting" ? "Submitting…" : status === "success" ? "Request sent ✓" : "Submit Request"}
            </button>

            {status === "success" && (
              <p style={{ fontSize: 13, color: C.goldDark, textAlign: "center", margin: 0 }}>
                Thanks — we'll get back to you with sourcing options soon.
              </p>
            )}
            {status === "error" && (
              <p style={{ fontSize: 13, color: "#c0392b", textAlign: "center", margin: 0 }}>{errorMsg}</p>
            )}
          </form>

          <p style={{ fontSize: 12.5, color: C.muted, textAlign: "center", marginTop: 20 }}>
            Prefer WhatsApp? <Link href="/" style={{ color: C.goldDark, fontWeight: 700, textDecoration: "none" }}>Message us directly →</Link>
          </p>
        </div>
      </section>

      <FloatingChatButton isOpen={chatOpen} onOpen={() => setChatOpen(true)} />
      <AIChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
      <SiteFooter />

      <style jsx global>{`
        .req-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 560px) { .req-row { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}