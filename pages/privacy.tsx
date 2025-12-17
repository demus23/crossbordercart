// pages/privacy.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import PrivacyContent from "@/pages/policies/privacy";

export default function PrivacyPage() {
  return (
    <MarketingLayout title="Privacy Policy">
      <div className="py-5">
        <div className="container">
          {/* existing policy content */}
          <PrivacyContent />
        </div>
      </div>
    </MarketingLayout>
  );
}
