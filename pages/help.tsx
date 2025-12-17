// pages/help.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Link from "next/link";

export default function HelpPage() {
  return (
    <MarketingLayout title="Help Center">
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <h1 className="h2 fw-bold mb-3">Help Center</h1>
          <p className="text-muted mb-4">
            Need assistance with your shipments or account? Start with the options below or contact our
            support team.
          </p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Browse FAQ</h5>
                  <p className="card-text small text-muted">
                    Answers to the most common questions about how CrossBorderCart works.
                  </p>
                  <Link href="/faq" className="btn btn-outline-secondary btn-sm">
                    View FAQ
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Track a shipment</h5>
                  <p className="card-text small text-muted">
                    Already shipped? Use your tracking number in the dashboard to see live status.
                  </p>
                  <Link href="/dashboard" className="btn btn-outline-secondary btn-sm">
                    Go to dashboard
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Contact support</h5>
                  <p className="card-text small text-muted">
                    Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll help.
                  </p>
                  <Link href="/contact" className="btn btn-primary btn-sm">
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
