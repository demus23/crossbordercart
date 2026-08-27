// pages/guides/actual-vs-volumetric-weight.tsx
import Link from "next/link";
import GuideLayout, { MidCTA } from "@/components/GuideLayout";

export default function Guide() {
  return (
    <GuideLayout
      slug="actual-vs-volumetric-weight"
      category="Shipping Guides"
      categoryHref="/guides"
      title="Actual Weight vs Volumetric Weight: Why Your Shipping Price Can Change"
      dek="Why a light but bulky box can cost more to ship than a small, heavy one — and how carriers actually calculate your shipping charge."
      metaDescription="Understand the difference between actual weight and volumetric (dimensional) weight, and why it affects your international shipping cost."
    >
      <p>
        If you've ever gotten a shipping quote that seemed higher than expected for a package that "isn't that heavy," volumetric weight is probably why. It's one of the most common sources of confusion in international shipping.
      </p>

      <h2>Actual weight</h2>
      <p>
        This is exactly what it sounds like — the number you'd get by putting the package on a scale. Straightforward.
      </p>

      <h2>Volumetric (dimensional) weight</h2>
      <p>
        Volumetric weight is a calculated figure based on a package's length, width, and height, not what it actually weighs. Carriers use it because a large, lightweight box takes up cargo space that could otherwise carry something heavier — so they charge based on space as well as mass.
      </p>
      <p>
        The general formula carriers use is:
      </p>
      <div className="callout">
        Volumetric weight = (Length × Width × Height in cm) ÷ a carrier-specific divisor (commonly 5,000 or 6,000)
      </div>
      <p>
        The exact divisor varies by carrier and shipping method, which is one reason an accurate quote needs your package's real dimensions, not just an estimate.
      </p>

      <h2>Which one gets charged?</h2>
      <p>
        Carriers compare actual weight and volumetric weight, and charge based on whichever is <strong>higher</strong>. A box of pillows might weigh very little on a scale but have a large volumetric weight — and get charged accordingly. A small box of dense items like phone accessories might weigh more than its volumetric calculation, and get charged on actual weight instead.
      </p>

      <MidCTA />

      <h2>What this means for your shopping</h2>
      <ul>
        <li><strong>Bulky, lightweight items</strong> (large plastic toys, pillows, inflatable products) often cost more to ship than their weight alone suggests.</li>
        <li><strong>Dense, compact items</strong> (electronics, books, cosmetics) are usually more shipping-efficient relative to their price.</li>
        <li><strong>Original retail packaging</strong> can add unnecessary volume — this is one of the reasons consolidation and repacking can sometimes help.</li>
      </ul>

      <div className="callout">
        Want the real number instead of an estimate? <Link className="inline-link" href="/#calculator">Use CBC's shipping calculator →</Link> with your package's actual weight and dimensions for an accurate quote.
      </div>
    </GuideLayout>
  );
}