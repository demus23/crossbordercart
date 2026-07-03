// pages/index.tsx — Cross Border Cart v3
// Lighter navy background (#111827) + fully redesigned sections
import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import ReviewsSection from "@/components/ReviewsSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIChatbotModal from "@/components/AIChatbotModal";
import useSWR from "swr";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crossbordercart.com";

/* ─── color tokens ─── */
const C = {
  bg0: "#111827",
  bg1: "#161f30",
  bg2: "#1a2540",
  bg3: "#1e2d4a",
  mint: "#00e5a0",
  sky:  "#38bdf8",
  purple: "#c084fc",
  amber: "#fbbf24",
  text: "#f1f5f9",
  muted: "#94a3b8",
  dim:  "#64748b",
  faint: "#475569",
};

/* ─── helpers ─── */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatTimeAgo(d: any) {
  const t = new Date(d || Date.now()).getTime();
  if (!t || Number.isNaN(t)) return "";
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 10) return "Just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function badgeStyle(status: string): React.CSSProperties {
  const s = status.toLowerCase();
  if (s.includes("deliver")) return { background: "rgba(0,229,160,0.14)", color: C.mint };
  if (s.includes("cancel") || s.includes("hold")) return { background: "rgba(239,68,68,0.12)", color: "#f87171" };
  if (s.includes("transit") || s.includes("ship") || s.includes("process")) return { background: "rgba(56,189,248,0.14)", color: C.sky };
  if (s.includes("custom")) return { background: "rgba(251,191,36,0.12)", color: C.amber };
  return { background: "rgba(255,255,255,0.08)", color: C.muted };
}

/* ─── 3D Globe ─── */
interface City { name: string; lat: number; lng: number; color: string }
const CITIES: City[] = [
  { name: "Dubai",         lat:  25.2, lng:  55.3, color: C.mint   },
  { name: "Nairobi",       lat:  -1.3, lng:  36.8, color: C.sky    },
  { name: "Lagos",         lat:   6.5, lng:   3.4, color: C.sky    },
  { name: "Accra",         lat:   5.6, lng:  -0.2, color: C.sky    },
  { name: "Lusaka",        lat: -15.4, lng:  28.3, color: C.sky    },
  { name: "Dar es Salaam", lat:  -6.8, lng:  39.3, color: C.sky    },
  { name: "Cairo",         lat:  30.1, lng:  31.2, color: C.purple },
  { name: "London",        lat:  51.5, lng:  -0.1, color: C.purple },
  { name: "Mumbai",        lat:  19.1, lng:  72.9, color: C.amber  },
  { name: "Karachi",       lat:  24.9, lng:  67.0, color: C.amber  },
];
const ROUTES = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,8],[0,9]];

function GlobeCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const SIZE = 420, R = 188, CX = SIZE / 2, CY = SIZE / 2;

    function toXY(lat: number, lng: number, r: number) {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lng + rotRef.current) * (Math.PI / 180);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      return { x: CX + x, y: CY - y, z, visible: z > -20 };
    }

    function draw() {
      ctx.clearRect(0, 0, SIZE, SIZE);

      // outer glow
      const og = ctx.createRadialGradient(CX, CY, R * 0.85, CX, CY, R * 1.18);
      og.addColorStop(0, "rgba(0,229,160,0.07)");
      og.addColorStop(1, "rgba(0,229,160,0)");
      ctx.beginPath(); ctx.arc(CX, CY, R * 1.18, 0, Math.PI * 2);
      ctx.fillStyle = og; ctx.fill();

      // sphere gradient — lighter navy base
      const sg = ctx.createRadialGradient(CX - 44, CY - 55, 18, CX, CY, R);
      sg.addColorStop(0, "#1e3a5f");
      sg.addColorStop(0.55, "#111827");
      sg.addColorStop(1, "#080d14");
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fillStyle = sg; ctx.fill();

      // latitude grid
      ctx.strokeStyle = "rgba(56,189,248,0.09)"; ctx.lineWidth = 0.5;
      for (let la = -75; la <= 75; la += 30) {
        ctx.beginPath(); let first = true;
        for (let lo = -180; lo <= 180; lo += 5) {
          const p = toXY(la, lo, R);
          if (!p.visible) { first = true; continue; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false;
        }
        ctx.stroke();
      }
      // longitude grid
      for (let lo = -180; lo <= 180; lo += 30) {
        ctx.beginPath(); let first = true;
        for (let la = -90; la <= 90; la += 5) {
          const p = toXY(la, lo, R);
          if (!p.visible) { first = true; continue; }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); first = false;
        }
        ctx.stroke();
      }

      // rim glow
      const rim = ctx.createRadialGradient(CX, CY, R - 2, CX, CY, R + 1);
      rim.addColorStop(0, "rgba(0,229,160,0)");
      rim.addColorStop(1, "rgba(0,229,160,0.3)");
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = rim; ctx.lineWidth = 2; ctx.stroke();

      // animated route dots
      const t = (Date.now() % 3000) / 3000;
      ROUTES.forEach(([ai, bi]) => {
        const a = CITIES[ai], b = CITIES[bi];
        const pa = toXY(a.lat, a.lng, R);
        const pb = toXY(b.lat, b.lng, R);
        if (!pa.visible && !pb.visible) return;
        const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        const dist = Math.hypot(pa.x - pb.x, pa.y - pb.y);
        const cpx = mx + (CX - mx) * 0.15, cpy = my - dist * 0.24;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y);
        ctx.quadraticCurveTo(cpx, cpy, pb.x, pb.y);
        ctx.strokeStyle = "rgba(0,229,160,0.18)"; ctx.lineWidth = 1; ctx.stroke();
        const tx = Math.pow(1 - t, 2) * pa.x + 2 * (1 - t) * t * cpx + t * t * pb.x;
        const ty = Math.pow(1 - t, 2) * pa.y + 2 * (1 - t) * t * cpy + t * t * pb.y;
        const pulse = t < 0.5 ? t * 2 : (1 - t) * 2;
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,160,${0.6 + pulse * 0.4})`; ctx.fill();
      });

      // city dots
      CITIES.forEach((c, i) => {
        const p = toXY(c.lat, c.lng, R); if (!p.visible) return;
        const sz = i === 0 ? 6 : 4;
        ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.fillStyle = c.color; ctx.fill();
        if (i === 0) {
          ctx.beginPath(); ctx.arc(p.x, p.y, sz + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0,229,160,0.4)"; ctx.lineWidth = 1.5; ctx.stroke();
        }
      });

      rotRef.current += 0.15;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={ref} width={420} height={420} style={{ borderRadius: "50%" }} />;
}

/* ─── Particle background ─── */
function ParticleCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.4 + 0.5, op: Math.random() * 0.35 + 0.08,
    }));
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,160,${p.op})`; ctx.fill();
      });
      pts.forEach((a, i) => {
        pts.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,229,160,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={ref}
      width={1200}
      height={800}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

/* ─── Live Rotator ─── */
const DEMO_SHIPS = [
  { id: "#AR3456", loc: "Dubai Cargo Terminal · Gate 4",      status: "In Transit",      pct: 65, t: "3h ago"  },
  { id: "#KN7821", loc: "Nairobi, Kenya · Customs cleared",   status: "Customs",         pct: 80, t: "1d ago"  },
  { id: "#ZM0934", loc: "Lusaka, Zambia · Out for delivery",  status: "Out for delivery", pct: 92, t: "5h ago"  },
  { id: "#NG4451", loc: "Lagos, Nigeria · Arrived facility",  status: "Arrived",         pct: 75, t: "2d ago"  },
  { id: "#GH2267", loc: "Accra, Ghana · In transit",          status: "In Transit",      pct: 55, t: "6h ago"  },
];

function LiveRotator({ items }: { items: any[] }) {
  // Merge real API items with demo fallback
  const unique = useMemo(() => {
    try {
      const map = new Map<string, any>();
      const src = items.length ? items : DEMO_SHIPS;
      for (const it of src) {
        const t = String(it?.trackingNo || it?.tracking || it?.id || "").trim();
        if (!t) continue;
        const prev = map.get(t);
        const prevT = new Date(prev?.updatedAt || 0).getTime();
        const curT  = new Date(it?.updatedAt  || 0).getTime();
        if (!prev || curT >= prevT) map.set(t, it);
      }
      return Array.from(map.values()).sort((a, b) =>
        new Date(b?.updatedAt || 0).getTime() - new Date(a?.updatedAt || 0).getTime()
      );
    } catch { return DEMO_SHIPS; }
  }, [items]);

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!unique.length) return;
    setIdx(0);
    const id = setInterval(() => setIdx((v) => (v + 1) % unique.length), 3600);
    return () => clearInterval(id);
  }, [unique.length]);

  const cur   = unique[idx] ?? DEMO_SHIPS[0];
  const id_   = String(cur?.trackingNo || cur?.tracking || cur?.id || "").trim();
  const st    = String(cur?.status || "In Transit");
  const loc   = String(cur?.location || cur?.loc || cur?.from || "Dubai");
  const pct   = Number(cur?.pct ?? 65);
  const when  = cur?.updatedAt || cur?.at || cur?.t;
  const href  = id_ ? `/track/${encodeURIComponent(id_)}` : "#";
  const bs    = badgeStyle(st);

  return (
    <div style={S.rotWrap}>
      {/* Main card */}
      <Link href={href} style={{ textDecoration: "none" }}>
        <div style={S.rotCard}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={S.livePill}><span style={S.pulseDot} />Live now</div>
            <span style={{ fontSize:11, color:C.faint }}>{typeof when === "string" ? when : formatTimeAgo(when)}</span>
          </div>
          <div style={{ fontSize:20, fontWeight:900, color:C.text, fontFamily:"monospace", marginBottom:5 }}>{id_}</div>
          <div style={{ fontSize:12, color:C.dim, marginBottom:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{loc}</div>
          {/* progress bar */}
          <div style={{ fontSize:10, color:"#334155", display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div style={{ height:3, background:"rgba(255,255,255,0.07)", borderRadius:99, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#00e5a0,#38bdf8)", borderRadius:99, transition:"width .6s" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
            <span style={{ ...bs, fontSize:12, fontWeight:800, padding:"6px 14px", borderRadius:99 }}>{st}</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.sky }}>View tracking →</span>
          </div>
          {/* dots */}
          <div style={{ display:"flex", gap:5, justifyContent:"center", marginTop:12 }}>
            {unique.slice(0, 5).map((_, i) => (
              <span key={i} style={{ width:5, height:5, borderRadius:"50%", background: i===idx ? C.mint : "#1e293b", transition:"background .3s" }} />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ─── Step card ─── */
function StepCard({ no, icon, iconBg, accentColor, title, desc, details, active, onClick }: {
  no: string; icon: string; iconBg: string; accentColor: string;
  title: string; desc: string; details: string[]; active: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        ...S.stepCard,
        borderColor: active ? `${accentColor}55` : "rgba(255,255,255,0.09)",
        background: active ? C.bg3 : C.bg2,
        transform: active ? "translateY(-5px)" : "none",
        cursor: "pointer",
      }}
    >
      {/* accent bottom line */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,transparent,${accentColor},transparent)`, opacity: active ? 1 : 0, transition:"opacity .3s" }} />
      <div style={{ fontSize:60, fontWeight:900, color:`${accentColor}12`, position:"absolute",
        top:10, right:14, lineHeight:1, letterSpacing:-3 }}>{no}</div>
      <div style={{ width:50, height:50, borderRadius:15, background:iconBg, display:"flex",
        alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:18 }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:900, color:C.text, marginBottom:7 }}>{title}</div>
      <p style={{ fontSize:13, color:C.dim, lineHeight:1.68 }}>{desc}</p>
      {active && (
        <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", gap:5 }}>
          {details.map((d) => (
            <div key={d} style={{ fontSize:12, color:accentColor, display:"flex", alignItems:"center", gap:6 }}>
              <span>✓</span>{d}
            </div>
          ))}
        </div>
      )}
      {/* connector node */}
      <div style={{ position:"absolute", top:54, left:"50%", transform:"translateX(-50%)",
        width:16, height:16, borderRadius:"50%", border:`2px solid ${accentColor}70`,
        background:C.bg0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:accentColor }} />
      </div>
    </div>
  );
}

/* ─── Pricing card ─── */
function PricingCard({ badge, badgeColor, name, price, note, bullets, highlight }: {
  badge: string; badgeColor: string; name: string; price: string;
  note: string; bullets: string[]; highlight?: boolean;
}) {
  return (
    <div style={{ ...S.priceCard, ...(highlight ? { borderColor:"rgba(0,229,160,0.4)", background:"rgba(0,229,160,0.04)" } : {}) }}>
      {highlight && <div style={S.priceCrown}>Most popular</div>}
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase" as any,
        padding:"4px 10px", borderRadius:99, marginBottom:16, display:"inline-block",
        color:badgeColor, background:`${badgeColor}18` }}>{badge}</span>
      <div style={{ fontSize:22, fontWeight:900, color:C.text, marginBottom:4 }}>{name}</div>
      <div style={{ fontSize:13, color:C.dim, marginBottom:14 }}>{price}</div>
      <div style={{ fontSize:11, color:C.faint, marginBottom:20 }}>{note}</div>
      <ul style={{ listStyle:"none", display:"flex", flexDirection:"column" as any, gap:10 }}>
        {bullets.map((b) => (
          <li key={b} style={{ fontSize:13, color:C.muted, display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:C.mint, fontWeight:900, fontSize:12 }}>✓</span>{b}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Testimonial ─── */
function Testimonial({ name, loc, text }: { name: string; loc: string; text: string }) {
  return (
    <div style={S.testiCard}>
      <div style={{ color:"#f59e0b", fontSize:13, letterSpacing:2, marginBottom:10 }}>★★★★★</div>
      <p style={{ fontSize:14, color:"#cbd5e1", lineHeight:1.7, fontStyle:"italic", marginBottom:16 }}>"{text}"</p>
      <div style={{ fontSize:13, fontWeight:800, color:C.mint }}>{name}</div>
      <div style={{ fontSize:12, color:C.faint }}>{loc}</div>
    </div>
  );
}

/* ─── FAQ item ─── */
function FAQItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div onClick={() => setOpen(!open)} style={{
      background:C.bg2, border:`1px solid ${open ? "rgba(0,229,160,0.32)" : "rgba(255,255,255,0.09)"}`,
      borderRadius:16, overflow:"hidden", transition:"border-color .2s", cursor:"pointer",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", gap:12 }}>
        <span style={{ fontSize:14, fontWeight:700, color: open ? C.text : C.muted, transition:"color .2s", flex:1 }}>{q}</span>
        <div style={{ width:24, height:24, borderRadius:99,
          background: open ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.05)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color: open ? C.mint : C.faint, fontSize:14, flexShrink:0,
          transform: open ? "rotate(180deg)" : "none", transition:"all .25s" }}>⌄</div>
      </div>
      {open && <p style={{ fontSize:13, color:C.dim, lineHeight:1.7, padding:"0 20px 18px" }}>{a}</p>}
    </div>
  );
}

/* ─── Side decoration card (FAQ flanks) ─── */
function SideCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ background:C.bg2, border:"1px solid rgba(255,255,255,0.09)", borderRadius:16, padding:16 }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:11, color:C.faint, lineHeight:1.55 }}>{desc}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function HomePage() {
  const STORES = [
    { emoji:"📦", name:"Amazon.ae",  cat:"Everything",           bg:"#fff",     fg:"#111" },
    { emoji:"🌟", name:"Noon",       cat:"Electronics & fashion", bg:"#f5ec2d",  fg:"#111" },
    { emoji:"👗", name:"Namshi",     cat:"Fashion & beauty",      bg:"#1a1a1a",  fg:"#fff" },
    { emoji:"💄", name:"Sephora",    cat:"Beauty & skincare",     bg:"#111",     fg:"#fff" },
    { emoji:"📱", name:"Apple",      cat:"Tech & gadgets",        bg:"#f5f5f7",  fg:"#111" },
    { emoji:"👟", name:"Adidas",     cat:"Sports & apparel",      bg:"#fff",     fg:"#111" },
    { emoji:"👔", name:"Zara",       cat:"Fashion",               bg:"#fff",     fg:"#111" },
    { emoji:"🛋️", name:"IKEA",       cat:"Home & furniture",      bg:"#FFDA1A",  fg:"#003399" },
  ];

  const [email,     setEmail]     = useState("");
  const [country,   setCountry]   = useState("");
  const [volume,    setVolume]    = useState<"personal"|"reseller">("personal");
  const [formSt,    setFormSt]    = useState<"idle"|"submitting"|"success"|"error">("idle");
  const [chatOpen,  setChatOpen]  = useState(false);
  const [showAll,   setShowAll]   = useState(false);
  const [activeStep,setActiveStep]= useState(0);
  const [storeOff,  setStoreOff]  = useState(0);

  /* SWR — live shipments */
  const { data, isLoading } = useSWR("/api/live-shipments", fetcher, {
    refreshInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "hidden" ? 0 : 10_000,
    revalidateOnFocus: true,
    revalidateIfStale: true,
  });
  const dash        = isLoading ? "—" : undefined;
  const liveStats   = {
    inTransit: dash ?? String(data?.stats?.inTransit ?? 6),
    delivered:  dash ?? String(data?.stats?.delivered  ?? 47),
    updates:    dash ?? String(data?.stats?.updates    ?? data?.latest?.length ?? 12),
  };
  const liveLatest: any[] = data?.latest ?? [];
  const visibleLive = showAll ? liveLatest : liveLatest.slice(0, 5);

  /* Waitlist */
  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formSt === "submitting" || formSt === "success") return;
    setFormSt("submitting");
    try {
      const res  = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country, volume }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message);
      setFormSt("success"); setEmail(""); setCountry("");
    } catch { setFormSt("error"); }
  };

  /* Visible stores (4 at a time) */
  const visStores = Array.from({ length: 4 }, (_, i) => STORES[(storeOff + i) % STORES.length]);

  return (
    <div style={{ background:C.bg0, minHeight:"100vh",
      fontFamily:"Inter, system-ui, -apple-system, sans-serif", color:C.text }}>

      <Head>
        <title>Cross Border Cart – UAE to Africa shipping with real-time tracking</title>
        <meta name="description" content="Get a UAE shipping address, consolidate your orders and ship from Dubai to Africa and beyond with real-time tracking and transparent pricing." />
        <meta name="keywords" content="UAE shipping, Dubai to Africa, package forwarding, reselling from Dubai" />
        <meta name="robots" content="index,follow" />
        <meta property="og:type"         content="website" />
        <meta property="og:title"        content="Cross Border Cart – Ship from UAE to your doorstep" />
        <meta property="og:description"  content="Cross Border Cart gives you a UAE address, smart consolidation and live tracking." />
        <meta property="og:image"        content={`${SITE_URL}/og-cross-border-cart.png`} />
        <meta property="og:url"          content={SITE_URL} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Cross Border Cart – Ship from UAE to your doorstep" />
        <meta name="twitter:description" content="Get UAE prices and ship to Africa with live tracking and consolidation." />
        <meta name="twitter:image"       content={`${SITE_URL}/og-cross-border-cart.png`} />
      </Head>

      <SiteHeader />

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight:"92vh", position:"relative", overflow:"hidden", padding:"60px 40px 0", background:`linear-gradient(180deg,${C.bg0} 0%,${C.bg1} 100%)` }}>
        <ParticleCanvas />
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center", position:"relative", zIndex:2 }}>
          {/* Left */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={S.heroBadge}><span style={S.pulseDot} />Now shipping to 220+ countries</div>
            <h1 style={S.h1}>Shop UAE.<br /><span style={S.h1Accent}>Delivered anywhere.</span></h1>
            <p style={{ fontSize:16, color:C.dim, lineHeight:1.7, maxWidth:480, marginBottom:32 }}>
              Get your personal Dubai address, consolidate packages from any UAE store, and ship to your door with live tracking and honest pricing.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" as any, marginBottom:24 }}>
              <Link href="/signup" style={S.btnPrimary}>Get my free UAE address →</Link>
              <Link href="/login"  style={S.btnGhost}>Track a shipment</Link>
            </div>
            <div style={{ fontSize:12, color:C.faint, display:"flex", gap:14, flexWrap:"wrap" as any }}>
              <span>No setup fees</span><span style={{ color:C.mint }}>·</span>
              <span>Pay only when you ship</span><span style={{ color:C.mint }}>·</span>
              <span>Optional insurance</span>
            </div>
          </div>

          {/* Right — Globe */}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", position:"relative" }}>
            <GlobeCanvas />
            {/* Floating cards */}
            <div style={{ ...S.floatCard, top:"10%", left:"-16%", animation:"floatA 6s ease-in-out infinite" }}>
              <div style={S.fcLabel}><span style={S.liveDot} />Live shipment</div>
              <div style={{ fontSize:14, fontWeight:800, color:C.text }}>DXB → <span style={{ color:C.mint }}>NBO</span></div>
              <div style={{ fontSize:11, color:C.faint, marginTop:3 }}>Dubai → Nairobi · In transit</div>
            </div>
            <div style={{ ...S.floatCard, bottom:"18%", right:"-14%", animation:"floatB 7s ease-in-out infinite" }}>
              <div style={S.fcLabel}>Today's deliveries</div>
              <div style={{ fontSize:14, fontWeight:800, color:C.text }}><span style={{ color:C.mint }}>47</span> packages</div>
              <div style={{ fontSize:11, color:C.faint, marginTop:3 }}>Across 12 countries</div>
            </div>
            <div style={{ ...S.floatCard, top:"48%", left:"-20%", transform:"translateY(-50%)", animation:"floatA 8s ease-in-out infinite .5s", minWidth:190 }}>
              <div style={{ ...S.fcLabel, marginBottom:8 }}><span style={S.liveDot} />Live stats</div>
              {[["In transit", liveStats.inTransit],["Delivered", liveStats.delivered],["Updates", liveStats.updates]].map(([l,v]) => (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", gap:12, marginBottom:4 }}>
                  <span style={{ fontSize:11, color:C.dim }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:C.text }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live rotator strip */}
        <div style={{ maxWidth:500, margin:"28px auto 0", position:"relative", zIndex:2, paddingBottom:48 }}>
          <LiveRotator items={visibleLive} />
          <button
            onClick={() => setShowAll((v) => !v)}
            aria-label={showAll ? "Show fewer shipments" : "View all shipments"}
            style={{ background:"none", border:"none", color:C.sky, fontWeight:700, fontSize:12, cursor:"pointer", marginTop:8, display:"block", width:"100%", textAlign:"center" as any }}
          >
            {showAll ? "Show less" : `View all (${liveLatest.length || DEMO_SHIPS.length})`}
          </button>
        </div>
      </section>

      {/* ═══ TRUST BAND ═══ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, background:"rgba(255,255,255,0.05)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        {[["10K+","Parcels handled"],["220+","Destinations served"],["4.9★","Average rating"],["24/7","Human support"]].map(([n,l]) => (
          <div key={l} style={{ padding:"26px 24px", background:C.bg0, textAlign:"center" as any }}>
            <div style={{ fontSize:30, fontWeight:900, letterSpacing:-1, backgroundImage:"linear-gradient(135deg,#00e5a0,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{n}</div>
            <div style={{ fontSize:12, color:C.dim, marginTop:4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ═══ LIVE SHIPMENTS SECTION ═══ */}
      <section style={{ padding:"68px 40px", background:`linear-gradient(180deg,${C.bg0} 0%,${C.bg1} 100%)`, position:"relative", overflow:"hidden" }}>
        {/* top glow */}
        <div style={{ position:"absolute", width:700, height:280, background:"radial-gradient(ellipse,rgba(0,229,160,0.07),transparent 70%)", top:-60, left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center" as any, marginBottom:40 }}>
            <div style={S.eyebrow}>Real-time activity</div>
            <h2 style={{ ...S.h2, textAlign:"center" as any }}>Shipments moving right now</h2>
            <p style={{ fontSize:14, color:C.dim, textAlign:"center" as any, maxWidth:440, margin:"0 auto" }}>Every parcel tracked from our Dubai warehouse to your door, live.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:20, alignItems:"start" }}>
            {/* Map panel */}
            <div style={{ background:C.bg2, border:"1px solid rgba(255,255,255,0.1)", borderRadius:24, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <div style={{ fontSize:14, fontWeight:800, color:C.text }}>Active routes · UAE → World</div>
                <div style={S.livePill}><span style={S.pulseDot} />6 live shipments</div>
              </div>
              {/* SVG World Map */}
              <svg width="100%" height="190" viewBox="0 0 640 190" style={{ opacity:.82, marginBottom:18 }}>
                <defs><filter id="gw"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                <path d="M318 38 Q342 32 360 54 Q376 76 370 106 Q364 135 342 150 Q320 162 298 150 Q276 138 274 112 Q272 86 282 62 Z" fill="rgba(0,229,160,0.04)" stroke="rgba(0,229,160,0.18)" strokeWidth="1"/>
                <path d="M288 22 Q312 14 328 28 Q320 40 306 44 Q294 47 286 36 Z" fill="rgba(56,189,248,0.04)" stroke="rgba(56,189,248,0.18)" strokeWidth="1"/>
                <ellipse cx="402" cy="68" rx="22" ry="14" fill="rgba(0,229,160,0.12)" stroke="rgba(0,229,160,0.4)" strokeWidth="1.2" filter="url(#gw)"/>
                <text x="402" y="65" textAnchor="middle" fontSize="9" fill="#00e5a0" fontWeight="700" fontFamily="Inter,sans-serif">DXB</text>
                {/* Routes */}
                <path d="M402 68 Q366 55 336 104" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeDasharray="5 4" opacity=".55"/>
                <path d="M402 68 Q362 44 310 80" fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeDasharray="5 4" opacity=".45"/>
                <path d="M402 68 Q365 28 308 36" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 4" opacity=".5"/>
                <path d="M402 68 Q372 88 330 136" fill="none" stroke="#00e5a0" strokeWidth="1.2" strokeDasharray="4 4" opacity=".4"/>
                <path d="M402 68 Q440 60 490 72" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 4" opacity=".4"/>
                {/* Destination dots */}
                <circle cx="336" cy="104" r="6" fill="#00e5a0" opacity=".9" filter="url(#gw)"/>
                <text x="336" y="118" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="Inter,sans-serif">NBO</text>
                <circle cx="306" cy="82" r="5" fill="#00e5a0" opacity=".75"/>
                <text x="306" y="96" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="Inter,sans-serif">LOS</text>
                <circle cx="308" cy="36" r="5" fill="#38bdf8" opacity=".8"/>
                <text x="308" y="28" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="Inter,sans-serif">LHR</text>
                <circle cx="330" cy="136" r="4" fill="#00e5a0" opacity=".65"/>
                <text x="330" y="150" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="Inter,sans-serif">LUN</text>
                <circle cx="490" cy="72" r="5" fill="#fbbf24" opacity=".7"/>
                <text x="490" y="86" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="Inter,sans-serif">BOM</text>
                {/* Animated dots */}
                <circle r="3.5" fill="#00e5a0" filter="url(#gw)"><animateMotion dur="3s" repeatCount="indefinite" path="M402 68 Q366 55 336 104"/></circle>
                <circle r="3" fill="#38bdf8"><animateMotion dur="4.2s" repeatCount="indefinite" path="M402 68 Q365 28 308 36"/></circle>
                <circle r="2.5" fill="#fbbf24"><animateMotion dur="5s" repeatCount="indefinite" begin=".5s" path="M402 68 Q440 60 490 72"/></circle>
              </svg>
              {/* Route cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[
                  { route:"DXB → NBO", city:"Dubai · Nairobi",  status:"In transit",  color:C.mint,   time:"2h ago" },
                  { route:"DXB → LOS", city:"Dubai · Lagos",    status:"Customs",     color:C.sky,    time:"5h ago" },
                  { route:"DXB → BOM", city:"Dubai · Mumbai",   status:"Departed",    color:C.amber,  time:"1d ago" },
                ].map((r) => (
                  <div key={r.route} style={{ background:C.bg3, border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:14, position:"relative", transition:"all .2s", borderTop:`2px solid ${r.color}40` }}>
                    <div style={{ fontSize:10, color:"#334155", position:"absolute", top:12, right:12 }}>{r.time}</div>
                    <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:3 }}>{r.route}</div>
                    <div style={{ fontSize:11, color:C.faint, marginBottom:10 }}>{r.city}</div>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99, background:`${r.color}18`, color:r.color, display:"inline-flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:4, height:4, borderRadius:"50%", background:r.color }} />{r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <LiveRotator items={visibleLive} />
              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                {[["6","In transit"],["47","Delivered today"],["220+","Countries"]].map(([n,l]) => (
                  <div key={l} style={{ background:C.bg2, border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:14, textAlign:"center" as any }}>
                    <div style={{ fontSize:20, fontWeight:900, backgroundImage:"linear-gradient(135deg,#00e5a0,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{n}</div>
                    <div style={{ fontSize:10, color:C.faint, marginTop:3 }}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Log */}
              <div style={{ background:C.bg2, border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:16 }}>
                <div style={{ fontSize:10, color:C.faint, fontWeight:600, textTransform:"uppercase" as any, letterSpacing:1, marginBottom:10 }}>Latest updates</div>
                {[
                  { dot:C.mint,  s:"Departed origin facility",  l:"Dubai, UAE · 3h ago"            },
                  { dot:C.sky,   s:"Customs processing",        l:"Dubai International · 1d ago"   },
                  { dot:"#334155",s:"Package received",          l:"CBC Warehouse · 3d ago",dim:true },
                ].map((r,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom: i<2 ? 8:0 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:r.dot, flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color: r.dim ? C.dim : C.text }}>{r.s}</div>
                      <div style={{ fontSize:11, color:C.faint }}>{r.l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding:"70px 40px", background:C.bg0, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:700, height:400, background:"radial-gradient(ellipse,rgba(56,189,248,0.05),transparent 70%)", bottom:-120, right:-200, pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"center", marginBottom:44 }}>
            <div>
              <div style={S.eyebrow}>How it works</div>
              <h2 style={S.h2}>Three steps.<br />Door to door.</h2>
            </div>
            <p style={{ fontSize:14, color:C.dim, lineHeight:1.8, paddingTop:8 }}>
              From shopping at any UAE store to unboxing at home — we handle everything in between. Click each step to see what's included.
            </p>
          </div>
          {/* Connector line */}
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", top:57, left:"calc(16.66% + 18px)", right:"calc(16.66% + 18px)", height:1, background:"linear-gradient(90deg,transparent,rgba(0,229,160,0.35) 20%,rgba(0,229,160,0.35) 80%,transparent)", zIndex:0 }} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
              <StepCard no="01" icon="🏠" iconBg="rgba(0,229,160,0.1)"  accentColor={C.mint}   title="Get your UAE address" active={activeStep===0} onClick={()=>setActiveStep(0)}
                desc="Sign up free and receive your personal Cross Border Cart address in Dubai. Use it at any UAE or international store checkout."
                details={["Instant — no waiting","Works with any online store","Full dashboard access"]} />
              <StepCard no="02" icon="📦" iconBg="rgba(56,189,248,0.1)" accentColor={C.sky}    title="Shop & we receive"     active={activeStep===1} onClick={()=>setActiveStep(1)}
                desc="Order from Amazon.ae, Noon, Namshi, or anywhere. Packages arrive at our Dubai warehouse — we inspect, photograph and store safely."
                details={["Photo proof within 24h","Secure warehouse storage","Damage inspection"]} />
              <StepCard no="03" icon="✈️" iconBg="rgba(192,132,252,0.1)" accentColor={C.purple} title="Consolidate & ship"   active={activeStep===2} onClick={()=>setActiveStep(2)}
                desc="Combine multiple parcels into one box to save on shipping. Choose your route, speed and destination — then track every step live."
                details={["Save up to 60%","220+ destinations","Real-time tracking"]} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STORES ═══ */}
      <section style={{ padding:"64px 40px", background:`linear-gradient(180deg,${C.bg0},${C.bg1})`, overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:30 }}>
            <div>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", color:C.sky, fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase" as any, padding:"4px 12px", borderRadius:99, marginBottom:10 }}>🛍 Popular UAE stores</span>
              <h2 style={{ ...S.h2, fontSize:30, marginBottom:6 }}>Shop anywhere in the UAE.</h2>
              <p style={{ fontSize:14, color:C.dim, maxWidth:440 }}>Your address works at every UAE and international store. These are just popular examples.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column" as any, alignItems:"flex-end", gap:8 }}>
              <div style={{ fontSize:12, color:"#334155" }}>8 featured · hundreds more</div>
              <div style={{ display:"flex", gap:8 }}>
                {["‹","›"].map((a,i) => (
                  <button key={a} onClick={() => setStoreOff(v => i===0 ? (v-1+8)%8 : (v+1)%8)}
                    style={{ width:36, height:36, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:C.muted, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
            {visStores.map((s) => (
              <div key={s.name} style={{ background:C.bg2, border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:20, display:"flex", flexDirection:"column" as any, alignItems:"center", gap:11, transition:"all .25s", cursor:"pointer", position:"relative", overflow:"hidden" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(0,229,160,0.38)"; (e.currentTarget as HTMLElement).style.transform="translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.09)"; (e.currentTarget as HTMLElement).style.transform="none"; }}>
                <div style={{ width:64, height:64, borderRadius:16, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{s.emoji}</div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{s.name}</div>
                <div style={{ fontSize:10, color:C.faint }}>{s.cat}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:13, border:"1px dashed rgba(255,255,255,0.12)", borderRadius:14, fontSize:12, color:"#334155", cursor:"pointer", marginTop:12, transition:"all .2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(0,229,160,0.3)"; (e.currentTarget as HTMLElement).style.color=C.mint; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color="#334155"; }}>
            + Don't see your store? Your UAE address works everywhere — try it
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — BUILT FOR SHIPPERS ═══ */}
      <section style={{ padding:"70px 40px", background:C.bg0 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start", marginBottom:40 }}>
            <div>
              <div style={S.eyebrow}>Features</div>
              <h2 style={S.h2}>Built for serious shippers.</h2>
              <p style={{ fontSize:14, color:C.dim, lineHeight:1.7, maxWidth:400 }}>Whether you order once a month or run a reselling business, every tool is here.</p>
            </div>
            {/* Tabs */}
            <div style={{ display:"flex", flexDirection:"column" as any, gap:8, paddingTop:8 }}>
              {[
                { icon:"📦", label:"UAE address & receiving" },
                { icon:"📡", label:"Real-time tracking" },
                { icon:"🧮", label:"Transparent pricing" },
                { icon:"🛡️", label:"Insurance & safety" },
              ].map((t, i) => (
                <div key={t.label} style={{ padding:"12px 16px", borderRadius:13,
                  border:`1px solid ${i===0 ? "rgba(0,229,160,0.28)" : "rgba(255,255,255,0.07)"}`,
                  background: i===0 ? "rgba(0,229,160,0.06)" : "transparent",
                  display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
                  <div style={{ width:32, height:32, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, background: i===0 ? "rgba(0,229,160,0.12)" : "rgba(255,255,255,0.04)" }}>{t.icon}</div>
                  <span style={{ fontSize:13, fontWeight:700, color: i===0 ? C.text : C.muted }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Bento */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
            {/* Wide tracking card */}
            <div style={{ ...S.featCard, gridColumn:"span 2" }}>
              <div style={{ width:40, height:40, borderRadius:13, background:"rgba(0,229,160,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:14 }}>📡</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Track every scan from Dubai to your door</div>
              <p style={{ fontSize:13, color:C.dim, lineHeight:1.65, marginBottom:14 }}>Real-time milestone updates via WhatsApp and email — warehouse receipt, customs clearance, departure, arrival and final delivery.</p>
              {/* Timeline */}
              <div>
                {[
                  { color:C.mint,    s:"Delivered to recipient",  l:"Nairobi, Kenya",          t:"2h ago"    },
                  { color:C.sky,     s:"Customs cleared",         l:"JKIA International Airport", t:"Yesterday" },
                  { color:"#334155", s:"Departed Dubai",          l:"DXB Cargo Terminal",       t:"3 days ago",dim:true },
                ].map((r,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, paddingBottom: i<2 ? 12:0, position:"relative" }}>
                    {i<2 && <div style={{ position:"absolute", left:7, top:18, bottom:-4, width:1, background:"rgba(255,255,255,0.08)" }} />}
                    <div style={{ width:15, height:15, borderRadius:"50%", border:`2px solid ${r.color}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:r.color }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color: r.dim ? C.dim : C.text }}>{r.s}</div>
                      <div style={{ fontSize:11, color:C.faint }}>{r.l}</div>
                    </div>
                    <div style={{ fontSize:10, color:"#334155", flexShrink:0 }}>{r.t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.featCard}>
              <div style={{ width:40, height:40, borderRadius:13, background:"rgba(56,189,248,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:14 }}>🏠</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Your personal UAE address</div>
              <p style={{ fontSize:13, color:C.dim, lineHeight:1.65 }}>One address. Every store. Instantly activated on signup — no paperwork, no waiting.</p>
            </div>
            <div style={S.featCard}>
              <div style={{ width:40, height:40, borderRadius:13, background:"rgba(168,85,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:14 }}>🛡️</div>
              <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>Insurance & photo proof</div>
              <p style={{ fontSize:13, color:C.dim, lineHeight:1.65 }}>Optional insurance + warehouse photography so you always know what was shipped and in what condition.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section style={{ padding:"70px 40px", background:`linear-gradient(180deg,${C.bg0},${C.bg1})` }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={S.eyebrow}>Pricing</div>
          <h2 style={{ ...S.h2, textAlign:"center" as any }}>Simple. Transparent. Fair.</h2>
          <p style={{ fontSize:14, color:C.dim, textAlign:"center" as any, maxWidth:440, margin:"0 auto 44px" }}>Early-access pricing for beta users. No credit card needed to get started.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            <PricingCard badge="Personal" badgeColor={C.sky}    name="Lite"     price="Pay per shipment · No monthly fee" note="Ideal for occasional shoppers."    bullets={["Free UAE address","No monthly fees","1–3 shipments / month","Photo proof of contents"]} />
            <PricingCard badge="Reseller" badgeColor={C.mint}   name="Standard" price="Monthly plan · Coming soon"         note="Extra savings for frequent shippers." bullets={["Discounted kg rates","Consolidation included","Priority support & routing","WhatsApp notifications","Bulk dashboard tools"]} highlight />
            <PricingCard badge="Business" badgeColor={C.purple} name="Business" price="Custom rates · Talk to us"          note="Tailored routes and SLAs for your volumes." bullets={["Custom contracts","API / integration options","Dedicated account manager","Custom SLA & reporting"]} />
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding:"70px 40px", background:C.bg0 }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={S.eyebrow}>Early users</div>
          <h2 style={S.h2}>People love it already.</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:32 }}>
            <Testimonial name="Aisha M."  loc="Lusaka, Zambia"  text="I finally have a simple way to order from UAE stores. My parcels from Dubai arrived faster than I expected — and the tracking was spot on every step." />
            <Testimonial name="Carlos N." loc="Lagos, Nigeria"  text="As a reseller, consolidating multiple parcels into one shipment saves me a serious amount every month. This is exactly what I needed." />
            <Testimonial name="Fatima K." loc="Nairobi, Kenya" text="Support replied on WhatsApp within minutes. They helped me choose the best route for my budget. That kind of service is rare." />
          </div>
          <ReviewsSection />
        </div>
      </section>

      {/* ═══ FAQ — 3-COLUMN ═══ */}
      <section style={{ padding:"72px 40px", background:`linear-gradient(180deg,${C.bg0},${C.bg1})`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:500, height:500, background:"radial-gradient(ellipse,rgba(0,229,160,0.05),transparent 70%)", left:-160, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:500, height:500, background:"radial-gradient(ellipse,rgba(56,189,248,0.05),transparent 70%)", right:-160, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ ...S.eyebrow, textAlign:"center" as any }}>FAQ</div>
          <h2 style={{ ...S.h2, textAlign:"center" as any, marginBottom:6 }}>Common questions</h2>
          <p style={{ fontSize:14, color:C.dim, textAlign:"center" as any, maxWidth:440, margin:"0 auto 40px" }}>Everything you need to know before you start shipping.</p>
          <div style={{ display:"grid", gridTemplateColumns:"220px 1fr 220px", gap:24 }}>
            {/* Left side cards */}
            <div style={{ display:"flex", flexDirection:"column" as any, gap:12 }}>
              <SideCard icon="📦" title="Free to start"   desc="Get your UAE address at zero cost. Pay only when you ship." />
              <SideCard icon="🌍" title="220+ countries"  desc="From Dubai to Africa, Europe, Asia and beyond." />
              <SideCard icon="💬" title="24/7 support"    desc="Real humans on WhatsApp, always ready to help." />
            </div>
            {/* FAQ accordion */}
            <div style={{ display:"flex", flexDirection:"column" as any, gap:10 }}>
              <FAQItem defaultOpen q="Is it really free to create an account?"  a="Yes. Opening a Cross Border Cart account and getting your UAE address is completely free. You only pay when you actually ship a package or add extras like insurance." />
              <FAQItem q="Which countries can I ship to?"          a="We ship from the UAE to over 220 countries and territories. Our strongest lanes are UAE to African destinations, Europe, and South and Southeast Asia." />
              <FAQItem q="Can I see photos of my packages?"        a="Yes. We photograph every parcel that arrives at our warehouse so you can verify contents, condition and declared value before you choose to ship." />
              <FAQItem q="Can I combine multiple orders?"          a="Absolutely. You can consolidate up to 20 packages into a single shipment. This typically saves 40–60% on shipping costs versus sending parcels individually." />
              <FAQItem q="How long does shipping take?"            a="UAE to East Africa typically takes 5–9 business days. West Africa is 7–12 days. Express options are available for most corridors." />
            </div>
            {/* Right side cards */}
            <div style={{ display:"flex", flexDirection:"column" as any, gap:12 }}>
              <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.08),rgba(56,189,248,0.06))", border:"1px solid rgba(0,229,160,0.22)", borderRadius:16, padding:20 }}>
                <div style={{ fontSize:15, fontWeight:900, color:C.text, marginBottom:6 }}>Ready to start?</div>
                <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>Get your free UAE address in under a minute. No credit card needed.</div>
                <Link href="/signup" style={{ ...S.btnPrimary, display:"flex", justifyContent:"center", fontSize:13, padding:"11px 16px" }}>Get started free →</Link>
              </div>
              <SideCard icon="⚡" title="Instant setup"    desc="Your UAE address is ready in under 60 seconds after signing up." />
              <SideCard icon="🔒" title="Secure & insured" desc="Optional insurance covers your parcels from warehouse to door." />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WAITLIST CTA ═══ */}
      <section style={{ margin:"0 40px 80px", borderRadius:28, padding:"60px 48px", background:"linear-gradient(135deg,rgba(0,229,160,0.07) 0%,rgba(56,189,248,0.05) 100%)", border:"1px solid rgba(0,229,160,0.18)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,229,160,0.07),transparent 70%)", top:-100, left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }} />
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:40, position:"relative", zIndex:1 }}>
          <div>
            <h2 style={{ fontSize:32, fontWeight:900, color:C.text, letterSpacing:-1, marginBottom:10 }}>Ready to try Cross Border Cart?</h2>
            <p style={{ fontSize:15, color:C.dim, lineHeight:1.7, marginBottom:18 }}>Join the early access list. Free account, no credit card. Be one of the first to ship smarter from Dubai.</p>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column" as any, gap:8 }}>
              {["No credit card required to join the beta","Best routes for UAE → Africa and other key corridors","Special pricing for early resellers"].map((t) => (
                <li key={t} style={{ fontSize:13, color:C.muted, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ color:C.mint, fontWeight:900 }}>✓</span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background:"rgba(10,15,30,0.7)", borderRadius:18, padding:24, border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(10px)" }}>
            <form onSubmit={handleWaitlist} style={{ display:"flex", flexDirection:"column" as any, gap:12 }}>
              {[
                { label:"Email", type:"email", value:email, setter:setEmail, ph:"you@example.com" },
                { label:"Country / city you ship to most", type:"text", value:country, setter:setCountry, ph:"Lusaka, Zambia" },
              ].map((f) => (
                <label key={f.label} style={{ fontSize:12, fontWeight:600, color:C.dim, display:"flex", flexDirection:"column" as any, gap:5 }}>
                  {f.label}
                  <input type={f.type} required value={f.value} placeholder={f.ph}
                    onChange={(e) => f.setter(e.target.value)}
                    disabled={formSt === "success"}
                    style={{ padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", fontSize:13, color:C.text, outline:"none" }} />
                </label>
              ))}
              <label style={{ fontSize:12, fontWeight:600, color:C.dim, display:"flex", flexDirection:"column" as any, gap:5 }}>
                How will you use Cross Border Cart?
                <select value={volume} onChange={(e) => setVolume(e.target.value as any)} disabled={formSt==="success"}
                  style={{ padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.05)", fontSize:13, color:C.text, outline:"none" }}>
                  <option value="personal">Personal shopping</option>
                  <option value="reseller">Reseller / small business</option>
                </select>
              </label>
              <button type="submit"
                disabled={formSt==="submitting"||formSt==="success"}
                style={{ ...S.btnPrimary, marginTop:4, justifyContent:"center",
                  opacity: formSt==="submitting"||formSt==="success" ? 0.65 : 1,
                  cursor: formSt==="submitting"||formSt==="success" ? "not-allowed" : "pointer" }}>
                {formSt==="submitting" ? "Submitting…" : formSt==="success" ? "You're on the list! 🎉" : "Join the early access list"}
              </button>
              {formSt==="success" && <p style={{ fontSize:12, color:C.mint, marginTop:4 }}>We'll email you when the beta opens.</p>}
              {formSt==="error"   && <p style={{ fontSize:12, color:"#f87171", marginTop:4 }}>Something went wrong. Please try again.</p>}
            </form>
          </div>
        </div>
      </section>

      <FloatingChatButton isOpen={chatOpen} onOpen={() => setChatOpen(true)} />
      <AIChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
      <SiteFooter />

      <style jsx global>{`
        html { scroll-behavior: smooth; }
        body { background: #111827 !important; }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        @media (prefers-reduced-motion:reduce){ *,*::before,*::after{ animation:none!important; transition:none!important; } }
        @media (max-width:900px){
          .hero-grid,.steps-3,.feats-2,.pricing-3,.testi-3,.faq-3,.cta-2{ grid-template-columns:1fr!important; }
          .trust-4{ grid-template-columns:repeat(2,1fr)!important; }
        }
      `}</style>
    </div>
  );
}

/* ─── shared style tokens ─── */
const S: Record<string, React.CSSProperties> = {
  eyebrow:   { fontSize:11, fontWeight:700, letterSpacing:"3px", color:"#00e5a0", textTransform:"uppercase", marginBottom:10 },
  h2:        { fontSize:36, fontWeight:900, letterSpacing:-1.5,  color:"#f1f5f9", marginBottom:8 },
  h1:        { fontSize:54, fontWeight:900, lineHeight:1.06,     letterSpacing:-2, color:"#f1f5f9", marginBottom:20 },
  h1Accent:  { backgroundImage:"linear-gradient(90deg,#00e5a0,#38bdf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:99, border:"1px solid rgba(0,229,160,0.3)", background:"rgba(0,229,160,0.07)", fontSize:12, color:"#00e5a0", fontWeight:600, marginBottom:28, width:"fit-content" },
  pulseDot:  { width:7, height:7, borderRadius:"50%", background:"#00e5a0", display:"inline-block", animation:"pulse 2s ease-in-out infinite", flexShrink:0 },
  livePill:  { display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, color:"#00e5a0", background:"rgba(0,229,160,0.1)", border:"1px solid rgba(0,229,160,0.22)", padding:"4px 12px", borderRadius:99 },
  liveDot:   { display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#00e5a0", animation:"pulse 1.8s infinite", flexShrink:0 },
  btnPrimary:{ background:"#00e5a0", color:"#002b1a", fontWeight:800, fontSize:14, padding:"13px 26px", borderRadius:99, border:"none", cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"all .15s" },
  btnGhost:  { background:"transparent", color:"#f1f5f9", fontWeight:600, fontSize:14, padding:"13px 22px", borderRadius:99, border:"1px solid rgba(255,255,255,0.18)", cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:8, transition:"all .15s" },
  floatCard: { position:"absolute", background:"rgba(17,24,39,0.92)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:14, padding:"12px 16px", backdropFilter:"blur(12px)", zIndex:10, minWidth:170 },
  fcLabel:   { fontSize:10, color:"#64748b", marginBottom:4, display:"flex", alignItems:"center", gap:5 },
  rotWrap:   { display:"flex", flexDirection:"column", gap:8 },
  rotCard:   { background:"rgba(26,37,64,0.95)", border:"1px solid rgba(0,229,160,0.22)", borderRadius:20, padding:20, position:"relative", overflow:"hidden" },
  stepCard:  { background:"#1a2540", border:"1px solid rgba(255,255,255,0.09)", borderRadius:24, padding:28, position:"relative", overflow:"hidden", transition:"all .3s" },
  priceCard: { background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:28, position:"relative", transition:"all .2s" },
  priceCrown:{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"#00e5a0", color:"#002b1a", fontSize:10, fontWeight:800, padding:"3px 14px", borderRadius:"0 0 8px 8px", whiteSpace:"nowrap" },
  testiCard: { background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:24 },
  featCard:  { background:"#1a2540", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:24, transition:"all .25s" },
};