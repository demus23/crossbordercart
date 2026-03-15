// pages/about.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Testimonials from "@/components/marketing/Testimonials";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | Cross Border Cart</title>
        <meta
          name="description"
          content="Learn about Cross Border Cart, how our parcel forwarding service works, and why we built it for shoppers and resellers."
        />
      </Head>

      <SiteHeader />

      <main
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #f8fafc 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Hero */}
        <section className="py-5 bg-white border-bottom">
          <div className="container">
            <div className="row align-items-center gy-4">
              <div className="col-lg-7">
                <span
                  className="d-inline-flex align-items-center rounded-pill px-3 py-2 mb-3"
                  style={{
                    background: "#ecfeff",
                    color: "#0f766e",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "1px solid #ccfbf1",
                  }}
                >
                  About Cross Border Cart
                </span>

                <h1 className="display-5 fw-bold mb-3" style={{ color: "#0f172a" }}>
                  Shop the world. <span style={{ color: "#0f766e" }}>We handle the rest.</span>
                </h1>

                <p className="lead text-muted">
                  Cross Border Cart is your bridge between global online stores
                  and your home country. We give you a UAE delivery address,
                  receive your orders, help you consolidate shipments, and send
                  them to you with full tracking and transparent pricing.
                </p>

                <ul className="list-unstyled text-muted mb-4" style={{ lineHeight: 1.9 }}>
                  <li>✓ Personal UAE shipping address</li>
                  <li>✓ Parcel receiving and consolidation</li>
                  <li>✓ Delivery to Africa and beyond</li>
                  <li>✓ Clear pricing and live shipment tracking</li>
                </ul>

                <div className="d-flex flex-wrap gap-2">
                  <Link href="/signup" className="btn btn-dark rounded-pill px-4">
                    Create your free account
                  </Link>
                  <Link href="/how-it-works" className="btn btn-outline-secondary rounded-pill px-4">
                    How it works
                  </Link>
                </div>
              </div>

              <div className="col-lg-5">
                <div
                  className="card shadow-sm border-0"
                  style={{ borderRadius: 20, overflow: "hidden" }}
                >
                  <div
                    className="px-4 py-3"
                    style={{
                      background:
                        "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)",
                      color: "#fff",
                    }}
                  >
                    <h5 className="mb-1">Example live shipment</h5>
                    <p className="small mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>
                      A simple example of how a tracked shipment looks
                    </p>
                  </div>

                  <div className="card-body p-4">
                    <p className="mb-1 fw-semibold">ABC2345 · In transit</p>
                    <p className="small text-muted mb-3">
                      From Dubai, UAE → Nairobi, Kenya
                    </p>

                    <div className="progress mb-2" style={{ height: 8 }}>
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "65%", backgroundColor: "#0f766e" }}
                        aria-valuenow={65}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>

                    <p className="small text-muted mb-0">
                      Consolidated electronics and fashion order with active
                      tracking and shipment updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works summary */}
        <section className="py-5" style={{ background: "#f8fafc" }}>
          <div className="container">
            <div className="text-center mb-4">
              <h2 className="h3 fw-bold mb-2" style={{ color: "#0f172a" }}>
                How Cross Border Cart works
              </h2>
              <p className="text-muted mb-0">
                A simple parcel forwarding process designed for both shoppers and resellers.
              </p>
            </div>

            <div className="row g-4">
              {[
                {
                  step: "1",
                  title: "Create your free account",
                  text: "Sign up and receive your personal UAE warehouse address and customer suite number.",
                },
                {
                  step: "2",
                  title: "Shop from online stores",
                  text: "Use your Cross Border Cart address as the shipping address when buying from supported stores.",
                },
                {
                  step: "3",
                  title: "We receive and prepare",
                  text: "We receive your parcels, log them into your dashboard, and help you consolidate where available.",
                },
                {
                  step: "4",
                  title: "Ship to your country",
                  text: "Choose your shipping option, complete payment, and track delivery from our warehouse to your destination.",
                },
              ].map((item) => (
                <div key={item.step} className="col-md-6 col-xl-3">
                  <div
                    className="card h-100 border-0 shadow-sm"
                    style={{ borderRadius: 20 }}
                  >
                    <div className="card-body p-4">
                      <div
                        className="fw-bold d-inline-flex align-items-center justify-content-center mb-3"
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "999px",
                          background: "rgba(15,118,110,0.12)",
                          color: "#0f766e",
                        }}
                      >
                        {item.step}
                      </div>

                      <h5 className="card-title">{item.title}</h5>
                      <p className="card-text small text-muted">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why we built it */}
        <section className="py-5 bg-white">
          <div className="container">
            <div className="row gy-4 align-items-center">
              <div className="col-lg-6">
                <h2 className="h3 fw-bold mb-3" style={{ color: "#0f172a" }}>
                  Built for shoppers in Africa and emerging markets
                </h2>

                <p className="text-muted">
                  Many websites do not ship directly to African countries, or
                  they charge very high delivery fees. Cross Border Cart was
                  created to make international shopping more accessible,
                  affordable, and reliable.
                </p>

                <p className="text-muted mb-0">
                  Our goal is to make the experience simple from the first order
                  to final delivery, with clear communication, fair pricing, and
                  better visibility at every stage of shipment.
                </p>
              </div>

              <div className="col-lg-6">
                <div
                  className="card border-0 shadow-sm"
                  style={{ borderRadius: 20 }}
                >
                  <div className="card-body p-4">
                    <h5 className="card-title mb-3">Why customers choose us</h5>
                    <ul className="small text-muted mb-0 ps-3" style={{ lineHeight: 1.9 }}>
                      <li>Dedicated suite ID for each customer</li>
                      <li>Warehouse operations based in Dubai, UAE</li>
                      <li>Email and customer support assistance</li>
                      <li>Tracking visibility inside the dashboard</li>
                      <li>Designed for both personal shoppers and resellers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-5" style={{ background: "#f8fafc" }}>
          <div className="container">
            <div
              className="text-center shadow-sm"
              style={{
                background: "#ffffff",
                borderRadius: 24,
                padding: "40px 24px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h2 className="h3 fw-bold mb-3" style={{ color: "#0f172a" }}>
                Ready to start shipping smarter?
              </h2>
              <p className="text-muted mb-4" style={{ maxWidth: 680, margin: "0 auto" }}>
                Open your free account, get your UAE shipping address, and start
                managing your cross-border orders with more clarity and control.
              </p>

              <div className="d-flex justify-content-center flex-wrap gap-2">
                <Link href="/signup" className="btn btn-dark rounded-pill px-4">
                  Create free account
                </Link>
                <Link href="/contact" className="btn btn-outline-secondary rounded-pill px-4">
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />
      </main>

      <SiteFooter />
    </>
  );
}