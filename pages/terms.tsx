// pages/terms.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import TermsContent from "@/pages/policies/terms";

export default function TermsPage() {
  return (
    <MarketingLayout title="Terms & Conditions">
      <div className="py-5">
        <div className="container">
          <TermsContent />
        </div>
      </div>
    </MarketingLayout>
  );
}
