// pages/contact.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";

export default function ContactPage() {
  return (
    <MarketingLayout title="Contact us">
      <section className="py-5">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-7">
              <h1 className="h2 fw-bold mb-2">Contact us</h1>
              <p className="text-muted mb-4">
                Have questions about your shipments, pricing or account? Send us a message and our team
                will get back to you as soon as possible.
              </p>

              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h2 className="h5 fw-semibold mb-3">Send us a message</h2>
                  <form className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        Send message
                      </button>
                    </div>
                  </form>
                  <p className="small text-muted mt-3 mb-0">
                    * This demo form doesn&apos;t send real emails yet. In production you can connect it
                    to your support inbox or ticketing system.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <h3 className="h5 fw-semibold mb-3">Support</h3>
                  <p className="mb-1 small text-muted">Email</p>
                  <p className="mb-3">
                    <a href="mailto:support@crossbordercart.com">support@crossbordercart.com</a>
                  </p>

                  <p className="mb-1 small text-muted">Business hours (UAE time)</p>
                  <p className="mb-3">Sunday – Thursday, 9:00 – 18:00</p>

                  <p className="mb-1 small text-muted">Average response time</p>
                  <p className="mb-0">Within 24 hours on business days.</p>
                </div>
              </div>

              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h3 className="h5 fw-semibold mb-3">Warehouse address</h3>
                  <p className="small mb-1 fw-semibold">CrossBorderCart Warehouse</p>
                  <p className="small mb-0">
                    [Street / Warehouse #]
                    <br />
                    Dubai, United Arab Emirates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
