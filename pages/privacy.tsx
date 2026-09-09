// pages/privacy.tsx
import React from "react";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import PrivacyContent from "@/pages/policies/privacy";
import SEO from "@/components/SEO";

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy | Cross Border Cart"
        description="Read the Cross Border Cart privacy policy to learn how we collect, use, protect and manage your personal information when using our services."
        path="/privacy"
      />

      <MarketingLayout>
  
        <div className="py-5">
          <div className="container">
            <PrivacyContent />
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}