// pages/guides/what-cant-be-shipped-from-uae.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="what-cant-be-shipped-from-uae"
      category="Shipping Guides"
      categoryHref="/guides"
      title="What Can't Be Shipped Internationally from the UAE?"
      dek="A plain-language overview of the categories that commonly face restrictions when shipping internationally — and why the exact rules depend on your destination."
      metaDescription="A general guide to product categories commonly restricted when shipping internationally from the UAE, and why to check before you order."
    >
      <p>
        Most everyday purchases ship internationally without any issue. But a handful of categories consistently run into restrictions — from airline safety rules, carrier policies, or the destination country's customs regulations. This guide covers the general picture.
      </p>

      <h2>Categories that commonly face restrictions</h2>
      <ul>
        <li><strong>Liquids and aerosols</strong> — often restricted or require special handling for air freight, particularly in large quantities</li>
        <li><strong>Flammable or pressurized items</strong> — aerosol cans, certain cosmetics, and similar products can be affected</li>
        <li><strong>Loose batteries</strong> — lithium batteries shipped on their own (not inside a device) face specific carrier restrictions</li>
        <li><strong>Weapons and weapon-related items</strong> — heavily restricted or entirely prohibited by most carriers and countries</li>
        <li><strong>Certain medications and supplements</strong> — import rules vary significantly by destination country</li>
        <li><strong>Counterfeit or replica goods</strong> — prohibited by customs authorities essentially everywhere</li>
        <li><strong>Perishable items</strong> — food products, especially anything requiring refrigeration, rarely ship well internationally</li>
      </ul>

      <h2>Why the answer isn't the same everywhere</h2>
      <p>
        A product that ships without issue to one country might be restricted or require additional paperwork for another. Customs rules, import licensing requirements, and even carrier policies vary by destination — which is why a general list like this can't substitute for checking your specific item and destination before ordering.
      </p>

      <MidCTA />

      <h2>How to avoid a problem before it happens</h2>
      <ul>
        <li><strong>If a product feels unusual, check first.</strong> Don't wait until it's already arrived at the warehouse to find out it can't be forwarded.</li>
        <li><strong>Be specific when asking.</strong> "Can I ship supplements?" is harder to answer than "Can I ship this specific product to this specific country?"</li>
        <li><strong>Declared value matters.</strong> Higher-value items may face closer customs scrutiny regardless of category.</li>
      </ul>

      <div className="callout">
        This list covers common categories, not every possible restriction — rules can be specific to a product, carrier, or destination country, and they change over time. If you're unsure about a specific item, <Link className="inline-link" href="/guides#quote">ask before you order it</Link>.
      </div>
    </GuideLayout>
  );
}