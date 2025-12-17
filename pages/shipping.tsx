// pages/shipping.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import ShippingContent from "@/pages/policies/shipping";

export default function ShippingPolicyPage() {
  return (
    <MarketingLayout title="Shipping Policy">
      <div className="py-5">
        <div className="container">
          <ShippingContent />
        </div>
      </div>
    </MarketingLayout>
  );
}
