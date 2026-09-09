// pages/terms.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import TermsContent from "@/pages/policies/terms";
import SEO from "@/components/SEO";

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms & Conditions | Cross Border Cart"
        description="Read the Cross Border Cart terms and conditions covering account use, parcel forwarding, shipping, payments and customer responsibilities."
        path="/terms"
      />

      <MarketingLayout>
 

        <div className="py-5">
          <div className="container">
            <TermsContent />
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}