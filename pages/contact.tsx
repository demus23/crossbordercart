// pages/contact.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact | Cross Border Cart</title>
        <meta
          name="description"
          content="Contact Cross Border Cart support for shipment questions, pricing, tracking or account help."
        />
      </Head>

      <SiteHeader />

      <main
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #f8fafc 100%)",
          minHeight: "100vh",
          padding: "48px 0 64px",
        }}
      >
        <div className="container">
          {/* Hero */}
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-8">
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
                We’re here to help
              </span>

              <h1
                className="fw-bold mb-3"
                style={{ fontSize: "2.4rem", color: "#0f172a" }}
              >
                Contact Cross Border Cart
              </h1>

              <p
                className="text-muted mx-auto"
                style={{ maxWidth: 700, lineHeight: 1.8, fontSize: 16 }}
              >
                Have questions about your shipments, delivery timelines, pricing,
                tracking, or account? Reach out to our team and we’ll help you as
                quickly as possible.
              </p>
            </div>
          </div>

          {/* Quick contact cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ borderRadius: 20 }}
              >
                <div className="card-body p-4">
                  <div
                    className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 52,
                      height: 52,
                      background: "#ecfeff",
                      color: "#0f766e",
                      fontWeight: 800,
                    }}
                  >
                    ✉
                  </div>
                  <h2 className="h5 fw-bold mb-2">Email support</h2>
                  <p className="text-muted small mb-2">
                    For shipment help, billing questions, and account support.
                  </p>
                  <a
                    href="mailto:support.crossbordercart@gmail.com"
                    className="fw-semibold text-decoration-none"
                  >
                    support.crossbordercart@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ borderRadius: 20 }}
              >
                <div className="card-body p-4">
                  <div
                    className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 52,
                      height: 52,
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontWeight: 800,
                    }}
                  >
                    ⏰
                  </div>
                  <h2 className="h5 fw-bold mb-2">Business hours</h2>
                  <p className="text-muted small mb-2">
                    UAE business hours for customer support.
                  </p>
                  <p className="mb-1 fw-semibold">Sunday – Thursday</p>
                  <p className="mb-0 text-muted small">
                    9:00 AM – 6:00 PM (UAE time)
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ borderRadius: 20 }}
              >
                <div className="card-body p-4">
                  <div
                    className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 52,
                      height: 52,
                      background: "#f0fdf4",
                      color: "#15803d",
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </div>
                  <h2 className="h5 fw-bold mb-2">Response time</h2>
                  <p className="text-muted small mb-2">
                    We aim to respond to most support requests quickly.
                  </p>
                  <p className="mb-0 fw-semibold">
                    Usually within 24 business hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: 22, overflow: "hidden" }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background:
                      "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)",
                    color: "#fff",
                  }}
                >
                  <h2 className="h5 fw-bold mb-1">Send us a message</h2>
                  <p
                    className="mb-0 small"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Tell us how we can help and our team will get back to you.
                  </p>
                </div>

                <div className="card-body p-4 p-lg-5">
                  <form className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        required
                        style={{ minHeight: 48, borderRadius: 12 }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Email address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        required
                        style={{ minHeight: 48, borderRadius: 12 }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Topic</label>
                      <select
                        className="form-select"
                        defaultValue=""
                        style={{ minHeight: 48, borderRadius: 12 }}
                        required
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>
                        <option>Shipment support</option>
                        <option>Tracking issue</option>
                        <option>Billing question</option>
                        <option>Account help</option>
                        <option>Customs / delivery issue</option>
                        <option>Partnership inquiry</option>
                        <option>General question</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Tracking number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Optional"
                        style={{ minHeight: 48, borderRadius: 12 }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Message</label>
                      <textarea
                        className="form-control"
                        rows={6}
                        placeholder="Please share as much detail as possible so we can help you faster."
                        required
                        style={{ borderRadius: 12 }}
                      />
                    </div>

                    <div className="col-12 d-flex flex-wrap gap-3 align-items-center">
                      <button
                        type="submit"
                        className="btn"
                        style={{
                          background: "#0f172a",
                          color: "#fff",
                          borderRadius: 999,
                          padding: "12px 22px",
                          fontWeight: 700,
                        }}
                      >
                        Send message
                      </button>

                      <span className="small text-muted">
                        By contacting us, you agree that we may use your details
                        to respond to your inquiry.
                      </span>
                    </div>
                  </form>

                  <div
                    className="mt-4 p-3 rounded-4"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p className="small text-muted mb-0">
                      This form is currently a front-end contact form. You can
                      later connect it to your support inbox, CRM, or ticketing
                      system so messages are delivered automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: 20 }}
              >
                <div className="card-body p-4">
                  <h3 className="h5 fw-bold mb-3">Customer support details</h3>

                  <div className="mb-3">
                    <p className="mb-1 small text-uppercase text-muted fw-semibold">
                      Support email
                    </p>
                    <a
                      href="mailto:support.crossbordercart@gmail.com"
                      className="text-decoration-none fw-semibold"
                    >
                      support.crossbordercart@gmail.com
                    </a>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1 small text-uppercase text-muted fw-semibold">
                      Billing email
                    </p>
                    <a
                      href="mailto:billing@crossbordercart.com"
                      className="text-decoration-none fw-semibold"
                    >
                      billing@crossbordercart.com
                    </a>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1 small text-uppercase text-muted fw-semibold">
                      Business hours
                    </p>
                    <p className="mb-0 text-muted">
                      Sunday – Thursday
                      <br />
                      9:00 AM – 6:00 PM (UAE time)
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 small text-uppercase text-muted fw-semibold">
                      Best for urgent support
                    </p>
                    <p className="mb-0 text-muted">
                      Include your tracking number, account email, and a clear
                      description of the issue.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="card border-0 shadow-sm mb-4"
                style={{ borderRadius: 20 }}
              >
                <div className="card-body p-4">
                  <h3 className="h5 fw-bold mb-3">Warehouse information</h3>

                  <p className="mb-1 small text-uppercase text-muted fw-semibold">
                    Warehouse name
                  </p>
                  <p className="fw-semibold mb-3">Cross Border Cart Warehouse</p>

                  <p className="mb-1 small text-uppercase text-muted fw-semibold">
                    Location
                  </p>
                  <p className="text-muted mb-3">
                    Dubai, United Arab Emirates
                  </p>

                  <p className="mb-1 small text-uppercase text-muted fw-semibold">
                    Note
                  </p>
                  <p className="text-muted mb-0">
                    Customer-specific suite or locker details are provided inside
                    your dashboard after registration.
                  </p>
                </div>
              </div>

              <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: 20 }}
              >
                <div className="card-body p-4">
                  <h3 className="h5 fw-bold mb-3">Helpful links</h3>

                  <div className="d-flex flex-column gap-2">
                    <Link href="/faq" className="text-decoration-none fw-semibold">
                      Help &amp; FAQ
                    </Link>
                    <Link
                      href="/policies/shipping"
                      className="text-decoration-none fw-semibold"
                    >
                      Shipping Policy
                    </Link>
                    <Link
                      href="/policies/refunds"
                      className="text-decoration-none fw-semibold"
                    >
                      Refund Policy
                    </Link>
                    <Link
                      href="/prohibited-items"
                      className="text-decoration-none fw-semibold"
                    >
                      What You Cannot Ship
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}