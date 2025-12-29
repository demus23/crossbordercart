// pages/index.tsx
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import ReviewsSection from "@/components/ReviewsSection";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Head from "next/head";
import StoresStrip from "@/components/StoresStrip";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIChatbotModal from "@/components/AIChatbotModal";






export default function HomePage() {
  const homeStores = [
    {
      name: "Amazon.ae",
      url: "https://www.amazon.ae",
      logo: "/stores/amazon.png",
    },
    {
      name: "Noon",
      url: "https://www.noon.com",
      logo: "/stores/noon.png",
    },
    {
      name: "Namshi",
      url: "https://www.namshi.com",
      logo: "/stores/namshi.png",
    },
    {
      name: "Sephora",
      url: "https://www.sephora.ae",
      logo: "/stores/sephora.png",
    },
    {
      name: "Apple",
      url: "https://www.apple.com/ae/",
      logo: "/stores/apple.png",
    },
    {
      name: "Adidas",
      url: "https://www.adidas.com",
      logo: "/stores/adidas.png",
    },
    {
      name: "Zara",
      url: "https://www.zara.com",
      logo: "/stores/zara.png",
    },
    {
      name: "IKEA",
      url: "https://www.ikea.com/ae/en/",
      logo: "/stores/ikea.png",
    },
  ];
   const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [volume, setVolume] = useState<"personal" | "reseller">("personal");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
const [chatOpen, setChatOpen] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus("submitting");

  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, country, volume }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.message || "Failed to join waitlist");
    }

    setStatus("success");
    setEmail("");
    setCountry("");
  } catch (err) {
    console.error(err);
    setStatus("error");
  }
};


  return (
    
    <div
      style={{
        background: "#f5f7fb",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
     

       <Head>
        <title>
          Cross Border Cart – UAE to Africa shipping with real-time tracking
        </title>
        <meta
          name="description"
          content="Get a UAE shipping address, consolidate your orders and ship from Dubai to Africa and beyond with real-time tracking and transparent pricing."
        />
        <meta
          name="keywords"
          content="UAE shipping, Dubai to Africa, package forwarding, MyUS alternative, reselling from Dubai"
        />
        <meta name="robots" content="index,follow" />

        {/* Open Graph / social */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Cross Border Cart – Ship from UAE to your doorstep"
        />
        <meta
          property="og:description"
          content="Cross Border Cart gives you a UAE address, smart consolidation and live tracking on shipments from Dubai to your country."
        />
        <meta
          property="og:image"
          content="https://your-domain.com/og-cross-border-cart.png"
        />
        <meta property="og:url" content="https://your-domain.com" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Cross Border Cart – Ship from UAE to your doorstep"
        />
        <meta
          name="twitter:description"
          content="Get UAE prices and ship to Africa with live tracking and consolidation."
        />
        <meta
          name="twitter:image"
          content="https://crossbordercart.com/og-cross-border-cart.png"
        />
      </Head>
      
      {/* HEADER / NAV */}
      <SiteHeader/>
      
      

      {/* HERO */}
      <section style={heroSection}>
        <div style={heroGrid} className="grid-2">
          {/* Left column */}
          <div style={heroLeft}>
            <div style={heroBadge}>Ship from UAE to Africa, Europe &amp; the world</div>
            <h1 style={heroTitle}>
              Your UAE shipping address
              <br />
              <span style={heroAccent}>for every global store.</span>
            </h1>
            <p style={heroSubtitle}>
              Get a personal UAE address, consolidate your orders, and ship to your home
              country with transparent rates and real-time tracking—all in one dashboard.
            </p>

            <div style={heroCtas}>
              <Link
                href="/signup"
                style={{ ...ctaPrimary }}
                className="btn btn-cta"
              >
                Get my free UAE address
              </Link>
              <Link href="/login" style={ctaSecondary} className="btn">
                Track my shipment
              </Link>
            </div>

            <div style={heroTrustRow}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                No setup fees · Pay only when you ship · Optional insurance
              </span>
            </div>
          </div>

          {/* Right column – hero picture + mini dashboard */}
          <div style={heroRight}>
            

           <div style={heroCard}>
              <div style={heroCardTop}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={statusDot} />
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}
                  >
                    Live shipment overview
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Auto-refresh · 10s
                </span>
              </div>
<div style={liveCard} className="minw0">
  

              {/* Image area */}
              <div style={heroImageFrame}>
                {/* add a hero image in /public/hero-unboxing.jpg or change src */}
                <Image
                  src="/hero-unboxing.png"
                  alt="Happy customer opening a Cross Border Cart package"
                  fill
                  style={{ objectFit: "cover", borderRadius: 20 }}
                />
                <div style={heroImageOverlay}>
                  <span style={{ fontSize: 12, color: "#e2f3ff" }}>
                    “My parcels from Dubai arrived faster than ever.”
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div style={heroCardStats}>
                <HeroStat label="In transit" value="18" />
                <HeroStat label="Delivered" value="124" />
                <HeroStat label="Countries" value="220+" />
              </div>

              {/* Small list */}
              <div style={heroMiniList}>
                <MiniShipment
                  from="Dubai, UAE"
                  to="Lusaka, Zambia"
                  status="On the way"
                />
                <MiniShipment
                  from="Sharjah, UAE"
                  to="Nairobi, Kenya"
                  status="At customs"
                />
                <MiniShipment
                  from="Abu Dhabi, UAE"
                  to="London, UK"
                  status="Delivered"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={trustBar} id="trust" className="grid grid-4">
        <div style={trustItem}>
          <div style={trustNumber}>10K+</div>
          <div style={trustLabel}>Parcels handled</div>
        </div>
        <div style={trustItem}>
          <div style={trustNumber}>220+</div>
          <div style={trustLabel}>Destinations served</div>
        </div>
        <div style={trustItem}>
          <div style={trustNumber}>4.9/5</div>
          <div style={trustLabel}>Average rating</div>
        </div>
        <div style={trustItem}>
          <div style={trustNumber}>24/7</div>
          <div style={trustLabel}>Human support</div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section style={section} id="why">
        <h2 style={sectionTitle}>Why choose Cross Border Cart?</h2>
        <p style={sectionSubtitle}>
          Built for shoppers and resellers who love UAE stores but live abroad.
        </p>
        <div style={featuresGrid} className="grid grid-4">
          <FeatureCard
            icon="📦"
            title="Personal UAE address"
            desc="Use your dedicated UAE address at checkout and receive packages from any local or global store."
          />
          <FeatureCard
            icon="🧮"
            title="Upfront, honest pricing"
            desc="Instant quotes in your dashboard—no hidden fees or surprise surcharges when parcels arrive."
          />
          <FeatureCard
            icon="📡"
            title="Real-time tracking"
            desc="Track each scan from warehouse to final delivery, with proactive notifications on every update."
          />
          <FeatureCard
            icon="🛡️"
            title="Insurance & verification"
            desc="Optional insurance, photo proof and identity verification to keep your shipments safe."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={section} id="how">
        <h2 style={sectionTitle}>How Cross Border Cart works</h2>
        <p style={sectionSubtitle}>
          Simple three-step flow from shopping in the UAE to unboxing at your door.
        </p>
        <div style={stepsGrid} className="grid grid-3">
          <Step
            no={1}
            title="Sign up & get your UAE address"
            desc="Create your free account and instantly receive your personal Cross Border Cart UAE shipping address."
          />
          <Step
            no={2}
            title="Shop & ship to our warehouse"
            desc="Use that address for your UAE and international online orders. We receive, check and safely store your parcels."
          />
          <Step
            no={3}
            title="Consolidate, choose route & ship"
            desc="Combine packages to save on shipping, pick your destination country and speed, then track everything live."
          />
        </div>
      </section>

      
      <div style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}>
      <StoresStrip stores={homeStores} />
      </div>



      {/* PRICING TEASER */}
      <section style={section} id="pricing">
        <h2 style={sectionTitle}>Simple, transparent pricing (coming soon)</h2>
        <p style={sectionSubtitle}>
          During beta, you&apos;ll get early-access rates. Here&apos;s a preview of how
          pricing will work.
        </p>
        <div style={pricingGrid} className="grid grid-3">
          <PricingCard
            badge="For personal shoppers"
            name="Lite"
            price="Pay per shipment"
            note="Ideal for occasional packages and gifts."
            bullets={[
              "Free UAE address",
              "No monthly fees",
              "Great for 1–3 shipments / month",
            ]}
          />
          <PricingCard
            badge="Best for resellers"
            highlight
            name="Standard"
            price="Monthly plan · Coming soon"
            note="Extra savings for frequent shippers."
            bullets={[
              "Discounted kg rates",
              "Consolidation included",
              "Priority support & routing",
            ]}
          />
          <PricingCard
            badge="For growing businesses"
            name="Business"
            price="Custom rates"
            note="Tailored routes and SLAs for your volumes."
            bullets={[
              "Custom contracts",
              "API / integration options",
              "Dedicated account manager",
            ]}
          />
        </div>
      </section>

      {/* STORIES + REAL REVIEWS */}
      <section style={{ ...section, maxWidth: 1100 }}>
        {/* Renamed so it doesn't clash with ReviewsSection heading */}
        <h2 style={sectionTitle}>Stories from our early users</h2>
        <p style={sectionSubtitle}>
          A glimpse of how Cross Border Cart already helps people move parcels from
          the UAE to their doorstep.
        </p>
        <div style={testimonialsGrid} className="grid grid-3">
          <Testimonial
            name="Aisha · Lusaka"
            text="I finally have a simple way to order from UAE stores and receive everything at home. The tracking updates were spot on."
          />
          <Testimonial
            name="Carlos · Dubai"
            text="As a reseller, consolidating multiple parcels into one shipment saves me serious money every month."
          />
          <Testimonial
            name="Fatima · Nairobi"
            text="Support replied on WhatsApp within minutes. They even helped me choose the best route for my budget."
          />
        </div>

        {/* REAL REVIEWS SECTION FROM DATABASE / API */}
        <div style={{ marginTop: 32 }}>
          <ReviewsSection />
        </div>
      </section>

      {/* FAQ + CTA */}
      <section style={{ ...section, maxWidth: 1100 }} id="faq">
        <div style={faqLayout} className="grid grid-2">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={sectionTitleLeft}>Frequently asked questions</h2>
            <FAQItem
              q="Is it really free to create an account?"
              a="Yes. Opening a Cross Border Cart account and getting your UAE address is free. You pay only when you ship or use extras like insurance."
            />
            <FAQItem
              q="Which countries can I ship to?"
              a="We ship from the UAE to over 220 countries and territories. Our strongest lanes are to African destinations, Europe and Asia."
            />
            <FAQItem
              q="Can I see photos of my packages before shipping?"
              a="Yes. We can photograph your parcels in the warehouse so you can confirm content, condition and value before you ship."
            />
            <FAQItem
              q="Can I consolidate multiple orders into one box?"
              a="Absolutely. You can combine several packages into one shipment in your dashboard to save significantly on shipping costs."
            />
          </div>

          <div style={faqCtaCard}>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                marginBottom: 6,
              }}
            >
              Ready to get your UAE address?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#475569",
                marginBottom: 16,
              }}
            >
              Create your free account in under a minute and start shipping smarter
              from the UAE.
            </p>
            <Link
              href="/signup"
              className="btn btn-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 22px",
                borderRadius: 999,
                background: colors.mint,
                color: "#022c22",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 12px 30px rgba(34,197,158,0.35)",
              }}
            >
              Get started free
            </Link>
            <p
              style={{
                fontSize: 12,
                color: "#64748b",
                marginTop: 10,
              }}
            >
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>
      {/* CTA / WAITLIST */}
      <section style={ctaSection} id="get-started">
        <div style={ctaInner} className="grid grid-2">
          <div style={ctaLeft}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
              Ready to try Cross Border Cart?
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", marginBottom: 10 }}>
              Join the early access list and be one of the first to get a UAE shipping
              address, real-time tracking and consolidated shipping from Dubai to your
              home country.
            </p>
            <ul style={{ fontSize: 13, color: "#4b5563", paddingLeft: 18, margin: 0 }}>
              <li>No credit card required to join the beta</li>
              <li>Best routes for UAE → Africa and other key corridors</li>
              <li>Special pricing for early resellers</li>
            </ul>
          </div>

          <div style={ctaRight}>
            <form onSubmit={handleWaitlistSubmit} style={ctaForm}>
              <label style={ctaLabel}>
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={ctaInput}
                />
              </label>

              <label style={ctaLabel}>
                Country / city you ship to most
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Lusaka, Zambia"
                  style={ctaInput}
                />
              </label>

              <label style={ctaLabel}>
                How do you plan to use Cross Border Cart?
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value as "personal" | "reseller")}
                  style={ctaSelect}
                >
                  <option value="personal">Personal shopping</option>
                  <option value="reseller">Reseller / small business</option>
                </select>
              </label>

              <button
                type="submit"
                style={ctaButton}
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Submitting…" : "Join the early access list"}
              </button>

             {status === "success" && (
  <p style={ctaSuccess}>
    🎉 Thank you! You’re on the list. We’ll email you when the beta opens.
  </p>
)}

{status === "error" && (
  <p style={ctaError}>
    Something went wrong. Please check your connection and try again.
  </p>
)}

            </form>
          </div>
        </div>
      </section>
      
            <FloatingChatButton
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
      />

      <AIChatbotModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        />


      

      {/* FOOTER */}
       <SiteFooter/>
        
        


      {/* global + hover + smooth scroll */}
      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }
        .btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.15);
        }
        .btn-cta:hover {
          box-shadow: 0 14px 34px rgba(34, 197, 158, 0.4);
        }
                
      `}</style>
    </div>
  );
}

/* ---------- tokens & base styles ---------- */

const colors = {
  mint: "#22c55e",
  blue: "#2563eb",
};



/* HERO */

const heroSection: React.CSSProperties = {
  background: "linear-gradient(135deg, #e0f2fe 0%, #f9fafb 40%, #ecfdf5 100%)",
};

const heroGrid: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "40px 20px 50px",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
  gap: 32,
} as any;

const heroLeft: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const heroBadge: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 14px",
  borderRadius: 999,
  background: "rgba(15,23,42,0.04)",
  border: "1px solid rgba(148,163,184,0.4)",
  fontSize: 12,
  color: "#0f172a",
};

const heroTitle: React.CSSProperties = {
  marginTop: 18,
  fontSize: 38,
  lineHeight: 1.15,
  fontWeight: 800,
  color: "#0f172a",
};

const heroAccent: React.CSSProperties = {
  backgroundImage: "linear-gradient(90deg, #22c55e, #0ea5e9)",
  WebkitBackgroundClip: "text",
  color: "transparent",
};

const heroSubtitle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 15,
  color: "#475569",
  maxWidth: 520,
};

const heroCtas: React.CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 24,
};

const ctaPrimary: React.CSSProperties = {
  borderRadius: 999,
  padding: "10px 22px",
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
  background: colors.blue,
  color: "#f9fafb",
};

const ctaSecondary: React.CSSProperties = {
  borderRadius: 999,
  padding: "10px 20px",
  fontWeight: 600,
  fontSize: 13,
  textDecoration: "none",
  background: "rgba(15,23,42,0.03)",
  color: "#0f172a",
  border: "1px solid rgba(148,163,184,0.6)",
};

const heroTrustRow: React.CSSProperties = {
  marginTop: 12,
};

const heroRight: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const liveCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  margin: "0 auto",
};


const heroCard: React.CSSProperties = {
  width: "100%",
  maxWidth: 390,
  background: "#ffffff",
  borderRadius: 26,
  padding: "18px 18px 16px",
  boxShadow: "0 22px 60px rgba(15,23,42,0.2)",
  border: "1px solid rgba(148,163,184,0.35)",
};

const heroCardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const statusDot: React.CSSProperties = {
  width: 9,
  height: 9,
  borderRadius: 999,
  background: "radial-gradient(circle, #22c55e, #16a34a)",
};

const heroImageFrame: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: 180,
  borderRadius: 20,
  overflow: "hidden",
  marginTop: 6,
};

const heroImageOverlay: React.CSSProperties = {
  position: "absolute",
  left: 12,
  bottom: 10,
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(15,23,42,0.65)",
};

const heroCardStats: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
  marginTop: 12,
};

const heroMiniList: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

/* TRUST BAR */

const trustBar: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "18px 20px 10px",
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
};

const trustItem: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 14,
  padding: "10px 14px",
  boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
};

const trustNumber: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#0f172a",
};

const trustLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
};

/* GENERIC SECTIONS */

const section: React.CSSProperties = {
  maxWidth: 1200,
  margin: "40px auto 0",
  padding: "0 20px",
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 26,
  color: "#0f172a",
  textAlign: "center",
};

const sectionSubtitle: React.CSSProperties = {
  textAlign: "center",
  fontSize: 14,
  color: "#64748b",
  marginTop: 6,
  marginBottom: 20,
};

/* FEATURES, STEPS, SHOWCASE, PRICING */

const featuresGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
} as any;

const stepsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
} as any;

const showcaseGrid: React.CSSProperties = {
  overflow: "hidden",
  marginTop: 16,
  borderRadius: 18,
  background: "#ffffff",
  boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
  padding: "10px 6px",
};

const showcaseItem: React.CSSProperties = {
  minWidth: 160,
  maxWidth: 180,
  marginRight: 12,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "#f9fafb",
  padding: "10px 10px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};


const pricingGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
} as any;

/* TESTIMONIALS */

const testimonialsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
} as any;

/* FAQ + CTA */

const faqLayout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
  gap: 24,
} as any;

const sectionTitleLeft: React.CSSProperties = {
  ...sectionTitle,
  textAlign: "left",
  marginBottom: 10,
};

const faqCtaCard: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 18,
  padding: "20px 20px",
  boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
  border: "1px solid #dbeafe",
};

/* FOOTER */

const footer: React.CSSProperties = {
  marginTop: 40,
  borderTop: "1px solid #e2e8f0",
  background: "#ffffff",
};

const footerTop: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "18px 20px 10px",
  display: "flex",
  justifyContent: "space-between",
  gap: 40,
};

const footerLinksRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 24,
} as any;

const footerBottom: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "10px 20px 18px",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
};
const ctaSection: React.CSSProperties = {
  maxWidth: 1100,
  margin: "70px auto 0",
  padding: "0 20px",
};

const ctaInner: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
  gap: 24,
  background: "linear-gradient(135deg, #ecfdf3 0%, #e0f2fe 100%)",
  borderRadius: 24,
  padding: "24px 24px",
  boxShadow: "0 16px 40px rgba(15,23,42,0.16)",
};

const ctaLeft: React.CSSProperties = {
  paddingRight: 8,
};

const ctaRight: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 18,
  padding: "16px 16px",
  boxShadow: "0 10px 26px rgba(15,23,42,0.10)",
};

const ctaForm: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const ctaLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#4b5563",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const ctaInput: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 13,
};

const ctaSelect: React.CSSProperties = {
  ...ctaInput,
};

const ctaButton: React.CSSProperties = {
  marginTop: 4,
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  fontWeight: 700,
  fontSize: 14,
  background: "#22c55e",
  color: "#022c22",
  cursor: "pointer",
};

const ctaSuccess: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#16a34a",
};
const ctaError: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "#b91c1c",
};


/* ---------- small components ---------- */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#f9fafb",
        padding: "8px 8px",
      }}
    >
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

function MiniShipment({
  from,
  to,
  status,
}: {
  from: string;
  to: string;
  status: string;
}) {
  return (
    <div
      style={{
        padding: "6px 8px",
        borderRadius: 10,
        background: "#f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 11,
      }}
    >
      <div>
        <div style={{ fontWeight: 600, color: "#0f172a" }}>
          {from} → {to}
        </div>
        <div style={{ color: "#64748b", marginTop: 1 }}>{status}</div>
      </div>
      <div
        style={{
          padding: "2px 8px",
          borderRadius: 999,
          background: "rgba(34,197,94,0.12)",
          color: "#16a34a",
          fontWeight: 600,
        }}
      >
        On-time
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: "18px 18px",
        boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 14,
          background: "#ecfdf5",
          display: "grid",
          placeItems: "center",
          fontSize: 20,
          marginBottom: 8,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "#0f172a",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function Step({ no, title, desc }: { no: number; title: string; desc: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: "18px 18px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: "#e0f2fe",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        {no}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "#0f172a",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function Testimonial({ name, text }: { name: string; text: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: "18px 18px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ fontSize: 14, color: "#0f172a", marginBottom: 8 }}>
        “{text}”
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{name}</div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div
      style={{
        marginBottom: 10,
        background: "#ffffff",
        borderRadius: 14,
        padding: "12px 14px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "#0f172a",
          marginBottom: 3,
        }}
      >
        {q}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>{a}</div>
    </div>
  );
}

function PricingCard({
  badge,
  name,
  price,
  note,
  bullets,
  highlight,
}: {
  badge: string;
  name: string;
  price: string;
  note: string;
  bullets: string[];
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: "18px 18px",
        border: highlight ? "2px solid #22c55e" : "1px solid #e5e7eb",
        boxShadow: highlight
          ? "0 14px 30px rgba(34,197,94,0.18)"
          : "0 10px 26px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          padding: "4px 10px",
          borderRadius: 999,
          background: "#ecfdf5",
          fontSize: 11,
          color: "#166534",
          marginBottom: 6,
        }}
      >
        {badge}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: "#0f172a",
          marginBottom: 4,
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: 14, color: "#16a34a", marginBottom: 4 }}>
        {price}
      </div>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>{note}</div>
      <ul style={{ paddingLeft: 18, margin: 0, listStyle: "disc" }}>
        {bullets.map((b) => (
          <li key={b} style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: "#0f172a",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map((l) => (
          <span key={l} style={{ fontSize: 12, color: "#64748b" }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
