// pages/refunds.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import RefundsContent from "@/pages/policies/refunds";

export default function RefundsPolicyPage() {
  return (
    <MarketingLayout title="Refunds Policy">
      <div className="py-5">
        <div className="container">
          <RefundsContent />
        </div>
      </div>
    </MarketingLayout>
  );
}
