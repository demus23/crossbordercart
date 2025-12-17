// pages/about.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Link from "next/link";
import Testimonials from "@/components/marketing/Testimonials";





export default function AboutPage() {
  return (
    <MarketingLayout title="About" description="Learn how CrossBorderCart works and why we built it.">
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold mb-3">
                Shop the world. <span className="text-teal">We handle the rest.</span>
              </h1>
              <p className="lead text-muted">
                CrossBorderCart is your bridge between global online stores and your home country.
                We give you a UAE address, receive your orders, consolidate them, and ship everything
                to you safely with full tracking.
              </p>
              <ul className="list-unstyled text-muted mb-4">
                <li>✓ Virtual UAE shipping address</li>
                <li>✓ Fast delivery to Africa & beyond</li>
                <li>✓ Transparent pricing & live tracking</li>
              </ul>
              <div className="d-flex gap-2">
                <Link href="/signup" className="btn btn-primary">
                  Create your free account
                </Link>
                <Link href="/faq" className="btn btn-outline-secondary">
                  Read FAQ
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title mb-3">Example live shipment</h5>
                  <p className="mb-1 fw-semibold">ABC2345 · In transit</p>
                  <p className="small text-muted mb-3">
                    From Dubai, UAE → Nairobi, Kenya
                  </p>
                  <div className="progress mb-2" style={{ height: 8 }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: "65%" }}
                      aria-valuenow={65}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <p className="small text-muted mb-0">
                    Consolidated electronics & fashion order, fully tracked and insured.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="h3 fw-bold mb-4 text-center">How CrossBorderCart works</h2>
          <div className="row g-4">
            {[
              {
                step: "1",
                title: "Create your free account",
                text: "Sign up and receive your personal CrossBorderCart UAE warehouse address and suite number.",
              },
              {
                step: "2",
                title: "Shop from any online store",
                text: "Use your CrossBorderCart address as the shipping address when you checkout on your favourite websites.",
              },
              {
                step: "3",
                title: "We receive & consolidate",
                text: "We receive your parcels, photograph them, check basic condition, and consolidate them into fewer boxes if you wish.",
              },
              {
                step: "4",
                title: "Ship to your country",
                text: "Choose your preferred courier and shipping speed. Track every movement from our warehouse to your doorstep.",
              },
            ].map((item) => (
              <div key={item.step} className="col-md-6 col-xl-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <div className="rounded-circle bg-teal-soft text-teal fw-bold d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: 36, height: 36 }}>
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

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6">
              <h2 className="h3 fw-bold mb-3">Built for shoppers in Africa & emerging markets</h2>
              <p className="text-muted">
                Many brands and websites don&apos;t ship directly to African countries,
                or charge very high international shipping rates. CrossBorderCart was
                created to make global shopping simple, affordable and reliable for you.
              </p>
              <p className="text-muted mb-0">
                We focus on clear communication, honest pricing and a smooth experience from
                the first click to final delivery.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Why customers choose us</h5>
                  <ul className="small text-muted mb-0">
                    <li>Dedicated suite ID for every customer</li>
                    <li>Warehouse team based in Dubai, UAE</li>
                    <li>Support via email and WhatsApp (coming soon)</li>
                    <li>Shipment photos and status updates inside your dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .bg-teal-soft {
          background-color: rgba(0, 140, 140, 0.12);
        }
      `}</style>
      <Testimonials />
    </MarketingLayout>
  );
}
